/**
 * Deep Thought — Daily Cadence
 * app.js — State machine for Daily Plan & Daily Report
 *
 * ┌─────────────────────────────────────────────────────────┐
 * │  STATE MAP                                              │
 * │                                                         │
 * │  PLAN                                                   │
 * │  ① plan:empty   → btn "Add first task"                 │
 * │  ② plan:entry   → fill form → "Add" → tasks appear     │
 * │  ③ plan:filled  → review tasks → "Submit Daily Plan"   │
 * │                                                         │
 * │  REPORT                                                 │
 * │  ④ report:your-work   → mark status + actual time      │
 * │  ⑤ report:unplanned   → chip/text + time               │
 * │  ⑥ report:challenged  → chips + textarea → submit      │
 * └─────────────────────────────────────────────────────────┘
 */

// ─────────────────────────────────────────────
// Types (JSDoc, no build step needed)
// ─────────────────────────────────────────────

/**
 * @typedef {'done' | 'carry' | 'drop' | null} DeliverableStatus
 *
 * @typedef {{
 *   id: string,
 *   label: string,
 *   estimatedTime: string,
 *   isPriority: boolean
 * }} Task
 *
 * @typedef {{
 *   id: string,
 *   label: string,
 *   status: DeliverableStatus,
 *   actualTime: string
 * }} Deliverable
 *
 * @typedef {{
 *   tasks: Task[],
 *   deliverables: Deliverable[],
 *   unplanned: { label: string, time: string }[],
 *   challenges: string[],
 *   challengeNote: string
 * }} AppState
 */

// ─────────────────────────────────────────────
// App State
// ─────────────────────────────────────────────

/** @type {AppState} */
const state = {
  tasks: [],
  deliverables: [],
  unplanned: [],
  challenges: [],
  challengeNote: '',
};

// Current time estimate (minutes) for plan entry
let planEntryMinutes = 60;

// Current time estimate for unplanned entry
let unplannedMinutes = 30;

// ─────────────────────────────────────────────
// Utility
// ─────────────────────────────────────────────

/** Generate a simple unique ID */
const uid = () => Math.random().toString(36).slice(2, 8);

/** Format minutes to readable string */
const fmtTime = (min) => {
  if (min < 60) return `${min}m`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};

/** Adjust minutes by a delta chip value */
const parseDelta = (val) => {
  const sign = val.startsWith('-') ? -1 : 1;
  const raw  = val.replace(/^[+-]/, '');
  const mins = raw.endsWith('h') ? parseInt(raw) * 60 : parseInt(raw);
  return sign * mins;
};

// ─────────────────────────────────────────────
// DOM helpers
// ─────────────────────────────────────────────

/** @param {string} id @returns {HTMLElement} */
const el = (id) => document.getElementById(id);

/** Toggle display of an element */
const show = (elem) => elem.classList.remove('hidden');
const hide = (elem) => elem.classList.add('hidden');

// ─────────────────────────────────────────────
// Navigation
// ─────────────────────────────────────────────

const navPlan   = el('nav-daily-plan');
const navReport = el('nav-daily-report');
const modulePlan   = el('module-plan');
const moduleReport = el('module-report');

/**
 * Switch top-level module
 * @param {'plan' | 'report'} target
 */
function switchModule(target) {
  if (target === 'plan') {
    show(modulePlan);
    hide(moduleReport);
    navPlan.classList.add('active');
    navReport.classList.remove('active');
  } else {
    hide(modulePlan);
    show(moduleReport);
    navReport.classList.add('active');
    navPlan.classList.remove('active');
  }
}

navPlan.addEventListener('click',   () => switchModule('plan'));
navReport.addEventListener('click', () => {
  // Convert tasks → deliverables on first entry
  if (state.deliverables.length === 0 && state.tasks.length > 0) {
    state.deliverables = state.tasks.map((t) => ({
      id:         t.id,
      label:      t.label,
      status:     null,
      actualTime: t.estimatedTime,
    }));
  }
  switchModule('report');
  renderDeliverables();
  activateReportPane('pane-your-work', 33);
});

// Set initial active state
navPlan.classList.add('active');

// ─────────────────────────────────────────────
// Greeting
// ─────────────────────────────────────────────

(function setGreeting() {
  const hour = new Date().getHours();
  const part = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
  el('greeting-text').textContent = `Good ${part}, mithradevi-b55d`;
})();

// ─────────────────────────────────────────────
// ① STATE: plan:empty
// ─────────────────────────────────────────────

el('btn-start-plan').addEventListener('click', () => {
  transitionPlan('entry');
});

// ─────────────────────────────────────────────
// ② STATE: plan:entry
// ─────────────────────────────────────────────

// Time chips for plan entry
el('time-chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.time-chip');
  if (!chip) return;

  const val = chip.dataset.value;
  const absMatch = val.match(/^(\d+)(h|m)$/);
  if (absMatch) {
    // Absolute value chip
    planEntryMinutes = absMatch[2] === 'h' ? parseInt(absMatch[1]) * 60 : parseInt(absMatch[1]);
  } else {
    // Delta chip
    planEntryMinutes = Math.max(15, planEntryMinutes + parseDelta(val));
  }

  el('time-chips').querySelectorAll('.time-chip').forEach(c => c.classList.remove('time-chip--selected'));
  chip.classList.add('time-chip--selected');
  el('time-display').textContent = fmtTime(planEntryMinutes);
});

el('btn-add-task').addEventListener('click', addTask);
el('btn-cancel-task').addEventListener('click', () => {
  if (state.tasks.length === 0) {
    transitionPlan('empty');
  } else {
    transitionPlan('filled');
  }
});

el('task-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

function addTask() {
  const label = el('task-input').value.trim();
  if (!label) {
    el('task-input').focus();
    el('task-input').style.borderColor = 'var(--danger)';
    setTimeout(() => el('task-input').style.borderColor = '', 1200);
    return;
  }

  const isPriority = el('priority-toggle').checked;

  /** @type {Task} */
  const task = {
    id:            uid(),
    label,
    estimatedTime: fmtTime(planEntryMinutes),
    isPriority,
  };
  state.tasks.push(task);

  // Reset form
  el('task-input').value = '';
  el('priority-toggle').checked = false;

  transitionPlan('filled');
}

// ─────────────────────────────────────────────
// ③ STATE: plan:filled
// ─────────────────────────────────────────────

el('btn-add-more').addEventListener('click', () => {
  transitionPlan('entry');
});

el('btn-confirm-plan').addEventListener('click', () => {
  // Plan submitted — switch to report
  switchModule('report');
  navReport.classList.add('active');
  navPlan.classList.remove('active');

  // Seed deliverables
  state.deliverables = state.tasks.map((t) => ({
    id:         t.id,
    label:      t.label,
    status:     null,
    actualTime: t.estimatedTime,
  }));

  renderDeliverables();
  activateReportPane('pane-your-work', 33);
});

// ─────────────────────────────────────────────
// Render helpers — Plan
// ─────────────────────────────────────────────

function renderPlanTaskList() {
  ['plan-task-list', 'plan-filled-list'].forEach((listId) => {
    const container = el(listId);
    if (!container) return;
    container.innerHTML = '';

    state.tasks.forEach((task) => {
      const item = document.createElement('div');
      item.className = `task-item${task.isPriority ? ' task-item--priority' : ''}`;
      item.dataset.id = task.id;
      item.innerHTML = `
        <span class="task-item__star${task.isPriority ? ' active' : ''}" title="Mark as priority">★</span>
        <span class="task-item__label">${escHtml(task.label)}</span>
        <span class="task-item__time">${task.estimatedTime}</span>
        <button class="task-item__remove" title="Remove">×</button>
      `;

      // Star toggle
      item.querySelector('.task-item__star').addEventListener('click', () => {
        task.isPriority = !task.isPriority;
        renderPlanTaskList();
      });

      // Remove
      item.querySelector('.task-item__remove').addEventListener('click', () => {
        state.tasks = state.tasks.filter(t => t.id !== task.id);
        if (state.tasks.length === 0) {
          transitionPlan('empty');
        } else {
          renderPlanTaskList();
        }
      });

      container.appendChild(item);
    });
  });
}

// ─────────────────────────────────────────────
// Plan state transitions
// ─────────────────────────────────────────────

/** @param {'empty' | 'entry' | 'filled'} to */
function transitionPlan(to) {
  hide(el('state-plan-empty'));
  hide(el('state-plan-entry'));
  hide(el('state-plan-filled'));

  el(`state-plan-${to}`).classList.remove('hidden');

  if (to === 'filled') {
    renderPlanTaskList();
  }
  if (to === 'entry') {
    renderPlanTaskList(); // show existing tasks above form
    el('task-input').focus();
  }
}

// ─────────────────────────────────────────────
// ④ STATE: report:your-work
// ─────────────────────────────────────────────

function renderDeliverables() {
  const container = el('deliverable-list');
  container.innerHTML = '';

  state.deliverables.forEach((d) => {
    const item = document.createElement('div');
    item.className = 'deliverable-item';
    item.innerHTML = `
      <span class="deliverable-item__label">${escHtml(d.label)}</span>
      <div class="deliverable-item__status">
        <button class="status-btn${d.status === 'done'  ? ' done'  : ''}" data-status="done"  data-id="${d.id}">Done</button>
        <button class="status-btn${d.status === 'carry' ? ' carry' : ''}" data-status="carry" data-id="${d.id}">Carry</button>
        <button class="status-btn${d.status === 'drop'  ? ' drop'  : ''}" data-status="drop"  data-id="${d.id}">Drop</button>
      </div>
      <div class="deliverable-item__actual-time">
        <span>Actual:</span>
        <input class="actual-time-input" type="text" value="${d.actualTime}" placeholder="e.g. 1h" data-id="${d.id}"/>
      </div>
    `;

    // Status buttons
    item.querySelectorAll('.status-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const deliverable = state.deliverables.find(x => x.id === btn.dataset.id);
        if (deliverable) deliverable.status = /** @type {DeliverableStatus} */ (btn.dataset.status);
        renderDeliverables();
      });
    });

    // Actual time input
    item.querySelector('.actual-time-input').addEventListener('change', (e) => {
      const deliverable = state.deliverables.find(x => x.id === e.target.dataset.id);
      if (deliverable) deliverable.actualTime = e.target.value;
    });

    container.appendChild(item);
  });
}

el('btn-to-unplanned').addEventListener('click', () => {
  activateReportPane('pane-unplanned', 66);
});

// ─────────────────────────────────────────────
// ⑤ STATE: report:unplanned
// ─────────────────────────────────────────────

// Multi-select chips for unplanned reasons
el('unplanned-chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  chip.classList.toggle('selected');
});

// Time chips for unplanned
el('unplanned-time-chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.time-chip');
  if (!chip) return;

  const val = chip.dataset.value;
  const absMatch = val.match(/^(\d+)(h|m)$/);
  if (absMatch) {
    unplannedMinutes = absMatch[2] === 'h' ? parseInt(absMatch[1]) * 60 : parseInt(absMatch[1]);
  } else {
    unplannedMinutes = Math.max(15, unplannedMinutes + parseDelta(val));
  }

  el('unplanned-time-chips').querySelectorAll('.time-chip').forEach(c => c.classList.remove('time-chip--selected'));
  chip.classList.add('time-chip--selected');
  el('unplanned-time-display').textContent = fmtTime(unplannedMinutes);
});

el('btn-add-unplanned').addEventListener('click', () => {
  const customLabel = el('unplanned-input').value.trim();
  const chipLabels  = [...el('unplanned-chips').querySelectorAll('.chip.selected')].map(c => c.dataset.value);
  const allLabels   = [...chipLabels, ...(customLabel ? [customLabel] : [])];

  if (allLabels.length > 0) {
    state.unplanned.push(...allLabels.map(label => ({ label, time: fmtTime(unplannedMinutes) })));
  }

  activateReportPane('pane-challenged', 100);
});

el('btn-skip-unplanned').addEventListener('click', () => {
  activateReportPane('pane-challenged', 100);
});

// ─────────────────────────────────────────────
// ⑥ STATE: report:challenged
// ─────────────────────────────────────────────

el('challenge-chips').addEventListener('click', (e) => {
  const chip = e.target.closest('.chip');
  if (!chip) return;
  chip.classList.toggle('selected');
});

el('btn-submit-report').addEventListener('click', () => {
  // Collect challenges
  state.challenges = [...el('challenge-chips').querySelectorAll('.chip.selected')].map(c => c.dataset.value);
  state.challengeNote = el('challenge-text').value.trim();

  console.log('[Deep Thought] Report submitted:', JSON.stringify(state, null, 2));

  activateReportPane('pane-success', 100);
});

el('btn-view-summary').addEventListener('click', () => {
  // Reset to plan empty for demo purposes
  state.tasks = [];
  state.deliverables = [];
  state.unplanned = [];
  state.challenges = [];
  state.challengeNote = '';
  switchModule('plan');
  transitionPlan('empty');
});

// ─────────────────────────────────────────────
// Report pane transitions
// ─────────────────────────────────────────────

const REPORT_PANES = ['pane-your-work', 'pane-unplanned', 'pane-challenged', 'pane-success'];

const PANE_TAB_MAP = {
  'pane-your-work':  'your-work',
  'pane-unplanned':  'unplanned',
  'pane-challenged': 'challenged',
  'pane-success':    'challenged',
};

/**
 * Show a specific report pane and update progress
 * @param {string} paneId
 * @param {number} progressPct
 */
function activateReportPane(paneId, progressPct) {
  REPORT_PANES.forEach(id => el(id).classList.add('hidden'));
  el(paneId).classList.remove('hidden');

  el('report-progress-fill').style.width = `${progressPct}%`;

  // Update tab highlight
  document.querySelectorAll('.report-tab').forEach(tab => {
    tab.classList.remove('report-tab--active');
    if (tab.dataset.tab === PANE_TAB_MAP[paneId]) {
      tab.classList.add('report-tab--active');
    }
  });
}

// Tab click (read-only navigation within report)
document.querySelectorAll('.report-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const tabId = tab.dataset.tab;
    const paneMap = {
      'your-work':  { pane: 'pane-your-work',  pct: 33  },
      'unplanned':  { pane: 'pane-unplanned',  pct: 66  },
      'challenged': { pane: 'pane-challenged', pct: 100 },
    };
    if (paneMap[tabId]) {
      activateReportPane(paneMap[tabId].pane, paneMap[tabId].pct);
      if (tabId === 'your-work') renderDeliverables();
    }
  });
});

// ─────────────────────────────────────────────
// Security helpers
// ─────────────────────────────────────────────

/** Escape HTML to prevent XSS */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─────────────────────────────────────────────
// Bootstrap — start in plan:empty
// ─────────────────────────────────────────────

transitionPlan('empty');
