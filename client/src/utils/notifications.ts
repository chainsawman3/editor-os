import { Task } from '../types';
import { sendTaskToTelegram } from './telegram';

const NOTIFIED_STORAGE_KEY = 'editor_os_notified_reminders';

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return 'denied';
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return 'denied';
  }
}

// Gentle pleasant audio chime using browser Web Audio API
export function playNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now); // D5
    osc1.frequency.exponentialRampToValueAtTime(880, now + 0.15); // A5

    gain1.gain.setValueAtTime(0.001, now);
    gain1.gain.linearRampToValueAtTime(0.2, now + 0.03);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.45);
  } catch (e) {
    // AudioContext might be blocked until user gesture, safely ignore
  }
}

export function showTaskNotification(task: Task, customNote?: string) {
  playNotificationSound();

  const dueDetails = [
    task.due_date ? `Deadline: ${task.due_date}` : '',
    task.due_time ? `@ ${task.due_time}` : '',
    task.priority ? `[Priority: ${task.priority}]` : ''
  ].filter(Boolean).join(' ');

  const body = [
    dueDetails,
    task.description ? `\nკომენტარი: ${task.description}` : '',
    customNote ? `\n${customNote}` : ''
  ].filter(Boolean).join('\n');

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const n = new Notification(`⏰ ${task.title}`, {
        body,
        icon: '/favicon.ico',
        tag: `task_reminder_${task.id}_${Date.now()}`,
        requireInteraction: true
      });

      n.onclick = () => {
        window.focus();
        window.dispatchEvent(new CustomEvent('editor_os_open_tasks', { detail: { taskId: task.id } }));
        n.close();
      };
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  // Also send directly to Telegram on phone
  sendTaskToTelegram(task, customNote).catch((err) => {
    console.warn('Telegram task notification failed:', err);
  });

  // Dispatch in-app event for Toast / Banner
  window.dispatchEvent(
    new CustomEvent('editor_os_task_reminder_toast', {
      detail: { task, message: customNote || `⏰ შეხსენება: ${task.title}` }
    })
  );
}

function getNotifiedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_STORAGE_KEY);
    if (!raw) return new Set();
    const list = JSON.parse(raw);
    return new Set(Array.isArray(list) ? list : []);
  } catch {
    return new Set();
  }
}

function saveNotifiedSet(set: Set<string>) {
  try {
    const arr = Array.from(set).slice(-500); // keep recent 500
    localStorage.setItem(NOTIFIED_STORAGE_KEY, JSON.stringify(arr));
  } catch {}
}

export function calculateReminderDate(task: Task): Date | null {
  const reminderType = task.reminder_type || 'custom';
  if (reminderType === 'none') return null;

  // 1. Explicit reminder_date and reminder_time (User's custom alert schedule)
  if (task.reminder_date && task.reminder_date.trim()) {
    const [cy, cm, cd] = task.reminder_date.split('-').map((v) => parseInt(v, 10));
    if (cy && cm && cd) {
      let ch = 9;
      let cmin = 0;
      if (task.reminder_time && task.reminder_time.includes(':')) {
        const [rh, rm] = task.reminder_time.split(':').map((v) => parseInt(v, 10));
        if (!isNaN(rh)) ch = rh;
        if (!isNaN(rm)) cmin = rm;
      }
      return new Date(cy, cm - 1, cd, ch, cmin, 0, 0);
    }
  }

  // 2. Fallback to due_date if no explicit reminder_date
  if (!task.due_date) return null;
  const [y, m, d] = task.due_date.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return null;

  let hours = 18;
  let minutes = 0;
  if (task.due_time && task.due_time.includes(':')) {
    const [hh, mm] = task.due_time.split(':').map((v) => parseInt(v, 10));
    if (!isNaN(hh)) hours = hh;
    if (!isNaN(mm)) minutes = mm;
  }
  const dueDate = new Date(y, m - 1, d, hours, minutes, 0, 0);

  if (reminderType === '1_hour_before') {
    return new Date(dueDate.getTime() - 60 * 60 * 1000);
  }
  if (reminderType === '1_day_before') {
    return new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
  }

  return dueDate;
}

export function checkTaskReminders(tasks: Task[]) {
  if (!Array.isArray(tasks) || tasks.length === 0) return;

  const now = new Date();
  const nowMs = now.getTime();
  const notified = getNotifiedSet();
  let updated = false;

  for (const task of tasks) {
    // 1. If completed or in WIP, remove repeating tracker and STOP reminders completely!
    if (task.completed || task.stage === 'WIP') {
      try {
        localStorage.removeItem(`editor_os_last_repeat_${task.id}`);
      } catch {}
      continue;
    }

    if (task.reminder_type === 'none') continue;

    const reminderDate = calculateReminderDate(task);
    if (!reminderDate) continue;

    const remMs = reminderDate.getTime();
    const isRepeating =
      task.reminder_type === 'repeat_5min' ||
      task.reminder_type === 'custom_repeat_5min' ||
      (typeof (task as any).repeat_every_5min === 'boolean' && (task as any).repeat_every_5min);

    if (isRepeating) {
      // 5-minute repeating reminder until marked as WIP or completed
      if (nowMs >= remMs) {
        const lastRepeatKey = `editor_os_last_repeat_${task.id}`;
        let lastRepeatMs = 0;
        try {
          const val = localStorage.getItem(lastRepeatKey);
          if (val) lastRepeatMs = parseInt(val, 10);
        } catch {}

        const fiveMinutesMs = 5 * 60 * 1000;
        if (!lastRepeatMs || nowMs - lastRepeatMs >= fiveMinutesMs) {
          const isFirstTime = !lastRepeatMs;
          showTaskNotification(
            task,
            isFirstTime
              ? '🚨 შეხსენება (მეორდება ყოველ 5 წუთში, სანამ WIP-ს არ მიუთითებთ)'
              : '🚨 განმეორებითი შეხსენება (5 წთ) • შეაჩერეთ საიტზე "WIP"-ზე დაჭერით!'
          );
          try {
            localStorage.setItem(lastRepeatKey, String(nowMs));
          } catch {}
        }
      }
    } else {
      // Standard one-time reminder
      const reminderKey = `${task.id}_${task.reminder_date || task.due_date}_${task.reminder_time || task.due_time || '00:00'}_${task.reminder_type || 'custom'}`;
      if (notified.has(reminderKey)) continue;

      if (nowMs >= remMs) {
        const isLate = nowMs - remMs > 2 * 60 * 60 * 1000;
        showTaskNotification(task, isLate ? '⚠️ შეხსენება (გამოტოვებული შეტყობინება)' : undefined);
        notified.add(reminderKey);
        updated = true;
      }
    }
  }

  if (updated) {
    saveNotifiedSet(notified);
  }
}
