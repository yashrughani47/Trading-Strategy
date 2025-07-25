# Let me create the three files again with a completely simplified and working version
# This will focus on core functionality without any complex async operations that could cause hanging

# 1. Create index.html
html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trading Journal Pro - Fixed</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <div class="app-container">
        <header class="app-header">
            <h1>Trading Journal Pro</h1>
            <p class="subtitle">Ultimate NSE Trading Platform - Fixed Version</p>
        </header>
        
        <nav class="tab-nav">
            <button class="tab-btn active" data-tab="dashboard">📊 Dashboard</button>
            <button class="tab-btn" data-tab="settings">⚙️ Settings</button>
            <button class="tab-btn" data-tab="trades">📈 Trades</button>
            <button class="tab-btn" data-tab="openTrades">🔄 Open Trades</button>
            <button class="tab-btn" data-tab="allTrades">📋 All Trades</button>
            <button class="tab-btn" data-tab="analytics">📊 Analytics</button>
            <button class="tab-btn" data-tab="news">📰 News & AI</button>
        </nav>

        <main class="app-main">
            <!-- Dashboard Tab -->
            <div id="dashboard" class="tab-content active">
                <div class="dashboard-grid">
                    <div class="stat-card">
                        <h3>Total Accounts</h3>
                        <div class="stat-value" id="total-accounts">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total Balance</h3>
                        <div class="stat-value" id="total-balance">₹0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Open Trades</h3>
                        <div class="stat-value" id="open-trades-count">0</div>
                    </div>
                    <div class="stat-card">
                        <h3>Total P&L</h3>
                        <div class="stat-value" id="total-pnl">₹0</div>
                    </div>
                </div>
                
                <div class="accounts-overview">
                    <h3>Accounts Overview</h3>
                    <div id="accounts-list"></div>
                </div>
            </div>

            <!-- Settings Tab -->
            <div id="settings" class="tab-content">
                <div class="settings-section">
                    <h3>Account Management</h3>
                    <div class="form-group">
                        <input type="text" id="account-name" placeholder="Account Name">
                        <input type="number" id="account-balance" placeholder="Initial Balance">
                        <button id="add-account" class="btn btn-primary">Add Account</button>
                    </div>
                    <div id="accounts-table"></div>
                </div>
                
                <div class="settings-section">
                    <h3>Strategy Management</h3>
                    <div class="form-group">
                        <input type="text" id="strategy-name" placeholder="Strategy Name">
                        <button id="add-strategy" class="btn btn-primary">Add Strategy</button>
                    </div>
                    <div id="strategies-table"></div>
                </div>
            </div>

            <!-- Trades Tab -->
            <div id="trades" class="tab-content">
                <div class="trade-form">
                    <h3>Add New Trade</h3>
                    <div class="form-grid">
                        <input type="text" id="trade-symbol" placeholder="Symbol (e.g., RELIANCE.NS)" list="stock-suggestions">
                        <datalist id="stock-suggestions"></datalist>
                        <input type="date" id="trade-entry-date">
                        <input type="number" id="trade-buy-price" placeholder="Buy Price" step="0.01">
                        <input type="number" id="trade-stop-loss" placeholder="Stop Loss" step="0.01">
                        <input type="number" id="trade-target" placeholder="Target" step="0.01">
                        <input type="date" id="trade-exit-date">
                        <input type="number" id="trade-exit-price" placeholder="Exit Price (optional)" step="0.01">
                        <select id="trade-order-type">
                            <option value="Long">Long</option>
                            <option value="Short">Short</option>
                        </select>
                        <select id="trade-strategy"></select>
                        <select id="trade-account"></select>
                        <button id="add-trade" class="btn btn-primary">Add Trade</button>
                    </div>
                </div>
            </div>

            <!-- Open Trades Tab -->
            <div id="openTrades" class="tab-content">
                <div class="section-header">
                    <h3>Open Trades</h3>
                    <button id="refresh-prices" class="btn btn-secondary">🔄 Refresh Prices</button>
                </div>
                <div id="open-trades-table"></div>
            </div>

            <!-- All Trades Tab -->
            <div id="allTrades" class="tab-content">
                <div class="section-header">
                    <h3>All Trades</h3>
                    <div class="actions">
                        <button id="export-csv" class="btn btn-secondary">📥 Export CSV</button>
                        <input type="file" id="import-csv" accept=".csv" style="display: none;">
                        <button id="import-csv-btn" class="btn btn-secondary">📤 Import CSV</button>
                        <button id="delete-selected" class="btn btn-danger">🗑️ Delete Selected</button>
                    </div>
                </div>
                
                <div class="filters">
                    <select id="filter-account">
                        <option value="">All Accounts</option>
                    </select>
                    <select id="filter-strategy">
                        <option value="">All Strategies</option>
                    </select>
                    <select id="filter-result">
                        <option value="">All Results</option>
                        <option value="win">Wins Only</option>
                        <option value="loss">Losses Only</option>
                    </select>
                </div>
                
                <div id="all-trades-table"></div>
            </div>

            <!-- Analytics Tab -->
            <div id="analytics" class="tab-content">
                <div class="analytics-grid">
                    <div class="chart-container">
                        <canvas id="equity-curve-chart"></canvas>
                    </div>
                    <div class="chart-container">
                        <canvas id="win-loss-chart"></canvas>
                    </div>
                </div>
                
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h4>Win Rate</h4>
                        <div class="metric-value" id="win-rate">0%</div>
                    </div>
                    <div class="metric-card">
                        <h4>Profit Factor</h4>
                        <div class="metric-value" id="profit-factor">0</div>
                    </div>
                    <div class="metric-card">
                        <h4>Max Drawdown</h4>
                        <div class="metric-value" id="max-drawdown">₹0</div>
                    </div>
                    <div class="metric-card">
                        <h4>Expectancy</h4>
                        <div class="metric-value" id="expectancy">₹0</div>
                    </div>
                </div>
            </div>

            <!-- News & AI Tab -->
            <div id="news" class="tab-content">
                <div class="ai-insights">
                    <h3>AI Trading Insights</h3>
                    <div id="ai-insights-content"></div>
                </div>
                
                <div class="trading-tips">
                    <h3>Trading Tips</h3>
                    <div id="trading-tips-content"></div>
                </div>
            </div>
        </main>
    </div>

    <script src="app.js"></script>
</body>
</html>'''

# Save to file
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(html_content)

print("✅ index.html created successfully")