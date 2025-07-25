# Create a comprehensive solution for real yfinance integration

# First let's fetch real NSE stock data
import yfinance as yf
import json
from datetime import datetime, timedelta
import pandas as pd

# Extended NSE stock list
nse_stocks = [
    "RELIANCE.NS", "TCS.NS", "HDFCBANK.NS", "BHARTIARTL.NS", "ICICIBANK.NS", 
    "SBIN.NS", "INFY.NS", "LT.NS", "ITC.NS", "HCLTECH.NS",
    "BAJFINANCE.NS", "HINDUNILVR.NS", "KOTAKBANK.NS", "ASIANPAINT.NS", 
    "MARUTI.NS", "TITAN.NS", "SUNPHARMA.NS", "ULTRACEMCO.NS", 
    "AXISBANK.NS", "NESTLEIND.NS", "WIPRO.NS", "ADANIENT.NS", 
    "BAJAJFINSV.NS", "ONGC.NS", "NTPC.NS", "POWERGRID.NS", "M&M.NS",
    "TECHM.NS", "TATAMOTORS.NS", "COALINDIA.NS"
]

# Fetch real stock data
real_stock_data = {}
successful_fetches = 0

print("Fetching real NSE stock data...")

for symbol in nse_stocks[:10]:  # Test with first 10 stocks
    try:
        ticker = yf.Ticker(symbol)
        hist = ticker.history(period="5d")  # Get last 5 days
        info = ticker.info
        
        if not hist.empty and len(hist) > 0:
            previous_close = hist['Close'].iloc[-1]  # Most recent close price
            prev_day_close = hist['Close'].iloc[-2] if len(hist) > 1 else previous_close
            
            # Calculate change and percentage
            change = previous_close - prev_day_close
            change_percent = (change / prev_day_close) * 100 if prev_day_close != 0 else 0
            
            real_stock_data[symbol] = {
                "symbol": symbol,
                "name": symbol.replace(".NS", ""),
                "previous_close": round(float(previous_close), 2),
                "change": round(float(change), 2),
                "change_percent": round(float(change_percent), 2),
                "volume": int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0,
                "currency": "INR",
                "last_updated": hist.index[-1].strftime("%Y-%m-%d"),
                "high": round(float(hist['High'].iloc[-1]), 2),
                "low": round(float(hist['Low'].iloc[-1]), 2),
                "open": round(float(hist['Open'].iloc[-1]), 2)
            }
            successful_fetches += 1
            print(f"✓ {symbol}: ₹{previous_close:.2f}")
        else:
            real_stock_data[symbol] = None
            print(f"✗ {symbol}: No data available")
            
    except Exception as e:
        print(f"✗ {symbol}: Error - {str(e)}")
        real_stock_data[symbol] = None

print(f"\nSuccessfully fetched data for {successful_fetches} stocks")

# Save the real data to JSON file for integration
with open("real_nse_stock_data.json", "w") as f:
    json.dump(real_stock_data, f, indent=2, default=str)

print("Real stock data saved to real_nse_stock_data.json")

# Display sample of fetched data
print("\nSample Real Stock Data:")
for symbol, data in list(real_stock_data.items())[:5]:
    if data:
        print(f"{symbol}: ₹{data['previous_close']} ({data['change']:+.2f}, {data['change_percent']:+.2f}%)")