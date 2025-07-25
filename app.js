// Trading Journal Pro - Fixed JavaScript Application
class TradingJournalPro {
    constructor() {
        this.currentTab = 'dashboard';
        this.trades = [];
        this.accounts = [];
        this.strategies = [];
        this.charts = {};
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.initializeCharts();
        this.updateDashboard();
    }

    loadData() {
        this.accounts = JSON.parse(localStorage.getItem('accounts')) || [
            {"id": 1, "name": "Main Account", "balance": 100000},
            {"id": 2, "name": "Demo Account", "balance": 50000}
        ];

        this.strategies = JSON.parse(localStorage.getItem('strategies')) || [
            {"id": 1, "name": "Swing Trading"},
            {"id": 2, "name": "Scalping"},
            {"id": 3, "name": "Long Term"}
        ];

        this.trades = JSON.parse(localStorage.getItem('trades')) || [
            {
                "id": 1,
                "symbol": "RELIANCE.NS",
                "entryDate": "2024-01-15",
                "buyPrice": 2500,
                "exitDate": "2024-01-20",
                "exitPrice": 2600,
                "quantity": 100,
                "stopLoss": 2400,
                "target": 2650,
                "orderType": "Long",
                "strategy": "Swing Trading",
                "account": "Main Account"
            },
            {
                "id": 2,
                "symbol": "TCS.NS",
                "entryDate": "2024-01-18",
                "buyPrice": 3800,
                "exitDate": "",
                "exitPrice": "",
                "quantity": 50,
                "stopLoss": 3700,
                "target": 4000,
                "orderType": "Long",
                "strategy": "Long Term",
                "account": "Main Account"
            }
        ];

        this.newsItems = [
            {
                "title": "NSE reaches new highs",
                "content": "Indian stock market shows strong momentum with tech stocks leading the rally",
                "sentiment": "Positive"
            },
            {
                "title": "Tech stocks rally continues",
                "content": "Technology sector leads market gains with strong institutional buying",
                "sentiment": "Positive"
            }
        ];
    }

    saveData() {
        localStorage.setItem('accounts', JSON.stringify(this.accounts));
        localStorage.setItem('strategies', JSON.stringify(this.strategies));
        localStorage.setItem('trades', JSON.stringify(this.trades));
    }

    setupEventListeners() {
        // Tab navigation - Fixed implementation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.currentTarget.getAttribute('data-tab');
                this.switchTab(tab);
            });
        });

        // Form event listeners
        this.setupFormListeners();
        this.setupModalListeners();
    }

    setupFormListeners() {
        // Trade form
        const tradeForm = document.getElementById('tradeForm');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => this.handleTradeSubmit(e));
            
            // Real-time investment calculation
            const buyPrice = document.getElementById('buyPrice');
            const quantity = document.getElementById('quantity');
            
            if (buyPrice && quantity) {
                buyPrice.addEventListener('input', () => this.updateInvestmentAmount());
                quantity.addEventListener('input', () => this.updateInvestmentAmount());
            }
        }

        // CSV buttons
        const exportBtn = document.getElementById('exportCsvBtn');
        const importBtn = document.getElementById('importCsvBtn');
        const deleteBtn = document.getElementById('deleteSelectedBtn');
        const selectAll = document.getElementById('selectAll');

        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCSV());
        if (importBtn) importBtn.addEventListener('click', () => this.importCSV());
        if (deleteBtn) deleteBtn.addEventListener('click', () => this.deleteSelectedTrades());
        if (selectAll) selectAll.addEventListener('change', (e) => this.toggleSelectAll(e.target.checked));
    }

    setupModalListeners() {
        // Account modal listeners
        const addAccountBtn = document.getElementById('addAccountBtn');
        const accountModal = document.getElementById('accountModal');
        const closeAccountModal = document.getElementById('closeAccountModal');
        const accountOverlay = document.getElementById('accountModalOverlay');
        const cancelAccount = document.getElementById('cancelAccount');
        const accountForm = document.getElementById('accountForm');

        if (addAccountBtn) {
            addAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('accountModal');
            });
        }

        if (closeAccountModal) {
            closeAccountModal.addEventListener('click', () => this.hideModal('accountModal'));
        }

        if (accountOverlay) {
            accountOverlay.addEventListener('click', () => this.hideModal('accountModal'));
        }

        if (cancelAccount) {
            cancelAccount.addEventListener('click', () => this.hideModal('accountModal'));
        }

        if (accountForm) {
            accountForm.addEventListener('submit', (e) => this.handleAccountSubmit(e));
        }

        // Strategy modal listeners
        const addStrategyBtn = document.getElementById('addStrategyBtn');
        const closeStrategyModal = document.getElementById('closeStrategyModal');
        const strategyOverlay = document.getElementById('strategyModalOverlay');
        const cancelStrategy = document.getElementById('cancelStrategy');
        const strategyForm = document.getElementById('strategyForm');

        if (addStrategyBtn) {
            addStrategyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showModal('strategyModal');
            });
        }

        if (closeStrategyModal) {
            closeStrategyModal.addEventListener('click', () => this.hideModal('strategyModal'));
        }

        if (strategyOverlay) {
            strategyOverlay.addEventListener('click', () => this.hideModal('strategyModal'));
        }

        if (cancelStrategy) {
            cancelStrategy.addEventListener('click', () => this.hideModal('strategyModal'));
        }

        if (strategyForm) {
            strategyForm.addEventListener('submit', (e) => this.handleStrategySubmit(e));
        }
    }

    switchTab(tabName) {
        console.log('Switching to tab:', tabName);
        
        // Update navigation state
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeNavItem) {
            activeNavItem.classList.add('active');
        }

        // Update content visibility
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
            content.style.display = 'none';
        });
        
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
            activeContent.style.display = 'block';
        }

        this.currentTab = tabName;

        // Load tab-specific content
        setTimeout(() => {
            this.loadTabContent(tabName);
        }, 50);
    }

    loadTabContent(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'settings':
                this.updateSettings();
                break;
            case 'trades':
                this.updateTradeForm();
                break;
            case 'open-trades':
                this.updateOpenTrades();
                break;
            case 'all-trades':
                this.updateAllTrades();
                break;
            case 'analytics':
                this.updateAnalytics();
                break;
            case 'news':
                this.updateNews();
                break;
        }
    }

    updateDashboard() {
        const totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalTrades = this.trades.length;
        const completedTrades = this.trades.filter(t => t.exitDate);
        const winningTrades = completedTrades.filter(t => (t.exitPrice - t.buyPrice) > 0);
        const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length * 100).toFixed(1) : 0;
        const todayPL = this.calculateTodayPL();

        this.animateValue('totalBalance', totalBalance, '₹');
        this.animateValue('totalTrades', totalTrades);
        this.animateValue('winRate', winRate, '', '%');
        this.animateValue('todayPL', todayPL, '₹');

        this.updateRecentTrades();
        setTimeout(() => this.updatePerformanceChart(), 100);
    }

    animateValue(elementId, targetValue, prefix = '', suffix = '') {
        const element = document.getElementById(elementId);
        if (!element) return;

        const startValue = 0;
        const duration = 1000;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = startValue + (targetValue - startValue) * progress;
            
            element.textContent = prefix + Math.floor(currentValue).toLocaleString() + suffix;

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }

    calculateTodayPL() {
        const today = new Date().toISOString().split('T')[0];
        return this.trades
            .filter(t => t.entryDate === today || t.exitDate === today)
            .reduce((total, t) => {
                if (t.exitDate && t.exitPrice) {
                    return total + ((t.exitPrice - t.buyPrice) * t.quantity);
                }
                return total;
            }, 0);
    }

    updateRecentTrades() {
        const container = document.getElementById('recentTradesList');
        if (!container) return;

        const recentTrades = this.trades.slice(-5).reverse();
        
        container.innerHTML = recentTrades.map(trade => `
            <div class="recent-trade-item">
                <div>
                    <div class="trade-symbol-small">${trade.symbol}</div>
                    <div class="trade-type ${trade.orderType.toLowerCase()}">${trade.orderType}</div>
                </div>
                <div>
                    <div>₹${trade.buyPrice}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${trade.quantity} shares</div>
                </div>
                <div>
                    ${trade.exitDate ? 
                        `<div style="color: ${(trade.exitPrice - trade.buyPrice) >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                            ₹${((trade.exitPrice - trade.buyPrice) * trade.quantity).toFixed(2)}
                        </div>` :
                        '<div class="status-open">Open</div>'
                    }
                </div>
            </div>
        `).join('');
    }

    updateSettings() {
        this.updateAccountsList();
        this.updateStrategiesList();
    }

    updateAccountsList() {
        const container = document.getElementById('accountsList');
        if (!container) return;

        container.innerHTML = this.accounts.map(account => `
            <div class="account-item">
                <div class="account-info">
                    <h4>${account.name}</h4>
                    <span>Balance: ₹${account.balance.toLocaleString()}</span>
                </div>
                <button class="btn-danger" onclick="window.app.deleteAccount(${account.id})" style="padding: 0.5rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    updateStrategiesList() {
        const container = document.getElementById('strategiesList');
        if (!container) return;

        container.innerHTML = this.strategies.map(strategy => `
            <div class="strategy-item">
                <div class="strategy-info">
                    <h4>${strategy.name}</h4>
                    <span>Strategy ID: ${strategy.id}</span>
                </div>
                <button class="btn-danger" onclick="window.app.deleteStrategy(${strategy.id})" style="padding: 0.5rem;">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `).join('');
    }

    updateTradeForm() {
        // Populate dropdowns
        const strategySelect = document.getElementById('strategy');
        if (strategySelect) {
            strategySelect.innerHTML = '<option value="">Select Strategy</option>' +
                this.strategies.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
        }

        const accountSelect = document.getElementById('account');
        if (accountSelect) {
            accountSelect.innerHTML = '<option value="">Select Account</option>' +
                this.accounts.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
        }

        // Set today's date
        const entryDate = document.getElementById('entryDate');
        if (entryDate && !entryDate.value) {
            entryDate.value = new Date().toISOString().split('T')[0];
        }
    }

    updateInvestmentAmount() {
        const buyPrice = parseFloat(document.getElementById('buyPrice').value) || 0;
        const quantity = parseInt(document.getElementById('quantity').value) || 0;
        const investment = buyPrice * quantity;
        
        const display = document.getElementById('investmentAmount');
        if (display) {
            display.textContent = '₹' + investment.toLocaleString();
        }
    }

    updateOpenTrades() {
        const container = document.getElementById('openTradesGrid');
        if (!container) return;

        const openTrades = this.trades.filter(t => !t.exitDate);
        
        if (openTrades.length === 0) {
            container.innerHTML = `
                <div class="glass-card" style="text-align: center; grid-column: 1 / -1;">
                    <h3>No Open Positions</h3>
                    <p>All your trades are closed. Add new trades to see them here.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = openTrades.map(trade => {
            const currentPrice = this.simulateCurrentPrice(trade.buyPrice);
            const pnl = (currentPrice - trade.buyPrice) * trade.quantity;
            const pnlClass = pnl >= 0 ? 'profit' : 'loss';
            
            return `
                <div class="glass-card trade-card">
                    <div class="trade-symbol">${trade.symbol}</div>
                    <div class="trade-details">
                        <div class="trade-detail">
                            <span>Entry Price</span>
                            <strong>₹${trade.buyPrice}</strong>
                        </div>
                        <div class="trade-detail">
                            <span>Current Price</span>
                            <strong>₹${currentPrice.toFixed(2)}</strong>
                        </div>
                        <div class="trade-detail">
                            <span>Quantity</span>
                            <strong>${trade.quantity}</strong>
                        </div>
                        <div class="trade-detail">
                            <span>Type</span>
                            <strong>${trade.orderType}</strong>
                        </div>
                    </div>
                    <div class="pnl-display ${pnlClass}">
                        ₹${pnl.toFixed(2)}
                        <div style="font-size: 0.9rem; margin-top: 0.5rem;">
                            ${((pnl / (trade.buyPrice * trade.quantity)) * 100).toFixed(2)}%
                        </div>
                    </div>
                    <div style="margin-top: 1rem;">
                        <button class="btn-primary" onclick="window.app.closeTrade(${trade.id}, ${currentPrice})">
                            Close Position
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    simulateCurrentPrice(buyPrice) {
        const variation = (Math.random() - 0.5) * 0.1;
        return buyPrice * (1 + variation);
    }

    updateAllTrades() {
        const tbody = document.getElementById('tradesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.trades.map(trade => {
            const currentPrice = trade.exitPrice || this.simulateCurrentPrice(trade.buyPrice);
            const pnl = trade.exitPrice ? 
                (trade.exitPrice - trade.buyPrice) * trade.quantity :
                (currentPrice - trade.buyPrice) * trade.quantity;
            const status = trade.exitDate ? 'Closed' : 'Open';
            
            return `
                <tr>
                    <td><input type="checkbox" class="trade-checkbox" value="${trade.id}"></td>
                    <td>${trade.symbol}</td>
                    <td><span class="trade-type ${trade.orderType.toLowerCase()}">${trade.orderType}</span></td>
                    <td>${trade.entryDate}</td>
                    <td>₹${trade.buyPrice}</td>
                    <td>${trade.quantity}</td>
                    <td>₹${(trade.buyPrice * trade.quantity).toLocaleString()}</td>
                    <td>₹${currentPrice.toFixed(2)}</td>
                    <td style="color: ${pnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">₹${pnl.toFixed(2)}</td>
                    <td><span class="status-${status.toLowerCase()}">${status}</span></td>
                    <td>
                        ${!trade.exitDate ? 
                            `<button class="btn-primary" style="padding: 0.5rem 1rem;" onclick="window.app.closeTrade(${trade.id}, ${currentPrice})">Close</button>` :
                            '<span style="color: var(--text-muted);">Completed</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');

        // Update checkboxes
        setTimeout(() => {
            document.querySelectorAll('.trade-checkbox').forEach(cb => {
                cb.addEventListener('change', () => this.updateDeleteButton());
            });
        }, 100);
    }

    updateAnalytics() {
        setTimeout(() => {
            this.updateEquityCurveChart();
            this.updateWinLossChart();
            this.updateMonthlyChart();
            this.updateStrategyChart();
        }, 200);
    }

    updateNews() {
        const container = document.getElementById('newsItems');
        if (!container) return;

        container.innerHTML = this.newsItems.map(item => `
            <div class="news-item">
                <div class="news-title">${item.title}</div>
                <div class="news-content">${item.content}</div>
                <div class="news-sentiment ${item.sentiment.toLowerCase()}">${item.sentiment}</div>
            </div>
        `).join('');
    }

    initializeCharts() {
        if (typeof Chart !== 'undefined') {
            Chart.defaults.color = '#E2E8F0';
            Chart.defaults.borderColor = 'rgba(59, 130, 246, 0.2)';
        }
    }

    updatePerformanceChart() {
        const ctx = document.getElementById('performanceChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.performance) {
            this.charts.performance.destroy();
        }

        const data = this.generateSampleData();

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Portfolio Value',
                    data: data.values,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    y: { 
                        grid: { color: 'rgba(59, 130, 246, 0.1)' },
                        ticks: { color: '#E2E8F0' }
                    },
                    x: { 
                        grid: { color: 'rgba(59, 130, 246, 0.1)' },
                        ticks: { color: '#E2E8F0' }
                    }
                }
            }
        });
    }

    updateEquityCurveChart() {
        const ctx = document.getElementById('equityCurveChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.equity) this.charts.equity.destroy();

        const data = this.generateSampleData();
        this.charts.equity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Equity',
                    data: data.values,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#E2E8F0' } } },
                scales: {
                    y: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#E2E8F0' } },
                    x: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#E2E8F0' } }
                }
            }
        });
    }

    updateWinLossChart() {
        const ctx = document.getElementById('winLossChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.winLoss) this.charts.winLoss.destroy();

        const completed = this.trades.filter(t => t.exitDate);
        const wins = completed.filter(t => (t.exitPrice - t.buyPrice) > 0).length;
        const losses = completed.length - wins;

        this.charts.winLoss = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Wins', 'Losses'],
                datasets: [{
                    data: [wins || 1, losses || 1],
                    backgroundColor: ['#1FB8CD', '#B4413C']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { position: 'bottom', labels: { color: '#E2E8F0' } } }
            }
        });
    }

    updateMonthlyChart() {
        const ctx = document.getElementById('monthlyChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.monthly) this.charts.monthly.destroy();

        const data = this.generateMonthlyData();
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Monthly P&L',
                    data: data.values,
                    backgroundColor: data.values.map(v => v >= 0 ? '#1FB8CD' : '#B4413C')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#E2E8F0' } } },
                scales: {
                    y: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#E2E8F0' } },
                    x: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#E2E8F0' } }
                }
            }
        });
    }

    updateStrategyChart() {
        const ctx = document.getElementById('strategyChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.strategy) this.charts.strategy.destroy();

        this.charts.strategy = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: this.strategies.map(s => s.name),
                datasets: [{
                    label: 'Performance',
                    data: this.strategies.map(() => Math.random() * 100),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.2)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#E2E8F0' } } },
                scales: {
                    r: {
                        grid: { color: 'rgba(59, 130, 246, 0.2)' },
                        pointLabels: { color: '#E2E8F0' },
                        ticks: { color: '#E2E8F0' }
                    }
                }
            }
        });
    }

    generateSampleData() {
        const labels = [];
        const values = [];
        let current = 100000;

        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString());
            current += (Math.random() - 0.4) * 2000;
            values.push(Math.max(current, 50000));
        }

        return { labels, values };
    }

    generateMonthlyData() {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
        const values = months.map(() => (Math.random() - 0.3) * 10000);
        return { labels: months, values };
    }

    // Event handlers
    handleTradeSubmit(e) {
        e.preventDefault();
        
        const trade = {
            id: Date.now(),
            symbol: document.getElementById('symbol').value,
            orderType: document.getElementById('orderType').value,
            entryDate: document.getElementById('entryDate').value,
            buyPrice: parseFloat(document.getElementById('buyPrice').value),
            quantity: parseInt(document.getElementById('quantity').value),
            stopLoss: parseFloat(document.getElementById('stopLoss').value) || null,
            target: parseFloat(document.getElementById('target').value) || null,
            strategy: document.getElementById('strategy').value,
            account: document.getElementById('account').value,
            exitDate: '',
            exitPrice: ''
        };

        this.trades.push(trade);
        this.saveData();
        this.showNotification('Trade added successfully!', 'success');
        e.target.reset();
        this.updateInvestmentAmount();
    }

    handleAccountSubmit(e) {
        e.preventDefault();
        
        const account = {
            id: Date.now(),
            name: document.getElementById('accountName').value,
            balance: parseFloat(document.getElementById('accountBalance').value)
        };

        this.accounts.push(account);
        this.saveData();
        this.updateAccountsList();
        this.hideModal('accountModal');
        this.showNotification('Account added!', 'success');
        e.target.reset();
    }

    handleStrategySubmit(e) {
        e.preventDefault();
        
        const strategy = {
            id: Date.now(),
            name: document.getElementById('strategyName').value
        };

        this.strategies.push(strategy);
        this.saveData();
        this.updateStrategiesList();
        this.hideModal('strategyModal');
        this.showNotification('Strategy added!', 'success');
        e.target.reset();
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    deleteAccount(id) {
        if (confirm('Delete this account?')) {
            this.accounts = this.accounts.filter(a => a.id !== id);
            this.saveData();
            this.updateAccountsList();
            this.showNotification('Account deleted!', 'success');
        }
    }

    deleteStrategy(id) {
        if (confirm('Delete this strategy?')) {
            this.strategies = this.strategies.filter(s => s.id !== id);
            this.saveData();
            this.updateStrategiesList();
            this.showNotification('Strategy deleted!', 'success');
        }
    }

    closeTrade(id, price) {
        const trade = this.trades.find(t => t.id === id);
        if (trade) {
            trade.exitDate = new Date().toISOString().split('T')[0];
            trade.exitPrice = price;
            this.saveData();
            this.updateOpenTrades();
            this.showNotification('Trade closed!', 'success');
        }
    }

    exportCSV() {
        const headers = ['Symbol', 'Type', 'Entry Date', 'Buy Price', 'Quantity', 'Exit Date', 'Exit Price', 'P&L'];
        const csvContent = [
            headers.join(','),
            ...this.trades.map(t => [
                t.symbol, t.orderType, t.entryDate, t.buyPrice, t.quantity,
                t.exitDate || '', t.exitPrice || '',
                t.exitPrice ? ((t.exitPrice - t.buyPrice) * t.quantity).toFixed(2) : ''
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trades_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('CSV exported!', 'success');
    }

    importCSV() {
        const input = document.getElementById('csvFileInput');
        if (!input) return;
        
        input.click();
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const lines = e.target.result.split('\n');
                    const imported = lines.slice(1).filter(line => line.trim()).map(line => {
                        const [symbol, orderType, entryDate, buyPrice, quantity, exitDate, exitPrice] = line.split(',');
                        return {
                            id: Date.now() + Math.random(),
                            symbol, orderType, entryDate,
                            buyPrice: parseFloat(buyPrice),
                            quantity: parseInt(quantity),
                            exitDate: exitDate || '',
                            exitPrice: exitPrice ? parseFloat(exitPrice) : '',
                            strategy: 'Imported',
                            account: 'Main Account',
                            stopLoss: null,
                            target: null
                        };
                    });
                    
                    this.trades.push(...imported);
                    this.saveData();
                    this.updateAllTrades();
                    this.showNotification(`${imported.length} trades imported!`, 'success');
                } catch (error) {
                    this.showNotification('Import failed!', 'error');
                }
            };
            reader.readAsText(file);
        };
    }

    toggleSelectAll(checked) {
        document.querySelectorAll('.trade-checkbox').forEach(cb => {
            cb.checked = checked;
        });
        this.updateDeleteButton();
    }

    updateDeleteButton() {
        const selected = document.querySelectorAll('.trade-checkbox:checked');
        const btn = document.getElementById('deleteSelectedBtn');
        if (btn) btn.disabled = selected.length === 0;
    }

    deleteSelectedTrades() {
        const selected = Array.from(document.querySelectorAll('.trade-checkbox:checked'))
            .map(cb => parseInt(cb.value));
        
        if (selected.length > 0 && confirm(`Delete ${selected.length} trades?`)) {
            this.trades = this.trades.filter(t => !selected.includes(t.id));
            this.saveData();
            this.updateAllTrades();
            this.showNotification(`${selected.length} trades deleted!`, 'success');
        }
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 3000;
            padding: 1rem 2rem; border-radius: 12px; color: #E2E8F0;
            background: rgba(26, 35, 50, 0.9); backdrop-filter: blur(16px);
            border: 1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
            transform: translateX(400px); transition: transform 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
        }

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TradingJournalPro();
});