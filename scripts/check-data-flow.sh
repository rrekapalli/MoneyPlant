#!/bin/bash

# Check Data Flow - Diagnostic Script
# This script helps diagnose where data is flowing in the system

echo "🔍 MoneyPlant Data Flow Diagnostic"
echo "===================================="
echo ""

# Check 1: Kafka is running
echo "1️⃣  Checking Kafka Status..."
if docker ps | grep -q moneyplant-kafka; then
    echo "   ✅ Kafka is running"
    
    # Check topics
    echo "   📋 Kafka Topics:"
    docker exec moneyplant-kafka kafka-topics --bootstrap-server localhost:9092 --list 2>/dev/null | sed 's/^/      /'
    
    # Check message count
    echo ""
    echo "   📊 Message Count in nse-indices-ticks:"
    MSG_COUNT=$(docker exec moneyplant-kafka kafka-run-class kafka.tools.GetOffsetShell \
        --broker-list localhost:9092 \
        --topic nse-indices-ticks 2>/dev/null | awk -F':' '{sum += $3} END {print sum}')
    echo "      Total messages: ${MSG_COUNT:-0}"
else
    echo "   ❌ Kafka is NOT running"
    echo "      Run: ./scripts/start-kafka.sh"
fi

echo ""

# Check 2: Application logs
echo "2️⃣  Checking Application Logs..."
if [ -f "engines/logs/ingestion-dev.log" ]; then
    echo "   📝 Recent Kafka Activity:"
    
    # Check for published messages
    PUB_COUNT=$(grep -c "Successfully published to Kafka" engines/logs/ingestion-dev.log 2>/dev/null || echo "0")
    echo "      Messages published: $PUB_COUNT"
    
    # Check for consumed messages
    CONS_COUNT=$(grep -c "Received NSE indices data from Kafka" engines/logs/ingestion-dev.log 2>/dev/null || echo "0")
    echo "      Messages consumed: $CONS_COUNT"
    
    # Check for DB upserts
    DB_COUNT=$(grep -c "Upserted.*flattened index ticks" engines/logs/ingestion-dev.log 2>/dev/null || echo "0")
    echo "      DB upserts: $DB_COUNT"
    
    # Check for service availability
    if grep -q "NseIndicesTickService bean not available" engines/logs/ingestion-dev.log 2>/dev/null; then
        echo "      ⚠️  WARNING: NseIndicesTickService bean not available!"
    else
        echo "      ✅ NseIndicesTickService appears to be available"
    fi
    
    echo ""
    echo "   🔴 Recent Errors:"
    tail -100 engines/logs/ingestion-dev.log 2>/dev/null | grep -i "error" | tail -3 | sed 's/^/      /'
else
    echo "   ⚠️  Log file not found: engines/logs/ingestion-dev.log"
fi

echo ""

# Check 3: PostgreSQL connection
echo "3️⃣  Checking PostgreSQL Connection..."
if command -v psql &> /dev/null; then
    if psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c "SELECT 1" &>/dev/null; then
        echo "   ✅ PostgreSQL connection successful"
        
        # Check if table exists
        TABLE_EXISTS=$(psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -t -c \
            "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'nse_idx_ticks')" 2>/dev/null | tr -d ' ')
        
        if [ "$TABLE_EXISTS" = "t" ]; then
            echo "   ✅ Table 'nse_idx_ticks' exists"
            
            # Check record count
            RECORD_COUNT=$(psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -t -c \
                "SELECT COUNT(*) FROM nse_idx_ticks" 2>/dev/null | tr -d ' ')
            echo "      Total records: ${RECORD_COUNT:-0}"
            
            # Check latest record
            LATEST=$(psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -t -c \
                "SELECT MAX(ingestion_timestamp) FROM nse_idx_ticks" 2>/dev/null | tr -d ' ')
            if [ -n "$LATEST" ] && [ "$LATEST" != "" ]; then
                echo "      Latest data: $LATEST"
            else
                echo "      ⚠️  No data in table yet"
            fi
        else
            echo "   ❌ Table 'nse_idx_ticks' does NOT exist"
            echo "      Check Hibernate DDL settings or create table manually"
        fi
    else
        echo "   ❌ Cannot connect to PostgreSQL"
        echo "      Check connection settings in application-dev.yml"
    fi
else
    echo "   ⚠️  psql command not found - skipping database check"
    echo "      Install PostgreSQL client to check database"
fi

echo ""

# Check 4: Application status
echo "4️⃣  Checking Application Status..."
if pgrep -f "moneyplant-engines" > /dev/null; then
    echo "   ✅ Application appears to be running"
else
    echo "   ⚠️  Application may not be running"
fi

echo ""

# Summary
echo "📊 Summary"
echo "=========="
echo ""
echo "Data Flow Path:"
echo "  NSE WebSocket → Engines → Kafka → Engines Consumer → PostgreSQL"
echo ""
echo "To see real-time data flow:"
echo "  1. Watch Kafka messages:"
echo "     docker exec -it moneyplant-kafka kafka-console-consumer \\"
echo "       --bootstrap-server localhost:9092 \\"
echo "       --topic nse-indices-ticks"
echo ""
echo "  2. Watch application logs:"
echo "     tail -f engines/logs/ingestion-dev.log | grep -E 'Upserted|Kafka'"
echo ""
echo "  3. Query PostgreSQL:"
echo "     psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant \\"
echo "       -c \"SELECT * FROM nse_idx_ticks ORDER BY ingestion_timestamp DESC LIMIT 5\""
echo ""
