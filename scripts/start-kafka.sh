#!/bin/bash

# Start Kafka for MoneyPlant Engines
# This script starts Zookeeper, Kafka, and Kafka UI

set -e

echo "🚀 Starting Kafka infrastructure..."
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker is not running or you don't have permission."
    echo "   Please start Docker or run: sudo usermod -aG docker $USER"
    exit 1
fi

# Check if docker-compose file exists
if [ ! -f "docker-compose.kafka.yml" ]; then
    echo "❌ Error: docker-compose.kafka.yml not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Stop any existing Kafka containers and clean volumes
echo "🛑 Stopping existing Kafka containers (if any)..."
docker compose -f docker-compose.kafka.yml down -v 2>/dev/null || true
echo ""

# Start Kafka services
echo "▶️  Starting Kafka services..."
docker compose -f docker-compose.kafka.yml up -d

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 5

# Check if services are running
echo ""
echo "📊 Service Status:"
docker-compose -f docker-compose.kafka.yml ps

# Wait for Kafka to be fully ready
echo ""
echo "⏳ Waiting for Kafka to be fully ready (this may take 30-60 seconds)..."
for i in {1..30}; do
    if docker exec moneyplant-kafka kafka-broker-api-versions --bootstrap-server localhost:9092 > /dev/null 2>&1; then
        echo "✅ Kafka is ready!"
        break
    fi
    echo -n "."
    sleep 2
done
echo ""

# Show Kafka topics
echo ""
echo "📋 Current Kafka Topics:"
docker exec moneyplant-kafka kafka-topics --bootstrap-server localhost:9092 --list || echo "No topics yet"

echo ""
echo "✅ Kafka infrastructure is running!"
echo ""
echo "📍 Access Points:"
echo "   - Kafka Broker: localhost:9092"
echo "   - Zookeeper: localhost:2181"
echo "   - Kafka UI: http://localhost:8082"
echo ""
echo "💡 Useful Commands:"
echo "   - View logs: docker logs -f moneyplant-kafka"
echo "   - Stop Kafka: docker compose -f docker-compose.kafka.yml down"
echo "   - Stop and remove data: docker compose -f docker-compose.kafka.yml down -v"
echo ""
echo "🎯 Next Steps:"
echo "   1. Start your engines application"
echo "   2. Check application logs for 'Successfully published to Kafka'"
echo "   3. Open Kafka UI at http://localhost:8082 to monitor messages"
echo ""
