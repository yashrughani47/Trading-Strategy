/*****************************************************************
 *  Chartink Strategy Builder – Vanilla JS, no external deps
 ****************************************************************/

/* ===== Simple indicator + operator definitions ================ */
const INDICATORS = [
  'close', 'open', 'high', 'low',
  'volume', 'avg(close, 20)',
  'rsi(14)', 'macd(12,26,9)', 'sma(close, 50)', 'sma(close, 200)'
];
const OPERATORS = ['>', '<', '=', 'crosses above', 'crosses below', '>=', '<='];

/* ===== DOM helpers ============================================ */
const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

/* ===== Filter row factory ===================================== */
function createFilterRow(fromJSON) {
  const row = document.createElement('li');
  row.className = 'filter-row';

  const ind = document.createElement('select');
  INDICATORS.forEach(t => ind.add(new Option(t, t)));

  const op = document.createElement('select');
  OPERATORS.forEach(o => op.add(new Option(o, o)));

  const val = document.createElement('input');
  val.type = 'number'; val.step = 'any'; val.placeholder = 'value';

  const del = document.createElement('button');
  del.textContent = '×'; del.className = 'remove';
  del.onclick = () => row.remove();

  // repopulate if loading from JSON
  if (fromJSON) { ind.value = fromJSON.ind; op.value = fromJSON.op; val.value = fromJSON.val; }

  row.append(ind, op, val, del);
  return row;
}

/* ===== Group row factory ====================================== */
function createGroupRow(fromJSON) {
  const row = document.createElement('li');
  row.className = 'group-row';

  const logic = document.createElement('button');
  logic.className = 'group-logic';
  logic.textContent = fromJSON?.logic || 'AND';
  logic.onclick = () => {
    logic.textContent = logic.textContent === 'AND' ? 'OR' : 'AND';
    updateSyntax();
  };

  const innerList = document.createElement('ul');
  innerList.className = 'inner';
  innerList.style.listStyle = 'none';
  innerList.style.display = 'flex';
  innerList.style.flexDirection = 'column';
  innerList.style.gap = '.5rem';

  const addCond = document.createElement('button');
  addCond.textContent = '+ Cond';
  addCond.onclick = () => { innerList.append(createFilterRow()); updateSyntax(); };

  const addGrp = document.createElement('button');
  addGrp.textContent = '+ Group';
  addGrp.onclick = () => { innerList.append(createGroupRow()); updateSyntax(); };

  const del = document.createElement('button');
  del.textContent = '×'; del.className = 'remove';
  del.onclick = () => { row.remove(); updateSyntax(); };

  // restore inner children if any
  if (fromJSON?.children) {
    fromJSON.children.forEach(ch => {
      innerList.append(ch.type === 'group' ? createGroupRow(ch) : createFilterRow(ch));
    });
  }

  row.append(logic, innerList, addCond, addGrp, del);
  return row;
}

/* ===== Serialize / Deserialize ================================ */
function serializeList(listEl) {
  return Array.from(listEl.children).map(el => {
    if (el.classList.contains('filter-row')) {
      const [ind, op, val] = el.querySelectorAll('select,input');
      return { type: 'filter', ind: ind.value, op: op.value, val: val.value };
    } else { // group
      const logic = el.querySelector('.group-logic').textContent;
      const children = serializeList(el.querySelector('ul.inner'));
      return { type: 'group', logic, children };
    }
  });
}
function loadFromJSON(data, listEl) {
  listEl.innerHTML = '';
  data.forEach(item => {
    listEl.append(item.type === 'group' ? createGroupRow(item) : createFilterRow(item));
  });
}

/* ===== Convert builder tree → Chartink syntax ================= */
function toSyntax(tree, outerLogic = 'AND') {
  return tree.map(node => {
    if (node.type === 'filter') {
      return `${node.ind} ${node.op} ${node.val}`;
    }
    const block = toSyntax(node.children, node.logic).join(` ${node.logic} `);
    return `(${block})`;
  }).join(` ${outerLogic} `);
}

/* ===== Natural-language stub (very simple demo) =============== */
function parseNL(str) {
  // extremely naive demo parser – real NLP should be smarter
  const tokens = str.toLowerCase().split(/and|,/);
  const parsed = tokens.map(tok => {
    if (tok.includes('rsi')) return { ind: 'rsi(14)', op: '>', val: tok.match(/\d+/)?.[0] || 60 };
    if (tok.includes('crosses') && tok.includes('200')) return { ind: 'close', op: 'crosses above', val: 'sma(close, 200)' };
    return { ind: 'close', op: '>', val: '100' };
  });
  return parsed;
}

/* ===== Update live syntax preview ============================ */
function updateSyntax() {
  const list = $('#filter-list');
  const tree = serializeList(list);
  $('#syntax').textContent = tree.length ? toSyntax(tree) : '—';
}

/* ===== UI wire-up ============================================ */
$('#add-condition').onclick = () => { $('#filter-list').append(createFilterRow()); updateSyntax(); };
$('#add-group').onclick     = () => { $('#filter-list').append(createGroupRow()); updateSyntax(); };
$('#nl-btn').onclick        = () => {
  const parsed = parseNL($('#nl-input').value);
  loadFromJSON(parsed, $('#filter-list'));
  updateSyntax();
};

$('#copy').onclick = async () => {
  await navigator.clipboard.writeText($('#syntax').textContent);
  alert('Scan clause copied.');
};

$('#export-json').onclick = () => {
  const data = JSON.stringify(serializeList($('#filter-list')), null, 2);
  const blob = new Blob([data], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: 'strategy.json' });
  a.click(); URL.revokeObjectURL(url);
};

$('#import-json').onclick = () => $('#file-input').click();
$('#file-input').onchange = e => {
  const file = e.target.files[0];
  if (!file) return;
  file.text().then(txt => {
    try { loadFromJSON(JSON.parse(txt), $('#filter-list')); updateSyntax(); }
    catch { alert('Invalid JSON'); }
  });
};

/* ===== Kick-off ============================================== */
updateSyntax();
