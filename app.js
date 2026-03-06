// IncMan Dashboard — app.js
const PASSWORD = 'TheDreamer!Joining12#';
const STORAGE_KEY = 'incman_tasks_v2';
const NOTES_KEY = 'incman_notes_v1';

let tasks = [];
let editingId = null;

const DEFAULT_TASKS = [
  // CRITIQUE
  { id: 1, title: "Lire la convention d'actionnaires DVOLU — non-concurrence, non-sollicitation, IP", priority: 'critical', cat: 'legal', who: 'benoit', phase: '1', completed: false, notes: 'BLOCKER pour tout le reste. Identifier: durée, territoire, secteurs exclus, clause IP.' },
  // IMPORTANT - Legal
  { id: 2, title: "Décider: Inc. provinciale (LSAQ) vs fédérale (LCSA) pour Benoit Opco", priority: 'high', cat: 'legal', who: 'benoit', phase: '1', completed: false, notes: '' },
  { id: 3, title: "Incorporer Benoit Opco", priority: 'high', cat: 'legal', who: 'benoit', phase: '1', completed: false, notes: 'Notaire ou Registraire des entreprises du Québec (REQ). Budget: ~500-1500$.' },
  { id: 4, title: "Vérifier structure Jay Opco — compatibilité avec plan 50/50", priority: 'high', cat: 'legal', who: 'jay', phase: '1', completed: false, notes: 'Vérifier type de compagnie, actionnaires existants, clauses restrictives.' },
  { id: 5, title: "Incorporer la Cie Commune (50/50 Benoit Opco + Jay Opco)", priority: 'high', cat: 'legal', who: 'both', phase: '1', completed: false, notes: 'Cie pour SaaS + projets conjoints + futurs employés.' },
  { id: 6, title: "Rédiger convention d'actionnaires Cie Commune", priority: 'high', cat: 'legal', who: 'both', phase: '1', completed: false, notes: 'Clauses: shotgun, drag-along, tag-along, IP assignation, dissolution, vesting.' },
  // IMPORTANT - Fiscal
  { id: 7, title: "Ouvrir comptes bancaires business (x3 compagnies)", priority: 'high', cat: 'fiscal', who: 'both', phase: '1', completed: false, notes: 'RBC, Desjardins ou Banque Nationale recommandées pour PME QC.' },
  { id: 8, title: "Inscription TPS/TVQ (si revenus prévus > 30K$)", priority: 'high', cat: 'fiscal', who: 'both', phase: '1', completed: false, notes: 'ARC + Revenu Québec. Délai: faire avant premières factures.' },
  { id: 9, title: "Rencontrer un CPA — planification fiscale année 1", priority: 'high', cat: 'fiscal', who: 'both', phase: '1', completed: false, notes: 'Sujets: salaire vs dividendes, REER, DPE, RS&DE admissibilité.' },
  // À FAIRE - Offre services
  { id: 10, title: "Définir offre de services Benoit solo (consulting AI + sécurité machine)", priority: 'medium', cat: 'offre', who: 'benoit', phase: '1', completed: false, notes: '' },
  { id: 11, title: "Définir offre conjointe Benoit + Jay (AI industriel, ERP, etc.)", priority: 'medium', cat: 'offre', who: 'both', phase: '1', completed: false, notes: '' },
  { id: 12, title: "Fixer les taux journaliers / forfaits", priority: 'medium', cat: 'offre', who: 'both', phase: '1', completed: false, notes: 'Benchmark marché: consultant AI senior QC = 1500-2500$/jour.' },
  { id: 13, title: "Identifier 3-5 premiers prospects (réseau DVOLU + réseau Jay)", priority: 'medium', cat: 'offre', who: 'both', phase: '1', completed: false, notes: 'PME manufacturières QC. LEM, Novago (Jay), réseau Benoit DVOLU.' },
  { id: 14, title: "Site internet + emails pro (@domaine)", priority: 'medium', cat: 'offre', who: 'both', phase: '1', completed: false, notes: 'Simple landing page suffit pour commencer. Emails: prenom@cie.com.' },
  // À FAIRE - Tech
  { id: 15, title: "Contexo v1 fonctionnel — dog-food sur projets internes (avant juin)", priority: 'medium', cat: 'tech', who: 'benoit', phase: '1', completed: false, notes: 'Backend v0.1.1 en prod. 29 stories, 954 tests. Pipeline: Capture → Core → KB → MCP.' },
  // BACKLOG - Phase 2
  { id: 16, title: "Premiers contrats signés via opcos individuelles", priority: 'low', cat: 'offre', who: 'both', phase: '2', completed: false, notes: '' },
  { id: 17, title: "Dog-food Contexo sur projets clients réels (juil-août)", priority: 'low', cat: 'tech', who: 'both', phase: '2', completed: false, notes: '' },
  { id: 18, title: "Dossier RS&DE — crédits R&D AI/SaaS", priority: 'low', cat: 'fiscal', who: 'both', phase: '2', completed: false, notes: 'Contexo (NLP, voice recognition, AI algorithms) est potentiellement admissible.' },
  { id: 19, title: "Beta Contexo — réseau de contacts élargi (sept-oct)", priority: 'low', cat: 'tech', who: 'both', phase: '2', completed: false, notes: '' },
  { id: 20, title: "Lancement international Contexo (nov-déc)", priority: 'low', cat: 'tech', who: 'both', phase: '2', completed: false, notes: 'contexo.app — domaine acheté, expire 2027-02-26.' },
  { id: 21, title: "Révision structure fiscale avec CPA (fin d'année)", priority: 'low', cat: 'fiscal', who: 'both', phase: '2', completed: false, notes: '' },
];

const PRIORITY_CONFIG = {
  critical: { label: '🔴 CRITIQUE', dotClass: 'dot-critical' },
  high:     { label: '🟠 IMPORTANT', dotClass: 'dot-high' },
  medium:   { label: '🟡 À FAIRE', dotClass: 'dot-medium' },
  low:      { label: '🔵 BACKLOG', dotClass: 'dot-low' },
};

const WHO_LABELS = { benoit: 'Benoit', jay: 'Jay', both: 'Les deux' };
const CAT_LABELS = { legal: 'Structure légale', fiscal: 'Fiscal', offre: 'Offre services', tech: 'Tech' };

// AUTH
function doLogin() {
  const val = document.getElementById('pwd-input').value;
  const err = document.getElementById('login-error');
  if (val === PASSWORD) {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('app').style.display = 'block';
    init();
  } else {
    err.style.display = 'block';
    document.getElementById('pwd-input').value = '';
    document.getElementById('pwd-input').focus();
  }
}

// INIT
function init() {
  loadTasks();
  loadNotes();
  renderTasks();
  mermaid.initialize({ startOnLoad: true, theme: 'dark', themeVariables: { primaryColor: '#22263a', primaryTextColor: '#e8eaf6', primaryBorderColor: '#2e3250', lineColor: '#8892b0', secondaryColor: '#1a1d27', tertiaryColor: '#0f1117' }});
}

// STORAGE
function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try { tasks = JSON.parse(saved); } catch { tasks = [...DEFAULT_TASKS]; }
  } else {
    tasks = DEFAULT_TASKS.map(t => ({...t}));
  }
}
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function loadNotes() {
  const saved = localStorage.getItem(NOTES_KEY);
  if (saved) {
    try {
      const n = JSON.parse(saved);
      ['note-decisions','note-questions','note-contacts','note-dvolu','arch-notes'].forEach(id => {
        if (n[id] !== undefined) {
          const el = document.getElementById(id);
          if (el) el.value = n[id];
        }
      });
    } catch {}
  }
}
function saveNote(textareaId, flashId) {
  const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
  saved[textareaId] = document.getElementById(textareaId).value;
  localStorage.setItem(NOTES_KEY, JSON.stringify(saved));
  const flash = document.getElementById(flashId);
  if (flash) {
    flash.classList.add('show');
    setTimeout(() => flash.classList.remove('show'), 2000);
  }
}
function saveArchNotes() { saveNote('arch-notes','arch-saved'); }

// NAVIGATION
function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('nav button').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  btn.classList.add('active');
  if (name === 'arch') {
    setTimeout(() => mermaid.init(undefined, document.querySelectorAll('.mermaid')), 100);
  }
  // auto-save notes on page leave
  ['note-decisions','note-questions','note-contacts','note-dvolu','arch-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const saved = JSON.parse(localStorage.getItem(NOTES_KEY) || '{}');
      saved[id] = el.value;
      localStorage.setItem(NOTES_KEY, JSON.stringify(saved));
    }
  });
}

// RENDER
function renderTasks() {
  const fp = document.getElementById('f-priority').value;
  const fc = document.getElementById('f-cat').value;
  const fw = document.getElementById('f-who').value;
  const fph = document.getElementById('f-phase').value;

  let filtered = tasks.filter(t => {
    if (fp && t.priority !== fp) return false;
    if (fc && t.cat !== fc) return false;
    if (fw && t.who !== fw) return false;
    if (fph && t.phase !== fph) return false;
    return true;
  });

  // Stats on ALL tasks
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const remaining = total - done;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('stat-done').textContent = done;
  document.getElementById('stat-remaining').textContent = remaining;
  document.getElementById('progress-bar').style.width = pct + '%';
  document.getElementById('bar-label').textContent = done + ' / ' + total + ' tâches complétées';
  document.getElementById('progress-pct').textContent = pct + '%';

  const container = document.getElementById('tasks-container');
  container.innerHTML = '';

  const priorities = ['critical','high','medium','low'];
  let anyRendered = false;

  priorities.forEach(p => {
    const group = filtered.filter(t => t.priority === p);
    if (group.length === 0) return;
    anyRendered = true;
    const cfg = PRIORITY_CONFIG[p];
    const section = document.createElement('div');
    section.className = 'priority-section';
    section.innerHTML = '<div class="priority-label"><div class="dot ' + cfg.dotClass + '"></div>' + cfg.label + ' (' + group.length + ')</div>';
    group.forEach(t => {
      section.appendChild(renderTask(t));
    });
    container.appendChild(section);
  });

  if (!anyRendered) {
    container.innerHTML = '<div class="empty-state">Aucune tâche pour ces filtres.</div>';
  }
}

function renderTask(t) {
  const div = document.createElement('div');
  div.className = 'task' + (t.completed ? ' completed' : '');
  div.dataset.id = t.id;

  const checkContent = t.completed ? '✓' : '';
  const whoBadge = '<span class="badge badge-' + t.who + '">' + WHO_LABELS[t.who] + '</span>';
  const catBadge = '<span class="badge badge-' + t.cat + '">' + CAT_LABELS[t.cat] + '</span>';
  const phaseBadge = '<span class="badge badge-phase' + t.phase + '">Phase ' + t.phase + '</span>';

  div.innerHTML =
    '<div class="task-check" onclick="toggleTask(' + t.id + ')">' + checkContent + '</div>' +
    '<div class="task-body">' +
      '<div class="task-title">' + escHtml(t.title) + '</div>' +
      '<div class="task-meta">' + whoBadge + catBadge + phaseBadge + '</div>' +
    '</div>' +
    '<div class="task-actions">' +
      '<button class="task-btn" onclick="openEditModal(' + t.id + ')">✏️ Modifier</button>' +
      '<button class="task-btn" onclick="changePriority(' + t.id + ')">⬆ Priorité</button>' +
      '<button class="task-btn danger" onclick="deleteTask(' + t.id + ')">🗑</button>' +
    '</div>';
  return div;
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ACTIONS
function toggleTask(id) {
  const t = tasks.find(t => t.id === id);
  if (t) { t.completed = !t.completed; saveTasks(); renderTasks(); }
}

function deleteTask(id) {
  if (!confirm('Supprimer cette tâche?')) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks(); renderTasks();
}

function changePriority(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  const order = ['critical','high','medium','low'];
  const cur = order.indexOf(t.priority);
  t.priority = order[(cur - 1 + order.length) % order.length];
  saveTasks(); renderTasks();
}

// MODAL
function openAddModal() {
  editingId = null;
  document.getElementById('modal-title').textContent = 'Nouvelle tâche';
  document.getElementById('m-title').value = '';
  document.getElementById('m-priority').value = 'medium';
  document.getElementById('m-cat').value = 'legal';
  document.getElementById('m-who').value = 'both';
  document.getElementById('m-phase').value = '1';
  document.getElementById('m-notes').value = '';
  document.getElementById('task-modal').classList.add('open');
  document.getElementById('m-title').focus();
}

function openEditModal(id) {
  const t = tasks.find(t => t.id === id);
  if (!t) return;
  editingId = id;
  document.getElementById('modal-title').textContent = 'Modifier la tâche';
  document.getElementById('m-title').value = t.title;
  document.getElementById('m-priority').value = t.priority;
  document.getElementById('m-cat').value = t.cat;
  document.getElementById('m-who').value = t.who;
  document.getElementById('m-phase').value = t.phase;
  document.getElementById('m-notes').value = t.notes || '';
  document.getElementById('task-modal').classList.add('open');
  document.getElementById('m-title').focus();
}

function closeModal() {
  document.getElementById('task-modal').classList.remove('open');
  editingId = null;
}

function saveTask() {
  const title = document.getElementById('m-title').value.trim();
  if (!title) { alert('Le titre est requis.'); return; }
  if (editingId) {
    const t = tasks.find(t => t.id === editingId);
    if (t) {
      t.title = title;
      t.priority = document.getElementById('m-priority').value;
      t.cat = document.getElementById('m-cat').value;
      t.who = document.getElementById('m-who').value;
      t.phase = document.getElementById('m-phase').value;
      t.notes = document.getElementById('m-notes').value;
    }
  } else {
    const maxId = tasks.reduce((m, t) => Math.max(m, t.id), 0);
    tasks.push({
      id: maxId + 1,
      title,
      priority: document.getElementById('m-priority').value,
      cat: document.getElementById('m-cat').value,
      who: document.getElementById('m-who').value,
      phase: document.getElementById('m-phase').value,
      notes: document.getElementById('m-notes').value,
      completed: false
    });
  }
  saveTasks();
  closeModal();
  renderTasks();
}

// Close modal on overlay click
document.getElementById('task-modal').addEventListener('click', function(e) {
  if (e.target === this) closeModal();
});

// Keyboard shortcut: Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
});
