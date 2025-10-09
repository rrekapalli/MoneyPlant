#!/bin/bash

# 🚀 MoneyPlant Kafka Startup Script for Linux/Mac
# ================================================

echo "🚀 Starting MoneyPlant Kafka Services..."
echo "========================================"

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if Docker Compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not available. Please install Docker Compose first."
    exit 1
fi

# Navigate to project root
cd "$(dirname "$0")/../.."

# Check if Kafka is already running
if docker ps --format "table {{.Names}}" | grep -q "moneyplant-kafka"; then
    echo "⚠️  Kafka is already running. Stopping existing containers..."
    docker-compose -f docker-compose.kafka.yml down
fi

# Start Kafka services
echo "📦 Starting Kafka services..."
if command -v docker-compose &> /dev/null; then
    docker-compose -f docker-compose.kafka.yml up -d
else
    docker compose -f docker-compose.kafka.yml up -d
fi

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
sleep 10

# Check if Kafka is running
echo "🔍 Checking Kafka status..."
if docker ps --format "table {{.Names}}" | grep -q "moneyplant-kafka"; then
    echo "✅ Kafka is running successfully!"
    echo ""
    echo "📊 Services Status:"
    echo "   - Zookeeper: localhost:2181"
    echo "   - Kafka: localhost:9092"
    echo "   - Kafka UI: http://localhost:8080"
    echo ""
    echo "🔗 You can now start the engines service with: ./start-engines.sh"
else
    echo "❌ Failed to start Kafka. Check logs with:"
    echo "   docker-compose -f docker-compose.kafka.yml logs"
    exit 1
fi
