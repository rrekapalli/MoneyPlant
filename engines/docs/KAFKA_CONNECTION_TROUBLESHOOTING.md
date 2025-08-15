# Kafka Connection Troubleshooting Guide

## Problem Description

The application is failing to start with the following error:

```
Connection to node -1 (localhost/127.0.0.1:9092) could not be established. Broker may not be available.
Timed out waiting for a node assignment. Call: fetchMetadata
Could not configure topics
org.springframework.kafka.KafkaException: Timed out waiting to get existing topics
```

## Root Cause

This error occurs because:

1. **Port Mismatch**: The application is trying to connect to `localhost:9092`, but Kafka is running on port `9093`
2. **Docker Networking**: Kafka is running in Docker containers, but the application can't reach it
3. **Configuration Mismatch**: The application configuration doesn't match the Docker Compose setup

## Solution

### 1. **Update Application Configuration**

The configuration files have been updated to use the correct Kafka port:

**File**: `engines/src/main/resources/application.yml`
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9093  # Changed from 9092 to 9093
```

**File**: `engines/src/main/resources/application-dev.yml`
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9093  # Changed from 9092 to 9093
```

### 2. **Verify Docker Compose Configuration**

Your Docker Compose file exposes Kafka on port `9093`:

```yaml
kafka:
  ports:
    - "9093:9093"  # Host port 9093 maps to container port 9093
  environment:
    KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:29092,PLAINTEXT_HOST://localhost:9093
```

### 3. **Start Kafka Services**

Ensure Kafka and Zookeeper are running:

```bash
cd engines
docker-compose up -d kafka zookeeper
```

### 4. **Check Service Status**

Use the provided scripts to check Kafka connectivity:

**Linux/Mac:**
```bash
./scripts/check-kafka.sh
```

**Windows:**
```cmd
scripts\check-kafka.bat
```

## Configuration Changes Made

### 1. **Application Properties**
- ✅ Updated `bootstrap-servers` from `localhost:9092` to `localhost:9093`
- ✅ Added Kafka admin configuration to prevent startup failures
- ✅ Made Kafka optional during startup

### 2. **Kafka Configuration Class**
- ✅ Updated `KafkaConfig.java` to use correct port configuration
- ✅ Added resilience configurations for connection issues
- ✅ Made Kafka listeners more robust

### 3. **Docker Compose**
- ✅ Kafka exposed on port `9093` (not `9092`)
- ✅ Proper network configuration for container communication

## Verification Steps

### 1. **Check Docker Containers**
```bash
docker ps | grep kafka
docker ps | grep zookeeper
```

### 2. **Check Port Accessibility**
```bash
# Linux/Mac
nc -z localhost 9093

# Windows
netstat -an | findstr ":9093"
```

### 3. **Check Kafka Logs**
```bash
docker logs moneyplant-engines-kafka
docker logs moneyplant-engines-zookeeper
```

### 4. **Test Kafka Connection**
```bash
# If you have kafka-console-consumer installed
kafka-console-consumer --bootstrap-server localhost:9093 --topic test --from-beginning
```

## Common Issues and Solutions

### Issue 1: Port Already in Use
**Error**: `Address already in use`

**Solution**: 
```bash
# Check what's using port 9093
netstat -tulpn | grep :9093

# Stop conflicting service or change port in docker-compose.yml
```

### Issue 2: Docker Network Issues
**Error**: `Connection refused`

**Solution**:
```bash
# Restart Docker network
docker network prune
docker-compose down
docker-compose up -d
```

### Issue 3: Zookeeper Not Ready
**Error**: `Kafka fails to start`

**Solution**:
```bash
# Wait for Zookeeper to be ready
docker logs moneyplant-engines-zookeeper | grep "binding to port"

# Start services in order
docker-compose up -d zookeeper
sleep 10
docker-compose up -d kafka
```

### Issue 4: Application Still Can't Connect
**Error**: Application startup fails

**Solution**:
1. Verify port configuration in `application.yml`
2. Check if Kafka is accessible from host machine
3. Restart application after Kafka is running

## Alternative Solutions

### Option 1: Use Different Port
If port `9093` conflicts with other services:

1. **Update Docker Compose**:
```yaml
kafka:
  ports:
    - "9094:9093"  # Change host port to 9094
```

2. **Update Application**:
```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9094
```

### Option 2: Disable Kafka Temporarily
If you don't need Kafka immediately:

1. **Update Application**:
```yaml
spring:
  kafka:
    enabled: false
```

2. **Comment out Kafka dependencies** in your service classes

### Option 3: Use Docker Host Network
For development only:

```yaml
kafka:
  network_mode: host
  # Remove ports section
```

## Testing the Fix

### 1. **Start Kafka Services**
```bash
cd engines
docker-compose up -d kafka zookeeper
```

### 2. **Wait for Services to Start**
```bash
# Check logs
docker logs moneyplant-engines-kafka | grep "started"
```

### 3. **Start Application**
```bash
mvn spring-boot:run
```

### 4. **Verify Connection**
Check application logs for successful Kafka connection.

## Prevention

To prevent this issue in the future:

1. **Port Consistency**: Always use the same port in Docker Compose and application configuration
2. **Service Dependencies**: Ensure Zookeeper starts before Kafka
3. **Health Checks**: Use the provided scripts to verify service health
4. **Configuration Validation**: Validate configuration before starting services

## Support

If you continue to experience issues:

1. **Run the diagnostic scripts** to identify the problem
2. **Check Docker logs** for detailed error messages
3. **Verify network configuration** and port accessibility
4. **Ensure services are running** in the correct order

## Summary

The Kafka connection issue was caused by a port mismatch between the application configuration (`localhost:9092`) and the Docker Compose setup (port `9093`). The solution involves:

1. ✅ **Updating application configuration** to use port `9093`
2. ✅ **Ensuring Kafka services are running** via Docker Compose
3. ✅ **Verifying network connectivity** between host and containers
4. ✅ **Making Kafka optional** to prevent startup failures

After applying these changes, your application should start successfully and connect to Kafka running in Docker.
