import { Task } from '../types';
import { queryTurso } from '../tursoDb';

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

// 24/7 Cloud Sync: Syncs configuration with Turso Cloud so server workers can send alerts even when site is closed!
export async function syncTelegramConfigFromCloud(): Promise<TelegramConfig> {
  try {
    const rows = await queryTurso('SELECT * FROM telegram_config WHERE id = ? LIMIT 1;', ['default']);
    if (rows && rows.length > 0) {
      const row: any = rows[0];
      const cloudCfg: TelegramConfig = {
        botToken: row.bot_token || '',
        chatId: row.chat_id || '',
        isEnabled: Number(row.is_enabled) === 1
      };
      if (cloudCfg.botToken && cloudCfg.chatId) {
        saveTelegramConfig(cloudCfg);
        return cloudCfg;
      }
    }

    // If cloud is empty but local has config, push local to cloud!
    const local = getTelegramConfig();
    if (local.botToken && local.chatId) {
      await saveTelegramConfigToCloud(local);
    }
    return local;
  } catch (err) {
    console.warn('Cloud telegram config sync fallback to local:', err);
    return getTelegramConfig();
  }
}

export async function saveTelegramConfigToCloud(config: TelegramConfig): Promise<void> {
  saveTelegramConfig(config);
  try {
    await queryTurso(
      `INSERT OR REPLACE INTO telegram_config (id, bot_token, chat_id, is_enabled, updated_at)
       VALUES (?, ?, ?, ?, ?);`,
      ['default', config.botToken.trim(), config.chatId.trim(), config.isEnabled ? 1 : 0, new Date().toISOString()]
    );
  } catch (err) {
    console.error('Failed to save telegram config to cloud:', err);
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
        parse_mode: 'HTML',
        disable_notification: false
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
  const res = await sendTelegramRawMessage(botToken, chatId, testMsg);
  if (res.success) {
    // Save to cloud on successful test
    await saveTelegramConfigToCloud({ botToken, chatId, isEnabled: true });
  }
  return res;
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
