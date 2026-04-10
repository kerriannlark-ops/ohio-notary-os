const content = window.NOTARY_COURSE_CONTENT || {
  metadata: { pageCount: 149, exam: { questionCount: 30, passingScore: 80, duration: '1 hour' } },
  modules: [],
  cramSheets: [],
};
const roadmap = window.NOTARY_ROADMAP_CONTENT || {
  title: 'Ohio Notary Business Roadmap',
  phases: [],
  serviceLanes: [],
  coreLegalRules: [],
  buildOrder: [],
  codexPrompt: '',
  sourceFiles: [],
  bestOrder: [],
  revenueHierarchy: [],
  avenueBreakdown: [],
  appWorkflowMirror: [],
  avenuesMap: [],
};
const library = window.NOTARY_COURSE_LIBRARY || {
  metadata: { documentCount: 0, audioFileCount: 0, totalAudioSeconds: 0 },
  businessSnapshot: {},
  recommendedStudyStack: [],
  documents: [],
};

const STORAGE_KEY = 'notary-os-study-hub-regular-v5';
const DEFAULT_PDF = './CourseLibrary/OhioNotaryCoursePacket.pdf';
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
const LANE_RECOMMENDATION_ORDER = [
  'employer_in_office',
  'mobile_general',
  'same_day_after_hours',
  'hospital_hospice_nursing_home',
  'vehicle_title_auto',
  'ron',
  'notary_signing_agent',
  'apostille_support',
  'i9_authorized_representative',
];
const LANE_LABELS = {
  employer_in_office: 'Employer / in-office',
  mobile_general: 'Mobile general',
  same_day_after_hours: 'Same-day / after-hours',
  hospital_hospice_nursing_home: 'Hospital / hospice / nursing-home',
  vehicle_title_auto: 'Vehicle title / auto',
  ron: 'RON',
  notary_signing_agent: 'Signing-agent',
  apostille_support: 'Apostille',
  i9_authorized_representative: 'I-9',
};
const PHASE_CHECKLIST_GATE = {
  foundation: ['courseCompleted', 'examPassed', 'bciFresh', 'applicationFiled', 'commissionApproved', 'oathCompleted', 'sealOrdered'],
  local_mobile_launch: ['firstRevenueMade'],
  specialty_niche_expansion: ['mobileLaunchReady'],
  digital_scale: ['specialtyNicheReady'],
  premium_services: ['ronReady'],
  recurring_accounts: ['premiumServicesReady'],
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
      ['⌘2', 'Open Course Library'],
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

function buildDefaultServiceLaneProgress() {
  return (roadmap.serviceLanes || []).reduce((acc, lane, index) => {
    acc[lane.id] = {
      status: index === 0 ? 'in_progress' : 'not_started',
      notes: '',
      nextStep: index === 0 ? 'Use this as the first clean revenue lane.' : '',
      touchedAt: '',
    };
    return acc;
  }, {});
}

const defaultState = {
  activeSection: 'dashboard',
  activeModuleId: content.modules[0]?.id || '',
  selectedLibraryDocId: library.documents.find((doc) => doc.isPrimaryPacket)?.id || library.documents[0]?.id || '',
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
  reducedMotion: true,
  roadmapProgress: buildDefaultRoadmapProgress(),
  serviceLaneProgress: buildDefaultServiceLaneProgress(),
};

let state = loadState();
let currentQuiz = null;

function normalizeState(parsed) {
  const roadmapDefaults = buildDefaultRoadmapProgress();
  const laneDefaults = buildDefaultServiceLaneProgress();
  const mergedRoadmap = Object.keys(roadmapDefaults).reduce((acc, phaseId) => {
    acc[phaseId] = {
      ...roadmapDefaults[phaseId],
      ...((parsed.roadmapProgress || {})[phaseId] || {}),
    };
    return acc;
  }, {});
  const mergedServiceLanes = Object.keys(laneDefaults).reduce((acc, laneId) => {
    acc[laneId] = {
      ...laneDefaults[laneId],
      ...((parsed.serviceLaneProgress || {})[laneId] || {}),
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
    serviceLaneProgress: mergedServiceLanes,
  };

  if (!SECTION_ORDER.includes(normalized.activeSection)) normalized.activeSection = 'dashboard';
  if (!content.modules.some((module) => module.id === normalized.activeModuleId)) {
    normalized.activeModuleId = content.modules[0]?.id || '';
  }
  if (!library.documents.some((doc) => doc.id === normalized.selectedLibraryDocId)) {
    normalized.selectedLibraryDocId = library.documents.find((doc) => doc.isPrimaryPacket)?.id || library.documents[0]?.id || '';
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

function fileSizeLabel(bytes, fallback = '') {
  if (!bytes && bytes !== 0) return fallback;
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = Number(bytes);
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function durationLabel(seconds, fallback = '—') {
  if (!seconds && seconds !== 0) return fallback;
  const total = Math.round(Number(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  if (hours) return `${hours}h ${minutes}m`;
  if (minutes) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function libraryDocById(id) {
  return library.documents.find((doc) => doc.id === id) || library.documents[0] || null;
}

function selectedLibraryDoc() {
  return libraryDocById(state.selectedLibraryDocId);
}

function primaryLibraryDoc() {
  return library.documents.find((doc) => doc.isPrimaryPacket) || libraryDocById(state.selectedLibraryDocId);
}

function libraryDocumentsByCategory(category) {
  return library.documents.filter((doc) => doc.category === category);
}

function totalAudioHours() {
  return ((Number(library.metadata?.totalAudioSeconds || 0) / 3600) || 0).toFixed(1);
}

function documentMetaChips(doc) {
  const chips = [];
  chips.push(doc.kind?.toUpperCase() || 'FILE');
  if (doc.pageCount) chips.push(`${doc.pageCount} pages`);
  if (doc.durationSeconds) chips.push(durationLabel(doc.durationSeconds));
  if (doc.fileSizeBytes) chips.push(fileSizeLabel(doc.fileSizeBytes, doc.fileSizeLabel));
  if (doc.priority) chips.push(doc.priority.replace(/_/g, ' '));
  return chips;
}

function documentViewerHtml(doc) {
  if (!doc) {
    return '<article class="card"><p>Select a course file to preview it here.</p></article>';
  }

  if (doc.kind === 'pdf') {
    const viewerUrl = doc.isPrimaryPacket ? `${doc.url}#page=${state.lastPacketPage}` : doc.url;
    return `
      <article class="card">
        <p class="eyebrow">Document preview</p>
        <h3>${escapeHtml(doc.title)}</h3>
        <div class="toolbar-pill-row" style="margin-bottom:14px;">
          ${documentMetaChips(doc).map((chip) => `<span class="toolbar-chip">${escapeHtml(chip)}</span>`).join('')}
        </div>
        <iframe class="packet-frame" title="${escapeHtml(doc.title)}" src="${escapeHtml(viewerUrl)}"></iframe>
      </article>
    `;
  }

  if (doc.kind === 'm4a') {
    return `
      <article class="card">
        <p class="eyebrow">Audio preview</p>
        <h3>${escapeHtml(doc.title)}</h3>
        <div class="toolbar-pill-row" style="margin-bottom:14px;">
          ${documentMetaChips(doc).map((chip) => `<span class="toolbar-chip">${escapeHtml(chip)}</span>`).join('')}
        </div>
        <audio class="audio-player" controls preload="metadata" src="${escapeHtml(doc.url)}"></audio>
        <p class="muted" style="margin-top:12px;">${escapeHtml(doc.recommendedUse || doc.description || 'Use this recording as lecture reference.')}</p>
      </article>
    `;
  }

  return `
    <article class="card">
      <p class="eyebrow">Document preview</p>
      <h3>${escapeHtml(doc.title)}</h3>
      <div class="toolbar-pill-row" style="margin-bottom:14px;">
        ${documentMetaChips(doc).map((chip) => `<span class="toolbar-chip">${escapeHtml(chip)}</span>`).join('')}
      </div>
      <p class="muted">${escapeHtml(doc.description || '')}</p>
      <pre class="document-preview">${escapeHtml(doc.previewText || 'No inline preview is available for this file yet. Use the open/download action to view the original file.')}</pre>
    </article>
  `;
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
  document.documentElement.setAttribute('data-reduced-motion', state.reducedMotion ? 'true' : 'false');
  const overlay = document.getElementById('shortcut-overlay');
  if (overlay) {
    overlay.classList.toggle('hidden', !state.shortcutOverlayOpen);
    overlay.setAttribute('aria-hidden', state.shortcutOverlayOpen ? 'false' : 'true');
  }
  const motionButton = document.getElementById('motion-toggle-btn');
  if (motionButton) {
    motionButton.textContent = state.reducedMotion ? 'Low Motion' : 'More Motion';
    motionButton.setAttribute('aria-pressed', state.reducedMotion ? 'true' : 'false');
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

function serviceLaneById(laneId) {
  return (roadmap.serviceLanes || []).find((lane) => lane.id === laneId) || null;
}

function serviceLaneState(laneId) {
  return state.serviceLaneProgress[laneId] || buildDefaultServiceLaneProgress()[laneId] || { status: 'not_started', notes: '', nextStep: '', touchedAt: '' };
}

function phaseIndex(phaseId) {
  return Math.max(
    0,
    (roadmap.phases || []).findIndex((phase) => phase.id === phaseId)
  );
}

function laneFocusLabel(lane) {
  const phase = dominantRoadmapPhase();
  const phaseRank = phaseIndex(phase?.id);
  const laneRank = phaseIndex(lane.phaseId);
  const laneState = serviceLaneState(lane.id);

  if (laneState.status === 'completed') return { label: 'Completed', className: 'chip-completed' };
  if (laneState.status === 'active' || laneState.status === 'in_progress') return { label: 'Do now', className: 'chip-active' };
  if (laneRank <= phaseRank + 1) return { label: 'Later', className: 'chip-in-progress' };
  return { label: 'Not yet unlocked', className: 'chip-deferred' };
}

function serviceLaneGroups() {
  return (roadmap.phases || []).map((phase) => ({
    phase,
    lanes: (roadmap.serviceLanes || []).filter((lane) => lane.phaseId === phase.id),
  }));
}

function updateServiceLane(laneId, field, value) {
  state.serviceLaneProgress[laneId] = {
    ...serviceLaneState(laneId),
    [field]: value,
    touchedAt: new Date().toISOString(),
  };
  saveState();
}

function phaseGateSatisfied(phaseId) {
  const gates = PHASE_CHECKLIST_GATE[phaseId] || [];
  return gates.every((key) => state.checklist[key]);
}

function nextLaneAfter(laneId) {
  const index = LANE_RECOMMENDATION_ORDER.indexOf(laneId);
  if (index === -1) return null;
  return serviceLaneById(LANE_RECOMMENDATION_ORDER[index + 1]) || null;
}

function firstStudyModuleIdForLane(lane) {
  return lane?.studyModuleLinks?.[0] || '';
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
    return { label: 'Finish the course', why: 'You need the course complete before the filing sequence becomes real.', unlocks: 'Practice-exam focus and filing readiness', target: 'checklist' };
  }
  if (!state.checklist.examPassed && (state.bestQuizScore || 0) < PASS_THRESHOLD) {
    return { label: 'Get exam-pass ready', why: 'Stable passing reps reduce friction and mistakes before filing.', unlocks: 'BCI + filing readiness', target: 'quiz' };
  }
  if (!state.checklist.bciFresh) {
    return { label: 'Confirm BCI freshness', why: 'The filing window can close if the BCI report ages out.', unlocks: 'Application filing', target: 'checklist' };
  }
  if (!state.checklist.applicationFiled) {
    return { label: 'File the application', why: 'This moves you from studying into official licensing progress.', unlocks: 'Commission approval', target: 'checklist' };
  }
  if (!state.checklist.oathCompleted) {
    return { label: 'Complete the oath', why: 'The oath is a legal gate before lawful performance.', unlocks: 'Ready-to-work commissioning', target: 'checklist' };
  }
  if (!state.checklist.sealOrdered) {
    return { label: 'Order the seal', why: 'You need the seal ready before you start taking live work.', unlocks: 'First low-risk appointment', target: 'checklist' };
  }
  if (!state.checklist.firstRevenueMade) {
    return { label: 'Take first low-risk in-person revenue', why: 'A clean first appointment builds confidence and process discipline.', unlocks: 'Mobile launch and specialty lanes', target: 'checklist' };
  }

  for (const laneId of LANE_RECOMMENDATION_ORDER) {
    const lane = serviceLaneById(laneId);
    if (!lane) continue;
    const laneState = serviceLaneState(laneId);
    const phaseReady = phaseGateSatisfied(lane.phaseId);
    if (laneState.status === 'completed') continue;

    if (!phaseReady) {
      const phase = (roadmap.phases || []).find((item) => item.id === lane.phaseId);
      return {
        label: `Complete ${phase?.label || 'the current phase'} first`,
        why: `${LANE_LABELS[laneId] || lane.label} works best after the earlier phase gates are complete.`,
        unlocks: lane.label,
        target: 'roadmap',
        laneId,
      };
    }

    if (laneState.status === 'active' || laneState.status === 'in_progress' || laneState.status === 'not_started') {
      const nextLane = nextLaneAfter(laneId);
      return {
        label: `Advance ${lane.label}`,
        why: lane.useCase,
        unlocks: nextLane ? nextLane.label : 'Recurring business strategy',
        target: 'roadmap',
        laneId,
      };
    }
  }

  if (!state.checklist.mobileLaunchReady && !['active', 'completed'].includes(roadmapState.local_mobile_launch?.status)) {
    return { label: 'Build the mobile launch', why: 'Travel zones and booking systems make local work predictable.', unlocks: 'Specialty niche expansion', target: 'roadmap' };
  }
  if (!state.checklist.specialtyNicheReady && !['active', 'completed'].includes(roadmapState.specialty_niche_expansion?.status)) {
    return { label: 'Prepare specialty niches', why: 'Niche work raises ticket size without needing a bigger audience first.', unlocks: 'RON and premium lanes', target: 'roadmap' };
  }
  if (!state.checklist.ronReady && !['active', 'completed'].includes(roadmapState.digital_scale?.status)) {
    return { label: 'Start the RON path', why: 'RON improves margins and removes dead travel time.', unlocks: 'Scalable digital capacity', target: 'roadmap' };
  }
  if (!state.checklist.premiumServicesReady && !['active', 'completed'].includes(roadmapState.premium_services?.status)) {
    return { label: 'Prepare premium services', why: 'Premium work increases average appointment value.', unlocks: 'Recurring account credibility', target: 'roadmap' };
  }
  if (!state.checklist.b2bAccountsReady && !['active', 'completed'].includes(roadmapState.recurring_accounts?.status)) {
    return { label: 'Build recurring B2B accounts', why: 'Recurring business reduces dependence on one-off appointments.', unlocks: 'Stable income and retention', target: 'roadmap' };
  }
  return { label: 'Refine and scale', why: 'The foundation is in place, so optimization becomes the next move.', unlocks: 'Higher-margin and recurring revenue', target: 'roadmap' };
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
  const activeLane = LANE_RECOMMENDATION_ORDER.map(serviceLaneById).find((lane) => lane && ['active', 'in_progress'].includes(serviceLaneState(lane.id).status));
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
      ${activeLane ? `<p class="muted" style="margin-top:12px;"><strong>Current lane:</strong> ${escapeHtml(activeLane.label)}</p>` : ''}
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
      </div>
    </div>

    ${dismissed ? `
      <div class="today-grid" style="margin-bottom:18px;">
        <article class="card">
          <p class="eyebrow">Today’s study session</p>
          <h3>Dismissed for today</h3>
          <p class="muted">Reopen it if you want to reset the focus block and keep working inside the packet + quiz loop.</p>
          <div class="action-row">
            <button class="secondary-button" id="reopen-today-widget-btn">Reopen today widget</button>
          </div>
        </article>
        <article class="business-next-card">
          <p class="eyebrow">Business next action</p>
          <h3>Do this now: ${escapeHtml(business.label)}</h3>
          <p><strong>Why it matters:</strong> ${escapeHtml(business.why)}</p>
          <p><strong>What it unlocks next:</strong> ${escapeHtml(business.unlocks)}</p>
          <div class="action-row" style="margin-top:14px;">
            <button class="button" id="dashboard-primary-business-btn">${business.laneId && firstStudyModuleIdForLane(serviceLaneById(business.laneId)) ? 'Open linked study topic' : business.target === 'quiz' ? 'Open quiz' : 'Open checklist'}</button>
            <button class="secondary-button" id="open-roadmap-btn">Open roadmap</button>
          </div>
        </article>
      </div>
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
          <h3>Do this now: ${escapeHtml(business.label)}</h3>
          <p><strong>Why it matters:</strong> ${escapeHtml(business.why)}</p>
          <p><strong>What it unlocks next:</strong> ${escapeHtml(business.unlocks)}</p>
          <div class="toolbar-pill-row" style="margin-top:10px;">
            <span class="toolbar-chip">Active phase: ${escapeHtml(dominantPhase?.label || 'Foundation')}</span>
            <span class="toolbar-chip">Checklist completion: ${checklistCompletion().completed}/${checklistCompletion().total}</span>
          </div>
          <div class="action-row" style="margin-top:14px;">
            <button class="button" id="dashboard-primary-business-btn">${business.laneId && firstStudyModuleIdForLane(serviceLaneById(business.laneId)) ? 'Open linked study topic' : business.target === 'quiz' ? 'Open quiz' : 'Open checklist'}</button>
            <button class="secondary-button" id="open-roadmap-btn">Open roadmap</button>
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
        <div class="action-row" style="margin-top:14px;">
          <button class="secondary-button" id="dashboard-print-cram-btn">Print cram sheet</button>
        </div>
      </article>
    </div>
  `;

  document.getElementById('resume-study-btn')?.addEventListener('click', () => setActiveSection('packet'));
  document.getElementById('start-full-quiz-btn')?.addEventListener('click', () => startQuiz('all', 30, '30-question timed quiz'));
  document.getElementById('dashboard-print-cram-btn')?.addEventListener('click', handlePrintCram);
  document.getElementById('open-roadmap-btn')?.addEventListener('click', () => setActiveSection('roadmap'));
  document.getElementById('open-roadmap-from-dashboard')?.addEventListener('click', () => setActiveSection('roadmap'));
  document.getElementById('dashboard-primary-business-btn')?.addEventListener('click', () => {
    if (business.laneId) {
      const linkedModule = firstStudyModuleIdForLane(serviceLaneById(business.laneId));
      if (linkedModule) {
        switchModule(linkedModule, 'modules');
        return;
      }
      setActiveSection('roadmap');
      return;
    }
    if (business.target === 'quiz') {
      setActiveSection('quiz');
      return;
    }
    setActiveSection('checklist');
  });
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
  const selectedDoc = selectedLibraryDoc();
  const primaryDoc = primaryLibraryDoc();
  const business = library.businessSnapshot || {};
  const coreDocs = libraryDocumentsByCategory('core').concat(libraryDocumentsByCategory('support'));
  const transcriptDocs = libraryDocumentsByCategory('transcript');
  const audioDocs = libraryDocumentsByCategory('audio');
  const businessDocs = libraryDocumentsByCategory('business');

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Course library</p>
        <h2>One private library for every course file, note set, transcript, audio replay, and business document.</h2>
        <p class="muted">Use the main packet for page tracking, the cleaned study guide for faster review, transcripts for exact wording, audio only when needed, and the business docs when you switch into launch mode.</p>
      </div>
      <div class="action-row packet-actions">
        <a class="button" href="${escapeHtml(primaryDoc?.url || DEFAULT_PDF)}#page=${state.lastPacketPage}" target="_blank" rel="noreferrer">Open main packet</a>
        <a class="secondary-button" href="${escapeHtml(selectedDoc?.url || primaryDoc?.url || DEFAULT_PDF)}" target="_blank" rel="noreferrer" download>Open selected file</a>
      </div>
    </div>

    <div class="grid-2">
      <article class="card">
        <p class="eyebrow">Main packet control</p>
        <label for="packet-page-input">Resume page</label>
        <input id="packet-page-input" type="number" min="1" max="${content.metadata?.pageCount || 149}" value="${state.lastPacketPage}" />
        <div class="action-row" style="margin-top:14px;">
          <button class="button" id="save-packet-page-btn">Save page</button>
          <button class="secondary-button" id="packet-prev-page-btn">-5 pages</button>
          <button class="secondary-button" id="packet-next-page-btn">+5 pages</button>
          <button class="ghost-button" id="packet-mark-course-btn">${state.checklist.courseCompleted ? 'Course marked complete' : 'Mark course complete'}</button>
        </div>
        <div class="toolbar-pill-row" style="margin-top:14px;">
          <span class="toolbar-chip">Sources loaded: ${library.metadata?.documentCount || library.documents.length}</span>
          <span class="toolbar-chip">Audio hours: ${totalAudioHours()}</span>
          <span class="toolbar-chip">Resume page ${state.lastPacketPage}</span>
        </div>
      </article>

      <article class="card">
        <p class="eyebrow">Best study stack</p>
        <ol class="ordered-list">
          ${(library.recommendedStudyStack || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ol>
        <div class="tag-row" style="margin-top:14px;">
          ${pageModules
            .map((module) => `<button class="ghost-button page-module-link" data-module-id="${escapeHtml(module.id)}">${escapeHtml(module.title)}</button>`)
            .join('')}
        </div>
      </article>
    </div>

    <div class="metrics-grid" style="margin-top:18px;">
      <article class="mini-card">
        <p class="eyebrow">Business plan snapshot</p>
        <div class="stat-value">${escapeHtml(business.year1Revenue || '—')}</div>
        <p class="muted">Year 1 revenue target</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Startup cash</p>
        <div class="stat-value">${escapeHtml(business.startupCashOutlay || '—')}</div>
        <p class="muted">Startup outlay from the plan</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Break-even</p>
        <div class="stat-value">${escapeHtml(business.breakEvenMonthlyAppointments || '—')}</div>
        <p class="muted">Monthly appointment goal</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Loaded documents</p>
        <div class="stat-value">${library.metadata?.documentCount || library.documents.length}</div>
        <p class="muted">${library.metadata?.audioFileCount || audioDocs.length} audio recordings included</p>
      </article>
    </div>

    <div class="library-layout" style="margin-top:18px;">
      <div class="library-list">
        <article class="card">
          <p class="eyebrow">Core study documents</p>
          <div class="library-card-stack">
            ${coreDocs.map((doc) => `
              <button class="library-doc-button ${doc.id === selectedDoc?.id ? 'library-doc-button-active' : ''}" data-library-doc="${escapeHtml(doc.id)}">
                <span>
                  <strong>${escapeHtml(doc.title)}</strong>
                  <span class="muted small">${escapeHtml(doc.description)}</span>
                </span>
                <span class="status-chip ${doc.isPrimaryPacket ? 'chip-active' : 'chip-in-progress'}">${doc.isPrimaryPacket ? 'Primary' : 'Support'}</span>
              </button>
            `).join('')}
          </div>
        </article>

        <article class="card">
          <p class="eyebrow">Transcripts</p>
          <div class="library-card-stack">
            ${transcriptDocs.map((doc) => `
              <button class="library-doc-button ${doc.id === selectedDoc?.id ? 'library-doc-button-active' : ''}" data-library-doc="${escapeHtml(doc.id)}">
                <span>
                  <strong>${escapeHtml(doc.title)}</strong>
                  <span class="muted small">${escapeHtml(doc.recommendedUse)}</span>
                </span>
                <span class="status-chip chip-deferred">${doc.pageCount ? `${doc.pageCount} pages` : 'Reference'}</span>
              </button>
            `).join('')}
          </div>
        </article>

        <article class="card">
          <p class="eyebrow">Audio recordings</p>
          <div class="library-card-stack">
            ${audioDocs.map((doc) => `
              <button class="library-doc-button ${doc.id === selectedDoc?.id ? 'library-doc-button-active' : ''}" data-library-doc="${escapeHtml(doc.id)}">
                <span>
                  <strong>${escapeHtml(doc.title)}</strong>
                  <span class="muted small">${escapeHtml(doc.recommendedUse)}</span>
                </span>
                <span class="status-chip chip-not-started">${escapeHtml(doc.durationLabel || 'Audio')}</span>
              </button>
            `).join('')}
          </div>
        </article>

        <article class="card">
          <p class="eyebrow">Business build documents</p>
          <div class="library-card-stack">
            ${businessDocs.map((doc) => `
              <button class="library-doc-button ${doc.id === selectedDoc?.id ? 'library-doc-button-active' : ''}" data-library-doc="${escapeHtml(doc.id)}">
                <span>
                  <strong>${escapeHtml(doc.title)}</strong>
                  <span class="muted small">${escapeHtml(doc.recommendedUse)}</span>
                </span>
                <span class="status-chip chip-active">Business</span>
              </button>
            `).join('')}
          </div>
        </article>
      </div>

      <div class="library-viewer">
        ${documentViewerHtml(selectedDoc)}
      </div>
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
  document.querySelectorAll('[data-library-doc]').forEach((button) => {
    button.addEventListener('click', () => {
      state.selectedLibraryDocId = button.dataset.libraryDoc;
      saveState();
      renderApp();
    });
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
          <div class="action-row" style="margin-top:14px;">
            <button class="ghost-button" id="quiz-start-weak-btn">Weak-topic drill</button>
          </div>
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
  const activePhase = dominantRoadmapPhase();
  const blocker = blockers()[0];
  const nextAction = businessNextAction();
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Roadmap</p>
        <h2>${escapeHtml(roadmap.title || 'Ohio Notary Business Roadmap')}</h2>
        <p class="muted">Use one phase at a time. Keep the current phase visible, keep future lanes tracked, and only expand details when you need them.</p>
      </div>
      <div class="roadmap-controls">
        ${Object.entries(counts).map(([status, count]) => `<span class="status-chip ${statusMeta(status).chipClass}">${statusMeta(status).label}: ${count}</span>`).join('')}
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:18px;">
      <article class="phase-card focus-card">
        <div class="phase-meta">
          <div>
            <p class="eyebrow">Current phase</p>
            <h3>${escapeHtml(activePhase?.label || 'Foundation')}</h3>
          </div>
          <span class="status-chip ${statusMeta(roadmapPhaseState(activePhase?.id).status).chipClass}">${statusMeta(roadmapPhaseState(activePhase?.id).status).label}</span>
        </div>
        <p><strong>Goal:</strong> ${escapeHtml(activePhase?.goal || 'Move the business forward one phase at a time.')}</p>
        <p><strong>Do this now:</strong> ${escapeHtml(nextAction.label)}</p>
        <p><strong>What it unlocks next:</strong> ${escapeHtml(nextAction.unlocks)}</p>
        ${blocker ? `<p class="roadmap-risk"><strong>Blocker:</strong> ${escapeHtml(blocker)}</p>` : '<p class="muted">No major blocker right now. Keep the next action small and concrete.</p>'}
        <label for="active-phase-status" style="margin-top:12px;">Phase status</label>
        <select class="status-select" id="active-phase-status">
          ${Object.entries(ROADMAP_STATUS_META).map(([key, item]) => `<option value="${key}" ${roadmapPhaseState(activePhase?.id).status === key ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}
        </select>
        <label for="active-phase-next" style="margin-top:12px;">Phase next step</label>
        <input id="active-phase-next" type="text" value="${escapeHtml(roadmapPhaseState(activePhase?.id).nextStep || '')}" placeholder="Exact next move for the current phase" />
        <label for="active-phase-note" style="margin-top:12px;">Phase notes</label>
        <textarea id="active-phase-note" placeholder="Capture what matters for the current phase.">${escapeHtml(roadmapPhaseState(activePhase?.id).notes || '')}</textarea>
        <div class="action-row" style="margin-top:14px;">
          <button class="button" id="roadmap-open-checklist-btn">Open checklist</button>
          <button class="secondary-button" id="roadmap-open-packet-btn">Resume packet</button>
        </div>
      </article>
      <article class="card">
        <p class="eyebrow">Phase stack</p>
        <div class="phase-stack">
          ${(roadmap.phases || []).map((phase) => {
            const saved = roadmapPhaseState(phase.id);
            return `
              <button class="phase-stack-item ${phase.id === activePhase?.id ? 'phase-stack-item-active' : ''}" data-scroll-phase="${escapeHtml(phase.id)}">
                <span>${escapeHtml(phase.label)}</span>
                <span class="status-chip ${statusMeta(saved.status).chipClass}">${statusMeta(saved.status).label}</span>
              </button>
            `;
          }).join('')}
        </div>
      </article>
    </div>

    <div class="stack-block">
      <div class="page-header" style="margin-bottom:14px;">
        <div>
          <p class="eyebrow">Revenue ladder</p>
          <h2 style="font-size:2.1rem;">Track service lanes without overwhelming the screen.</h2>
        </div>
      </div>
      <div class="lane-group-stack">
        ${serviceLaneGroups().map(({ phase, lanes }) => `
          <section class="lane-group" id="phase-${escapeHtml(phase.id)}">
            <div class="lane-group-header">
              <div>
                <p class="eyebrow">${escapeHtml(phase.label)}</p>
                <h3>${escapeHtml(phase.goal)}</h3>
              </div>
              <span class="status-chip ${statusMeta(roadmapPhaseState(phase.id).status).chipClass}">${statusMeta(roadmapPhaseState(phase.id).status).label}</span>
            </div>
            <div class="lane-list">
              ${lanes.map((lane) => {
                const laneState = serviceLaneState(lane.id);
                const laneStatus = statusMeta(laneState.status);
                const focus = laneFocusLabel(lane);
                return `
                  <details class="card lane-card" ${laneState.status === 'active' || laneState.status === 'in_progress' ? 'open' : ''}>
                    <summary class="lane-summary">
                      <div>
                        <p class="eyebrow">${escapeHtml(lane.label)}</p>
                        <h3>${escapeHtml(lane.useCase)}</h3>
                        <p class="muted">Startup cost: ${escapeHtml(lane.startupCost)}</p>
                      </div>
                      <div class="lane-summary-meta">
                        <span class="status-chip ${focus.className}">${focus.label}</span>
                        <span class="status-chip ${laneStatus.chipClass}">${laneStatus.label}</span>
                      </div>
                    </summary>
                    <div class="lane-detail-grid">
                      <div>
                        <p><strong>Primary revenue:</strong> ${escapeHtml((lane.primaryRevenue || []).join(' · '))}</p>
                        <p><strong>App modules:</strong> ${escapeHtml((lane.appModules || []).join(' · '))}</p>
                        <p><strong>Linked study topics:</strong> ${lane.studyModuleLinks?.length ? escapeHtml(lane.studyModuleLinks.map((id) => moduleById(id)?.title || id).join(' · ')) : 'No direct study topic — admin/process lane'}</p>
                        <p class="muted"><strong>Planning note:</strong> ${escapeHtml(lane.notes || 'No additional note yet.')}</p>
                        ${lane.id === 'i9_authorized_representative' ? '<p class="roadmap-risk"><strong>Compliance note:</strong> I-9 is not a notarial act and must stay outside the seal / notarial billing path.</p>' : ''}
                      </div>
                      <div>
                        <label for="lane-status-${escapeHtml(lane.id)}">Status</label>
                        <select class="status-select" id="lane-status-${escapeHtml(lane.id)}" data-lane-status="${escapeHtml(lane.id)}">
                          ${Object.entries(ROADMAP_STATUS_META).map(([key, item]) => `<option value="${key}" ${laneState.status === key ? 'selected' : ''}>${escapeHtml(item.label)}</option>`).join('')}
                        </select>
                        <label for="lane-next-${escapeHtml(lane.id)}" style="margin-top:12px;">Next step</label>
                        <input id="lane-next-${escapeHtml(lane.id)}" type="text" data-lane-next="${escapeHtml(lane.id)}" value="${escapeHtml(laneState.nextStep || '')}" placeholder="Smallest useful next step for this lane" />
                        <label for="lane-note-${escapeHtml(lane.id)}" style="margin-top:12px;">Notes</label>
                        <textarea id="lane-note-${escapeHtml(lane.id)}" data-lane-note="${escapeHtml(lane.id)}" placeholder="Capture decisions, pricing ideas, or blockers.">${escapeHtml(laneState.notes || '')}</textarea>
                        <p class="muted small">Last touched: ${escapeHtml(humanDate(laneState.touchedAt))}</p>
                      </div>
                    </div>
                    <div class="action-row lane-action-row">
                      ${firstStudyModuleIdForLane(lane) ? `<button class="button lane-open-study-btn" data-lane-study="${escapeHtml(firstStudyModuleIdForLane(lane))}">Open linked study topic</button>` : `<button class="button lane-open-roadmap-note-btn">Stay in planning mode</button>`}
                      <button class="secondary-button lane-open-cram-btn">Open cram</button>
                      <button class="ghost-button lane-open-checklist-btn">Open checklist</button>
                    </div>
                  </details>
                `;
              }).join('')}
            </div>
          </section>
        `).join('')}
      </div>
    </div>

    <div class="grid-2" style="margin-top:18px;">
      <article class="card">
        <p class="eyebrow">Core legal rules</p>
        <ul class="cram-list">
          ${(roadmap.coreLegalRules || []).map((rule) => `<li>${escapeHtml(rule)}</li>`).join('')}
        </ul>
        <p class="roadmap-risk"><strong>Keep visible:</strong> I-9 stays outside the notarial-act and seal workflow.</p>
      </article>
      <article class="card">
        <p class="eyebrow">Build order</p>
        <ol class="ordered-list">
          ${(roadmap.buildOrder || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
        </ol>
        <div class="toolbar-pill-row" style="margin-top:14px;">
          <span class="toolbar-chip">Startup cash: ${escapeHtml(library.businessSnapshot?.startupCashOutlay || '—')}</span>
          <span class="toolbar-chip">Year 1 revenue: ${escapeHtml(library.businessSnapshot?.year1Revenue || '—')}</span>
          <span class="toolbar-chip">Break-even: ${escapeHtml(library.businessSnapshot?.breakEvenMonthlyAppointments || '—')}</span>
        </div>
      </article>
    </div>

    <div class="grid-2" style="margin-top:18px;">
      <article class="card">
        <p class="eyebrow">Codex handoff</p>
        <textarea class="readonly-block" readonly>${escapeHtml(roadmap.codexPrompt || '')}</textarea>
      </article>
      <article class="card">
        <p class="eyebrow">Strategic context</p>
        <details>
          <summary>Best order + revenue hierarchy</summary>
          <div class="lane-detail-grid" style="margin-top:14px;">
            <div>
              <p class="eyebrow">Best order</p>
              <ol class="ordered-list">
                ${(roadmap.bestOrder || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
              </ol>
            </div>
            <div>
              <p class="eyebrow">Revenue hierarchy</p>
              <ul class="cram-list">
                ${(roadmap.revenueHierarchy || []).map((item) => `<li><strong>${escapeHtml(item.label)}</strong> — ${escapeHtml(item.bestFor)}</li>`).join('')}
              </ul>
            </div>
          </div>
        </details>
      </article>
    </div>
  `;

  document.getElementById('roadmap-open-checklist-btn')?.addEventListener('click', () => setActiveSection('checklist'));
  document.getElementById('roadmap-open-packet-btn')?.addEventListener('click', () => setActiveSection('packet'));
  document.getElementById('active-phase-status')?.addEventListener('change', (event) => {
    if (!activePhase?.id) return;
    updateRoadmapPhase(activePhase.id, 'status', event.target.value);
    renderApp();
  });
  document.getElementById('active-phase-next')?.addEventListener('input', (event) => {
    if (!activePhase?.id) return;
    updateRoadmapPhase(activePhase.id, 'nextStep', event.target.value);
  });
  document.getElementById('active-phase-note')?.addEventListener('input', (event) => {
    if (!activePhase?.id) return;
    updateRoadmapPhase(activePhase.id, 'notes', event.target.value);
  });
  document.querySelectorAll('[data-scroll-phase]').forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById(`phase-${button.dataset.scrollPhase}`)?.scrollIntoView({ behavior: state.reducedMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });
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
  document.querySelectorAll('[data-lane-status]').forEach((input) => {
    input.addEventListener('change', () => {
      updateServiceLane(input.dataset.laneStatus, 'status', input.value);
      renderApp();
    });
  });
  document.querySelectorAll('[data-lane-next]').forEach((input) => {
    input.addEventListener('input', () => updateServiceLane(input.dataset.laneNext, 'nextStep', input.value));
  });
  document.querySelectorAll('[data-lane-note]').forEach((input) => {
    input.addEventListener('input', () => updateServiceLane(input.dataset.laneNote, 'notes', input.value));
  });
  document.querySelectorAll('.lane-open-study-btn').forEach((button) => {
    button.addEventListener('click', () => switchModule(button.dataset.laneStudy, 'modules'));
  });
  document.querySelectorAll('.lane-open-cram-btn').forEach((button) => {
    button.addEventListener('click', () => setActiveSection('cram'));
  });
  document.querySelectorAll('.lane-open-roadmap-note-btn').forEach((button) => {
    button.addEventListener('click', () => setActiveSection('roadmap'));
  });
  document.querySelectorAll('.lane-open-checklist-btn').forEach((button) => {
    button.addEventListener('click', () => setActiveSection('checklist'));
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

function toggleReducedMotion() {
  state.reducedMotion = !state.reducedMotion;
  saveState();
  applyShellState();
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
  document.getElementById('motion-toggle-btn')?.addEventListener('click', () => {
    toggleReducedMotion();
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
