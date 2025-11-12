#!/bin/bash

# Test End-of-Day Market Data Ingestion
# This script triggers a backfill operation to test EOD data ingestion

set -e

echo "🧪 Testing End-of-Day Market Data Ingestion"
echo "==========================================="
echo ""

# Configuration
API_URL="http://localhost:8081/engines/api/v1/ingestion"
START_DATE="2024-11-01"
END_DATE="2024-11-11"
TIMEFRAME="1day"

# Test with a small set of popular symbols
SYMBOLS='["RELIANCE", "TCS", "INFY", "HDFCBANK", "ICICIBANK"]'

echo "📊 Test Configuration:"
echo "  API URL: $API_URL"
echo "  Symbols: $SYMBOLS"
echo "  Date Range: $START_DATE to $END_DATE"
echo "  Timeframe: $TIMEFRAME"
echo ""

# Check if engines are running
echo "🔍 Checking if engines are running..."
if ! curl -s -f "$API_URL/health" > /dev/null 2>&1; then
    echo "❌ Engines are not running on port 8081"
    echo "   Please start engines first: ./start-engines.sh"
    exit 1
fi
echo "✅ Engines are running"
echo ""

# Trigger backfill
echo "🚀 Triggering backfill operation..."
echo ""

RESPONSE=$(curl -s -X POST "$API_URL/backfill" \
  -H "Content-Type: application/json" \
  -d "{
    \"symbols\": $SYMBOLS,
    \"startDate\": \"$START_DATE\",
    \"endDate\": \"$END_DATE\",
    \"timeframe\": \"$TIMEFRAME\",
    \"fillGapsOnly\": false,
    \"maxConcurrency\": 5
  }")

echo "📥 Response:"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
echo ""

# Parse response
SUCCESS_COUNT=$(echo "$RESPONSE" | jq -r '.successCount // 0' 2>/dev/null || echo "0")
FAILURE_COUNT=$(echo "$RESPONSE" | jq -r '.failureCount // 0' 2>/dev/null || echo "0")
RECORDS_INSERTED=$(echo "$RESPONSE" | jq -r '.recordsInserted // 0' 2>/dev/null || echo "0")

echo "📈 Results Summary:"
echo "  ✅ Successful: $SUCCESS_COUNT symbols"
echo "  ❌ Failed: $FAILURE_COUNT symbols"
echo "  📝 Records Inserted: $RECORDS_INSERTED"
echo ""

# Check database for inserted data
echo "🔍 Checking PostgreSQL database for inserted data..."
echo ""

DB_HOST="postgres.tailce422e.ts.net"
DB_PORT="5432"
DB_NAME="MoneyPlant"
DB_USER="postgres"
DB_PASSWORD="mysecretpassword"

# Check if data was inserted
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
SELECT 
    symbol,
    COUNT(*) as record_count,
    MIN(date) as earliest_date,
    MAX(date) as latest_date,
    MIN(close) as min_close,
    MAX(close) as max_close
FROM nse_eq_ohlcv_historic
WHERE symbol IN ('RELIANCE', 'TCS', 'INFY', 'HDFCBANK', 'ICICIBANK')
  AND date >= '$START_DATE'
  AND date <= '$END_DATE'
GROUP BY symbol
ORDER BY symbol;
"

echo ""
echo "✅ End-of-Day ingestion test completed!"
echo ""
echo "💡 To test with more symbols, modify the SYMBOLS array in this script"
echo "💡 To test with a different date range, modify START_DATE and END_DATE"
