#!/bin/bash

echo "🚀 MoneyPlant Frontend Startup for Linux/Mac"
echo "============================================="
echo ""

# Check if we're on Linux/Mac
if [[ "$OSTYPE" == "linux-gnu"* ]] || [[ "$OSTYPE" == "darwin"* ]]; then
    echo "✅ Linux/Mac detected. Using Linux build scripts..."
    bash build/linux/start-frontend.sh
else
    echo "❌ This script is for Linux/Mac only."
    echo "Please use start-frontend.bat for Windows."
    exit 1
fi 