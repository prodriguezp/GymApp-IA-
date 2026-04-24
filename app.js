/* =============================================
   GYMLOG — APP.JS
   Persistencia: localStorage
   ============================================= */

// ─── STATE ───────────────────────────────────────
const STATE = {
  exercises: [],   // biblioteca de ejercicios
  sessions: {},    // { 'YYYY-MM-DD': [ {exerciseId, name, muscle, sets:[{reps,kg}]} ] }
};

// Ejercicios por defecto
const DEFAULT_EXERCISES = [
  { id: 'ex1',  name: 'Press de Banca',        muscle: 'Pecho',    custom: false },
  { id: 'ex2',  name: 'Press Inclinado',        muscle: 'Pecho',    custom: false },
  { id: 'ex3',  name: 'Aperturas',              muscle: 'Pecho',    custom: false },
  { id: 'ex4',  name: 'Dominadas',              muscle: 'Espalda',  custom: false },
  { id: 'ex5',  name: 'Remo con Barra',         muscle: 'Espalda',  custom: false },
  { id: 'ex6',  name: 'Jalón al Pecho',         muscle: 'Espalda',  custom: false },
  { id: 'ex7',  name: 'Sentadilla',             muscle: 'Piernas',  custom: false },
  { id: 'ex8',  name: 'Prensa de Pierna',       muscle: 'Piernas',  custom: false },
  { id: 'ex9',  name: 'Peso Muerto',            muscle: 'Piernas',  custom: false },
  { id: 'ex10', name: 'Press Militar',          muscle: 'Hombros',  custom: false },
  { id: 'ex11', name: 'Elevaciones Laterales',  muscle: 'Hombros',  custom: false },
  { id: 'ex12', name: 'Curl con Barra',         muscle: 'Bíceps',   custom: false },
  { id: 'ex13', name: 'Curl Martillo',          muscle: 'Bíceps',   custom: false },
  { id: 'ex14', name: 'Fondos en Paralelas',    muscle: 'Tríceps',  custom: false },
  { id: 'ex15', name: 'Extensión Tríceps',      muscle: 'Tríceps',  custom: false },
  { id: 'ex16', name: 'Plancha',                muscle: 'Core',     custom: false },
  { id: 'ex17', name: 'Abdominales',            muscle: 'Core',     custom: false },
];

// ─── HELPERS ─────────────────────────────────────
const todayKey = () => new Date().toISOString().split('T')[0];

const fmt = d => {
  const [y, m, day] = d.split('-');
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${parseInt(day)} ${months[parseInt(m)-1]} ${y}`;
};

const uid = () => 'ex' + Date.now() + Math.random().toString(36).slice(2,6);

// ─── PERSISTENCE ─────────────────────────────────
function saveState() {
  localStorage.setItem('gymlog_exercises', JSON.stringify(STATE.exercises));
  localStorage.setItem('gymlog_sessions',  JSON.stringify(STATE.sessions));
}

function loadState() {
  const exRaw = localStorage.getItem('gymlog_exercises');
  const seRaw = localStorage.getItem('gymlog_sessions');
  STATE.exercises = exRaw ? JSON.parse(exRaw) : [...DEFAULT_EXERCISES];
  STATE.sessions  = seRaw ? JSON.parse(seRaw) : {};
}

// ─── DOM REFS ─────────────────────────────────────
const $ = id => document.getElementById(id);

// ─── NAV ──────────────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
      btn.classList.add('active');
      $('view-' + btn.dataset.view).classList.add('active');
      renderView(btn.dataset.view);
    });
  });
}

function renderView(view) {
  if (view === 'today')     renderToday();
  if (view === 'history')   renderHistory();
  if (view === 'exercises') renderLibrary();
  if (view === 'stats')     renderStats();
}

// ─── DATE DISPLAY ─────────────────────────────────
function initDate() {
  const now = new Date();
  const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const label = `${days[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
  $('sidebarDate').textContent = label;
  $('todayDateLabel').textContent = label;
}

// ─── TODAY VIEW ───────────────────────────────────
function renderToday() {
  const key = todayKey();
  const entries = STATE.sessions[key] || [];
  const list    = $('todayList');
  const empty   = $('todayEmpty');

  list.innerHTML = '';
  if (entries.length === 0) {
    empty.style.display = 'block';
    list.style.display  = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display  = 'flex';

  entries.forEach((entry, idx) => {
    const card = document.createElement('div');
    card.className = 'ex-card';
    card.innerHTML = `
      <div class="ex-card-header">
        <div style="display:flex;align-items:center;gap:12px">
          <span class="ex-card-name">${entry.name}</span>
          <span class="ex-card-muscle">${entry.muscle}</span>
        </div>
        <div class="ex-card-actions">
          <button class="btn-icon" title="Editar" data-edit="${idx}">✏️</button>
          <button class="btn-icon del" title="Eliminar" data-del="${idx}">🗑</button>
        </div>
      </div>
      <table class="sets-table">
        <thead>
          <tr>
            <th>Serie</th>
            <th>Reps</th>
            <th>Peso (kg)</th>
            <th>Volumen</th>
          </tr>
        </thead>
        <tbody>
          ${entry.sets.map((s, i) => `
            <tr>
              <td><span class="tag-set">${i+1}</span></td>
              <td><span class="val">${s.reps}</span> <span style="color:var(--text-muted);font-size:.8rem">reps</span></td>
              <td><span class="val">${s.kg}</span> <span style="color:var(--text-muted);font-size:.8rem">kg</span></td>
              <td style="color:var(--accent)">${(s.reps * s.kg).toFixed(0)} <span style="color:var(--text-muted);font-size:.8rem">kg</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    card.querySelector('[data-del]').addEventListener('click', () => {
      STATE.sessions[key].splice(idx, 1);
      if (STATE.sessions[key].length === 0) delete STATE.sessions[key];
      saveState();
      renderToday();
    });

    card.querySelector('[data-edit]').addEventListener('click', () => openEditModal(idx));

    list.appendChild(card);
  });
}

// ─── ADD EXERCISE MODAL ───────────────────────────
let editIndex = null;

function openAddModal() {
  editIndex = null;
  populateSelect();
  $('setsContainer').innerHTML = '';
  addSetRow();
  $('modalAddExercise').classList.add('open');
}

function openEditModal(idx) {
  editIndex = idx;
  const key   = todayKey();
  const entry = STATE.sessions[key][idx];
  populateSelect(entry.exerciseId);
  $('setsContainer').innerHTML = '';
  entry.sets.forEach(s => addSetRow(s.reps, s.kg));
  $('modalAddExercise').classList.add('open');
}

function closeAddModal() { $('modalAddExercise').classList.remove('open'); }

function populateSelect(selectedId = null) {
  const sel = $('selectExercise');
  sel.innerHTML = STATE.exercises
    .sort((a,b) => a.name.localeCompare(b.name))
    .map(e => `<option value="${e.id}" ${e.id===selectedId?'selected':''}>${e.name} — ${e.muscle}</option>`)
    .join('');
}

function addSetRow(reps='', kg='') {
  const container = $('setsContainer');
  const num = container.children.length + 1;
  const row = document.createElement('div');
  row.className = 'set-row';
  row.innerHTML = `
    <span class="set-number">${num}</span>
    <input type="number" placeholder="Reps" value="${reps}" min="0" class="inp-reps" />
    <input type="number" placeholder="Kg" value="${kg}" min="0" step="0.5" class="inp-kg" />
    <button class="btn-del-set" title="Quitar serie">✕</button>
  `;
  row.querySelector('.btn-del-set').addEventListener('click', () => {
    row.remove();
    renumberSets();
  });
  container.appendChild(row);
}

function renumberSets() {
  document.querySelectorAll('.set-row').forEach((row, i) => {
    row.querySelector('.set-number').textContent = i + 1;
  });
}

function saveExerciseEntry() {
  const selEl = $('selectExercise');
  const exId  = selEl.value;
  const ex    = STATE.exercises.find(e => e.id === exId);
  if (!ex) return;

  const rows = document.querySelectorAll('.set-row');
  const sets = [];
  rows.forEach(row => {
    const reps = parseFloat(row.querySelector('.inp-reps').value) || 0;
    const kg   = parseFloat(row.querySelector('.inp-kg').value)   || 0;
    if (reps > 0 || kg > 0) sets.push({ reps, kg });
  });
  if (sets.length === 0) { alert('Añade al menos una serie con datos.'); return; }

  const key = todayKey();
  if (!STATE.sessions[key]) STATE.sessions[key] = [];

  const entry = { exerciseId: ex.id, name: ex.name, muscle: ex.muscle, sets };

  if (editIndex !== null) {
    STATE.sessions[key][editIndex] = entry;
  } else {
    STATE.sessions[key].push(entry);
  }

  saveState();
  closeAddModal();
  renderToday();
}

// ─── HISTORY VIEW ─────────────────────────────────
function renderHistory() {
  const list  = $('historyList');
  const empty = $('historyEmpty');
  list.innerHTML = '';

  const keys = Object.keys(STATE.sessions).sort((a,b) => b.localeCompare(a));

  if (keys.length === 0) {
    empty.style.display = 'block';
    list.style.display  = 'none';
    return;
  }
  empty.style.display = 'none';
  list.style.display  = 'flex';

  keys.forEach(key => {
    const entries = STATE.sessions[key];
    const totalSets = entries.reduce((acc, e) => acc + e.sets.length, 0);

    const card = document.createElement('div');
    card.className = 'history-card';
    card.innerHTML = `
      <div class="history-card-header">
        <span class="history-date">${fmt(key)}</span>
        <div class="history-meta">
          <span class="badge badge-count">${entries.length} ejercicios</span>
          <span class="badge badge-sets">${totalSets} series</span>
          <span class="chevron">▼</span>
        </div>
      </div>
      <div class="history-body">
        ${entries.map(e => `
          <div class="history-ex-row">
            <div>
              <div class="history-ex-name">${e.name}</div>
              <div class="history-ex-detail">${e.muscle}</div>
            </div>
            <div style="text-align:right">
              <div style="font-size:.85rem;color:var(--text-dim)">${e.sets.length} series</div>
              <div class="history-ex-detail">
                ${e.sets.map((s,i)=>`<span>${i+1}: ${s.reps}r × ${s.kg}kg</span>`).join(' &nbsp; ')}
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    card.querySelector('.history-card-header').addEventListener('click', () => {
      card.classList.toggle('open');
    });
    list.appendChild(card);
  });
}

// ─── EXERCISE LIBRARY VIEW ────────────────────────
function renderLibrary() {
  const grid = $('exerciseGrid');
  grid.innerHTML = '';

  const grouped = {};
  STATE.exercises.forEach(e => {
    if (!grouped[e.muscle]) grouped[e.muscle] = [];
    grouped[e.muscle].push(e);
  });

  STATE.exercises
    .sort((a,b) => a.muscle.localeCompare(b.muscle) || a.name.localeCompare(b.name))
    .forEach(ex => {
      const card = document.createElement('div');
      card.className = 'lib-card';
      card.innerHTML = `
        <div class="lib-card-name">${ex.name}</div>
        <div class="lib-card-muscle">${ex.muscle}</div>
        ${ex.custom ? '<div class="lib-card-custom">✦ Personalizado</div>' : ''}
        ${ex.custom ? `<button class="lib-card-del" data-id="${ex.id}" title="Eliminar">✕</button>` : ''}
      `;
      if (ex.custom) {
        card.querySelector('.lib-card-del').addEventListener('click', e => {
          e.stopPropagation();
          if (confirm(`¿Eliminar "${ex.name}"?`)) {
            STATE.exercises = STATE.exercises.filter(x => x.id !== ex.id);
            saveState();
            renderLibrary();
          }
        });
      }
      grid.appendChild(card);
    });
}

// ─── NEW EXERCISE MODAL ───────────────────────────
function openNewExModal()  { $('modalNewExercise').classList.add('open'); $('newExerciseName').value = ''; }
function closeNewExModal() { $('modalNewExercise').classList.remove('open'); }

function saveNewExercise() {
  const name   = $('newExerciseName').value.trim();
  const muscle = $('newExerciseMuscle').value;
  if (!name) { alert('Introduce un nombre.'); return; }
  if (STATE.exercises.find(e => e.name.toLowerCase() === name.toLowerCase())) {
    alert('Ya existe un ejercicio con ese nombre.'); return;
  }
  STATE.exercises.push({ id: uid(), name, muscle, custom: true });
  saveState();
  closeNewExModal();
  renderLibrary();
}

// ─── STATS VIEW ───────────────────────────────────
function renderStats() {
  const grid = $('statsGrid');
  grid.innerHTML = '';

  const allSessions = Object.entries(STATE.sessions);
  const totalSessions = allSessions.length;
  const totalExEntries = allSessions.reduce((acc,[,entries]) => acc + entries.length, 0);
  const totalSets = allSessions.reduce((acc,[,entries]) =>
    acc + entries.reduce((a2,e) => a2 + e.sets.length, 0), 0);
  const totalVolume = allSessions.reduce((acc,[,entries]) =>
    acc + entries.reduce((a2,e) =>
      a2 + e.sets.reduce((a3,s) => a3 + s.reps * s.kg, 0), 0), 0);

  // Ejercicio más realizado
  const exCount = {};
  allSessions.forEach(([,entries]) => {
    entries.forEach(e => { exCount[e.name] = (exCount[e.name]||0) + 1; });
  });
  const topEx = Object.entries(exCount).sort((a,b)=>b[1]-a[1])[0];

  // Racha actual
  let streak = 0;
  const d = new Date();
  while (true) {
    const k = d.toISOString().split('T')[0];
    if (STATE.sessions[k]) { streak++; d.setDate(d.getDate()-1); }
    else break;
  }

  const stats = [
    { label: 'Días entrenados', value: totalSessions },
    { label: 'Ejercicios registrados', value: totalExEntries },
    { label: 'Series totales', value: totalSets },
    { label: 'Volumen total (kg)', value: Math.round(totalVolume).toLocaleString('es') },
    { label: 'Racha actual (días)', value: streak },
    { label: 'Ejercicio favorito', value: topEx ? topEx[0] : '—', small: true },
  ];

  stats.forEach(s => {
    const card = document.createElement('div');
    card.className = 'stat-card';
    card.innerHTML = `
      <div class="stat-value" style="${s.small?'font-size:1.4rem;line-height:1.3':''}">
        ${s.value}
      </div>
      <div class="stat-label">${s.label}</div>
    `;
    grid.appendChild(card);
  });
}

// ─── INIT ─────────────────────────────────────────
function init() {
  loadState();
  initDate();
  initNav();

  // Modal Add
  $('btnAddExercise').addEventListener('click', openAddModal);
  $('closeModalAdd').addEventListener('click', closeAddModal);
  $('cancelModalAdd').addEventListener('click', closeAddModal);
  $('saveExercise').addEventListener('click', saveExerciseEntry);
  $('btnAddSet').addEventListener('click', () => addSetRow());
  $('modalAddExercise').addEventListener('click', e => {
    if (e.target === $('modalAddExercise')) closeAddModal();
  });

  // Modal New Exercise
  $('btnAddCustomExercise').addEventListener('click', openNewExModal);
  $('closeModalNew').addEventListener('click', closeNewExModal);
  $('cancelModalNew').addEventListener('click', closeNewExModal);
  $('saveNewExercise').addEventListener('click', saveNewExercise);
  $('modalNewExercise').addEventListener('click', e => {
    if (e.target === $('modalNewExercise')) closeNewExModal();
  });

  // Render inicial
  renderToday();
}

document.addEventListener('DOMContentLoaded', init);
