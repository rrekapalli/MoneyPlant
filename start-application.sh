#!/bin/bash

echo "🚀 MoneyPlant Application Startup for Linux/Mac"
echo "================================================"
echo ""

# Check if we're on Linux/Mac
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ Linux/Mac detected. Using Linux scripts..."
    bash scripts/start-application.sh
else
    echo "❌ This script is for Linux/Mac only."
    echo "Please use start-application.bat for Windows."
    exit 1
fi 