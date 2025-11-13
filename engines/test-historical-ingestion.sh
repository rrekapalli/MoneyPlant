#!/bin/bash

# Test script for NSE Historical Data Ingestion
# This script tests the complete ingestion pipeline

set -e

echo "========================================="
echo "NSE Historical Data Ingestion Test"
echo "========================================="
echo ""

# Configuration
BASE_URL="http://localhost:8081/engines"
API_ENDPOINT="${BASE_URL}/api/v1/ingestion/historical/nse"

# Test date range (small range for testing)
START_DATE="2024-11-01"
END_DATE="2024-11-05"

echo "Test Configuration:"
echo "  Base URL: ${BASE_URL}"
echo "  API Endpoint: ${API_ENDPOINT}"
echo "  Date Range: ${START_DATE} to ${END_DATE}"
echo ""

# Function to check if service is running
check_service() {
    echo "1. Checking if service is running..."
    if curl -s -f "${API_ENDPOINT}/health" > /dev/null; then
        echo "   ✓ Service is running"
        return 0
    else
        echo "   ✗ Service is not running"
        echo "   Please start the application first:"
        echo "   cd engines && mvn spring-boot:run"
        return 1
    fi
}

# Function to start ingestion
start_ingestion() {
    echo ""
    echo "2. Starting historical data ingestion..."
    echo "   Date range: ${START_DATE} to ${END_DATE}"
    
    RESPONSE=$(curl -s -X POST "${API_ENDPOINT}" \
        -H "Content-Type: application/json" \
        -d "{\"startDate\": \"${START_DATE}\", \"endDate\": \"${END_DATE}\"}")
    
    echo "   Response: ${RESPONSE}"
    
    # Extract job ID from response
    JOB_ID=$(echo "${RESPONSE}" | grep -o '"jobId":"[^"]*"' | cut -d'"' -f4)
    
    if [ -z "${JOB_ID}" ]; then
        echo "   ✗ Failed to start ingestion"
        echo "   Response: ${RESPONSE}"
        return 1
    fi
    
    echo "   ✓ Ingestion started successfully"
    echo "   Job ID: ${JOB_ID}"
    echo "${JOB_ID}"
}

# Function to check job status
check_status() {
    local job_id=$1
    
    echo ""
    echo "3. Monitoring job status..."
    echo "   Job ID: ${job_id}"
    echo ""
    
    # Poll job status every 5 seconds
    local max_attempts=120  # 10 minutes max
    local attempt=0
    
    while [ $attempt -lt $max_attempts ]; do
        RESPONSE=$(curl -s "${API_ENDPOINT}/${job_id}")
        
        STATUS=$(echo "${RESPONSE}" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        PROGRESS=$(echo "${RESPONSE}" | grep -o '"progressPercentage":[0-9]*' | cut -d':' -f2)
        PROCESSED=$(echo "${RESPONSE}" | grep -o '"processedDates":[0-9]*' | cut -d':' -f2)
        TOTAL=$(echo "${RESPONSE}" | grep -o '"totalDates":[0-9]*' | cut -d':' -f2)
        RECORDS=$(echo "${RESPONSE}" | grep -o '"totalRecords":[0-9]*' | cut -d':' -f2)
        INSERTED=$(echo "${RESPONSE}" | grep -o '"insertedRecords":[0-9]*' | cut -d':' -f2)
        
        echo -ne "\r   Status: ${STATUS} | Progress: ${PROGRESS}% | Dates: ${PROCESSED}/${TOTAL} | Records: ${INSERTED}/${RECORDS}   "
        
        if [ "${STATUS}" = "COMPLETED" ]; then
            echo ""
            echo ""
            echo "   ✓ Ingestion completed successfully!"
            echo "   Total dates processed: ${PROCESSED}"
            echo "   Total records inserted: ${INSERTED}"
            return 0
        elif [ "${STATUS}" = "FAILED" ]; then
            echo ""
            echo ""
            echo "   ✗ Ingestion failed"
            echo "   Response: ${RESPONSE}"
            return 1
        elif [ "${STATUS}" = "TIMEOUT" ]; then
            echo ""
            echo ""
            echo "   ✗ Ingestion timed out"
            return 1
        fi
        
        sleep 5
        attempt=$((attempt + 1))
    done
    
    echo ""
    echo ""
    echo "   ✗ Monitoring timed out after 10 minutes"
    return 1
}

# Function to verify data in database
verify_data() {
    echo ""
    echo "4. Verifying data in database..."
    
    # This requires psql to be installed and configured
    if command -v psql &> /dev/null; then
        echo "   Querying database for inserted records..."
        
        # Count records in the date range
        COUNT=$(psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -t -c \
            "SELECT COUNT(*) FROM nse_eq_ohlcv_historic WHERE time >= '${START_DATE}' AND time <= '${END_DATE}'" 2>/dev/null || echo "0")
        
        COUNT=$(echo $COUNT | tr -d ' ')
        
        if [ "${COUNT}" -gt 0 ]; then
            echo "   ✓ Found ${COUNT} records in database"
            
            # Show sample records
            echo ""
            echo "   Sample records:"
            psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c \
                "SELECT time, symbol, open, high, low, close, volume FROM nse_eq_ohlcv_historic WHERE time >= '${START_DATE}' AND time <= '${END_DATE}' LIMIT 5" 2>/dev/null || true
        else
            echo "   ⚠ No records found in database (this might be expected if dates are weekends/holidays)"
        fi
    else
        echo "   ⚠ psql not found, skipping database verification"
        echo "   Install psql to enable database verification"
    fi
}

# Main execution
main() {
    if ! check_service; then
        exit 1
    fi
    
    JOB_ID=$(start_ingestion)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    if ! check_status "${JOB_ID}"; then
        exit 1
    fi
    
    verify_data
    
    echo ""
    echo "========================================="
    echo "Test completed successfully!"
    echo "========================================="
}

# Run main function
main
