
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
