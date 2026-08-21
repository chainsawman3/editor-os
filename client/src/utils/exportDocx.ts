/**
 * Utility to export project script content as a formatted Microsoft Word (.docx / .doc) document
 */
export function exportScriptToWord(project: {
  name: string;
  client_name?: string;
  deadline?: string | null;
  priority?: string;
  description?: string;
  script_content?: string;
}) {
  const title = project.name || 'Untitled Script';
  const clientInfo = project.client_name ? `<p><strong>Client:</strong> ${project.client_name}</p>` : '';
  const deadlineInfo = project.deadline ? `<p><strong>Deadline:</strong> ${project.deadline}</p>` : '';
  const priorityInfo = project.priority ? `<p><strong>Priority:</strong> ${project.priority}</p>` : '';
  const descInfo = project.description ? `<p><strong>Description:</strong> ${project.description}</p>` : '';

  const rawScript = project.script_content || 'No script content provided.';

  // Helper to convert rich markdown formatting to Word-compatible HTML
  const formatMarkdownForWord = (text: string) => {
    const lines = text.split('\n');
    const result: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        result.push('<p style="margin-bottom: 6pt;">&nbsp;</p>');
        continue;
      }

      // H1 Heading
      if (trimmed.startsWith('# ')) {
        result.push(`<h2 style="font-size: 16pt; color: #1e3a8a; border-bottom: 2pt solid #93c5fd; padding-bottom: 4pt; margin-top: 16pt; margin-bottom: 6pt;">${formatInlines(trimmed.substring(2))}</h2>`);
        continue;
      }

      // H2 Heading
      if (trimmed.startsWith('## ')) {
        result.push(`<h3 style="font-size: 13pt; color: #2563eb; margin-top: 12pt; margin-bottom: 4pt;">${formatInlines(trimmed.substring(3))}</h3>`);
        continue;
      }

      // H3 Heading
      if (trimmed.startsWith('### ')) {
        result.push(`<h4 style="font-size: 11pt; color: #0284c7; margin-top: 8pt; margin-bottom: 2pt;">${formatInlines(trimmed.substring(4))}</h4>`);
        continue;
      }

      // Blockquote
      if (trimmed.startsWith('> ')) {
        result.push(`<blockquote style="border-left: 3pt solid #f59e0b; background-color: #fffbeb; padding: 6pt 10pt; margin: 8pt 0; font-style: italic; color: #92400e;">${formatInlines(trimmed.substring(2))}</blockquote>`);
        continue;
      }

      // Divider
      if (trimmed === '---' || trimmed === '***') {
        result.push('<hr style="border: 0; border-top: 1pt solid #cbd5e1; margin: 12pt 0;" />');
        continue;
      }

      // Checkbox
      if (trimmed.startsWith('- [ ] ') || trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ')) {
        const isChecked = trimmed.startsWith('- [x] ') || trimmed.startsWith('- [X] ');
        const symbol = isChecked ? '☑' : '☐';
        result.push(`<p style="margin-bottom: 4pt; margin-left: 12pt; line-height: 1.4;">${symbol} ${formatInlines(trimmed.substring(6))}</p>`);
        continue;
      }

      // Bullet List
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        result.push(`<p style="margin-bottom: 4pt; margin-left: 12pt; line-height: 1.4;">• ${formatInlines(trimmed.substring(2))}</p>`);
        continue;
      }

      // Numbered List
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        result.push(`<p style="margin-bottom: 4pt; margin-left: 12pt; line-height: 1.4;"><strong>${numMatch[1]}.</strong> ${formatInlines(numMatch[2])}</p>`);
        continue;
      }

      // Standard Paragraph
      result.push(`<p style="margin-bottom: 6pt; line-height: 1.5; font-family: 'Consolas', 'Courier New', monospace; font-size: 10.5pt;">${formatInlines(line)}</p>`);
    }

    return result.join('');
  };

  const formatInlines = (str: string) => {
    return str
      // Highlights
      .replace(/==(.*?)==/g, '<mark style="background-color: #fef08a; padding: 1pt 3pt;">$1</mark>')
      .replace(/\[CYAN:\s*(.*?)\]/g, '<mark style="background-color: #cffafe; padding: 1pt 3pt;">$1</mark>')
      .replace(/\[PURPLE:\s*(.*?)\]/g, '<mark style="background-color: #f3e8ff; padding: 1pt 3pt;">$1</mark>')
      .replace(/\[GREEN:\s*(.*?)\]/g, '<mark style="background-color: #dcfce7; padding: 1pt 3pt;">$1</mark>')
      .replace(/\[PINK:\s*(.*?)\]/g, '<mark style="background-color: #fce7f3; padding: 1pt 3pt;">$1</mark>')
      // Bold, Italic, Strike
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/~~(.*?)~~/g, '<strike>$1</strike>')
      // Production Badges
      .replace(/\[(HOOK|SCENE|CTA|VOICEOVER|VISUAL|AUDIO|SOUND|MUSIC|NOTE|OUTRO|INTRO)(.*?)\]/g, '<strong style="background-color: #e0e7ff; color: #3730a3; padding: 2pt 5pt; border: 1pt solid #c7d2fe; border-radius: 3pt; font-size: 9pt;">[$1$2]</strong>');
  };

  const formattedScript = formatMarkdownForWord(rawScript);

  const htmlContent = `
    <!DOCTYPE html>
    <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Calibri', 'Arial', sans-serif;
          font-size: 11pt;
          color: #111111;
          margin: 40pt;
          line-height: 1.5;
        }
        h1 {
          font-size: 20pt;
          color: #0f172a;
          border-bottom: 2pt solid #0f172a;
          padding-bottom: 6pt;
          margin-bottom: 16pt;
        }
        h2 {
          font-size: 14pt;
          color: #334155;
          margin-top: 20pt;
          margin-bottom: 8pt;
          border-bottom: 1pt solid #e2e8f0;
          padding-bottom: 4pt;
        }
        .meta-table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20pt;
          background-color: #f8fafc;
          padding: 10pt;
          border: 1pt solid #cbd5e1;
        }
        .meta-table td {
          padding: 6pt 10pt;
          font-size: 10pt;
        }
        .script-box {
          padding: 14pt;
          border-left: 3pt solid #2563eb;
          background-color: #fdfdfd;
          font-size: 11pt;
        }
        .footer {
          margin-top: 30pt;
          font-size: 9pt;
          color: #64748b;
          text-align: right;
          border-top: 1pt solid #e2e8f0;
          padding-top: 6pt;
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>

      <table class="meta-table">
        <tr>
          <td><strong>Project:</strong> ${title}</td>
          <td>${clientInfo}</td>
        </tr>
        <tr>
          <td>${deadlineInfo}</td>
          <td>${priorityInfo}</td>
        </tr>
        ${descInfo ? `<tr><td colspan="2">${descInfo}</td></tr>` : ''}
      </table>

      <h2>Script & Production Breakdown</h2>
      <div class="script-box">
        ${formattedScript}
      </div>

      <div class="footer">
        Generated by Editor OS • ${new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
      </div>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword'
  });

  const filename = `${title.toLowerCase().replace(/[^a-z0-9]/gi, '_')}_script.doc`;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
