#!/bin/bash

echo "🚀 MoneyPlant Engines Startup for Linux/Mac"
echo "==========================================="
echo ""

# Check if we're on Linux/Mac
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ Linux/Mac detected. Using Linux scripts..."
    bash scripts/linux/engines/start-engines.sh
else
    echo "❌ This script is for Linux/Mac only."
    echo "Please use start-engines.bat for Windows."
    exit 1
fi
