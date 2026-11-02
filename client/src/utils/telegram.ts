import { Task } from '../types';

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isEnabled: boolean;
}

const STORAGE_KEY = 'editor_os_telegram_config';

export function getTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { botToken: '', chatId: '', isEnabled: false };
    }
    const parsed = JSON.parse(raw);
    return {
      botToken: parsed.botToken || '',
      chatId: parsed.chatId || '',
      isEnabled: !!parsed.isEnabled
    };
  } catch {
    return { botToken: '', chatId: '', isEnabled: false };
  }
}

export function saveTelegramConfig(config: TelegramConfig) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch (err) {
    console.error('Failed to save Telegram config to localStorage:', err);
  }
}

export async function sendTelegramRawMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; error?: string }> {
  if (!botToken.trim() || !chatId.trim()) {
    return { success: false, error: 'Bot Token ან Chat ID ცარიელია.' };
  }

  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();
  const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: 'HTML'
      })
    });

    const data = await response.json();
    if (!response.ok || !data.ok) {
      const errMsg = data.description || `HTTP შეცდომა ${response.status}`;
      return { success: false, error: errMsg };
    }

    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || 'ქსელური შეცდომა Telegram სერვერთან დაკავშირებისას.'
    };
  }
}

export async function testTelegramConnection(
  botToken: string,
  chatId: string
): Promise<{ success: boolean; error?: string }> {
  const testMsg = `🚀 <b>Editor OS • ტესტური შეტყობინება</b>\n\nთქვენი ტელეგრამ ბოტი წარმატებით დაუკავშირდა <b>Editor OS</b>-ს!\nახლა ყველა ტასკის დედლაინი და შეხსენება მოგივათ პირდაპირ აქ, ტელეფონზე. 📲\n\n⏰ <i>დრო: ${new Date().toLocaleTimeString('ka-GE')}</i>`;
  return sendTelegramRawMessage(botToken, chatId, testMsg);
}

export async function sendTaskToTelegram(
  task: Task,
  customNote?: string
): Promise<{ success: boolean; error?: string }> {
  const config = getTelegramConfig();
  if (!config.isEnabled || !config.botToken || !config.chatId) {
    return { success: false, error: 'Telegram შეტყობინებები გათიშულია ან კონფიგურაცია არასრულია.' };
  }

  const priorityEmoji =
    task.priority === 'High' ? '🔴 მაღალი' : task.priority === 'Low' ? '🟢 დაბალი' : '🟡 საშუალო';

  let message = `🔔 <b>დავალების შეხსენება / Task Reminder</b>\n\n`;
  message += `📌 <b>სათაური:</b> ${task.title}\n`;
  if (task.due_date) {
    message += `⏰ <b>დედლაინი:</b> ${task.due_date} ${task.due_time ? `@ ${task.due_time}` : ''}\n`;
  }
  message += `⚡ <b>პრიორიტეტი:</b> ${priorityEmoji}\n`;

  if (task.description && task.description.trim()) {
    message += `\n💬 <b>კომენტარი / შენიშვნა:</b>\n${task.description.trim()}\n`;
  }

  if (customNote) {
    message += `\nℹ️ <i>${customNote}</i>\n`;
  }

  message += `\n<i>Editor OS • Tasks System</i>`;

  return sendTelegramRawMessage(config.botToken, config.chatId, message);
}
