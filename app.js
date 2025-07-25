// Trading Journal Level 5 - Complete Application Logic

class TradingJournal {
  constructor() {
    this.data = {
      accounts: [],
      strategies: [],
      trades: [],
      settings: { currency: 'INR' }
    };
    this.activeTab = 'dashboard';
    this.livePrices = new Map();
    this.priceUpdateInterval = null;
    
    this.init();
  }

  init() {
    this.loadData();
    this.setupEventListeners();
    this.initStockAutocomplete();
    this.startLivePriceUpdates();
    this.renderActiveTab();
  }

  // Data Management
  loadData() {
    const saved = localStorage.getItem('tradingJournalData');
    if (saved) {
      this.data = { ...this.data, ...JSON.parse(saved) };
    } else {
      // Load sample data
      this.data.accounts = [
        {id: 1, name: "Main Trading", initialBalance: 100000, currentBalance: 105000},
        {id: 2, name: "Long Term", initialBalance: 200000, currentBalance: 215000}
      ];
      this.data.strategies = [
        {id: 1, name: "Momentum Trading"},
        {id: 2, name: "Value Investing"},
        {id: 3, name: "Swing Trading"},
        {id: 4, name: "Intraday"}
      ];
      this.data.trades = [
        {
          id: 1, symbol: "RELIANCE.NS", entryDate: "2025-01-15", entryPrice: 2450,
          stopLoss: 2400, target: 2550, exitDate: "2025-01-20", exitPrice: 2520,
          orderType: "Long", strategy: "Momentum Trading", account: "Main Trading",
          quantity: 10, pnl: 700, pnlPercent: 2.86, status: "Win"
        },
        {
          id: 2, symbol: "TCS.NS", entryDate: "2025-01-22", entryPrice: 3850,
          stopLoss: 3800, target: 3950, orderType: "Long", strategy: "Value Investing",
          account: "Long Term", quantity: 5, status: "Open"
        }
      ];
      this.saveData();
    }
  }

  saveData() {
    localStorage.setItem('tradingJournalData', JSON.stringify(this.data));
  }

  // Event Listeners
  setupEventListeners() {
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        this.switchTab(e.target.dataset.tab);
      });
    });

    // Forms
    document.getElementById('account-form').addEventListener('submit', (e) => this.addAccount(e));
    document.getElementById('strategy-form').addEventListener('submit', (e) => this.addStrategy(e));
    document.getElementById('trade-form').addEventListener('submit', (e) => this.addTrade(e));
    
    // Bulk delete
    document.getElementById('delete-selected').addEventListener('click', () => this.deleteSelectedTrades());
    
    // AI Insights
    document.getElementById('generate-insight').addEventListener('click', () => this.generateAIInsight());
  }

  switchTab(tabName) {
    // Update active tab
    document.querySelectorAll('.tab').forEach(tab => tab.classList.remove('active'));
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // Show/hide sections
    document.querySelectorAll('.tab-section').forEach(section => section.classList.add('hidden'));
    document.getElementById(`tab-${tabName}`).classList.remove('hidden');
    
    this.activeTab = tabName;
    this.renderActiveTab();
  }

  renderActiveTab() {
    switch(this.activeTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'settings':
        this.renderSettings();
        break;
      case 'trades':
        this.renderTradeForm();
        break;
      case 'openTrades':
        this.renderOpenTrades();
        break;
      case 'allTrades':
        this.renderAllTrades();
        break;
      case 'analytics':
        this.renderAnalytics();
        break;
    }
  }

  // Dashboard
  renderDashboard() {
    const cards = document.getElementById('dashboard-cards');
    const { totalBalance, balanceInUse, totalPnL, openPositions } = this.calculateDashboardMetrics();
    
    cards.innerHTML = `
      <div class="dashboard-card">
        <h3>Total Available Balance</h3>
        <div class="value currency-display">${this.formatCurrency(totalBalance)}</div>
      </div>
      <div class="dashboard-card">
        <h3>Balance in Use</h3>
        <div class="value currency-display">${this.formatCurrency(balanceInUse)}</div>
      </div>
      <div class="dashboard-card">
        <h3>Total P&L</h3>
        <div class="value currency-display ${totalPnL >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(totalPnL)}</div>
      </div>
      <div class="dashboard-card">
        <h3>Open Positions</h3>
        <div class="value">${openPositions}</div>
      </div>
    `;

    this.renderRecentTrades();
    this.renderMarketIndices();
  }

  calculateDashboardMetrics() {
    const totalBalance = this.data.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const openTrades = this.data.trades.filter(t => t.status === 'Open');
    const balanceInUse = openTrades.reduce((sum, trade) => sum + (trade.entryPrice * trade.quantity), 0);
    const totalPnL = this.data.trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    return { totalBalance, balanceInUse, totalPnL, openPositions: openTrades.length };
  }

  renderRecentTrades() {
    const table = document.getElementById('recent-trades-table');
    const recentTrades = this.data.trades.slice(-5).reverse();
    
    table.innerHTML = `
      <thead>
        <tr><th>Symbol</th><th>Date</th><th>Type</th><th>P&L</th><th>Status</th></tr>
      </thead>
      <tbody>
        ${recentTrades.map(trade => `
          <tr>
            <td>${trade.symbol}</td>
            <td>${trade.entryDate}</td>
            <td>${trade.orderType}</td>
            <td class="currency ${(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(trade.pnl || 0)}</td>
            <td><span class="trade-status ${trade.status.toLowerCase()}">${trade.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  renderMarketIndices() {
    const indices = document.getElementById('market-indices');
    const mockIndices = [
      { name: 'NIFTY 50', value: 23500, change: '+1.2%' },
      { name: 'SENSEX', value: 77800, change: '+0.8%' },
      { name: 'BANKNIFTY', value: 51200, change: '-0.3%' }
    ];
    
    indices.innerHTML = mockIndices.map(index => `
      <div class="market-card">
        <h4>${index.name}</h4>
        <div class="index-value">${index.value.toLocaleString()}</div>
        <div class="index-change ${index.change.startsWith('+') ? 'positive' : 'negative'}">${index.change}</div>
      </div>
    `).join('');
  }

  // Settings
  renderSettings() {
    this.renderAccountsList();
    this.renderStrategiesList();
  }

  addAccount(e) {
    e.preventDefault();
    const name = document.getElementById('account-name').value;
    const balance = parseFloat(document.getElementById('account-balance').value);
    
    const newAccount = {
      id: Date.now(),
      name,
      initialBalance: balance,
      currentBalance: balance
    };
    
    this.data.accounts.push(newAccount);
    this.saveData();
    this.renderAccountsList();
    e.target.reset();
  }

  addStrategy(e) {
    e.preventDefault();
    const name = document.getElementById('strategy-name').value;
    
    const newStrategy = {
      id: Date.now(),
      name
    };
    
    this.data.strategies.push(newStrategy);
    this.saveData();
    this.renderStrategiesList();
    e.target.reset();
  }

  renderAccountsList() {
    const list = document.getElementById('accounts-list');
    list.innerHTML = this.data.accounts.map(account => `
      <li>
        <span>${account.name} - ₹${account.currentBalance.toLocaleString()}</span>
        <button class="btn btn--sm btn--outline" onclick="app.deleteAccount(${account.id})">Delete</button>
      </li>
    `).join('');
  }

  renderStrategiesList() {
    const list = document.getElementById('strategies-list');
    list.innerHTML = this.data.strategies.map(strategy => `
      <li>
        <span>${strategy.name}</span>
        <button class="btn btn--sm btn--outline" onclick="app.deleteStrategy(${strategy.id})">Delete</button>
      </li>
    `).join('');
  }

  deleteAccount(id) {
    this.data.accounts = this.data.accounts.filter(a => a.id !== id);
    this.saveData();
    this.renderAccountsList();
  }

  deleteStrategy(id) {
    this.data.strategies = this.data.strategies.filter(s => s.id !== id);
    this.saveData();
    this.renderStrategiesList();
  }

  // Trade Form
  renderTradeForm() {
    const strategySelect = document.getElementById('trade-strategy');
    const accountSelect = document.getElementById('trade-account');
    
    strategySelect.innerHTML = this.data.strategies.map(s => 
      `<option value="${s.name}">${s.name}</option>`
    ).join('');
    
    accountSelect.innerHTML = this.data.accounts.map(a => 
      `<option value="${a.name}">${a.name}</option>`
    ).join('');
  }

  addTrade(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const trade = {
      id: Date.now(),
      symbol: document.getElementById('trade-symbol').value,
      entryDate: document.getElementById('trade-entry-date').value,
      entryPrice: parseFloat(document.getElementById('trade-entry-price').value),
      stopLoss: parseFloat(document.getElementById('trade-stoploss').value),
      target: parseFloat(document.getElementById('trade-target').value),
      exitDate: document.getElementById('trade-exit-date').value || null,
      exitPrice: parseFloat(document.getElementById('trade-exit-price').value) || null,
      orderType: document.getElementById('trade-order-type').value,
      strategy: document.getElementById('trade-strategy').value,
      account: document.getElementById('trade-account').value,
      quantity: parseInt(document.getElementById('trade-quantity').value)
    };

    // Calculate P&L and status
    if (trade.exitPrice && trade.exitDate) {
      const pnlPerShare = trade.orderType === 'Long' ? 
        (trade.exitPrice - trade.entryPrice) : 
        (trade.entryPrice - trade.exitPrice);
      trade.pnl = pnlPerShare * trade.quantity;
      trade.pnlPercent = (pnlPerShare / trade.entryPrice) * 100;
      trade.status = trade.pnl >= 0 ? 'Win' : 'Loss';
    } else {
      trade.status = 'Open';
    }

    this.data.trades.push(trade);
    this.saveData();
    e.target.reset();
    this.showMessage('Trade added successfully!', 'success');
  }

  // Open Trades
  renderOpenTrades() {
    const openTrades = this.data.trades.filter(t => t.status === 'Open');
    const table = document.getElementById('open-trades-table');
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>Symbol</th><th>Entry Date</th><th>Entry Price</th><th>Current Price</th>
          <th>Quantity</th><th>Current P&L</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${openTrades.map(trade => {
          const currentPrice = this.getCurrentPrice(trade.symbol);
          const currentPnL = this.calculateCurrentPnL(trade, currentPrice);
          return `
            <tr>
              <td>${trade.symbol}</td>
              <td>${trade.entryDate}</td>
              <td class="currency">${this.formatCurrency(trade.entryPrice)}</td>
              <td class="currency live-price">${this.formatCurrency(currentPrice)}</td>
              <td>${trade.quantity}</td>
              <td class="currency ${currentPnL >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(currentPnL)}</td>
              <td>
                <button class="action-btn close" onclick="app.closeTrade(${trade.id})">Close</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;

    this.renderOpenTradesAnalytics(openTrades);
  }

  renderOpenTradesAnalytics(openTrades) {
    const totalCurrentPnL = openTrades.reduce((sum, trade) => {
      const currentPrice = this.getCurrentPrice(trade.symbol);
      return sum + this.calculateCurrentPnL(trade, currentPrice);
    }, 0);

    document.getElementById('open-analytics').innerHTML = `
      Total Open Positions: ${openTrades.length} | 
      Current Unrealized P&L: <span class="currency ${totalCurrentPnL >= 0 ? 'positive' : 'negative'}">₹${totalCurrentPnL.toLocaleString()}</span>
    `;
  }

  calculateCurrentPnL(trade, currentPrice) {
    const pnlPerShare = trade.orderType === 'Long' ? 
      (currentPrice - trade.entryPrice) : 
      (trade.entryPrice - currentPrice);
    return pnlPerShare * trade.quantity;
  }

  closeTrade(tradeId) {
    const trade = this.data.trades.find(t => t.id === tradeId);
    if (trade) {
      const currentPrice = this.getCurrentPrice(trade.symbol);
      trade.exitPrice = currentPrice;
      trade.exitDate = new Date().toISOString().split('T')[0];
      
      const pnlPerShare = trade.orderType === 'Long' ? 
        (trade.exitPrice - trade.entryPrice) : 
        (trade.entryPrice - trade.exitPrice);
      trade.pnl = pnlPerShare * trade.quantity;
      trade.pnlPercent = (pnlPerShare / trade.entryPrice) * 100;
      trade.status = trade.pnl >= 0 ? 'Win' : 'Loss';
      
      this.saveData();
      this.renderOpenTrades();
      this.showMessage('Trade closed successfully!', 'success');
    }
  }

  // All Trades
  renderAllTrades() {
    const table = document.getElementById('all-trades-table');
    
    table.innerHTML = `
      <thead>
        <tr>
          <th><input type="checkbox" class="trade-checkbox" id="select-all" onchange="app.toggleSelectAll()"></th>
          <th>Symbol</th><th>Entry Date</th><th>Entry Price</th><th>Exit Price</th>
          <th>Quantity</th><th>P&L</th><th>Strategy</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${this.data.trades.map(trade => `
          <tr>
            <td><input type="checkbox" class="trade-checkbox trade-select" data-id="${trade.id}"></td>
            <td>${trade.symbol}</td>
            <td>${trade.entryDate}</td>
            <td class="currency">${this.formatCurrency(trade.entryPrice)}</td>
            <td class="currency">${trade.exitPrice ? this.formatCurrency(trade.exitPrice) : '-'}</td>
            <td>${trade.quantity}</td>
            <td class="currency ${(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(trade.pnl || 0)}</td>
            <td>${trade.strategy}</td>
            <td><span class="trade-status ${trade.status.toLowerCase()}">${trade.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  toggleSelectAll() {
    const selectAll = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.trade-select');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
  }

  deleteSelectedTrades() {
    const selected = Array.from(document.querySelectorAll('.trade-select:checked'))
      .map(cb => parseInt(cb.dataset.id));
    
    if (selected.length > 0) {
      this.data.trades = this.data.trades.filter(t => !selected.includes(t.id));
      this.saveData();
      this.renderAllTrades();
      this.showMessage(`${selected.length} trades deleted successfully!`, 'success');
    }
  }

  // Analytics
  renderAnalytics() {
    this.renderEquityChart();
    this.renderWinLossChart();
    this.renderAIInsights();
  }

  renderEquityChart() {
    const ctx = document.getElementById('equity-chart').getContext('2d');
    const trades = this.data.trades.filter(t => t.pnl !== undefined);
    let cumulative = 0;
    const data = trades.map(trade => {
      cumulative += trade.pnl;
      return { x: trade.entryDate, y: cumulative };
    });

    new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Cumulative P&L (₹)',
          data: data,
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          fill: true
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: 'time', time: { unit: 'day' } },
          y: { beginAtZero: true }
        }
      }
    });
  }

  renderWinLossChart() {
    const ctx = document.getElementById('winloss-chart').getContext('2d');
    const trades = this.data.trades.filter(t => t.status !== 'Open');
    const wins = trades.filter(t => t.status === 'Win').length;
    const losses = trades.filter(t => t.status === 'Loss').length;

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
          data: [wins, losses],
          backgroundColor: ['#1FB8CD', '#B4413C']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false
      }
    });
  }

  renderAIInsights() {
    const insights = [
      "Your momentum trading strategy shows a 68% win rate with strong risk management",
      "Consider reducing position size in volatile stocks like RELIANCE.NS",
      "Your average holding period of 5 days aligns well with swing trading approach",
      "Risk-reward ratio averaging 1:1.5 indicates good trade selection"
    ];
    
    const list = document.getElementById('ai-insights');
    list.innerHTML = insights.map(insight => `<li>${insight}</li>`).join('');
  }

  generateAIInsight() {
    const insights = [
      "Consider diversifying across more sectors for better risk distribution",
      "Your recent trades show improved entry timing - keep up the good work!",
      "Stop loss adherence is at 95% - excellent discipline",
      "Banking sector exposure is high - monitor sector concentration risk"
    ];
    
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];
    const list = document.getElementById('ai-insights');
    list.innerHTML += `<li style="font-weight: bold; color: var(--color-primary);">${randomInsight}</li>`;
  }

  // Live Prices Simulation
  startLivePriceUpdates() {
    // Initialize with mock prices
    const stocks = ['RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'ICICIBANK.NS'];
    stocks.forEach(symbol => {
      this.livePrices.set(symbol, Math.random() * 1000 + 1000);
    });

    // Update prices every 5 seconds
    this.priceUpdateInterval = setInterval(() => {
      this.livePrices.forEach((price, symbol) => {
        const change = (Math.random() - 0.5) * 20;
        this.livePrices.set(symbol, Math.max(price + change, 1));
      });
      
      if (this.activeTab === 'openTrades') {
        this.renderOpenTrades();
      }
    }, 5000);
  }

  getCurrentPrice(symbol) {
    return this.livePrices.get(symbol) || 1000;
  }

  // Stock Autocomplete
  initStockAutocomplete() {
    const stocks = [
      "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "ICICIBANK.NS", "HINDUNILVR.NS",
      "INFY.NS", "ITC.NS", "KOTAKBANK.NS", "LT.NS", "AXISBANK.NS",
      "BHARTIARTL.NS", "ASIANPAINT.NS", "MARUTI.NS", "M&M.NS", "NESTLEIND.NS"
    ];
    
    const datalist = document.getElementById('symbols');
    datalist.innerHTML = stocks.map(stock => `<option value="${stock}">`).join('');
  }

  // Utilities
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  showMessage(text, type) {
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }
}

// Initialize app
const app = new TradingJournal();

// Expose to global scope for event handlers
window.app = app;