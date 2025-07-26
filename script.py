# First, let's examine the CSV data structure to understand what we're working with
import pandas as pd
import io

# Read the CSV data from the attachment
csv_data = '''Symbol,Entry Date,Exit Date,Entry Price,Exit Price,Quantity,Order Type,Strategy,Account,P&L,P&L %,Status
INDIGO,2/24/2025,,"4,568.00",,1,Buy,Fusion Strategy,Paytm,,,
CHOLAHLDNG,2/27/2025,06-06-2025,"1,634.45","1,926.00",2,Buy,Fusion Strategy,Paytm,,,
NH,2/27/2025,07-02-2025,"1,488.00","1,995.80",2,Buy,IV Strategy,Paytm,,,
SHAILY,03-04-2025,4/21/2025,"1,598.85","1,684.00",2,Buy,Fusion Strategy,Paytm,,,
BLUESTARCO,03-04-2025,4/21/2025,"2,106.80","1,995.00",1,Buy,Fusion Strategy,Paytm,,,
LUMAXIND,03-04-2025,4/30/2025,"2,392.00","2,362.85",1,Buy,Fusion Strategy,Paytm,,,
WINDLAS,03-06-2025,07-09-2025,907.3,922.1,3,Buy,IV Strategy,Paytm,,,
MANAPPURAM,1/21/2025,07-09-2025,194.2,263.35,10,Buy,30 SMA,Paytm,,,
TECHM,3/28/2025,3/28/2025,"1,422.50","1,413.00",5,Sell,Kumbhakaran Strategy,Paytm,,,
TECHM,3/28/2025,3/28/2025,"1,422.50","1,418.80",5,Sell,Kumbhakaran Strategy,Paytm,,,
DEVYANI,04-02-2025,04-02-2025,149.2,150.77,90,Sell,Kumbhakaran Strategy,Paytm,,,
BLUESTARCO,03-04-2025,4/30/2025,"2,106.80","1,702.70",1,Buy,Fusion Strategy,Paytm,,,
SAREGAMA,4/21/2025,06-11-2025,556,547,6,Buy,Fusion Strategy,Paytm,,,
OSWALAGRO,4/21/2025,4/28/2025,101.01,85,10,Buy,IV Strategy,Paytm,,,
RELINFRA,4/21/2025,05-06-2025,272.4,236.7,3,Buy,Fusion Strategy,Paytm,,,
PARAGMILK,5/15/2025,06-12-2025,214.66,214.66,8,Buy,Alpha 2.0,Paytm,,,
LUMAXTECH,06-02-2025,07-02-2025 00:00,864.5,"1,118.10",5,Buy,IV Strategy,Zerodha,,,
APLAPOLLO,06-04-2025,,"1,882.00",,3,Buy,ATH,Zerodha,,,
BIKAJI,06-04-2025,,761,,8,Buy,Fusion Strategy,Zerodha,,,
CCL,06-04-2025,6/18/202,904.5,791.3,6,Buy,ATH,Zerodha,,,
DEEPAKFERT,06-04-2025,,"1,560.00",,4,Buy,ATH,Zerodha,,,
GARUDA,06-05-2025,06-06-2025,123.3,127.6,28,Buy,RE Strategy (BTST),Zerodha,,,
GARUDA,06-05-2025,06-10-2025,123.3,119.53,12,Buy,RE Strategy (BTST),Zerodha,,,
GODREJIND,06-06-2025,07-02-2025,"1,361.00","1,169.00",4,Buy,IV Strategy,Zerodha,,,
LICI,06-04-2025,,954.4,,6,Buy,IV Strategy,Zerodha,,,
MARINE,06-06-2025,07-02-2025,238.8,205.35,18,Buy,IV Strategy,Zerodha,,,
STYRENIX,06-04-2025,,"3,240.00",,2,Buy,ATH,Zerodha,,,
ASIANPAINT,06-05-2025,06-05-2025,"2,251.60","2,246.00",5,Sell,Kumbhakaran Strategy,Zerodha,,,
SUNPHARMA,06-09-2025,06-09-2025,"1,677.50","1,686.00",10,Sell,Kumbhakaran Strategy,Zerodha,,,
NAVA,06-12-2025,,561.5,,9,Buy,IV Strategy,Zerodha,,,
BHARTIARTL,6/20/2025,,"1,929.00",,3,Buy,ATH,Zerodha,,,
KRBL,07-03-2025,,391.8,,12,Buy,Rabbit System,Zerodha,,,
GODREJCP,07-03-2025,07-03-2025,"1,174.30","1,179.60",25,Sell,Kumbhakaran Strategy,Zerodha,,,
NLCIND,07-03-2025,07-03-2025,227,226.85,50,Sell,Kumbhakaran Strategy,Zerodha,,,
TRIVENI,07-04-2025,07-04-2025,374.8,372.54,80,Sell,Kumbhakaran Strategy,Zerodha,,,
XPROINDIA,07-07-2025,07-07-2025,"1,193.90","1,199.08",20,Sell,Mother Candle Shorting,Zerodha,,,
RPGLIFE,07-07-2025,,"2,675.00",,2,Buy,Fusion Strategy,Zerodha,,,'''

# Read and analyze the data
df = pd.read_csv(io.StringIO(csv_data))

print("CSV Data Structure Analysis:")
print(f"Total trades: {len(df)}")
print(f"Columns: {list(df.columns)}")
print(f"\nUnique Strategies: {df['Strategy'].unique()}")
print(f"Unique Accounts: {df['Account'].unique()}")
print(f"Unique Order Types: {df['Order Type'].unique()}")

# Check for open vs closed trades
open_trades = df[df['Exit Date'].isna() | (df['Exit Date'] == '')]
closed_trades = df[df['Exit Date'].notna() & (df['Exit Date'] != '')]

print(f"\nOpen Trades: {len(open_trades)}")
print(f"Closed Trades: {len(closed_trades)}")

# Sample rows
print(f"\nFirst 5 rows:")
print(df.head())