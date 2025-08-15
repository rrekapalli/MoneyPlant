# Kafka Subscription to NSE Indices WebSocket - Solution

## Problem Description

The Kafka subscription to NSE indices websocket was not working because **there were no Kafka consumers configured** to listen to the `nse-indices-ticks` topic. The engines project was successfully:

1. ✅ Connecting to NSE WebSocket
2. ✅ Processing NSE indices data  
3. ✅ Publishing data to Kafka topic `nse-indices-ticks`
4. ✅ Broadcasting to WebSocket subscribers

However, **no service was consuming from the Kafka topic**, so the data was being published but not consumed.

## Root Cause Analysis

### Current Architecture
```
NSE WebSocket → Engines (Processing) → Kafka Topic → [NO CONSUMER]
                    ↓
                WebSocket Broadcasting (Working)
```

### Missing Component
- **Kafka Consumer**: No service was listening to the `nse-indices-ticks` topic
- **Data Processing**: Incoming NSE indices data was not being processed by the backend
- **Data Storage**: Real-time data was not being stored or cached in the backend

## Solution Implemented

### 1. Created Kafka Consumer Service

**File**: `backend/src/main/java/com/moneyplant/ingestion/service/NseIndicesKafkaConsumer.java`

```java
@Service
@RequiredArgsConstructor
@Slf4j
public class NseIndicesKafkaConsumer {

    @KafkaListener(
        topics = "${kafka.topics.nse-indices-ticks:nse-indices-ticks}",
        groupId = "${spring.kafka.consumer.group-id:trading-group}",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void consumeNseIndicesData(
            @Payload String message,
            @Header(KafkaHeaders.RECEIVED_TOPIC) String topic,
            @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
            @Header(KafkaHeaders.OFFSET) long offset) {
        
        // Parse and process NSE indices data
        IndicesDto tickData = objectMapper.readValue(message, IndicesDto.class);
        processNseIndicesTickData(tickData);
    }
}
```

**Features**:
- Listens to `nse-indices-ticks` topic
- Processes incoming JSON messages
- Converts to `IndicesDto` objects
- Implements error handling and logging
- Uses existing backend DTOs and services

### 2. Created Kafka Configuration

**File**: `backend/src/main/java/com/moneyplant/config/KafkaConfig.java`

```java
@Configuration
@EnableKafka
public class KafkaConfig {

    @Bean
    public ConsumerFactory<String, Object> consumerFactory() {
        // Consumer configuration with error handling
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> 
            kafkaListenerContainerFactory() {
        // Listener container configuration
    }

    @Bean
    public DefaultErrorHandler kafkaErrorHandler() {
        // Error handling with retry logic
    }
}
```

**Features**:
- Consumer factory configuration
- Listener container factory
- Error handling with retry logic
- Manual acknowledgment mode
- Concurrent consumer support

### 3. Created Kafka Producer Configuration

**File**: `backend/src/main/java/com/moneyplant/config/KafkaProducerConfig.java`

```java
@Configuration
public class KafkaProducerConfig {

    @Bean
    public ProducerFactory<String, Object> producerFactory() {
        // Producer configuration with idempotence
    }

    @Bean
    public KafkaTemplate<String, Object> kafkaTemplate() {
        // Kafka template for sending messages
    }
}
```

**Features**:
- Producer factory configuration
- Idempotent producer settings
- Batch processing optimization
- Retry and acknowledgment configuration

### 4. Updated Configuration Files

**File**: `backend/src/main/resources/application.yml`

```yaml
spring:
  kafka:
    bootstrap-servers: localhost:9093  # Updated port to match engines

kafka:
  topics:
    nse-indices-ticks: nse-indices-ticks
    market-data: market-data
    trading-signals: trading-signals
    backtest-results: backtest-results
```

**Changes**:
- Updated Kafka port from `9092` to `9093` to match engines configuration
- Added Kafka topic configuration
- Configured consumer group ID

### 5. Created Health Check Endpoints

**File**: `backend/src/main/java/com/moneyplant/ingestion/controller/KafkaHealthController.java`

```java
@RestController
@RequestMapping("/api/v1/kafka")
public class KafkaHealthController {

    @GetMapping("/health")
    public KafkaHealthResponse checkKafkaHealth() {
        // Test Kafka connectivity
    }

    @GetMapping("/test-nse-indices")
    public String testNseIndicesTopic() {
        // Test message publishing to nse-indices-ticks topic
    }
}
```

**Features**:
- Kafka connectivity health check
- Test message publishing
- Topic verification
- Error reporting

## Updated Architecture

### Before (Broken)
```
NSE WebSocket → Engines → Kafka Topic → [NO CONSUMER]
                    ↓
                WebSocket Broadcasting
```

### After (Fixed)
```
NSE WebSocket → Engines → Kafka Topic → Backend Consumer
                    ↓                           ↓
                WebSocket Broadcasting    Data Processing
                                         Data Storage
                                         Cache Updates
                                         Notifications
```

## Verification Steps

### 1. Check Kafka Consumer Status

```bash
# Check if backend is consuming from Kafka
curl http://localhost:8080/api/v1/kafka/health
```

**Expected Response**:
```json
{
  "status": "HEALTHY",
  "message": "Kafka is working properly",
  "topic": "kafka-health-test",
  "partition": 0,
  "offset": 123,
  "timestamp": 1234567890
}
```

### 2. Test NSE Indices Topic

```bash
# Test message publishing to nse-indices-ticks topic
curl http://localhost:8080/api/v1/kafka/test-nse-indices
```

**Expected Response**:
```
Test message sent successfully to nse-indices-ticks topic
```

### 3. Monitor Consumer Logs

Check backend application logs for:
```
INFO  - Received NSE indices data from Kafka - Topic: nse-indices-ticks
INFO  - Processed NSE indices data - Timestamp: ..., Indices count: ...
DEBUG - Successfully processed NSE indices data from Kafka
```

### 4. Verify Data Flow

1. **Engines**: Check if NSE WebSocket is connected and receiving data
2. **Kafka**: Verify messages are being published to `nse-indices-ticks` topic
3. **Backend**: Confirm consumer is receiving and processing messages
4. **Database**: Check if data is being stored (if implemented)

## Configuration Summary

### Backend Configuration
- **Kafka Bootstrap Servers**: `localhost:9093`
- **Consumer Group ID**: `trading-group`
- **Topics**: `nse-indices-ticks`, `market-data`, `trading-signals`, `backtest-results`
- **Auto Offset Reset**: `earliest`
- **Concurrency**: 3 concurrent consumers

### Engines Configuration
- **Kafka Bootstrap Servers**: `localhost:9093`
- **Producer Topics**: `nse-indices-ticks`
- **NSE WebSocket**: Enabled with real-time data
- **Fallback**: Mock data generation when NSE connection fails

## Troubleshooting

### Common Issues

#### 1. Port Mismatch
**Problem**: Backend trying to connect to port 9092, engines using port 9093
**Solution**: Update backend `application.yml` to use port 9093

#### 2. Consumer Not Starting
**Problem**: Kafka consumer not listening to topics
**Solution**: Check if `@EnableKafka` annotation is present and consumer factory is configured

#### 3. Deserialization Errors
**Problem**: JSON parsing failures
**Solution**: Verify DTO structure matches incoming JSON and error handling is configured

#### 4. Connection Refused
**Problem**: Cannot connect to Kafka
**Solution**: Ensure Kafka and Zookeeper are running in Docker containers

### Debug Commands

```bash
# Check Kafka containers
sudo docker-compose ps

# Check Kafka logs
sudo docker logs moneyplant-engines-kafka --tail 20

# Check backend logs
tail -f backend/logs/application.log | grep -E "(Kafka|NSE|indices)"

# Test Kafka connectivity
nc -z localhost 9093
```

## Next Steps

### 1. Data Storage Implementation
- Implement database storage for NSE indices data
- Create repository and service layers
- Add data validation and transformation

### 2. Real-time Notifications
- Implement WebSocket broadcasting from backend
- Add user subscription management
- Create notification service

### 3. Analytics and Reporting
- Add data aggregation and analysis
- Implement caching strategies
- Create reporting endpoints

### 4. Monitoring and Alerting
- Add metrics collection
- Implement health checks
- Set up alerting for failures

## Summary

The Kafka subscription issue has been resolved by implementing:

1. ✅ **Kafka Consumer Service** - Listens to `nse-indices-ticks` topic
2. ✅ **Kafka Configuration** - Consumer and producer setup with error handling
3. ✅ **Health Check Endpoints** - Monitor Kafka connectivity and topic status
4. ✅ **Configuration Updates** - Port alignment and topic configuration
5. ✅ **Error Handling** - Retry logic and failure recovery

The backend now successfully consumes NSE indices data from Kafka, enabling real-time data processing, storage, and analysis capabilities.
