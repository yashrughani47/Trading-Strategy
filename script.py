# Let me check what's possible with yfinance and stock data APIs that can work with JavaScript

# First, let's see what yfinance can provide
import yfinance as yf
import json
import requests

# Test fetching some Indian stock data
symbols = ["RELIANCE.NS", "TCS.NS", "INFY.NS", "HDFCBANK.NS", "ICICIBANK.NS"]

stock_data = {}
for symbol in symbols:
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="2d")  # Get last 2 days to get previous close
        info = ticker.info
        
        if not hist.empty:
            previous_close = hist['Close'].iloc[-1]  # Most recent close price
            stock_data[symbol] = {
                "symbol": symbol,
                "previous_close": round(float(previous_close), 2),
                "currency": "INR",
                "last_updated": hist.index[-1].strftime("%Y-%m-%d")
            }
        else:
            stock_data[symbol] = None
            
    except Exception as e:
        print(f"Error fetching {symbol}: {e}")
        stock_data[symbol] = None

print("Stock Data Fetched:")
print(json.dumps(stock_data, indent=2))