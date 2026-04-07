const content = window.NOTARY_COURSE_CONTENT || {
  metadata: { pageCount: 149, exam: { questionCount: 30, passingScore: 80, duration: '1 hour' } },
  modules: [],
  cramSheets: [],
};
const roadmap = window.NOTARY_ROADMAP_CONTENT || {
  title: 'Ohio Notary Business Roadmap',
  phases: [],
  bestOrder: [],
  revenueHierarchy: [],
  avenueBreakdown: [],
  appWorkflowMirror: [],
  avenuesMap: [],
};

const STORAGE_KEY = 'notary-os-study-hub-regular-v2';
const DEFAULT_PDF = '../SeededCourse/OhioNotaryCoursePacket.pdf';
const OPERATIONS_URL = 'https://ohio-notary-os.netlify.app/dashboard';
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const SECTION_ORDER = ['dashboard', 'packet', 'modules', 'flashcards', 'quiz', 'cram', 'checklist', 'roadmap', 'operations'];
const SECTION_SHORTCUTS = {
  '1': 'dashboard',
  '2': 'packet',
  '3': 'modules',
  '4': 'flashcards',
  '5': 'quiz',
  '6': 'cram',
  '7': 'checklist',
  '8': 'roadmap',
  '9': 'operations',
};
const PASS_THRESHOLD = Number(content.metadata?.exam?.passingScore || 80);
const MEDIA_QUERY = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;
const ROADMAP_STATUS_META = {
  not_started: { label: 'Not started', chipClass: 'chip-not-started' },
  in_progress: { label: 'In progress', chipClass: 'chip-in-progress' },
  active: { label: 'Active', chipClass: 'chip-active' },
  deferred: { label: 'Deferred', chipClass: 'chip-deferred' },
  completed: { label: 'Completed', chipClass: 'chip-completed' },
};

const checklistItems = [
  { key: 'coursePaid', label: 'Course paid', description: 'Keep the paid packet and course access organized in one place.', group: 'Study' },
  { key: 'courseCompleted', label: 'Course completed', description: 'Finish the packet and mark the course complete before focusing on filing.', group: 'Study' },
  { key: 'examPassed', label: 'Exam passed', description: 'Treat 80% as the minimum and aim for stable passing practice scores.', group: 'Study' },
  { key: 'bciFresh', label: 'BCI freshness confirmed', description: 'Confirm the BCI report is still within the filing window.', group: 'Licensing' },
  { key: 'applicationFiled', label: 'Application filed', description: 'Submit signature, BCI, and course proof through the Ohio portal.', group: 'Licensing' },
  { key: 'commissionApproved', label: 'Commission approved', description: 'Record the approval date as soon as it arrives.', group: 'Licensing' },
  { key: 'oathCompleted', label: 'Oath completed', description: 'Complete the required in-person oath before performing acts.', group: 'Licensing' },
  { key: 'sealOrdered', label: 'Seal ordered / received', description: 'Do not start work until the seal is ready.', group: 'Licensing' },
  { key: 'firstRevenueMade', label: 'First low-risk appointment completed', description: 'Start with acknowledgments, jurats, affidavits, and employment or school forms.', group: 'Revenue' },
  { key: 'mobileLaunchReady', label: 'Mobile launch setup ready', description: 'Travel zones, booking flow, website, and Google Business Profile are in place.', group: 'Revenue' },
  { key: 'specialtyNicheReady', label: 'Specialty niches prepared', description: 'Hospital, title, and estate-support workflows are ready to activate.', group: 'Revenue' },
  { key: 'ronReady', label: 'RON path active', description: 'RON authorization and workflow are ready when you choose to scale digitally.', group: 'Revenue' },
  { key: 'premiumServicesReady', label: 'Premium services path active', description: 'Loan signing / premium title-related workflows are ready.', group: 'Revenue' },
  { key: 'b2bAccountsReady', label: 'Recurring account system active', description: 'Packages and outreach are ready for recurring business clients.', group: 'Revenue' },
];

const shortcutGroups = [
  {
    title: 'Navigation',
    items: [
      ['⌘1', 'Open Start Here'],
      ['⌘2', 'Open Course Packet'],
      ['⌘3', 'Open Study Modules'],
      ['⌘4', 'Open Flashcards'],
      ['⌘5', 'Open Practice Quiz'],
      ['⌘6', 'Open Final Cram'],
      ['⌘7', 'Open Licensing Checklist'],
      ['⌘8', 'Open Roadmap'],
      ['⌘9', 'Open Operations'],
    ],
  },
  {
    title: 'Window controls',
    items: [
      ['⌘B', 'Collapse or expand the sidebar'],
      ['⌘D', 'Toggle dark mode quickly'],
      ['⌘/', 'Open shortcut help'],
      ['⌘P', 'Print the cram sheet'],
    ],
  },
  {
    title: 'Flashcards',
    items: [
      ['Space', 'Flip the current flashcard'],
      ['←', 'Previous flashcard'],
      ['→', 'Next flashcard'],
    ],
  },
];

const defaultChecklist = checklistItems.reduce((acc, item) => {
  acc[item.key] = item.key === 'coursePaid';
  return acc;
}, {});

function deepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function dayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function buildDefaultRoadmapProgress() {
  return (roadmap.phases || []).reduce((acc, phase, index) => {
    acc[phase.id] = {
      status: index === 0 ? 'in_progress' : 'not_started',
      notes: '',
      nextStep: index === 0 ? 'Finish the course and get to a passing practice score.' : '',
      touchedAt: '',
    };
    return acc;
  }, {});
}

const defaultState = {
  activeSection: 'dashboard',
  activeModuleId: content.modules[0]?.id || '',
  flashcardIndex: 0,
  flashcardShowAnswer: false,
  flashcardScope: 'module',
  flashcardRatings: {},
  checklist: defaultChecklist,
  lastPacketPage: 1,
  latestQuizScore: null,
  bestQuizScore: null,
  quizHistory: [],
  noteByModule: {},
  themePreference: 'system',
  sidebarCollapsed: false,
  shortcutOverlayOpen: false,
  todaySessionDismissedDate: '',
  todaySessionNotes: '',
  todaySessionComplete: false,
  todaySessionDate: dayKey(),
  roadmapProgress: buildDefaultRoadmapProgress(),
};

let state = loadState();
let currentQuiz = null;

function normalizeState(parsed) {
  const roadmapDefaults = buildDefaultRoadmapProgress();
  const mergedRoadmap = Object.keys(roadmapDefaults).reduce((acc, phaseId) => {
    acc[phaseId] = {
      ...roadmapDefaults[phaseId],
      ...((parsed.roadmapProgress || {})[phaseId] || {}),
    };
    return acc;
  }, {});

  const normalized = {
    ...deepClone(defaultState),
    ...parsed,
    checklist: { ...defaultChecklist, ...(parsed.checklist || {}) },
    flashcardRatings: parsed.flashcardRatings || {},
    noteByModule: parsed.noteByModule || {},
    quizHistory: Array.isArray(parsed.quizHistory) ? parsed.quizHistory : [],
    roadmapProgress: mergedRoadmap,
  };

  if (!SECTION_ORDER.includes(normalized.activeSection)) normalized.activeSection = 'dashboard';
  if (!content.modules.some((module) => module.id === normalized.activeModuleId)) {
    normalized.activeModuleId = content.modules[0]?.id || '';
  }

  if (normalized.todaySessionDate !== dayKey()) {
    normalized.todaySessionDate = dayKey();
    normalized.todaySessionComplete = false;
    normalized.todaySessionDismissedDate = '';
    normalized.todaySessionNotes = '';
  }

  return normalized;
}

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return normalizeState(parsed);
  } catch {
    return normalizeState({});
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function percent(value, total) {
  if (!total) return 0;
  return Math.max(0, Math.min(100, Math.round((value / total) * 100)));
}

function scoreClass(score) {
  if (score >= PASS_THRESHOLD) return 'score-good';
  if (score >= PASS_THRESHOLD - 10) return 'score-mid';
  return 'score-low';
}

function humanDate(value) {
  if (!value) return 'Not touched yet';
  try {
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusMeta(status) {
  return ROADMAP_STATUS_META[status] || ROADMAP_STATUS_META.not_started;
}

function resolvedTheme() {
  if (state.themePreference === 'system') {
    return MEDIA_QUERY?.matches ? 'dark' : 'light';
  }
  return state.themePreference;
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', resolvedTheme());
  const select = document.getElementById('theme-select');
  if (select) select.value = state.themePreference;
}

function applyShellState() {
  document.body.classList.toggle('sidebar-collapsed', Boolean(state.sidebarCollapsed));
  const overlay = document.getElementById('shortcut-overlay');
  if (overlay) {
    overlay.classList.toggle('hidden', !state.shortcutOverlayOpen);
    overlay.setAttribute('aria-hidden', state.shortcutOverlayOpen ? 'false' : 'true');
  }
}

function moduleById(id) {
  return content.modules.find((module) => module.id === id) || content.modules[0] || null;
}

function allQuestions() {
  return content.modules.flatMap((module) =>
    (module.questions || []).map((question) => ({ ...question, moduleId: module.id, moduleTitle: module.title }))
  );
}

function allFlashcards() {
  return content.modules.flatMap((module) =>
    (module.flashcards || []).map((card) => ({ ...card, moduleId: module.id, moduleTitle: module.title }))
  );
}

function latestQuiz() {
  return state.quizHistory[0] || null;
}

function weakTopics() {
  const misses = new Map();
  state.quizHistory.forEach((attempt) => {
    (attempt.incorrect || []).forEach((moduleId) => {
      misses.set(moduleId, (misses.get(moduleId) || 0) + 1);
    });
  });

  return [...misses.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([moduleId, missCount]) => ({ module: moduleById(moduleId), missCount }));
}

function checklistCompletion() {
  const total = checklistItems.length;
  const completed = checklistItems.filter((item) => state.checklist[item.key]).length;
  return { completed, total, percent: percent(completed, total) };
}

function packetModulesForPage(page) {
  return content.modules.filter((module) => page >= module.sourcePageStart && page <= module.sourcePageEnd);
}

function studyProgress() {
  const checklistPct = checklistCompletion().percent;
  const quizScore = state.bestQuizScore || 0;
  const packetPct = percent(state.lastPacketPage, Number(content.metadata?.pageCount || 149));
  return Math.round(checklistPct * 0.35 + quizScore * 0.45 + packetPct * 0.2);
}

function roadmapPhaseState(phaseId) {
  return state.roadmapProgress[phaseId] || buildDefaultRoadmapProgress()[phaseId] || { status: 'not_started', notes: '', nextStep: '', touchedAt: '' };
}

function roadmapCounts() {
  return (roadmap.phases || []).reduce(
    (acc, phase) => {
      const current = roadmapPhaseState(phase.id);
      acc[current.status] = (acc[current.status] || 0) + 1;
      return acc;
    },
    { not_started: 0, in_progress: 0, active: 0, deferred: 0, completed: 0 }
  );
}

function dominantRoadmapPhase() {
  const active = (roadmap.phases || []).find((phase) => {
    const status = roadmapPhaseState(phase.id).status;
    return status === 'active' || status === 'in_progress';
  });
  return active || roadmap.phases[0] || null;
}

function recommendationQuizLabel() {
  const weak = weakTopics();
  const best = state.bestQuizScore || 0;
  if (!state.checklist.courseCompleted) return 'Finish the packet pages tied to your active module, then do a 10-question module drill.';
  if (best < PASS_THRESHOLD - 10) return 'Do a 10-question module drill before another full timed quiz.';
  if (weak[0]?.module) return `Run a weak-topic drill for ${weak[0].module.title}.`;
  return 'Run a full 30-question timed quiz to hold your passing margin.';
}

function todayStudyAction() {
  const weak = weakTopics();
  if (!state.checklist.courseCompleted) {
    return {
      title: `Resume the packet on page ${state.lastPacketPage}`,
      detail: 'Keep pushing through the paid course packet until the course is complete.',
      weakestTopic: packetModulesForPage(state.lastPacketPage)[0]?.title || moduleById(state.activeModuleId)?.title || 'Course packet focus',
    };
  }

  if (!state.checklist.examPassed && (state.bestQuizScore || 0) < PASS_THRESHOLD) {
    return {
      title: 'Get to a stable passing practice score',
      detail: 'Use the quiz + cram loop until 80% feels repeatable, not lucky.',
      weakestTopic: weak[0]?.module?.title || moduleById(state.activeModuleId)?.title || 'Mixed review',
    };
  }

  return {
    title: 'Maintain exam readiness and move the business forward',
    detail: 'Keep one quiz or flashcard pass active while progressing the licensing checklist.',
    weakestTopic: weak[0]?.module?.title || 'No obvious weak topic right now',
  };
}

function businessNextAction() {
  const roadmapState = state.roadmapProgress;
  if (!state.checklist.courseCompleted) {
    return { label: 'Finish the course', detail: 'Get through the packet and mark the course complete before shifting energy into filing work.' };
  }
  if (!state.checklist.examPassed && (state.bestQuizScore || 0) < PASS_THRESHOLD) {
    return { label: 'Get exam-pass ready', detail: 'Push practice scores to at least 80% before treating the exam as handled.' };
  }
  if (!state.checklist.bciFresh) {
    return { label: 'Confirm BCI freshness', detail: 'Make sure the BCI report is still inside the filing window.' };
  }
  if (!state.checklist.applicationFiled) {
    return { label: 'File the application', detail: 'Prepare the signature, BCI, and course proof for the Secretary of State portal.' };
  }
  if (!state.checklist.oathCompleted) {
    return { label: 'Complete the oath', detail: 'The in-person oath is the gate before lawful performance.' };
  }
  if (!state.checklist.sealOrdered) {
    return { label: 'Order the seal', detail: 'Get the seal in hand before you take live appointments.' };
  }
  if (!state.checklist.firstRevenueMade) {
    return { label: 'Take first low-risk in-person revenue', detail: 'Start with clean acknowledgments, jurats, affidavits, and ordinary school or employment forms.' };
  }
  if (!state.checklist.mobileLaunchReady && !['active', 'completed'].includes(roadmapState.local_mobile_launch?.status)) {
    return { label: 'Build the mobile launch', detail: 'Set travel zones, travel fees, booking flow, Google Business Profile, and website basics.' };
  }
  if (!state.checklist.specialtyNicheReady && !['active', 'completed'].includes(roadmapState.specialty_niche_expansion?.status)) {
    return { label: 'Prepare specialty niches', detail: 'Build safe workflows for hospital, title, and estate-related appointments.' };
  }
  if (!state.checklist.ronReady && !['active', 'completed'].includes(roadmapState.digital_scale?.status)) {
    return { label: 'Start the RON path', detail: 'Complete RON authorization and digital workflow setup to reduce travel and scale volume.' };
  }
  if (!state.checklist.premiumServicesReady && !['active', 'completed'].includes(roadmapState.premium_services?.status)) {
    return { label: 'Prepare premium services', detail: 'Train for loan signings and higher-ticket title-related work.' };
  }
  if (!state.checklist.b2bAccountsReady && !['active', 'completed'].includes(roadmapState.recurring_accounts?.status)) {
    return { label: 'Build recurring B2B accounts', detail: 'Create packages and outreach for repeat law firm, healthcare, HR, and title clients.' };
  }
  return { label: 'Refine and scale', detail: 'Use the roadmap to balance RON, premium services, and recurring accounts.' };
}

function blockers() {
  const items = [];
  if (!state.checklist.courseCompleted) items.push('Course still in progress');
  if ((state.bestQuizScore || 0) < PASS_THRESHOLD) items.push(`Best practice score is ${state.bestQuizScore ?? 0}%, still below the 80% pass target`);
  if (!state.checklist.bciFresh) items.push('BCI freshness not confirmed');
  if (state.checklist.commissionApproved && !state.checklist.oathCompleted) items.push('Commission approved, but oath is still pending');
  if (state.checklist.commissionApproved && !state.checklist.sealOrdered) items.push('Commission approved, but seal not ordered/received');
  return items;
}

function roadmapSummaryHtml() {
  const phase = dominantRoadmapPhase();
  const counts = roadmapCounts();
  return `
    <article class="card">
      <p class="eyebrow">Ohio Notary Business Roadmap</p>
      <h3>${escapeHtml(phase?.label || 'Roadmap not initialized')}</h3>
      <p class="muted">${escapeHtml(phase?.goal || 'Track your business build-out phase by phase.')}</p>
      <div class="roadmap-stats">
        ${Object.entries(counts)
          .map(([status, count]) => `<span class="status-chip ${statusMeta(status).chipClass}">${statusMeta(status).label}: ${count}</span>`)
          .join('')}
      </div>
      <div class="action-row" style="margin-top:14px;">
        <button class="secondary-button" id="open-roadmap-from-dashboard">Open roadmap</button>
      </div>
    </article>
  `;
}

function renderNavigation() {
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === state.activeSection);
    button.onclick = () => setActiveSection(button.dataset.section);
  });
  document.querySelectorAll('.page-section').forEach((section) => {
    section.classList.toggle('active', section.id === state.activeSection);
  });
}

function setActiveSection(section) {
  if (!SECTION_ORDER.includes(section)) return;
  state.activeSection = section;
  saveState();
  renderApp();
}

function updateRoadmapPhase(phaseId, field, value) {
  state.roadmapProgress[phaseId] = {
    ...roadmapPhaseState(phaseId),
    [field]: value,
    touchedAt: new Date().toISOString(),
  };
  saveState();
}

function switchModule(moduleId, nextSection = 'modules') {
  if (!moduleId) return;
  state.activeModuleId = moduleId;
  state.flashcardIndex = 0;
  state.flashcardShowAnswer = false;
  saveState();
  setActiveSection(nextSection);
}

function renderDashboard() {
  const latest = latestQuiz();
  const weak = weakTopics();
  const section = document.getElementById('dashboard');
  const progress = studyProgress();
  const blockerList = blockers();
  const today = todayStudyAction();
  const business = businessNextAction();
  const dominantPhase = dominantRoadmapPhase();
  const dismissed = state.todaySessionDismissedDate === dayKey();

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Start Here</p>
        <h2>Pass the course, clear the licensing gates, then launch the business by roadmap.</h2>
        <p class="muted">This Mac workspace keeps the packet, quiz loop, checklist, roadmap, and operations links in one focused place.</p>
      </div>
      <div class="action-row">
        <button class="button" id="resume-study-btn">Resume packet</button>
        <button class="secondary-button" id="start-full-quiz-btn">Start 30-question quiz</button>
        <button class="ghost-button" id="dashboard-print-cram-btn">Print cram sheet</button>
      </div>
    </div>

    ${dismissed ? `
      <article class="card" style="margin-bottom:18px;">
        <p class="eyebrow">Today’s study session</p>
        <h3>Dismissed for today</h3>
        <p class="muted">Reopen it if you want to reset the focus block and keep working inside the packet + quiz loop.</p>
        <div class="action-row">
          <button class="secondary-button" id="reopen-today-widget-btn">Reopen today widget</button>
        </div>
      </article>
    ` : `
      <div class="today-grid" style="margin-bottom:18px;">
        <article class="today-study-card">
          <p class="eyebrow">Today’s study session</p>
          <h3>${escapeHtml(today.title)}</h3>
          <p class="muted">${escapeHtml(today.detail)}</p>
          <div class="toolbar-pill-row">
            <span class="toolbar-chip">Resume page ${state.lastPacketPage}</span>
            <span class="toolbar-chip">Weakest topic: ${escapeHtml(today.weakestTopic)}</span>
            <span class="toolbar-chip">Best score: ${state.bestQuizScore != null ? `${state.bestQuizScore}% / ${PASS_THRESHOLD}%` : `— / ${PASS_THRESHOLD}%`}</span>
          </div>
          <div class="card" style="margin-top:14px; background:var(--surface-wash); box-shadow:none;">
            <p class="eyebrow">Recommended quiz mode</p>
            <p>${escapeHtml(recommendationQuizLabel())}</p>
          </div>
          <label for="today-session-notes" style="margin-top:14px;">Today’s focus notes</label>
          <textarea id="today-session-notes" class="today-note" placeholder="What do you want to lock in today?">${escapeHtml(state.todaySessionNotes)}</textarea>
          <div class="today-session-actions" style="margin-top:14px;">
            <button class="button" id="today-mark-complete-btn">${state.todaySessionComplete ? 'Marked complete' : 'Mark today complete'}</button>
            <button class="secondary-button" id="today-open-quiz-btn">Run recommended quiz</button>
            <button class="ghost-button" id="dismiss-today-widget-btn">Dismiss for today</button>
          </div>
        </article>

        <article class="business-next-card">
          <p class="eyebrow">Business next action</p>
          <h3>${escapeHtml(business.label)}</h3>
          <p class="muted">${escapeHtml(business.detail)}</p>
          <div class="toolbar-pill-row" style="margin-top:10px;">
            <span class="toolbar-chip">Active phase: ${escapeHtml(dominantPhase?.label || 'Foundation')}</span>
            <span class="toolbar-chip">Checklist completion: ${checklistCompletion().completed}/${checklistCompletion().total}</span>
          </div>
          <div class="action-row" style="margin-top:14px;">
            <button class="secondary-button" id="open-checklist-btn">Open checklist</button>
            <button class="ghost-button" id="open-roadmap-btn">Open roadmap</button>
          </div>
        </article>
      </div>
    `}

    <div class="info-banner priority-card">
      <p class="eyebrow">Overall prep + launch progress</p>
      <h3>${studyProgress()}% complete</h3>
      <div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p class="muted">Use the study loop first. Then let the checklist and roadmap drive the exact business step that follows.</p>
    </div>

    <div class="metrics-grid">
      <article class="mini-card">
        <p class="eyebrow">Best quiz score</p>
        <div class="stat-value ${scoreClass(state.bestQuizScore || 0)}">${state.bestQuizScore != null ? `${state.bestQuizScore}%` : '—'}</div>
        <p class="muted">Pass target: ${PASS_THRESHOLD}%</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Latest quiz</p>
        <div class="stat-value ${scoreClass(latest?.score || 0)}">${latest ? `${latest.score}%` : '—'}</div>
        <p class="muted">${escapeHtml(latest?.label || 'No attempts yet.')}</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Packet progress</p>
        <div class="stat-value">${state.lastPacketPage}/${content.metadata?.pageCount || 149}</div>
        <p class="muted">Resume page ${state.lastPacketPage}</p>
      </article>
    </div>

    <div class="grid-2" style="margin-top:18px;">
      <article class="card">
        <p class="eyebrow">Current blockers</p>
        ${blockerList.length ? `<ul class="cram-list">${blockerList.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : '<p>No blockers right now. Keep compounding reps.</p>'}
      </article>
      <article class="card">
        <p class="eyebrow">Weak topics</p>
        ${weak.length ? `<ul class="cram-list">${weak.map((entry) => `<li><strong>${escapeHtml(entry.module?.title || 'Module')}</strong> — missed ${entry.missCount} time(s)</li>`).join('')}</ul>` : '<p>No weak-topic pattern yet. Run a quiz to generate focus data.</p>'}
      </article>
    </div>

    <div class="grid-2" style="margin-top:18px;">
      ${roadmapSummaryHtml()}
      <article class="card">
        <p class="eyebrow">Must memorize</p>
        <ul class="cram-list">
          <li>30 questions</li>
          <li>1 hour</li>
          <li>80% to pass</li>
          <li>30-day retake window</li>
          <li>Traditional acts: max $5</li>
          <li>RON: max $30 + max $10 tech fee</li>
        </ul>
      </article>
    </div>
  `;

  document.getElementById('resume-study-btn')?.addEventListener('click', () => setActiveSection('packet'));
  document.getElementById('start-full-quiz-btn')?.addEventListener('click', () => startQuiz('all', 30, '30-question timed quiz'));
  document.getElementById('dashboard-print-cram-btn')?.addEventListener('click', handlePrintCram);
  document.getElementById('open-checklist-btn')?.addEventListener('click', () => setActiveSection('checklist'));
  document.getElementById('open-roadmap-btn')?.addEventListener('click', () => setActiveSection('roadmap'));
  document.getElementById('open-roadmap-from-dashboard')?.addEventListener('click', () => setActiveSection('roadmap'));
  document.getElementById('reopen-today-widget-btn')?.addEventListener('click', () => {
    state.todaySessionDismissedDate = '';
    saveState();
    renderApp();
  });
  document.getElementById('dismiss-today-widget-btn')?.addEventListener('click', () => {
    state.todaySessionDismissedDate = dayKey();
    saveState();
    renderApp();
  });
  document.getElementById('today-mark-complete-btn')?.addEventListener('click', () => {
    state.todaySessionComplete = !state.todaySessionComplete;
    saveState();
    renderApp();
  });
  document.getElementById('today-open-quiz-btn')?.addEventListener('click', () => {
    const weakEntry = weakTopics()[0];
    if (!state.checklist.courseCompleted || (state.bestQuizScore || 0) < PASS_THRESHOLD - 10) {
      startQuiz('active-module', 10, '10-question module drill');
      return;
    }
    if (weakEntry?.module?.id) {
      startQuiz(`module:${weakEntry.module.id}`, 10, `Weak-topic drill — ${weakEntry.module.title}`);
      return;
    }
    startQuiz('all', 30, '30-question timed quiz');
  });
  document.getElementById('today-session-notes')?.addEventListener('input', (event) => {
    state.todaySessionNotes = event.target.value;
    saveState();
  });
}

function renderPacket() {
  const pageModules = packetModulesForPage(state.lastPacketPage);
  const section = document.getElementById('packet');
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Course packet</p>
        <h2>Resume your paid packet where you left off.</h2>
        <p class="muted">Keep the packet moving. Use the page box below to track your place and jump back into the PDF.</p>
      </div>
      <div class="action-row packet-actions">
        <a class="button" href="${DEFAULT_PDF}#page=${state.lastPacketPage}" target="_blank" rel="noreferrer">Open PDF in new tab</a>
        <a class="secondary-button" href="${DEFAULT_PDF}" download>Download local copy</a>
      </div>
    </div>

    <div class="grid-2">
      <article class="card">
        <p class="eyebrow">Packet control</p>
        <label for="packet-page-input">Current page</label>
        <input id="packet-page-input" type="number" min="1" max="${content.metadata?.pageCount || 149}" value="${state.lastPacketPage}" />
        <div class="action-row" style="margin-top:14px;">
          <button class="button" id="save-packet-page-btn">Save page</button>
          <button class="secondary-button" id="packet-prev-page-btn">-5 pages</button>
          <button class="secondary-button" id="packet-next-page-btn">+5 pages</button>
          <button class="ghost-button" id="packet-mark-course-btn">${state.checklist.courseCompleted ? 'Course marked complete' : 'Mark course complete'}</button>
        </div>
        <div class="toolbar-pill-row" style="margin-top:14px;">
          <span class="toolbar-chip">Source pages: 1-${content.metadata?.pageCount || 149}</span>
          <span class="toolbar-chip">Resume page ${state.lastPacketPage}</span>
        </div>
      </article>

      <article class="card">
        <p class="eyebrow">Page-linked study modules</p>
        ${pageModules.length ? `
          <div class="tag-row">
            ${pageModules
              .map((module) => `<button class="ghost-button page-module-link" data-module-id="${escapeHtml(module.id)}">${escapeHtml(module.title)}</button>`)
              .join('')}
          </div>
          <p class="muted" style="margin-top:14px;">Use these modules to jump into outline, flashcards, or quiz work tied to this page range.</p>
        ` : '<p>No module boundary matched that page. Stay in the packet and keep moving.</p>'}
      </article>
    </div>

    <div class="card" style="margin-top:18px; padding:0; overflow:hidden;">
      <iframe class="packet-frame" title="Ohio Notary Course Packet" src="${DEFAULT_PDF}#page=${state.lastPacketPage}"></iframe>
    </div>
  `;

  const savePage = (value) => {
    const total = Number(content.metadata?.pageCount || 149);
    state.lastPacketPage = Math.min(total, Math.max(1, Number(value || 1)));
    saveState();
    renderApp();
  };

  document.getElementById('save-packet-page-btn')?.addEventListener('click', () => savePage(document.getElementById('packet-page-input').value));
  document.getElementById('packet-prev-page-btn')?.addEventListener('click', () => savePage(state.lastPacketPage - 5));
  document.getElementById('packet-next-page-btn')?.addEventListener('click', () => savePage(state.lastPacketPage + 5));
  document.getElementById('packet-mark-course-btn')?.addEventListener('click', () => {
    state.checklist.courseCompleted = true;
    saveState();
    renderApp();
  });
  document.getElementById('packet-page-input')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') savePage(event.target.value);
  });
  document.querySelectorAll('.page-module-link').forEach((button) => {
    button.addEventListener('click', () => switchModule(button.dataset.moduleId, 'modules'));
  });
}

function renderModules() {
  const activeModule = moduleById(state.activeModuleId);
  const section = document.getElementById('modules');

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Study modules</p>
        <h2>Use the packet as source-of-truth, then study by tested topic.</h2>
        <p class="muted">Each module keeps the exam-critical rules, common mistakes, source pages, and quick routes to flashcards or a drill quiz.</p>
      </div>
      <div class="action-row">
        <button class="button" id="module-flashcards-btn">Flashcards for this module</button>
        <button class="secondary-button" id="module-quiz-btn">10-question module quiz</button>
      </div>
    </div>

    ${activeModule ? `
      <article class="card" style="margin-bottom:18px;">
        <p class="eyebrow">Current module</p>
        <h3>${escapeHtml(activeModule.title)}</h3>
        <p>${escapeHtml(activeModule.summary)}</p>
        <div class="module-meta">
          <span class="toolbar-chip">Pages ${activeModule.sourcePageStart}-${activeModule.sourcePageEnd}</span>
          <span class="toolbar-chip">Exam weight: ${escapeHtml(activeModule.examWeight || 'Core')}</span>
          <span class="toolbar-chip">Flashcards: ${(activeModule.flashcards || []).length}</span>
          <span class="toolbar-chip">Questions: ${(activeModule.questions || []).length}</span>
        </div>
        <div class="module-columns" style="margin-top:16px;">
          <div>
            <p class="eyebrow">High-priority rules</p>
            <ul class="rule-list">
              ${(activeModule.rules || [])
                .map((rule) => `<li><strong>${escapeHtml(rule.ruleText)}</strong><div class="rule-page">Pages ${escapeHtml(rule.sourcePages || '')}</div></li>`)
                .join('')}
            </ul>
          </div>
          <div>
            <p class="eyebrow">Common mistakes</p>
            <ul class="mistake-list">
              ${(activeModule.commonMistakes || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
            <p class="eyebrow" style="margin-top:18px;">Key terms</p>
            <div class="tag-row">
              ${(activeModule.keyTerms || []).map((term) => `<span class="tag">${escapeHtml(term)}</span>`).join('')}
            </div>
          </div>
        </div>
        <label for="module-note" style="margin-top:18px;">Module notes</label>
        <textarea id="module-note" placeholder="Capture what tends to trip you up in this module.">${escapeHtml(state.noteByModule[activeModule.id] || '')}</textarea>
      </article>
    ` : ''}

    <div class="module-grid">
      ${content.modules
        .map((module) => `
          <article class="module-card ${module.id === state.activeModuleId ? 'priority-card' : ''}">
            <p class="eyebrow">Pages ${module.sourcePageStart}-${module.sourcePageEnd}</p>
            <h3>${escapeHtml(module.title)}</h3>
            <p class="muted">${escapeHtml(module.summary)}</p>
            <div class="tag-row" style="margin:12px 0;">
              <span class="tag">${(module.questions || []).length} questions</span>
              <span class="tag">${(module.flashcards || []).length} flashcards</span>
            </div>
            <details>
              <summary>Show checklist bullets</summary>
              <ul class="check-list" style="margin-top:12px;">
                ${(module.checklistBullets || []).map((bullet) => `<li>${escapeHtml(bullet)}</li>`).join('')}
              </ul>
            </details>
            <div class="action-row" style="margin-top:14px;">
              <button class="secondary-button module-open-btn" data-module-id="${escapeHtml(module.id)}">Open module</button>
              <button class="ghost-button module-drill-btn" data-module-id="${escapeHtml(module.id)}">Drill quiz</button>
            </div>
          </article>
        `)
        .join('')}
    </div>
  `;

  document.getElementById('module-flashcards-btn')?.addEventListener('click', () => setActiveSection('flashcards'));
  document.getElementById('module-quiz-btn')?.addEventListener('click', () => startQuiz(`module:${state.activeModuleId}`, 10, `10-question module drill — ${activeModule?.title || 'Current module'}`));
  document.getElementById('module-note')?.addEventListener('input', (event) => {
    state.noteByModule[state.activeModuleId] = event.target.value;
    saveState();
  });
  document.querySelectorAll('.module-open-btn').forEach((button) => {
    button.addEventListener('click', () => switchModule(button.dataset.moduleId, 'modules'));
  });
  document.querySelectorAll('.module-drill-btn').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeModuleId = button.dataset.moduleId;
      saveState();
      startQuiz(`module:${button.dataset.moduleId}`, 10, `10-question module drill — ${moduleById(button.dataset.moduleId)?.title || 'Module'}`);
    });
  });
}

function flashcardPool() {
  if (state.flashcardScope === 'all') return allFlashcards();
  return moduleById(state.activeModuleId)?.flashcards?.map((card) => ({ ...card, moduleId: state.activeModuleId, moduleTitle: moduleById(state.activeModuleId)?.title })) || [];
}

function currentFlashcard() {
  const cards = flashcardPool();
  if (!cards.length) return null;
  const index = Math.min(cards.length - 1, Math.max(0, state.flashcardIndex));
  state.flashcardIndex = index;
  return cards[index];
}

function setFlashcardScope(scope) {
  state.flashcardScope = scope;
  state.flashcardIndex = 0;
  state.flashcardShowAnswer = false;
  saveState();
  renderApp();
}

function flipFlashcard() {
  if (state.activeSection !== 'flashcards') return;
  state.flashcardShowAnswer = !state.flashcardShowAnswer;
  saveState();
  renderApp();
}

function changeFlashcard(direction) {
  if (state.activeSection !== 'flashcards') return;
  const cards = flashcardPool();
  if (!cards.length) return;
  state.flashcardIndex = (state.flashcardIndex + direction + cards.length) % cards.length;
  state.flashcardShowAnswer = false;
  saveState();
  renderApp();
}

function renderFlashcards() {
  const activeModule = moduleById(state.activeModuleId);
  const cards = flashcardPool();
  const card = currentFlashcard();
  const section = document.getElementById('flashcards');
  const rating = card ? state.flashcardRatings[card.id] : null;

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Flashcards</p>
        <h2>Use quick reps to lock in rule language and distinctions.</h2>
        <p class="muted">Space flips the card. Arrow keys move card to card when this section is active.</p>
      </div>
      <div class="action-row">
        <button class="toolbar-button" id="flashcards-scope-module">Current module</button>
        <button class="toolbar-button" id="flashcards-scope-all">All cards</button>
      </div>
    </div>

    <div class="flash-grid">
      <article class="card flashcard">
        <p class="eyebrow">Deck</p>
        <h3>${state.flashcardScope === 'all' ? 'All flashcards' : escapeHtml(activeModule?.title || 'Current module')}</h3>
        <div class="toolbar-pill-row">
          <span class="toolbar-chip">Card ${cards.length ? state.flashcardIndex + 1 : 0} of ${cards.length}</span>
          <span class="toolbar-chip">${card ? escapeHtml(card.moduleTitle || activeModule?.title || '') : 'No card loaded'}</span>
          ${rating ? `<span class="toolbar-chip">Rating: ${escapeHtml(rating)}</span>` : ''}
        </div>
        ${card ? `
          <div class="flashcard-face">
            <p class="flashcard-label">Prompt</p>
            <h3>${escapeHtml(card.prompt)}</h3>
            ${state.flashcardShowAnswer ? `<hr /><p class="flashcard-label">Answer</p><p>${escapeHtml(card.answer)}</p><p class="muted small">Source pages: ${escapeHtml(card.sourcePages || '')}</p>` : '<p class="muted">Press Space or click Flip to reveal the answer.</p>'}
          </div>
          <div class="action-row">
            <button class="secondary-button" id="flashcard-prev-btn">Previous</button>
            <button class="button" id="flashcard-flip-btn">${state.flashcardShowAnswer ? 'Hide answer' : 'Flip card'}</button>
            <button class="secondary-button" id="flashcard-next-btn">Next</button>
          </div>
          <div class="action-row" style="margin-top:12px;">
            <button class="ghost-button flashcard-rate-btn" data-rating="easy">Easy</button>
            <button class="ghost-button flashcard-rate-btn" data-rating="hard">Hard</button>
            <button class="ghost-button flashcard-rate-btn" data-rating="revisit">Revisit</button>
          </div>
        ` : '<p>No flashcards available yet.</p>'}
      </article>

      <article class="card">
        <p class="eyebrow">Card controls</p>
        <ul class="cram-list">
          <li>Use module cards when you want concentrated repetition.</li>
          <li>Use all cards when you want mixed recall under fatigue.</li>
          <li>Mark hard or revisit when a card still causes hesitation.</li>
        </ul>
        <div class="toolbar-pill-row">
          ${['easy', 'hard', 'revisit'].map((label) => `<span class="toolbar-chip">${label}: ${Object.values(state.flashcardRatings).filter((value) => value === label).length}</span>`).join('')}
        </div>
      </article>
    </div>
  `;

  document.getElementById('flashcards-scope-module')?.addEventListener('click', () => setFlashcardScope('module'));
  document.getElementById('flashcards-scope-all')?.addEventListener('click', () => setFlashcardScope('all'));
  document.getElementById('flashcard-prev-btn')?.addEventListener('click', () => changeFlashcard(-1));
  document.getElementById('flashcard-next-btn')?.addEventListener('click', () => changeFlashcard(1));
  document.getElementById('flashcard-flip-btn')?.addEventListener('click', flipFlashcard);
  document.querySelectorAll('.flashcard-rate-btn').forEach((button) => {
    button.addEventListener('click', () => {
      if (!card) return;
      state.flashcardRatings[card.id] = button.dataset.rating;
      saveState();
      renderApp();
    });
  });
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function questionPoolForScope(scope) {
  if (scope === 'all') return allQuestions();
  if (scope === 'active-module') return allQuestions().filter((question) => question.moduleId === state.activeModuleId);
  if (scope === 'weakest') {
    const weak = weakTopics()[0]?.module?.id || state.activeModuleId;
    return allQuestions().filter((question) => question.moduleId === weak);
  }
  if (scope.startsWith('module:')) {
    const moduleId = scope.split(':')[1];
    return allQuestions().filter((question) => question.moduleId === moduleId);
  }
  return allQuestions();
}

function startQuiz(scope, count, label) {
  const pool = shuffle(questionPoolForScope(scope));
  const questions = pool.slice(0, Math.min(count, pool.length)).map((question) => ({ ...question, selectedChoice: '' }));
  currentQuiz = {
    scope,
    label,
    questions,
    submitted: false,
    score: null,
    incorrect: [],
    startedAt: new Date().toISOString(),
  };
  state.activeSection = 'quiz';
  saveState();
  renderApp();
}

function submitQuiz() {
  if (!currentQuiz) return;
  const total = currentQuiz.questions.length || 1;
  const incorrect = [];
  let correctCount = 0;
  currentQuiz.questions.forEach((question) => {
    if (question.selectedChoice === question.correctChoice) {
      correctCount += 1;
    } else {
      incorrect.push(question.moduleId);
    }
  });
  const score = Math.round((correctCount / total) * 100);
  currentQuiz.submitted = true;
  currentQuiz.score = score;
  currentQuiz.incorrect = incorrect;
  currentQuiz.finishedAt = new Date().toISOString();

  const historyEntry = {
    score,
    label: currentQuiz.label,
    startedAt: currentQuiz.startedAt,
    finishedAt: currentQuiz.finishedAt,
    incorrect,
  };
  state.latestQuizScore = score;
  state.bestQuizScore = Math.max(state.bestQuizScore || 0, score);
  state.quizHistory = [historyEntry, ...state.quizHistory].slice(0, 12);
  if (score >= PASS_THRESHOLD) state.checklist.examPassed = true;
  saveState();
  renderApp();
}

function renderQuiz() {
  const section = document.getElementById('quiz');
  const weak = weakTopics()[0];

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Practice quiz</p>
        <h2>Use quizzes to get stable, not lucky.</h2>
        <p class="muted">Mix full 30-question runs with targeted module drills. Use incorrect answers to decide what to revisit next.</p>
      </div>
      <div class="action-row">
        <button class="button" id="quiz-start-full-btn">30-question timed quiz</button>
        <button class="secondary-button" id="quiz-start-module-btn">10-question module drill</button>
        <button class="ghost-button" id="quiz-start-weak-btn">Weak-topic drill</button>
      </div>
    </div>

    <div class="grid-3" style="margin-bottom:18px;">
      <article class="mini-card">
        <p class="eyebrow">Best score</p>
        <div class="stat-value ${scoreClass(state.bestQuizScore || 0)}">${state.bestQuizScore != null ? `${state.bestQuizScore}%` : '—'}</div>
        <p class="muted">Pass target: ${PASS_THRESHOLD}%</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Latest score</p>
        <div class="stat-value ${scoreClass(state.latestQuizScore || 0)}">${state.latestQuizScore != null ? `${state.latestQuizScore}%` : '—'}</div>
        <p class="muted">${escapeHtml(latestQuiz()?.label || 'No attempt yet')}</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Weakest topic</p>
        <div class="stat-value" style="font-size:1.15rem;">${escapeHtml(weak?.module?.title || 'None yet')}</div>
        <p class="muted">${weak ? `${weak.missCount} misses logged` : 'Take a quiz to create focus data.'}</p>
      </article>
    </div>

    ${currentQuiz ? renderActiveQuizHtml() : `
      <div class="quiz-grid">
        <article class="card">
          <p class="eyebrow">Exam rhythm</p>
          <ul class="cram-list">
            <li>Use 30-question runs when you want true exam simulation.</li>
            <li>Use 10-question drills when your weak topic is obvious.</li>
            <li>Review explanations immediately after submission.</li>
          </ul>
        </article>
        <article class="card">
          <p class="eyebrow">Recommended next quiz</p>
          <h3>${escapeHtml(recommendationQuizLabel())}</h3>
          <p class="muted">Active module: ${escapeHtml(moduleById(state.activeModuleId)?.title || 'None')}</p>
        </article>
        <article class="card">
          <p class="eyebrow">Recent history</p>
          ${state.quizHistory.length ? `<ul class="cram-list">${state.quizHistory.slice(0, 5).map((attempt) => `<li><strong>${attempt.score}%</strong> — ${escapeHtml(attempt.label)}</li>`).join('')}</ul>` : '<p>No history yet. Start a quiz.</p>'}
        </article>
      </div>
    `}
  `;

  document.getElementById('quiz-start-full-btn')?.addEventListener('click', () => startQuiz('all', 30, '30-question timed quiz'));
  document.getElementById('quiz-start-module-btn')?.addEventListener('click', () => startQuiz('active-module', 10, `10-question module drill — ${moduleById(state.activeModuleId)?.title || 'Current module'}`));
  document.getElementById('quiz-start-weak-btn')?.addEventListener('click', () => {
    const weakEntry = weakTopics()[0];
    if (weakEntry?.module?.id) {
      startQuiz(`module:${weakEntry.module.id}`, 10, `Weak-topic drill — ${weakEntry.module.title}`);
    } else {
      startQuiz('active-module', 10, `10-question module drill — ${moduleById(state.activeModuleId)?.title || 'Current module'}`);
    }
  });

  document.querySelectorAll('.choice-button').forEach((button) => {
    button.addEventListener('click', () => {
      if (!currentQuiz || currentQuiz.submitted) return;
      const questionIndex = Number(button.dataset.questionIndex);
      const choice = button.dataset.choice;
      currentQuiz.questions[questionIndex].selectedChoice = choice;
      renderApp();
    });
  });

  document.getElementById('submit-quiz-btn')?.addEventListener('click', submitQuiz);
  document.getElementById('quiz-reset-btn')?.addEventListener('click', () => {
    currentQuiz = null;
    renderApp();
  });
  document.getElementById('quiz-review-module-btn')?.addEventListener('click', () => {
    const firstMiss = currentQuiz?.incorrect?.[0];
    if (firstMiss) {
      switchModule(firstMiss, 'modules');
    } else {
      setActiveSection('modules');
    }
  });
}

function renderActiveQuizHtml() {
  if (!currentQuiz) return '';
  return `
    <article class="card">
      <p class="eyebrow">Current quiz</p>
      <h3>${escapeHtml(currentQuiz.label)}</h3>
      <p class="muted">${currentQuiz.questions.length} questions · Submit when finished. Review the explanations before moving on.</p>
      <div class="action-row" style="margin-bottom:16px;">
        ${!currentQuiz.submitted ? '<button class="button" id="submit-quiz-btn">Submit quiz</button>' : ''}
        <button class="secondary-button" id="quiz-reset-btn">Start another quiz</button>
        ${currentQuiz.submitted ? '<button class="ghost-button" id="quiz-review-module-btn">Review missed module</button>' : ''}
      </div>
      ${currentQuiz.submitted ? `
        <article class="quiz-result priority-card" style="margin-bottom:16px;">
          <p class="eyebrow">Result</p>
          <h3 class="${scoreClass(currentQuiz.score || 0)}">${currentQuiz.score}%</h3>
          <p>${currentQuiz.score >= PASS_THRESHOLD ? 'Passing score reached. Keep stacking clean repetitions.' : 'Below passing. Review the misses and rerun the weak topics.'}</p>
        </article>
      ` : ''}
      ${currentQuiz.questions
        .map((question, index) => {
          return `
            <article class="quiz-question">
              <p class="eyebrow">Question ${index + 1}</p>
              <h3>${escapeHtml(question.question)}</h3>
              <div style="margin-top:12px;">
                ${question.choices
                  .map((choice, choiceIndex) => {
                    const letter = LETTERS[choiceIndex];
                    const isSelected = question.selectedChoice === letter;
                    const isCorrect = currentQuiz.submitted && question.correctChoice === letter;
                    const isIncorrect = currentQuiz.submitted && isSelected && question.correctChoice !== letter;
                    const buttonClass = ['choice-button', isSelected ? 'selected' : '', isCorrect ? 'correct' : '', isIncorrect ? 'incorrect' : ''].join(' ').trim();
                    return `<button class="${buttonClass}" data-question-index="${index}" data-choice="${letter}"><strong>${letter}.</strong> ${escapeHtml(choice)}</button>`;
                  })
                  .join('')}
              </div>
              ${currentQuiz.submitted ? `
                <div class="card" style="margin-top:14px; background:var(--surface-wash); box-shadow:none;">
                  <p class="eyebrow">Explanation</p>
                  <p>${escapeHtml(question.explanation)}</p>
                  <p class="muted small">Correct answer: ${escapeHtml(question.correctChoice)} · Source pages: ${escapeHtml(question.sourcePages || '')}</p>
                </div>
              ` : ''}
            </article>
          `;
        })
        .join('')}
    </article>
  `;
}

function parseMarkdownSections(markdown) {
  const sections = [];
  let current = null;
  (markdown || '').split(/\r?\n/).forEach((rawLine) => {
    const line = rawLine.trim();
    if (!line) return;
    if (line.startsWith('# ')) return;
    if (line.startsWith('## ')) {
      current = { title: line.replace(/^##\s+/, ''), lines: [] };
      sections.push(current);
      return;
    }
    if (!current) {
      current = { title: 'Overview', lines: [] };
      sections.push(current);
    }
    current.lines.push(line);
  });
  return sections;
}

function markdownLinesToHtml(lines) {
  let html = '';
  let listType = '';
  const closeList = () => {
    if (listType) {
      html += `</${listType}>`;
      listType = '';
    }
  };

  lines.forEach((line) => {
    if (/^-\s+/.test(line)) {
      if (listType !== 'ul') {
        closeList();
        listType = 'ul';
        html += '<ul class="cram-list">';
      }
      html += `<li>${escapeHtml(line.replace(/^-\s+/, ''))}</li>`;
      return;
    }
    if (/^\d+\.\s+/.test(line)) {
      if (listType !== 'ol') {
        closeList();
        listType = 'ol';
        html += '<ol class="ordered-list">';
      }
      html += `<li>${escapeHtml(line.replace(/^\d+\.\s+/, ''))}</li>`;
      return;
    }
    closeList();
    html += `<p>${escapeHtml(line)}</p>`;
  });
  closeList();
  return html;
}

function renderCram() {
  const section = document.getElementById('cram');
  const cram = content.cramSheets?.[0];
  const sections = parseMarkdownSections(cram?.contentMarkdown || '');

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Final cram</p>
        <h2>Printable final review sheet for the Ohio notary course.</h2>
        <p class="muted">This is the compressed review pass: exam specs, fee caps, ID rules, acknowledgments vs jurats, title warnings, RON basics, prohibited acts, and the 2025 updates.</p>
      </div>
      <div class="action-row">
        <button class="button" id="cram-print-btn">Print cram sheet</button>
        <button class="secondary-button" id="cram-open-quiz-btn">Run full quiz</button>
      </div>
    </div>

    <div class="print-only print-card" style="margin-bottom:18px;">
      <p class="print-header-label">Ohio Notary OS</p>
      <h3>${escapeHtml(cram?.title || 'Ohio Notary Final Cram Sheet')}</h3>
      <p>Source packet: ${escapeHtml(content.metadata?.sourceFileName || 'Study Guide with PowerPoint Handouts-2.pdf')} · Packet date seen: ${escapeHtml(content.metadata?.packetDate || '4/2/2025')} · Printed: ${escapeHtml(new Date().toLocaleDateString())}</p>
    </div>

    <div class="grid-2" style="margin-bottom:18px;">
      <article class="print-card">
        <p class="eyebrow">Do not forget</p>
        <ul class="cram-list">
          <li>Personal appearance still controls traditional acts.</li>
          <li>ID must be current or expired less than 3 years.</li>
          <li>A jurat requires an oath or affirmation.</li>
          <li>Never notarize blank or incomplete title sections.</li>
          <li>RON requires separate authorization, journal, and recording.</li>
          <li>Traditional act fee cap: $5 · RON: $30 + max $10 tech fee.</li>
        </ul>
      </article>
      <article class="print-card">
        <p class="eyebrow">Exam setup</p>
        <ul class="cram-list">
          <li>30 questions</li>
          <li>1 hour</li>
          <li>80% to pass</li>
          <li>30-day retake window</li>
          <li>Keep reviewing until the passing score feels repeatable.</li>
        </ul>
      </article>
    </div>

    <div class="module-grid">
      ${sections
        .map(
          (block) => `
            <article class="cram-block">
              <p class="eyebrow">Cram block</p>
              <h3>${escapeHtml(block.title)}</h3>
              ${markdownLinesToHtml(block.lines)}
            </article>
          `
        )
        .join('')}
    </div>
  `;

  document.getElementById('cram-print-btn')?.addEventListener('click', handlePrintCram);
  document.getElementById('cram-open-quiz-btn')?.addEventListener('click', () => startQuiz('all', 30, '30-question timed quiz'));
}

function renderChecklist() {
  const section = document.getElementById('checklist');
  const grouped = checklistItems.reduce((acc, item) => {
    acc[item.group] = acc[item.group] || [];
    acc[item.group].push(item);
    return acc;
  }, {});

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Licensing checklist</p>
        <h2>Move from paid course to lawful revenue in the right order.</h2>
        <p class="muted">This checklist is the bridge between passing the course and building a clean Ohio notary business.</p>
      </div>
      <div class="action-row">
        <button class="button" id="checklist-open-roadmap-btn">Open roadmap</button>
      </div>
    </div>

    <div class="info-banner priority-card">
      <p class="eyebrow">Checklist completion</p>
      <h3>${checklistCompletion().completed}/${checklistCompletion().total} complete</h3>
      <div class="progress-track"><div class="progress-bar" style="width:${checklistCompletion().percent}%"></div></div>
      <p class="muted">Use this checklist for gating. Use the roadmap for business sequencing.</p>
    </div>

    ${Object.entries(grouped)
      .map(
        ([group, items]) => `
          <div class="page-header" style="margin:18px 0 14px;">
            <div>
              <p class="eyebrow">${escapeHtml(group)}</p>
              <h2 style="font-size:1.9rem;">${escapeHtml(group)} checklist</h2>
            </div>
          </div>
          <div class="checklist-grid">
            ${items
              .map(
                (item) => `
                  <label class="checklist-item">
                    <input type="checkbox" data-checklist-key="${escapeHtml(item.key)}" ${state.checklist[item.key] ? 'checked' : ''} />
                    <span>
                      <h3>${escapeHtml(item.label)}</h3>
                      <p class="muted">${escapeHtml(item.description)}</p>
                    </span>
                  </label>
                `
              )
              .join('')}
          </div>
        `
      )
      .join('')}
  `;

  document.getElementById('checklist-open-roadmap-btn')?.addEventListener('click', () => setActiveSection('roadmap'));
  document.querySelectorAll('[data-checklist-key]').forEach((input) => {
    input.addEventListener('change', () => {
      state.checklist[input.dataset.checklistKey] = input.checked;
      saveState();
      renderApp();
    });
  });
}

function renderRoadmap() {
  const section = document.getElementById('roadmap');
  const counts = roadmapCounts();
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Roadmap</p>
        <h2>${escapeHtml(roadmap.title || 'Ohio Notary Business Roadmap')}</h2>
        <p class="muted">Foundation → mobile → niche → RON → premium services → recurring accounts. Track status, notes, and your next step phase by phase.</p>
      </div>
      <div class="roadmap-controls">
        ${Object.entries(counts).map(([status, count]) => `<span class="status-chip ${statusMeta(status).chipClass}">${statusMeta(status).label}: ${count}</span>`).join('')}
      </div>
    </div>

    <div class="roadmap-grid">
      ${(roadmap.phases || [])
        .map((phase) => {
          const saved = roadmapPhaseState(phase.id);
          const meta = statusMeta(saved.status);
          return `
            <article class="phase-card">
              <div class="phase-meta">
                <div>
                  <p class="eyebrow">Roadmap phase</p>
                  <h3>${escapeHtml(phase.label)}</h3>
                </div>
                <span class="status-chip ${meta.chipClass}">${meta.label}</span>
              </div>
              <p><strong>Goal:</strong> ${escapeHtml(phase.goal)}</p>
              <p><strong>Primary revenue:</strong> ${escapeHtml((phase.primaryRevenue || []).join(' · '))}</p>
              <p><strong>Best clients:</strong> ${escapeHtml((phase.bestClients || []).join(' · '))}</p>
              <p><strong>Primary objective:</strong> ${escapeHtml(phase.primaryObjective)}</p>
              <p class="eyebrow" style="margin-top:14px;">Step stack</p>
              <ol class="ordered-list">
                ${(phase.steps || []).map((step) => `<li>${escapeHtml(step)}</li>`).join('')}
              </ol>
              <label for="roadmap-status-${escapeHtml(phase.id)}">Status</label>
              <select class="status-select" id="roadmap-status-${escapeHtml(phase.id)}" data-roadmap-status="${escapeHtml(phase.id)}">
                ${Object.entries(ROADMAP_STATUS_META)
                  .map(([key, item]) => `<option value="${key}" ${saved.status === key ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
                  .join('')}
              </select>
              <label for="roadmap-next-${escapeHtml(phase.id)}" style="margin-top:12px;">Next step</label>
              <input id="roadmap-next-${escapeHtml(phase.id)}" type="text" data-roadmap-next="${escapeHtml(phase.id)}" value="${escapeHtml(saved.nextStep || '')}" placeholder="Exact next move for this phase" />
              <label for="roadmap-note-${escapeHtml(phase.id)}" style="margin-top:12px;">Owner notes</label>
              <textarea id="roadmap-note-${escapeHtml(phase.id)}" data-roadmap-note="${escapeHtml(phase.id)}" placeholder="Capture constraints, pricing ideas, or client patterns.">${escapeHtml(saved.notes || '')}</textarea>
              <p class="muted small">Last touched: ${escapeHtml(humanDate(saved.touchedAt))}</p>
            </article>
          `;
        })
        .join('')}
    </div>

    <div class="grid-2" style="margin-top:18px;">
      <article class="card">
        <p class="eyebrow">Best order for you personally</p>
        <ol class="ordered-list">
          ${(roadmap.bestOrder || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ol>
      </article>
      <article class="card">
        <p class="eyebrow">Revenue hierarchy</p>
        <ul class="cram-list">
          ${(roadmap.revenueHierarchy || []).map((item) => `<li><strong>${escapeHtml(item.label)}</strong> — ${escapeHtml(item.bestFor)}</li>`).join('')}
        </ul>
      </article>
    </div>

    <div class="grid-2" style="margin-top:18px;">
      <article class="card">
        <p class="eyebrow">App workflow mirror</p>
        <ul class="cram-list">
          ${(roadmap.appWorkflowMirror || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ul>
      </article>
      <article class="card">
        <p class="eyebrow">Avenue breakdown</p>
        <ul class="cram-list">
          ${(roadmap.avenueBreakdown || []).map((item) => `<li><strong>${escapeHtml(item.title)}</strong> — ${escapeHtml(item.summary)}</li>`).join('')}
        </ul>
      </article>
    </div>

    <div class="avenue-grid" style="margin-top:18px;">
      ${(roadmap.avenuesMap || [])
        .map(
          (lane) => `
            <article class="avenue-card">
              <p class="eyebrow">Ohio notary avenues map</p>
              <h3>${escapeHtml(lane.title)}</h3>
              <ul class="cram-list">
                ${(lane.items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
              </ul>
            </article>
          `
        )
        .join('')}
    </div>
  `;

  document.querySelectorAll('[data-roadmap-status]').forEach((input) => {
    input.addEventListener('change', () => {
      updateRoadmapPhase(input.dataset.roadmapStatus, 'status', input.value);
      renderApp();
    });
  });
  document.querySelectorAll('[data-roadmap-next]').forEach((input) => {
    input.addEventListener('input', () => updateRoadmapPhase(input.dataset.roadmapNext, 'nextStep', input.value));
  });
  document.querySelectorAll('[data-roadmap-note]').forEach((input) => {
    input.addEventListener('input', () => updateRoadmapPhase(input.dataset.roadmapNote, 'notes', input.value));
  });
}

function renderOperations() {
  const section = document.getElementById('operations');
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Operations</p>
        <h2>Open the live Ohio Notary OS operations app.</h2>
        <p class="muted">Use this study hub to pass, prep, and sequence the business. Use the live web app for admin workflows, dashboard views, and future automation.</p>
      </div>
      <div class="action-row">
        <a class="button" href="${OPERATIONS_URL}" target="_blank" rel="noreferrer">Open operations dashboard</a>
      </div>
    </div>

    <div class="operations-grid">
      <article class="card">
        <p class="eyebrow">Admin dashboard</p>
        <h3><a href="${OPERATIONS_URL}" target="_blank" rel="noreferrer">Dashboard</a></h3>
        <p class="muted">Launch-to-revenue command center for the operational web app.</p>
      </article>
      <article class="card">
        <p class="eyebrow">Public-facing site</p>
        <h3><a href="https://ohio-notary-os.netlify.app" target="_blank" rel="noreferrer">Website</a></h3>
        <p class="muted">Public booking, pricing, and remote-notary presentation layer.</p>
      </article>
      <article class="card">
        <p class="eyebrow">Revenue dashboards</p>
        <h3><a href="https://ohio-notary-os.netlify.app/dashboard/revenue" target="_blank" rel="noreferrer">Revenue</a></h3>
        <p class="muted">Track mobile, RON, and future premium lanes as they come online.</p>
      </article>
    </div>
  `;
}

function renderShortcutOverlay() {
  const container = document.getElementById('shortcut-list');
  if (!container) return;
  container.innerHTML = shortcutGroups
    .map(
      (group) => `
        <article class="shortcut-group">
          <p class="eyebrow">Shortcut group</p>
          <h3>${escapeHtml(group.title)}</h3>
          <ul>
            ${group.items.map(([key, description]) => `<li><span class="shortcut-key">${escapeHtml(key)}</span>${escapeHtml(description)}</li>`).join('')}
          </ul>
        </article>
      `
    )
    .join('');
}

function handlePrintCram() {
  state.activeSection = 'cram';
  saveState();
  renderApp();
  document.body.classList.add('print-cram');
  window.print();
}

function afterPrintCleanup() {
  document.body.classList.remove('print-cram');
}

function renderApp() {
  applyTheme();
  applyShellState();
  renderNavigation();
  renderShortcutOverlay();
  renderDashboard();
  renderPacket();
  renderModules();
  renderFlashcards();
  renderQuiz();
  renderCram();
  renderChecklist();
  renderRoadmap();
  renderOperations();
}

function toggleThemeQuick() {
  const next = resolvedTheme() === 'dark' ? 'light' : 'dark';
  state.themePreference = next;
  saveState();
  renderApp();
}

function isEditableTarget(target) {
  if (!target) return false;
  const tag = target.tagName;
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || target.isContentEditable;
}

function handleKeydown(event) {
  const editable = isEditableTarget(event.target);

  if (event.metaKey) {
    const key = event.key.toLowerCase();
    if (SECTION_SHORTCUTS[key]) {
      event.preventDefault();
      setActiveSection(SECTION_SHORTCUTS[key]);
      return;
    }
    if (key === 'b') {
      event.preventDefault();
      state.sidebarCollapsed = !state.sidebarCollapsed;
      saveState();
      renderApp();
      return;
    }
    if (key === 'd') {
      event.preventDefault();
      toggleThemeQuick();
      return;
    }
    if (key === 'p') {
      event.preventDefault();
      handlePrintCram();
      return;
    }
    if (key === '/') {
      event.preventDefault();
      state.shortcutOverlayOpen = !state.shortcutOverlayOpen;
      saveState();
      applyShellState();
      return;
    }
  }

  if (editable) return;

  if (state.activeSection === 'flashcards') {
    if (event.code === 'Space') {
      event.preventDefault();
      flipFlashcard();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      changeFlashcard(-1);
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      changeFlashcard(1);
    }
  }
}

function bindStaticEvents() {
  document.getElementById('toggle-sidebar-btn')?.addEventListener('click', () => {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    saveState();
    renderApp();
  });
  document.getElementById('shortcut-help-btn')?.addEventListener('click', () => {
    state.shortcutOverlayOpen = true;
    saveState();
    applyShellState();
  });
  document.getElementById('shortcut-close-btn')?.addEventListener('click', () => {
    state.shortcutOverlayOpen = false;
    saveState();
    applyShellState();
  });
  document.getElementById('theme-select')?.addEventListener('change', (event) => {
    state.themePreference = event.target.value;
    saveState();
    renderApp();
  });
  document.getElementById('print-cram-btn')?.addEventListener('click', handlePrintCram);
  document.getElementById('shortcut-overlay')?.addEventListener('click', (event) => {
    if (event.target.id === 'shortcut-overlay') {
      state.shortcutOverlayOpen = false;
      saveState();
      applyShellState();
    }
  });
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('afterprint', afterPrintCleanup);
  if (MEDIA_QUERY) {
    const themeListener = () => {
      if (state.themePreference === 'system') applyTheme();
    };
    if (typeof MEDIA_QUERY.addEventListener === 'function') MEDIA_QUERY.addEventListener('change', themeListener);
    else if (typeof MEDIA_QUERY.addListener === 'function') MEDIA_QUERY.addListener(themeListener);
  }
}

bindStaticEvents();
renderApp();
