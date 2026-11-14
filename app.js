/**
 * Version Control Mastery with Git & GitHub
 * Complete Course Hub Application
 */

(function () {
  'use strict';

  // Check data
  if (!window.COURSE_DATA || !window.COURSE_DATA.modules) {
    console.error("Course data not found! Ensure course-data.js is loaded.");
    return;
  }

  const STORAGE_KEY = 'git_course_portal_state_v1';
  const DATA = window.COURSE_DATA;

  // Flatten lessons
  const lessons = [];
  const lessonById = new Map();
  const lessonsByModule = new Map();

  let globalIdCounter = 1;
  DATA.modules.forEach((mod, modIdx) => {
    const modLessons = [];
    (mod.posts || []).forEach((post, postIdx) => {
      const lessonObj = {
        id: post.id || globalIdCounter++,
        moduleIndex: modIdx + 1,
        moduleName: mod.module,
        moduleDisplayName: mod.displayName || mod.module.replace(/^\d+\s*[-–—]\s*/, ''),
        lessonIndex: postIdx + 1,
        title: post.cleanTitle || post.name,
        rawName: post.name,
        type: post.type || 'video',
        folder: post.folder,
        file: post.file,
        driveId: post.driveId,
        previewUrl: post.previewUrl || (post.driveId ? `https://drive.google.com/file/d/${post.driveId}/preview` : null),
        viewUrl: post.viewUrl || (post.driveId ? `https://drive.google.com/file/d/${post.driveId}/view?usp=sharing` : '#'),
        downloadUrl: post.downloadUrl || (post.driveId ? `https://drive.google.com/uc?export=download&id=${post.driveId}` : '#'),
        localPath: post.localPath || `${mod.module}/${post.folder}/${post.file}`,
        htmlContent: post.htmlContent || null,
      };
      lessons.push(lessonObj);
      lessonById.set(lessonObj.id, lessonObj);
      modLessons.push(lessonObj);
    });
    lessonsByModule.set(modIdx + 1, modLessons);
  });

  // State management
  const state = {
    currentLessonId: null,
    completed: new Set(),
    bookmarks: new Set(),
    notes: {}, // { [lessonId]: { text: string, updatedAt: string } }
    openModules: new Set([1]), // Module 1 open by default
    activeFilter: 'all',
    searchQuery: '',
    theaterMode: false,
    theme: 'dark'
  };

  // Load state from localStorage
  function loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.completed)) state.completed = new Set(parsed.completed);
        if (Array.isArray(parsed.bookmarks)) state.bookmarks = new Set(parsed.bookmarks);
        if (parsed.notes && typeof parsed.notes === 'object') state.notes = parsed.notes;
        if (Array.isArray(parsed.openModules)) state.openModules = new Set(parsed.openModules);
        if (parsed.currentLessonId && lessonById.has(parsed.currentLessonId)) {
          state.currentLessonId = parsed.currentLessonId;
        }
        if (parsed.theme) state.theme = parsed.theme;
        if (typeof parsed.theaterMode === 'boolean') state.theaterMode = parsed.theaterMode;
      }
    } catch (e) {
      console.warn("Could not load saved state from localStorage:", e);
    }
  }

  // Save state to localStorage
  function saveState() {
    try {
      const obj = {
        completed: Array.from(state.completed),
        bookmarks: Array.from(state.bookmarks),
        notes: state.notes,
        openModules: Array.from(state.openModules),
        currentLessonId: state.currentLessonId,
        theme: state.theme,
        theaterMode: state.theaterMode
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
    } catch (e) {
      console.warn("Could not save state to localStorage:", e);
    }
  }

  // DOM Elements
  const DOM = {
    // Stage
    bcModule: document.getElementById('bcModule'),
    bcLesson: document.getElementById('bcLesson'),
    mediaContainer: document.getElementById('mediaContainer'),
    mediaFrame: document.getElementById('mediaFrame'),
    nativeVideo: document.getElementById('nativeVideo'),
    mediaLoading: document.getElementById('mediaLoading'),
    mediaEmpty: document.getElementById('mediaEmpty'),
    lessonTypePill: document.getElementById('lessonTypePill'),
    lessonTypeText: document.getElementById('lessonTypeText'),
    lessonSeqBadge: document.getElementById('lessonSeqBadge'),
    currentLessonTitle: document.getElementById('currentLessonTitle'),
    btnPrevLesson: document.getElementById('btnPrevLesson'),
    btnNextLesson: document.getElementById('btnNextLesson'),
    btnToggleComplete: document.getElementById('btnToggleComplete'),
    completeIcon: document.getElementById('completeIcon'),
    completeText: document.getElementById('completeText'),
    btnBookmark: document.getElementById('btnBookmark'),
    bookmarkIcon: document.getElementById('bookmarkIcon'),
    bookmarkText: document.getElementById('bookmarkText'),
    btnOpenInDrive: document.getElementById('btnOpenInDrive'),
    mediaDirectLink: document.getElementById('mediaDirectLink'),
    btnDownload: document.getElementById('btnDownload'),
    btnTheaterMode: document.getElementById('btnTheaterMode'),
    chipDriveLink: document.getElementById('chipDriveLink'),
    chipDownload: document.getElementById('chipDownload'),
    btnCopyLink: document.getElementById('btnCopyLink'),
    btnStartFirst: document.getElementById('btnStartFirst'),

    // Details Tab
    dtModule: document.getElementById('dtModule'),
    dtType: document.getElementById('dtType'),
    dtFile: document.getElementById('dtFile'),
    dtFolder: document.getElementById('dtFolder'),

    // Notes Tab
    lessonNotesTextarea: document.getElementById('lessonNotesTextarea'),
    notesSaveStatus: document.getElementById('notesSaveStatus'),
    btnClearNote: document.getElementById('btnClearNote'),
    btnSaveNoteManual: document.getElementById('btnSaveNoteManual'),
    currentLessonNotesDot: document.getElementById('currentLessonNotesDot'),
    notesBadge: document.getElementById('notesBadge'),

    // Tabs
    tabButtons: document.querySelectorAll('.tab-btn'),
    tabPanels: document.querySelectorAll('.tab-panel'),
    modulesQuickGrid: document.getElementById('modulesQuickGrid'),

    // Sidebar
    curriculumList: document.getElementById('curriculumList'),
    btnExpandAll: document.getElementById('btnExpandAll'),
    btnCollapseAll: document.getElementById('btnCollapseAll'),
    filterPills: document.querySelectorAll('.filter-pill'),
    countAll: document.getElementById('countAll'),
    countVideo: document.getElementById('countVideo'),
    countPdf: document.getElementById('countPdf'),
    countQuiz: document.getElementById('countQuiz'),
    countBookmarked: document.getElementById('countBookmarked'),

    // Navbar
    mainLayout: document.getElementById('mainLayout'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    progressText: document.getElementById('progressText'),
    progressBarFill: document.getElementById('progressBarFill'),
    btnContinue: document.getElementById('btnContinue'),
    btnNotesDrawer: document.getElementById('btnNotesDrawer'),
    btnShortcuts: document.getElementById('btnShortcuts'),
    themeToggleBtn: document.getElementById('themeToggleBtn'),
    btnSettings: document.getElementById('btnSettings'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    mobileCloseSidebar: document.getElementById('mobileCloseSidebar'),
    sidebarSection: document.getElementById('sidebarSection'),

    // Modals & Drawers
    notesDrawerBackdrop: document.getElementById('notesDrawerBackdrop'),
    notesDrawerBody: document.getElementById('notesDrawerBody'),
    btnCloseNotesDrawer: document.getElementById('btnCloseNotesDrawer'),
    btnExportNotes: document.getElementById('btnExportNotes'),
    shortcutsModal: document.getElementById('shortcutsModal'),
    btnCloseShortcuts: document.getElementById('btnCloseShortcuts'),
    settingsModal: document.getElementById('settingsModal'),
    btnCloseSettings: document.getElementById('btnCloseSettings'),
    btnExportProgress: document.getElementById('btnExportProgress'),
    importFileInput: document.getElementById('importFileInput'),
    btnResetAllProgress: document.getElementById('btnResetAllProgress'),

    // Toast
    toastNotification: document.getElementById('toastNotification'),
    toastIcon: document.getElementById('toastIcon'),
    toastMessage: document.getElementById('toastMessage'),
  };

  // Toast Helper
  let toastTimer = null;
  function showToast(message, isSuccess = true, iconClass = null) {
    if (toastTimer) clearTimeout(toastTimer);
    DOM.toastMessage.textContent = message;
    DOM.toastIcon.className = iconClass || (isSuccess ? 'fa-solid fa-circle-check' : 'fa-solid fa-circle-exclamation');
    DOM.toastIcon.style.color = isSuccess ? 'var(--success)' : 'var(--danger)';
    DOM.toastNotification.classList.add('show');
    toastTimer = setTimeout(() => {
      DOM.toastNotification.classList.remove('show');
    }, 2800);
  }

  // Type metadata helper
  function getTypeMeta(type) {
    switch (type) {
      case 'video':
        return { label: 'Video Lecture', icon: 'fa-solid fa-play', pillClass: 'type-video' };
      case 'pdf':
        return { label: 'PDF Notes / Cheat Sheet', icon: 'fa-solid fa-file-pdf', pillClass: 'type-pdf' };
      case 'quiz':
        return { label: 'Knowledge Check / Quiz', icon: 'fa-solid fa-clipboard-question', pillClass: 'type-quiz' };
      case 'article':
        return { label: 'Reading Article', icon: 'fa-solid fa-file-lines', pillClass: 'type-article' };
      default:
        return { label: 'Document', icon: 'fa-solid fa-file', pillClass: 'type-article' };
    }
  }

  // Render curriculum sidebar
  function renderCurriculum() {
    DOM.curriculumList.innerHTML = '';
    const query = state.searchQuery.toLowerCase().trim();
    const filter = state.activeFilter;

    let totalVisible = 0;

    DATA.modules.forEach((mod, modIdx) => {
      const modNum = modIdx + 1;
      const allModLessons = lessonsByModule.get(modNum) || [];

      // Filter lessons
      const filteredLessons = allModLessons.filter(l => {
        // Type / bookmark filter
        if (filter === 'video' && l.type !== 'video') return false;
        if (filter === 'pdf' && l.type !== 'pdf') return false;
        if (filter === 'quiz' && l.type !== 'quiz') return false;
        if (filter === 'bookmarked' && !state.bookmarks.has(l.id)) return false;

        // Search filter
        if (query) {
          const matchTitle = l.title.toLowerCase().includes(query);
          const matchMod = l.moduleName.toLowerCase().includes(query);
          const matchFile = l.file.toLowerCase().includes(query);
          if (!matchTitle && !matchMod && !matchFile) return false;
        }
        return true;
      });

      if (filteredLessons.length === 0 && (query || filter !== 'all')) {
        return; // Skip empty modules during active search/filter
      }

      totalVisible += filteredLessons.length;

      // Module completed stats
      const modCompletedCount = allModLessons.filter(l => state.completed.has(l.id)).length;
      const modTotalCount = allModLessons.length;
      const isModFullyCompleted = modCompletedCount === modTotalCount && modTotalCount > 0;

      // Create module container
      const modItem = document.createElement('div');
      const isModuleOpen = state.openModules.has(modNum) || Boolean(query);
      modItem.className = `module-item ${isModuleOpen ? 'open' : ''}`;
      modItem.dataset.module = modNum;

      // Header
      const header = document.createElement('div');
      header.className = 'module-header';
      header.innerHTML = `
        <div class="module-header-left">
          <div class="module-idx-badge">${modNum < 10 ? '0' + modNum : modNum}</div>
          <div class="module-info">
            <span class="module-name" title="${mod.displayName}">${mod.displayName}</span>
            <span class="module-meta">${filteredLessons.length} lessons</span>
          </div>
        </div>
        <div class="module-header-right">
          <span class="module-badge-progress ${isModFullyCompleted ? 'done' : ''}">
            ${isModFullyCompleted ? '<i class="fa-solid fa-check"></i> Complete' : `${modCompletedCount}/${modTotalCount}`}
          </span>
          <i class="fa-solid fa-chevron-down module-chevron"></i>
        </div>
      `;

      header.addEventListener('click', () => {
        if (state.openModules.has(modNum)) {
          state.openModules.delete(modNum);
          modItem.classList.remove('open');
        } else {
          state.openModules.add(modNum);
          modItem.classList.add('open');
          setTimeout(() => {
            modItem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 60);
        }
        saveState();
      });

      // Lessons list
      const lessonsList = document.createElement('div');
      lessonsList.className = 'module-lessons-list';

      filteredLessons.forEach((l) => {
        const isDone = state.completed.has(l.id);
        const isActive = state.currentLessonId === l.id;
        const isStarred = state.bookmarks.has(l.id);
        const meta = getTypeMeta(l.type);

        const lessonEl = document.createElement('div');
        lessonEl.className = `lesson-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}`;
        lessonEl.dataset.lessonId = l.id;

        lessonEl.innerHTML = `
          <div class="lesson-checkbox" title="${isDone ? 'Mark uncompleted' : 'Mark completed'}">
            <i class="fa-solid fa-check"></i>
          </div>
          <div class="lesson-type-icon ${l.type}" title="${meta.label}">
            <i class="${meta.icon}"></i>
          </div>
          <div class="lesson-details">
            <span class="lesson-title">${l.lessonIndex}. ${escapeHtml(l.title)}</span>
          </div>
          <button class="lesson-star-btn ${isStarred ? 'active' : ''}" title="${isStarred ? 'Remove bookmark' : 'Bookmark this lecture'}">
            <i class="${isStarred ? 'fa-solid' : 'fa-regular'} fa-star"></i>
          </button>
        `;

        // Checkbox click
        const chk = lessonEl.querySelector('.lesson-checkbox');
        chk.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleLessonCompletion(l.id);
        });

        // Bookmark click
        const starBtn = lessonEl.querySelector('.lesson-star-btn');
        starBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          toggleBookmark(l.id);
        });

        // Open lesson on item click
        lessonEl.addEventListener('click', () => {
          openLesson(l.id);
          // If on mobile, close sidebar
          if (window.innerWidth <= 860) {
            DOM.sidebarSection.classList.remove('mobile-open');
          }
        });

        lessonsList.appendChild(lessonEl);
      });

      modItem.appendChild(header);
      modItem.appendChild(lessonsList);
      DOM.curriculumList.appendChild(modItem);
    });

    // Update filter counts
    updateFilterCounts();
    updateOverallProgress();

    if (totalVisible === 0) {
      DOM.curriculumList.innerHTML = `
        <div style="text-align: center; padding: 30px 16px; color: var(--text-dim); font-size: 13px;">
          <i class="fa-solid fa-magnifying-glass" style="font-size: 24px; margin-bottom: 8px; display: block;"></i>
          No lectures match your search or filter.
        </div>
      `;
    }
  }

  // Update filter pill numbers
  function updateFilterCounts() {
    DOM.countAll.textContent = lessons.length;
    DOM.countVideo.textContent = lessons.filter(l => l.type === 'video').length;
    DOM.countPdf.textContent = lessons.filter(l => l.type === 'pdf').length;
    DOM.countQuiz.textContent = lessons.filter(l => l.type === 'quiz').length;
    DOM.countBookmarked.textContent = state.bookmarks.size;
  }

  // Update overall progress bar in navbar
  function updateOverallProgress() {
    const total = lessons.length;
    const done = state.completed.size;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    DOM.progressText.textContent = `${done} / ${total} (${pct}%)`;
    DOM.progressBarFill.style.width = `${pct}%`;
  }

  // Toggle completion
  function toggleLessonCompletion(id) {
    if (state.completed.has(id)) {
      state.completed.delete(id);
      showToast('Marked as uncompleted', false);
    } else {
      state.completed.add(id);
      showToast('🎉 Lecture marked as completed!', true);
    }
    saveState();
    updateCurrentLessonUI();
    renderCurriculum();
  }

  // Toggle bookmark
  function toggleBookmark(id) {
    if (state.bookmarks.has(id)) {
      state.bookmarks.delete(id);
      showToast('Removed bookmark', false);
    } else {
      state.bookmarks.add(id);
      showToast('Lecture bookmarked for review ⭐', true);
    }
    saveState();
    updateCurrentLessonUI();
    renderCurriculum();
  }

  // Format and style embedded Quiz & Article HTML
  function formatQuizHtml(rawHtml, theme = 'dark') {
    if (!rawHtml) return '';

    const isDark = (theme === 'dark');
    const customStyles = `
      <style id="custom-quiz-styles">
        :root {
          --quiz-bg: ${isDark ? '#080c16' : '#f8fafc'};
          --quiz-card: ${isDark ? '#111726' : '#ffffff'};
          --quiz-card-hover: ${isDark ? '#172033' : '#f1f5f9'};
          --quiz-border: ${isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.08)'};
          --quiz-text: ${isDark ? '#f1f5f9' : '#0f172a'};
          --quiz-muted: ${isDark ? '#94a3b8' : '#475569'};
          --quiz-primary: #6366f1;
          --quiz-cyan: #06b6d4;
          --quiz-success: #10b981;
          --quiz-success-bg: ${isDark ? 'rgba(16, 185, 129, 0.16)' : 'rgba(16, 185, 129, 0.12)'};
          --quiz-code-bg: ${isDark ? 'rgba(99, 102, 241, 0.18)' : 'rgba(99, 102, 241, 0.1)'};
          --quiz-code-text: ${isDark ? '#38bdf8' : '#4f46e5'};
        }
        * { box-sizing: border-box; }
        html, body {
          margin: 0;
          padding: 0;
          background-color: var(--quiz-bg);
          color: var(--quiz-text);
          font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
          line-height: 1.6;
        }
        body {
          max-width: 860px;
          margin: 0 auto;
          padding: 28px 24px 80px;
        }
        h1 {
          font-size: 22px;
          font-weight: 800;
          letter-spacing: -0.3px;
          margin: 0 0 16px;
          color: var(--quiz-text);
          padding-bottom: 12px;
          border-bottom: 1px solid var(--quiz-border);
        }
        /* Top quiz toolbar */
        .quiz-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 18px;
          background: var(--quiz-card);
          border: 1px solid var(--quiz-border);
          border-radius: 12px;
          margin-bottom: 24px;
          gap: 14px;
          flex-wrap: wrap;
        }
        .quiz-hint-text {
          font-size: 13px;
          font-weight: 500;
          color: var(--quiz-muted);
        }
        .btn-toggle-answers {
          appearance: none;
          cursor: pointer;
          background: var(--quiz-primary);
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 12.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          transition: all 0.2s ease;
        }
        .btn-toggle-answers:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        /* Question sections */
        section.q {
          background: var(--quiz-card);
          border: 1px solid var(--quiz-border);
          border-radius: 14px;
          padding: 22px 24px;
          margin-bottom: 22px;
          box-shadow: 0 4px 18px rgba(0, 0, 0, 0.12);
        }
        section.q h2 {
          font-size: 15.5px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 12px;
          color: var(--quiz-text);
        }
        section.q h2 span.t {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 3px 9px;
          border-radius: 9999px;
          background: rgba(99, 102, 241, 0.15);
          color: var(--quiz-primary);
        }
        .qt {
          font-size: 14.5px;
          font-weight: 500;
          margin-bottom: 16px;
          color: var(--quiz-text);
        }
        .qt p {
          margin: 4px 0;
        }
        ol {
          list-style: none;
          padding-left: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        ol li {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          background: var(--quiz-bg);
          border: 1px solid var(--quiz-border);
          cursor: pointer;
          transition: all 0.18s ease;
          font-size: 14px;
          user-select: none;
        }
        ol li:hover {
          background: var(--quiz-card-hover);
          border-color: var(--quiz-primary);
        }
        ol li.user-selected {
          border-color: var(--quiz-primary) !important;
          background: rgba(99, 102, 241, 0.14) !important;
        }
        ol li b {
          min-width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 6px;
          background: rgba(255, 255, 255, 0.08);
          font-size: 12px;
          color: var(--quiz-muted);
          flex: none;
        }
        ol li p {
          margin: 0;
          flex: 1;
        }
        /* Highlight correct answer when revealed */
        body.show-answers ol li.ok {
          background: var(--quiz-success-bg) !important;
          border-color: var(--quiz-success) !important;
          color: var(--quiz-success) !important;
          font-weight: 600;
        }
        body.show-answers ol li.ok::after {
          content: "✓ Correct Answer";
          font-size: 11px;
          font-weight: 700;
          background: var(--quiz-success);
          color: #fff;
          padding: 3px 9px;
          border-radius: 9999px;
          flex: none;
        }
        .why {
          margin-top: 14px;
          padding: 12px 16px;
          background: rgba(6, 182, 212, 0.08);
          border-left: 3px solid var(--quiz-cyan);
          border-radius: 0 8px 8px 0;
          font-size: 13px;
          color: var(--quiz-muted);
        }
        code {
          font-family: 'JetBrains Mono', Consolas, monospace;
          background: var(--quiz-code-bg);
          color: var(--quiz-code-text);
          padding: 2px 7px;
          border-radius: 5px;
          font-size: 0.9em;
          font-weight: 500;
        }
        pre {
          background: var(--quiz-card);
          padding: 14px;
          border-radius: 8px;
          overflow-x: auto;
          border: 1px solid var(--quiz-border);
        }
        ::-webkit-scrollbar {
          width: 8px;
        }
        ::-webkit-scrollbar-track {
          background: transparent;
        }
        ::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.4);
          border-radius: 999px;
        }
      </style>
    `;

    const interactiveScript = `
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          // Allow clicking choices
          document.querySelectorAll('ol li').forEach(li => {
            li.addEventListener('click', () => {
              const ol = li.parentElement;
              ol.querySelectorAll('li').forEach(item => item.classList.remove('user-selected'));
              li.classList.add('user-selected');
            });
          });

          // Insert Topbar with Answer Toggle
          const body = document.body;
          const h1 = document.querySelector('h1');
          const topBar = document.createElement('div');
          topBar.className = 'quiz-top-bar';
          topBar.innerHTML = '<span class="quiz-hint-text">💡 <b>Interactive Practice:</b> Click choices to test yourself.</span>' +
                             '<button class="btn-toggle-answers" id="btnToggleAns">Show Correct Answers</button>';
          
          if (h1 && h1.nextSibling) {
            h1.parentNode.insertBefore(topBar, h1.nextSibling);
          } else {
            body.prepend(topBar);
          }

          const btn = document.getElementById('btnToggleAns');
          if (btn) {
            btn.addEventListener('click', () => {
              const showing = body.classList.toggle('show-answers');
              btn.textContent = showing ? 'Hide Correct Answers' : 'Show Correct Answers';
              btn.style.background = showing ? '#10b981' : '#6366f1';
            });
          }
        });
      </script>
    `;

    if (rawHtml.includes('</head>')) {
      return rawHtml.replace('</head>', `${customStyles}</head>`).replace('</body>', `${interactiveScript}</body>`);
    } else {
      return `<!doctype html><html><head><meta charset="utf-8">${customStyles}</head><body>${rawHtml}${interactiveScript}</body></html>`;
    }
  }

  // Open Lesson
  function openLesson(id, updateHash = true) {
    const lesson = lessonById.get(id);
    if (!lesson) return;

    state.currentLessonId = id;
    saveState();

    if (updateHash) {
      location.hash = `#${id}`;
    }

    // Ensure parent module is open
    state.openModules.add(lesson.moduleIndex);

    // Update Stage UI
    DOM.bcModule.textContent = `Module ${lesson.moduleIndex < 10 ? '0' + lesson.moduleIndex : lesson.moduleIndex}: ${lesson.moduleDisplayName}`;
    DOM.bcLesson.textContent = lesson.title;
    DOM.currentLessonTitle.textContent = lesson.title;
    DOM.lessonSeqBadge.textContent = `Lesson ${lesson.id} of ${lessons.length}`;

    // Type badge
    const meta = getTypeMeta(lesson.type);
    DOM.lessonTypePill.className = `type-pill ${meta.pillClass}`;
    DOM.lessonTypePill.querySelector('i').className = meta.icon;
    DOM.lessonTypeText.textContent = meta.label;

    // External Drive link and download link
    DOM.btnOpenInDrive.href = lesson.viewUrl;
    if (DOM.mediaDirectLink) DOM.mediaDirectLink.href = lesson.viewUrl;
    DOM.btnDownload.href = lesson.downloadUrl;
    DOM.chipDriveLink.href = lesson.viewUrl;
    DOM.chipDownload.href = lesson.downloadUrl;

    // Details tab
    DOM.dtModule.textContent = `${lesson.moduleName}`;
    DOM.dtType.textContent = meta.label;
    DOM.dtFile.textContent = lesson.file;
    DOM.dtFolder.textContent = lesson.folder;

    // Load media into iframe
    DOM.mediaEmpty.hidden = true;
    DOM.mediaLoading.classList.add('active');

    if ((lesson.type === 'quiz' || lesson.type === 'article') && lesson.htmlContent) {
      DOM.mediaFrame.hidden = false;
      DOM.nativeVideo.hidden = true;
      DOM.mediaFrame.removeAttribute('src');
      DOM.mediaFrame.srcdoc = formatQuizHtml(lesson.htmlContent, state.theme);
      DOM.mediaLoading.classList.remove('active');
    } else if (lesson.previewUrl) {
      DOM.mediaFrame.hidden = false;
      DOM.nativeVideo.hidden = true;
      DOM.mediaFrame.removeAttribute('srcdoc');
      DOM.mediaFrame.src = lesson.previewUrl;
      DOM.mediaFrame.onload = () => {
        DOM.mediaLoading.classList.remove('active');
      };
      // Fallback timeout in case iframe onload event is suppressed by cross-origin
      setTimeout(() => {
        DOM.mediaLoading.classList.remove('active');
      }, 1500);
    } else {
      DOM.mediaLoading.classList.remove('active');
      DOM.mediaFrame.hidden = true;
      DOM.mediaEmpty.hidden = false;
    }

    // Load notes for this lesson
    loadLessonNotes(id);

    // Update buttons & active classes
    updateCurrentLessonUI();
    renderCurriculum();

    // Scroll active item into view smoothly in sidebar
    setTimeout(() => {
      const activeEl = DOM.curriculumList.querySelector(`.lesson-item.active`);
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  }

  // Update button states for active lesson
  function updateCurrentLessonUI() {
    const id = state.currentLessonId;
    if (!id) return;

    const isDone = state.completed.has(id);
    DOM.btnToggleComplete.classList.toggle('active', isDone);
    DOM.completeIcon.className = isDone ? 'fa-solid fa-circle-check' : 'fa-regular fa-circle-check';
    DOM.completeText.textContent = isDone ? 'Completed ✓' : 'Mark Complete';

    const isStarred = state.bookmarks.has(id);
    DOM.btnBookmark.classList.toggle('active', isStarred);
    DOM.bookmarkIcon.className = isStarred ? 'fa-solid fa-star' : 'fa-regular fa-star';
    DOM.bookmarkText.textContent = isStarred ? 'Bookmarked' : 'Bookmark';

    // Prev / Next button state
    DOM.btnPrevLesson.disabled = (id <= 1);
    DOM.btnNextLesson.disabled = (id >= lessons.length);
  }

  // Notes Management
  let noteDebounceTimer = null;

  function loadLessonNotes(id) {
    const noteData = state.notes[id];
    DOM.lessonNotesTextarea.value = noteData ? noteData.text : '';
    DOM.currentLessonNotesDot.hidden = !noteData || !noteData.text.trim();
    DOM.notesSaveStatus.innerHTML = '<i class="fa-solid fa-check"></i> All changes saved';
    updateNotesBadge();
  }

  function handleNoteInput() {
    const id = state.currentLessonId;
    if (!id) return;

    DOM.notesSaveStatus.innerHTML = '<i class="fa-solid fa-arrows-rotate fa-spin"></i> Saving...';
    if (noteDebounceTimer) clearTimeout(noteDebounceTimer);

    noteDebounceTimer = setTimeout(() => {
      const text = DOM.lessonNotesTextarea.value;
      if (text.trim()) {
        state.notes[id] = {
          text: text,
          updatedAt: new Date().toISOString()
        };
      } else {
        delete state.notes[id];
      }
      saveState();
      DOM.currentLessonNotesDot.hidden = !text.trim();
      DOM.notesSaveStatus.innerHTML = '<i class="fa-solid fa-check"></i> All changes saved';
      updateNotesBadge();
    }, 500);
  }

  function updateNotesBadge() {
    const count = Object.keys(state.notes).length;
    DOM.notesBadge.textContent = count;
    DOM.notesBadge.hidden = count === 0;
  }

  // Modal & Drawer Helpers
  function openModal(el) {
    if (!el) return;
    el.hidden = false;
    el.style.display = 'grid';
    el.classList.add('active');
  }

  function closeModal(el) {
    if (!el) return;
    el.hidden = true;
    el.style.display = 'none';
    el.classList.remove('active');
  }

  function openDrawer(el) {
    if (!el) return;
    el.hidden = false;
    el.style.display = 'flex';
    el.classList.add('active');
  }

  function closeDrawer(el) {
    if (!el) return;
    el.hidden = true;
    el.style.display = 'none';
    el.classList.remove('active');
  }

  // Render All Notes Drawer
  function renderNotesDrawer() {
    DOM.notesDrawerBody.innerHTML = '';
    const noteIds = Object.keys(state.notes).sort((a, b) => Number(a) - Number(b));

    if (noteIds.length === 0) {
      DOM.notesDrawerBody.innerHTML = `
        <div style="text-align: center; padding: 40px 20px; color: var(--text-dim);">
          <i class="fa-regular fa-clipboard" style="font-size: 36px; margin-bottom: 12px; display: block;"></i>
          <h4>No study notes yet</h4>
          <p style="font-size: 13px; margin-top: 6px;">Write notes in the "My Notes" tab of any lecture, and they will appear here automatically.</p>
        </div>
      `;
      return;
    }

    noteIds.forEach(id => {
      const lesson = lessonById.get(Number(id));
      if (!lesson) return;
      const note = state.notes[id];

      const card = document.createElement('div');
      card.className = 'saved-note-card';
      card.innerHTML = `
        <div class="saved-note-header">
          <span class="saved-note-title" title="Go to this lecture">
            Lesson ${lesson.id}: ${escapeHtml(lesson.title)}
          </span>
          <span style="font-size: 11px; color: var(--text-dim);">Module ${lesson.moduleIndex}</span>
        </div>
        <div class="saved-note-content">${escapeHtml(note.text)}</div>
      `;

      card.querySelector('.saved-note-title').addEventListener('click', () => {
        closeDrawer(DOM.notesDrawerBackdrop);
        openLesson(lesson.id);
      });

      DOM.notesDrawerBody.appendChild(card);
    });
  }

  // Export Notes to Markdown
  function exportNotesToMarkdown() {
    const noteIds = Object.keys(state.notes).sort((a, b) => Number(a) - Number(b));
    if (noteIds.length === 0) {
      showToast('No notes to export', false);
      return;
    }

    let md = `# Study Notes: Version Control Mastery with Git & GitHub\n\n`;
    md += `*Exported on ${new Date().toLocaleDateString()}*\n\n---\n\n`;

    noteIds.forEach(id => {
      const lesson = lessonById.get(Number(id));
      if (!lesson) return;
      const note = state.notes[id];
      md += `### Lesson ${lesson.id}: ${lesson.title}\n`;
      md += `**Module**: ${lesson.moduleName}  \n`;
      md += `**Resource**: ${lesson.viewUrl}  \n\n`;
      md += `${note.text}\n\n---\n\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'git-course-study-notes.md';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Notes exported to Markdown file!', true);
  }

  // Render All Modules Quick View
  function renderModulesQuickView() {
    DOM.modulesQuickGrid.innerHTML = '';
    DATA.modules.forEach((mod, idx) => {
      const modNum = idx + 1;
      const modLessons = lessonsByModule.get(modNum) || [];
      const completed = modLessons.filter(l => state.completed.has(l.id)).length;

      const card = document.createElement('div');
      card.className = 'module-quick-card';
      card.innerHTML = `
        <h5>${modNum}. ${escapeHtml(mod.displayName)}</h5>
        <p>${modLessons.length} lessons &bull; ${completed} completed</p>
        <div class="progress-bar-bg" style="margin-top: 10px;">
          <div class="progress-bar-fill" style="width: ${(completed / (modLessons.length || 1)) * 100}%"></div>
        </div>
      `;
      card.addEventListener('click', () => {
        // Switch to Overview and open first lesson of this module
        if (modLessons.length > 0) {
          openLesson(modLessons[0].id);
        }
      });
      DOM.modulesQuickGrid.appendChild(card);
    });
  }

  // Navigation: Next / Prev
  function goNext() {
    if (state.currentLessonId < lessons.length) {
      openLesson(state.currentLessonId + 1);
    } else {
      showToast('🎉 You have reached the final lecture of the course!', true);
    }
  }

  function goPrev() {
    if (state.currentLessonId > 1) {
      openLesson(state.currentLessonId - 1);
    } else {
      showToast('This is the first lecture.', false);
    }
  }

  // Continue Learning action
  function continueLearning() {
    // 1. Resume current lesson if any
    if (state.currentLessonId && !state.completed.has(state.currentLessonId)) {
      openLesson(state.currentLessonId);
      return;
    }
    // 2. Find first uncompleted lesson
    const nextUncompleted = lessons.find(l => !state.completed.has(l.id));
    if (nextUncompleted) {
      openLesson(nextUncompleted.id);
    } else {
      openLesson(1);
    }
  }

  // Theme Management
  function setTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    DOM.themeToggleBtn.querySelector('i').className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
    saveState();

    // If active lesson is quiz or article, update its srcdoc theme
    const curLesson = lessonById.get(state.currentLessonId);
    if (curLesson && (curLesson.type === 'quiz' || curLesson.type === 'article') && curLesson.htmlContent) {
      DOM.mediaFrame.srcdoc = formatQuizHtml(curLesson.htmlContent, theme);
    }
  }

  function toggleTheme() {
    setTheme(state.theme === 'dark' ? 'light' : 'dark');
  }

  // Theater Mode
  function toggleTheaterMode() {
    state.theaterMode = !state.theaterMode;
    DOM.mainLayout.classList.toggle('theater-mode', state.theaterMode);
    DOM.btnTheaterMode.querySelector('.btn-text').textContent = state.theaterMode ? 'Exit Theater' : 'Theater Mode';
    DOM.btnTheaterMode.querySelector('i').className = state.theaterMode ? 'fa-solid fa-compress' : 'fa-solid fa-expand';
    saveState();
  }

  // Export / Import Progress
  function exportProgressJSON() {
    const data = {
      completed: Array.from(state.completed),
      bookmarks: Array.from(state.bookmarks),
      notes: state.notes,
      currentLessonId: state.currentLessonId,
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `git-course-progress-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Progress backup file downloaded!', true);
  }

  function importProgressJSON(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        if (Array.isArray(parsed.completed)) state.completed = new Set(parsed.completed);
        if (Array.isArray(parsed.bookmarks)) state.bookmarks = new Set(parsed.bookmarks);
        if (parsed.notes && typeof parsed.notes === 'object') state.notes = parsed.notes;
        if (parsed.currentLessonId && lessonById.has(parsed.currentLessonId)) {
          state.currentLessonId = parsed.currentLessonId;
        }
        saveState();
        renderCurriculum();
        if (state.currentLessonId) openLesson(state.currentLessonId);
        showToast('Progress successfully restored!', true);
        closeModal(DOM.settingsModal);
      } catch (err) {
        showToast('Invalid backup file!', false);
      }
    };
    reader.readAsText(file);
  }

  // Reset progress
  function resetAllProgress() {
    if (!confirm('Are you sure you want to reset all course progress, bookmarks, and notes? This cannot be undone.')) {
      return;
    }
    state.completed.clear();
    state.bookmarks.clear();
    state.notes = {};
    saveState();
    renderCurriculum();
    updateCurrentLessonUI();
    loadLessonNotes(state.currentLessonId || 1);
    closeModal(DOM.settingsModal);
    showToast('Course progress has been reset.', false);
  }

  // Helpers
  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  // Bind Event Listeners
  function bindEvents() {
    // Stage controls
    DOM.btnPrevLesson.addEventListener('click', goPrev);
    DOM.btnNextLesson.addEventListener('click', goNext);
    DOM.btnToggleComplete.addEventListener('click', () => {
      if (state.currentLessonId) toggleLessonCompletion(state.currentLessonId);
    });
    DOM.btnBookmark.addEventListener('click', () => {
      if (state.currentLessonId) toggleBookmark(state.currentLessonId);
    });
    DOM.btnContinue.addEventListener('click', continueLearning);
    DOM.btnStartFirst.addEventListener('click', () => openLesson(1));
    DOM.btnTheaterMode.addEventListener('click', toggleTheaterMode);
    DOM.themeToggleBtn.addEventListener('click', toggleTheme);

    // Copy lesson link
    DOM.btnCopyLink.addEventListener('click', () => {
      navigator.clipboard.writeText(location.href).then(() => {
        showToast('Link copied to clipboard! 📋', true);
      }).catch(() => {
        showToast('Could not copy link', false);
      });
    });

    // Notes textarea
    DOM.lessonNotesTextarea.addEventListener('input', handleNoteInput);
    DOM.btnSaveNoteManual.addEventListener('click', () => {
      handleNoteInput();
      showToast('Notes saved successfully!', true);
    });
    DOM.btnClearNote.addEventListener('click', () => {
      if (confirm('Clear notes for this lecture?')) {
        DOM.lessonNotesTextarea.value = '';
        handleNoteInput();
      }
    });

    // Tabs
    DOM.tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.dataset.tab;
        DOM.tabButtons.forEach(b => b.classList.remove('active'));
        DOM.tabPanels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const panel = document.getElementById(targetTab);
        if (panel) panel.classList.add('active');
        if (targetTab === 'tabModulesQuick') renderModulesQuickView();
      });
    });

    // Filter pills
    DOM.filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        DOM.filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        state.activeFilter = pill.dataset.filter;
        renderCurriculum();
      });
    });

    // Search
    DOM.searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value;
      DOM.clearSearchBtn.hidden = !state.searchQuery;
      renderCurriculum();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.searchQuery = '';
      DOM.clearSearchBtn.hidden = true;
      renderCurriculum();
      DOM.searchInput.focus();
    });

    // Expand / Collapse all
    DOM.btnExpandAll.addEventListener('click', () => {
      DATA.modules.forEach((_, idx) => state.openModules.add(idx + 1));
      saveState();
      renderCurriculum();
    });

    DOM.btnCollapseAll.addEventListener('click', () => {
      state.openModules.clear();
      saveState();
      renderCurriculum();
    });

    // Notes drawer
    DOM.btnNotesDrawer.addEventListener('click', () => {
      renderNotesDrawer();
      openDrawer(DOM.notesDrawerBackdrop);
    });
    DOM.btnCloseNotesDrawer.addEventListener('click', () => {
      closeDrawer(DOM.notesDrawerBackdrop);
    });
    DOM.notesDrawerBackdrop.addEventListener('click', (e) => {
      if (e.target === DOM.notesDrawerBackdrop) closeDrawer(DOM.notesDrawerBackdrop);
    });
    DOM.btnExportNotes.addEventListener('click', exportNotesToMarkdown);

    // Shortcuts modal
    DOM.btnShortcuts.addEventListener('click', () => {
      openModal(DOM.shortcutsModal);
    });
    DOM.btnCloseShortcuts.addEventListener('click', () => {
      closeModal(DOM.shortcutsModal);
    });
    DOM.shortcutsModal.addEventListener('click', (e) => {
      if (e.target === DOM.shortcutsModal) closeModal(DOM.shortcutsModal);
    });

    // Settings modal
    DOM.btnSettings.addEventListener('click', () => {
      openModal(DOM.settingsModal);
    });
    DOM.btnCloseSettings.addEventListener('click', () => {
      closeModal(DOM.settingsModal);
    });
    DOM.settingsModal.addEventListener('click', (e) => {
      if (e.target === DOM.settingsModal) closeModal(DOM.settingsModal);
    });
    DOM.btnExportProgress.addEventListener('click', exportProgressJSON);
    DOM.importFileInput.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        importProgressJSON(e.target.files[0]);
      }
    });
    DOM.btnResetAllProgress.addEventListener('click', resetAllProgress);

    // Mobile sidebar
    DOM.mobileMenuBtn.addEventListener('click', () => {
      DOM.sidebarSection.classList.add('mobile-open');
    });
    DOM.mobileCloseSidebar.addEventListener('click', () => {
      DOM.sidebarSection.classList.remove('mobile-open');
    });

    // Global keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      const activeTag = (document.activeElement.tagName || '').toLowerCase();
      if (activeTag === 'input' || activeTag === 'textarea') {
        if (e.key === 'Escape') document.activeElement.blur();
        return;
      }

      switch (e.key) {
        case 'n':
        case 'N':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            goNext();
          }
          break;
        case 'p':
        case 'P':
          if (!e.ctrlKey && !e.metaKey) {
            e.preventDefault();
            goPrev();
          }
          break;
        case 'c':
        case 'C':
          if (state.currentLessonId) {
            e.preventDefault();
            toggleLessonCompletion(state.currentLessonId);
          }
          break;
        case 'b':
        case 'B':
          if (state.currentLessonId) {
            e.preventDefault();
            toggleBookmark(state.currentLessonId);
          }
          break;
        case 't':
        case 'T':
          e.preventDefault();
          toggleTheaterMode();
          break;
        case '/':
          e.preventDefault();
          DOM.searchInput.focus();
          break;
        case 'Escape':
          closeDrawer(DOM.notesDrawerBackdrop);
          closeModal(DOM.shortcutsModal);
          closeModal(DOM.settingsModal);
          DOM.sidebarSection.classList.remove('mobile-open');
          break;
      }
    });

    // Hash change (Deep-linking)
    window.addEventListener('hashchange', () => {
      const hashId = parseInt(location.hash.replace('#', ''), 10);
      if (hashId && lessonById.has(hashId) && hashId !== state.currentLessonId) {
        openLesson(hashId, false);
      }
    });
  }

  // Boot
  function init() {
    loadState();
    setTheme(state.theme);

    if (state.theaterMode) {
      DOM.mainLayout.classList.add('theater-mode');
    }

    bindEvents();
    renderCurriculum();
    updateNotesBadge();

    // Check URL hash or load last/first lesson
    const hashId = parseInt(location.hash.replace('#', ''), 10);
    const initialLessonId = (hashId && lessonById.has(hashId))
      ? hashId
      : (state.currentLessonId && lessonById.has(state.currentLessonId))
        ? state.currentLessonId
        : 1;

    openLesson(initialLessonId, false);
    console.log(`[Git Mastery Portal] Loaded ${lessons.length} lessons successfully.`);
  }

  // Launch on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
