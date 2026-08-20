# EDITOR OS (v2.0 MERGED)
### Personal Video Editor Growth & Business Management System

A dark, high-contrast, monochrome operating system and productivity suite tailored specifically for freelance video editors, motion designers, and content creators.

---

## ⚡ Key Features

- **90-Day Growth Sprint Engine**: Sprint cycle day tracker (`DAY 1 / 90`), overall progress %, active streak, and milestone reviews (Day 30/60/90).
- **Next Actions Radar**: Single immediate physical action for every active project, goal, and skill track.
- **Roadblock / Blocker Radar**: Prominent `[!] BLOCKED` alerts with 1-click resolution.
- **Global Frictionless Quick Capture (`Cmd/Ctrl+K`)**: Rapid capture idea triage with 1-click project or content conversion.
- **Project Production Workspace & Focus Mode**:
  - Expected vs. Actual Difficulty estimation calibration (*Easy, Medium, Hard, Extreme*).
  - Distraction-free single-focus mode.
  - Stage time tracking (*Research, Editing, Sound Design, Color Grading, Motion Graphics, Export, Admin*).
  - Before vs. After Archive (*Raw Flat Log vs Final Master Grade*).
- **Content Studio & Kanban**: 5-stage production pipeline with **Effort vs. Result ROI** leverage analytics.
- **Freelance CRM Pipeline**: Client outreach tracking, discussion stages, revenue tracking, and follow-up alerts.
- **Knowledge Base & Reference Library**: Craft technique logs linked to projects + video inspiration dissections.
- **Development & Strategy Change Log**: Daily craft observations and strategy change pivots (*Old Strategy, New Strategy, Reason*).
- **Zero-Config Portable Persistence**: 100% local JSON database storage with 1-click JSON backup export & restore.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite 6.
- **Backend API**: Express.js, TypeScript (`tsx`), CORS, File-based JSON Database Engine.
- **Theme**: Strict Monochrome Dark Theme (`#000000`, `#ffffff`, `#18181b`, `#27272a`, `#71717a`).

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js (v18+) & npm

### 2. Installation
```bash
# Clone the repository
git clone https://github.com/chainsawman3/editor-os.git
cd editor-os

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Running the System
In the root directory, you can double click `start_editor_os.bat` on Windows or run:

```bash
# Terminal 1 - Backend Server (Port 3001)
cd server
npm run dev

# Terminal 2 - Frontend Client (Port 5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📦 Data Storage & Backup
All data is stored locally in `server/data/editor_os.json`. You can export your full database snapshot or restore it at any time directly in the **Settings** view.
