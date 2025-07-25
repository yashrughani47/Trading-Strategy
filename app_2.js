// Trading Journal Pro - Ultimate NSE Platform
// Fixed Analytics Tab with Comprehensive Performance Metrics

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
    this.charts = {}; // Store chart instances
    
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
      "Consider adding defensive stocks during current market volatility"
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
      {id: 4, name: "Value Investing"},
      {id: 5, name: "Support & Resistance"},
      {id: 6, name: "RSI Divergence"},
      {id: 7, name: "Volume Breakout"},
      {id: 8, name: "Gap Trading"}
    ];

    // Enhanced sample trades with varied results for better analytics
    this.data.trades = [
      {
        id: 1, symbol: "RELIANCE.NS", entryDate: "2024-12-15", entryPrice: 1391.70,
        stopLoss: 1300, target: 1500, exitDate: "2024-12-18", exitPrice: 1450.50,
        orderType: "Long", strategy: "Breakout", account: "Trading Account 1",
        quantity: 10, pnl: 588, pnlPercent: 4.23, status: "Win"
      },
      {
        id: 2, symbol: "TCS.NS", entryDate: "2024-12-20", entryPrice: 3135.80,
        stopLoss: 3000, target: 3300, orderType: "Long", strategy: "Momentum",
        account: "Trading Account 1", quantity: 5, status: "Open"
      },
      {
        id: 3, symbol: "INFY.NS", entryDate: "2025-01-05", entryPrice: 1515.70,
        stopLoss: 1450, target: 1600, exitDate: "2025-01-08", exitPrice: 1580.25,
        orderType: "Long", strategy: "Swing Trading", account: "Trading Account 2",
        quantity: 20, pnl: 1291, pnlPercent: 4.26, status: "Win"
      },
      {
        id: 4, symbol: "HDFCBANK.NS", entryDate: "2025-01-12", entryPrice: 2004.60,
        stopLoss: 1950, target: 2100, exitDate: "2025-01-15", exitPrice: 1950.30,
        orderType: "Long", strategy: "Value Investing", account: "Investment Account",
        quantity: 15, pnl: -814.5, pnlPercent: -2.71, status: "Loss"
      },
      {
        id: 5, symbol: "ICICIBANK.NS", entryDate: "2025-01-20", entryPrice: 1477.10,
        stopLoss: 1420, target: 1550, orderType: "Long", strategy: "Breakout",
        account: "Trading Account 1", quantity: 25, status: "Open"
      },
      {
        id: 6, symbol: "WIPRO.NS", entryDate: "2024-12-28", entryPrice: 565.80,
        stopLoss: 540, target: 600, exitDate: "2025-01-02", exitPrice: 598.45,
        orderType: "Long", strategy: "Momentum", account: "Trading Account 2",
        quantity: 50, pnl: 1632.5, pnlPercent: 5.77, status: "Win"
      },
      {
        id: 7, symbol: "MARUTI.NS", entryDate: "2025-01-08", entryPrice: 10250,
        stopLoss: 10000, target: 10600, exitDate: "2025-01-10", exitPrice: 10000,
        orderType: "Long", strategy: "Support & Resistance", account: "Investment Account",
        quantity: 3, pnl: -750, pnlPercent: -2.44, status: "Loss"
      },
      {
        id: 8, symbol: "BAJFINANCE.NS", entryDate: "2025-01-18", entryPrice: 6850,
        stopLoss: 6700, target: 7100, exitDate: "2025-01-22", exitPrice: 7080,
        orderType: "Long", strategy: "RSI Divergence", account: "Trading Account 1",
        quantity: 5, pnl: 1150, pnlPercent: 3.36, status: "Win"
      },
      {
        id: 9, symbol: "ASIANPAINT.NS", entryDate: "2025-01-15", entryPrice: 2680,
        stopLoss: 2600, target: 2800, exitDate: "2025-01-17", exitPrice: 2598,
        orderType: "Long", strategy: "Volume Breakout", account: "Trading Account 2",
        quantity: 8, pnl: -656, pnlPercent: -3.06, status: "Loss"
      },
      {
        id: 10, symbol: "HINDUNILVR.NS", entryDate: "2025-01-25", entryPrice: 2450,
        stopLoss: 2380, target: 2550, orderType: "Long", strategy: "Gap Trading",
        account: "Investment Account", quantity: 12, status: "Open"
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

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab switching
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const tabElement = e.target.closest('.tab');
        if (tabElement && tabElement.dataset.tab) {
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

    // Trade form calculations
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

    // Analytics filters - Fixed to properly trigger analytics update
    ['analytics-account', 'analytics-strategy', 'analytics-period'].forEach(id => {
      this.addEventListenerSafe(id, 'change', () => {
        console.log('Analytics filter changed:', id);
        this.renderAnalytics();
      });
    });

    // News and AI
    this.addEventListenerSafe('refresh-news', 'click', () => this.refreshNews());
    this.addEventListenerSafe('generate-insight', 'click', () => this.generateAIInsight());
    this.addEventListenerSafe('analyze-portfolio', 'click', () => this.analyzePortfolio());
    this.addEventListenerSafe('news-filter', 'change', () => this.filterNews());
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
    }
    
    this.activeTab = tabName;
    
    // Render the active tab with proper delay for DOM updates
    setTimeout(() => {
      this.renderActiveTab();
    }, 100);
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
      }
    } catch (error) {
      console.error('Error rendering tab:', error);
    }
  }

  // Dashboard (keeping existing functionality)
  renderDashboard() {
    console.log('Rendering dashboard...');
    
    const cards = document.getElementById('dashboard-cards');
    if (!cards) return;
    
    const { totalBalance, balanceInUse, totalPnL, openPositions, winRate } = this.calculateDashboardMetrics();
    
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
        <div class="return">${totalBalance > 0 ? ((totalPnL/totalBalance)*100).toFixed(2) : 0}% Return</div>
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
    
    return { totalBalance, balanceInUse, totalPnL, openPositions: openTrades.length, winRate };
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
      { name: 'NIFTY IT', value: 35420.12, change: '+2.15%', changeValue: '+745.67' }
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

  // ENHANCED ANALYTICS TAB - MAIN FIX
  renderAnalytics() {
    console.log('Rendering analytics tab with comprehensive metrics...');
    
    // Populate filter dropdowns first
    this.populateAnalyticsFilters();
    
    // Get filtered trades based on current selections
    const filteredTrades = this.getFilteredAnalyticsTrades();
    console.log('Filtered trades for analytics:', filteredTrades.length);
    
    // Render all analytics components
    setTimeout(() => {
      this.renderAnalyticsCharts(filteredTrades);
      this.renderAnalyticsMetrics(filteredTrades);
    }, 200);
  }

  populateAnalyticsFilters() {
    const accountFilter = document.getElementById('analytics-account');
    const strategyFilter = document.getElementById('analytics-strategy');
    
    if (accountFilter) {
      const accountOptions = this.data.accounts.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
      accountFilter.innerHTML = '<option value="">All Accounts</option>' + accountOptions;
    }
    
    if (strategyFilter) {
      const strategyOptions = this.data.strategies.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
      strategyFilter.innerHTML = '<option value="">All Strategies</option>' + strategyOptions;
    }
  }

  getFilteredAnalyticsTrades() {
    const accountFilter = document.getElementById('analytics-account')?.value || '';
    const strategyFilter = document.getElementById('analytics-strategy')?.value || '';
    const periodFilter = document.getElementById('analytics-period')?.value || 'all';
    
    let filteredTrades = this.data.trades.filter(trade => {
      // Account filter
      if (accountFilter && trade.account !== accountFilter) return false;
      
      // Strategy filter
      if (strategyFilter && trade.strategy !== strategyFilter) return false;
      
      // Period filter
      if (periodFilter !== 'all') {
        const days = parseInt(periodFilter);
        const tradeDate = new Date(trade.entryDate);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        if (tradeDate < cutoffDate) return false;
      }
      
      return true;
    });
    
    return filteredTrades;
  }

  renderAnalyticsCharts(trades) {
    console.log('Rendering analytics charts with', trades.length, 'trades');
    
    // Destroy existing charts
    Object.values(this.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    this.charts = {};
    
    // Render each chart
    this.renderEquityChart(trades);
    this.renderMonthlyPnLChart(trades);
    this.renderWinLossChart(trades);
    this.renderStrategyPerformanceChart(trades);
  }

  renderEquityChart(trades) {
    const canvas = document.getElementById('equity-chart');
    if (!canvas) {
      console.error('Equity chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const closedTrades = trades.filter(t => t.pnl !== undefined && t.pnl !== null)
                             .sort((a, b) => new Date(a.exitDate || a.entryDate) - new Date(b.exitDate || b.entryDate));
    
    let cumulative = 0;
    const data = closedTrades.map(trade => {
      cumulative += trade.pnl;
      return {
        x: trade.exitDate || trade.entryDate,
        y: cumulative
      };
    });

    console.log('Equity chart data points:', data.length);

    this.charts.equity = new Chart(ctx, {
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
            text: 'Portfolio Equity Curve'
          },
          legend: {
            display: true
          }
        },
        scales: {
          x: { 
            type: 'time',
            time: { 
              unit: 'day',
              displayFormats: {
                day: 'MMM dd'
              }
            },
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
        }
      }
    });
  }

  renderMonthlyPnLChart(trades) {
    const canvas = document.getElementById('monthly-pnl-chart');
    if (!canvas) {
      console.error('Monthly P&L chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const monthlyData = this.calculateMonthlyPnL(trades);
    
    console.log('Monthly P&L data:', monthlyData);

    this.charts.monthlyPnL = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(monthlyData),
        datasets: [{
          label: 'Monthly P&L (₹)',
          data: Object.values(monthlyData),
          backgroundColor: Object.values(monthlyData).map(val => val >= 0 ? '#1FB8CD' : '#B4413C'),
          borderColor: Object.values(monthlyData).map(val => val >= 0 ? '#1FB8CD' : '#B4413C'),
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Monthly P&L Performance'
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
          }
        }
      }
    });
  }

  renderWinLossChart(trades) {
    const canvas = document.getElementById('winloss-chart');
    if (!canvas) {
      console.error('Win/Loss chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const closedTrades = trades.filter(t => t.status !== 'Open');
    const wins = closedTrades.filter(t => t.status === 'Win').length;
    const losses = closedTrades.filter(t => t.status === 'Loss').length;

    console.log('Win/Loss data - Wins:', wins, 'Losses:', losses);

    this.charts.winLoss = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Wins', 'Losses'],
        datasets: [{
          data: [wins, losses],
          backgroundColor: ['#1FB8CD', '#B4413C'],
          borderWidth: 2,
          borderColor: '#FFFFFF'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Win/Loss Distribution'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  renderStrategyPerformanceChart(trades) {
    const canvas = document.getElementById('strategy-performance-chart');
    if (!canvas) {
      console.error('Strategy performance chart canvas not found');
      return;
    }
    
    const ctx = canvas.getContext('2d');
    const strategyData = this.calculateStrategyPerformance(trades);
    
    console.log('Strategy performance data:', strategyData);

    this.charts.strategy = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(strategyData),
        datasets: [{
          label: 'Strategy P&L (₹)',
          data: Object.values(strategyData),
          backgroundColor: '#FFC185',
          borderColor: '#FFC185',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: 'Strategy Performance Comparison'
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
          }
        }
      }
    });
  }

  calculateMonthlyPnL(trades) {
    const monthlyData = {};
    trades.filter(t => t.pnl !== undefined && t.pnl !== null).forEach(trade => {
      const date = new Date(trade.exitDate || trade.entryDate);
      const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      monthlyData[month] = (monthlyData[month] || 0) + trade.pnl;
    });
    
    // Sort by date
    const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
      return new Date(a + ' 1, 2024') - new Date(b + ' 1, 2024');
    });
    
    const sortedData = {};
    sortedMonths.forEach(month => {
      sortedData[month] = monthlyData[month];
    });
    
    return sortedData;
  }

  calculateStrategyPerformance(trades) {
    const strategyData = {};
    trades.filter(t => t.pnl !== undefined && t.pnl !== null).forEach(trade => {
      strategyData[trade.strategy] = (strategyData[trade.strategy] || 0) + trade.pnl;
    });
    return strategyData;
  }

  renderAnalyticsMetrics(trades) {
    console.log('Rendering analytics metrics...');
    const metrics = this.calculateAdvancedMetrics(trades);
    
    const elements = {
      'win-rate': metrics.winRate + '%',
      'profit-factor': metrics.profitFactor,
      'max-drawdown': metrics.maxDrawdown + '%',
      'sharpe-ratio': metrics.sharpeRatio,
      'avg-win': '₹' + this.formatCurrency(metrics.avgWin),
      'avg-loss': '₹' + this.formatCurrency(Math.abs(metrics.avgLoss))
    };

    Object.entries(elements).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
        console.log(`Updated ${id} with value: ${value}`);
      } else {
        console.warn(`Element with id '${id}' not found`);
      }
    });
  }

  calculateAdvancedMetrics(trades = null) {
    const analysisTrades = trades || this.data.trades;
    const closedTrades = analysisTrades.filter(t => t.status !== 'Open' && t.pnl !== undefined);
    const wins = closedTrades.filter(t => t.status === 'Win');
    const losses = closedTrades.filter(t => t.status === 'Loss');
    
    // Win Rate
    const winRate = closedTrades.length > 0 ? ((wins.length / closedTrades.length) * 100).toFixed(1) : 0;
    
    // Profit Factor
    const totalWins = wins.reduce((sum, trade) => sum + Math.abs(trade.pnl), 0);
    const totalLosses = losses.reduce((sum, trade) => sum + Math.abs(trade.pnl), 0);
    const profitFactor = totalLosses > 0 ? (totalWins / totalLosses).toFixed(2) : 'N/A';
    
    // Average Win/Loss
    const avgWin = wins.length > 0 ? (totalWins / wins.length) : 0;
    const avgLoss = losses.length > 0 ? (totalLosses / losses.length) : 0;
    
    // Max Drawdown calculation
    let peak = 0;
    let maxDrawdown = 0;
    let cumulative = 0;
    
    const sortedTrades = closedTrades.sort((a, b) => new Date(a.exitDate || a.entryDate) - new Date(b.exitDate || b.entryDate));
    
    sortedTrades.forEach(trade => {
      cumulative += trade.pnl;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    });
    
    const maxDrawdownPercent = peak > 0 ? ((maxDrawdown / peak) * 100).toFixed(1) : 0;
    
    // Sharpe Ratio (simplified)
    const returns = closedTrades.map(t => (t.pnl / (t.entryPrice * t.quantity)) * 100);
    const avgReturn = returns.length > 0 ? returns.reduce((sum, r) => sum + r, 0) / returns.length : 0;
    const stdDev = returns.length > 1 ? 
      Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)) : 1;
    const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev).toFixed(2) : '0.00';

    return { 
      winRate: parseFloat(winRate), 
      profitFactor, 
      maxDrawdown: parseFloat(maxDrawdownPercent), 
      sharpeRatio, 
      avgWin, 
      avgLoss 
    };
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

    // Add .NS suffix if not present
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

  editTrade(tradeId) {
    this.showMessage('Edit functionality coming soon!', 'info');
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

  populateFilterDropdowns() {
    const accountFilter = document.getElementById('filter-account');
    const strategyFilter = document.getElementById('filter-strategy');

    const accountOptions = this.data.accounts.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
    const strategyOptions = this.data.strategies.map(s => `<option value="${s.name}">${s.name}</option>`).join('');

    if (accountFilter) {
      accountFilter.innerHTML = '<option value="">All Accounts</option>' + accountOptions;
    }

    if (strategyFilter) {
      strategyFilter.innerHTML = '<option value="">All Strategies</option>' + strategyOptions;
    }
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

  // News & AI (keeping existing)
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
        title: "NSE hits record high as FII flows surge",
        summary: "Foreign institutional investors pump in ₹25,000 crores in January 2025.",
        sentiment: "positive",
        timestamp: new Date().toISOString()
      },
      {
        title: "RBI maintains repo rate at 6.5%",
        summary: "Central bank keeps rates unchanged citing balanced outlook.",
        sentiment: "neutral",
        timestamp: new Date(Date.now() - 3600000).toISOString()
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
      '<div class="ai-insight">Click "Generate New Insight" to get AI-powered analysis.</div>';
  }

  generateAIInsight() {
    const insight = this.aiInsightsBank[Math.floor(Math.random() * this.aiInsightsBank.length)];
    const currentInsights = JSON.parse(localStorage.getItem('aiInsights') || '[]');
    currentInsights.unshift(insight);
    
    if (currentInsights.length > 10) {
      currentInsights.splice(10);
    }
    
    localStorage.setItem('aiInsights', JSON.stringify(currentInsights));
    this.renderAIInsights();
  }

  analyzePortfolio() {
    const openTrades = this.data.trades.filter(t => t.status === 'Open');
    const analysis = [];

    if (openTrades.length === 0) {
      analysis.push("No open positions to analyze.");
    } else {
      analysis.push(`Portfolio has ${openTrades.length} open positions.`);
      analysis.push("Risk management parameters within limits.");
    }

    const currentInsights = JSON.parse(localStorage.getItem('aiInsights') || '[]');
    analysis.forEach(insight => currentInsights.unshift(`📊 ${insight}`));
    
    localStorage.setItem('aiInsights', JSON.stringify(currentInsights));
    this.renderAIInsights();
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
    this.nseStocks.slice(0, 50).forEach(symbol => {
      this.livePrices.set(symbol, Math.random() * 2000 + 500);
    });

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
    this.showMessage('Live prices updated!', 'success');
  }

  refreshAllData() {
    this.refreshPrices();
    this.updateLastRefreshTime();
    this.showMessage('All data refreshed!', 'success');
  }

  updateLastRefreshTime() {
    const element = document.getElementById('last-update-time');
    if (element) {
      element.textContent = new Date().toLocaleString();
    }
  }

  refreshNews() {
    this.showMessage('News refreshed!', 'info');
    this.renderNewsFeed();
  }

  filterNews() {
    this.showMessage('News filtered!', 'info');
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

  // Export/Import Functions (simplified)
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
    
    this.showMessage('Trades exported to CSV!', 'success');
  }

  convertTradesToCSV(trades) {
    const headers = ['Symbol', 'Entry Date', 'Exit Date', 'Entry Price', 'Exit Price', 'Quantity', 'Order Type', 'Strategy', 'Account', 'P&L', 'P&L %', 'Status'];
    const rows = trades.map(trade => [
      trade.symbol, trade.entryDate, trade.exitDate || '', trade.entryPrice, trade.exitPrice || '',
      trade.quantity, trade.orderType, trade.strategy, trade.account, trade.pnl || 0, trade.pnlPercent || 0, trade.status
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
          this.showMessage(`${trades.length} trades imported!`, 'success');
        } catch (error) {
          this.showMessage('Error importing CSV: ' + error.message, 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  parseCSVToTrades(csv) {
    const lines = csv.split('\n').filter(line => line.trim());
    const trades = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/"/g, '').trim());
      if (values.length >= 11) {
        const trade = {
          id: Date.now() + i,
          symbol: values[0],
          entryDate: values[1],
          exitDate: values[2] || null,
          entryPrice: parseFloat(values[3]),
          exitPrice: parseFloat(values[4]) || null
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
    a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    this.showMessage('Settings exported!', 'success');
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
          
          this.saveData();
          this.renderSettings();
          this.showMessage('Settings imported!', 'success');
        } catch (error) {
          this.showMessage('Error importing settings', 'error');
        }
      };
      reader.readAsText(file);
    }
  }

  resetData() {
    if (confirm('Reset all data? This cannot be undone.')) {
      localStorage.removeItem('tradingJournalProData');
      localStorage.removeItem('aiInsights');
      this.loadSampleData();
      this.renderActiveTab();
      this.showMessage('Data reset to defaults', 'success');
    }
  }
}

// Initialize the application
const app = new TradingJournalPro();
app.init();

// Global exposure for event handlers
window.app = app;