#!/bin/bash

echo "Testing Backend Compilation and Package Structure..."
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -d "backend" ]; then
    echo "❌ Error: backend directory not found"
    exit 1
fi

echo "1. Checking directory structure..."
if [ -d "backend/src/main/java" ]; then
    echo "✅ Maven source directory structure is correct"
else
    echo "❌ Maven source directory structure is incorrect"
    exit 1
fi

if [ -d "backend/src/main/resources" ]; then
    echo "✅ Maven resources directory structure is correct"
else
    echo "❌ Maven resources directory structure is incorrect"
    exit 1
fi

echo ""

echo "2. Checking package structure..."
if [ -d "backend/src/main/java/com/moneyplant" ]; then
    echo "✅ Package structure is correct"
else
    echo "❌ Package structure is incorrect"
    exit 1
fi

echo ""

echo "3. Checking main application class..."
if [ -f "backend/src/main/java/com/moneyplant/app/MoneyPlantApplication.java" ]; then
    echo "✅ Main application class found"
else
    echo "❌ Main application class not found"
    exit 1
fi

echo ""

echo "4. Checking configuration files..."
if [ -f "backend/src/main/resources/application.properties" ]; then
    echo "✅ Main application properties found"
else
    echo "❌ Main application properties not found"
    exit 1
fi

if [ -f "backend/src/main/resources/application-dev.properties" ]; then
    echo "✅ Development application properties found"
else
    echo "❌ Development application properties not found"
    exit 1
fi

echo ""

echo "5. Checking pom.xml..."
if [ -f "backend/pom.xml" ]; then
    echo "✅ pom.xml found"
else
    echo "❌ pom.xml not found"
    exit 1
fi

echo ""

echo "6. Testing Maven compilation..."
cd backend
if command -v mvn &> /dev/null; then
    echo "Maven found, attempting compilation..."
    mvn clean compile -q
    if [ $? -eq 0 ]; then
        echo "✅ Backend compilation successful"
    else
        echo "❌ Backend compilation failed"
        echo "Run 'mvn clean compile' in the backend directory for detailed error messages"
    fi
else
    echo "⚠️  Maven not found in PATH"
    echo "Install Maven or use the provided Docker setup"
fi

echo ""
echo "Backend package structure test completed!"
echo ""
echo "If compilation was successful, you can start the backend with:"
echo "cd backend && ./start-backend.sh" 