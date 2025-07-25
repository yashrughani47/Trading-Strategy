// Trading Journal SPA – Vanilla JS (stable build)
/* The application functions entirely on the client with no persistence APIs */

(function () {
  /* ---------------- Utility helpers ---------------- */
  const $ = (sel, scope = document) => scope.querySelector(sel);
  const $$ = (sel, scope = document) => Array.from(scope.querySelectorAll(sel));
  const COLORS = ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454', '#13343B'];

  function uuid() {
    return (window.crypto && crypto.randomUUID)
      ? crypto.randomUUID()
      : 'xxxxxxxx-xxxx'.replace(/x/g, () => ((Math.random() * 16) | 0).toString(16));
  }

  const toast = (msg) => {
    const cont = $('#toastContainer');
    if (!cont) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    cont.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  };

  /* ---------------- Global state ---------------- */
  const state = { accounts: [], strategies: [], trades: [] };

  /* ---------------- Derived helpers ---------------- */
  function calcDerived(t) {
    const risk = Math.abs(t.entryPrice - t.stopLoss);
    const reward = Math.abs(t.targetPrice - t.entryPrice);
    t.riskReward = risk ? +(reward / risk).toFixed(2) : 0;
    const dir = t.side === 'long' ? 1 : -1;
    t.pnl = +((t.exitPrice - t.entryPrice) * dir).toFixed(2);
    t.outcome = t.pnl >= 0 ? 'win' : 'loss';
  }

  /* ---------------- Select population ---------------- */
  function refreshSelectOptions() {
    // Accounts
    $$('select[id$="account"]').forEach((sel) => {
      const prev = sel.value;
      const isFilter = sel.id.includes('filter') || sel.id.includes('analytics');
      sel.innerHTML = isFilter ? '<option value="all">All Accounts</option>' : '';
      state.accounts.forEach((acc) => {
        const opt = document.createElement('option');
        opt.value = acc.id;
        opt.textContent = acc.name;
        sel.appendChild(opt);
      });
      if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
    });

    // Strategies
    $$('select[id$="strategy"]').forEach((sel) => {
      const prev = sel.value;
      const isFilter = sel.id.includes('filter') || sel.id.includes('analytics');
      sel.innerHTML = isFilter ? '<option value="all">All Strategies</option>' : '';
      state.strategies.forEach((strat) => {
        const opt = document.createElement('option');
        opt.value = strat.id;
        opt.textContent = strat.name;
        sel.appendChild(opt);
      });
      if (prev && [...sel.options].some((o) => o.value === prev)) sel.value = prev;
    });
  }

  /* ---------------- Dashboard renderers ---------------- */
  function renderAccountsTable() {
    const tbody = $('#accounts-table tbody');
    tbody.innerHTML = '';
    state.accounts.forEach((acc) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${acc.name}</td><td>${acc.balance.toFixed(2)}</td><td></td>`;
      const actions = tr.lastElementChild;
      // Edit
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn--sm btn--secondary';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        $('#account-name').value = acc.name;
        $('#account-balance').value = acc.balance;
        $('#account-submit').dataset.id = acc.id;
        $('#account-submit').textContent = 'Update';
      });
      // Delete
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn--sm btn--outline';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        if (state.trades.some((t) => t.accountId === acc.id)) return toast('Cannot delete account with trades');
        state.accounts = state.accounts.filter((a) => a.id !== acc.id);
        renderAccountsTable(); refreshSelectOptions();
      });
      actions.append(editBtn, delBtn);
      tbody.appendChild(tr);
    });
  }

  function renderStrategiesTable() {
    const tbody = $('#strategies-table tbody');
    tbody.innerHTML = '';
    state.strategies.forEach((strat) => {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${strat.name}</td><td></td>`;
      const actions = tr.lastElementChild;
      const editBtn = document.createElement('button');
      editBtn.className = 'btn btn--sm btn--secondary';
      editBtn.textContent = 'Edit';
      editBtn.addEventListener('click', () => {
        $('#strategy-name').value = strat.name;
        $('#strategy-submit').dataset.id = strat.id;
        $('#strategy-submit').textContent = 'Update';
      });
      const delBtn = document.createElement('button');
      delBtn.className = 'btn btn--sm btn--outline';
      delBtn.textContent = 'Delete';
      delBtn.addEventListener('click', () => {
        if (state.trades.some((t) => t.strategyId === strat.id)) return toast('Cannot delete strategy with trades');
        state.strategies = state.strategies.filter((s) => s.id !== strat.id);
        renderStrategiesTable(); refreshSelectOptions();
      });
      actions.append(editBtn, delBtn);
      tbody.appendChild(tr);
    });
  }

  /* ---------------- Trades renderer ---------------- */
  function tradeRowHtml(tr) {
    const accName = state.accounts.find((a) => a.id === tr.accountId)?.name || '';
    const stratName = state.strategies.find((s) => s.id === tr.strategyId)?.name || '';
    return `<td>${accName}</td><td>${stratName}</td><td>${tr.side}</td><td>${tr.entryDate}</td><td>${tr.entryPrice}</td><td>${tr.stopLoss}</td><td>${tr.targetPrice}</td><td>${tr.riskReward}</td><td>${tr.exitDate}</td><td>${tr.exitPrice}</td><td>${tr.pnl}</td><td>${tr.outcome}</td>`;
  }

  function getFilteredTrades(prefix) {
    const accountFilter = $('#' + prefix + 'account').value;
    const stratFilter = $('#' + prefix + 'strategy').value;
    const outcomeFilter = $('#' + prefix + 'outcome').value;
    return state.trades.filter((t) => {
      if (accountFilter !== 'all' && t.accountId !== accountFilter) return false;
      if (stratFilter !== 'all' && t.strategyId !== stratFilter) return false;
      if (outcomeFilter !== 'all' && t.outcome !== outcomeFilter) return false;
      return true;
    });
  }

  function renderTradesTable() {
    const tbody = $('#trades-table tbody');
    tbody.innerHTML = '';
    getFilteredTrades('filter-').forEach((trd) => {
      const tr = document.createElement('tr');
      tr.innerHTML = tradeRowHtml(trd) + '<td></td>';
      const del = document.createElement('button');
      del.className = 'btn btn--sm btn--outline';
      del.textContent = 'Delete';
      del.addEventListener('click', () => {
        state.trades = state.trades.filter((t) => t.id !== trd.id);
        renderTradesTable(); renderAllTradesTable(); updateAnalytics();
      });
      tr.lastElementChild.appendChild(del);
      tbody.appendChild(tr);
    });
  }

  /* ---------------- All trades */
  function renderAllTradesHeader() { $('#all-trades-table thead').innerHTML = $('#trades-table thead').innerHTML; }
  function renderAllTradesTable() {
    const tbody = $('#all-trades-table tbody');
    tbody.innerHTML = '';
    getFilteredTrades('all-filter-').forEach((trd) => {
      const tr = document.createElement('tr');
      tr.innerHTML = tradeRowHtml(trd);
      tbody.appendChild(tr);
    });
  }

  /* ---------------- Analytics ---------------- */
  let charts = { equity: null, winloss: null, strategy: null };

  function computeMetrics(trades) {
    const total = trades.length;
    const wins = trades.filter((t) => t.outcome === 'win');
    const losses = trades.filter((t) => t.outcome === 'loss');
    const winRate = total ? ((wins.length / total) * 100).toFixed(1) : 0;
    const avgRR = total ? (trades.reduce((a, t) => a + t.riskReward, 0) / total).toFixed(2) : 0;
    const sumWins = wins.reduce((a, t) => a + t.pnl, 0);
    const sumLoss = losses.reduce((a, t) => a + t.pnl, 0);
    const profitFactor = sumLoss !== 0 ? (sumWins / Math.abs(sumLoss)).toFixed(2) : '—';
    const expectancy = (total ? ((wins.length / total) * (sumWins / (wins.length || 1)) + (losses.length / total) * (sumLoss / (losses.length || 1))) : 0).toFixed(2);
    const totalPnL = trades.reduce((a, t) => a + t.pnl, 0).toFixed(2);
    let equity = 0, peak = 0, maxDD = 0;
    [...trades].sort((a,b) => a.exitDate.localeCompare(b.exitDate)).forEach((t) => { equity += t.pnl; if (equity > peak) peak = equity; maxDD = Math.max(maxDD, peak - equity); });
    return { total, winRate, avgRR, profitFactor, expectancy, totalPnL, maxDD: maxDD.toFixed(2) };
  }

  function renderMetrics(m) {
    $('#metrics-grid').innerHTML = [
      ['Total Trades', m.total],
      ['Win Rate %', m.winRate],
      ['Avg R:R', m.avgRR],
      ['Profit Factor', m.profitFactor],
      ['Expectancy', m.expectancy],
      ['Total P&L', m.totalPnL],
      ['Max Drawdown', m.maxDD],
    ].map(([l,v]) => `<div class="metric-card"><span>${l}</span><div class="metric-value">${v}</div></div>`).join('');
  }

  function renderCharts(trades) {
    Object.values(charts).forEach((c) => c && c.destroy());
    if (!trades.length) {charts={ equity:null,winloss:null,strategy:null}; return; }
    const sorted=[...trades].sort((a,b)=>a.exitDate.localeCompare(b.exitDate));
    let cum=0; const equityData=sorted.map(t=>{cum+=t.pnl; return cum.toFixed(2);}); const labels=sorted.map(t=>t.exitDate);
    charts.equity=new Chart($('#equity-chart'),{type:'line',data:{labels,datasets:[{data:equityData,borderColor:COLORS[0],fill:false,tension:0.3}]},options:{responsive:true,plugins:{legend:{display:false}}}});
    const wins=trades.filter(t=>t.outcome==='win').length, losses=trades.length-wins;
    charts.winloss=new Chart($('#winloss-chart'),{type:'pie',data:{labels:['Wins','Losses'],datasets:[{data:[wins,losses],backgroundColor:[COLORS[2],COLORS[5]]}]},options:{responsive:true}});
    const pnlByStrat={}; trades.forEach(t=>{const name=state.strategies.find(s=>s.id===t.strategyId)?.name||'N/A'; pnlByStrat[name]=(pnlByStrat[name]||0)+t.pnl;});
    const stratLabels=Object.keys(pnlByStrat);
    charts.strategy=new Chart($('#strategy-chart'),{type:'bar',data:{labels:stratLabels,datasets:[{data:stratLabels.map(k=>pnlByStrat[k].toFixed(2)),backgroundColor:COLORS.slice(0,stratLabels.length)}]},options:{responsive:true,plugins:{legend:{display:false}}}});
  }

  function updateAnalytics(){const trades=getFilteredTrades('analytics-filter-'); renderMetrics(computeMetrics(trades)); renderCharts(trades);} 

  /* ---------------- CSV helpers ---------------- */
  function exportCSV(){ if(!state.trades.length) return toast('No trades'); const headers=['account','strategy','side','entryDate','entryPrice','stopLoss','targetPrice','exitDate','exitPrice','riskReward','pnl','outcome']; const rows=state.trades.map(t=>[state.accounts.find(a=>a.id===t.accountId)?.name||'',state.strategies.find(s=>s.id===t.strategyId)?.name||'',t.side,t.entryDate,t.entryPrice,t.stopLoss,t.targetPrice,t.exitDate,t.exitPrice,t.riskReward,t.pnl,t.outcome].join(',')); const blob=new Blob([[headers.join(',')].concat(rows).join('\n')],{type:'text/csv'}); const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download='trades.csv'; a.click(); URL.revokeObjectURL(url);} 

  function importCSV(e){const f=e.target.files[0]; if(!f) return; const reader=new FileReader(); reader.onload=(ev)=>{ const lines=ev.target.result.split(/\r?\n/).filter(Boolean); if(lines.length<2) return; lines.slice(1).forEach(line=>{ const [accName,stratName,side,entryDate,entryPrice,stopLoss,targetPrice,exitDate,exitPrice]=line.split(','); let acc=state.accounts.find(a=>a.name===accName); if(!acc){acc={id:uuid(),name:accName,balance:0}; state.accounts.push(acc);} let strat=state.strategies.find(s=>s.name===stratName); if(!strat){strat={id:uuid(),name:stratName}; state.strategies.push(strat);} const tr={id:uuid(),accountId:acc.id,strategyId:strat.id,side,entryDate,entryPrice:+entryPrice,stopLoss:+stopLoss,targetPrice:+targetPrice,exitDate,exitPrice:+exitPrice}; calcDerived(tr); state.trades.push(tr);}); refreshSelectOptions(); renderAccountsTable(); renderStrategiesTable(); renderTradesTable(); renderAllTradesTable(); updateAnalytics(); toast('CSV imported'); }; reader.readAsText(f); e.target.value=''; }

  /* ---------------- Tab switching ---------------- */
  function switchTab(btn){ if(btn.classList.contains('active')) return; $$('.tab-link').forEach(b=>{b.classList.toggle('active',b===btn); b.setAttribute('aria-selected', b===btn);}); $$('.tab-panel').forEach(p=>p.classList.add('hidden')); $('#tab-'+btn.dataset.tab).classList.remove('hidden'); if(btn.dataset.tab==='analytics') updateAnalytics(); }

  /* ---------------- Event bindings ---------------- */
  function addEventListeners(){
    // Accounts form
    $('#account-form').addEventListener('submit',(e)=>{e.preventDefault(); const name=$('#account-name').value.trim(); const balance=parseFloat($('#account-balance').value)||0; if(!name) return; const btn=$('#account-submit'); if(btn.dataset.id){ const acc=state.accounts.find(a=>a.id===btn.dataset.id); if(acc){acc.name=name; acc.balance=balance; toast('Account updated');} delete btn.dataset.id; btn.textContent='Add'; } else { state.accounts.push({id:uuid(), name, balance}); toast('Account added'); } e.target.reset(); renderAccountsTable(); refreshSelectOptions();});

    // Strategy form
    $('#strategy-form').addEventListener('submit',(e)=>{e.preventDefault(); const name=$('#strategy-name').value.trim(); if(!name) return; const btn=$('#strategy-submit'); if(btn.dataset.id){ const s=state.strategies.find(st=>st.id===btn.dataset.id); if(s){s.name=name; toast('Strategy updated');} delete btn.dataset.id; btn.textContent='Add'; } else { state.strategies.push({id:uuid(), name}); toast('Strategy added'); } e.target.reset(); renderStrategiesTable(); refreshSelectOptions();});

    // Trade entry
    $('#trade-form').addEventListener('submit',(e)=>{e.preventDefault(); const t={ id:uuid(), accountId:$('#trade-account').value, strategyId:$('#trade-strategy').value, side:$('#side').value, entryDate:$('#entry-date').value, entryPrice:+$('#entry-price').value, stopLoss:+$('#stop-loss').value, targetPrice:+$('#target').value, exitDate:$('#exit-date').value, exitPrice:+$('#exit-price').value }; if(t.accountId==='all'||t.strategyId==='all'||!t.accountId||!t.strategyId) return toast('Select account & strategy'); calcDerived(t); state.trades.push(t); e.target.reset(); renderTradesTable(); renderAllTradesTable(); updateAnalytics(); toast('Trade saved');});

    // Filter change
    ['filter-','all-filter-','analytics-filter-'].forEach(pref=>['account','strategy','outcome'].forEach(f=>$('#'+pref+f).addEventListener('change',()=>{ if(pref==='filter-') renderTradesTable(); else if(pref==='all-filter-') renderAllTradesTable(); else updateAnalytics(); })));

    // CSV buttons
    $('#export-csv').addEventListener('click',exportCSV);
    $('#import-csv-btn').addEventListener('click',()=>$('#import-csv-input').click());
    $('#import-csv-input').addEventListener('change',importCSV);

    // Tabs
    $$('.tab-link').forEach(btn=>btn.addEventListener('click',()=>switchTab(btn)));
  }

  /* ---------------- Init ---------------- */
  function seedSample(){ const acc={id:uuid(), name:'Demo Account', balance:10000}; const strat={id:uuid(), name:'Breakout'}; state.accounts.push(acc); state.strategies.push(strat); const t={ id:uuid(), accountId:acc.id, strategyId:strat.id, side:'long', entryDate:'2025-01-15', entryPrice:100, stopLoss:95, targetPrice:120, exitDate:'2025-01-20', exitPrice:118 }; calcDerived(t); state.trades.push(t);} 

  function init(){ seedSample(); addEventListeners(); refreshSelectOptions(); renderAccountsTable(); renderStrategiesTable(); renderTradesTable(); renderAllTradesHeader(); renderAllTradesTable(); updateAnalytics(); }

  document.addEventListener('DOMContentLoaded', init);
})();