# Version Control Mastery with Git & GitHub — Course Portal

A modern, responsive, zero-dependency web application to watch and study all lectures, PDF notes, cheat sheets, and quizzes from the Google Drive course sequentially.

---

## 🌟 Key Features

1. **Sequential Curriculum (10 Modules · 199 Lessons)**
   - **01** - Introduction to section
   - **02** - Introduction to VCS and Git Setup
   - **03** - Terminal Basics and Commands
   - **04** - Git Core Concepts - Git Fundamentals
   - **05** - Git Branching and Project Flows
   - **06** - Github Concepts
   - **07** - Collaboration and Team Work
   - **08** - Git Advance Concepts
   - **09** - Github Pages and Actions
   - **10** - Interview Questions-Answers

2. **Unified Stage & Media Player**
   - **Video Lectures (76 Videos)**: Direct high-speed streaming via embedded Google Drive player (with speed control, subtitles, and full-screen).
   - **PDF Notes & Cheat Sheets (83 PDFs)**: Built-in reader with zoom and print options.
   - **Knowledge Quizzes & Tests (39 Quizzes)**: Instant review and interactive viewing.
   - **Quick Action Bar**: "Open in Google Drive" & "Direct Download" buttons for every lesson.

3. **Progress Tracking & Analytics**
   - Mark lectures as complete with one click (`C` key).
   - Real-time overall progress percentage and progress bar.
   - Per-module completion badges (e.g. `12/16 done`).
   - "Continue Learning" button resumes directly where you left off.
   - All progress is saved automatically to your browser (`localStorage`).

4. **Instant Search & Multi-Filters**
   - Real-time instant search across all 199 lectures (shortcut: `/`).
   - Filter pills: **All (199)**, **Videos (76)**, **Notes (83)**, **Quizzes (39)**, **Saved (Bookmarks)**.

5. **Personal Study Notes**
   - Take notes while watching any lecture in the "My Notes" tab.
   - Notes are auto-saved per lecture.
   - "All My Notes" drawer lets you review all your notes in one place and export them as a clean Markdown (`.md`) file!

6. **Keyboard Shortcuts**
   - <kbd>N</kbd> or <kbd>Alt</kbd> + <kbd>→</kbd> : Next Lesson
   - <kbd>P</kbd> or <kbd>Alt</kbd> + <kbd>←</kbd> : Previous Lesson
   - <kbd>C</kbd> : Toggle Mark Complete
   - <kbd>B</kbd> : Bookmark / Save for Revision
   - <kbd>T</kbd> : Theater Mode (expands stage, hides sidebar)
   - <kbd>/</kbd> : Focus Search Bar
   - <kbd>Esc</kbd> : Close Modals / Drawers

7. **Theme & Backups**
   - Dark Theme (default) & Light Theme toggle.
   - Progress Backup & Restore via JSON export/import.

---

## 🚀 How to Run

You can open the course page in multiple ways:

### Method 1: Direct Browser Launch (Simplest)
Double-click `index.html` or drag & drop it into any browser (Google Chrome, Microsoft Edge, Brave, Firefox, etc.).

### Method 2: Local Web Server
Open PowerShell in this folder and run:
```powershell
python -m http.server 8080
```
Then visit: [http://localhost:8080](http://localhost:8080)

Or using Node:
```powershell
npx serve
```

---

## 📁 File Structure

- `index.html` — Main HTML UI structure.
- `style.css` — Modern responsive theme, animations, dark/light modes.
- `app.js` — Core application logic, progress engine, notes, shortcuts.
- `course-data.js` — Complete indexed metadata with Drive file IDs for all 199 items.
- `image.jpg` — Course thumbnail.
- `tools/` — Python scripts used to crawl and index the Google Drive contents.
