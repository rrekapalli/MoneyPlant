# Kafka Setup Guide

## Issue
The application shows warnings:
```
[Consumer clientId=consumer-moneyplant-engines-dev-4, groupId=moneyplant-engines-dev] Bootstrap broker localhost:9093 (id: -1 rack: null) disconnected
Connection to node -1 (localhost/127.0.0.1:9093) could not be established. Broker may not be available.
```

## Root Cause
1. **Port Mismatch**: Application was configured to connect to `localhost:9093` but Kafka runs on `localhost:9092`
2. **Kafka Not Running**: Kafka service needs to be started

## Solution

### Option 1: Start Kafka (For Full Functionality)

1. **Start Kafka using Docker Compose**:
   ```bash
   docker-compose -f docker-compose.kafka.yml up -d
   ```

2. **Verify Kafka is running**:
   ```bash
   docker ps | grep kafka
   ```
   
   You should see:
   - `moneyplant-zookeeper` on port 2181
   - `moneyplant-kafka` on port 9092
   - `moneyplant-kafka-ui` on port 8082

3. **Check Kafka logs** (if issues):
   ```bash
   docker logs moneyplant-kafka
   ```

4. **Access Kafka UI** (optional):
   Open browser: http://localhost:8082

5. **Restart your application**:
   The warnings should disappear and data will flow through Kafka.

### Option 2: Disable Kafka (For Testing Without Kafka)

If you don't need Kafka for now, you can disable it:

1. **Update `engines/src/main/resources/application-dev.yml`**:
   ```yaml
   spring:
     kafka:
       enabled: false  # Disable Kafka
   ```

2. **Restart your application**:
   The application will run without Kafka, but you won't get Kafka-based features.

## What Was Fixed

1. **Port Configuration**: Changed from `localhost:9093` to `localhost:9092` in `application-dev.yml`
2. **Added Kafka Toggle**: Added `spring.kafka.enabled` flag for easy enable/disable

## Verifying Data Flow

Once Kafka is running, verify data is flowing:

1. **Check application logs**:
   ```
   Successfully published to Kafka topic nse-indices-ticks: partition=0, offset=123
   ```

2. **Use Kafka UI** (http://localhost:8082):
   - Navigate to Topics
   - Look for `nse-indices-ticks` topic
   - Check message count and content

3. **Use Kafka CLI** (if you have it installed):
   ```bash
   # List topics
   docker exec -it moneyplant-kafka kafka-topics --bootstrap-server localhost:9092 --list
   
   # Consume messages
   docker exec -it moneyplant-kafka kafka-console-consumer \
     --bootstrap-server localhost:9092 \
     --topic nse-indices-ticks \
     --from-beginning
   ```

## Troubleshooting

### Kafka Won't Start
```bash
# Check if ports are already in use
sudo netstat -tulpn | grep -E "9092|2181"

# Stop and remove existing containers
docker-compose -f docker-compose.kafka.yml down -v

# Start fresh
docker-compose -f docker-compose.kafka.yml up -d
```

### Still Getting Connection Errors
1. Check if Kafka is healthy:
   ```bash
   docker exec -it moneyplant-kafka kafka-broker-api-versions --bootstrap-server localhost:9092
   ```

2. Verify network connectivity:
   ```bash
   telnet localhost 9092
   ```

3. Check application configuration:
   - Ensure `spring.kafka.bootstrap-servers=localhost:9092`
   - Ensure `spring.kafka.enabled=true`

### Permission Denied for Docker
If you get permission errors:
```bash
# Add your user to docker group
sudo usermod -aG docker $USER

# Log out and back in, or run:
newgrp docker
```

## Next Steps

After Kafka is running:
1. Start your engines application
2. Trigger NSE data ingestion
3. Monitor Kafka UI to see messages flowing
4. Check application logs for successful publishes
5. Verify WebSocket subscribers receive data
