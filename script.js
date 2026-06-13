// ============================================================
//  TORMENTA 20 — FICHA DE PERSONAGEM (SCRIPT)
// ============================================================

// === DATA ===
const ATTRS = [
  { id:'for', label:'FOR', full:'Força' },
  { id:'des', label:'DES', full:'Destreza' },
  { id:'con', label:'CON', full:'Constituição' },
  { id:'int', label:'INT', full:'Inteligência' },
  { id:'sab', label:'SAB', full:'Sabedoria' },
  { id:'car', label:'CAR', full:'Carisma' },
];

const PERICIAS = [
  { nome:'Acrobacia', attr:'DES', flags:'✦' },
  { nome:'Adestramento', attr:'CAR', flags:'®' },
  { nome:'Atletismo', attr:'FOR' },
  { nome:'Atuação', attr:'CAR' },
  { nome:'Cavalgar', attr:'DES' },
  { nome:'Conhecimento', attr:'INT', flags:'®' },
  { nome:'Cura', attr:'SAB' },
  { nome:'Diplomacia', attr:'CAR' },
  { nome:'Enganação', attr:'CAR' },
  { nome:'Fortitude', attr:'CON' },
  { nome:'Furtividade', attr:'DES', flags:'✦' },
  { nome:'Guerra', attr:'INT', flags:'®' },
  { nome:'Iniciativa', attr:'DES' },
  { nome:'Intimidação', attr:'CAR' },
  { nome:'Intuição', attr:'SAB' },
  { nome:'Investigação', attr:'INT' },
  { nome:'Jogatina', attr:'CAR', flags:'®' },
  { nome:'Ladinagem', attr:'DES', flags:'✦®' },
  { nome:'Luta', attr:'FOR' },
  { nome:'Misticismo', attr:'INT', flags:'®' },
  { nome:'Nobreza', attr:'INT', flags:'®' },
  { nome:'Ofício (____)', attr:'INT', flags:'®' },
  { nome:'Percepção', attr:'SAB' },
  { nome:'Pilotagem', attr:'DES', flags:'®' },
  { nome:'Pontaria', attr:'DES' },
  { nome:'Reflexos', attr:'DES' },
  { nome:'Religião', attr:'SAB', flags:'®' },
  { nome:'Sobrevivência', attr:'SAB' },
  { nome:'Vontade', attr:'SAB' },
];

const PROFICIENCIAS = [
  'Armas Simples','Armas Marciais','Armas Exóticas',
  'Armadura Leve','Armadura Pesada','Escudos',
  'Ferramentas de Ladrão','Instrumentos Musicais',
  'Armas de Fogo','Veículos Terrestres','Veículos Aquáticos',
];

// === STATE ===
let attackCount = 0;
let magiaCount = 0;
let armorCount = 0;
let masterOpen = false;
let currentViewId = null;  // id da ficha de jogador atualmente carregada no formulário

// === PLAYER STORAGE (PAINEL DO MESTRE) ===
const PLAYERS_INDEX_KEY = 'tormenta_players_index';
const PLAYER_PREFIX = 'tormenta_player_';

function getPlayersIndex() {
  try { return JSON.parse(localStorage.getItem(PLAYERS_INDEX_KEY)) || []; }
  catch(e) { return []; }
}
function setPlayersIndex(list) {
  localStorage.setItem(PLAYERS_INDEX_KEY, JSON.stringify(list));
}
function getPlayerData(id) {
  try { return JSON.parse(localStorage.getItem(PLAYER_PREFIX + id)); }
  catch(e) { return null; }
}
function setPlayerData(id, data) {
  localStorage.setItem(PLAYER_PREFIX + id, JSON.stringify(data));
}
function deletePlayerData(id) {
  localStorage.removeItem(PLAYER_PREFIX + id);
}
function generateId() {
  return 'p_' + Date.now() + '_' + Math.random().toString(36).slice(2,8);
}

function saveCurrentAsPlayer() {
  const personagem = document.getElementById('personagem').value.trim();
  if(!personagem) {
    showToast('Preencha o Nome do Personagem antes de salvar a ficha do jogador.');
    return;
  }
  const data = gatherData();
  const id = generateId();
  const info = {
    id,
    personagem,
    jogador: data.jogador || '',
    raca: data.raca || '',
    classe: data.classe || '',
    savedAt: Date.now(),
  };
  setPlayerData(id, data);
  const index = getPlayersIndex();
  index.push(info);
  setPlayersIndex(index);
  renderMasterList();
  showToast('Ficha de "' + personagem + '" adicionada! ⚔');
}

function deletePlayer(id) {
  if(!confirm('Excluir esta ficha de jogador?')) return;
  deletePlayerData(id);
  const index = getPlayersIndex().filter(p => p.id !== id);
  setPlayersIndex(index);
  if(currentViewId === id) {
    currentViewId = null;
    updateUpdateButton();
  }
  renderMasterList();
  showToast('Ficha removida.');
}

function loadPlayerIntoForm(id) {
  const data = getPlayerData(id);
  if(!data) { showToast('Ficha não encontrada.'); return; }
  applyData(data);
  currentViewId = id;
  updateUpdateButton();
  renderMasterList();
  const info = getPlayersIndex().find(p => p.id === id);
  showToast('Ficha de "' + (info?.personagem || '?') + '" carregada. 📜');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function updatePlayerFromCurrent() {
  if(!currentViewId) { showToast('Nenhuma ficha de jogador carregada.'); return; }
  const data = gatherData();
  setPlayerData(currentViewId, data);
  const index = getPlayersIndex();
  const idx = index.findIndex(p => p.id === currentViewId);
  if(idx >= 0) {
    index[idx] = {
      ...index[idx],
      personagem: data.personagem || '',
      jogador: data.jogador || '',
      raca: data.raca || '',
      classe: data.classe || '',
      savedAt: Date.now(),
    };
    setPlayersIndex(index);
  }
  renderMasterList();
  showToast('Ficha de "' + (data.personagem || '?') + '" atualizada! 💾');
}

function updateUpdateButton() {
  const btn = document.getElementById('master-update-btn');
  if(btn) btn.style.display = currentViewId ? 'block' : 'none';
}

function renderMasterList() {
  const list = document.getElementById('master-list');
  const count = document.getElementById('player-count');
  if(!list) return;
  const index = getPlayersIndex();
  count.textContent = index.length;
  if(index.length === 0) {
    list.innerHTML = '<p class="master-empty">Nenhuma ficha adicionada ainda.<br>Use o botão acima para adicionar.</p>';
    return;
  }
  list.innerHTML = index
    .sort((a,b) => b.savedAt - a.savedAt)
    .map(p => `
      <div class="player-card ${p.id === currentViewId ? 'active' : ''}">
        <div class="player-info">
          <div class="player-name">⚔ ${escapeHtml(p.personagem)}</div>
          <div class="player-meta">${escapeHtml(p.jogador || '—')} · ${escapeHtml(p.raca || '—')}</div>
          <div class="player-meta">${escapeHtml(p.classe || '—')}</div>
        </div>
        <div class="player-actions">
          <button class="icon-btn-sm" title="Carregar ficha" onclick="loadPlayerIntoForm('${p.id}')">👁</button>
          <button class="icon-btn-sm danger" title="Excluir ficha" onclick="deletePlayer('${p.id}')">🗑</button>
        </div>
      </div>
    `).join('');
}

function escapeHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function toggleMaster() {
  masterOpen = !masterOpen;
  document.getElementById('master-panel').classList.toggle('open', masterOpen);
  if(masterOpen) renderMasterList();
}

// === RENDER ATTRIBUTES ===
function renderAttrs() {
  const g = document.getElementById('attrs-grid');
  g.innerHTML = ATTRS.map(a => `
    <div class="attr-wrap">
      <label>${a.label}</label>
      <div class="attr-box">
        <input type="number" class="attr-score" id="attr-${a.id}" min="1" max="40" value="10" oninput="updateMod('${a.id}')">
        <div class="attr-mod-label">Mod.</div>
        <div class="attr-mod" id="mod-${a.id}">+0</div>
      </div>
    </div>
  `).join('');
}

function updateMod(id) {
  const v = parseInt(document.getElementById('attr-'+id).value) || 10;
  const mod = Math.floor((v - 10) / 2);
  const el = document.getElementById('mod-'+id);
  el.textContent = (mod >= 0 ? '+' : '') + mod;
  el.style.background = mod >= 0 ? 'var(--crimson)' : 'var(--ink-soft)';
}

// === RENDER PROFICIÊNCIAS ===
function renderProf() {
  const g = document.getElementById('prof-grid');
  g.innerHTML = PROFICIENCIAS.map((p,i) => `
    <div class="prof-item">
      <input type="checkbox" id="prof-${i}">
      <label for="prof-${i}">${p}</label>
    </div>
  `).join('');
}

// === RENDER SKILLS ===
function renderSkills() {
  const g = document.getElementById('skills-grid');
  const mid = Math.ceil(PERICIAS.length / 2);
  const cols = [PERICIAS.slice(0, mid), PERICIAS.slice(mid)];
  g.innerHTML = cols.map(col => `
    <div>
      <div class="skill-header">
        <span>Perícia</span>
        <span>Total</span>
        <span>Bônus</span>
      </div>
      ${col.map((p) => {
        const idx = PERICIAS.indexOf(p);
        return `<div class="skill-row">
          <span class="skill-name">${p.nome} <small>${p.attr}${p.flags ? ' '+p.flags : ''}</small></span>
          <input type="number" id="skill-total-${idx}" placeholder="—" style="text-align:center;">
          <input type="number" id="skill-bonus-${idx}" placeholder="+0" style="text-align:center;">
        </div>`;
      }).join('')}
    </div>
  `).join('');
}

// === ARMOR ROWS (dinâmicas) ===
function addArmorRow(data={}) {
  const id = armorCount++;
  const tbody = document.getElementById('armor-body');
  const tr = document.createElement('tr');
  tr.id = 'armor-row-'+id;
  tr.innerHTML = `
    <td><input type="text" data-armor="${id}" data-field="nome" value="${escapeHtml(data.nome||'')}" placeholder="Ex: Cota de Malha"></td>
    <td><input type="number" data-armor="${id}" data-field="def" value="${data.def||''}" placeholder="+4"></td>
    <td><input type="number" data-armor="${id}" data-field="pen" value="${data.pen||''}" placeholder="-2"></td>
    <td><input type="text" data-armor="${id}" data-field="tipo" value="${escapeHtml(data.tipo||'')}" placeholder="Pesada"></td>
  `;
  tbody.appendChild(tr);
}

function removeLastArmorRow() {
  const tbody = document.getElementById('armor-body');
  if(!tbody.lastChild) return;
  if(armorCount <= 1) { showToast('É necessário manter pelo menos 1 linha.'); return; }
  tbody.removeChild(tbody.lastChild);
  armorCount--;
}

// === ATTACKS ===
function addAttackRow(data={}) {
  const id = attackCount++;
  const tbody = document.getElementById('attacks-body');
  const tr = document.createElement('tr');
  tr.id = 'atk-'+id;
  tr.innerHTML = `
    <td><input type="text" data-atk="${id}" data-field="nome" value="${escapeHtml(data.nome||'')}" placeholder="Nome da arma"></td>
    <td><input type="text" data-atk="${id}" data-field="teste" value="${escapeHtml(data.teste||'')}" placeholder="+X"></td>
    <td><input type="text" data-atk="${id}" data-field="dano" value="${escapeHtml(data.dano||'')}" placeholder="1d6+2"></td>
    <td><input type="text" data-atk="${id}" data-field="critico" value="${escapeHtml(data.critico||'')}" placeholder="20/×2"></td>
    <td><input type="text" data-atk="${id}" data-field="tipo" value="${escapeHtml(data.tipo||'')}" placeholder="Cortante"></td>
    <td><input type="text" data-atk="${id}" data-field="alcance" value="${escapeHtml(data.alcance||'')}" placeholder="Curto"></td>
  `;
  tbody.appendChild(tr);
}

// === MAGIAS ===
function addMagiaRow(data={}) {
  const id = magiaCount++;
  const list = document.getElementById('magias-list');
  const div = document.createElement('div');
  div.style.cssText = 'display:grid;grid-template-columns:2fr 1fr 1fr 3fr;gap:8px;margin-bottom:8px;align-items:end;';
  div.id = 'magia-'+id;
  div.innerHTML = `
    <div><label style="font-size:0.55rem;">Nome da Magia</label><input type="text" data-magia="${id}" data-field="nome" value="${escapeHtml(data.nome||'')}" placeholder="Ex: Bola de Fogo"></div>
    <div><label style="font-size:0.55rem;">Círculo</label><input type="number" data-magia="${id}" data-field="circulo" value="${data.circulo||''}" placeholder="1" min="1" max="5"></div>
    <div><label style="font-size:0.55rem;">Custo (PM)</label><input type="number" data-magia="${id}" data-field="custo" value="${data.custo||''}" placeholder="3" min="0"></div>
    <div><label style="font-size:0.55rem;">Efeito Resumido</label><input type="text" data-magia="${id}" data-field="efeito" value="${escapeHtml(data.efeito||'')}" placeholder="Dano 6d6 de fogo em área"></div>
  `;
  list.appendChild(div);
}

// === DEFENSE CALC ===
function calcDefesa() {
  const des = parseInt(document.getElementById('def-des').value)||0;
  const arm = parseInt(document.getElementById('def-arm').value)||0;
  const esc = parseInt(document.getElementById('def-esc').value)||0;
  const out = parseInt(document.getElementById('def-out').value)||0;
  document.getElementById('defesa-total').value = 10 + des + arm + esc + out;
}

// === TABS ===
function switchTab(name) {
  document.querySelectorAll('.tab-btn').forEach((b,i) => {
    const tabs = ['identidade','atributos','combate','pericias','habilidades','historia'];
    b.classList.toggle('active', tabs[i] === name);
  });
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
}

// === PORTRAIT ===
function loadPortrait(dataUrl) {
  const img = document.getElementById('portrait-img');
  if(dataUrl) {
    img.src = dataUrl;
    img.classList.add('loaded');
  } else {
    img.removeAttribute('src');
    img.classList.remove('loaded');
  }
}

function removePortrait() {
  loadPortrait(null);
  const f = document.getElementById('portrait-upload');
  if(f) f.value = '';
}

function resizeImage(file, maxSize, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width, h = img.height;
        if(w > h && w > maxSize) { h = h * (maxSize / w); w = maxSize; }
        else if(h > maxSize) { w = w * (maxSize / h); h = maxSize; }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d').drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// === SAVE / LOAD (FICHA ATUAL) ===
function gatherData() {
  const data = {};
  document.querySelectorAll('input[id], textarea[id], select[id]').forEach(el => {
    if(el.type === 'checkbox') data[el.id] = el.checked;
    else if(el.type !== 'file') data[el.id] = el.value;
  });
  // attrs
  ATTRS.forEach(a => {
    data['attr-'+a.id] = document.getElementById('attr-'+a.id)?.value;
  });
  // proficiencias
  PROFICIENCIAS.forEach((_,i) => {
    const el = document.getElementById('prof-'+i);
    if(el) data['prof-'+i] = el.checked;
  });
  // skills
  PERICIAS.forEach((_,i) => {
    ['total','bonus'].forEach(f => {
      const el = document.getElementById(`skill-${f}-${i}`);
      if(el) data[`skill-${f}-${i}`] = el.value;
    });
  });
  // attacks
  const attacks = [];
  document.querySelectorAll('[data-atk]').forEach(el => {
    const id = el.dataset.atk;
    if(!attacks[id]) attacks[id] = {};
    attacks[id][el.dataset.field] = el.value;
  });
  data._attacks = attacks.filter(Boolean);
  // magias
  const magias = [];
  document.querySelectorAll('[data-magia]').forEach(el => {
    const id = el.dataset.magia;
    if(!magias[id]) magias[id] = {};
    magias[id][el.dataset.field] = el.value;
  });
  data._magias = magias.filter(Boolean);
  // armor
  const armors = [];
  document.querySelectorAll('[data-armor]').forEach(el => {
    const id = el.dataset.armor;
    if(!armors[id]) armors[id] = {};
    armors[id][el.dataset.field] = el.value;
  });
  data._armor = armors.filter(Boolean);
  // portrait
  const portrait = document.getElementById('portrait-img');
  if(portrait && portrait.classList.contains('loaded')) data._portrait = portrait.src;
  return data;
}

function applyData(data) {
  Object.entries(data).forEach(([k,v]) => {
    if(k.startsWith('_')) return;
    const el = document.getElementById(k);
    if(!el) return;
    if(el.type === 'checkbox') el.checked = v;
    else if(el.type !== 'file') el.value = v;
  });
  ATTRS.forEach(a => updateMod(a.id));
  // attacks
  document.getElementById('attacks-body').innerHTML = '';
  attackCount = 0;
  (data._attacks || []).forEach(a => addAttackRow(a));
  // magias
  document.getElementById('magias-list').innerHTML = '';
  magiaCount = 0;
  (data._magias || []).forEach(m => addMagiaRow(m));
  // armor
  document.getElementById('armor-body').innerHTML = '';
  armorCount = 0;
  (data._armor || []).forEach(a => addArmorRow(a));
  // portrait
  loadPortrait(data._portrait || null);
}

function saveFicha() {
  const data = gatherData();
  localStorage.setItem('tormenta_ficha', JSON.stringify(data));
  showToast('Ficha salva com sucesso! ⚔');
}

function loadFicha() {
  const raw = localStorage.getItem('tormenta_ficha');
  if(!raw) { showToast('Nenhuma ficha encontrada.'); return; }
  applyData(JSON.parse(raw));
  currentViewId = null;
  updateUpdateButton();
  renderMasterList();
  showToast('Ficha carregada! 📜');
}

function clearFicha() {
  if(!confirm('Tem certeza? Isso irá apagar todos os dados da ficha atual.')) return;
  document.querySelectorAll('input:not(.attr-score):not([type=file])').forEach(el => {
    if(el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  document.querySelectorAll('.attr-score').forEach(el => { el.value = 10; });
  ATTRS.forEach(a => updateMod(a.id));
  document.getElementById('defesa-total').value = 10;
  document.getElementById('attacks-body').innerHTML = '';
  attackCount = 0;
  addAttackRow(); addAttackRow(); addAttackRow();
  document.getElementById('magias-list').innerHTML = '';
  magiaCount = 0;
  document.getElementById('armor-body').innerHTML = '';
  armorCount = 0;
  addArmorRow(); addArmorRow(); addArmorRow();
  removePortrait();
  currentViewId = null;
  updateUpdateButton();
  renderMasterList();
  showToast('Ficha limpa.');
}

// === TOAST ===
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// === EXPORT JSON ===
function exportJson() {
  const data = gatherData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const filename = (data.personagem || 'ficha') + '.json';
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Ficha exportada como JSON! 📤');
}

// === IMPORT JSON ===
function importJson(file) {
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      applyData(data);
      currentViewId = null;
      updateUpdateButton();
      renderMasterList();
      showToast('Ficha importada com sucesso! 📥');
    } catch(err) {
      showToast('Erro ao importar JSON.');
    }
  };
  reader.onerror = () => showToast('Erro ao ler arquivo.');
  reader.readAsText(file);
}

// === EXPORT PDF ===
function exportPdf() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  const data = gatherData();
  
  // Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(139, 26, 26);
  doc.text('TORMENTA 20', 105, 20, { align: 'center' });
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text('FICHA DE PERSONAGEM', 105, 28, { align: 'center' });
  
  // Line
  doc.setLineWidth(0.5);
  doc.setDrawColor(201, 168, 76);
  doc.line(20, 32, 190, 32);
  
  let y = 42;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(139, 26, 26);
  doc.text('IDENTIDADE', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  const identityFields = [
    ['Jogador', data.jogador],
    ['Personagem', data.personagem],
    ['Raça', data.raca],
    ['Origem', data.origem],
    ['Classe & Nível', data.classe],
    ['Divindade', data.divindade],
    ['Idade', data.idade],
    ['Tamanho', data.tamanho],
  ];
  
  identityFields.forEach(([label, value]) => {
    doc.setFont('helvetica', 'bold');
    doc.text(label + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '—', 60, y);
    y += 6;
  });
  
  // Aparência e Personalidade
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(139, 26, 26);
  doc.text('APARÊNCIA & PERSONALIDADE', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Aparência Física:', 20, y);
  y += 5;
  if (data.aparencia) {
    const aparenciaLines = doc.splitTextToSize(data.aparencia, 170);
    aparenciaLines.forEach(line => {
      doc.text(line, 20, y);
      y += 5;
    });
  } else {
    doc.text('—', 20, y);
    y += 5;
  }
  y += 2;
  doc.setFont('helvetica', 'bold');
  doc.text('Traços de Personalidade:', 20, y);
  y += 5;
  doc.setFont('helvetica', 'normal');
  if (data.personalidade) {
    const personalidadeLines = doc.splitTextToSize(data.personalidade, 170);
    personalidadeLines.forEach(line => {
      doc.text(line, 20, y);
      y += 5;
    });
  } else {
    doc.text('—', 20, y);
    y += 5;
  }
  
  // Atributos
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(139, 26, 26);
  doc.text('ATRIBUTOS', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  ATTRS.forEach(attr => {
    const score = data['attr-' + attr.id];
    const mod = Math.floor(((parseInt(score) || 10) - 10) / 2);
    doc.setFont('helvetica', 'bold');
    doc.text(attr.full + ':', 20, y);
    doc.setFont('helvetica', 'normal');
    doc.text((score || '10') + ' (Mod: ' + (mod >= 0 ? '+' : '') + mod + ')', 60, y);
    y += 6;
  });
  
  // Vida e Mana
  y += 4;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(139, 26, 26);
  doc.text('VITAIS', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Pontos de Vida: ' + (data['pv-atual'] || '0') + '/' + (data['pv-max'] || '0'), 20, y);
  y += 6;
  doc.text('Pontos de Mana: ' + (data['pm-atual'] || '0') + '/' + (data['pm-max'] || '0'), 20, y);
  
  // Defesa
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(139, 26, 26);
  doc.text('DEFESA', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const defTotal = data['defesa-total'] || '10';
  doc.text('Total: ' + defTotal, 20, y);
  y += 6;
  doc.text('Mod. Des: ' + (data['def-des'] || '0') + ' + Armadura: ' + (data['def-arm'] || '0') + ' + Escudo: ' + (data['def-esc'] || '0') + ' + Outros: ' + (data['def-out'] || '0'), 20, y);
  
  // Equipamento
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  y += 8;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(139, 26, 26);
  doc.text('EQUIPAMENTO & RIQUEZA', 20, y);
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  if (data.equipamento) {
    const equipLines = doc.splitTextToSize(data.equipamento, 170);
    equipLines.forEach(line => {
      doc.text(line, 20, y);
      y += 5;
    });
  }
  y += 4;
  doc.text('Tesouro (T$): ' + (data.ts || '0'), 20, y);
  y += 6;
  doc.text('Ouro (TO): ' + (data.to || '0'), 20, y);
  y += 6;
  doc.text('Tibar (TIB): ' + (data.tib || '0'), 20, y);
  
  const filename = (data.personagem || 'ficha') + '.pdf';
  doc.save(filename);
  showToast('Ficha exportada como PDF! 📄');
}

// === INIT ===
function init() {
  renderAttrs();
  ATTRS.forEach(a => updateMod(a.id));
  renderProf();
  renderSkills();
  // linhas iniciais
  addArmorRow(); addArmorRow(); addArmorRow();
  addAttackRow(); addAttackRow(); addAttackRow();
  addMagiaRow();
  // upload de retrato
  const portraitInput = document.getElementById('portrait-upload');
  if(portraitInput) {
    portraitInput.addEventListener('change', async e => {
      const file = e.target.files[0];
      if(!file) return;
      try {
        const dataUrl = await resizeImage(file, 400, 0.85);
        loadPortrait(dataUrl);
        showToast('Retrato carregado! 🖼');
      } catch(err) {
        showToast('Erro ao carregar imagem.');
      }
    });
  }
  // import json
  const importInput = document.getElementById('import-json');
  if(importInput) {
    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if(!file) return;
      importJson(file);
      importInput.value = '';
    });
  }
  // auto-load
  const saved = localStorage.getItem('tormenta_ficha');
  if(saved) {
    try { applyData(JSON.parse(saved)); } catch(e) {}
  }
  updateUpdateButton();
  renderMasterList();
}

if(document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}