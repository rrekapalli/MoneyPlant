#!/usr/bin/env python3
"""
Python NSE Provider Test - Based on working implementation
This will help us understand what the Java version should do
"""

import requests
import json
import time
import random
from datetime import datetime

# NSE Configuration
NSE_BASE_URL = "https://www.nseindia.com"
HISTORICAL_ENDPOINT = "/api/historical/cm/equity"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-US,en;q=0.9",
    "Cache-Control": "max-age=0",
    "DNT": "1",
    "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    "Sec-Ch-Ua-Mobile": "?0",
    "Sec-Ch-Ua-Platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "none",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
}

def initialize_session():
    """Initialize NSE session with cookies"""
    print("=" * 70)
    print("NSE India Provider - Python Test")
    print("=" * 70)
    print()
    
    session = requests.Session()
    session.headers.update(HEADERS)
    
    print("🔐 Initializing NSE session...")
    
    try:
        # Step 1: Visit homepage
        print("  📍 Step 1/3: Visiting NSE homepage")
        response = session.get(NSE_BASE_URL, timeout=10)
        print(f"     Response: {response.status_code} - Cookies: {len(session.cookies)}")
        time.sleep(0.5)
        
        # Step 2: Visit get-quotes page
        print("  📍 Step 2/3: Visiting get-quotes/equity page")
        response = session.get(f"{NSE_BASE_URL}/get-quotes/equity", timeout=10)
        print(f"     Response: {response.status_code} - Cookies: {len(session.cookies)}")
        time.sleep(0.5)
        
        # Step 3: Visit market-data page
        print("  📍 Step 3/3: Visiting market-data page")
        response = session.get(f"{NSE_BASE_URL}/market-data", timeout=10)
        print(f"     Response: {response.status_code} - Cookies: {len(session.cookies)}")
        
        print(f"  ✅ Session initialized with {len(session.cookies)} cookies")
        print("  Cookies:")
        for cookie in session.cookies:
            value_preview = cookie.value[:20] if len(cookie.value) > 20 else cookie.value
            print(f"     • {cookie.name} = {value_preview}...")
        
        # Set additional cookies
        session.cookies.set("nseQuoteSymbols", json.dumps([{"symbol": "SBIN", "identifier": "", "type": "equity"}]))
        session.cookies.set("AKA_A2", "A")
        
        return session
        
    except Exception as e:
        print(f"  ❌ Error initializing session: {e}")
        return session

def fetch_historical_data(session, symbol, from_date, to_date):
    """Fetch historical data for a symbol"""
    print(f"\n📊 Fetching historical data for {symbol}...")
    
    # Try the historical API endpoint
    url = f"{NSE_BASE_URL}/api/historical/cm/equity?symbol={symbol}&series=[%22EQ%22]&from={from_date}&to={to_date}"
    
    print(f"  URL: {url}")
    print(f"  Cookies in session: {len(session.cookies)}")
    
    api_headers = {
        "Accept": "application/json, text/plain, */*",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": f"{NSE_BASE_URL}/get-quotes/equity",
        "X-Requested-With": "XMLHttpRequest",
        "Sec-Fetch-Dest": "empty",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Site": "same-origin"
    }
    
    try:
        response = session.get(url, headers=api_headers, timeout=20)
        
        print(f"  Status Code: {response.status_code}")
        print(f"  Content-Type: {response.headers.get('Content-Type', 'N/A')}")
        print(f"  Content-Encoding: {response.headers.get('Content-Encoding', 'none')}")
        print(f"  Content-Length: {len(response.content)} bytes")
        
        if response.status_code == 403:
            print("  ❌ 403 Forbidden - Anti-bot protection triggered!")
            return None
        
        if response.status_code != 200:
            print(f"  ❌ Error: HTTP {response.status_code}")
            return None
        
        # Check if response is JSON
        try:
            data = response.json()
            print(f"  ✅ Success! Got JSON response")
            print(f"  Data type: {type(data)}")
            
            if isinstance(data, dict):
                print(f"  Keys: {list(data.keys())}")
                if 'data' in data:
                    records = data['data']
                    print(f"  Records: {len(records)}")
                    if records:
                        print(f"  First record keys: {list(records[0].keys())}")
                        print(f"  First record: {json.dumps(records[0], indent=2)}")
            elif isinstance(data, list):
                print(f"  Records: {len(data)}")
                if data:
                    print(f"  First record: {json.dumps(data[0], indent=2)}")
            
            return data
            
        except json.JSONDecodeError:
            print(f"  ⚠️ Response is not JSON")
            print(f"  Raw content (first 500 chars): {response.text[:500]}")
            return None
            
    except Exception as e:
        print(f"  ❌ Error: {e}")
        return None

def main():
    # Initialize session
    session = initialize_session()
    
    # Test with RELIANCE
    print()
    print("=" * 70)
    print("Test 1: RELIANCE")
    print("=" * 70)
    fetch_historical_data(session, "RELIANCE", "01-01-2024", "31-01-2024")
    
    # Test with TCS
    print()
    print("=" * 70)
    print("Test 2: TCS (session reuse)")
    print("=" * 70)
    fetch_historical_data(session, "TCS", "01-01-2024", "31-01-2024")
    
    # Test with INFY
    print()
    print("=" * 70)
    print("Test 3: INFY (session reuse)")
    print("=" * 70)
    fetch_historical_data(session, "INFY", "01-01-2024", "31-01-2024")
    
    print()
    print("=" * 70)
    print("✅ Python test complete!")
    print("=" * 70)

if __name__ == "__main__":
    main()
