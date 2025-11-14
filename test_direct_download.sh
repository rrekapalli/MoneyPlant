#!/bin/bash
# Test direct download to see if it works
TEMP_DIR="/tmp/test_bhav_download"
mkdir -p "$TEMP_DIR"

echo "Testing direct download..."
URL="https://archives.nseindia.com/content/historical/EQUITIES/2024/JAN/cm08JAN2024bhav.csv.zip"

# Initialize session
curl -s -c /tmp/nse_cookies.txt "https://www.nseindia.com" > /dev/null
sleep 1

# Download with session
curl -s -b /tmp/nse_cookies.txt \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -H "Referer: https://www.nseindia.com" \
  -o "$TEMP_DIR/test.zip" \
  "$URL"

if [ -f "$TEMP_DIR/test.zip" ]; then
    SIZE=$(stat -c%s "$TEMP_DIR/test.zip" 2>/dev/null || stat -f%z "$TEMP_DIR/test.zip" 2>/dev/null)
    echo "Downloaded: $SIZE bytes"
    
    unzip -q "$TEMP_DIR/test.zip" -d "$TEMP_DIR"
    if [ -f "$TEMP_DIR"/*.csv ]; then
        echo "CSV extracted successfully"
        ls -lh "$TEMP_DIR"/*.csv
    fi
fi

rm -rf "$TEMP_DIR" /tmp/nse_cookies.txt
