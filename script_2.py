# 3. Create app.js with core functionality and no spinning loaders
js_content = '''// Trading Journal Pro - Fixed JavaScript

// Utility Functions
const $ = selector => document.querySelector(selector);
const $$ = selector => document.querySelectorAll(selector);

function formatCurrency(value) {
    return `₹${parseFloat(value).toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;
}

// Data Management
const DataStore = {
    key: 'tradingJournalProData',
    defaultData: {
        accounts: [],
        strategies: [],
        trades: []
    },
    load() {
        const stored = localStorage.getItem(this.key);
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error('Failed to parse stored data', e);
            }
        }
        return JSON.parse(JSON.stringify(this.defaultData)); // Deep copy
    },
    save() {
        localStorage.setItem(this.key, JSON.stringify(App.data));
    }
};

// Application Logic
const App = {
    data: DataStore.load(),
    init() {
        this.cacheElements();
        this.bindEvents();
        this.render();
        this.startPriceSimulation();
    },
    cacheElements() {
        this.tabButtons = $$('.tab-btn');
        this.tabContents = $$('.tab-content');
        // Dashboard elements
        this.totalAccountsEl = $('#total-accounts');
        this.totalBalanceEl = $('#total-balance');
        this.openTradesCountEl = $('#open-trades-count');
        this.totalPnlEl = $('#total-pnl');
        this.accountsListEl = $('#accounts-list');
        // Settings elements
        this.accountsTableEl = $('#accounts-table');
        this.strategiesTableEl = $('#strategies-table');
        // Trade Form elements
        this.symbolInput = $('#trade-symbol');
        this.entryDateInput = $('#trade-entry-date');
        this.buyPriceInput = $('#trade-buy-price');
        this.stopLossInput = $('#trade-stop-loss');
        this.targetInput = $('#trade-target');
        this.exitDateInput = $('#trade-exit-date');
        this.exitPriceInput = $('#trade-exit-price');
        this.orderTypeSelect = $('#trade-order-type');
        this.strategySelect = $('#trade-strategy');
        this.accountSelect = $('#trade-account');
        // Tables
        this.openTradesTableEl = $('#open-trades-table');
        this.allTradesTableEl = $('#all-trades-table');
        // Filters
        this.filterAccountSelect = $('#filter-account');
        this.filterStrategySelect = $('#filter-strategy');
        this.filterResultSelect = $('#filter-result');
        // Import / Export
        this.importCsvInput = $('#import-csv');
    },
    bindEvents() {
        // Tab navigation
        this.tabButtons.forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });
        // Settings - Add Account
        $('#add-account').addEventListener('click', () => {
            const name = $('#account-name').value.trim();
            const balance = parseFloat($('#account-balance').value);
            if (!name || isNaN(balance)) return alert('Please enter valid account details');
            this.data.accounts.push({ id: Date.now(), name, balance });
            $('#account-name').value = '';
            $('#account-balance').value = '';
            this.persistAndRender();
        });
        // Settings - Add Strategy
        $('#add-strategy').addEventListener('click', () => {
            const name = $('#strategy-name').value.trim();
            if (!name) return alert('Please enter a strategy name');
            this.data.strategies.push({ id: Date.now(), name });
            $('#strategy-name').value = '';
            this.persistAndRender();
        });
        // Add Trade
        $('#add-trade').addEventListener('click', () => {
            const symbol = this.symbolInput.value.trim().toUpperCase();
            const entryDate = this.entryDateInput.value;
            const buyPrice = parseFloat(this.buyPriceInput.value);
            const stopLoss = parseFloat(this.stopLossInput.value);
            const target = parseFloat(this.targetInput.value);
            const exitDate = this.exitDateInput.value;
            const exitPrice = parseFloat(this.exitPriceInput.value || 0);
            const orderType = this.orderTypeSelect.value;
            const strategy = this.strategySelect.value;
            const account = this.accountSelect.value;
            if (!symbol || !entryDate || isNaN(buyPrice) || !strategy || !account) {
                return alert('Please fill in required fields');
            }
            this.data.trades.push({
                id: Date.now(),
                symbol,
                entryDate,
                buyPrice,
                stopLoss,
                target,
                exitDate,
                exitPrice,
                orderType,
                strategy,
                account
            });
            // Clear Form
            this.symbolInput.value = '';
            this.entryDateInput.value = '';
            this.buyPriceInput.value = '';
            this.stopLossInput.value = '';
            this.targetInput.value = '';
            this.exitDateInput.value = '';
            this.exitPriceInput.value = '';
            this.persistAndRender();
        });
        // Import CSV Button
        $('#import-csv-btn').addEventListener('click', () => {
            this.importCsvInput.click();
        });
        this.importCsvInput.addEventListener('change', e => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = ({ target }) => {
                const csvData = target.result.trim();
                this.importCSV(csvData);
            };
            reader.readAsText(file);
        });
        // Export CSV
        $('#export-csv').addEventListener('click', () => {
            const csv = this.exportCSV();
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = Object.assign(document.createElement('a'), {
                href: url,
                download: 'trades.csv'
            });
            a.click();
            URL.revokeObjectURL(url);
        });
        // Delete Selected Trades
        $('#delete-selected').addEventListener('click', () => {
            const checkboxes = $$('#all-trades-table input[type="checkbox"]:checked');
            const idsToDelete = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
            if (!idsToDelete.length) return alert('No trades selected');
            if (!confirm('Are you sure you want to delete selected trades?')) return;
            this.data.trades = this.data.trades.filter(t => !idsToDelete.includes(t.id));
            this.persistAndRender();
        });
        // Refresh Prices (Open Trades)
        $('#refresh-prices').addEventListener('click', () => this.refreshPrices());
    },
    switchTab(tab) {
        this.tabButtons.forEach(btn => btn.classList.toggle('active', btn.dataset.tab === tab));
        this.tabContents.forEach(content => content.classList.toggle('active', content.id === tab));
        this.activeTab = tab;
    },
    persistAndRender() {
        DataStore.save();
        this.render();
    },
    render() {
        this.renderDashboard();
        this.renderSettings();
        this.renderTradesForm();
        this.renderOpenTrades();
        this.renderAllTrades();
    },
    renderDashboard() {
        const totalAccounts = this.data.accounts.length;
        const totalBalance = this.data.accounts.reduce((sum, a) => sum + a.balance, 0);
        const openTrades = this.data.trades.filter(t => !t.exitDate || !t.exitPrice);
        const openTradesCount = openTrades.length;
        const totalPnl = this.data.trades.reduce((sum, t) => {
            if (t.exitPrice && t.buyPrice) {
                return sum + ((t.exitPrice - t.buyPrice) * (t.orderType === 'Short' ? -1 : 1));
            }
            return sum;
        }, 0);
        this.totalAccountsEl.textContent = totalAccounts;
        this.totalBalanceEl.textContent = formatCurrency(totalBalance);
        this.openTradesCountEl.textContent = openTradesCount;
        this.totalPnlEl.textContent = formatCurrency(totalPnl);

        // Accounts Overview
        this.accountsListEl.innerHTML = '';
        this.data.accounts.forEach(acc => {
            const card = document.createElement('div');
            card.className = 'metric-card';
            const accOpenPnl = openTrades.filter(t => t.account === acc.name)
                .reduce((sum, t) => {
                    const livePrice = this.livePrices.get(t.symbol) || t.buyPrice;
                    const pnl = (livePrice - t.buyPrice) * (t.orderType === 'Short' ? -1 : 1);
                    return sum + pnl;
                }, 0);
            card.innerHTML = `<h4>${acc.name}</h4><div class="metric-value">${formatCurrency(acc.balance)}</div><div class="metric-value ${accOpenPnl >= 0 ? 'text-success' : 'text-danger'}">${formatCurrency(accOpenPnl)}</div>`;
            this.accountsListEl.appendChild(card);
        });
    },
    renderSettings() {
        // Accounts Table
        this.accountsTableEl.innerHTML = this.createTable(this.data.accounts, ['name', 'balance'], 'accounts');
        // Strategies Table
        this.strategiesTableEl.innerHTML = this.createTable(this.data.strategies, ['name'], 'strategies');
    },
    createTable(data, fields, type) {
        if (!data.length) return '<p>No data</p>';
        const headers = fields.map(f => `<th>${f.toUpperCase()}</th>`).join('') + '<th>ACTIONS</th>';
        const rows = data.map(d => {
            const cells = fields.map(f => `<td>${f === 'balance' ? formatCurrency(d[f]) : d[f]}</td>`).join('');
            return `<tr><td>${cells}</td><td><button class="btn btn-danger" data-id="${d.id}" data-type="${type}">Delete</button></td></tr>`;
        }).join('');
        return `<div class="table-container"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
    renderTradesForm() {
        // Populate strategy & account select options
        this.strategySelect.innerHTML = this.data.strategies.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
        this.accountSelect.innerHTML = this.data.accounts.map(a => `<option value="${a.name}">${a.name}</option>`).join('');
        // Stock suggestions
        const datalist = $('#stock-suggestions');
        datalist.innerHTML = this.nseStocks.map(s => `<option value="${s}"></option>`).join('');
    },
    renderOpenTrades() {
        const openTrades = this.data.trades.filter(t => !t.exitDate || !t.exitPrice);
        if (!openTrades.length) {
            this.openTradesTableEl.innerHTML = '<p>No open trades</p>';
            return;
        }
        const headers = `<th>Symbol</th><th>Entry Date</th><th>Buy Price</th><th>Current Price</th><th>P&L</th>`;
        const rows = openTrades.map(t => {
            const livePrice = this.livePrices.get(t.symbol) || t.buyPrice;
            const pnl = (livePrice - t.buyPrice) * (t.orderType === 'Short' ? -1 : 1);
            const pnlClass = pnl >= 0 ? 'text-success' : 'text-danger';
            return `<tr><td>${t.symbol}</td><td>${t.entryDate}</td><td>${formatCurrency(t.buyPrice)}</td><td>${formatCurrency(livePrice.toFixed(2))}</td><td class="${pnlClass}">${formatCurrency(pnl.toFixed(2))}</td></tr>`;
        }).join('');
        this.openTradesTableEl.innerHTML = `<div class="table-container"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;
    },
    renderAllTrades() {
        const trades = this.data.trades;
        if (!trades.length) {
            this.allTradesTableEl.innerHTML = '<p>No trades logged</p>';
            return;
        }
        const headers = '<th><input type="checkbox" id="select-all"></th><th>Symbol</th><th>Entry</th><th>Buy</th><th>Exit</th><th>Exit Price</th><th>Result</th><th>Strategy</th><th>Account</th><th>ACTIONS</th>';
        const rows = trades.map(t => {
            const isWin = t.exitPrice && t.exitPrice > t.buyPrice;
            const isLoss = t.exitPrice && t.exitPrice < t.buyPrice;
            const resultClass = isWin ? 'status-win' : (isLoss ? 'status-loss' : 'status-open');
            const resultText = t.exitPrice ? (isWin ? 'Win' : 'Loss') : 'Open';
            return `<tr>
                <td><input type="checkbox" data-id="${t.id}"></td>
                <td>${t.symbol}</td>
                <td>${t.entryDate}</td>
                <td>${formatCurrency(t.buyPrice)}</td>
                <td>${t.exitDate || '-'}</td>
                <td>${t.exitPrice ? formatCurrency(t.exitPrice) : '-'}</td>
                <td class="${resultClass}">${resultText}</td>
                <td>${t.strategy}</td>
                <td>${t.account}</td>
                <td><button class="btn btn-danger" data-id="${t.id}" data-type="trades">Delete</button></td>
            </tr>`;
        }).join('');
        this.allTradesTableEl.innerHTML = `<div class="table-container"><table><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table></div>`;

        // Select All Checkbox
        $('#select-all').addEventListener('change', e => {
            $$('#all-trades-table input[type="checkbox"]').forEach(cb => cb.checked = e.target.checked);
        });

        // Individual Delete buttons
        $$('#all-trades-table button[data-type="trades"]').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = parseInt(btn.dataset.id);
                this.data.trades = this.data.trades.filter(t => t.id !== id);
                this.persistAndRender();
            });
        });
    },
    startPriceSimulation() {
        this.refreshPrices();
        if (this.priceUpdateInterval) clearInterval(this.priceUpdateInterval);
        this.priceUpdateInterval = setInterval(() => this.refreshPrices(), 10000); // 10 seconds
    },
    refreshPrices() {
        // Simulate live prices by adjusting buyPrice +/- 2%
        const openTrades = this.data.trades.filter(t => !t.exitDate || !t.exitPrice);
        openTrades.forEach(t => {
            const base = t.buyPrice;
            const volatility = 0.02; // 2%
            const newPrice = base * (1 + (Math.random() - 0.5) * 2 * volatility);
            this.livePrices.set(t.symbol, newPrice);
        });
        if (this.activeTab === 'openTrades' || this.activeTab === 'dashboard') {
            this.renderDashboard();
            this.renderOpenTrades();
        }
    },
    importCSV(csv) {
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
            const cols = lines[i].split(',').map(c => c.trim());
            if (cols.length < headers.length) continue;
            const tradeData = {};
            headers.forEach((h, idx) => {
                tradeData[h] = cols[idx];
            });
            // Basic validation
            if (!tradeData.symbol) continue;
            tradeData.id = Date.now() + i;
            this.data.trades.push({
                id: tradeData.id,
                symbol: tradeData.symbol,
                entryDate: tradeData.entryDate,
                buyPrice: parseFloat(tradeData.buyPrice),
                stopLoss: parseFloat(tradeData.stopLoss),
                target: parseFloat(tradeData.target),
                exitDate: tradeData.exitDate,
                exitPrice: parseFloat(tradeData.exitPrice),
                orderType: tradeData.orderType,
                strategy: tradeData.strategy,
                account: tradeData.account
            });
        }
        this.persistAndRender();
    },
    exportCSV() {
        const headers = ['symbol','entryDate','buyPrice','stopLoss','target','exitDate','exitPrice','orderType','strategy','account'];
        const rows = this.data.trades.map(t => headers.map(h => t[h]).join(',')).join('\n');
        return `${headers.join(',')}\n${rows}`;
    }
};

// Initialize App
window.addEventListener('DOMContentLoaded', () => App.init());

// Event Delegation for dynamic buttons in Settings tables
window.addEventListener('click', e => {
    if (e.target.matches('button[data-type="accounts"], button[data-type="strategies"]')) {
        const id = parseInt(e.target.dataset.id);
        const type = e.target.dataset.type;
        App.data[type] = App.data[type].filter(item => item.id !== id);
        App.persistAndRender();
    }
});

'''

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(js_content)

print("✅ app.js created successfully")