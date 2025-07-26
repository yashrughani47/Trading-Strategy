// Trading Journal Pro - Complete JavaScript Application with Enhanced Analytics
class TradingJournalPro {
    constructor() {
        this.currentTab = 'dashboard';
        this.trades = [];
        this.accounts = [];
        this.strategies = [];
        this.charts = {};
        this.analyticsFilters = {
            strategy: '',
            account: '',
            outcome: ''
        };
        
        this.init();
    }

    init() {
        this.loadData();
        this.setupEventListeners();
        this.initializeCharts();
        this.switchTab('dashboard'); // Start with dashboard
    }

    loadData() {
        // Load sample data from the provided JSON
        this.accounts = JSON.parse(localStorage.getItem('accounts')) || [
            {"id": 1, "name": "Paytm", "balance": 100000},
            {"id": 2, "name": "Zerodha", "balance": 50000}
        ];

        this.strategies = JSON.parse(localStorage.getItem('strategies')) || [
            {"id": 1, "name": "Fusion Strategy"},
            {"id": 2, "name": "IV Strategy"},
            {"id": 3, "name": "30 SMA"},
            {"id": 4, "name": "Kumbhakaran Strategy"},
            {"id": 5, "name": "Alpha 2.0"},
            {"id": 6, "name": "ATH"},
            {"id": 7, "name": "RE Strategy (BTST)"},
            {"id": 8, "name": "Rabbit System"},
            {"id": 9, "name": "Mother Candle Shorting"}
        ];

        // Load sample trades or existing trades
        this.trades = JSON.parse(localStorage.getItem('trades')) || [
            {
                "id": 1,
                "symbol": "INDIGO",
                "entryDate": "2025-02-24",
                "exitDate": "",
                "entryPrice": 4568.00,
                "exitPrice": null,
                "quantity": 1,
                "orderType": "Buy",
                "strategy": "Fusion Strategy",
                "account": "Paytm",
                "stopLoss": null,
                "target": null
            },
            {
                "id": 2,
                "symbol": "CHOLAHLDNG",
                "entryDate": "2025-02-27",
                "exitDate": "2025-06-06",
                "entryPrice": 1634.45,
                "exitPrice": 1926.00,
                "quantity": 2,
                "orderType": "Buy",
                "strategy": "Fusion Strategy",
                "account": "Paytm",
                "stopLoss": null,
                "target": null
            },
            {
                "id": 3,
                "symbol": "NH",
                "entryDate": "2025-02-27",
                "exitDate": "2025-07-02",
                "entryPrice": 1488.00,
                "exitPrice": 1995.80,
                "quantity": 2,
                "orderType": "Buy",
                "strategy": "IV Strategy",
                "account": "Paytm",
                "stopLoss": null,
                "target": null
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
                e.stopPropagation();
                const tab = item.getAttribute('data-tab');
                console.log('Navigation clicked:', tab);
                this.switchTab(tab);
            });
        });

        // Form event listeners
        this.setupFormListeners();
        this.setupModalListeners();
        this.setupAnalyticsFilters();
    }

    setupAnalyticsFilters() {
        // Analytics filters event listeners
        const strategyFilter = document.getElementById('strategyFilter');
        const accountFilter = document.getElementById('accountFilter');
        const outcomeFilter = document.getElementById('outcomeFilter');
        const clearFilters = document.getElementById('clearFilters');

        if (strategyFilter) {
            strategyFilter.addEventListener('change', (e) => {
                this.analyticsFilters.strategy = e.target.value;
                this.updateAnalytics();
            });
        }

        if (accountFilter) {
            accountFilter.addEventListener('change', (e) => {
                this.analyticsFilters.account = e.target.value;
                this.updateAnalytics();
            });
        }

        if (outcomeFilter) {
            outcomeFilter.addEventListener('change', (e) => {
                this.analyticsFilters.outcome = e.target.value;
                this.updateAnalytics();
            });
        }

        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.analyticsFilters = { strategy: '', account: '', outcome: '' };
                document.getElementById('strategyFilter').value = '';
                document.getElementById('accountFilter').value = '';
                document.getElementById('outcomeFilter').value = '';
                this.updateAnalytics();
            });
        }
    }

    setupFormListeners() {
        // Trade form
        const tradeForm = document.getElementById('tradeForm');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => this.handleTradeSubmit(e));
            
            // Real-time investment calculation
            const entryPrice = document.getElementById('entryPrice');
            const quantity = document.getElementById('quantity');
            
            if (entryPrice && quantity) {
                entryPrice.addEventListener('input', () => this.updateInvestmentAmount());
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

        // Hide all tab contents first
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the active tab content
        const activeContent = document.getElementById(tabName);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        this.currentTab = tabName;

        // Load tab-specific content with a slight delay to ensure DOM is ready
        setTimeout(() => {
            this.loadTabContent(tabName);
        }, 100);
    }

    loadTabContent(tabName) {
        console.log('Loading content for tab:', tabName);
        
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

    // Calculate P&L for a trade
    calculatePL(trade) {
        if (!trade.exitPrice || !trade.exitDate) {
            return 0; // Open trade
        }
        
        const multiplier = trade.orderType === 'Buy' ? 1 : -1;
        return (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
    }

    // Get filtered trades based on analytics filters
    getFilteredTrades() {
        return this.trades.filter(trade => {
            // Strategy filter
            if (this.analyticsFilters.strategy && trade.strategy !== this.analyticsFilters.strategy) {
                return false;
            }
            
            // Account filter
            if (this.analyticsFilters.account && trade.account !== this.analyticsFilters.account) {
                return false;
            }
            
            // Outcome filter (only for closed trades)
            if (this.analyticsFilters.outcome && trade.exitDate && trade.exitPrice) {
                const pl = this.calculatePL(trade);
                if (this.analyticsFilters.outcome === 'win' && pl <= 0) return false;
                if (this.analyticsFilters.outcome === 'loss' && pl >= 0) return false;
                if (this.analyticsFilters.outcome === 'breakeven' && pl !== 0) return false;
            }
            
            return true;
        });
    }

    // Calculate comprehensive analytics metrics
    calculateAnalyticsMetrics() {
        const filteredTrades = this.getFilteredTrades();
        const closedTrades = filteredTrades.filter(t => t.exitDate && t.exitPrice);
        const openTrades = filteredTrades.filter(t => !t.exitDate || !t.exitPrice);
        
        const totalTrades = filteredTrades.length;
        const totalClosed = closedTrades.length;
        const totalOpen = openTrades.length;
        
        // Calculate P&L for each closed trade
        const plValues = closedTrades.map(trade => this.calculatePL(trade));
        const wins = plValues.filter(pl => pl > 0);
        const losses = plValues.filter(pl => pl < 0);
        
        const totalPL = plValues.reduce((sum, pl) => sum + pl, 0);
        const avgPL = totalClosed > 0 ? totalPL / totalClosed : 0;
        const winRate = totalClosed > 0 ? (wins.length / totalClosed * 100) : 0;
        
        // Profit Factor calculation
        const totalProfits = wins.reduce((sum, pl) => sum + pl, 0);
        const totalLosses = Math.abs(losses.reduce((sum, pl) => sum + pl, 0));
        const profitFactor = totalLosses > 0 ? totalProfits / totalLosses : 0;
        
        // Best and worst trades
        const bestTrade = plValues.length > 0 ? Math.max(...plValues) : 0;
        const worstTrade = plValues.length > 0 ? Math.min(...plValues) : 0;
        
        // Win streaks
        let currentStreak = 0;
        let maxStreak = 0;
        let tempStreak = 0;
        
        for (let i = closedTrades.length - 1; i >= 0; i--) {
            const pl = this.calculatePL(closedTrades[i]);
            if (pl > 0) {
                tempStreak++;
                if (i === closedTrades.length - 1) currentStreak = tempStreak;
            } else {
                maxStreak = Math.max(maxStreak, tempStreak);
                tempStreak = 0;
                if (i === closedTrades.length - 1) currentStreak = 0;
            }
        }
        maxStreak = Math.max(maxStreak, tempStreak);
        
        // Risk-Reward Ratio
        const avgWin = wins.length > 0 ? wins.reduce((sum, pl) => sum + pl, 0) / wins.length : 0;
        const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((sum, pl) => sum + pl, 0) / losses.length) : 0;
        const riskRewardRatio = avgLoss > 0 ? avgWin / avgLoss : 0;
        
        return {
            totalTrades,
            totalClosed,
            totalOpen,
            winRate,
            totalPL,
            avgPL,
            profitFactor,
            bestTrade,
            worstTrade,
            currentStreak,
            maxStreak,
            wins: wins.length,
            losses: losses.length,
            riskRewardRatio
        };
    }

    updateDashboard() {
        console.log('Updating dashboard...');
        const totalBalance = this.accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const totalTrades = this.trades.length;
        const completedTrades = this.trades.filter(t => t.exitDate);
        const winningTrades = completedTrades.filter(t => this.calculatePL(t) > 0);
        const winRate = completedTrades.length > 0 ? (winningTrades.length / completedTrades.length * 100).toFixed(1) : 0;
        const todayPL = this.calculateTodayPL();

        this.animateValue('totalBalance', totalBalance, '₹');
        this.animateValue('totalTrades', totalTrades);
        this.animateValue('winRate', winRate, '', '%');
        this.animateValue('todayPL', todayPL, '₹');

        this.updateRecentTrades();
        setTimeout(() => this.updatePerformanceChart(), 300);
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
                    return total + this.calculatePL(t);
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
                    <div>₹${trade.entryPrice}</div>
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${trade.quantity} shares</div>
                </div>
                <div>
                    ${trade.exitDate ? 
                        `<div style="color: ${this.calculatePL(trade) >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">
                            ₹${this.calculatePL(trade).toFixed(2)}
                        </div>` :
                        '<div class="status-open">Open</div>'
                    }
                </div>
            </div>
        `).join('');
    }

    updateSettings() {
        console.log('Updating settings...');
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
        console.log('Updating trade form...');
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
        const entryPrice = parseFloat(document.getElementById('entryPrice').value) || 0;
        const quantity = parseInt(document.getElementById('quantity').value) || 0;
        const investment = entryPrice * quantity;
        
        const display = document.getElementById('investmentAmount');
        if (display) {
            display.textContent = '₹' + investment.toLocaleString();
        }
    }

    updateOpenTrades() {
        console.log('Updating open trades...');
        const container = document.getElementById('openTradesGrid');
        if (!container) return;

        const openTrades = this.trades.filter(t => !t.exitDate || !t.exitPrice);
        
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
            const currentPrice = this.simulateCurrentPrice(trade.entryPrice);
            const pnl = (currentPrice - trade.entryPrice) * trade.quantity;
            const pnlClass = pnl >= 0 ? 'profit' : 'loss';
            
            return `
                <div class="glass-card trade-card">
                    <div class="trade-symbol">${trade.symbol}</div>
                    <div class="trade-details">
                        <div class="trade-detail">
                            <span>Entry Price</span>
                            <strong>₹${trade.entryPrice}</strong>
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
                            ${((pnl / (trade.entryPrice * trade.quantity)) * 100).toFixed(2)}%
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

    simulateCurrentPrice(entryPrice) {
        const variation = (Math.random() - 0.5) * 0.1;
        return entryPrice * (1 + variation);
    }

    updateAllTrades() {
        console.log('Updating all trades...');
        const tbody = document.getElementById('tradesTableBody');
        if (!tbody) return;

        tbody.innerHTML = this.trades.map(trade => {
            const currentPrice = trade.exitPrice || this.simulateCurrentPrice(trade.entryPrice);
            const pnl = trade.exitPrice ? 
                this.calculatePL(trade) :
                (currentPrice - trade.entryPrice) * trade.quantity;
            const status = trade.exitDate ? 'Closed' : 'Open';
            
            return `
                <tr>
                    <td><input type="checkbox" class="trade-checkbox" value="${trade.id}"></td>
                    <td>${trade.symbol}</td>
                    <td><span class="trade-type ${trade.orderType.toLowerCase()}">${trade.orderType}</span></td>
                    <td>${trade.entryDate}</td>
                    <td>₹${trade.entryPrice}</td>
                    <td>${trade.quantity}</td>
                    <td>₹${(trade.entryPrice * trade.quantity).toLocaleString()}</td>
                    <td>₹${(trade.exitPrice || currentPrice).toFixed(2)}</td>
                    <td style="color: ${pnl >= 0 ? 'var(--success-color)' : 'var(--danger-color)'};">₹${pnl.toFixed(2)}</td>
                    <td><span class="status-${status.toLowerCase()}">${status}</span></td>
                    <td>${trade.strategy || 'N/A'}</td>
                    <td>${trade.account || 'N/A'}</td>
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
        console.log('Updating analytics...');
        // Update filter dropdowns first
        this.updateAnalyticsFilters();
        
        // Calculate metrics with current filters
        const metrics = this.calculateAnalyticsMetrics();
        
        // Update metric displays
        this.updateAnalyticsMetrics(metrics);
        
        // Update charts with filtered data
        setTimeout(() => {
            this.updateEquityCurveChart();
            this.updateWinLossChart();
            this.updateMonthlyChart();
            this.updateStrategyChart();
        }, 300);
    }

    updateAnalyticsFilters() {
        // Update strategy filter dropdown
        const strategyFilter = document.getElementById('strategyFilter');
        if (strategyFilter) {
            const uniqueStrategies = [...new Set(this.trades.map(t => t.strategy).filter(Boolean))];
            strategyFilter.innerHTML = '<option value="">All Strategies</option>' +
                uniqueStrategies.map(s => `<option value="${s}" ${this.analyticsFilters.strategy === s ? 'selected' : ''}>${s}</option>`).join('');
        }

        // Update account filter dropdown
        const accountFilter = document.getElementById('accountFilter');
        if (accountFilter) {
            const uniqueAccounts = [...new Set(this.trades.map(t => t.account).filter(Boolean))];
            accountFilter.innerHTML = '<option value="">All Accounts</option>' +
                uniqueAccounts.map(a => `<option value="${a}" ${this.analyticsFilters.account === a ? 'selected' : ''}>${a}</option>`).join('');
        }
    }

    updateAnalyticsMetrics(metrics) {
        // Update all metric displays with proper formatting
        this.updateElement('analyticsTotalTrades', metrics.totalTrades);
        this.updateElement('analyticsOpenTrades', metrics.totalOpen);
        this.updateElement('analyticsClosedTrades', metrics.totalClosed);
        
        this.updateElement('analyticsWinRate', metrics.winRate.toFixed(1) + '%');
        this.updateElement('analyticsWins', metrics.wins);
        this.updateElement('analyticsLosses', metrics.losses);
        
        this.updateElement('analyticsTotalPL', '₹' + metrics.totalPL.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        this.updateElement('analyticsAvgPL', '₹' + metrics.avgPL.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        
        this.updateElement('analyticsProfitFactor', metrics.profitFactor.toFixed(2));
        this.updateElement('analyticsRiskReward', '1:' + metrics.riskRewardRatio.toFixed(2));
        
        this.updateElement('analyticsBestTrade', '₹' + metrics.bestTrade.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        this.updateElement('analyticsWorstTrade', '₹' + metrics.worstTrade.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        
        this.updateElement('analyticsWinStreak', metrics.currentStreak);
        this.updateElement('analyticsMaxWinStreak', metrics.maxStreak);

        // Update metric card colors based on values
        this.updateMetricCardColor('analyticsTotalPL', metrics.totalPL);
        this.updateMetricCardColor('analyticsBestTrade', metrics.bestTrade);
        this.updateMetricCardColor('analyticsWorstTrade', metrics.worstTrade);
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    updateMetricCardColor(elementId, value) {
        const element = document.getElementById(elementId);
        if (element) {
            element.classList.remove('positive', 'negative');
            if (value > 0) {
                element.classList.add('positive');
            } else if (value < 0) {
                element.classList.add('negative');
            }
        }
    }

    updateNews() {
        console.log('Updating news...');
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

        const filteredTrades = this.getFilteredTrades().filter(t => t.exitDate);
        const equityData = this.generateEquityCurveData(filteredTrades);

        this.charts.equity = new Chart(ctx, {
            type: 'line',
            data: {
                labels: equityData.labels,
                datasets: [{
                    label: 'Cumulative P&L',
                    data: equityData.values,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#E2E8F0' } } },
                scales: {
                    y: { 
                        grid: { color: 'rgba(59, 130, 246, 0.1)' }, 
                        ticks: { 
                            color: '#E2E8F0',
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    },
                    x: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#E2E8F0' } }
                }
            }
        });
    }

    generateEquityCurveData(trades) {
        if (trades.length === 0) {
            return { labels: [], values: [] };
        }

        const sortedTrades = trades.sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));
        const labels = [];
        const values = [];
        let cumulativePL = 0;

        sortedTrades.forEach(trade => {
            const pl = this.calculatePL(trade);
            cumulativePL += pl;
            labels.push(new Date(trade.exitDate).toLocaleDateString());
            values.push(cumulativePL);
        });

        return { labels, values };
    }

    updateWinLossChart() {
        const ctx = document.getElementById('winLossChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.winLoss) this.charts.winLoss.destroy();

        const filteredTrades = this.getFilteredTrades().filter(t => t.exitDate);
        const wins = filteredTrades.filter(t => this.calculatePL(t) > 0).length;
        const losses = filteredTrades.length - wins;

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

        const monthlyData = this.generateMonthlyData();
        this.charts.monthly = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: monthlyData.labels,
                datasets: [{
                    label: 'Monthly P&L',
                    data: monthlyData.values,
                    backgroundColor: monthlyData.values.map(v => v >= 0 ? '#1FB8CD' : '#B4413C')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { labels: { color: '#E2E8F0' } } },
                scales: {
                    y: { 
                        grid: { color: 'rgba(59, 130, 246, 0.1)' }, 
                        ticks: { 
                            color: '#E2E8F0',
                            callback: function(value) {
                                return '₹' + value.toLocaleString();
                            }
                        }
                    },
                    x: { grid: { color: 'rgba(59, 130, 246, 0.1)' }, ticks: { color: '#E2E8F0' } }
                }
            }
        });
    }

    updateStrategyChart() {
        const ctx = document.getElementById('strategyChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.strategy) this.charts.strategy.destroy();

        const strategyData = this.generateStrategyPerformanceData();

        this.charts.strategy = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: strategyData.labels,
                datasets: [{
                    label: 'P&L Performance',
                    data: strategyData.values,
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

    generateStrategyPerformanceData() {
        const filteredTrades = this.getFilteredTrades().filter(t => t.exitDate && t.strategy);
        const strategyGroups = {};
        
        filteredTrades.forEach(trade => {
            if (!strategyGroups[trade.strategy]) {
                strategyGroups[trade.strategy] = [];
            }
            strategyGroups[trade.strategy].push(this.calculatePL(trade));
        });

        const labels = Object.keys(strategyGroups);
        const values = labels.map(strategy => {
            const pls = strategyGroups[strategy];
            return pls.reduce((sum, pl) => sum + pl, 0);
        });

        // Normalize values for radar chart
        const maxValue = Math.max(...values.map(Math.abs));
        const normalizedValues = maxValue > 0 ? values.map(v => (v / maxValue) * 100) : values;

        return { labels, values: normalizedValues };
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
        const filteredTrades = this.getFilteredTrades().filter(t => t.exitDate);
        const monthlyPL = {};
        
        filteredTrades.forEach(trade => {
            const month = new Date(trade.exitDate).toLocaleDateString('en', { month: 'short', year: 'numeric' });
            if (!monthlyPL[month]) {
                monthlyPL[month] = 0;
            }
            monthlyPL[month] += this.calculatePL(trade);
        });

        const labels = Object.keys(monthlyPL);
        const values = Object.values(monthlyPL);

        return { labels, values };
    }

    // Event handlers
    handleTradeSubmit(e) {
        e.preventDefault();
        
        const trade = {
            id: Date.now(),
            symbol: document.getElementById('symbol').value,
            orderType: document.getElementById('orderType').value,
            entryDate: document.getElementById('entryDate').value,
            entryPrice: parseFloat(document.getElementById('entryPrice').value),
            quantity: parseInt(document.getElementById('quantity').value),
            stopLoss: parseFloat(document.getElementById('stopLoss').value) || null,
            target: parseFloat(document.getElementById('target').value) || null,
            strategy: document.getElementById('strategy').value,
            account: document.getElementById('account').value,
            exitDate: '',
            exitPrice: null
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
        const headers = ['Symbol', 'Entry Date', 'Exit Date', 'Entry Price', 'Exit Price', 'Quantity', 'Order Type', 'Strategy', 'Account', 'P&L', 'P&L %', 'Status'];
        const csvContent = [
            headers.join(','),
            ...this.trades.map(t => {
                const pl = t.exitPrice ? this.calculatePL(t) : 0;
                const plPercent = t.exitPrice && t.entryPrice ? ((t.exitPrice - t.entryPrice) / t.entryPrice * 100).toFixed(2) : 0;
                const status = t.exitDate ? 'Closed' : 'Open';
                
                return [
                    t.symbol, t.entryDate, t.exitDate || '', t.entryPrice, t.exitPrice || '',
                    t.quantity, t.orderType, t.strategy || '', t.account || '',
                    pl.toFixed(2), plPercent + '%', status
                ].join(',');
            })
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
                    const headers = lines[0].toLowerCase().split(',');
                    
                    const imported = lines.slice(1).filter(line => line.trim()).map(line => {
                        const values = line.split(',');
                        const tradeData = {};
                        
                        // Map CSV columns to trade object
                        headers.forEach((header, index) => {
                            const cleanHeader = header.trim();
                            const value = values[index] ? values[index].trim() : '';
                            
                            switch (cleanHeader) {
                                case 'symbol':
                                    tradeData.symbol = value;
                                    break;
                                case 'entry date':
                                    tradeData.entryDate = this.parseDate(value);
                                    break;
                                case 'exit date':
                                    tradeData.exitDate = value ? this.parseDate(value) : '';
                                    break;
                                case 'entry price':
                                    tradeData.entryPrice = parseFloat(value) || 0;
                                    break;
                                case 'exit price':
                                    tradeData.exitPrice = value ? parseFloat(value) : null;
                                    break;
                                case 'quantity':
                                    tradeData.quantity = parseInt(value) || 0;
                                    break;
                                case 'order type':
                                    tradeData.orderType = value || 'Buy';
                                    break;
                                case 'strategy':
                                    tradeData.strategy = value || 'Imported';
                                    break;
                                case 'account':
                                    tradeData.account = value || 'Main Account';
                                    break;
                            }
                        });

                        // Auto-calculate P&L if not provided
                        if (!tradeData.exitPrice && values.some(v => v.includes('P&L'))) {
                            const plValue = values.find(v => v.includes('₹') || (!isNaN(parseFloat(v)) && parseFloat(v) !== 0));
                            if (plValue) {
                                const pl = parseFloat(plValue.replace(/[₹,\s]/g, ''));
                                if (!isNaN(pl) && tradeData.quantity && tradeData.entryPrice) {
                                    tradeData.exitPrice = tradeData.entryPrice + (pl / tradeData.quantity);
                                }
                            }
                        }

                        return {
                            id: Date.now() + Math.random(),
                            ...tradeData,
                            stopLoss: null,
                            target: null
                        };
                    });
                    
                    // Add new strategies and accounts automatically
                    const newStrategies = [...new Set(imported.map(t => t.strategy).filter(s => s && !this.strategies.some(existing => existing.name === s)))];
                    const newAccounts = [...new Set(imported.map(t => t.account).filter(a => a && !this.accounts.some(existing => existing.name === a)))];
                    
                    newStrategies.forEach(strategyName => {
                        this.strategies.push({
                            id: Date.now() + Math.random(),
                            name: strategyName
                        });
                    });
                    
                    newAccounts.forEach(accountName => {
                        this.accounts.push({
                            id: Date.now() + Math.random(),
                            name: accountName,
                            balance: 100000 // Default balance
                        });
                    });
                    
                    this.trades.push(...imported);
                    this.saveData();
                    this.updateAllTrades();
                    
                    // Update analytics immediately after import
                    if (this.currentTab === 'analytics') {
                        this.updateAnalytics();
                    }
                    
                    this.showNotification(`${imported.length} trades imported successfully!`, 'success');
                } catch (error) {
                    console.error('Import error:', error);
                    this.showNotification('Import failed! Please check CSV format.', 'error');
                }
            };
            reader.readAsText(file);
        };
    }

    parseDate(dateStr) {
        if (!dateStr) return '';
        
        // Handle various date formats
        const formats = [
            /(\d{1,2})\/(\d{1,2})\/(\d{4})/,  // MM/DD/YYYY or DD/MM/YYYY
            /(\d{1,2})-(\d{1,2})-(\d{4})/,   // MM-DD-YYYY or DD-MM-YYYY
            /(\d{4})-(\d{1,2})-(\d{1,2})/,   // YYYY-MM-DD
        ];

        for (let format of formats) {
            const match = dateStr.match(format);
            if (match) {
                let [, part1, part2, part3] = match;
                
                // If year is in first position (YYYY-MM-DD)
                if (part1.length === 4) {
                    return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
                }
                
                // Assume MM/DD/YYYY format, convert to YYYY-MM-DD
                const month = part1.padStart(2, '0');
                const day = part2.padStart(2, '0');
                const year = part3;
                
                return `${year}-${month}-${day}`;
            }
        }
        
        return dateStr; // Return as is if no format matches
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
            border: 1px solid ${type === 'success' ? 'rgba(16, 185, 129, 0.5)' : type === 'error' ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.3)'};
            transform: translateX(400px); transition: transform 0.3s ease;
        `;
        
        if (type === 'success') {
            notification.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.3)';
        } else if (type === 'error') {
            notification.style.boxShadow = '0 0 20px rgba(239, 68, 68, 0.3)';
        }

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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