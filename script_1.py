# Install yfinance first
!pip install yfinance

import yfinance as yf
import json
from datetime import datetime, timedelta

# Test fetching some Indian stock data
symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]

stock_data = {}
for symbol in symbols:
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2d")  # Get last 2 days to get previous close
        
        if not hist.empty:
            previous_close = hist['Close'].iloc[-1]  # Most recent close price
            stock_data[symbol] = {
                "symbol": symbol,
                "previous_close": round(float(previous_close), 2),
                "currency": "INR",
                "last_updated": hist.index[-1].strftime("%Y-%m-%d %H:%M:%S"),
                "volume": int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0
            }
        else:
            stock_data[symbol] = None
            
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        stock_data[symbol] = None

print("Stock Data Fetched:")
print(json.dumps(stock_data, indent=2, default=str))