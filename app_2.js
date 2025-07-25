// Trading Journal Pro - Final Analytics Fix with Working Navigation
class TradingJournalPro {
  constructor() {
    this.data = {
      accounts: [
        { name: 'Main Account', balance: 100000 },
        { name: 'Trading Account', balance: 50000 }
      ],
      strategies: [
        { name: 'Swing Trading' },
        { name: 'Day Trading' },
        { name: 'Positional' }
      ],
      trades: [
        {
          id: 1,
          symbol: 'RELIANCE',
          strategy: 'Swing Trading',
          account: 'Main Account',
          entryDate: '2024-01-15',
          buyPrice: 2400,
          stopLoss: 2300,
          target: 2600,
          exitDate: '2024-01-20',
          exitPrice: 2580,
          orderType: 'Long',
          quantity: 10,
          pnl: 1800,
          status: 'Win'
        },
        {
          id: 2,
          symbol: 'TCS',
          strategy: 'Day Trading',
          account: 'Trading Account',
          entryDate: '2024-01-16',
          buyPrice: 3500,
          stopLoss: 3450,
          target: 3600,
          exitDate: '2024-01-16',
          exitPrice: 3480,
          orderType: 'Long',
          quantity: 5,
          pnl: -100,
          status: 'Loss'
        },
        {
          id: 3,
          symbol: 'INFY',
          strategy: 'Swing Trading',
          account: 'Main Account',
          entryDate: '2024-01-18',
          buyPrice: 1450,
          stopLoss: 1400,
          target: 1550,
          exitDate: null,
          exitPrice: null,
          orderType: 'Long',
          quantity: 20,
          pnl: 0,
          status: 'Open'
        },
        {
          id: 4,
          symbol: 'HDFC',
          strategy: 'Positional',
          account: 'Main Account',
          entryDate: '2024-01-22',
          buyPrice: 1600,
          stopLoss: 1550,
          target: 1700,
          exitDate: '2024-01-25',
          exitPrice: 1680,
          orderType: 'Long',
          quantity: 15,
          pnl: 1200,
          status: 'Win'
        },
        {
          id: 5,
          symbol: 'ICICI',
          strategy: 'Day Trading',
          account: 'Trading Account',
          entryDate: '2024-01-20',
          buyPrice: 950,
          stopLoss: 920,
          target: 1000,
          exitDate: '2024-01-20',
          exitPrice: 920,
          orderType: 'Long',
          quantity: 25,
          pnl: -750,
          status: 'Loss'
        },
        {
          id: 6,
          symbol: 'WIPRO',
          strategy: 'Swing Trading',
          account: 'Main Account',
          entryDate: '2024-01-28',
          buyPrice: 450,
          stopLoss: 420,
          target: 500,
          exitDate: '2024-01-30',
          exitPrice: 480,
          orderType: 'Long',
          quantity: 30,
          pnl: 900,
          status: 'Win'
        }
      ]
    };
    
    this.activeTab = 'dashboard';
    this.charts = {};
  }

  init() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'complete') {
      this.initializeApp();
    } else {
      window.addEventListener('load', () => this.initializeApp());
    }
  }

  initializeApp() {
    console.log('Trading Journal Pro initializing...');
    
    // Small delay to ensure all DOM elements are ready
    setTimeout(() => {
      this.setupTabNavigation();
      this.setupAnalyticsFilters();
      this.renderActiveTab();
      console.log('Trading Journal Pro initialized successfully');
    }, 100);
  }

  setupTabNavigation() {
    console.log('Setting up tab navigation...');
    
    // Use event delegation for more reliable event handling
    const tabContainer = document.querySelector('.tabs');
    if (tabContainer) {
      tabContainer.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (tab && tab.dataset.tab) {
          e.preventDefault();
          e.stopPropagation();
          this.switchTab(tab.dataset.tab);
        }
      });
      console.log('Tab navigation setup complete');
    } else {
      console.error('Tab container not found');
    }
  }

  switchTab(tabName) {
    console.log(`Switching to tab: ${tabName}`);
    
    try {
      // Update tab active states
      const tabs = document.querySelectorAll('.tab');
      tabs.forEach(tab => tab.classList.remove('active'));
      
      const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
      if (activeTab) {
        activeTab.classList.add('active');
      }

      // Hide all sections
      const sections = document.querySelectorAll('.tab-section');
      sections.forEach(section => section.classList.add('hidden'));
      
      // Show target section
      const targetSection = document.getElementById(`tab-${tabName}`);
      if (targetSection) {
        targetSection.classList.remove('hidden');
        console.log(`Section ${tabName} is now visible`);
      } else {
        console.error(`Section tab-${tabName} not found`);
      }

      this.activeTab = tabName;
      
      // Render content with a small delay
      setTimeout(() => {
        this.renderActiveTab();
      }, 50);
      
    } catch (error) {
      console.error('Error switching tabs:', error);
    }
  }

  renderActiveTab() {
    console.log(`Rendering active tab: ${this.activeTab}`);
    
    switch(this.activeTab) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'analytics':
        this.renderAnalytics();
        break;
      default:
        console.log(`No specific renderer for tab: ${this.activeTab}`);
    }
  }

  renderDashboard() {
    const cardsEl = document.getElementById('dashboard-cards');
    if (!cardsEl) return;

    const totalPnL = this.data.trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalBalance = this.data.accounts.reduce((sum, a) => sum + a.balance, 0);
    const openTrades = this.data.trades.filter(t => t.status === 'Open').length;
    const closedTrades = this.data.trades.filter(t => t.status !== 'Open');
    const winRate = closedTrades.length > 0 ? 
      ((closedTrades.filter(t => t.status === 'Win').length / closedTrades.length) * 100).toFixed(1) : 0;

    cardsEl.innerHTML = `
      <div class="dashboard-card">
        <h3>Total Portfolio Value</h3>
        <div class="value">₹${(totalBalance + totalPnL).toLocaleString()}</div>
      </div>
      <div class="dashboard-card">
        <h3>Total P&L</h3>
        <div class="value ${totalPnL >= 0 ? 'positive' : 'negative'}">₹${totalPnL.toLocaleString()}</div>
      </div>
      <div class="dashboard-card">
        <h3>Open Trades</h3>
        <div class="value">${openTrades}</div>
      </div>
      <div class="dashboard-card">
        <h3>Win Rate</h3>
        <div class="value">${winRate}%</div>
      </div>
    `;
    console.log('Dashboard rendered');
  }

  setupAnalyticsFilters() {
    // Set up analytics filter event listeners
    const filterIds = ['analytics-account', 'analytics-strategy', 'analytics-period', 'analytics-result'];
    filterIds.forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('change', () => {
          console.log(`Filter changed: ${id} = ${el.value}`);
          this.renderAnalytics();
        });
      }
    });
  }

  renderAnalytics() {
    console.log('Rendering analytics tab...');
    
    this.populateFilterDropdowns();
    const filteredTrades = this.getFilteredTrades();
    console.log(`Analytics rendering with ${filteredTrades.length} filtered trades`);
    
    this.updateAllMetrics(filteredTrades);
    
    // Render charts after a delay to ensure canvas elements exist
    setTimeout(() => {
      this.renderCharts(filteredTrades);
    }, 100);
  }

  populateFilterDropdowns() {
    const accountSelect = document.getElementById('analytics-account');
    const strategySelect = document.getElementById('analytics-strategy');

    if (accountSelect) {
      const currentValue = accountSelect.value;
      const accountOptions = this.data.accounts.map(a => 
        `<option value="${a.name}" ${currentValue === a.name ? 'selected' : ''}>${a.name}</option>`
      ).join('');
      accountSelect.innerHTML = `<option value="" ${currentValue === '' ? 'selected' : ''}>All Accounts</option>` + accountOptions;
    }

    if (strategySelect) {
      const currentValue = strategySelect.value;
      const strategyOptions = this.data.strategies.map(s => 
        `<option value="${s.name}" ${currentValue === s.name ? 'selected' : ''}>${s.name}</option>`
      ).join('');
      strategySelect.innerHTML = `<option value="" ${currentValue === '' ? 'selected' : ''}>All Strategies</option>` + strategyOptions;
    }
  }

  getFilteredTrades() {
    const accountFilter = document.getElementById('analytics-account')?.value || '';
    const strategyFilter = document.getElementById('analytics-strategy')?.value || '';
    const periodFilter = document.getElementById('analytics-period')?.value || 'all';
    const resultFilter = document.getElementById('analytics-result')?.value || '';

    console.log('Applied filters:', { accountFilter, strategyFilter, periodFilter, resultFilter });

    return this.data.trades.filter(trade => {
      if (accountFilter && trade.account !== accountFilter) return false;
      if (strategyFilter && trade.strategy !== strategyFilter) return false;
      if (resultFilter && trade.status !== resultFilter) return false;
      
      if (periodFilter !== 'all') {
        const days = parseInt(periodFilter);
        const tradeDate = new Date(trade.entryDate);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        if (tradeDate < cutoff) return false;
      }
      
      return true;
    });
  }

  updateAllMetrics(trades) {
    console.log(`Updating metrics for ${trades.length} trades`);
    const metrics = this.calculateComprehensiveMetrics(trades);
    
    // Update all metrics
    const updates = {
      'total-trades': metrics.totalTrades.toString(),
      'win-rate': metrics.winRate.toFixed(1) + '%',
      'total-pnl': '₹' + metrics.totalPnL.toLocaleString(),
      'profit-factor': metrics.profitFactor.toFixed(2),
      'avg-pnl': '₹' + metrics.avgPnL.toFixed(2),
      'avg-win': '₹' + metrics.avgWin.toFixed(2),
      'avg-loss': '₹' + Math.abs(metrics.avgLoss).toFixed(2),
      'risk-reward': '1:' + metrics.riskReward.toFixed(2),
      'expectancy': '₹' + metrics.expectancy.toFixed(2),
      'max-drawdown': metrics.maxDrawdown.toFixed(2) + '%',
      'sharpe-ratio': metrics.sharpeRatio.toFixed(2),
      'best-trade': '₹' + metrics.bestTrade.toLocaleString(),
      'worst-trade': '₹' + metrics.worstTrade.toLocaleString(),
      'roi': metrics.roi.toFixed(2) + '%'
    };

    Object.entries(updates).forEach(([id, value]) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = value;
      }
    });

    // Update progress bar
    const progressBar = document.getElementById('win-rate-bar');
    if (progressBar) {
      progressBar.style.width = metrics.winRate + '%';
    }

    // Update breakdown
    const breakdown = document.getElementById('trades-breakdown');
    if (breakdown) {
      const wins = trades.filter(t => t.status === 'Win').length;
      const losses = trades.filter(t => t.status === 'Loss').length;
      breakdown.textContent = `${wins} Win • ${losses} Loss`;
    }

    // Update trend
    const trend = document.getElementById('pnl-trend');
    if (trend) {
      trend.textContent = metrics.totalPnL >= 0 ? '+VE' : '-VE';
      trend.className = 'metric-trend ' + (metrics.totalPnL >= 0 ? 'positive' : 'negative');
    }

    console.log('All metrics updated successfully');
  }

  calculateComprehensiveMetrics(trades) {
    const totalTrades = trades.length;
    const closedTrades = trades.filter(t => t.status !== 'Open');
    const winTrades = closedTrades.filter(t => t.status === 'Win');
    const lossTrades = closedTrades.filter(t => t.status === 'Loss');

    const winRate = closedTrades.length > 0 ? (winTrades.length / closedTrades.length) * 100 : 0;
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    
    const grossProfit = winTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const grossLoss = Math.abs(lossTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : 0;

    const avgPnL = closedTrades.length > 0 ? totalPnL / closedTrades.length : 0;
    const avgWin = winTrades.length > 0 ? grossProfit / winTrades.length : 0;
    const avgLoss = lossTrades.length > 0 ? lossTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / lossTrades.length : 0;

    const expectancy = (winRate / 100) * avgWin + ((100 - winRate) / 100) * avgLoss;
    const riskReward = avgLoss !== 0 ? Math.abs(avgWin / avgLoss) : 0;

    const bestTrade = closedTrades.length > 0 ? Math.max(...closedTrades.map(t => t.pnl || 0)) : 0;
    const worstTrade = closedTrades.length > 0 ? Math.min(...closedTrades.map(t => t.pnl || 0)) : 0;

    // Sharpe ratio calculation
    const returns = closedTrades.map(t => (t.pnl || 0) / (t.buyPrice * (t.quantity || 1)));
    const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
    const stdDev = returns.length > 1 ? 
      Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / (returns.length - 1)) : 1;
    const sharpeRatio = stdDev > 0 ? avgReturn / stdDev : 0;

    // Drawdown calculation
    let cumulative = 0, peak = 0, maxDD = 0;
    const sortedTrades = [...closedTrades].sort((a, b) => new Date(a.exitDate || a.entryDate) - new Date(b.exitDate || b.entryDate));
    
    sortedTrades.forEach(trade => {
      cumulative += trade.pnl || 0;
      if (cumulative > peak) peak = cumulative;
      const drawdown = peak - cumulative;
      if (drawdown > maxDD) maxDD = drawdown;
    });
    
    const maxDrawdown = peak > 0 ? (maxDD / peak) * 100 : 0;

    // ROI calculation
    const totalInvested = trades.reduce((sum, t) => sum + (t.buyPrice * (t.quantity || 1)), 0);
    const roi = totalInvested > 0 ? (totalPnL / totalInvested) * 100 : 0;

    return {
      totalTrades, winRate, totalPnL, profitFactor, avgPnL, avgWin, avgLoss,
      expectancy, riskReward, bestTrade, worstTrade, sharpeRatio, maxDrawdown, roi
    };
  }

  renderCharts(trades) {
    console.log(`Rendering charts for ${trades.length} trades`);
    
    // Destroy existing charts
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    this.charts = {};

    this.renderEquityChart(trades);
    this.renderMonthlyPnLChart(trades);
    this.renderWinLossChart(trades);
    this.renderStrategyChart(trades);
  }

  renderEquityChart(trades) {
    const canvas = document.getElementById('equity-chart');
    if (!canvas) return;

    const closedTrades = trades.filter(t => t.status !== 'Open' && t.exitDate)
      .sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));

    let cumulative = 0;
    const data = closedTrades.map(trade => {
      cumulative += trade.pnl || 0;
      return { x: trade.exitDate, y: cumulative };
    });

    this.charts.equity = new Chart(canvas, {
      type: 'line',
      data: {
        datasets: [{
          label: 'Cumulative P&L (₹)',
          data: data,
          borderColor: '#1FB8CD',
          backgroundColor: 'rgba(31, 184, 205, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { type: 'time', time: { unit: 'day' }, title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Cumulative P&L (₹)' } }
        }
      }
    });
  }

  renderMonthlyPnLChart(trades) {
    const canvas = document.getElementById('monthly-pnl-chart');
    if (!canvas) return;

    const monthlyData = {};
    trades.filter(t => t.status !== 'Open' && t.exitDate).forEach(trade => {
      const date = new Date(trade.exitDate);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = (monthlyData[key] || 0) + (trade.pnl || 0);
    });

    const labels = Object.keys(monthlyData).sort();
    const data = labels.map(key => monthlyData[key]);

    this.charts.monthly = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Monthly P&L (₹)',
          data: data,
          backgroundColor: data.map(val => val >= 0 ? '#1FB8CD' : '#B4413C')
        }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  renderWinLossChart(trades) {
    const canvas = document.getElementById('winloss-chart');
    if (!canvas) return;

    const wins = trades.filter(t => t.status === 'Win').length;
    const losses = trades.filter(t => t.status === 'Loss').length;

    this.charts.winLoss = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: ['Wins', 'Losses'],
        datasets: [{ data: [wins, losses], backgroundColor: ['#1FB8CD', '#B4413C'] }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  renderStrategyChart(trades) {
    const canvas = document.getElementById('strategy-performance-chart');
    if (!canvas) return;

    const strategyData = {};
    trades.filter(t => t.status !== 'Open').forEach(trade => {
      strategyData[trade.strategy] = (strategyData[trade.strategy] || 0) + (trade.pnl || 0);
    });

    const labels = Object.keys(strategyData);
    const data = labels.map(key => strategyData[key]);

    this.charts.strategy = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ label: 'Strategy P&L (₹)', data: data, backgroundColor: '#FFC185' }]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }
}

// Initialize app
const app = new TradingJournalPro();
app.init();