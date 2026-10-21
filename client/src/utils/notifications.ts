import { Task } from '../types';

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

// Gentle pleasant audio chime using browser Web Audio API (no external mp3 files needed)
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

export function showTaskNotification(task: Task) {
  playNotificationSound();

  const dueDetails = [
    task.due_date ? `Due: ${task.due_date}` : '',
    task.due_time ? `@ ${task.due_time}` : '',
    task.priority ? `[Priority: ${task.priority}]` : ''
  ].filter(Boolean).join(' ');

  const body = task.description ? `${dueDetails}\n${task.description}` : (dueDetails || 'Task deadline reminder');

  if (isNotificationSupported() && Notification.permission === 'granted') {
    try {
      const n = new Notification(`⏰ Task Reminder: ${task.title}`, {
        body,
        icon: '/favicon.ico',
        tag: `task_reminder_${task.id}`,
        requireInteraction: true
      });

      n.onclick = () => {
        window.focus();
        window.dispatchEvent(new CustomEvent('editor_os_open_tasks', { detail: { taskId: task.id } }));
        n.close();
      };
    } catch (e) {
      console.warn('Native notification failed, in-app notification will handle it:', e);
    }
  }

  // Dispatch custom in-app event for Toast / Banner
  window.dispatchEvent(
    new CustomEvent('editor_os_task_reminder_toast', {
      detail: { task, message: `⏰ Reminder: ${task.title}` }
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
  if (!task.due_date) return null;

  // Extract base date
  const [y, m, d] = task.due_date.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return null;

  let hours = 9;
  let minutes = 0;
  if (task.due_time && task.due_time.includes(':')) {
    const [hh, mm] = task.due_time.split(':').map((v) => parseInt(v, 10));
    if (!isNaN(hh)) hours = hh;
    if (!isNaN(mm)) minutes = mm;
  }

  const dueDate = new Date(y, m - 1, d, hours, minutes, 0, 0);

  const reminderType = task.reminder_type || 'same_day';
  if (reminderType === 'none') return null;

  if (reminderType === '1_hour_before') {
    return new Date(dueDate.getTime() - 60 * 60 * 1000);
  }

  if (reminderType === '1_day_before') {
    return new Date(dueDate.getTime() - 24 * 60 * 60 * 1000);
  }

  if (reminderType === 'custom' && task.reminder_date) {
    const [cy, cm, cd] = task.reminder_date.split('-').map((v) => parseInt(v, 10));
    let ch = hours;
    let cmin = minutes;
    if (task.reminder_time && task.reminder_time.includes(':')) {
      const [rh, rm] = task.reminder_time.split(':').map((v) => parseInt(v, 10));
      if (!isNaN(rh)) ch = rh;
      if (!isNaN(rm)) cmin = rm;
    }
    return new Date(cy, cm - 1, cd, ch, cmin, 0, 0);
  }

  // same_day default
  return dueDate;
}

export function checkTaskReminders(tasks: Task[]) {
  if (!Array.isArray(tasks) || tasks.length === 0) return;

  const now = new Date();
  const nowMs = now.getTime();
  const notified = getNotifiedSet();
  let updated = false;

  for (const task of tasks) {
    if (task.completed) continue;
    if (!task.due_date) continue;
    if (task.reminder_type === 'none') continue;

    const reminderDate = calculateReminderDate(task);
    if (!reminderDate) continue;

    const remMs = reminderDate.getTime();
    const reminderKey = `${task.id}_${task.due_date}_${task.due_time || '00:00'}_${task.reminder_type || 'same_day'}`;

    if (notified.has(reminderKey)) continue;

    // Check if the reminder time has arrived:
    // We allow triggering if current time is within 2 hours after reminder time (to prevent stale alerts from days ago)
    const twoHoursMs = 2 * 60 * 60 * 1000;
    if (nowMs >= remMs && nowMs - remMs <= twoHoursMs) {
      showTaskNotification(task);
      notified.add(reminderKey);
      updated = true;
    }
  }

  if (updated) {
    saveNotifiedSet(notified);
  }
}
