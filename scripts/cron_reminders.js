const https = require('https');

const TURSO_URL =
  process.env.TURSO_DATABASE_URL ||
  'https://editor-os-db-chainsawman3.aws-eu-west-1.turso.io/v2/pipeline';

const TURSO_AUTH_TOKEN =
  process.env.TURSO_AUTH_TOKEN ||
  'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODcyNTg3MjYsImlkIjoiMDFhMDIwZTktMzgwMS03YTVkLTg1OTgtOGZlMTNhMzczNGVjIiwia2lkIjoiUUMzNkxQZVdoN2ppWXl3VmxQNlkxV09GaTB1RXJmRTd5WU1rWmlfNWpQOCIsInJpZCI6IjBmMWY2MjIzLTgyNjMtNDQyYS1hMGVlLTgzNjIyMjkxYTMyNyJ9.G5egcvRrEbXEe4f0L2QM2Qbb6QX3WMYIWRGp0QAArB4W8ANktoVE_J3Mf4VtMaAIHcCc2EGibrvrMDCzYuD1Dg';

function mapArg(val) {
  if (val === null || val === undefined) return { type: 'null' };
  if (typeof val === 'number') return { type: 'integer', value: String(val) };
  return { type: 'text', value: String(val) };
}

async function queryTurso(sql, args = []) {
  const postData = JSON.stringify({
    requests: [
      {
        type: 'execute',
        stmt: {
          sql,
          args: args.map(mapArg)
        }
      }
    ]
  });

  return new Promise((resolve, reject) => {
    const req = https.request(
      new URL(TURSO_URL),
      {
        method: 'POST',
        headers: {
          Authorization: 'Bearer ' + TURSO_AUTH_TOKEN,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            const result = parsed.results?.[0]?.response?.result;
            if (!result) return resolve([]);
            const cols = result.cols?.map((c) => c.name) || [];
            const rows = (result.rows || []).map((r) => {
              const obj = {};
              cols.forEach((col, i) => {
                obj[col] = r[i]?.value;
              });
              return obj;
            });
            resolve(rows);
          } catch (e) {
            reject(e);
          }
        });
      }
    );
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function sendTelegram(botToken, chatId, text) {
  const postData = JSON.stringify({
    chat_id: String(chatId).trim(),
    text,
    parse_mode: 'HTML',
    disable_notification: false
  });

  return new Promise((resolve) => {
    const req = https.request(
      new URL(`https://api.telegram.org/bot${botToken.trim()}/sendMessage`),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      },
      (res) => {
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            resolve(parsed);
          } catch {
            resolve({ ok: false });
          }
        });
      }
    );
    req.on('error', (err) => resolve({ ok: false, error: err.message }));
    req.write(postData);
    req.end();
  });
}

function parseDateInGeorgiaTime(dateStr, timeStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split('-').map((v) => parseInt(v, 10));
  if (!y || !m || !d) return null;

  let hh = 9;
  let mm = 0;
  if (timeStr && timeStr.includes(':')) {
    const [h, min] = timeStr.split(':').map((v) => parseInt(v, 10));
    if (!isNaN(h)) hh = h;
    if (!isNaN(min)) mm = min;
  }

  // Create Date string with explicit +04:00 (Georgia timezone)
  const pad = (n) => String(n).padStart(2, '0');
  const isoStr = `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00+04:00`;
  const parsed = new Date(isoStr);
  return isNaN(parsed.getTime()) ? null : parsed;
}

async function main() {
  console.log(`[${new Date().toISOString()}] Starting 24/7 Cloud Task Reminders check...`);

  // 1. Fetch Telegram Config
  const configs = await queryTurso('SELECT * FROM telegram_config WHERE id = ? LIMIT 1;', ['default']);
  const config = configs[0];

  if (!config || !config.bot_token || !config.chat_id || Number(config.is_enabled) !== 1) {
    console.log('Telegram is not configured or disabled in telegram_config table. Exiting.');
    return;
  }

  const { bot_token, chat_id } = config;

  // 2. Fetch Active Pending Tasks
  const tasks = await queryTurso(`
    SELECT id, title, due_date, due_time, reminder_type, reminder_date, reminder_time, stage, completed, last_reminded_at, description, priority
    FROM tasks
    WHERE (completed = 0 OR completed = '0')
      AND (stage IS NULL OR stage != 'WIP')
      AND (reminder_type IS NULL OR reminder_type != 'none');
  `);

  console.log(`Found ${tasks.length} active tasks to evaluate.`);

  const nowMs = Date.now();

  for (const task of tasks) {
    // Determine reminder scheduled target Date & Time
    let targetDate = null;
    const remType = task.reminder_type || 'custom';

    if (task.reminder_date) {
      targetDate = parseDateInGeorgiaTime(task.reminder_date, task.reminder_time || '09:00');
    } else if (task.due_date) {
      targetDate = parseDateInGeorgiaTime(task.due_date, task.due_time || '18:00');
      if (targetDate) {
        if (remType === '1_hour_before') {
          targetDate = new Date(targetDate.getTime() - 60 * 60 * 1000);
        } else if (remType === '1_day_before') {
          targetDate = new Date(targetDate.getTime() - 24 * 60 * 60 * 1000);
        }
      }
    }

    if (!targetDate) continue;

    const targetMs = targetDate.getTime();
    const isRepeating = remType === 'repeat_5min' || remType === 'custom_repeat_5min';
    const lastRemindedMs = task.last_reminded_at ? new Date(task.last_reminded_at).getTime() : 0;

    let shouldSend = false;
    let customNote = '';

    if (isRepeating) {
      if (nowMs >= targetMs) {
        const fiveMinutesMs = 5 * 60 * 1000;
        if (!lastRemindedMs || nowMs - lastRemindedMs >= fiveMinutesMs) {
          shouldSend = true;
          customNote = !lastRemindedMs
            ? '🚨 შეხსენება (მეორდება ყოველ 5 წუთში, სანამ WIP-ს არ მიუთითებთ)'
            : '🚨 განმეორებითი შეხსენება (5 წთ) • შეაჩერეთ საიტზე "Start WIP"-ზე დაჭერით!';
        }
      }
    } else {
      // One-time reminder: send if now >= target and never reminded yet
      if (nowMs >= targetMs && !lastRemindedMs) {
        shouldSend = true;
      }
    }

    if (shouldSend) {
      console.log(`Sending alert for task: "${task.title}" (target: ${targetDate.toISOString()})`);

      const priorityEmoji =
        task.priority === 'High' ? '🔴 მაღალი' : task.priority === 'Low' ? '🟢 დაბალი' : '🟡 საშუალო';

      let msg = `🔔 <b>დავალების შეხსენება / Task Reminder</b>\n\n`;
      msg += `📌 <b>სათაური:</b> ${task.title}\n`;
      if (task.due_date) {
        msg += `⏰ <b>დედლაინი:</b> ${task.due_date} ${task.due_time ? `@ ${task.due_time}` : ''}\n`;
      }
      msg += `⚡ <b>პრიორიტეტი:</b> ${priorityEmoji}\n`;

      if (task.description && String(task.description).trim()) {
        msg += `\n💬 <b>კომენტარი / შენიშვნა:</b>\n${String(task.description).trim()}\n`;
      }

      if (customNote) {
        msg += `\n${customNote}\n`;
      }

      msg += `\n<i>Editor OS Cloud Reminder (24/7)</i>`;

      const result = await sendTelegram(bot_token, chat_id, msg);
      if (result.ok) {
        console.log(`Successfully delivered Telegram notification for task ${task.id}`);
        const isoNow = new Date().toISOString();
        await queryTurso('UPDATE tasks SET last_reminded_at = ? WHERE id = ?;', [isoNow, task.id]);
      } else {
        console.error(`Failed to send Telegram for task ${task.id}:`, result);
      }
    }
  }

  console.log('Task reminders check completed successfully.');
}

main().catch(console.error);
