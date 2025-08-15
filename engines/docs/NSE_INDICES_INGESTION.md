# NSE Indices Data Ingestion System

## Overview

The NSE Indices Data Ingestion System is a component of the MoneyPlant Engines project that provides real-time data ingestion from the National Stock Exchange (NSE) of India. It connects to NSE's WebSocket stream, processes the data, and publishes it to Kafka topics for consumption by the backend services.

## Architecture

```
NSE WebSocket → Engines (Processing) → Kafka → Backend (Database)
```

### Components

1. **NseIndicesController** - REST API endpoints for managing ingestion
2. **NseIndicesService** - Business logic for WebSocket connection and data processing
3. **NseIndicesTickDto** - Data transfer object for NSE indices tick data
4. **KafkaConfig** - Kafka producer/consumer configuration

## Features

- Real-time WebSocket connection to NSE indices data stream
- Automatic reconnection on connection loss
- Subscription management for specific indices
- Kafka publishing with configurable topics
- REST API for monitoring and control
- Mock data generation for testing
- Connection health monitoring

## Configuration

### Application Properties

```yaml
# Kafka Configuration
kafka:
  bootstrap-servers: localhost:9092
  topics:
    nse-indices-ticks: nse-indices-ticks
  group-id: moneyplant-engines

# NSE WebSocket Configuration
nse:
  websocket:
    url: wss://www.nseindia.com/streams/indices/high/drdMkt
    reconnect:
      interval: 30

# Server Configuration
server:
  port: 8081
  servlet:
    context-path: /engines
```

### Environment Variables

- `KAFKA_BOOTSTRAP_SERVERS` - Kafka broker addresses
- `NSE_WEBSOCKET_URL` - NSE WebSocket endpoint
- `NSE_WEBSOCKET_RECONNECT_INTERVAL` - Reconnection interval in seconds

## API Endpoints

### Ingestion Management

#### Start Ingestion
```http
POST /api/nse-indices/ingestion/start
```
Starts NSE indices data ingestion and establishes WebSocket connection.

#### Stop Ingestion
```http
POST /api/nse-indices/ingestion/stop
```
Stops data ingestion and closes WebSocket connection.

#### Get Ingestion Status
```http
GET /api/nse-indices/ingestion/status
```
Returns current ingestion status, connection health, and statistics.

#### Trigger Manual Ingestion
```http
POST /api/nse-indices/ingestion/trigger
```
Manually triggers data ingestion for testing purposes.

### Subscription Management

#### Subscribe to All Indices
```http
POST /api/nse-indices/subscription/all
```
Subscribes to all available NSE indices data.

#### Subscribe to Specific Index
```http
POST /api/nse-indices/subscription/{indexName}
```
Subscribes to data for a specific index (e.g., "NIFTY 50", "SENSEX").

#### Unsubscribe from All Indices
```http
DELETE /api/nse-indices/subscription/all
```
Unsubscribes from all indices data.

#### Unsubscribe from Specific Index
```http
DELETE /api/nse-indices/subscription/{indexName}
```
Unsubscribes from a specific index.

### Data Retrieval

#### Get Latest Indices Data
```http
GET /api/nse-indices/data/latest
```
Returns the most recent ingested indices data from local cache.

#### Get Latest Index Data
```http
GET /api/nse-indices/data/{indexName}
```
Returns the most recent data for a specific index.

### Health Monitoring

#### WebSocket Health Check
```http
GET /api/nse-indices/health/websocket
```
Returns WebSocket connection status and statistics.

#### System Information
```http
GET /api/nse-indices/system/info
```
Returns system configuration and status information.

## Data Structure

### NseIndicesTickDto

```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "indices": [
    {
      "indexName": "NIFTY 50",
      "indexSymbol": "NIFTY",
      "lastPrice": 19500.50,
      "variation": 150.25,
      "percentChange": 0.78,
      "openPrice": 19350.25,
      "dayHigh": 19550.75,
      "dayLow": 19300.00,
      "previousClose": 19350.25,
      "tickTimestamp": "2024-01-15T10:30:00Z"
    }
  ],
  "marketStatus": {
    "status": "OPEN",
    "message": "Market is open for trading",
    "tradeDate": "15-01-2024",
    "marketStatusTime": "10:30:00"
  },
  "source": "NSE_WEBSOCKET",
  "ingestionTimestamp": "2024-01-15T10:30:00Z"
}
```

## Usage Examples

### Starting the System

1. **Start Kafka and Zookeeper**
   ```bash
   docker-compose up -d kafka zookeeper
   ```

2. **Start the Engines Application**
   ```bash
   mvn spring-boot:run -pl engines
   ```

3. **Start NSE Indices Ingestion**
   ```bash
   curl -X POST http://localhost:8081/engines/api/nse-indices/ingestion/start
   ```

4. **Subscribe to All Indices**
   ```bash
   curl -X POST http://localhost:8081/engines/api/nse-indices/subscription/all
   ```

### Monitoring

1. **Check Ingestion Status**
   ```bash
   curl http://localhost:8081/engines/api/nse-indices/ingestion/status
   ```

2. **Monitor WebSocket Health**
   ```bash
   curl http://localhost:8081/engines/api/nse-indices/health/websocket
   ```

3. **View Latest Data**
   ```bash
   curl http://localhost:8081/engines/api/nse-indices/data/latest
   ```

### Testing

1. **Trigger Manual Ingestion**
   ```bash
   curl -X POST http://localhost:8081/engines/api/nse-indices/ingestion/trigger
   ```

2. **Subscribe to Specific Index**
   ```bash
   curl -X POST http://localhost:8081/engines/api/nse-indices/subscription/NIFTY%2050
   ```

## Kafka Topics

### nse-indices-ticks

- **Partitions**: 3
- **Replication Factor**: 1
- **Message Format**: JSON (NseIndicesTickDto)
- **Key**: `nse-indices-{timestamp}`
- **Value**: Serialized NSE indices tick data

### Message Flow

1. NSE WebSocket sends real-time indices data
2. Engines service processes and validates the data
3. Data is published to Kafka topic with timestamp-based keys
4. Backend services consume from Kafka and store in PostgreSQL
5. Data is available for real-time dashboards and analysis

## Error Handling

### Connection Failures

- Automatic reconnection with configurable intervals
- Exponential backoff for repeated failures
- Logging of connection attempts and failures

### Data Processing Errors

- Individual message processing failures don't stop the system
- Failed messages are logged with detailed error information
- Graceful degradation when parsing fails

### Kafka Publishing Errors

- Asynchronous publishing with completion callbacks
- Failed publishes are logged but don't block data ingestion
- Retry mechanism for transient failures

## Performance Considerations

### WebSocket Connection

- Single WebSocket connection shared across all subscriptions
- Efficient message parsing and validation
- Minimal memory footprint for connection management

### Kafka Publishing

- Batch processing for improved throughput
- Configurable producer settings for latency vs. throughput
- Async publishing to avoid blocking data ingestion

### Memory Management

- Limited cache size (100 entries) to prevent memory leaks
- Automatic cleanup of old data
- Efficient data structures for fast lookups

## Security Considerations

- WebSocket connection to NSE uses standard protocols
- No authentication required for NSE data stream
- Kafka security should be configured according to deployment requirements
- REST API endpoints should be secured in production environments

## Troubleshooting

### Common Issues

1. **WebSocket Connection Failures**
   - Check NSE service availability
   - Verify network connectivity
   - Review reconnection logs

2. **Kafka Publishing Issues**
   - Verify Kafka broker connectivity
   - Check topic configuration
   - Review producer logs

3. **Data Processing Errors**
   - Check JSON message format
   - Verify DTO field mappings
   - Review parsing logs

### Logs

- **Application Logs**: `com.moneyplant.engines`
- **Kafka Logs**: `org.springframework.kafka`
- **WebSocket Logs**: `org.springframework.web.socket`

### Metrics

- Messages received and published
- Connection uptime and health
- Processing latency and throughput

## Development

### Building

```bash
mvn clean install -pl engines
```

### Running Tests

```bash
mvn test -pl engines
```

### Local Development

1. Start required services (Kafka, PostgreSQL)
2. Configure application properties
3. Run the application
4. Use provided REST endpoints for testing

## Future Enhancements

- Support for additional NSE data streams
- Advanced filtering and transformation capabilities
- Real-time data validation and quality checks
- Integration with additional messaging systems
- Enhanced monitoring and alerting
- Support for historical data replay
