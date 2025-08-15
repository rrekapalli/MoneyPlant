#!/bin/bash

# MoneyPlant Engines Restart Script
# Use this script after making configuration changes like CORS updates

echo "🔄 Restarting MoneyPlant Engines..."
echo "=================================="

# Check if engines is running
echo "🔍 Checking if engines module is currently running..."

if pgrep -f "moneyplant-engines" > /dev/null; then
    echo "✅ Engines module is running. Stopping it..."
    
    # Find and kill the engines process
    ENGINES_PID=$(pgrep -f "moneyplant-engines")
    echo "🛑 Stopping engines process (PID: $ENGINES_PID)..."
    
    kill $ENGINES_PID
    
    # Wait for process to stop
    echo "⏳ Waiting for engines to stop..."
    sleep 5
    
    # Check if it's still running
    if pgrep -f "moneyplant-engines" > /dev/null; then
        echo "⚠️  Engines is still running. Force killing..."
        pkill -9 -f "moneyplant-engines"
        sleep 2
    fi
    
    echo "✅ Engines module stopped."
else
    echo "ℹ️  Engines module is not currently running."
fi

echo ""
echo "🚀 Starting engines module with updated configuration..."
echo ""

# Start the engines module
cd ./engines
mvn spring-boot:run

echo ""
echo "✅ Engines module restarted!"
echo ""
echo "🔍 To verify CORS configuration:"
echo "   cd frontend && node test-engines-api.js"
echo ""
echo "🌐 Engines will be available at: http://localhost:8081/engines"
