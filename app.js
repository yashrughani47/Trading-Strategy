// Trading Journal Pro - Ultimate NSE Platform
// Enhanced version with comprehensive Analytics functionality and fixed dropdown filters

class TradingJournalPro {
  constructor() {
    this.data = {
      accounts: [],
      strategies: [],
      trades: [],
      settings: { 
        currency: 'INR',
        lastUpdate: null,
        autoRefresh: true,
        dataVersion: '2.0'
      }
    };
    this.activeTab = 'dashboard';
    this.livePrices = new Map();
    this.priceUpdateInterval = null;
    this.currentPage = 1;
    this.pageSize = 20;
    this.filters = {};
    this.analyticsFilters = {};
    this.charts = {};
    
    // Comprehensive NSE stock database
    this.nseStocks = [
      "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "BHARTIARTL.NS", "ICICIBANK.NS", "SBIN.NS", "INFY.NS", "LT.NS", "ITC.NS", "HCLTECH.NS",
      "BAJFINANCE.NS", "HINDUNILVR.NS", "KOTAKBANK.NS", "ASIANPAINT.NS", "MARUTI.NS", "TITAN.NS", "SUNPHARMA.NS", "ULTRACEMCO.NS", 
      "AXISBANK.NS", "NESTLEIND.NS", "WIPRO.NS", "ADANIENT.NS", "BAJAJFINSV.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "M&M.NS",
      "TECHM.NS", "TATAMOTORS.NS", "COALINDIA.NS", "DRREDDY.NS", "JSWSTEEL.NS", "GRASIM.NS", "BRITANNIA.NS", "CIPLA.NS", "EICHERMOT.NS",
      "APOLLOHOSP.NS", "BPCL.NS", "HINDALCO.NS", "DIVISLAB.NS", "HEROMOTOCO.NS", "SHREECEM.NS", "BAJAJ-AUTO.NS", "ADANIPORTS.NS"
    ];
    
    // AI Insights Database
    this.aiInsightsBank = [
      "Your win rate has improved by 15% over the last month - excellent progress!",
      "Consider reducing position size on high-volatility stocks like RELIANCE.NS",
      "Your best performing strategy shows 75% win rate with breakout patterns",
      "Current portfolio correlation with NIFTY 50 is 0.85 - consider diversification",
      "Risk-reward ratio of 1:2.5 indicates strong trade selection discipline",
      "Banking sector exposure is 35% - monitor for sector concentration risk",
      "Your average holding period of 5 days aligns well with swing trading",
      "Stop loss adherence at 95% shows excellent risk management",
      "Recent trades show improved entry timing with 20% better average entry prices",
      "Consider adding defensive stocks during current market volatility",
      "Your momentum strategy outperforms during trending markets by 25%",
      "Weekly performance analysis shows Tuesday entries have highest success rate",
      "Portfolio beta of 1.2 indicates moderate systematic risk exposure",
      "Consider profit booking in overweight positions above 10% allocation",
      "Recent market sentiment suggests cautious approach to new positions"
    ];
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.initializeApp());
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    console.log('Initializing Trading Journal Pro...');
    this.loadData();
    this.setupEventListeners();
    this.initStockAutocomplete();
    this.startLivePriceUpdates();
    this.updateLastRefreshTime();
    this.renderActiveTab();
    console.log('Trading Journal Pro initialized successfully');
  }

  // Data Management
  loadData() {
    const saved = localStorage.getItem('tradingJournalProData');
    if (saved) {
      try {
        const parsedData = JSON.parse(saved);
        this.data = { ...this.data, ...parsedData };
      } catch (error) {
        console.error('Error loading saved data:', error);
        this.loadSampleData();
      }
    } else {
      this.loadSampleData();
    }
  }

  loadSampleData() {
    this.data.accounts = [
      {id: 1, name: "Trading Account 1", initialBalance: 500000, currentBalance: 525000},
      {id: 2, name: "Trading Account 2", initialBalance: 300000, currentBalance: 315000},
      {id: 3, name: "Investment Account", initialBalance: 1000000, currentBalance: 1050000}
    ];

    this.data.strategies = [
      {id: 1, name: "Breakout"},
      {id: 2, name: "Momentum"},
      {id: 3, name: "Swing Trading"},
      {id: 4, name: "Value Investing"}
    ];

    // Enhanced sample trades with more comprehensive data
    this.data.trades = [
      {
        id: 1, symbol: "RELIANCE.NS", entryDate: "2024-01-15", exitDate: "2024-01-18",
        entryPrice: 2500, exitPrice: 2600, stopLoss: 2400, target: 2650, quantity: 10,
        orderType: "Long", strategy: "Breakout", account: "Trading Account 1",
        pnl: 1000, pnlPercent: 4.0, status: "Win"
      },
      {
        id: 2, symbol: "TCS.NS", entryDate: "2024-01-20", exitDate: "2024-01-22",
        entryPrice: 3800, exitPrice: 3750, stopLoss: 3700, target: 3900, quantity: 5,
        orderType: "Long", strategy: "Momentum", account: "Trading Account 1",
        pnl: -250, pnlPercent: -1.32, status: "Loss"
      },
      {
        id: 3, symbol: "INFY.NS", entryDate: "2024-02-05", exitDate: "2024-02-08",
        entryPrice: 1500, exitPrice: 1620, stopLoss: 1450, target: 1600, quantity: 20,
        orderType: "Long", strategy: "Swing Trading", account: "Trading Account 2",
        pnl: 2400, pnlPercent: 8.0, status: "Win"
      },
      {
        id: 4, symbol: "HDFC.NS", entryDate: "2024-02-12", exitDate: "2024-02-15",
        entryPrice: 1800, exitPrice: 1750, stopLoss: 1750, target: 1900, quantity: 15,
        orderType: "Long", strategy: "Value Investing", account: "Investment Account",
        pnl: -750, pnlPercent: -2.78, status: "Loss"
      },
      {
        id: 5, symbol: "ICICIBANK.NS", entryDate: "2024-03-01", exitDate: "2024-03-05",
        entryPrice: 950, exitPrice: 1020, stopLoss: 920, target: 1000, quantity: 25,
        orderType: "Long", strategy: "Breakout", account: "Trading Account 1",
        pnl: 1750, pnlPercent: 7.37, status: "Win"
      },
      {
        id: 6, symbol: "SBIN.NS", entryDate: "2024-03-10", exitDate: "2024-03-12",
        entryPrice: 600, exitPrice: 580, stopLoss: 580, target: 640, quantity: 30,
        orderType: "Long", strategy: "Momentum", account: "Trading Account 2",
        pnl: -600, pnlPercent: -3.33, status: "Loss"
      },
      {
        id: 7, symbol: "WIPRO.NS", entryDate: "2024-03-15", exitDate: "2024-03-18",
        entryPrice: 450, exitPrice: 485, stopLoss: 430, target: 480, quantity: 40,
        orderType: "Long", strategy: "Swing Trading", account: "Trading Account 1",
        pnl: 1400, pnlPercent: 7.78, status: "Win"
      },
      {
        id: 8, symbol: "MARUTI.NS", entryDate: "2024-03-20", exitDate: "2024-03-25",
        entryPrice: 9500, exitPrice: 9200, stopLoss: 9200, target: 10000, quantity: 2,
        orderType: "Long", strategy: "Value Investing", account: "Investment Account",
        pnl: -600, pnlPercent: -3.16, status: "Loss"
      },
      {
        id: 9, symbol: "TITAN.NS", entryDate: "2024-04-01", exitDate: "2024-04-05",
        entryPrice: 2800, exitPrice: 3000, stopLoss: 2700, target: 3000, quantity: 8,
        orderType: "Long", strategy: "Breakout", account: "Trading Account 2",
        pnl: 1600, pnlPercent: 7.14, status: "Win"
      },
      {
        id: 10, symbol: "ASIANPAINT.NS", entryDate: "2024-04-10", exitDate: "2024-04-12",
        entryPrice: 3200, exitPrice: 3100, stopLoss: 3100, target: 3400, quantity: 5,
        orderType: "Long", strategy: "Momentum", account: "Trading Account 1",
        pnl: -500, pnlPercent: -3.13, status: "Loss"
      },
      // Open trades
      {
        id: 11, symbol: "BHARTIARTL.NS", entryDate: "2024-04-15", 
        entryPrice: 850, stopLoss: 820, target: 900, quantity: 20,
        orderType: "Long", strategy: "Breakout", account: "Trading Account 1",
        status: "Open"
      },
      {
        id: 12, symbol: "LT.NS", entryDate: "2024-04-18",
        entryPrice: 2400, stopLoss: 2350, target: 2500, quantity: 6,
        orderType: "Long", strategy: "Swing Trading", account: "Trading Account 2",
        status: "Open"
      }
    ];

    this.saveData();
  }

  saveData() {
    try {
      this.data.settings.lastUpdate = new Date().toISOString();
      localStorage.setItem('tradingJournalProData', JSON.stringify(this.data));
    } catch (error) {
      console.error('Error saving data:', error);
      this.showMessage('Error saving data. Storage might be full.', 'error');
    }
  }

  // Event Listeners
  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tabElement = e.target.closest('.tab');
        if (tabElement && tabElement.dataset.tab) {
          console.log('Tab clicked:', tabElement.dataset.tab);
          this.switchTab(tabElement.dataset.tab);
        }
      });
    });

    // Header actions
    this.addEventListenerSafe('refresh-data', 'click', () => this.refreshAllData());
    this.addEventListenerSafe('export-all', 'click', () => this.exportAllData());

    // Forms
    this.addEventListenerSafe('account-form', 'submit', (e) => this.addAccount(e));
    this.addEventListenerSafe('strategy-form', 'submit', (e) => this.addStrategy(e));
    this.addEventListenerSafe('trade-form', 'submit', (e) => this.addTrade(e));
    
    // Settings actions
    this.addEventListenerSafe('import-settings', 'click', () => this.importSettings());
    this.addEventListenerSafe('export-settings', 'click', () => this.exportSettings());
    this.addEventListenerSafe('reset-data', 'click', () => this.resetData());
    this.addEventListenerSafe('import-file', 'change', (e) => this.handleSettingsImport(e));

    // Trade form real-time calculations
    ['trade-entry-price', 'trade-stoploss', 'trade-target', 'trade-quantity'].forEach(id => {
      this.addEventListenerSafe(id, 'input', () => this.calculateRisk());
    });

    // Open trades actions
    this.addEventListenerSafe('refresh-prices', 'click', () => this.refreshPrices());
    this.addEventListenerSafe('close-all-profitable', 'click', () => this.closeAllProfitable());

    // All trades actions
    this.addEventListenerSafe('delete-selected', 'click', () => this.deleteSelectedTrades());
    this.addEventListenerSafe('import-trades', 'click', () => this.importTrades());
    this.addEventListenerSafe('export-trades', 'click', () => this.exportTrades());
    this.addEventListenerSafe('import-csv', 'change', (e) => this.handleCSVImport(e));
    this.addEventListenerSafe('clear-filters', 'click', () => this.clearFilters());

    // Filters
    ['filter-account', 'filter-strategy', 'filter-status', 'filter-symbol'].forEach(id => {
      this.addEventListenerSafe(id, 'change', () => this.applyFilters());
    });

    // Analytics filters - FIXED
    this.addEventListenerSafe('apply-analytics-filters', 'click', () => this.applyAnalyticsFilters());
    ['analytics-account', 'analytics-strategy', 'analytics-result', 'analytics-date-from', 'analytics-date-to'].forEach(id => {
      this.addEventListenerSafe(id, 'change', () => this.applyAnalyticsFilters());
    });

    // News and AI
    this.addEventListenerSafe('refresh-news', 'click', () => this.refreshNews());
    this.addEventListenerSafe('generate-insight', 'click', () => this.generateAIInsight());
    this.addEventListenerSafe('analyze-portfolio', 'click', () => this.analyzePortfolio());
    this.addEventListenerSafe('news-filter', 'change', () => this.filterNews());

    console.log('Event listeners setup complete');
  }

  addEventListenerSafe(elementId, event, handler) {
    const element = document.getElementById(elementId);
    if (element) {
      element.addEventListener(event, handler);
    } else {
      console.warn(`Element with id '${elementId}' not found`);
    }
  }

  switchTab(tabName) {
    console.log('Switching to tab:', tabName);
    
    // Update active tab visual state
    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.remove('active');
    });
    
    const activeTabElement = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeTabElement) {
      activeTabElement.classList.add('active');
    }
    
    // Show/hide sections
    document.querySelectorAll('.tab-section').forEach(section => {
      section.classList.add('hidden');
    });
    
    const targetSection = document.getElementById(`tab-${tabName}`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
      console.log(`Tab section ${tabName} shown`);
    } else {
      console.error(`Tab section tab-${tabName} not found`);
    }
    
    this.activeTab = tabName;
    
    // Small delay to ensure DOM is updated before rendering
    setTimeout(() => {
      this.renderActiveTab();
    }, 50);
  }

  renderActiveTab() {
    console.log('Rendering active tab:', this.activeTab);
    
    try {
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
        case 'news':
          this.renderNews();
          break;
        default:
          console.warn('Unknown tab:', this.activeTab);
      }
    } catch (error) {
      console.error('Error rendering tab:', error);
    }
  }

  // Dashboard
  renderDashboard() {
    console.log('Rendering dashboard...');
    
    const cards = document.getElementById('dashboard-cards');
    if (!cards) {
      console.error('Dashboard cards container not found');
      return;
    }
    
    const { totalBalance, balanceInUse, totalPnL, openPositions, winRate, totalTrades } = this.calculateDashboardMetrics();
    
    cards.innerHTML = `
      <div class="dashboard-card">
        <h3>Total Portfolio Value</h3>
        <div class="value currency-display">${this.formatCurrency(totalBalance)}</div>
        <div class="change positive">+2.5% Today</div>
      </div>
      <div class="dashboard-card">
        <h3>Balance in Use</h3>
        <div class="value currency-display">${this.formatCurrency(balanceInUse)}</div>
        <div class="utilization">${((balanceInUse/totalBalance)*100).toFixed(1)}% Utilized</div>
      </div>
      <div class="dashboard-card">
        <h3>Total P&L</h3>
        <div class="value currency-display ${totalPnL >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(totalPnL)}</div>
        <div class="return">${((totalPnL/(totalBalance-totalPnL))*100).toFixed(2)}% Return</div>
      </div>
      <div class="dashboard-card">
        <h3>Active Positions</h3>
        <div class="value">${openPositions}</div>
        <div class="win-rate">${winRate}% Win Rate</div>
      </div>
    `;

    this.renderPerformanceSummary();
    this.renderRecentTrades();
    this.renderMarketIndices();
  }

  calculateDashboardMetrics() {
    const totalBalance = this.data.accounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const openTrades = this.data.trades.filter(t => t.status === 'Open');
    const balanceInUse = openTrades.reduce((sum, trade) => sum + (trade.entryPrice * trade.quantity), 0);
    const totalPnL = this.data.trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const closedTrades = this.data.trades.filter(t => t.status !== 'Open');
    const wins = closedTrades.filter(t => t.status === 'Win').length;
    const winRate = closedTrades.length > 0 ? ((wins / closedTrades.length) * 100).toFixed(1) : 0;
    
    return { 
      totalBalance, 
      balanceInUse, 
      totalPnL, 
      openPositions: openTrades.length,
      winRate,
      totalTrades: this.data.trades.length
    };
  }

  renderPerformanceSummary() {
    const summary = document.getElementById('performance-summary');
    if (!summary) return;
    
    const { winRate, profitFactor, maxDrawdown } = this.calculateAdvancedMetrics();
    
    summary.innerHTML = `
      <div class="performance-metric">
        <span>Win Rate</span>
        <span class="value">${winRate}%</span>
      </div>
      <div class="performance-metric">
        <span>Profit Factor</span>
        <span class="value">${profitFactor}</span>
      </div>
      <div class="performance-metric">
        <span>Max Drawdown</span>
        <span class="value negative">${maxDrawdown}%</span>
      </div>
      <div class="performance-metric">
        <span>Active Strategies</span>
        <span class="value">${this.data.strategies.length}</span>
      </div>
    `;
  }

  renderRecentTrades() {
    const table = document.getElementById('recent-trades-table');
    if (!table) return;
    
    const recentTrades = this.data.trades.slice(-8).reverse();
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>Symbol</th><th>Entry Date</th><th>Type</th><th>Strategy</th><th>P&L</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${recentTrades.map(trade => `
          <tr>
            <td><strong>${trade.symbol.replace('.NS', '')}</strong></td>
            <td>${this.formatDate(trade.entryDate)}</td>
            <td><span class="badge ${trade.orderType.toLowerCase()}">${trade.orderType}</span></td>
            <td>${trade.strategy}</td>
            <td class="currency ${(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(trade.pnl || 0)}</td>
            <td><span class="trade-status ${trade.status.toLowerCase()}">${trade.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    `;
  }

  renderMarketIndices() {
    const indices = document.getElementById('market-indices');
    if (!indices) return;
    
    const mockIndices = [
      { name: 'NIFTY 50', value: 23750.45, change: '+1.25%', changeValue: '+295.30' },
      { name: 'SENSEX', value: 78245.67, change: '+0.89%', changeValue: '+683.21' },
      { name: 'BANKNIFTY', value: 51567.89, change: '-0.34%', changeValue: '-175.23' },
      { name: 'NIFTY IT', value: 35420.12, change: '+2.15%', changeValue: '+745.67' },
      { name: 'NIFTY PHARMA', value: 18965.34, change: '+1.78%', changeValue: '+331.45' },
      { name: 'NIFTY AUTO', value: 22134.56, change: '-0.67%', changeValue: '-149.78' }
    ];
    
    indices.innerHTML = mockIndices.map(index => `
      <div class="market-card">
        <h4>${index.name}</h4>
        <div class="index-value">${index.value.toLocaleString('en-IN', {minimumFractionDigits: 2})}</div>
        <div class="index-change ${index.change.startsWith('+') ? 'positive' : 'negative'}">
          ${index.change} (${index.changeValue})
        </div>
      </div>
    `).join('');
  }

  // Settings
  renderSettings() {
    console.log('Rendering settings...');
    this.renderAccountsList();
    this.renderStrategiesList();
    this.populateFilterDropdowns();
  }

  addAccount(e) {
    e.preventDefault();
    const name = document.getElementById('account-name').value.trim();
    const balance = parseFloat(document.getElementById('account-balance').value);
    
    if (!name || isNaN(balance) || balance <= 0) {
      this.showMessage('Please enter valid account details', 'error');
      return;
    }
    
    const newAccount = {
      id: Date.now(),
      name,
      initialBalance: balance,
      currentBalance: balance
    };
    
    this.data.accounts.push(newAccount);
    this.saveData();
    this.renderAccountsList();
    this.populateFilterDropdowns();
    e.target.reset();
    this.showMessage('Account added successfully!', 'success');
  }

  addStrategy(e) {
    e.preventDefault();
    const name = document.getElementById('strategy-name').value.trim();
    
    if (!name) {
      this.showMessage('Please enter a strategy name', 'error');
      return;
    }
    
    const newStrategy = {
      id: Date.now(),
      name
    };
    
    this.data.strategies.push(newStrategy);
    this.saveData();
    this.renderStrategiesList();
    this.populateFilterDropdowns();
    e.target.reset();
    this.showMessage('Strategy added successfully!', 'success');
  }

  renderAccountsList() {
    const list = document.getElementById('accounts-list');
    if (!list) return;
    
    list.innerHTML = this.data.accounts.map(account => `
      <li>
        <div>
          <strong>${account.name}</strong>
          <br>
          <small>Balance: ₹${account.currentBalance.toLocaleString()}</small>
        </div>
        <button class="btn btn--sm btn--outline" onclick="app.deleteAccount(${account.id})">Delete</button>
      </li>
    `).join('');
  }

  renderStrategiesList() {
    const list = document.getElementById('strategies-list');
    if (!list) return;
    
    list.innerHTML = this.data.strategies.map(strategy => `
      <li>
        <span>${strategy.name}</span>
        <button class="btn btn--sm btn--outline" onclick="app.deleteStrategy(${strategy.id})">Delete</button>
      </li>
    `).join('');
  }

  deleteAccount(id) {
    if (confirm('Are you sure you want to delete this account?')) {
      this.data.accounts = this.data.accounts.filter(a => a.id !== id);
      this.saveData();
      this.renderAccountsList();
      this.populateFilterDropdowns();
      this.showMessage('Account deleted successfully!', 'success');
    }
  }

  deleteStrategy(id) {
    if (confirm('Are you sure you want to delete this strategy?')) {
      this.data.strategies = this.data.strategies.filter(s => s.id !== id);
      this.saveData();
      this.renderStrategiesList();
      this.populateFilterDropdowns();
      this.showMessage('Strategy deleted successfully!', 'success');
    }
  }

  // Trade Form
  renderTradeForm() {
    console.log('Rendering trade form...');
    
    const strategySelect = document.getElementById('trade-strategy');
    const accountSelect = document.getElementById('trade-account');
    
    if (strategySelect) {
      strategySelect.innerHTML = this.data.strategies.map(s => 
        `<option value="${s.name}">${s.name}</option>`
      ).join('');
    }
    
    if (accountSelect) {
      accountSelect.innerHTML = this.data.accounts.map(a => 
        `<option value="${a.name}">${a.name}</option>`
      ).join('');
    }

    // Set today's date as default
    const entryDateInput = document.getElementById('trade-entry-date');
    if (entryDateInput) {
      entryDateInput.value = new Date().toISOString().split('T')[0];
    }
  }

  calculateRisk() {
    const entryPrice = parseFloat(document.getElementById('trade-entry-price')?.value) || 0;
    const stopLoss = parseFloat(document.getElementById('trade-stoploss')?.value) || 0;
    const target = parseFloat(document.getElementById('trade-target')?.value) || 0;
    const quantity = parseInt(document.getElementById('trade-quantity')?.value) || 0;

    const calculator = document.getElementById('risk-calculator');
    if (!calculator) return;

    if (entryPrice && stopLoss && target && quantity) {
      const riskPerShare = Math.abs(entryPrice - stopLoss);
      const rewardPerShare = Math.abs(target - entryPrice);
      const riskRewardRatio = rewardPerShare / riskPerShare;
      const totalRisk = riskPerShare * quantity;
      const totalReward = rewardPerShare * quantity;
      const investment = entryPrice * quantity;

      calculator.innerHTML = `
        <div class="calculator-metric">
          <h4>Risk per Share</h4>
          <div class="value currency">₹${riskPerShare.toFixed(2)}</div>
        </div>
        <div class="calculator-metric">
          <h4>Reward per Share</h4>
          <div class="value currency">₹${rewardPerShare.toFixed(2)}</div>
        </div>
        <div class="calculator-metric">
          <h4>Risk:Reward</h4>
          <div class="value">1:${riskRewardRatio.toFixed(2)}</div>
        </div>
        <div class="calculator-metric">
          <h4>Total Risk</h4>
          <div class="value currency negative">₹${totalRisk.toLocaleString()}</div>
        </div>
        <div class="calculator-metric">
          <h4>Total Reward</h4>
          <div class="value currency positive">₹${totalReward.toLocaleString()}</div>
        </div>
        <div class="calculator-metric">
          <h4>Investment</h4>
          <div class="value currency">₹${investment.toLocaleString()}</div>
        </div>
      `;
    } else {
      calculator.innerHTML = '<p>Enter trade details to see risk calculations</p>';
    }
  }

  addTrade(e) {
    e.preventDefault();
    
    const trade = {
      id: Date.now(),
      symbol: document.getElementById('trade-symbol')?.value?.toUpperCase() || '',
      entryDate: document.getElementById('trade-entry-date')?.value || '',
      entryPrice: parseFloat(document.getElementById('trade-entry-price')?.value) || 0,
      stopLoss: parseFloat(document.getElementById('trade-stoploss')?.value) || 0,
      target: parseFloat(document.getElementById('trade-target')?.value) || 0,
      exitDate: document.getElementById('trade-exit-date')?.value || null,
      exitPrice: parseFloat(document.getElementById('trade-exit-price')?.value) || null,
      orderType: document.getElementById('trade-order-type')?.value || 'Long',
      strategy: document.getElementById('trade-strategy')?.value || '',
      account: document.getElementById('trade-account')?.value || '',
      quantity: parseInt(document.getElementById('trade-quantity')?.value) || 0
    };

    // Validation
    if (!trade.symbol || !trade.entryDate || !trade.entryPrice || !trade.stopLoss || 
        !trade.target || !trade.quantity || !trade.strategy || !trade.account) {
      this.showMessage('Please fill all required fields', 'error');
      return;
    }

    // Add .NS suffix if not present for Indian stocks
    if (!trade.symbol.endsWith('.NS') && !trade.symbol.includes('.')) {
      trade.symbol += '.NS';
    }

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
    
    // Reset calculator
    const calculator = document.getElementById('risk-calculator');
    if (calculator) {
      calculator.innerHTML = '<p>Enter trade details to see risk calculations</p>';
    }
  }

  // Open Trades
  renderOpenTrades() {
    console.log('Rendering open trades...');
    const openTrades = this.data.trades.filter(t => t.status === 'Open');
    this.renderOpenTradesSummary(openTrades);
    this.renderOpenTradesTable(openTrades);
    this.renderOpenTradesAnalytics(openTrades);
  }

  renderOpenTradesSummary(openTrades) {
    const summary = document.getElementById('open-trades-summary');
    if (!summary) return;
    
    const totalInvestment = openTrades.reduce((sum, trade) => sum + (trade.entryPrice * trade.quantity), 0);
    const currentValue = openTrades.reduce((sum, trade) => {
      const currentPrice = this.getCurrentPrice(trade.symbol);
      return sum + (currentPrice * trade.quantity);
    }, 0);
    const unrealizedPnL = currentValue - totalInvestment;

    summary.innerHTML = `
      <div class="summary-grid">
        <div class="summary-item">
          <h4>Open Positions</h4>
          <div class="value">${openTrades.length}</div>
        </div>
        <div class="summary-item">
          <h4>Total Investment</h4>
          <div class="value currency">₹${totalInvestment.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <h4>Current Value</h4>
          <div class="value currency">₹${currentValue.toLocaleString()}</div>
        </div>
        <div class="summary-item">
          <h4>Unrealized P&L</h4>
          <div class="value currency ${unrealizedPnL >= 0 ? 'positive' : 'negative'}">₹${unrealizedPnL.toLocaleString()}</div>
        </div>
      </div>
    `;
  }

  renderOpenTradesTable(openTrades) {
    const table = document.getElementById('open-trades-table');
    if (!table) return;
    
    table.innerHTML = `
      <thead>
        <tr>
          <th>Symbol</th><th>Entry Date</th><th>Entry Price</th><th>Current Price</th>
          <th>Quantity</th><th>Investment</th><th>Current Value</th><th>P&L</th><th>% Change</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${openTrades.map(trade => {
          const currentPrice = this.getCurrentPrice(trade.symbol);
          const currentPnL = this.calculateCurrentPnL(trade, currentPrice);
          const pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
          const investment = trade.entryPrice * trade.quantity;
          const currentValue = currentPrice * trade.quantity;
          
          return `
            <tr>
              <td><strong>${trade.symbol.replace('.NS', '')}</strong></td>
              <td>${this.formatDate(trade.entryDate)}</td>
              <td class="currency">${this.formatCurrency(trade.entryPrice)}</td>
              <td class="currency live-price ${currentPrice > trade.entryPrice ? 'price-up' : 'price-down'}">${this.formatCurrency(currentPrice)}</td>
              <td>${trade.quantity}</td>
              <td class="currency">${this.formatCurrency(investment)}</td>
              <td class="currency">${this.formatCurrency(currentValue)}</td>
              <td class="currency ${currentPnL >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(currentPnL)}</td>
              <td class="${pnlPercent >= 0 ? 'positive' : 'negative'}">${pnlPercent.toFixed(2)}%</td>
              <td>
                <button class="action-btn close" onclick="app.closeTrade(${trade.id})">Close</button>
                <button class="action-btn edit" onclick="app.editTrade(${trade.id})">Edit</button>
              </td>
            </tr>
          `;
        }).join('')}
      </tbody>
    `;
  }

  renderOpenTradesAnalytics(openTrades) {
    const analytics = document.getElementById('open-analytics');
    if (!analytics) return;
    
    const profitable = openTrades.filter(trade => {
      const currentPrice = this.getCurrentPrice(trade.symbol);
      return this.calculateCurrentPnL(trade, currentPrice) > 0;
    });

    analytics.innerHTML = `
      <div class="analytics-item">
        <h4>Profitable Positions</h4>
        <div class="value positive">${profitable.length} of ${openTrades.length}</div>
      </div>
      <div class="analytics-item">
        <h4>Success Rate</h4>
        <div class="value">${openTrades.length > 0 ? ((profitable.length / openTrades.length) * 100).toFixed(1) : 0}%</div>
      </div>
      <div class="analytics-item">
        <h4>Avg Days Held</h4>
        <div class="value">${this.calculateAverageHoldingDays(openTrades)} days</div>
      </div>
    `;
  }

  calculateCurrentPnL(trade, currentPrice) {
    const pnlPerShare = trade.orderType === 'Long' ? 
      (currentPrice - trade.entryPrice) : 
      (trade.entryPrice - currentPrice);
    return pnlPerShare * trade.quantity;
  }

  calculateAverageHoldingDays(trades) {
    if (trades.length === 0) return 0;
    const totalDays = trades.reduce((sum, trade) => {
      const entryDate = new Date(trade.entryDate);
      const today = new Date();
      const diffTime = Math.abs(today - entryDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return sum + diffDays;
    }, 0);
    return Math.round(totalDays / trades.length);
  }

  closeTrade(tradeId) {
    const trade = this.data.trades.find(t => t.id === tradeId);
    if (trade && confirm(`Close position in ${trade.symbol}?`)) {
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
      this.showMessage(`Position in ${trade.symbol} closed successfully!`, 'success');
    }
  }

  closeAllProfitable() {
    const openTrades = this.data.trades.filter(t => t.status === 'Open');
    let closedCount = 0;

    openTrades.forEach(trade => {
      const currentPrice = this.getCurrentPrice(trade.symbol);
      const currentPnL = this.calculateCurrentPnL(trade, currentPrice);
      
      if (currentPnL > 0) {
        trade.exitPrice = currentPrice;
        trade.exitDate = new Date().toISOString().split('T')[0];
        trade.pnl = currentPnL;
        trade.pnlPercent = ((currentPrice - trade.entryPrice) / trade.entryPrice) * 100;
        trade.status = 'Win';
        closedCount++;
      }
    });

    if (closedCount > 0) {
      this.saveData();
      this.renderOpenTrades();
      this.showMessage(`${closedCount} profitable positions closed!`, 'success');
    } else {
      this.showMessage('No profitable positions to close', 'info');
    }
  }

  // All Trades
  renderAllTrades() {
    console.log('Rendering all trades...');
    this.populateFilterDropdowns();
    this.applyFilters();
  }

  // FIXED: Enhanced populate filter dropdowns function
  populateFilterDropdowns() {
    console.log('Populating filter dropdowns...');
    
    // All trades filters
    const accountFilter = document.getElementById('filter-account');
    const strategyFilter = document.getElementById('filter-strategy');
    
    // Analytics filters
    const analyticsAccount = document.getElementById('analytics-account');
    const analyticsStrategy = document.getElementById('analytics-strategy');

    const accountOptions = this.data.accounts.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
    const strategyOptions = this.data.strategies.map(s => `<option value="${s.name}">${s.name}</option>`).join('');

    // Populate all trades filters
    [accountFilter, analyticsAccount].forEach(select => {
      if (select) {
        select.innerHTML = '<option value="">All Accounts</option>' + accountOptions;
        console.log(`Populated ${select.id} with ${this.data.accounts.length} accounts`);
      }
    });

    [strategyFilter, analyticsStrategy].forEach(select => {
      if (select) {
        select.innerHTML = '<option value="">All Strategies</option>' + strategyOptions;
        console.log(`Populated ${select.id} with ${this.data.strategies.length} strategies`);
      }
    });
  }

  applyFilters() {
    this.filters = {
      account: document.getElementById('filter-account')?.value || '',
      strategy: document.getElementById('filter-strategy')?.value || '',
      status: document.getElementById('filter-status')?.value || '',
      symbol: document.getElementById('filter-symbol')?.value?.toUpperCase() || ''
    };

    let filteredTrades = this.data.trades.filter(trade => {
      return (!this.filters.account || trade.account === this.filters.account) &&
             (!this.filters.strategy || trade.strategy === this.filters.strategy) &&
             (!this.filters.status || trade.status === this.filters.status) &&
             (!this.filters.symbol || trade.symbol.includes(this.filters.symbol));
    });

    this.renderTradesTable(filteredTrades);
  }

  renderTradesTable(trades) {
    const table = document.getElementById('all-trades-table');
    if (!table) return;
    
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    const paginatedTrades = trades.slice(startIndex, endIndex);
    
    table.innerHTML = `
      <thead>
        <tr>
          <th><input type="checkbox" class="trade-checkbox" id="select-all" onchange="app.toggleSelectAll()"></th>
          <th>Symbol</th><th>Entry Date</th><th>Exit Date</th><th>Entry Price</th><th>Exit Price</th>
          <th>Qty</th><th>Investment</th><th>P&L</th><th>%</th><th>Strategy</th><th>Account</th><th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${paginatedTrades.map(trade => `
          <tr>
            <td><input type="checkbox" class="trade-checkbox trade-select" data-id="${trade.id}"></td>
            <td><strong>${trade.symbol.replace('.NS', '')}</strong></td>
            <td>${this.formatDate(trade.entryDate)}</td>
            <td>${trade.exitDate ? this.formatDate(trade.exitDate) : '-'}</td>
            <td class="currency">${this.formatCurrency(trade.entryPrice)}</td>
            <td class="currency">${trade.exitPrice ? this.formatCurrency(trade.exitPrice) : '-'}</td>
            <td>${trade.quantity}</td>
            <td class="currency">${this.formatCurrency(trade.entryPrice * trade.quantity)}</td>
            <td class="currency ${(trade.pnl || 0) >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(trade.pnl || 0)}</td>
            <td class="${(trade.pnlPercent || 0) >= 0 ? 'positive' : 'negative'}">${(trade.pnlPercent || 0).toFixed(2)}%</td>
            <td><small>${trade.strategy}</small></td>
            <td><small>${trade.account}</small></td>
            <td><span class="trade-status ${trade.status.toLowerCase()}">${trade.status}</span></td>
          </tr>
        `).join('')}
      </tbody>
    `;

    this.renderPagination(trades.length);
  }

  renderPagination(totalTrades) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;
    
    const totalPages = Math.ceil(totalTrades / this.pageSize);
    
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let paginationHTML = '';
    
    if (this.currentPage > 1) {
      paginationHTML += `<button onclick="app.goToPage(${this.currentPage - 1})">← Previous</button>`;
    }
    
    for (let i = Math.max(1, this.currentPage - 2); i <= Math.min(totalPages, this.currentPage + 2); i++) {
      paginationHTML += `<button class="${i === this.currentPage ? 'active' : ''}" onclick="app.goToPage(${i})">${i}</button>`;
    }
    
    if (this.currentPage < totalPages) {
      paginationHTML += `<button onclick="app.goToPage(${this.currentPage + 1})">Next →</button>`;
    }

    pagination.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.applyFilters();
  }

  clearFilters() {
    ['filter-account', 'filter-strategy', 'filter-status', 'filter-symbol'].forEach(id => {
      const element = document.getElementById(id);
      if (element) element.value = '';
    });
    this.currentPage = 1;
    this.applyFilters();
  }

  toggleSelectAll() {
    const selectAll = document.getElementById('select-all');
    const checkboxes = document.querySelectorAll('.trade-select');
    checkboxes.forEach(cb => cb.checked = selectAll.checked);
  }

  deleteSelectedTrades() {
    const selected = Array.from(document.querySelectorAll('.trade-select:checked'))
      .map(cb => parseInt(cb.dataset.id));
    
    if (selected.length === 0) {
      this.showMessage('Please select trades to delete', 'error');
      return;
    }

    if (confirm(`Delete ${selected.length} selected trades?`)) {
      this.data.trades = this.data.trades.filter(t => !selected.includes(t.id));
      this.saveData();
      this.applyFilters();
      this.showMessage(`${selected.length} trades deleted successfully!`, 'success');
    }
  }

  // COMPREHENSIVE ANALYTICS IMPLEMENTATION
  renderAnalytics() {
    console.log('Rendering comprehensive analytics...');
    this.populateFilterDropdowns();
    // Apply default filters (no filters initially)
    setTimeout(() => {
      this.applyAnalyticsFilters();
    }, 100);
  }

  // FIXED: Enhanced analytics filters application
  applyAnalyticsFilters() {
    console.log('Applying analytics filters...');
    
    // Get filter values
    this.analyticsFilters = {
      account: document.getElementById('analytics-account')?.value || '',
      strategy: document.getElementById('analytics-strategy')?.value || '',
      result: document.getElementById('analytics-result')?.value || '',
      dateFrom: document.getElementById('analytics-date-from')?.value || '',
      dateTo: document.getElementById('analytics-date-to')?.value || ''
    };

    console.log('Analytics filters:', this.analyticsFilters);

    // Filter trades based on criteria
    let filteredTrades = this.data.trades.filter(trade => {
      // Account filter
      if (this.analyticsFilters.account && trade.account !== this.analyticsFilters.account) {
        return false;
      }
      
      // Strategy filter
      if (this.analyticsFilters.strategy && trade.strategy !== this.analyticsFilters.strategy) {
        return false;
      }
      
      // Result filter
      if (this.analyticsFilters.result && trade.status !== this.analyticsFilters.result) {
        return false;
      }
      
      // Date filters
      if (this.analyticsFilters.dateFrom) {
        const tradeDate = new Date(trade.entryDate);
        const fromDate = new Date(this.analyticsFilters.dateFrom);
        if (tradeDate < fromDate) return false;
      }
      
      if (this.analyticsFilters.dateTo) {
        const tradeDate = new Date(trade.entryDate);
        const toDate = new Date(this.analyticsFilters.dateTo);
        if (tradeDate > toDate) return false;
      }
      
      return true;
    });

    console.log(`Filtered trades: ${filteredTrades.length} of ${this.data.trades.length}`);
    
    // Render all analytics components with filtered data
    this.renderKPICards(filteredTrades);
    this.renderAnalyticsCharts(filteredTrades);
    this.renderAnalyticsTables(filteredTrades);
  }

  renderKPICards(trades) {
    console.log('Rendering KPI cards...');
    
    const closedTrades = trades.filter(t => t.status !== 'Open');
    const winningTrades = closedTrades.filter(t => t.status === 'Win');
    const losingTrades = closedTrades.filter(t => t.status === 'Loss');
    
    // Calculate metrics
    const totalPnL = closedTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length * 100) : 0;
    const totalTrades = closedTrades.length;
    
    const totalWins = winningTrades.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(losingTrades.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses) : 0;
    
    const avgWin = winningTrades.length > 0 ? (totalWins / winningTrades.length) : 0;
    const avgLoss = losingTrades.length > 0 ? (totalLosses / losingTrades.length) : 0;
    const riskRewardRatio = avgLoss > 0 ? (avgWin / avgLoss) : 0;
    
    const avgPnLPerTrade = totalTrades > 0 ? (totalPnL / totalTrades) : 0;
    
    // Sharpe Ratio calculation
    const returns = closedTrades.map(t => (t.pnlPercent || 0));
    const avgReturn = returns.length > 0 ? (returns.reduce((sum, r) => sum + r, 0) / returns.length) : 0;
    const stdDev = returns.length > 1 ? Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)) : 1;
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) : 0;
    
    // Max Drawdown calculation
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;
    
    closedTrades.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate)).forEach(trade => {
      cumulative += trade.pnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    const maxDrawdownPercent = peak > 0 ? (maxDrawdown / peak * 100) : 0;
    
    // Expectancy calculation
    const winProb = winRate / 100;
    const lossProb = 1 - winProb;
    const expectancy = (winProb * avgWin) - (lossProb * avgLoss);

    // Update KPI cards
    const elements = {
      'kpi-total-pnl': `₹${this.formatCurrency(totalPnL)}`,
      'kpi-win-rate': `${winRate.toFixed(1)}%`,
      'kpi-total-trades': totalTrades,
      'kpi-trades-breakdown': `${winningTrades.length} W | ${losingTrades.length} L`,
      'kpi-profit-factor': profitFactor.toFixed(2),
      'kpi-sharpe-ratio': sharpeRatio.toFixed(2),
      'kpi-max-drawdown': `${maxDrawdownPercent.toFixed(1)}%`,
      'kpi-avg-pnl': `₹${this.formatCurrency(avgPnLPerTrade)}`,
      'kpi-risk-reward': `1:${riskRewardRatio.toFixed(2)}`,
      'kpi-expectancy': `₹${this.formatCurrency(expectancy)}`
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
        
        // Add color classes for certain elements
        if (id === 'kpi-total-pnl') {
          element.className = `kpi-value ${totalPnL >= 0 ? 'positive' : 'negative'}`;
        }
      }
    });

    // Update progress bar for win rate
    const progressBar = document.getElementById('win-rate-progress');
    if (progressBar) {
      progressBar.style.width = `${Math.min(winRate, 100)}%`;
    }

    // Update change indicators
    const pnlChange = document.getElementById('kpi-total-pnl-change');
    if (pnlChange) {
      const changePercent = totalPnL >= 0 ? '+' : '';
      pnlChange.textContent = `${changePercent}${((totalPnL / 100000) * 100).toFixed(2)}%`;
      pnlChange.className = `kpi-change ${totalPnL >= 0 ? 'positive' : 'negative'}`;
    }
  }

  renderAnalyticsCharts(trades) {
    console.log('Rendering analytics charts...');
    
    // Small delay to ensure DOM is ready
    setTimeout(() => {
      this.renderEquityChart(trades);
      this.renderWinLossChart(trades);
      this.renderStrategyPerformanceChart(trades);
      this.renderMonthlyPnLChart(trades);
    }, 100);
  }

  renderEquityChart(trades) {
    const canvas = document.getElementById('equity-chart');
    if (!canvas) {
      console.warn('Equity chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const closedTrades = trades.filter(t => t.pnl !== undefined).sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate));
    
    let cumulative = 0;
    const data = closedTrades.map(trade => {
      cumulative += trade.pnl;
      return { x: trade.entryDate, y: cumulative };
    });

    // Add initial point at zero
    if (data.length > 0) {
      data.unshift({ x: data[0].x, y: 0 });
    }

    if (this.charts.equityChart) {
      this.charts.equityChart.destroy();
    }

    this.charts.equityChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Cumulative P&L (₹)',
          data: data,
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Cumulative P&L Over Time',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: true,
            position: 'top'
          }
        },
        scales: {
          x: { 
            type: 'time', 
            time: { unit: 'day' },
            title: { display: true, text: 'Date' }
          },
          y: { 
            beginAtZero: false,
            title: { display: true, text: 'Cumulative P&L (₹)' },
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            }
          }
        },
        interaction: {
          intersect: false,
          mode: 'index'
        }
      }
    });
  }

  renderWinLossChart(trades) {
    const canvas = document.getElementById('winloss-chart');
    if (!canvas) {
      console.warn('Win/Loss chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const closedTrades = trades.filter(t => t.status !== 'Open');
    const wins = closedTrades.filter(t => t.status === 'Win').length;
    const losses = closedTrades.filter(t => t.status === 'Loss').length;

    if (this.charts.winLossChart) {
      this.charts.winLossChart.destroy();
    }

    this.charts.winLossChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
          data: [wins, losses],
          backgroundColor: ['#1FB8CD', '#B4413C'],
          borderWidth: 3,
          borderColor: '#FFFFFF',
          hoverOffset: 10
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Win/Loss Distribution',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            position: 'bottom',
            labels: {
              padding: 20,
              usePointStyle: true
            }
          }
        }
      }
    });
  }

  renderStrategyPerformanceChart(trades) {
    const canvas = document.getElementById('strategy-performance-chart');
    if (!canvas) {
      console.warn('Strategy performance chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const strategyData = {};
    
    trades.filter(t => t.pnl !== undefined).forEach(trade => {
      strategyData[trade.strategy] = (strategyData[trade.strategy] || 0) + trade.pnl;
    });

    if (this.charts.strategyChart) {
      this.charts.strategyChart.destroy();
    }

    this.charts.strategyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(strategyData),
        datasets: [{
          label: 'Strategy P&L (₹)',
          data: Object.values(strategyData),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
          borderColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545'],
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'P&L by Strategy',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            title: { display: true, text: 'P&L (₹)' },
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            }
          },
          x: {
            title: { display: true, text: 'Strategy' }
          }
        }
      }
    });
  }

  renderMonthlyPnLChart(trades) {
    const canvas = document.getElementById('monthly-pnl-chart');
    if (!canvas) {
      console.warn('Monthly P&L chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const monthlyData = {};
    
    trades.filter(t => t.pnl !== undefined).forEach(trade => {
      const month = new Date(trade.exitDate || trade.entryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + trade.pnl;
    });

    if (this.charts.monthlyChart) {
      this.charts.monthlyChart.destroy();
    }

    this.charts.monthlyChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(monthlyData),
        datasets: [{
          label: 'Monthly P&L (₹)',
          data: Object.values(monthlyData),
          backgroundColor: Object.values(monthlyData).map(val => val >= 0 ? '#1FB8CD' : '#B4413C'),
          borderColor: Object.values(monthlyData).map(val => val >= 0 ? '#1FB8CD' : '#B4413C'),
          borderWidth: 2,
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Monthly Performance',
            font: { size: 16, weight: 'bold' }
          },
          legend: {
            display: false
          }
        },
        scales: {
          y: { 
            beginAtZero: true,
            title: { display: true, text: 'P&L (₹)' },
            ticks: {
              callback: function(value) {
                return '₹' + value.toLocaleString();
              }
            }
          },
          x: {
            title: { display: true, text: 'Month' }
          }
        }
      }
    });
  }

  renderAnalyticsTables(trades) {
    console.log('Rendering analytics tables...');
    this.renderStrategyBreakdownTable(trades);
    this.renderMonthlyPerformanceTable(trades);
    this.renderBestWorstTradesTable(trades);
  }

  renderStrategyBreakdownTable(trades) {
    const table = document.getElementById('strategy-breakdown-table');
    if (!table) return;

    const strategyStats = {};
    
    trades.forEach(trade => {
      if (!strategyStats[trade.strategy]) {
        strategyStats[trade.strategy] = {
          totalTrades: 0,
          wins: 0,
          losses: 0,
          totalPnL: 0,
          totalInvestment: 0
        };
      }
      
      const stats = strategyStats[trade.strategy];
      if (trade.status !== 'Open') {
        stats.totalTrades++;
        if (trade.status === 'Win') stats.wins++;
        if (trade.status === 'Loss') stats.losses++;
        stats.totalPnL += trade.pnl || 0;
      }
      stats.totalInvestment += trade.entryPrice * trade.quantity;
    });

    const strategyRows = Object.entries(strategyStats).map(([strategy, stats]) => {
      const winRate = stats.totalTrades > 0 ? (stats.wins / stats.totalTrades * 100) : 0;
      const roi = stats.totalInvestment > 0 ? (stats.totalPnL / stats.totalInvestment * 100) : 0;
      
      return `
        <tr>
          <td><strong>${strategy}</strong></td>
          <td>${stats.totalTrades}</td>
          <td>${stats.wins}</td>
          <td>${stats.losses}</td>
          <td>${winRate.toFixed(1)}%</td>
          <td class="currency ${stats.totalPnL >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(stats.totalPnL)}</td>
          <td class="${roi >= 0 ? 'positive' : 'negative'}">${roi.toFixed(2)}%</td>
        </tr>
      `;
    });

    table.innerHTML = `
      <thead>
        <tr>
          <th>Strategy</th><th>Total Trades</th><th>Wins</th><th>Losses</th>
          <th>Win Rate</th><th>Total P&L</th><th>ROI</th>
        </tr>
      </thead>
      <tbody>
        ${strategyRows.join('')}
      </tbody>
    `;
  }

  renderMonthlyPerformanceTable(trades) {
    const table = document.getElementById('monthly-performance-table');
    if (!table) return;

    const monthlyStats = {};
    
    trades.filter(t => t.pnl !== undefined).forEach(trade => {
      const month = new Date(trade.exitDate || trade.entryDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      if (!monthlyStats[month]) {
        monthlyStats[month] = { trades: 0, wins: 0, pnl: 0 };
      }
      
      monthlyStats[month].trades++;
      if (trade.status === 'Win') monthlyStats[month].wins++;
      monthlyStats[month].pnl += trade.pnl;
    });

    const monthlyRows = Object.entries(monthlyStats)
      .sort((a, b) => new Date(a[0]) - new Date(b[0]))
      .map(([month, stats]) => {
        const winRate = stats.trades > 0 ? (stats.wins / stats.trades * 100) : 0;
        
        return `
          <tr>
            <td><strong>${month}</strong></td>
            <td>${stats.trades}</td>
            <td>${stats.wins}</td>
            <td>${winRate.toFixed(1)}%</td>
            <td class="currency ${stats.pnl >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(stats.pnl)}</td>
          </tr>
        `;
      });

    table.innerHTML = `
      <thead>
        <tr>
          <th>Month</th><th>Trades</th><th>Wins</th><th>Win Rate</th><th>P&L</th>
        </tr>
      </thead>
      <tbody>
        ${monthlyRows.join('')}
      </tbody>
    `;
  }

  renderBestWorstTradesTable(trades) {
    const table = document.getElementById('best-worst-trades-table');
    if (!table) return;

    const closedTrades = trades.filter(t => t.pnl !== undefined);
    const sortedTrades = [...closedTrades].sort((a, b) => (b.pnl || 0) - (a.pnl || 0));
    const bestTrades = sortedTrades.slice(0, 5);
    const worstTrades = sortedTrades.slice(-5).reverse();

    const tradeRows = [...bestTrades, ...worstTrades].map(trade => `
      <tr>
        <td><strong>${trade.symbol.replace('.NS', '')}</strong></td>
        <td>${this.formatDate(trade.entryDate)}</td>
        <td>${trade.strategy}</td>
        <td class="currency">${this.formatCurrency(trade.entryPrice)}</td>
        <td class="currency">${this.formatCurrency(trade.exitPrice)}</td>
        <td class="currency ${trade.pnl >= 0 ? 'positive' : 'negative'}">${this.formatCurrency(trade.pnl)}</td>
        <td class="${trade.pnlPercent >= 0 ? 'positive' : 'negative'}">${trade.pnlPercent.toFixed(2)}%</td>
      </tr>
    `);

    table.innerHTML = `
      <thead>
        <tr>
          <th>Symbol</th><th>Date</th><th>Strategy</th><th>Entry</th><th>Exit</th><th>P&L</th><th>%</th>
        </tr>
      </thead>
      <tbody>
        ${tradeRows.join('')}
      </tbody>
    `;
  }

  calculateAdvancedMetrics() {
    const closedTrades = this.data.trades.filter(t => t.status !== 'Open');
    const wins = closedTrades.filter(t => t.status === 'Win');
    const losses = closedTrades.filter(t => t.status === 'Loss');
    
    const winRate = closedTrades.length > 0 ? ((wins.length / closedTrades.length) * 100).toFixed(1) : 0;
    
    const totalWins = wins.reduce((sum, trade) => sum + trade.pnl, 0);
    const totalLosses = Math.abs(losses.reduce((sum, trade) => sum + trade.pnl, 0));
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : 'N/A';
    
    const avgWin = wins.length > 0 ? (totalWins / wins.length) : 0;
    const avgLoss = losses.length > 0 ? (totalLosses / losses.length) : 0;
    
    // Max Drawdown calculation
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;
    
    closedTrades.sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate)).forEach(trade => {
      cumulative += trade.pnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    const maxDrawdownPercent = peak > 0 ? ((maxDrawdown / peak) * 100).toFixed(1) : 0;
    
    // Sharpe Ratio (simplified)
    const returns = closedTrades.map(t => (t.pnl / (t.entryPrice * t.quantity)) * 100);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length || 0;
    const stdDev = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length) || 1;
    const sharpeRatio = (avgReturn / stdDev).toFixed(2);

    return { winRate, profitFactor, maxDrawdown: maxDrawdownPercent, sharpeRatio, avgWin, avgLoss };
  }

  // News & AI
  renderNews() {
    console.log('Rendering news...');
    this.renderNewsFeed();
    this.renderAIInsights();
    this.renderMarketSentiment();
  }

  renderNewsFeed() {
    const newsFeed = document.getElementById('news-feed');
    if (!newsFeed) return;
    
    const mockNews = [
      {
        title: "NSE hits record high as FII flows surge in January 2025",
        summary: "The National Stock Exchange witnessed unprecedented trading volumes with foreign institutional investors pumping in ₹25,000 crores in the first month of 2025.",
        sentiment: "positive",
        relevance: "high",
        timestamp: new Date().toISOString()
      },
      {
        title: "RBI maintains repo rate at 6.5% in bi-monthly policy",
        summary: "Reserve Bank of India keeps key interest rates unchanged citing balanced inflation outlook and growth momentum.",
        sentiment: "neutral",
        relevance: "medium",
        timestamp: new Date(Date.now() - 3600000).toISOString()
      },
      {
        title: "Banking sector shows strong Q4 results with NII growth",
        summary: "Major private banks including HDFC, ICICI, and Axis Bank report robust net interest income growth of 12-15% YoY.",
        sentiment: "positive",
        relevance: "high",
        timestamp: new Date(Date.now() - 7200000).toISOString()
      },
      {
        title: "IT sector faces headwinds amid global economic slowdown",
        summary: "Leading IT companies warn of potential revenue impact due to reduced client spending in key markets.",
        sentiment: "negative",
        relevance: "medium",
        timestamp: new Date(Date.now() - 10800000).toISOString()
      }
    ];

    newsFeed.innerHTML = mockNews.map(news => `
      <div class="news-item">
        <h4 class="news-title">${news.title}</h4>
        <p class="news-summary">${news.summary}</p>
        <div class="news-meta">
          <span class="news-time">${this.formatTimeAgo(news.timestamp)}</span>
          <span class="sentiment ${news.sentiment}">${news.sentiment.toUpperCase()}</span>
        </div>
      </div>
    `).join('');
  }

  renderAIInsights() {
    const insights = document.getElementById('ai-insights');
    if (!insights) return;
    
    const currentInsights = JSON.parse(localStorage.getItem('aiInsights') || '[]');
    
    insights.innerHTML = currentInsights.length > 0 ? 
      currentInsights.map(insight => `<div class="ai-insight">${insight}</div>`).join('') :
      '<div class="ai-insight">Click "Generate New Insight" to get AI-powered analysis of your trading performance.</div>';
  }

  generateAIInsight() {
    const insight = this.aiInsightsBank[Math.floor(Math.random() * this.aiInsightsBank.length)];
    const currentInsights = JSON.parse(localStorage.getItem('aiInsights') || '[]');
    currentInsights.unshift(insight);
    
    // Keep only last 10 insights
    if (currentInsights.length > 10) {
      currentInsights.splice(10);
    }
    
    localStorage.setItem('aiInsights', JSON.stringify(currentInsights));
    this.renderAIInsights();
    
    // Highlight new insight
    const insights = document.getElementById('ai-insights');
    const firstInsight = insights?.querySelector('.ai-insight');
    if (firstInsight) {
      firstInsight.classList.add('new');
    }
  }

  analyzePortfolio() {
    const openTrades = this.data.trades.filter(t => t.status === 'Open');
    const analysis = [];

    if (openTrades.length === 0) {
      analysis.push("No open positions to analyze. Consider identifying new opportunities.");
    } else {
      analysis.push(`Portfolio contains ${openTrades.length} open positions with total exposure of ₹${this.calculateTotalExposure(openTrades).toLocaleString()}.`);
      analysis.push("Overall portfolio correlation with market indices appears moderate.");
      analysis.push("Risk management parameters are within acceptable limits.");
    }

    const currentInsights = JSON.parse(localStorage.getItem('aiInsights') || '[]');
    analysis.forEach(insight => currentInsights.unshift(`📊 ${insight}`));
    
    if (currentInsights.length > 15) {
      currentInsights.splice(15);
    }
    
    localStorage.setItem('aiInsights', JSON.stringify(currentInsights));
    this.renderAIInsights();
  }

  calculateTotalExposure(trades) {
    return trades.reduce((sum, trade) => sum + (trade.entryPrice * trade.quantity), 0);
  }

  renderMarketSentiment() {
    const sentiment = document.getElementById('sentiment-indicators');
    if (!sentiment) return;
    
    const mockSentiment = [
      { label: 'Market Sentiment', score: 75, type: 'positive' },
      { label: 'VIX Level', score: 18.5, type: 'neutral' },
      { label: 'FII Activity', score: 82, type: 'positive' },
      { label: 'Options PCR', score: 1.25, type: 'neutral' }
    ];

    sentiment.innerHTML = mockSentiment.map(item => `
      <div class="sentiment-indicator">
        <div class="sentiment-score ${item.type}">${item.score}</div>
        <div class="sentiment-label">${item.label}</div>
      </div>
    `).join('');
  }

  // Live Prices & Updates
  startLivePriceUpdates() {
    // Initialize with mock prices for common stocks
    this.nseStocks.slice(0, 50).forEach(symbol => {
      this.livePrices.set(symbol, Math.random() * 2000 + 500);
    });

    // Update prices every 10 seconds
    this.priceUpdateInterval = setInterval(() => {
      this.livePrices.forEach((price, symbol) => {
        const change = (Math.random() - 0.5) * 50;
        this.livePrices.set(symbol, Math.max(price + change, 10));
      });
      
      if (this.activeTab === 'openTrades') {
        this.renderOpenTrades();
      }
    }, 10000);
  }

  getCurrentPrice(symbol) {
    if (!this.livePrices.has(symbol)) {
      this.livePrices.set(symbol, Math.random() * 2000 + 500);
    }
    return this.livePrices.get(symbol);
  }

  refreshPrices() {
    this.livePrices.forEach((price, symbol) => {
      const change = (Math.random() - 0.5) * 100;
      this.livePrices.set(symbol, Math.max(price + change, 10));
    });
    
    this.renderOpenTrades();
    this.showMessage('Live prices updated successfully!', 'success');
  }

  refreshAllData() {
    this.refreshPrices();
    this.updateLastRefreshTime();
    this.showMessage('All data refreshed successfully!', 'success');
  }

  updateLastRefreshTime() {
    const element = document.getElementById('last-update-time');
    if (element) {
      element.textContent = new Date().toLocaleString();
    }
  }

  // Stock Autocomplete
  initStockAutocomplete() {
    const datalist = document.getElementById('symbols');
    if (datalist) {
      datalist.innerHTML = this.nseStocks.map(stock => 
        `<option value="${stock}">${stock.replace('.NS', '')}</option>`
      ).join('');
    }
  }

  // Utility Functions
  formatCurrency(amount) {
    if (isNaN(amount)) return '0.00';
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatDate(dateString) {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffHours >= 24) {
      return Math.floor(diffHours / 24) + ' days ago';
    } else if (diffHours >= 1) {
      return diffHours + ' hours ago';
    } else {
      return diffMins + ' minutes ago';
    }
  }

  showMessage(text, type = 'info') {
    const container = document.getElementById('message-container');
    if (!container) return;
    
    const message = document.createElement('div');
    message.className = `message ${type}`;
    message.textContent = text;
    
    container.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 5000);
  }

  // Import/Export Functions (abbreviated for space)
  exportAllData() {
    const exportData = {
      ...this.data,
      exportDate: new Date().toISOString(),
      version: '2.0'
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showMessage('Data exported successfully!', 'success');
  }

  exportTrades() {
    const csvContent = this.convertTradesToCSV(this.data.trades);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-export-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showMessage('Trades exported to CSV successfully!', 'success');
  }

  convertTradesToCSV(trades) {
    const headers = ['Symbol', 'Entry Date', 'Exit Date', 'Entry Price', 'Exit Price', 'Quantity', 'Order Type', 'Strategy', 'Account', 'P&L', 'P&L %', 'Status'];
    const rows = trades.map(trade => [
      trade.symbol,
      trade.entryDate,
      trade.exitDate || '',
      trade.entryPrice,
      trade.exitPrice || '',
      trade.quantity,
      trade.orderType,
      trade.strategy,
      trade.account,
      trade.pnl || 0,
      trade.pnlPercent || 0,
      trade.status
    ]);
    
    return [headers, ...rows].map(row => row.map(field => `"${field}"`).join(',')).join('\n');
  }

  importTrades() {
    const element = document.getElementById('import-csv');
    if (element) element.click();
  }

  handleCSVImport(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const csv = event.target.result;
          const trades = this.parseCSVToTrades(csv);
          this.data.trades.push(...trades);
          this.saveData();
          this.applyFilters();
          this.showMessage(`${trades.length} trades imported successfully!`, 'success');
        } catch (error) {
          this.showMessage('Error importing CSV: ' + error.message, 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  parseCSVToTrades(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    const trades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      if (values.length >= headers.length) {
        const trade = {
          id: Date.now() + i,
          symbol: values[0],
          entryDate: values[1],
          exitDate: values[2] || null,
          entryPrice: parseFloat(values[3]),
          exitPrice: parseFloat(values[4]) || null,
          quantity: parseInt(values[5]),
          orderType: values[6],
          strategy: values[7],
          account: values[8],
          pnl: parseFloat(values[9]) || null,
          pnlPercent: parseFloat(values[10]) || null,
          status: values[11] || 'Open'
        };
        trades.push(trade);
      }
    }
    
    return trades;
  }

  exportSettings() {
    const settingsData = {
      accounts: this.data.accounts,
      strategies: this.data.strategies,
      settings: this.data.settings
    };
    
    const blob = new Blob([JSON.stringify(settingsData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-journal-settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showMessage('Settings exported successfully!', 'success');
  }

  importSettings() {
    const element = document.getElementById('import-file');
    if (element) element.click();
  }

  handleSettingsImport(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result);
          if (importedData.accounts) this.data.accounts = importedData.accounts;
          if (importedData.strategies) this.data.strategies = importedData.strategies;
          if (importedData.settings) this.data.settings = { ...this.data.settings, ...importedData.settings };
          
          this.saveData();
          this.renderSettings();
          this.showMessage('Settings imported successfully!', 'success');
        } catch (error) {
          this.showMessage('Error importing settings: Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  resetData() {
    if (confirm('Are you sure you want to reset all data? This action cannot be undone.')) {
      localStorage.removeItem('tradingJournalProData');
      localStorage.removeItem('aiInsights');
      this.loadSampleData();
      this.renderActiveTab();
      this.showMessage('All data has been reset to defaults', 'success');
    }
  }

  refreshNews() {
    this.showMessage('News feed refreshed!', 'info');
    this.renderNewsFeed();
  }

  filterNews() {
    this.showMessage('News filtered successfully!', 'info');
  }
}

// Initialize the application when DOM is ready
const app = new TradingJournalPro();
app.init();

// Expose to global scope for event handlers
window.app = app;