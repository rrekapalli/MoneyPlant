#!/bin/bash

# Stop Kafka for MoneyPlant Engines

set -e

echo "🛑 Stopping Kafka infrastructure..."
echo ""

# Check if docker-compose file exists
if [ ! -f "docker-compose.kafka.yml" ]; then
    echo "❌ Error: docker-compose.kafka.yml not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

# Stop Kafka services
docker compose -f docker-compose.kafka.yml down

echo ""
echo "✅ Kafka infrastructure stopped!"
echo ""
echo "💡 To remove all data volumes, run:"
echo "   docker compose -f docker-compose.kafka.yml down -v"
echo ""
