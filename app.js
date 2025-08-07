// Trading Journal Pro - Enhanced Analytics & AI-Powered Application with BULLETPROOF CSV IMPORT
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
        this.currentCloseTradeId = null;
        
        // Application constants
        this.riskFreeRate = 6.0; // 6% risk-free rate
        this.initialCapital = 1000000; // ₹10 Lakh initial capital
        this.debugMode = true;
        
        // Ensure DOM is ready before initialization
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        console.log('Initializing Trading Journal Pro...');
        this.loadData();
        this.setupEventListeners();
        this.initializeCharts();
        
        // Force switch to dashboard and ensure it's visible
        setTimeout(() => {
            this.switchTab('dashboard');
            console.log('Application initialized successfully');
        }, 100);
    }

    loadData() {
        // Load sample data from the provided JSON
        this.accounts = JSON.parse(localStorage.getItem('accounts')) || [
            {"id": 1, "name": "Paytm", "balance": 500000},
            {"id": 2, "name": "Zerodha", "balance": 750000}
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

        // Load sample trades
        this.trades = JSON.parse(localStorage.getItem('trades')) || [];

        // Market data (real-time simulation)
        this.marketData = {
            "nifty50": {"current": 24596.15, "change": 21.95, "changePercent": 0.09},
            "sensex": {"current": 80400.73, "change": -143.27, "changePercent": -0.18},
            "bankNifty": {"current": 51245.30, "change": 125.45, "changePercent": 0.25},
            "niftyIT": {"current": 43287.65, "change": -89.12, "changePercent": -0.21}
        };

        console.log('Data loaded successfully');
    }

    // ENHANCED CSV PARSER - BULLETPROOF IMPLEMENTATION
    parseCSVLine(line) {
        const result = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                result.push(current.trim().replace(/^["']|["']$/g, ''));
                current = '';
            } else {
                current += char;
            }
        }
        result.push(current.trim().replace(/^["']|["']$/g, ''));
        return result;
    }

    // Enhanced price parser for Indian number format
    parsePrice(priceStr) {
        if (!priceStr || priceStr === '') return null;
        // Remove quotes, commas, spaces from Indian format
        let cleaned = String(priceStr).replace(/[\s"',]/g, '');
        const parsed = parseFloat(cleaned) || null;
        
        if (this.debugMode && priceStr !== cleaned) {
            console.log(`Price parsing: "${priceStr}" -> "${cleaned}" -> ${parsed}`);
        }
        
        return parsed;
    }

    // Enhanced quantity parser
    parseQuantity(qtyStr) {
        if (!qtyStr || qtyStr === '') return 1;
        // Ensure quantity stays as integer, never gets mixed up
        let cleaned = String(qtyStr).replace(/[^\\d]/g, '');
        const parsed = parseInt(cleaned) || 1;
        
        if (this.debugMode && qtyStr !== cleaned) {
            console.log(`Quantity parsing: "${qtyStr}" -> "${cleaned}" -> ${parsed}`);
        }
        
        return parsed;
    }

    // Enhanced date parser with multiple format support
    parseDate(dateStr) {
        if (!dateStr || dateStr === '') return '';
        
        // Handle various date formats
        const formats = [
            /^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/,  // MM/DD/YYYY or DD/MM/YYYY or MM/DD/YY
            /^(\d{1,2})-(\d{1,2})-(\d{2,4})$/,   // MM-DD-YYYY or DD-MM-YYYY or MM-DD-YY
            /^(\d{4})-(\d{1,2})-(\d{1,2})$/,     // YYYY-MM-DD
            /^(\d{1,2})\/(\d{1,2})\/(\d{3})$/,   // Handle incomplete year like "6/18/202"
        ];

        for (let format of formats) {
            const match = dateStr.match(format);
            if (match) {
                let [, part1, part2, part3] = match;
                
                // Handle incomplete years like "202" -> "2025"
                if (part3.length === 3) {
                    part3 = "2025"; // Default to 2025 for incomplete dates
                    if (this.debugMode) {
                        console.log(`Date parsing: incomplete year "${dateStr}" defaulted to 2025`);
                    }
                }
                
                // If year is in first position (YYYY-MM-DD)
                if (part1.length === 4) {
                    return `${part1}-${part2.padStart(2, '0')}-${part3.padStart(2, '0')}`;
                }
                
                // Handle 2-digit years
                if (part3.length === 2) {
                    const year = parseInt(part3);
                    part3 = year >= 50 ? `19${part3}` : `20${part3}`;
                }
                
                // Assume MM/DD/YYYY format, convert to YYYY-MM-DD
                const month = part1.padStart(2, '0');
                const day = part2.padStart(2, '0');
                const year = part3;
                
                return `${year}-${month}-${day}`;
            }
        }
        
        if (this.debugMode) {
            console.log(`Date parsing failed for: "${dateStr}"`);
        }
        
        return dateStr; // Return as is if no format matches
    }

    // Enhanced column mapping with intelligent fallbacks
    createColumnMapping(headers) {
        const mapping = {};
        const headerMappings = {
            symbol: ['symbol', 'stock', 'scrip', 'ticker', 'instrument'],
            entryDate: ['entry date', 'entrydate', 'date', 'entry_date', 'buy date', 'purchase date'],
            exitDate: ['exit date', 'exitdate', 'sell date', 'exit_date', 'close date'],
            entryPrice: ['entry price', 'entryprice', 'buy price', 'entry_price', 'purchase price', 'price'],
            exitPrice: ['exit price', 'exitprice', 'sell price', 'exit_price', 'close price'],
            quantity: ['quantity', 'qty', 'shares', 'units', 'volume'],
            orderType: ['order type', 'ordertype', 'type', 'order_type', 'side', 'action'],
            strategy: ['strategy', 'method', 'system', 'approach'],
            account: ['account', 'broker', 'exchange', 'platform'],
            status: ['status', 'state', 'condition']
        };

        // Create mapping with fallback logic
        Object.keys(headerMappings).forEach(field => {
            const possibleHeaders = headerMappings[field];
            let foundIndex = -1;

            for (let i = 0; i < headers.length; i++) {
                const header = headers[i].toLowerCase().trim();
                if (possibleHeaders.includes(header)) {
                    foundIndex = i;
                    break;
                }
            }

            if (foundIndex !== -1) {
                mapping[field] = foundIndex;
                if (this.debugMode) {
                    console.log(`Column mapping: ${field} -> column ${foundIndex} (${headers[foundIndex]})`);
                }
            } else {
                console.warn(`Column mapping: ${field} not found in headers`, headers);
            }
        });

        return mapping;
    }

    // Validate trade data before adding
    validateTrade(tradeData) {
        const errors = [];

        if (!tradeData.symbol || tradeData.symbol.trim() === '') {
            errors.push('Symbol is required');
        }

        if (!tradeData.entryPrice || tradeData.entryPrice <= 0) {
            errors.push('Entry price must be greater than 0');
        }

        if (!tradeData.quantity || tradeData.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }

        if (!tradeData.entryDate) {
            errors.push('Entry date is required');
        }

        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }

    // Auto-create missing strategies and accounts
    ensureStrategyExists(strategyName) {
        if (!strategyName || strategyName.trim() === '') return 'Default Strategy';
        
        const exists = this.strategies.some(s => s.name.toLowerCase() === strategyName.toLowerCase());
        if (!exists) {
            const newStrategy = {
                id: this.strategies.length > 0 ? Math.max(...this.strategies.map(s => s.id)) + 1 : 1,
                name: strategyName
            };
            this.strategies.push(newStrategy);
            console.log(`Auto-created strategy: ${strategyName}`);
        }
        return strategyName;
    }

    ensureAccountExists(accountName) {
        if (!accountName || accountName.trim() === '') return 'Default Account';
        
        const exists = this.accounts.some(a => a.name.toLowerCase() === accountName.toLowerCase());
        if (!exists) {
            const newAccount = {
                id: this.accounts.length > 0 ? Math.max(...this.accounts.map(a => a.id)) + 1 : 1,
                name: accountName,
                balance: 100000 // Default balance
            };
            this.accounts.push(newAccount);
            console.log(`Auto-created account: ${accountName}`);
        }
        return accountName;
    }

    // ENHANCED CSV IMPORT WITH BULLETPROOF PARSING
    importCSV() {
        const input = document.getElementById('csvFileInput') || this.createFileInput('csv');
        input.click();
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    console.log('Starting CSV import...');
                    const csvContent = e.target.result;
                    const lines = csvContent.split('\n').filter(line => line.trim());
                    
                    if (lines.length < 2) {
                        throw new Error('CSV file must have at least 2 lines (header + data)');
                    }

                    // Parse header line with enhanced parser
                    const headerLine = lines[0];
                    const headers = this.parseCSVLine(headerLine);
                    console.log('Parsed headers:', headers);

                    // Create intelligent column mapping
                    const columnMapping = this.createColumnMapping(headers);
                    console.log('Column mapping:', columnMapping);

                    // Parse data lines
                    const importedTrades = [];
                    const errors = [];
                    
                    for (let i = 1; i < lines.length; i++) {
                        const line = lines[i].trim();
                        if (!line) continue;

                        try {
                            console.log(`Processing line ${i}: ${line}`);
                            
                            // Parse line with enhanced CSV parser
                            const values = this.parseCSVLine(line);
                            console.log(`Parsed values:`, values);
                            
                            // Extract field values using mapping
                            const rawData = {
                                symbol: columnMapping.symbol !== undefined ? values[columnMapping.symbol] : '',
                                entryDate: columnMapping.entryDate !== undefined ? values[columnMapping.entryDate] : '',
                                exitDate: columnMapping.exitDate !== undefined ? values[columnMapping.exitDate] : '',
                                entryPrice: columnMapping.entryPrice !== undefined ? values[columnMapping.entryPrice] : '',
                                exitPrice: columnMapping.exitPrice !== undefined ? values[columnMapping.exitPrice] : '',
                                quantity: columnMapping.quantity !== undefined ? values[columnMapping.quantity] : '',
                                orderType: columnMapping.orderType !== undefined ? values[columnMapping.orderType] : 'Buy',
                                strategy: columnMapping.strategy !== undefined ? values[columnMapping.strategy] : '',
                                account: columnMapping.account !== undefined ? values[columnMapping.account] : '',
                                status: columnMapping.status !== undefined ? values[columnMapping.status] : ''
                            };

                            console.log(`Raw data extracted:`, rawData);

                            // Process with enhanced parsers
                            const tradeData = {
                                id: this.getNextId() + importedTrades.length,
                                symbol: (rawData.symbol || '').trim(),
                                entryDate: this.parseDate(rawData.entryDate),
                                exitDate: this.parseDate(rawData.exitDate),
                                entryPrice: this.parsePrice(rawData.entryPrice),
                                exitPrice: rawData.exitPrice ? this.parsePrice(rawData.exitPrice) : null,
                                quantity: this.parseQuantity(rawData.quantity),
                                orderType: (rawData.orderType || 'Buy').trim(),
                                strategy: this.ensureStrategyExists((rawData.strategy || 'Imported Strategy').trim()),
                                account: this.ensureAccountExists((rawData.account || 'Main Account').trim()),
                                stopLoss: null,
                                target: null,
                                status: rawData.exitDate ? 'Closed' : 'Open'
                            };

                            console.log(`Processed trade data:`, tradeData);

                            // Validate trade
                            const validation = this.validateTrade(tradeData);
                            if (validation.isValid) {
                                importedTrades.push(tradeData);
                                console.log(`✓ Trade ${i} validated successfully`);
                            } else {
                                console.error(`✗ Trade ${i} validation failed:`, validation.errors);
                                errors.push(`Line ${i}: ${validation.errors.join(', ')}`);
                            }

                        } catch (lineError) {
                            console.error(`Error processing line ${i}:`, lineError);
                            errors.push(`Line ${i}: ${lineError.message}`);
                        }
                    }

                    // Add successfully imported trades
                    this.trades.push(...importedTrades);
                    this.saveData();
                    
                    // Update current tab content
                    this.loadTabContent(this.currentTab);
                    
                    // Show results
                    if (importedTrades.length > 0) {
                        this.showToast(`Successfully imported ${importedTrades.length} trades!`, 'success');
                        console.log(`Import completed: ${importedTrades.length} trades imported`);
                        
                        if (errors.length > 0) {
                            console.warn(`Import warnings (${errors.length} errors):`, errors);
                            this.showToast(`Imported ${importedTrades.length} trades with ${errors.length} errors. Check console for details.`, 'warning');
                        }
                    } else {
                        throw new Error('No valid trades could be imported. Check your CSV format and data.');
                    }

                } catch (error) {
                    console.error('CSV Import error:', error);
                    this.showToast(`Import failed: ${error.message}`, 'error');
                }
            };
            reader.readAsText(file);
        };
    }

    getNextId() {
        const allIds = this.trades.map(t => t.id);
        return allIds.length > 0 ? Math.max(...allIds) + 1 : 1;
    }

    saveData() {
        localStorage.setItem('accounts', JSON.stringify(this.accounts));
        localStorage.setItem('strategies', JSON.stringify(this.strategies));
        localStorage.setItem('trades', JSON.stringify(this.trades));
        
        if (this.debugMode) {
            console.log('Data saved successfully');
        }
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Tab navigation
        const navItems = document.querySelectorAll('.nav-item[data-tab]');
        console.log(`Found ${navItems.length} navigation items`);
        
        navItems.forEach((item, index) => {
            const tabName = item.getAttribute('data-tab');
            console.log(`Setting up listener for tab: ${tabName}`);
            
            item.replaceWith(item.cloneNode(true));
            const newItem = document.querySelectorAll('.nav-item[data-tab]')[index];
            
            newItem.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log(`Navigation clicked: ${tabName}`);
                this.switchTab(tabName);
            });
            
            newItem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    console.log(`Navigation keyboard activated: ${tabName}`);
                    this.switchTab(tabName);
                }
            });
            
            newItem.setAttribute('tabindex', '0');
        });

        // Form event listeners
        this.setupFormListeners();
        this.setupModalListeners();
        this.setupAnalyticsFilters();
        
        console.log('Event listeners setup completed');
    }

    setupAnalyticsFilters() {
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
                if (document.getElementById('strategyFilter')) document.getElementById('strategyFilter').value = '';
                if (document.getElementById('accountFilter')) document.getElementById('accountFilter').value = '';
                if (document.getElementById('outcomeFilter')) document.getElementById('outcomeFilter').value = '';
                this.updateAnalytics();
            });
        }

        const strategyViewToggle = document.getElementById('strategyViewToggle');
        if (strategyViewToggle) {
            strategyViewToggle.addEventListener('click', () => {
                this.toggleStrategyView();
            });
        }
    }

    setupFormListeners() {
        const tradeForm = document.getElementById('tradeForm');
        if (tradeForm) {
            tradeForm.addEventListener('submit', (e) => this.handleTradeSubmit(e));
            
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

        // Enhanced Settings Data Management
        const exportDataBtn = document.getElementById('exportDataBtn');
        const importDataBtn = document.getElementById('importDataBtn');
        const resetDataBtn = document.getElementById('resetDataBtn');

        if (exportDataBtn) exportDataBtn.addEventListener('click', () => this.exportAllData());
        if (importDataBtn) importDataBtn.addEventListener('click', () => this.importAllData());
        if (resetDataBtn) resetDataBtn.addEventListener('click', () => this.resetAllData());
    }

    setupModalListeners() {
        this.setupCloseTradeModal();
        this.setupAccountModal();
        this.setupStrategyModal();
    }

    setupCloseTradeModal() {
        const closeTradeModal = document.getElementById('closeTradeModal');
        const closeTradeModalOverlay = document.getElementById('closeTradeModalOverlay');
        const closeTradeModalClose = document.getElementById('closeTradeModalClose');
        const closeTradeForm = document.getElementById('closeTradeForm');
        const cancelCloseBtn = document.getElementById('cancelCloseBtn');

        if (closeTradeModalClose) {
            closeTradeModalClose.addEventListener('click', () => this.hideModal('closeTradeModal'));
        }

        if (closeTradeModalOverlay) {
            closeTradeModalOverlay.addEventListener('click', () => this.hideModal('closeTradeModal'));
        }

        if (cancelCloseBtn) {
            cancelCloseBtn.addEventListener('click', () => this.hideModal('closeTradeModal'));
        }

        if (closeTradeForm) {
            closeTradeForm.addEventListener('submit', (e) => this.handleCloseTradeSubmit(e));
        }

        const exitDate = document.getElementById('exitDate');
        const exitPrice = document.getElementById('exitPrice');
        const quantityToClose = document.getElementById('quantityToClose');

        if (exitDate) {
            exitDate.addEventListener('input', () => this.validateCloseTradeForm());
        }

        if (exitPrice) {
            exitPrice.addEventListener('input', () => {
                this.validateCloseTradeForm();
                this.updatePLPreview();
            });
        }

        if (quantityToClose) {
            quantityToClose.addEventListener('input', () => {
                this.validateCloseTradeForm();
                this.updatePLPreview();
            });
        }
    }

    setupAccountModal() {
        const addAccountBtn = document.getElementById('addAccountBtn');
        const accountModal = document.getElementById('accountModal');
        const closeAccountModal = document.getElementById('closeAccountModal');
        const accountOverlay = document.getElementById('accountModalOverlay');
        const cancelAccount = document.getElementById('cancelAccount');
        const accountForm = document.getElementById('accountForm');

        if (addAccountBtn) {
            addAccountBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showAccountModal();
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
    }

    setupStrategyModal() {
        const addStrategyBtn = document.getElementById('addStrategyBtn');
        const closeStrategyModal = document.getElementById('closeStrategyModal');
        const strategyOverlay = document.getElementById('strategyModalOverlay');
        const cancelStrategy = document.getElementById('cancelStrategy');
        const strategyForm = document.getElementById('strategyForm');

        if (addStrategyBtn) {
            addStrategyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.showStrategyModal();
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

    // Enhanced Close Trade Functionality
    showCloseTradeModal(tradeId) {
        const trade = this.trades.find(t => t.id === tradeId);
        if (!trade) return;

        this.currentCloseTradeId = tradeId;

        const title = document.getElementById('closeTradeTitle');
        if (title) {
            title.textContent = `Close Position: ${trade.symbol}`;
        }

        const exitDate = document.getElementById('exitDate');
        const exitPrice = document.getElementById('exitPrice');
        const quantityToClose = document.getElementById('quantityToClose');
        const availableQuantityText = document.getElementById('availableQuantityText');

        if (exitDate) {
            exitDate.value = new Date().toISOString().split('T')[0];
            exitDate.min = trade.entryDate;
        }

        if (exitPrice) {
            exitPrice.value = this.simulateCurrentPrice(trade.entryPrice).toFixed(2);
        }

        if (quantityToClose) {
            quantityToClose.value = trade.quantity;
            quantityToClose.max = trade.quantity;
        }

        if (availableQuantityText) {
            availableQuantityText.textContent = `Available: ${trade.quantity} shares`;
        }

        this.clearValidationErrors();
        this.updatePLPreview();
        this.showModal('closeTradeModal');
    }

    validateCloseTradeForm() {
        const trade = this.trades.find(t => t.id === this.currentCloseTradeId);
        if (!trade) return false;

        let isValid = true;

        const exitDate = document.getElementById('exitDate');
        const exitDateError = document.getElementById('exitDateError');
        if (exitDate && exitDateError) {
            if (!exitDate.value) {
                exitDateError.textContent = 'Exit date is required';
                exitDate.classList.add('error');
                isValid = false;
            } else if (new Date(exitDate.value) < new Date(trade.entryDate)) {
                exitDateError.textContent = 'Exit date must be on or after entry date';
                exitDate.classList.add('error');
                isValid = false;
            } else {
                exitDateError.textContent = '';
                exitDate.classList.remove('error');
                exitDate.classList.add('valid');
            }
        }

        const exitPrice = document.getElementById('exitPrice');
        const exitPriceError = document.getElementById('exitPriceError');
        if (exitPrice && exitPriceError) {
            const price = parseFloat(exitPrice.value);
            if (!exitPrice.value || price <= 0) {
                exitPriceError.textContent = 'Exit price must be greater than 0';
                exitPrice.classList.add('error');
                isValid = false;
            } else {
                exitPriceError.textContent = '';
                exitPrice.classList.remove('error');
                exitPrice.classList.add('valid');
            }
        }

        const quantityToClose = document.getElementById('quantityToClose');
        const quantityError = document.getElementById('quantityError');
        if (quantityToClose && quantityError) {
            const quantity = parseInt(quantityToClose.value);
            if (!quantityToClose.value || quantity <= 0) {
                quantityError.textContent = 'Quantity must be greater than 0';
                quantityToClose.classList.add('error');
                isValid = false;
            } else if (quantity > trade.quantity) {
                quantityError.textContent = `Quantity cannot exceed available ${trade.quantity} shares`;
                quantityToClose.classList.add('error');
                isValid = false;
            } else {
                quantityError.textContent = '';
                quantityToClose.classList.remove('error');
                quantityToClose.classList.add('valid');
            }
        }

        const submitBtn = document.getElementById('closePositionBtn');
        if (submitBtn) {
            submitBtn.disabled = !isValid;
        }

        return isValid;
    }

    clearValidationErrors() {
        const fields = ['exitDate', 'exitPrice', 'quantityToClose'];
        const errors = ['exitDateError', 'exitPriceError', 'quantityError'];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.classList.remove('error', 'valid');
            }
        });

        errors.forEach(errorId => {
            const error = document.getElementById(errorId);
            if (error) {
                error.textContent = '';
            }
        });
    }

    updatePLPreview() {
        const trade = this.trades.find(t => t.id === this.currentCloseTradeId);
        if (!trade) return;

        const exitPrice = parseFloat(document.getElementById('exitPrice').value) || 0;
        const quantity = parseInt(document.getElementById('quantityToClose').value) || 0;

        if (exitPrice > 0 && quantity > 0) {
            const multiplier = trade.orderType === 'Buy' ? 1 : -1;
            const pl = (exitPrice - trade.entryPrice) * quantity * multiplier;
            const plPercent = ((exitPrice - trade.entryPrice) / trade.entryPrice) * 100;

            const plPreviewValue = document.getElementById('expectedPL');
            const plPreviewPercent = document.getElementById('expectedPLPercent');

            if (plPreviewValue) {
                plPreviewValue.textContent = `₹${pl.toFixed(2)}`;
                plPreviewValue.className = `pl-preview-value ${pl >= 0 ? 'positive' : 'negative'}`;
            }

            if (plPreviewPercent) {
                plPreviewPercent.textContent = `(${plPercent.toFixed(2)}%)`;
            }
        }
    }

    handleCloseTradeSubmit(e) {
        e.preventDefault();
        
        if (!this.validateCloseTradeForm()) {
            this.showToast('Please fix validation errors before submitting', 'error');
            return;
        }

        const trade = this.trades.find(t => t.id === this.currentCloseTradeId);
        if (!trade) return;

        const exitDate = document.getElementById('exitDate').value;
        const exitPrice = parseFloat(document.getElementById('exitPrice').value);
        const quantityToClose = parseInt(document.getElementById('quantityToClose').value);

        const exitDetails = { exitDate, exitPrice, quantityToClose };

        this.closeTradePosition(this.currentCloseTradeId, exitDetails);
        this.hideModal('closeTradeModal');
        this.currentCloseTradeId = null;
    }

    closeTradePosition(tradeId, exitDetails) {
        const trade = this.trades.find(t => t.id === tradeId);
        if (!trade) return;

        const { exitDate, exitPrice, quantityToClose } = exitDetails;
        
        if (quantityToClose < trade.quantity) {
            // PARTIAL CLOSE
            const closedTrade = {
                ...trade,
                id: this.getNextId(),
                exitDate: exitDate,
                exitPrice: exitPrice,
                quantity: quantityToClose,
                status: 'Partially Closed',
                originalTradeId: trade.id
            };
            
            trade.quantity = trade.quantity - quantityToClose;
            trade.status = 'Open';
            this.trades.push(closedTrade);
            
            this.showToast(`Position partially closed: ${quantityToClose} shares of ${trade.symbol}`, 'success');
        } else {
            // FULL CLOSE
            trade.exitDate = exitDate;
            trade.exitPrice = exitPrice;
            trade.status = 'Closed';
            
            this.showToast(`Position fully closed: ${trade.symbol}`, 'success');
        }
        
        this.saveData();
        this.refreshAllViews();
    }

    refreshAllViews() {
        this.loadTabContent(this.currentTab);
        if (this.currentTab !== 'dashboard') {
            setTimeout(() => this.updateDashboard(), 100);
        }
    }

    showAccountModal(accountId = null) {
        const account = accountId ? this.accounts.find(a => a.id === accountId) : null;
        
        const title = document.getElementById('accountModalTitle');
        const idField = document.getElementById('accountId');
        const nameField = document.getElementById('accountName');
        const balanceField = document.getElementById('accountBalance');
        const saveBtn = document.getElementById('saveAccountBtn');

        if (title) {
            title.textContent = account ? 'Edit Account' : 'Add Account';
        }

        if (idField) {
            idField.value = account ? account.id : '';
        }

        if (nameField) {
            nameField.value = account ? account.name : '';
        }

        if (balanceField) {
            balanceField.value = account ? account.balance : '';
        }

        if (saveBtn) {
            saveBtn.textContent = account ? 'Update Account' : 'Add Account';
        }

        this.showModal('accountModal');
    }

    handleAccountSubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('accountId').value;
        const name = document.getElementById('accountName').value;
        const balance = parseFloat(document.getElementById('accountBalance').value);

        if (id) {
            const account = this.accounts.find(a => a.id == id);
            if (account) {
                account.name = name;
                account.balance = balance;
                this.showToast('Account updated successfully!', 'success');
            }
        } else {
            const newAccount = {
                id: this.accounts.length > 0 ? Math.max(...this.accounts.map(a => a.id)) + 1 : 1,
                name: name,
                balance: balance
            };
            this.accounts.push(newAccount);
            this.showToast('Account added successfully!', 'success');
        }

        this.saveData();
        this.updateAccountsList();
        this.hideModal('accountModal');
        e.target.reset();
    }

    editAccount(id) {
        this.showAccountModal(id);
    }

    deleteAccount(id) {
        const account = this.accounts.find(a => a.id === id);
        if (!account) return;

        const tradesUsingAccount = this.trades.filter(t => t.account === account.name);
        if (tradesUsingAccount.length > 0) {
            this.showToast(`Cannot delete account "${account.name}" - it's used in ${tradesUsingAccount.length} trades`, 'error');
            return;
        }

        if (confirm(`Delete account "${account.name}"?`)) {
            this.accounts = this.accounts.filter(a => a.id !== id);
            this.saveData();
            this.updateAccountsList();
            this.showToast('Account deleted successfully!', 'success');
        }
    }

    showStrategyModal(strategyId = null) {
        const strategy = strategyId ? this.strategies.find(s => s.id === strategyId) : null;
        
        const title = document.getElementById('strategyModalTitle');
        const idField = document.getElementById('strategyId');
        const nameField = document.getElementById('strategyName');
        const saveBtn = document.getElementById('saveStrategyBtn');

        if (title) {
            title.textContent = strategy ? 'Edit Strategy' : 'Add Strategy';
        }

        if (idField) {
            idField.value = strategy ? strategy.id : '';
        }

        if (nameField) {
            nameField.value = strategy ? strategy.name : '';
        }

        if (saveBtn) {
            saveBtn.textContent = strategy ? 'Update Strategy' : 'Add Strategy';
        }

        this.showModal('strategyModal');
    }

    handleStrategySubmit(e) {
        e.preventDefault();
        
        const id = document.getElementById('strategyId').value;
        const name = document.getElementById('strategyName').value;

        if (id) {
            const strategy = this.strategies.find(s => s.id == id);
            if (strategy) {
                strategy.name = name;
                this.showToast('Strategy updated successfully!', 'success');
            }
        } else {
            const newStrategy = {
                id: this.strategies.length > 0 ? Math.max(...this.strategies.map(s => s.id)) + 1 : 1,
                name: name
            };
            this.strategies.push(newStrategy);
            this.showToast('Strategy added successfully!', 'success');
        }

        this.saveData();
        this.updateStrategiesList();
        this.hideModal('strategyModal');
        e.target.reset();
    }

    editStrategy(id) {
        this.showStrategyModal(id);
    }

    deleteStrategy(id) {
        const strategy = this.strategies.find(s => s.id === id);
        if (!strategy) return;

        const tradesUsingStrategy = this.trades.filter(t => t.strategy === strategy.name);
        if (tradesUsingStrategy.length > 0) {
            this.showToast(`Cannot delete strategy "${strategy.name}" - it's used in ${tradesUsingStrategy.length} trades`, 'error');
            return;
        }

        if (confirm(`Delete strategy "${strategy.name}"?`)) {
            this.strategies = this.strategies.filter(s => s.id !== id);
            this.saveData();
            this.updateStrategiesList();
            this.showToast('Strategy deleted successfully!', 'success');
        }
    }

    exportAllData() {
        const allData = {
            accounts: this.accounts,
            strategies: this.strategies,
            trades: this.trades,
            exportDate: new Date().toISOString(),
            version: "1.0"
        };

        const jsonContent = JSON.stringify(allData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `trading_journal_backup_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showToast('All data exported successfully!', 'success');
    }

    importAllData() {
        const input = document.getElementById('jsonFileInput') || this.createFileInput('json');
        input.click();
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importedData = JSON.parse(e.target.result);
                    
                    if (!importedData.accounts || !importedData.strategies || !importedData.trades) {
                        throw new Error('Invalid data format');
                    }
                    
                    if (confirm('This will replace all existing data. Are you sure?')) {
                        this.accounts = importedData.accounts;
                        this.strategies = importedData.strategies;
                        this.trades = importedData.trades;
                        
                        this.saveData();
                        this.refreshAllViews();
                        
                        this.showToast('All data imported successfully!', 'success');
                    }
                } catch (error) {
                    console.error('Import error:', error);
                    this.showToast('Import failed! Please check file format.', 'error');
                }
            };
            reader.readAsText(file);
        };
    }

    resetAllData() {
        if (confirm('This will permanently delete all data including trades, accounts, and strategies. Are you sure?')) {
            if (confirm('This action cannot be undone. Proceed with reset?')) {
                localStorage.clear();
                this.loadData();
                this.refreshAllViews();
                this.showToast('All data has been reset to defaults!', 'warning');
            }
        }
    }

    createFileInput(accept) {
        let input = document.getElementById('csvFileInput');
        if (!input) {
            input = document.createElement('input');
            input.type = 'file';
            input.id = 'csvFileInput';
            input.accept = '.csv';
            input.style.display = 'none';
            document.body.appendChild(input);
        }
        return input;
    }

    showToast(message, type = 'info', duration = 4000) {
        const container = document.getElementById('toastContainer') || this.createToastContainer();
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconClass = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'warning': 'fa-exclamation-triangle',
            'info': 'fa-info-circle'
        }[type] || 'fa-info-circle';
        
        toast.innerHTML = `
            <div class="toast-content">
                <i class="fas ${iconClass} toast-icon"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        const closeBtn = toast.querySelector('.toast-close');
        closeBtn.addEventListener('click', () => {
            this.removeToast(toast);
        });
        
        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);
        setTimeout(() => {
            this.removeToast(toast);
        }, duration);
    }

    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
        return container;
    }

    removeToast(toast) {
        if (toast && toast.parentNode) {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    switchTab(tabName) {
        console.log(`Switching to tab: ${tabName}`);
        
        try {
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                item.classList.remove('active');
            });
            
            const activeNavItem = document.querySelector(`[data-tab="${tabName}"]`);
            if (activeNavItem) {
                activeNavItem.classList.add('active');
            }

            const allTabs = document.querySelectorAll('.tab-content');
            allTabs.forEach(content => {
                content.classList.remove('active');
                content.style.display = 'none';
            });
            
            const activeContent = document.getElementById(tabName);
            if (activeContent) {
                activeContent.classList.add('active');
                activeContent.style.display = 'block';
            }

            this.currentTab = tabName;

            setTimeout(() => {
                this.loadTabContent(tabName);
            }, 50);
            
        } catch (error) {
            console.error('Error switching tabs:', error);
        }
    }

    loadTabContent(tabName) {
        console.log(`Loading content for tab: ${tabName}`);
        
        try {
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
                default:
                    console.warn(`Unknown tab: ${tabName}`);
            }
        } catch (error) {
            console.error(`Error loading content for ${tabName}:`, error);
        }
    }

    calculatePL(trade) {
        if (!trade.exitPrice || !trade.exitDate) {
            return 0; 
        }
        
        const multiplier = trade.orderType === 'Buy' ? 1 : -1;
        return (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
    }

    calculateDaysHeld(trade) {
        if (!trade.exitDate) {
            const today = new Date();
            const entryDate = new Date(trade.entryDate);
            return Math.ceil((today - entryDate) / (1000 * 60 * 60 * 24));
        }
        
        const entryDate = new Date(trade.entryDate);
        const exitDate = new Date(trade.exitDate);
        return Math.ceil((exitDate - entryDate) / (1000 * 60 * 60 * 24));
    }

    getFilteredTrades() {
        return this.trades.filter(trade => {
            if (this.analyticsFilters.strategy && trade.strategy !== this.analyticsFilters.strategy) {
                return false;
            }
            
            if (this.analyticsFilters.account && trade.account !== this.analyticsFilters.account) {
                return false;
            }
            
            if (this.analyticsFilters.outcome && trade.exitDate && trade.exitPrice) {
                const pl = this.calculatePL(trade);
                if (this.analyticsFilters.outcome === 'win' && pl <= 0) return false;
                if (this.analyticsFilters.outcome === 'loss' && pl >= 0) return false;
                if (this.analyticsFilters.outcome === 'breakeven' && pl !== 0) return false;
            }
            
            return true;
        });
    }

    calculateEnhancedAnalyticsMetrics() {
        const filteredTrades = this.getFilteredTrades();
        const closedTrades = filteredTrades.filter(t => t.exitDate && t.exitPrice);
        const openTrades = filteredTrades.filter(t => !t.exitDate || !t.exitPrice);
        
        const totalTrades = filteredTrades.length;
        const totalClosed = closedTrades.length;
        const totalOpen = openTrades.length;
        
        const plValues = closedTrades.map(trade => this.calculatePL(trade));
        const wins = plValues.filter(pl => pl > 0);
        const losses = plValues.filter(pl => pl < 0);
        
        const totalPL = plValues.reduce((sum, pl) => sum + pl, 0);
        const avgPL = totalClosed > 0 ? totalPL / totalClosed : 0;
        const winRate = totalClosed > 0 ? (wins.length / totalClosed * 100) : 0;
        
        const grossProfits = wins.reduce((sum, pl) => sum + pl, 0);
        const grossLosses = Math.abs(losses.reduce((sum, pl) => sum + pl, 0));
        const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : 0;
        
        const bestTrade = plValues.length > 0 ? Math.max(...plValues) : 0;
        const worstTrade = plValues.length > 0 ? Math.min(...plValues) : 0;
        
        const avgWin = wins.length > 0 ? grossProfits / wins.length : 0;
        const avgLoss = losses.length > 0 ? grossLosses / losses.length : 0;
        
        const totalReturn = (totalPL / this.initialCapital) * 100;
        const roi = totalReturn;
        
        const returns = plValues.map(pl => (pl / this.initialCapital) * 100);
        const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length || 0;
        const stdDev = this.calculateStandardDeviation(returns);
        const excessReturn = avgReturn - (this.riskFreeRate / 252);
        const sharpeRatio = stdDev > 0 ? excessReturn / stdDev : 0;
        
        const equityCurve = this.generateEquityCurveValues(closedTrades);
        const maxDrawdown = this.calculateMaxDrawdown(equityCurve);
        const peakTroughValue = maxDrawdown.peakTroughValue;
        
        const holdTimes = closedTrades.map(trade => this.calculateDaysHeld(trade));
        const avgHoldTime = holdTimes.length > 0 ? holdTimes.reduce((sum, days) => sum + days, 0) / holdTimes.length : 0;
        const medianHoldTime = this.calculateMedian(holdTimes);
        
        const openPL = openTrades.reduce((sum, trade) => {
            const currentPrice = this.simulateCurrentPrice(trade.entryPrice);
            const multiplier = trade.orderType === 'Buy' ? 1 : -1;
            return sum + ((currentPrice - trade.entryPrice) * trade.quantity * multiplier);
        }, 0);
        
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
            wins: wins.length,
            losses: losses.length,
            avgWin,
            avgLoss,
            totalReturn,
            roi,
            sharpeRatio,
            maxDrawdown: maxDrawdown.percentage,
            peakTroughValue,
            avgHoldTime,
            medianHoldTime,
            grossProfits,
            grossLosses,
            openPL
        };
    }

    calculateStandardDeviation(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const squaredDifferences = values.map(val => Math.pow(val - mean, 2));
        const variance = squaredDifferences.reduce((sum, val) => sum + val, 0) / values.length;
        return Math.sqrt(variance);
    }

    calculateMedian(values) {
        if (values.length === 0) return 0;
        const sorted = [...values].sort((a, b) => a - b);
        const middle = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 
            ? (sorted[middle - 1] + sorted[middle]) / 2 
            : sorted[middle];
    }

    generateEquityCurveValues(trades) {
        if (trades.length === 0) return [this.initialCapital];
        
        const sortedTrades = trades.sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));
        const equity = [this.initialCapital];
        let running = this.initialCapital;
        
        sortedTrades.forEach(trade => {
            running += this.calculatePL(trade);
            equity.push(running);
        });
        
        return equity;
    }

    calculateMaxDrawdown(equityCurve) {
        if (equityCurve.length < 2) return { percentage: 0, peakTroughValue: 0 };
        
        let maxDrawdown = 0;
        let peakValue = equityCurve[0];
        let peakTroughValue = 0;
        
        for (let i = 1; i < equityCurve.length; i++) {
            if (equityCurve[i] > peakValue) {
                peakValue = equityCurve[i];
            }
            
            const drawdown = (peakValue - equityCurve[i]) / peakValue;
            if (drawdown > maxDrawdown) {
                maxDrawdown = drawdown;
                peakTroughValue = peakValue - equityCurve[i];
            }
        }
        
        return { percentage: maxDrawdown * 100, peakTroughValue };
    }

    calculateStrategyPerformance() {
        const filteredTrades = this.getFilteredTrades().filter(t => t.exitDate && t.strategy);
        const strategyStats = {};
        
        filteredTrades.forEach(trade => {
            const strategy = trade.strategy;
            if (!strategyStats[strategy]) {
                strategyStats[strategy] = {
                    trades: [],
                    totalPL: 0,
                    wins: 0,
                    losses: 0,
                    totalInvestment: 0
                };
            }
            
            const pl = this.calculatePL(trade);
            const investment = trade.entryPrice * trade.quantity;
            
            strategyStats[strategy].trades.push(trade);
            strategyStats[strategy].totalPL += pl;
            strategyStats[strategy].totalInvestment += investment;
            
            if (pl > 0) strategyStats[strategy].wins++;
            else if (pl < 0) strategyStats[strategy].losses++;
        });
        
        return Object.keys(strategyStats).map(strategy => {
            const stats = strategyStats[strategy];
            const totalTrades = stats.trades.length;
            const winRate = totalTrades > 0 ? (stats.wins / totalTrades * 100) : 0;
            const avgPL = totalTrades > 0 ? stats.totalPL / totalTrades : 0;
            const roi = stats.totalInvestment > 0 ? (stats.totalPL / stats.totalInvestment * 100) : 0;
            
            const plValues = stats.trades.map(t => this.calculatePL(t));
            const wins = plValues.filter(pl => pl > 0);
            const losses = plValues.filter(pl => pl < 0);
            
            const grossProfits = wins.reduce((sum, pl) => sum + pl, 0);
            const grossLosses = Math.abs(losses.reduce((sum, pl) => sum + pl, 0));
            const profitFactor = grossLosses > 0 ? grossProfits / grossLosses : 0;
            
            const bestTrade = plValues.length > 0 ? Math.max(...plValues) : 0;
            const worstTrade = plValues.length > 0 ? Math.min(...plValues) : 0;
            
            return {
                strategy,
                totalTrades,
                winRate,
                totalPL: stats.totalPL,
                avgPL,
                roi,
                profitFactor,
                bestTrade,
                worstTrade,
                wins: stats.wins,
                losses: stats.losses
            };
        });
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
                <div class="item-actions">
                    <button class="btn-edit" onclick="window.app.editAccount(${account.id})" title="Edit Account">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="window.app.deleteAccount(${account.id})" title="Delete Account">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
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
                <div class="item-actions">
                    <button class="btn-edit" onclick="window.app.editStrategy(${strategy.id})" title="Edit Strategy">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-delete" onclick="window.app.deleteStrategy(${strategy.id})" title="Delete Strategy">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    updateTradeForm() {
        console.log('Updating trade form...');
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
                        <button class="btn-primary" onclick="window.app.showCloseTradeModal(${trade.id})">
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
            
            let status = trade.status || (trade.exitDate ? 'Closed' : 'Open');
            let statusClass = status.toLowerCase().replace(/\s+/g, '-');
            
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
                    <td><span class="status-${statusClass}">${status}</span></td>
                    <td>${trade.strategy || 'N/A'}</td>
                    <td>${trade.account || 'N/A'}</td>
                    <td>
                        ${!trade.exitDate ? 
                            `<button class="btn-primary" style="padding: 0.5rem 1rem;" onclick="window.app.showCloseTradeModal(${trade.id})">Close</button>` :
                            '<span style="color: var(--text-muted);">Completed</span>'
                        }
                    </td>
                </tr>
            `;
        }).join('');

        setTimeout(() => {
            document.querySelectorAll('.trade-checkbox').forEach(cb => {
                cb.addEventListener('change', () => this.updateDeleteButton());
            });
        }, 100);
    }

    updateAnalytics() {
        console.log('Updating enhanced analytics...');
        this.updateAnalyticsFilters();
        
        const metrics = this.calculateEnhancedAnalyticsMetrics();
        this.updateEnhancedAnalyticsMetrics(metrics);
        this.updateStrategyPerformanceTable();
        this.updateRiskAnalysis(metrics);
        
        setTimeout(() => {
            this.updateEquityCurveChart();
            this.updateWinLossChart();
            this.updateMonthlyChart();
            this.updateDrawdownChart();
        }, 300);
    }

    updateAnalyticsFilters() {
        const strategyFilter = document.getElementById('strategyFilter');
        if (strategyFilter) {
            const uniqueStrategies = [...new Set(this.trades.map(t => t.strategy).filter(Boolean))];
            strategyFilter.innerHTML = '<option value="">All Strategies</option>' +
                uniqueStrategies.map(s => `<option value="${s}" ${this.analyticsFilters.strategy === s ? 'selected' : ''}>${s}</option>`).join('');
        }

        const accountFilter = document.getElementById('accountFilter');
        if (accountFilter) {
            const uniqueAccounts = [...new Set(this.trades.map(t => t.account).filter(Boolean))];
            accountFilter.innerHTML = '<option value="">All Accounts</option>' +
                uniqueAccounts.map(a => `<option value="${a}" ${this.analyticsFilters.account === a ? 'selected' : ''}>${a}</option>`).join('');
        }
    }

    updateEnhancedAnalyticsMetrics(metrics) {
        this.updateElement('analyticsTotalReturn', metrics.totalReturn.toFixed(2) + '%');
        this.updateElement('analyticsROI', metrics.roi.toFixed(2) + '%');
        
        this.updateElement('analyticsWinRate', metrics.winRate.toFixed(1) + '%');
        this.updateElement('analyticsWins', metrics.wins);
        this.updateElement('analyticsLosses', metrics.losses);
        
        this.updateElement('analyticsProfitFactor', metrics.profitFactor.toFixed(2));
        this.updateElement('analyticsGrossPL', (metrics.grossProfits / Math.max(metrics.grossLosses, 1)).toFixed(2));
        
        this.updateElement('analyticsSharpeRatio', metrics.sharpeRatio.toFixed(2));
        this.updateElement('analyticsRiskAdjReturn', (metrics.sharpeRatio * Math.sqrt(252)).toFixed(2) + '%');
        
        this.updateElement('analyticsMaxDrawdown', metrics.maxDrawdown.toFixed(2) + '%');
        this.updateElement('analyticsPeakTrough', '₹' + metrics.peakTroughValue.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        
        const avgWinLossRatio = metrics.avgLoss > 0 ? (metrics.avgWin / metrics.avgLoss).toFixed(2) : '0';
        this.updateElement('analyticsAvgWinLoss', `1:${avgWinLossRatio}`);
        this.updateElement('analyticsAvgWin', '₹' + metrics.avgWin.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        this.updateElement('analyticsAvgLoss', '₹' + metrics.avgLoss.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        
        this.updateElement('analyticsAvgHoldTime', Math.round(metrics.avgHoldTime) + ' days');
        this.updateElement('analyticsMedianHoldTime', Math.round(metrics.medianHoldTime) + ' days');
        
        this.updateElement('analyticsTotalPL', '₹' + metrics.totalPL.toLocaleString('en-IN', {minimumFractionDigits: 2}));
        this.updateElement('analyticsOpenPL', '₹' + metrics.openPL.toLocaleString('en-IN', {minimumFractionDigits: 2}));

        this.updateMetricCardColor('analyticsTotalReturn', metrics.totalReturn);
        this.updateMetricCardColor('analyticsTotalPL', metrics.totalPL);
        this.updateMetricCardColor('analyticsMaxDrawdown', -metrics.maxDrawdown);
    }

    updateStrategyPerformanceTable() {
        const container = document.getElementById('strategyPerformanceTable');
        if (!container) return;

        const strategies = this.calculateStrategyPerformance();
        
        if (strategies.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No strategy data available</p>';
            return;
        }

        container.innerHTML = `
            <table class="strategy-table">
                <thead>
                    <tr>
                        <th>Strategy</th>
                        <th>Trades</th>
                        <th>Win Rate</th>
                        <th>Total P&L</th>
                        <th>Avg P&L</th>
                        <th>ROI</th>
                        <th>Profit Factor</th>
                        <th>Best Trade</th>
                        <th>Worst Trade</th>
                    </tr>
                </thead>
                <tbody>
                    ${strategies.map(s => `
                        <tr>
                            <td><strong>${s.strategy}</strong></td>
                            <td>${s.totalTrades}</td>
                            <td>${s.winRate.toFixed(1)}%</td>
                            <td class="performance-metric ${s.totalPL >= 0 ? 'positive' : 'negative'}">₹${s.totalPL.toLocaleString()}</td>
                            <td class="performance-metric ${s.avgPL >= 0 ? 'positive' : 'negative'}">₹${s.avgPL.toFixed(2)}</td>
                            <td class="performance-metric ${s.roi >= 0 ? 'positive' : 'negative'}">${s.roi.toFixed(2)}%</td>
                            <td>${s.profitFactor.toFixed(2)}</td>
                            <td class="performance-metric positive">₹${s.bestTrade.toLocaleString()}</td>
                            <td class="performance-metric negative">₹${s.worstTrade.toLocaleString()}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    toggleStrategyView() {
        const table = document.getElementById('strategyPerformanceTable');
        const chart = document.getElementById('strategyPerformanceChart');
        const button = document.getElementById('strategyViewToggle');
        
        if (table && chart && button) {
            if (table.style.display === 'none') {
                table.style.display = 'block';
                chart.style.display = 'none';
                button.textContent = 'Chart View';
            } else {
                table.style.display = 'none';
                chart.style.display = 'block';
                button.textContent = 'Table View';
                setTimeout(() => this.updateStrategyChart(), 100);
            }
        }
    }

    updateRiskAnalysis(metrics) {
        let riskScore = 5.0;
        
        if (metrics.sharpeRatio > 1.5) riskScore -= 1;
        else if (metrics.sharpeRatio < 0.5) riskScore += 1;
        
        if (metrics.maxDrawdown > 20) riskScore += 2;
        else if (metrics.maxDrawdown < 10) riskScore -= 1;
        
        if (metrics.winRate > 70) riskScore -= 1;
        else if (metrics.winRate < 40) riskScore += 1;
        
        riskScore = Math.max(1, Math.min(10, riskScore));
        
        const volatility = (metrics.maxDrawdown / 2).toFixed(1);
        const consistency = Math.max(0, 100 - metrics.maxDrawdown).toFixed(0);
        
        this.updateElement('riskScore', riskScore.toFixed(1) + '/10');
        this.updateElement('volatilityScore', volatility + '%');
        this.updateElement('consistencyScore', consistency + '%');
        
        const riskLevelEl = document.getElementById('riskLevelIndicator');
        if (riskLevelEl) {
            const riskDot = riskLevelEl.querySelector('.risk-dot');
            const riskText = riskLevelEl.querySelector('.risk-text');
            
            if (riskDot && riskText) {
                if (riskScore <= 3) {
                    riskText.textContent = 'Low Risk';
                    riskDot.style.background = 'var(--success-color)';
                } else if (riskScore <= 7) {
                    riskText.textContent = 'Moderate Risk';
                    riskDot.style.background = 'var(--warning-color)';
                } else {
                    riskText.textContent = 'High Risk';
                    riskDot.style.background = 'var(--danger-color)';
                }
            }
        }
        
        this.generateRiskRecommendations(metrics, riskScore);
    }

    generateRiskRecommendations(metrics, riskScore) {
        const recommendations = [];
        
        if (metrics.maxDrawdown > 15) {
            recommendations.push({
                icon: 'fa-shield-alt',
                text: 'Consider implementing stricter stop-loss rules to reduce maximum drawdown'
            });
        }
        
        if (metrics.winRate < 50) {
            recommendations.push({
                icon: 'fa-target',
                text: 'Focus on improving trade selection criteria to increase win rate'
            });
        }
        
        if (metrics.profitFactor < 1.5) {
            recommendations.push({
                icon: 'fa-chart-line',
                text: 'Work on letting winners run longer to improve profit factor'
            });
        }
        
        if (metrics.avgHoldTime > 30) {
            recommendations.push({
                icon: 'fa-clock',
                text: 'Consider reducing average hold time for better capital utilization'
            });
        }
        
        if (recommendations.length === 0) {
            recommendations.push({
                icon: 'fa-star',
                text: 'Excellent trading performance! Maintain current discipline and strategy'
            });
        }
        
        const container = document.getElementById('riskRecommendations');
        if (container) {
            container.innerHTML = recommendations.map(rec => `
                <div class="recommendation-item">
                    <i class="fas ${rec.icon}"></i>
                    <span>${rec.text}</span>
                </div>
            `).join('');
        }
    }

    updateNews() {
        console.log('Updating enhanced news & AI insights...');
        this.updateMarketData();
        this.updateCuratedNews();
        this.updateAIInsights();
        this.updatePerformanceRecommendations();
    }

    updateMarketData() {
        const indices = {
            nifty50: { element: 'nifty50Value', change: 'nifty50Change', data: this.marketData.nifty50 },
            sensex: { element: 'sensexValue', change: 'sensexChange', data: this.marketData.sensex },
            bankNifty: { element: 'bankNiftyValue', change: 'bankNiftyChange', data: this.marketData.bankNifty },
            itIndex: { element: 'itIndexValue', change: 'itIndexChange', data: this.marketData.niftyIT }
        };

        Object.keys(indices).forEach(key => {
            const index = indices[key];
            this.updateElement(index.element, index.data.current.toLocaleString());
            
            const changeText = `${index.data.change >= 0 ? '+' : ''}${index.data.change.toFixed(2)} (${index.data.changePercent.toFixed(2)}%)`;
            this.updateElement(index.change, changeText);
        });
    }

    updateCuratedNews() {
        const newsContainer = document.getElementById('curatedNewsItems');
        if (!newsContainer) return;

        const curatedNews = [
            {
                title: "Indian Stock Markets Hit Record Highs Amid FII Inflows",
                content: "Foreign institutional investors poured ₹15,000 crores into Indian equities this week, driving major indices to new peaks. Banking and IT sectors led the rally with strong Q2 earnings.",
                sentiment: "bullish",
                impact: "high",
                sources: "Economic Times, Bloomberg, Reuters",
                credibility: 5,
                timestamp: "2 hours ago"
            },
            {
                title: "RBI Maintains Repo Rate at 6.5%, Signals Data-Dependent Approach",
                content: "The Reserve Bank of India kept interest rates unchanged for the eighth consecutive meeting, emphasizing inflation control while supporting growth. Market participants expect a rate cut in Q4 FY25.",
                sentiment: "neutral",
                impact: "medium",
                sources: "Business Standard, Mint, CNBC",
                credibility: 5,
                timestamp: "4 hours ago"
            },
            {
                title: "Tech Stocks Surge on AI Revolution and Cloud Computing Demand",
                content: "Indian IT companies reported strong Q2 results driven by AI adoption and digital transformation projects. TCS, Infosys, and Wipro gained 3-5% in today's session.",
                sentiment: "bullish",
                impact: "medium",
                sources: "Financial Express, Money Control",
                credibility: 4,
                timestamp: "6 hours ago"
            },
            {
                title: "Auto Sector Shows Mixed Signals Amid Festival Season Demand",
                content: "While passenger vehicle sales rose 12% YoY during the festive period, two-wheeler segment showed weakness. EV adoption continues to accelerate with government support.",
                sentiment: "neutral",
                impact: "low",
                sources: "Auto Car Professional, ET Auto",
                credibility: 4,
                timestamp: "8 hours ago"
            },
            {
                title: "Banking Sector NPA Concerns Ease as Credit Growth Remains Robust",
                content: "Indian banks reported improved asset quality with gross NPAs falling to multi-year lows. Credit growth remains healthy at 15% YoY, supporting economic expansion.",
                sentiment: "bullish",
                impact: "medium",
                sources: "Bank Bazaar, Indian Express",
                credibility: 4,
                timestamp: "10 hours ago"
            }
        ];

        newsContainer.innerHTML = curatedNews.map(news => `
            <div class="news-item">
                <div class="news-header">
                    <div class="news-title">${news.title}</div>
                    <div class="news-impact ${news.impact}">${news.impact.toUpperCase()}</div>
                </div>
                <div class="news-content">${news.content}</div>
                <div class="news-meta">
                    <div class="news-sentiment ${news.sentiment}">${news.sentiment.toUpperCase()}</div>
                    <div class="source-credibility">
                        <span class="credibility-stars">${'★'.repeat(news.credibility)}</span>
                        <span>${news.sources.split(',')[0]}</span>
                    </div>
                    <span style="color: var(--text-muted);">${news.timestamp}</span>
                </div>
            </div>
        `).join('');
    }

    updateAIInsights() {
        const metrics = this.calculateEnhancedAnalyticsMetrics();
        
        let patternText = "Your trading shows ";
        if (metrics.winRate > 60) {
            patternText += `excellent consistency with ${metrics.winRate.toFixed(1)}% win rate. `;
        } else if (metrics.winRate > 40) {
            patternText += `moderate success patterns with room for improvement. `;
        } else {
            patternText += `inconsistent patterns requiring strategy refinement. `;
        }
        
        if (metrics.profitFactor > 1.5) {
            patternText += `Strong profit factor of ${metrics.profitFactor.toFixed(2)} indicates good risk management.`;
        } else {
            patternText += `Profit factor of ${metrics.profitFactor.toFixed(2)} suggests need for better exit strategies.`;
        }
        
        let riskText = "Your trading style is ";
        if (metrics.maxDrawdown < 10) {
            riskText += "conservative with well-controlled drawdowns. Consider gradually increasing position sizes for higher returns.";
        } else if (metrics.maxDrawdown < 20) {
            riskText += "moderately aggressive with acceptable risk levels. Current approach is well-balanced for steady growth.";
        } else {
            riskText += "aggressive with high drawdown risk. Focus on risk management to preserve capital.";
        }
        
        this.updateElement('patternAnalysis', patternText);
        this.updateElement('riskAssessment', riskText);
    }

    updatePerformanceRecommendations() {
        const container = document.getElementById('performanceRecommendations');
        if (!container) return;

        const metrics = this.calculateEnhancedAnalyticsMetrics();
        const recommendations = [];

        if (metrics.winRate < 50) {
            recommendations.push({
                title: "Improve Trade Selection",
                content: "Your win rate of " + metrics.winRate.toFixed(1) + "% suggests room for improvement in entry signals. Consider using additional technical indicators or fundamental analysis.",
                impact: "high",
                expectedReturn: "+15-25% win rate improvement"
            });
        }

        if (metrics.avgHoldTime > 30) {
            recommendations.push({
                title: "Optimize Position Duration",
                content: "Average hold time of " + Math.round(metrics.avgHoldTime) + " days may be too long. Consider setting more aggressive profit targets to improve capital turnover.",
                impact: "medium",
                expectedReturn: "+20% annual returns"
            });
        }

        if (metrics.profitFactor < 1.5) {
            recommendations.push({
                title: "Enhance Profit Factor",
                content: "Current profit factor of " + metrics.profitFactor.toFixed(2) + " can be improved by letting winners run longer and cutting losses quicker.",
                impact: "high",
                expectedReturn: "+30% profit factor improvement"
            });
        }

        if (metrics.maxDrawdown > 15) {
            recommendations.push({
                title: "Reduce Maximum Drawdown",
                content: "Your maximum drawdown of " + metrics.maxDrawdown.toFixed(2) + "% is concerning. Implement stricter position sizing and stop-loss rules.",
                impact: "high",
                expectedReturn: "50% drawdown reduction"
            });
        }

        if (recommendations.length === 0) {
            recommendations.push({
                title: "Maintain Excellence",
                content: "Your trading performance is exceptional! Continue following your current strategy while staying disciplined with risk management.",
                impact: "medium",
                expectedReturn: "Consistent 20%+ annual returns"
            });
        }

        container.innerHTML = recommendations.map(rec => `
            <div class="recommendation-card">
                <div class="recommendation-header">
                    <div class="recommendation-title">${rec.title}</div>
                    <div class="impact-level ${rec.impact}">${rec.impact.toUpperCase()}</div>
                </div>
                <div class="recommendation-content">${rec.content}</div>
                <div class="expected-impact">Expected Impact: ${rec.expectedReturn}</div>
            </div>
        `).join('');
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
            return { labels: ['Start'], values: [0] };
        }

        const sortedTrades = trades.sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));
        const labels = ['Start'];
        const values = [0];
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

        const monthlyData = this.generateMonthlyDataChronological();
        
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

    updateDrawdownChart() {
        const ctx = document.getElementById('drawdownChart');
        if (!ctx || typeof Chart === 'undefined') return;

        if (this.charts.drawdown) this.charts.drawdown.destroy();

        const filteredTrades = this.getFilteredTrades().filter(t => t.exitDate);
        const drawdownData = this.generateDrawdownData(filteredTrades);

        this.charts.drawdown = new Chart(ctx, {
            type: 'line',
            data: {
                labels: drawdownData.labels,
                datasets: [{
                    label: 'Drawdown %',
                    data: drawdownData.values,
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
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
                                return value.toFixed(1) + '%';
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

        const maxValue = Math.max(...values.map(Math.abs));
        const normalizedValues = maxValue > 0 ? values.map(v => (v / maxValue) * 100) : values;

        return { labels, values: normalizedValues };
    }

    generateDrawdownData(trades) {
        if (trades.length === 0) {
            return { labels: ['Start'], values: [0] };
        }

        const sortedTrades = trades.sort((a, b) => new Date(a.exitDate) - new Date(b.exitDate));
        const equityValues = this.generateEquityCurveValues(sortedTrades);
        const labels = ['Start'];
        const drawdowns = [0];
        let peak = this.initialCapital;

        sortedTrades.forEach((trade, index) => {
            const currentEquity = equityValues[index + 1];
            if (currentEquity > peak) {
                peak = currentEquity;
            }
            const drawdown = peak > 0 ? ((peak - currentEquity) / peak) * 100 : 0;
            
            labels.push(new Date(trade.exitDate).toLocaleDateString());
            drawdowns.push(drawdown);
        });

        return { labels, values: drawdowns };
    }

    generateSampleData() {
        const labels = [];
        const values = [];
        let current = this.initialCapital;

        for (let i = 30; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString());
            current += (Math.random() - 0.4) * 5000;
            values.push(Math.max(current, this.initialCapital * 0.8));
        }

        return { labels, values };
    }

    generateMonthlyDataChronological() {
        const filteredTrades = this.getFilteredTrades().filter(t => t.exitDate);
        const monthlyPL = {};
        
        filteredTrades.forEach(trade => {
            const date = new Date(trade.exitDate);
            const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            const monthLabel = date.toLocaleDateString('en', { month: 'short', year: 'numeric' });
            
            if (!monthlyPL[monthKey]) {
                monthlyPL[monthKey] = { label: monthLabel, value: 0 };
            }
            monthlyPL[monthKey].value += this.calculatePL(trade);
        });

        const sortedMonths = Object.keys(monthlyPL).sort((a, b) => new Date(b + '-01') - new Date(a + '-01'));
        
        const labels = sortedMonths.map(key => monthlyPL[key].label);
        const values = sortedMonths.map(key => monthlyPL[key].value);

        return { labels, values };
    }

    handleTradeSubmit(e) {
        e.preventDefault();
        
        const trade = {
            id: this.getNextId(),
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
            exitPrice: null,
            status: 'Open'
        };

        this.trades.push(trade);
        this.saveData();
        this.showToast('Trade added successfully!', 'success');
        e.target.reset();
        this.updateInvestmentAmount();
    }

    exportCSV() {
        const headers = ['Symbol', 'Entry Date', 'Exit Date', 'Entry Price', 'Exit Price', 'Quantity', 'Order Type', 'Strategy', 'Account', 'P&L', 'P&L %', 'Status'];
        const csvContent = [
            headers.join(','),
            ...this.trades.map(t => {
                const pl = t.exitPrice ? this.calculatePL(t) : 0;
                const plPercent = t.exitPrice && t.entryPrice ? ((t.exitPrice - t.entryPrice) / t.entryPrice * 100).toFixed(2) : 0;
                const status = t.status || (t.exitDate ? 'Closed' : 'Open');
                
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
        
        this.showToast('CSV exported!', 'success');
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
            this.showToast(`${selected.length} trades deleted!`, 'success');
        }
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
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new TradingJournalPro();
    console.log('Trading Journal Pro - Enhanced with BULLETPROOF CSV Import Loaded Successfully');
});