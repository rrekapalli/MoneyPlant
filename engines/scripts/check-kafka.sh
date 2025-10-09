#!/bin/bash

# Script to check Kafka connectivity and status

echo "Checking Kafka connectivity..."

# Check if Kafka is running on the expected port
echo "1. Checking if port 9093 is accessible..."
if nc -z localhost 9093 2>/dev/null; then
    echo "   ✅ Port 9093 is accessible"
else
    echo "   ❌ Port 9093 is not accessible"
    echo "   This might mean Kafka is not running or is on a different port"
fi

# Check if Docker containers are running
echo ""
echo "2. Checking Docker containers..."
if docker ps | grep -q "moneyplant-engines-kafka"; then
    echo "   ✅ Kafka container is running"
    echo "   Container details:"
    docker ps | grep "moneyplant-engines-kafka"
else
    echo "   ❌ Kafka container is not running"
fi

# Check if Zookeeper is running
if docker ps | grep -q "moneyplant-engines-zookeeper"; then
    echo "   ✅ Zookeeper container is running"
else
    echo "   ❌ Zookeeper container is not running"
fi

# Check Kafka logs
echo ""
echo "3. Checking Kafka logs..."
if docker logs moneyplant-engines-kafka 2>&1 | grep -q "started"; then
    echo "   ✅ Kafka appears to have started successfully"
else
    echo "   ⚠️  Kafka may not have started properly"
    echo "   Recent logs:"
    docker logs moneyplant-engines-kafka --tail 10 2>&1
fi

# Check if we can connect to Kafka using kafka-console-consumer
echo ""
echo "4. Testing Kafka connection..."
if command -v kafka-console-consumer >/dev/null 2>&1; then
    echo "   Testing with kafka-console-consumer..."
    timeout 10s kafka-console-consumer --bootstrap-server localhost:9093 --topic test --from-beginning >/dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "   ✅ Successfully connected to Kafka"
    else
        echo "   ❌ Failed to connect to Kafka"
    fi
else
    echo "   ⚠️  kafka-console-consumer not available, skipping connection test"
fi

# Check Docker Compose status
echo ""
echo "5. Docker Compose status:"
cd "$(dirname "$0")/.."
docker-compose ps

echo ""
echo "6. Recommendations:"
echo "   - If containers are not running, start them with: docker-compose up -d"
echo "   - If port 9093 is not accessible, check Docker network configuration"
echo "   - If Kafka fails to start, check Zookeeper logs: docker logs moneyplant-engines-zookeeper"
echo "   - Make sure your application is configured to use localhost:9093"
