# Create a Python backend script for yfinance data fetching
python_backend_script = '''
#!/usr/bin/env python3
"""
NSE Stock Price API Server
Fetches real-time stock data from yfinance for Trading Journal Pro
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import yfinance as yf
import json
from datetime import datetime, timedelta
import logging
from threading import Timer
import os

app = Flask(__name__)
CORS(app)  # Enable CORS for all domains

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Global stock data cache
stock_cache = {}
last_update = None

# NSE Stock symbols (Top 50 most traded)
NSE_STOCKS = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "BHARTIARTL.NS", "ICICIBANK.NS",
    "SBIN.NS", "INFY.NS", "LT.NS", "ITC.NS", "HCLTECH.NS",
    "BAJFINANCE.NS", "HINDUNILVR.NS", "KOTAKBANK.NS", "ASIANPAINT.NS",
    "MARUTI.NS", "TITAN.NS", "SUNPHARMA.NS", "ULTRACEMCO.NS",
    "AXISBANK.NS", "NESTLEIND.NS", "WIPRO.NS", "ADANIENT.NS",
    "BAJAJFINSV.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "M&M.NS",
    "TECHM.NS", "TATAMOTORS.NS", "COALINDIA.NS", "DRREDDY.NS",
    "JSWSTEEL.NS", "GRASIM.NS", "BRITANNIA.NS", "CIPLA.NS",
    "EICHERMOT.NS", "APOLLOHOSP.NS", "BPCL.NS", "HINDALCO.NS",
    "DIVISLAB.NS", "HEROMOTOCO.NS", "SHREECEM.NS", "BAJAJ-AUTO.NS",
    "ADANIPORTS.NS", "TATASTEEL.NS", "INDUSINDBK.NS", "UPL.NS",
    "NESTLEIND.NS", "HDFCLIFE.NS", "SBILIFE.NS"
]

def fetch_stock_data(symbols):
    """Fetch stock data from yfinance"""
    stock_data = {}
    successful_fetches = 0
    
    logger.info(f"Fetching data for {len(symbols)} stocks...")
    
    for symbol in symbols:
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period="2d")
            
            if not hist.empty and len(hist) > 0:
                current_price = hist['Close'].iloc[-1]
                prev_close = hist['Close'].iloc[-2] if len(hist) > 1 else current_price
                
                change = current_price - prev_close
                change_percent = (change / prev_close) * 100 if prev_close != 0 else 0
                
                stock_data[symbol] = {
                    "symbol": symbol,
                    "name": symbol.replace(".NS", ""),
                    "price": round(float(current_price), 2),
                    "previous_close": round(float(prev_close), 2),
                    "change": round(float(change), 2),
                    "change_percent": round(float(change_percent), 2),
                    "volume": int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                    "high": round(float(hist['High'].iloc[-1]), 2),
                    "low": round(float(hist['Low'].iloc[-1]), 2),
                    "open": round(float(hist['Open'].iloc[-1]), 2),
                    "currency": "INR",
                    "last_updated": datetime.now().isoformat(),
                    "market_status": "closed" if datetime.now().weekday() > 4 else "open"
                }
                successful_fetches += 1
            else:
                stock_data[symbol] = None
                
        except Exception as e:
            logger.error(f"Error fetching {symbol}: {str(e)}")
            stock_data[symbol] = None
    
    logger.info(f"Successfully fetched {successful_fetches}/{len(symbols)} stocks")
    return stock_data

def update_stock_cache():
    """Update the stock cache with fresh data"""
    global stock_cache, last_update
    
    try:
        stock_cache = fetch_stock_data(NSE_STOCKS)
        last_update = datetime.now()
        logger.info(f"Stock cache updated at {last_update}")
        
        # Schedule next update in 5 minutes
        Timer(300, update_stock_cache).start()
        
    except Exception as e:
        logger.error(f"Error updating stock cache: {str(e)}")
        # Retry in 1 minute on error
        Timer(60, update_stock_cache).start()

@app.route('/api/stocks', methods=['GET'])
def get_all_stocks():
    """Get all cached stock data"""
    return jsonify({
        "status": "success",
        "data": stock_cache,
        "last_updated": last_update.isoformat() if last_update else None,
        "total_stocks": len([s for s in stock_cache.values() if s is not None])
    })

@app.route('/api/stocks/<symbol>', methods=['GET'])
def get_stock(symbol):
    """Get specific stock data"""
    symbol = symbol.upper()
    if not symbol.endswith('.NS'):
        symbol += '.NS'
    
    if symbol in stock_cache:
        if stock_cache[symbol]:
            return jsonify({
                "status": "success",
                "data": stock_cache[symbol]
            })
        else:
            return jsonify({
                "status": "error",
                "message": f"No data available for {symbol}"
            }), 404
    else:
        return jsonify({
            "status": "error",
            "message": f"Stock {symbol} not found"
        }), 404

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        "status": "healthy",
        "service": "NSE Stock Price API",
        "last_update": last_update.isoformat() if last_update else None,
        "cached_stocks": len(stock_cache)
    })

@app.route('/api/refresh', methods=['POST'])
def force_refresh():
    """Force refresh stock data"""
    update_stock_cache()
    return jsonify({
        "status": "success",
        "message": "Stock cache refresh initiated"
    })

if __name__ == '__main__':
    logger.info("Starting NSE Stock Price API Server...")
    
    # Initial data fetch
    update_stock_cache()
    
    # Start the Flask server
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
'''

# Save the backend script
with open("nse_stock_api.py", "w") as f:
    f.write(python_backend_script)

print("Created nse_stock_api.py - Python backend for real yfinance data")

# Create requirements.txt for the backend
requirements_content = '''
flask==2.3.3
flask-cors==4.0.0
yfinance==0.2.18
pandas==2.0.3
requests==2.31.0
'''

with open("requirements.txt", "w") as f:
    f.write(requirements_content)

print("Created requirements.txt for backend dependencies")

# Create deployment instructions
deployment_instructions = '''
# NSE Stock Price API - Deployment Instructions

## Option 1: Local Development Setup

1. Install Python 3.8+ and pip
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the API server:
   ```bash
   python nse_stock_api.py
   ```
4. API will be available at http://localhost:5000

## Option 2: Deploy to Heroku

1. Create a new Heroku app:
   ```bash
   heroku create your-nse-api
   ```
2. Deploy the code:
   ```bash
   git add .
   git commit -m "Deploy NSE Stock API"
   git push heroku main
   ```

## Option 3: Deploy to Railway/Render

1. Upload the files to your preferred platform
2. Set the start command: `python nse_stock_api.py`
3. Platform will auto-detect requirements.txt

## API Endpoints

- GET /api/stocks - Get all stock data
- GET /api/stocks/{SYMBOL} - Get specific stock (e.g., /api/stocks/RELIANCE)
- GET /api/health - Health check
- POST /api/refresh - Force refresh data

## Frontend Integration

Update your Trading Journal Pro to use:
```javascript
const API_BASE_URL = 'http://localhost:5000'; // or your deployed URL

async function fetchRealStockPrices() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stocks`);
        const data = await response.json();
        return data.data; // Returns stock price object
    } catch (error) {
        console.error('Error fetching stock prices:', error);
        return null;
    }
}
```
'''

with open("DEPLOYMENT_INSTRUCTIONS.md", "w") as f:
    f.write(deployment_instructions)

print("Created DEPLOYMENT_INSTRUCTIONS.md")
print("\\n✅ Backend setup complete! Files created:")
print("- nse_stock_api.py (Flask API server)")
print("- requirements.txt (Dependencies)")  
print("- DEPLOYMENT_INSTRUCTIONS.md (Setup guide)")