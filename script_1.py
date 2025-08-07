# Create an enhanced CSV parsing solution that handles the specific issues

enhanced_csv_parser = '''
// ENHANCED CSV PARSER - Bulletproof CSV Import with Proper Column Mapping

parseCSV(csv) {
    console.log('🔍 Starting enhanced CSV parsing...');
    
    const lines = csv.trim().split('\\n');
    if (lines.length < 2) {
        throw new Error('CSV file must contain at least a header row and one data row');
    }
    
    // Parse headers with enhanced cleaning
    const headers = this.parseCSVLine(lines[0]).map(h => 
        h.trim()
            .replace(/[\\r\\n"]/g, '')
            .replace(/&amp;/g, '&')
            .toLowerCase()
    );
    
    console.log('📋 Parsed headers:', headers);
    
    // Create header mapping for flexible column matching
    const headerMap = this.createHeaderMapping(headers);
    console.log('🗺️ Header mapping:', headerMap);
    
    const trades = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 1; i < lines.length; i++) {
        try {
            const line = lines[i].trim();
            if (!line) continue; // Skip empty lines
            
            const values = this.parseCSVLine(line);
            if (values.length < headers.length - 2) {
                console.warn(`⚠️ Row ${i}: Insufficient columns (${values.length}/${headers.length})`);
                continue;
            }
            
            // Create row object with proper mapping
            const rowData = {};
            headers.forEach((header, index) => {
                rowData[header] = values[index] || '';
            });
            
            console.log(`📊 Row ${i} data:`, rowData);
            
            // Extract and validate trade data with fallback logic
            const trade = this.extractTradeFromRow(rowData, headerMap, i);
            
            if (this.validateTradeData(trade)) {
                // Auto-add new strategies and accounts
                this.ensureStrategyExists(trade.strategy);
                this.ensureAccountExists(trade.account);
                
                trades.push(trade);
                successCount++;
                console.log(`✅ Row ${i}: Successfully parsed ${trade.symbol}`);
            } else {
                console.warn(`⚠️ Row ${i}: Failed validation for ${trade.symbol || 'Unknown'}`);
                errorCount++;
            }
            
        } catch (error) {
            console.error(`❌ Error parsing row ${i}:`, error);
            errorCount++;
        }
    }
    
    console.log(`📈 CSV Import Results: ${successCount} success, ${errorCount} errors`);
    
    if (trades.length === 0) {
        throw new Error('No valid trades found in CSV file');
    }
    
    return trades;
}

createHeaderMapping(headers) {
    // Create flexible mapping for different header variations
    const mapping = {};
    
    headers.forEach((header, index) => {
        const cleanHeader = header.toLowerCase().trim();
        
        // Map various symbol column names
        if (cleanHeader.includes('symbol') || cleanHeader.includes('stock') || cleanHeader.includes('scrip')) {
            mapping.symbol = index;
        }
        // Map entry date variations
        else if (cleanHeader.includes('entry') && cleanHeader.includes('date')) {
            mapping.entryDate = index;
        }
        // Map exit date variations
        else if (cleanHeader.includes('exit') && cleanHeader.includes('date')) {
            mapping.exitDate = index;
        }
        // Map entry price variations
        else if (cleanHeader.includes('entry') && cleanHeader.includes('price')) {
            mapping.entryPrice = index;
        }
        // Map exit price variations
        else if (cleanHeader.includes('exit') && cleanHeader.includes('price')) {
            mapping.exitPrice = index;
        }
        // Map quantity variations
        else if (cleanHeader.includes('quantity') || cleanHeader.includes('qty')) {
            mapping.quantity = index;
        }
        // Map order type variations
        else if (cleanHeader.includes('order') && cleanHeader.includes('type')) {
            mapping.orderType = index;
        }
        // Map strategy variations
        else if (cleanHeader.includes('strategy')) {
            mapping.strategy = index;
        }
        // Map account variations
        else if (cleanHeader.includes('account') || cleanHeader.includes('broker')) {
            mapping.account = index;
        }
    });
    
    return mapping;
}

extractTradeFromRow(rowData, headerMap, rowIndex) {
    const headers = Object.keys(rowData);
    
    // Use header mapping with fallbacks
    const getFieldValue = (mappingKey, fallbackNames = []) => {
        // Try mapped index first
        if (headerMap[mappingKey] !== undefined) {
            const value = headers[headerMap[mappingKey]];
            if (value && rowData[value] !== undefined) {
                return rowData[value];
            }
        }
        
        // Try fallback names
        for (const fallback of fallbackNames) {
            const found = headers.find(h => 
                h.toLowerCase().includes(fallback.toLowerCase())
            );
            if (found && rowData[found]) {
                return rowData[found];
            }
        }
        
        return '';
    };
    
    const trade = {
        symbol: getFieldValue('symbol', ['symbol', 'stock', 'scrip']),
        entryDate: this.parseDate(getFieldValue('entryDate', ['entry date', 'buy date', 'purchase date'])),
        exitDate: this.parseDate(getFieldValue('exitDate', ['exit date', 'sell date', 'close date'])),
        entryPrice: this.parsePrice(getFieldValue('entryPrice', ['entry price', 'buy price', 'purchase price'])),
        exitPrice: this.parsePrice(getFieldValue('exitPrice', ['exit price', 'sell price', 'close price'])),
        quantity: this.parseQuantity(getFieldValue('quantity', ['quantity', 'qty', 'shares'])),
        orderType: getFieldValue('orderType', ['order type', 'type', 'buy sell']) || 'Buy',
        strategy: getFieldValue('strategy', ['strategy', 'method', 'approach']) || 'Imported Strategy',
        account: getFieldValue('account', ['account', 'broker', 'platform']) || 'Imported Account',
        stopLoss: null,
        target: null
    };
    
    console.log(`🔄 Row ${rowIndex} extracted:`, {
        symbol: trade.symbol,
        entryPrice: trade.entryPrice,
        quantity: trade.quantity,
        strategy: trade.strategy
    });
    
    return trade;
}

parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        const nextChar = line[i + 1];
        
        if (char === '"') {
            if (inQuotes && nextChar === '"') {
                // Handle escaped quotes
                current += '"';
                i += 2;
                continue;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
                continue;
            }
        }
        
        if (char === ',' && !inQuotes) {
            // End of field
            result.push(current.trim());
            current = '';
            i++;
            continue;
        }
        
        // Regular character
        current += char;
        i++;
    }
    
    // Add the last field
    result.push(current.trim());
    
    // Clean up each field
    return result.map(field => {
        return field
            .replace(/^["']|["']$/g, '') // Remove surrounding quotes
            .replace(/""/g, '"') // Unescape quotes
            .trim();
    });
}

parsePrice(priceStr) {
    if (!priceStr || priceStr === '' || priceStr === '-') return null;
    
    // Handle various price formats
    let cleaned = String(priceStr)
        .replace(/[\\s"']/g, '') // Remove spaces and quotes
        .replace(/,/g, '') // Remove Indian comma separators
        .replace(/[^\\d.-]/g, ''); // Keep only digits, decimal point, and minus
    
    const parsed = parseFloat(cleaned);
    const result = isNaN(parsed) ? null : parsed;
    
    console.log(`💰 Price parsing: "${priceStr}" -> "${cleaned}" -> ${result}`);
    return result;
}

parseQuantity(qtyStr) {
    if (!qtyStr || qtyStr === '' || qtyStr === '-') return 1;
    
    let cleaned = String(qtyStr)
        .replace(/[\\s"',]/g, '') // Remove spaces, quotes, commas
        .replace(/[^\\d]/g, ''); // Keep only digits
    
    const parsed = parseInt(cleaned);
    const result = isNaN(parsed) || parsed <= 0 ? 1 : parsed;
    
    console.log(`📊 Quantity parsing: "${qtyStr}" -> "${cleaned}" -> ${result}`);
    return result;
}

parseDate(dateStr) {
    if (!dateStr || dateStr === '' || dateStr === '-') return '';
    
    const cleanStr = String(dateStr).trim().replace(/[\\s"']/g, '');
    console.log(`📅 Date parsing: "${dateStr}" -> "${cleanStr}"`);
    
    // Handle various date formats
    const formats = [
        // MM/DD/YYYY or DD/MM/YYYY
        /^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})$/,
        // MM-DD-YYYY or DD-MM-YYYY  
        /^(\\d{1,2})-(\\d{1,2})-(\\d{4})$/,
        // YYYY-MM-DD
        /^(\\d{4})-(\\d{1,2})-(\\d{1,2})$/,
        // Handle incomplete years like 6/18/202
        /^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{3})$/
    ];
    
    for (let i = 0; i < formats.length; i++) {
        const format = formats[i];
        const match = cleanStr.match(format);
        
        if (match) {
            let year, month, day;
            
            if (i === 2) {
                // YYYY-MM-DD format
                [, year, month, day] = match;
            } else if (i === 3) {
                // Handle incomplete year (assume 2025)
                [, month, day] = match;
                year = '2025';
            } else {
                // MM/DD/YYYY or DD/MM/YYYY format
                [, month, day, year] = match;
                
                // Smart date interpretation (assume DD/MM if day > 12)
                if (parseInt(month) > 12) {
                    [month, day] = [day, month];
                }
            }
            
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
                const result = date.toISOString().split('T')[0];
                console.log(`✅ Date parsed successfully: ${result}`);
                return result;
            }
        }
    }
    
    // If no format matches, try JavaScript's Date constructor
    try {
        const date = new Date(cleanStr);
        if (!isNaN(date.getTime()) && date.getFullYear() > 1900) {
            const result = date.toISOString().split('T')[0];
            console.log(`✅ Date parsed with JS Date: ${result}`);
            return result;
        }
    } catch (e) {
        console.warn(`⚠️ Date parsing failed: ${cleanStr}`);
    }
    
    console.warn(`⚠️ Could not parse date: "${dateStr}"`);
    return '';
}

validateTradeData(trade) {
    const isValid = (
        trade.symbol && 
        trade.symbol.length > 0 &&
        trade.entryDate &&
        trade.entryPrice !== null &&
        trade.entryPrice > 0 &&
        trade.quantity > 0 &&
        trade.strategy &&
        trade.account
    );
    
    if (!isValid) {
        console.warn('❌ Trade validation failed:', {
            hasSymbol: !!trade.symbol,
            hasEntryDate: !!trade.entryDate,
            hasValidEntryPrice: trade.entryPrice !== null && trade.entryPrice > 0,
            hasValidQuantity: trade.quantity > 0,
            hasStrategy: !!trade.strategy,
            hasAccount: !!trade.account
        });
    }
    
    return isValid;
}
'''

print("🚀 Enhanced CSV Parser Created with:")
print("✅ Robust quoted field handling")
print("✅ Flexible header mapping with fallbacks") 
print("✅ Enhanced number parsing for Indian format")
print("✅ Multi-format date parsing")
print("✅ Field validation and error recovery")
print("✅ Detailed logging for debugging")
print("✅ Smart column matching logic")