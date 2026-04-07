const content = window.NOTARY_COURSE_CONTENT;
const LETTERS = ['A', 'B', 'C', 'D', 'E'];
const STORAGE_KEY = 'notary-os-study-hub-regular-v1';
const DEFAULT_PDF = '../SeededCourse/OhioNotaryCoursePacket.pdf';
const OPERATIONS_URL = 'https://ohio-notary-os.netlify.app/dashboard';

const defaultChecklist = {
  coursePaid: true,
  courseCompleted: false,
  examPassed: false,
  bciFresh: false,
  applicationFiled: false,
  commissionApproved: false,
  oathCompleted: false,
  sealOrdered: false,
  ronCourseComplete: false,
  ronFiled: false,
  ronToolsReady: false,
  businessSetupStarted: false,
  firstRevenueMade: false,
};

const defaultState = {
  activeSection: 'dashboard',
  activeModuleId: content.modules[0]?.id ?? '',
  flashcardIndex: 0,
  flashcardShowAnswer: false,
  flashcardRatings: {},
  checklist: defaultChecklist,
  lastPacketPage: 1,
  latestQuizScore: null,
  bestQuizScore: null,
  quizHistory: [],
  noteByModule: {},
};

let state = loadState();
let currentQuiz = null;

function loadState() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return {
      ...defaultState,
      ...parsed,
      checklist: { ...defaultChecklist, ...(parsed.checklist || {}) },
      flashcardRatings: parsed.flashcardRatings || {},
      noteByModule: parsed.noteByModule || {},
      quizHistory: parsed.quizHistory || [],
    };
  } catch {
    return structuredClone(defaultState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function percent(value, total) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

function moduleById(id) {
  return content.modules.find((module) => module.id === id) || content.modules[0];
}

function latestQuiz() {
  return state.quizHistory[0] || null;
}

function weakTopics() {
  const misses = new Map();
  state.quizHistory.forEach((attempt) => {
    (attempt.incorrect || []).forEach((moduleId) => misses.set(moduleId, (misses.get(moduleId) || 0) + 1));
  });
  return [...misses.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([moduleId, count]) => ({ module: moduleById(moduleId), misses: count }));
}

function studyProgress() {
  const completedChecklist = Object.values(state.checklist).filter(Boolean).length;
  const totalChecklist = Object.keys(defaultChecklist).length;
  const quizScore = state.bestQuizScore || 0;
  const packetPercent = percent(state.lastPacketPage, content.metadata.pageCount || 149);
  return Math.round((completedChecklist / totalChecklist) * 35 + (quizScore / 100) * 45 + (packetPercent / 100) * 20);
}

function nextAction() {
  if (!state.checklist.courseCompleted) return 'Finish the course packet and mark the course complete.';
  if (!state.checklist.examPassed && (state.bestQuizScore || 0) < 80) return 'Run a 30-question timed quiz until your best score is at least 80%.';
  if (!state.checklist.bciFresh) return 'Confirm your BCI report is within the 6-month filing window.';
  if (!state.checklist.applicationFiled) return 'Prepare and file the Ohio notary application with signature, BCI, and course proof.';
  if (!state.checklist.commissionApproved) return 'Watch for approval and update the checklist as soon as the commission is granted.';
  if (!state.checklist.oathCompleted) return 'Schedule and complete the in-person oath before performing notarizations.';
  if (!state.checklist.sealOrdered) return 'Order and receive your seal so you can lawfully begin performing acts.';
  if (!state.checklist.firstRevenueMade) return 'Take your first clean low-risk in-person appointment and invoice it.';
  return 'Start RON setup or direct outreach for repeat business and higher-ticket work.';
}

function blockers() {
  const items = [];
  if (!state.checklist.courseCompleted) items.push('Course not marked complete');
  if ((state.bestQuizScore || 0) < 80) items.push('Best practice-quiz score is still below 80%');
  if (!state.checklist.bciFresh) items.push('BCI freshness not confirmed');
  if (!state.checklist.oathCompleted && state.checklist.commissionApproved) items.push('Oath still pending after approval');
  if (!state.checklist.sealOrdered && state.checklist.commissionApproved) items.push('Seal not ordered/received');
  return items;
}

function shuffle(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function allQuestions() {
  return content.modules.flatMap((module) => module.questions.map((question) => ({ ...question, moduleId: module.id, moduleTitle: module.title })));
}

function allFlashcards() {
  return content.modules.flatMap((module) => module.flashcards.map((card) => ({ ...card, moduleId: module.id, moduleTitle: module.title })));
}

function renderApp() {
  renderNavigation();
  renderDashboard();
  renderPacket();
  renderModules();
  renderFlashcards();
  renderQuiz();
  renderCram();
  renderChecklist();
  renderOperations();
}

function renderNavigation() {
  document.querySelectorAll('.nav-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.section === state.activeSection);
    button.onclick = () => {
      state.activeSection = button.dataset.section;
      saveState();
      document.querySelectorAll('.page-section').forEach((section) => section.classList.remove('active'));
      document.getElementById(state.activeSection).classList.add('active');
      renderApp();
    };
  });
}

function renderDashboard() {
  const latest = latestQuiz();
  const weak = weakTopics();
  const section = document.getElementById('dashboard');
  const progress = studyProgress();
  const blockerList = blockers();
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Start Here</p>
        <h2>Pass the course, finish licensing, then generate revenue.</h2>
        <p class="muted">This regular macOS app keeps the full course packet, practice bank, checklist, and the live operations dashboard in one place.</p>
      </div>
      <div class="action-row">
        <button class="button" id="resume-study-btn">Resume packet</button>
        <button class="secondary-button" id="start-full-quiz-btn">Start 30-question quiz</button>
      </div>
    </div>
    <div class="info-banner priority-card">
      <p class="eyebrow">Next action</p>
      <h3>${nextAction()}</h3>
      <div class="progress-track"><div class="progress-bar" style="width:${progress}%"></div></div>
      <p class="muted">Overall prep + launch progress: <strong>${progress}%</strong></p>
    </div>
    <div class="metrics-grid">
      <article class="mini-card">
        <p class="eyebrow">Best quiz score</p>
        <div class="stat-value ${scoreClass(state.bestQuizScore || 0)}">${state.bestQuizScore ?? '—'}${state.bestQuizScore != null ? '%' : ''}</div>
        <p class="muted">Pass target is 80%.</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Latest quiz</p>
        <div class="stat-value ${scoreClass(latest?.score || 0)}">${latest ? `${latest.score}%` : '—'}</div>
        <p class="muted">${latest ? latest.label : 'No attempts yet.'}</p>
      </article>
      <article class="mini-card">
        <p class="eyebrow">Packet progress</p>
        <div class="stat-value">${state.lastPacketPage}/${content.metadata.pageCount}</div>
        <p class="muted">Resume on page ${state.lastPacketPage}.</p>
      </article>
    </div>
    <div class="grid-2" style="margin-top:18px;">
      <article class="card">
        <p class="eyebrow">Current blockers</p>
        ${blockerList.length ? `<ul class="cram-list">${blockerList.map((item) => `<li>${item}</li>`).join('')}</ul>` : '<p>No current blockers. Keep drilling until your scores are stable.</p>'}
      </article>
      <article class="card">
        <p class="eyebrow">Weak topics</p>
        ${weak.length ? `<ul class="cram-list">${weak.map((entry) => `<li><strong>${entry.module.title}</strong> — missed ${entry.misses} time(s)</li>`).join('')}</ul>` : '<p>No weak-topic pattern yet. Take a quiz first.</p>'}
      </article>
    </div>
    <div class="grid-3" style="margin-top:18px;">
      <article class="card">
        <p class="eyebrow">Must memorize</p>
        <ul class="cram-list">
          <li>30 questions</li>
          <li>1 hour</li>
          <li>80% to pass</li>
          <li>30-day retake window</li>
        </ul>
      </article>
      <article class="card">
        <p class="eyebrow">Fee caps</p>
        <ul class="cram-list">
          <li>$5 non-online act</li>
          <li>$30 online act</li>
          <li>$10 RON tech fee</li>
          <li>Travel must be separately agreed in advance</li>
        </ul>
      </article>
      <article class="card">
        <p class="eyebrow">Highest-risk mistakes</p>
        <ul class="cram-list">
          <li>Notarizing incomplete documents</li>
          <li>Skipping personal appearance</li>
          <li>Confusing acknowledgment and jurat</li>
          <li>Touching incomplete vehicle title sections</li>
        </ul>
      </article>
    </div>
  `;

  document.getElementById('resume-study-btn').onclick = () => {
    state.activeSection = 'packet';
    saveState();
    renderApp();
  };
  document.getElementById('start-full-quiz-btn').onclick = () => startQuiz('all', 30, true);
}

function renderPacket() {
  const section = document.getElementById('packet');
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Course packet</p>
        <h2>Resume your paid packet where you left off.</h2>
        <p class="muted">Use the page box to keep your place. The packet stays bundled inside this app.</p>
      </div>
      <div class="packet-actions action-row">
        <a class="button" href="${DEFAULT_PDF}#page=${state.lastPacketPage}" target="_blank" rel="noreferrer">Open PDF in new tab</a>
        <a class="secondary-button" href="${DEFAULT_PDF}" download>Download local copy</a>
      </div>
    </div>
    <div class="grid-2">
      <article class="card">
        <p class="eyebrow">Resume page</p>
        <label>Last page reviewed
          <input id="packet-page-input" type="number" min="1" max="${content.metadata.pageCount}" value="${state.lastPacketPage}" />
        </label>
        <div class="button-row" style="margin-top:12px;">
          <button class="button" id="update-packet-page">Update page</button>
          <button class="secondary-button" id="jump-cram">Open final cram instead</button>
        </div>
      </article>
      <article class="card">
        <p class="eyebrow">Packet notes</p>
        <label>Quick study note
          <textarea id="packet-note">${state.noteByModule.packet || ''}</textarea>
        </label>
        <div class="button-row" style="margin-top:12px;">
          <button class="button" id="save-packet-note">Save note</button>
        </div>
      </article>
    </div>
    <div class="card" style="margin-top:18px;">
      <iframe class="packet-frame" src="${DEFAULT_PDF}#page=${state.lastPacketPage}" title="Ohio Notary Course Packet"></iframe>
    </div>
  `;
  document.getElementById('update-packet-page').onclick = () => {
    const nextPage = Number(document.getElementById('packet-page-input').value || 1);
    state.lastPacketPage = Math.min(Math.max(nextPage, 1), content.metadata.pageCount);
    saveState();
    renderApp();
  };
  document.getElementById('save-packet-note').onclick = () => {
    state.noteByModule.packet = document.getElementById('packet-note').value;
    saveState();
  };
  document.getElementById('jump-cram').onclick = () => {
    state.activeSection = 'cram';
    saveState();
    renderApp();
  };
}

function renderModules() {
  const section = document.getElementById('modules');
  const cards = content.modules.map((module) => `
    <details class="module-card" ${module.id === state.activeModuleId ? 'open' : ''}>
      <summary>
        <p class="eyebrow">Module ${module.sortOrder / 10}</p>
        <h3>${module.title}</h3>
        <p class="muted">${module.summary}</p>
        <div class="module-meta">
          <span class="tag">Pages ${module.sourcePageStart}-${module.sourcePageEnd}</span>
          <span class="tag">Weight ${module.examWeight}/5</span>
          <span class="tag">${module.flashcards.length} flashcards</span>
          <span class="tag">${module.questions.length} practice questions</span>
        </div>
      </summary>
      <div class="module-columns">
        <div>
          <p class="eyebrow">Exam-critical rules</p>
          <ul class="rule-list">
            ${module.rules.map((rule) => `<li><strong>${rule.ruleText}</strong><div class="rule-page">Pages ${rule.sourcePages}${rule.isHighPriority ? ' · HIGH PRIORITY' : ''}</div></li>`).join('')}
          </ul>
        </div>
        <div>
          <p class="eyebrow">What to remember</p>
          <ul class="check-list">${module.checklistBullets.map((item) => `<li>${item}</li>`).join('')}</ul>
          <p class="eyebrow" style="margin-top:18px;">Common mistakes</p>
          <ul class="mistake-list">${module.commonMistakes.map((item) => `<li>${item}</li>`).join('')}</ul>
          <p class="eyebrow" style="margin-top:18px;">Key terms</p>
          <div class="tag-row">${module.keyTerms.map((term) => `<span class="tag">${term}</span>`).join('')}</div>
          <div class="button-row" style="margin-top:16px;">
            <button class="button" data-module-open="${module.id}">Study this module</button>
            <button class="secondary-button" data-module-quiz="${module.id}">Quiz this module</button>
          </div>
        </div>
      </div>
    </details>
  `).join('');

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Study modules</p>
        <h2>Everything you need to pass the Ohio notary course.</h2>
        <p class="muted">These module cards are built from your packet and keep page references attached so you can verify anything fast.</p>
      </div>
      <div class="action-row">
        <button class="button" id="modules-open-packet">Open packet</button>
      </div>
    </div>
    <div class="module-grid">${cards}</div>
  `;

  document.getElementById('modules-open-packet').onclick = () => {
    state.activeSection = 'packet';
    saveState();
    renderApp();
  };

  section.querySelectorAll('[data-module-open]').forEach((button) => {
    button.onclick = () => {
      state.activeModuleId = button.dataset.moduleOpen;
      state.activeSection = 'flashcards';
      state.flashcardIndex = 0;
      state.flashcardShowAnswer = false;
      saveState();
      renderApp();
    };
  });

  section.querySelectorAll('[data-module-quiz]').forEach((button) => {
    button.onclick = () => startQuiz(button.dataset.moduleQuiz, 10, false);
  });
}

function visibleFlashcards() {
  const moduleId = state.activeModuleId;
  const cards = allFlashcards().filter((card) => !moduleId || card.moduleId === moduleId);
  return cards.length ? cards : allFlashcards();
}

function renderFlashcards() {
  const cards = visibleFlashcards();
  const currentCard = cards[state.flashcardIndex % cards.length];
  const section = document.getElementById('flashcards');
  const moduleOptions = content.modules.map((module) => `<option value="${module.id}" ${module.id === state.activeModuleId ? 'selected' : ''}>${module.title}</option>`).join('');
  const rating = state.flashcardRatings[currentCard?.id] || 'unrated';

  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Flashcards</p>
        <h2>Drill the rules until recall is automatic.</h2>
        <p class="muted">Use Easy / Hard to track what needs another pass.</p>
      </div>
      <div class="filter-row">
        <label>Module
          <select id="flashcard-module-select">
            ${moduleOptions}
          </select>
        </label>
      </div>
    </div>
    ${currentCard ? `
      <div class="flash-grid">
        <article class="card flashcard">
          <div>
            <p class="eyebrow">${currentCard.moduleTitle}</p>
            <h3>Card ${state.flashcardIndex + 1} of ${cards.length}</h3>
            <div class="flashcard-face">
              <p class="flashcard-label">Prompt</p>
              <p>${currentCard.prompt}</p>
            </div>
            ${state.flashcardShowAnswer ? `<div class="flashcard-face"><p class="flashcard-label">Answer</p><p>${currentCard.answer}</p><p class="muted">Pages ${currentCard.sourcePages}</p></div>` : ''}
          </div>
          <div class="button-row">
            <button class="button" id="flashcard-flip">${state.flashcardShowAnswer ? 'Hide answer' : 'Show answer'}</button>
            <button class="secondary-button" id="flashcard-prev">Previous</button>
            <button class="secondary-button" id="flashcard-next">Next</button>
          </div>
        </article>
        <article class="card">
          <p class="eyebrow">Rating</p>
          <div class="button-row">
            <button class="choice-button ${rating === 'easy' ? 'selected' : ''}" id="flashcard-easy">Easy</button>
            <button class="choice-button ${rating === 'hard' ? 'selected' : ''}" id="flashcard-hard">Hard</button>
            <button class="choice-button ${rating === 'revisit' ? 'selected' : ''}" id="flashcard-revisit">Revisit</button>
          </div>
          <p class="eyebrow" style="margin-top:18px;">Study note</p>
          <textarea id="flashcard-note">${state.noteByModule[currentCard.moduleId] || ''}</textarea>
          <div class="button-row" style="margin-top:12px;">
            <button class="button" id="save-flash-note">Save note</button>
            <button class="secondary-button" id="flashcard-open-module">Open module outline</button>
          </div>
        </article>
      </div>
    ` : '<div class="card"><p>No flashcards available.</p></div>'}
  `;

  document.getElementById('flashcard-module-select').onchange = (event) => {
    state.activeModuleId = event.target.value;
    state.flashcardIndex = 0;
    state.flashcardShowAnswer = false;
    saveState();
    renderApp();
  };

  if (!currentCard) return;
  document.getElementById('flashcard-flip').onclick = () => {
    state.flashcardShowAnswer = !state.flashcardShowAnswer;
    saveState();
    renderApp();
  };
  document.getElementById('flashcard-prev').onclick = () => {
    state.flashcardIndex = (state.flashcardIndex - 1 + cards.length) % cards.length;
    state.flashcardShowAnswer = false;
    saveState();
    renderApp();
  };
  document.getElementById('flashcard-next').onclick = () => {
    state.flashcardIndex = (state.flashcardIndex + 1) % cards.length;
    state.flashcardShowAnswer = false;
    saveState();
    renderApp();
  };
  ['easy', 'hard', 'revisit'].forEach((value) => {
    document.getElementById(`flashcard-${value}`).onclick = () => {
      state.flashcardRatings[currentCard.id] = value;
      saveState();
      renderApp();
    };
  });
  document.getElementById('save-flash-note').onclick = () => {
    state.noteByModule[currentCard.moduleId] = document.getElementById('flashcard-note').value;
    saveState();
  };
  document.getElementById('flashcard-open-module').onclick = () => {
    state.activeSection = 'modules';
    saveState();
    renderApp();
  };
}

function startQuiz(scope, count, timed) {
  const sourceQuestions = scope === 'all'
    ? allQuestions()
    : allQuestions().filter((question) => question.moduleId === scope);
  const picked = shuffle(sourceQuestions).slice(0, Math.min(count, sourceQuestions.length)).map((question) => ({ ...question, selected: null }));
  currentQuiz = {
    scope,
    label: scope === 'all' ? `${count}-question full quiz` : `${moduleById(scope).title} quiz`,
    timed,
    startedAt: Date.now(),
    questions: picked,
  };
  state.activeSection = 'quiz';
  saveState();
  renderApp();
}

function renderQuiz() {
  const section = document.getElementById('quiz');
  const moduleOptions = content.modules.map((module) => `<option value="${module.id}">${module.title}</option>`).join('');
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Practice quiz</p>
        <h2>Train for an 80%+ score before you sit for the real test.</h2>
        <p class="muted">Run a 10-question module quiz or a 30-question full exam simulation.</p>
      </div>
      <div class="action-row">
        <button class="button" id="quiz-full">Start 30-question exam</button>
      </div>
    </div>
    <div class="grid-2">
      <article class="card">
        <p class="eyebrow">Quick module quiz</p>
        <label>Choose module
          <select id="quiz-module-select">${moduleOptions}</select>
        </label>
        <div class="button-row" style="margin-top:12px;">
          <button class="button" id="quiz-module-start">Start 10-question quiz</button>
        </div>
      </article>
      <article class="card">
        <p class="eyebrow">Score history</p>
        ${state.quizHistory.length ? `<ul class="cram-list">${state.quizHistory.slice(0, 5).map((attempt) => `<li><strong>${attempt.score}%</strong> — ${attempt.label} <span class="muted">(${new Date(attempt.finishedAt).toLocaleString()})</span></li>`).join('')}</ul>` : '<p>No attempts yet.</p>'}
      </article>
    </div>
    ${currentQuiz ? renderCurrentQuizMarkup() : ''}
  `;

  document.getElementById('quiz-full').onclick = () => startQuiz('all', 30, true);
  document.getElementById('quiz-module-start').onclick = () => startQuiz(document.getElementById('quiz-module-select').value, 10, false);

  if (currentQuiz) {
    wireQuizChoices();
  }
}

function renderCurrentQuizMarkup() {
  return `
    <div class="card" style="margin-top:18px;">
      <p class="eyebrow">Current quiz</p>
      <h3>${currentQuiz.label}</h3>
      <p class="muted">${currentQuiz.timed ? 'Treat this like the real exam: 30 questions in 1 hour.' : 'Use this to tighten one topic fast.'}</p>
      <div id="quiz-result-anchor"></div>
      <div class="quiz-grid" style="grid-template-columns: 1fr; margin-top:16px;">
        ${currentQuiz.questions.map((question, index) => `
          <article class="quiz-question" data-question-id="${question.id}">
            <p class="eyebrow">Question ${index + 1}</p>
            <h3>${question.question}</h3>
            <p class="muted">${question.moduleTitle} · Pages ${question.sourcePages}</p>
            <div class="button-row" style="display:block; margin-top:10px;">
              ${question.choices.map((choice, choiceIndex) => {
                const letter = LETTERS[choiceIndex];
                const selected = question.selected === letter ? 'selected' : '';
                return `<button class="choice-button ${selected}" data-question="${question.id}" data-choice="${letter}"><strong>${letter}.</strong> ${choice}</button>`;
              }).join('')}
            </div>
            <div class="quiz-explanation hidden"></div>
          </article>
        `).join('')}
      </div>
      <div class="button-row" style="margin-top:18px;">
        <button class="button" id="submit-quiz">Grade quiz</button>
      </div>
    </div>
  `;
}

function wireQuizChoices() {
  document.querySelectorAll('[data-question]').forEach((button) => {
    button.onclick = () => {
      const question = currentQuiz.questions.find((entry) => entry.id === button.dataset.question);
      question.selected = button.dataset.choice;
      renderApp();
    };
  });
  document.getElementById('submit-quiz').onclick = () => gradeQuiz();
}

function gradeQuiz() {
  if (!currentQuiz) return;
  let correct = 0;
  const incorrectModules = [];

  currentQuiz.questions.forEach((question) => {
    if (question.selected === question.correctChoice) {
      correct += 1;
    } else {
      incorrectModules.push(question.moduleId);
    }
  });

  const score = percent(correct, currentQuiz.questions.length);
  const result = {
    label: currentQuiz.label,
    score,
    finishedAt: Date.now(),
    incorrect: incorrectModules,
  };
  state.quizHistory.unshift(result);
  state.latestQuizScore = score;
  state.bestQuizScore = Math.max(state.bestQuizScore || 0, score);
  saveState();

  const anchor = document.getElementById('quiz-result-anchor');
  anchor.innerHTML = `
    <div class="quiz-result">
      <p class="eyebrow">Result</p>
      <h3 class="${scoreClass(score)}">${score}%</h3>
      <p>${score >= 80 ? 'Passing practice score. Keep drilling weak topics so this becomes repeatable.' : 'Below the 80% target. Review the explanations and retest before moving on.'}</p>
    </div>
  `;

  currentQuiz.questions.forEach((question) => {
    const questionNode = document.querySelector(`[data-question-id="${question.id}"]`);
    questionNode.querySelectorAll('.choice-button').forEach((button) => {
      const choice = button.dataset.choice;
      if (choice === question.correctChoice) button.classList.add('correct');
      if (choice === question.selected && choice !== question.correctChoice) button.classList.add('incorrect');
    });
    const explanation = questionNode.querySelector('.quiz-explanation');
    explanation.classList.remove('hidden');
    explanation.innerHTML = `
      <p><strong>Correct answer:</strong> ${question.correctChoice}</p>
      <p>${question.explanation}</p>
      <p class="muted">Source pages: ${question.sourcePages}</p>
    `;
  });

  currentQuiz = null;
}

function renderCram() {
  const cram = content.cramSheets[0];
  const blocks = cram.contentMarkdown
    .split('\n## ')
    .map((block, index) => (index === 0 ? block.replace('# ', '') : block))
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [title, ...rest] = block.split('\n');
      const bullets = rest.filter(Boolean).map((line) => line.replace(/^-\s*/, '')).map((line) => `<li>${line}</li>`).join('');
      return `<article class="cram-block"><h3>${title}</h3><ul class="cram-list">${bullets}</ul></article>`;
    }).join('');

  const section = document.getElementById('cram');
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Final cram</p>
        <h2>Compressed review for the night before and the hour before the test.</h2>
        <p class="muted">Use this after you already know the packet structure. This is the shortest path to a last-pass review.</p>
      </div>
      <div class="action-row">
        <button class="button" id="cram-open-quiz">Run a quiz after this</button>
      </div>
    </div>
    <div class="module-grid">${blocks}</div>
  `;
  document.getElementById('cram-open-quiz').onclick = () => startQuiz('all', 30, true);
}

function renderChecklist() {
  const items = [
    ['coursePaid', 'Course paid'],
    ['courseCompleted', 'Course completed'],
    ['examPassed', 'Exam passed'],
    ['bciFresh', 'BCI within 6 months'],
    ['applicationFiled', 'Application filed'],
    ['commissionApproved', 'Commission approved'],
    ['oathCompleted', 'Oath completed in person'],
    ['sealOrdered', 'Seal ordered / received'],
    ['ronCourseComplete', 'RON course complete'],
    ['ronFiled', 'RON authorization filed'],
    ['ronToolsReady', 'RON tools configured'],
    ['businessSetupStarted', 'Business setup basics started'],
    ['firstRevenueMade', 'First notary revenue generated'],
  ];
  const section = document.getElementById('checklist');
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Licensing checklist</p>
        <h2>Use this to move from course prep to an active revenue-ready commission.</h2>
        <p class="muted">This is your real-world execution layer, separate from the exam memorization layer.</p>
      </div>
    </div>
    <div class="checklist-grid">
      ${items.map(([key, label]) => `
        <label class="checklist-item">
          <input type="checkbox" data-checklist="${key}" ${state.checklist[key] ? 'checked' : ''} />
          <div>
            <h3>${label}</h3>
            <p class="muted">${checklistHelp(key)}</p>
          </div>
        </label>
      `).join('')}
    </div>
  `;
  section.querySelectorAll('[data-checklist]').forEach((input) => {
    input.onchange = () => {
      state.checklist[input.dataset.checklist] = input.checked;
      saveState();
      renderApp();
    };
  });
}

function checklistHelp(key) {
  const map = {
    coursePaid: 'Already treated as complete because you confirmed the course is paid for.',
    courseCompleted: 'Mark complete when you finish the packet and course modules.',
    examPassed: 'Mark complete after you pass the Ohio notary course test.',
    bciFresh: 'Confirm the BCI report is still within the six-month use window.',
    applicationFiled: 'Secretary of State filing with BCI, signature, and course proof.',
    commissionApproved: 'Use once approval is received.',
    oathCompleted: 'Ohio requires an in-person oath before acting as a notary.',
    sealOrdered: 'You need the seal before performing official duties.',
    ronCourseComplete: 'Separate from the base commission course.',
    ronFiled: 'Separate RON filing after active commission.',
    ronToolsReady: 'E-signature, e-seal, platform, journal, recording storage.',
    businessSetupStarted: 'Pricing, policies, bank account, LLC/EIN as needed.',
    firstRevenueMade: 'First paid act completed, journaled, and invoiced.',
  };
  return map[key] || '';
}

function renderOperations() {
  const section = document.getElementById('operations');
  section.innerHTML = `
    <div class="page-header">
      <div>
        <p class="eyebrow">Operations</p>
        <h2>Jump into the live Notary OS dashboard when you need business workflows.</h2>
        <p class="muted">Study stays private in this app. Operations stay in the deployed web system.</p>
      </div>
      <div class="action-row">
        <a class="button" href="${OPERATIONS_URL}" target="_blank" rel="noreferrer">Open live dashboard</a>
      </div>
    </div>
    <div class="operations-grid">
      <article class="card">
        <p class="eyebrow">Use the web dashboard for</p>
        <ul class="cram-list">
          <li>Bookings and quotes</li>
          <li>Clients and invoices</li>
          <li>Compliance workflow</li>
          <li>RON session tracking</li>
          <li>Analytics and revenue tracking</li>
        </ul>
      </article>
      <article class="card">
        <p class="eyebrow">Use this Mac app for</p>
        <ul class="cram-list">
          <li>Passing the course</li>
          <li>Memorizing Ohio rules</li>
          <li>Quiz repetition</li>
          <li>Weak-topic repair</li>
          <li>Licensing execution tracking</li>
        </ul>
      </article>
      <article class="card">
        <p class="eyebrow">Best next move</p>
        <p>${nextAction()}</p>
      </article>
    </div>
  `;
}

function scoreClass(score) {
  if (score >= 80) return 'score-good';
  if (score >= 65) return 'score-mid';
  return 'score-low';
}

document.getElementById(state.activeSection).classList.add('active');
renderApp();
