#!/bin/bash

# MoneyPlant Engines Startup Script

echo "Starting MoneyPlant Engines..."

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

# Set environment variables
export SPRING_PROFILES_ACTIVE=dev
export SERVER_PORT=8081

echo "Java version: $(java -version 2>&1 | head -n 1)"
echo "Maven version: $(mvn -version 2>&1 | head -n 1)"
echo "Spring profile: $SPRING_PROFILES_ACTIVE"
echo "Server port: $SERVER_PORT"

# Start the application
echo "Starting MoneyPlant Engines on port $SERVER_PORT..."
cd ./engines
mvn spring-boot:run
