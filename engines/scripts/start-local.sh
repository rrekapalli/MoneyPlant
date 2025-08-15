#!/bin/bash

# Script to start the MoneyPlant Engines application locally
# This script ensures the correct profile is used and services are running

echo "Starting MoneyPlant Engines application locally..."

# Check if we're in the right directory
if [ ! -f "pom.xml" ]; then
    echo "Error: Please run this script from the engines directory"
    echo "Current directory: $(pwd)"
    echo "Expected: engines directory with pom.xml"
    exit 1
fi

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "Error: Docker is not running. Please start Docker first."
    exit 1
fi

# Check if required services are running
echo "Checking required services..."

# Check PostgreSQL
if ! docker ps | grep -q "moneyplant-engines-postgres"; then
    echo "Starting PostgreSQL..."
    docker-compose up -d postgres
    echo "Waiting for PostgreSQL to be ready..."
    sleep 10
else
    echo "✅ PostgreSQL is running"
fi

# Check Zookeeper
if ! docker ps | grep -q "moneyplant-engines-zookeeper"; then
    echo "Starting Zookeeper..."
    docker-compose up -d zookeeper
    echo "Waiting for Zookeeper to be ready..."
    sleep 10
else
    echo "✅ Zookeeper is running"
fi

# Check Kafka
if ! docker ps | grep -q "moneyplant-engines-kafka"; then
    echo "Starting Kafka..."
    docker-compose up -d kafka
    echo "Waiting for Kafka to be ready..."
    sleep 15
else
    echo "✅ Kafka is running"
fi

# Check Redis
if ! docker ps | grep -q "moneyplant-engines-redis"; then
    echo "Starting Redis..."
    docker-compose up -d redis
    echo "Waiting for Redis to be ready..."
    sleep 5
else
    echo "✅ Redis is running"
fi

# Verify services are accessible
echo ""
echo "Verifying service connectivity..."

# Check PostgreSQL port
if nc -z localhost 5433 2>/dev/null; then
    echo "✅ PostgreSQL port 5433 is accessible"
else
    echo "❌ PostgreSQL port 5433 is not accessible"
    echo "Please check Docker logs: docker logs moneyplant-engines-postgres"
    exit 1
fi

# Check Kafka port
if nc -z localhost 9093 2>/dev/null; then
    echo "✅ Kafka port 9093 is accessible"
else
    echo "❌ Kafka port 9093 is not accessible"
    echo "Please check Docker logs: docker logs moneyplant-engines-kafka"
    exit 1
fi

# Check Redis port
if nc -z localhost 6380 2>/dev/null; then
    echo "✅ Redis port 6380 is accessible"
else
    echo "❌ Redis port 6380 is not accessible"
    echo "Please check Docker logs: docker logs moneyplant-engines-redis"
    exit 1
fi

echo ""
echo "All services are running and accessible!"
echo "Starting MoneyPlant Engines application with 'local' profile..."

# Start the application with local profile
export SPRING_PROFILES_ACTIVE=local
echo "Using profile: $SPRING_PROFILES_ACTIVE"

# Check if Maven is available
if command -v mvn >/dev/null 2>&1; then
    echo "Starting with Maven..."
    mvn spring-boot:run
else
    echo "Maven not found. Please install Maven or use your IDE to run the application."
    echo "Make sure to set SPRING_PROFILES_ACTIVE=local"
    exit 1
fi
