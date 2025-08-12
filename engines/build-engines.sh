#!/bin/bash

# MoneyPlant Engines Build Script

echo "Building MoneyPlant Engines..."

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "Error: Java is not installed. Please install Java 21 or higher."
    exit 1
fi

# Check Java version
JAVA_VERSION=$(java -version 2>&1 | awk -F '"' '/version/ {print $2}' | awk -F '.' '{print $1}')
if [ "$JAVA_VERSION" -lt 21 ]; then
    echo "Error: Java 21 or higher is required. Current version: $JAVA_VERSION"
    exit 1
fi

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "Error: Maven is not installed. Please install Maven 3.8 or higher."
    exit 1
fi

echo "Java version: $(java -version 2>&1 | head -n 1)"
echo "Maven version: $(mvn -version 2>&1 | head -n 1)"

# Clean and build
echo "Cleaning previous build..."
mvn clean

echo "Building MoneyPlant Engines..."
mvn package -DskipTests

if [ $? -eq 0 ]; then
    echo "Build successful!"
    echo "JAR file location: target/moneyplant-engines-1.0-SNAPSHOT.jar"
    
    # Show JAR file size
    if [ -f "target/moneyplant-engines-1.0-SNAPSHOT.jar" ]; then
        JAR_SIZE=$(du -h "target/moneyplant-engines-1.0-SNAPSHOT.jar" | cut -f1)
        echo "JAR file size: $JAR_SIZE"
    fi
else
    echo "Build failed!"
    exit 1
fi
