# NSE Indices Real Data Implementation

## Overview

This document describes the implementation of real NSE indices data ingestion system that replaces the previous mock data generation. The system now connects to the actual NSE WebSocket endpoint, processes real-time data, and stores it in the `nse_indices_ticks` database table using UPSERT operations.

## Key Changes Made

### 1. Removed Mock Data Generation
- Eliminated all mock data generation methods from `NseIndicesServiceImpl`
- Disabled fallback mock data generation by default
- System now relies entirely on real NSE WebSocket data

### 2. New Database Entity and Repository
- **Entity**: `NseIndicesTick` - Maps to `nse_indices_ticks` table
- **Repository**: `NseIndicesTickRepository` - Handles database operations
- **Service**: `NseIndicesTickService` - Business logic for tick data management

### 3. Database Schema
The `nse_indices_ticks` table includes:
- Index information (name, symbol, prices, variations)
- Market status and timing data
- Audit fields (created_by, created_on, modified_by, modified_on)
- Unique constraint on (index_name, tick_timestamp) for UPSERT operations

### 4. UPSERT Operations
- Uses PostgreSQL's `ON CONFLICT` clause for efficient upserting
- Prevents duplicate entries while allowing updates
- Handles real-time data streaming efficiently

## Architecture

```
NSE WebSocket → NseIndicesServiceImpl → NseIndicesTickService → Database
                    ↓
                Kafka Publishing
                    ↓
                WebSocket Broadcasting
```

## Components

### 1. NseIndicesTick Entity
```java
@Entity
@Table(name = "nse_indices_ticks", schema = "public", 
       uniqueConstraints = @UniqueConstraint(columnNames = {"index_name", "tick_timestamp"}))
public class NseIndicesTick {
    // Index data fields
    // Market status fields
    // Audit fields
}
```

### 2. NseIndicesTickRepository
- `upsertTickData()` - Main UPSERT operation
- `findLatestTicksForAllIndices()` - Get latest data for all indices
- `findByIndexNameAndTickTimestampBetween()` - Time-range queries
- `deleteOldTickData()` - Cleanup operations

### 3. NseIndicesTickService
- Data conversion between DTOs and entities
- Business logic for tick data operations
- Transaction management
- Error handling and logging

### 4. NseIndicesTickController
- REST API endpoints for testing and management
- Health checks and monitoring
- Data retrieval endpoints

## Configuration

### Application Properties
```yaml
# NSE WebSocket Configuration
nse:
  websocket:
    url: wss://www.nseindia.com/streams/indices/high/drdMkt
    enabled: true
    reconnect:
      interval: 30
    fallback:
      enabled: false  # Mock data disabled

# Database Configuration
spring:
  datasource:
    url: jdbc:postgresql://your-db-host:5432/your-db-name
    username: your-username
    password: your-password
```

## Usage

### 1. Starting Ingestion
```bash
# Start the engines service
./start-engines.sh

# The service will automatically:
# - Connect to NSE WebSocket
# - Start receiving real-time data
# - Store data in nse_indices_ticks table
# - Publish to Kafka topics
# - Broadcast to WebSocket subscribers
```

### 2. Monitoring Data
```bash
# Check latest data for all indices
curl http://localhost:8081/engines/api/nse-indices-ticks/latest

# Check latest data for specific index
curl http://localhost:8081/engines/api/nse-indices-ticks/latest/NIFTY%2050

# Check total record count
curl http://localhost:8081/engines/api/nse-indices-ticks/count

# Health check
curl http://localhost:8081/engines/api/nse-indices-ticks/health
```

### 3. Database Queries
```sql
-- Get latest data for all indices
SELECT * FROM latest_nse_indices_ticks ORDER BY tick_timestamp DESC;

-- Get data for specific index within time range
SELECT * FROM nse_indices_ticks 
WHERE index_name = 'NIFTY 50' 
AND tick_timestamp BETWEEN '2024-01-01' AND '2024-01-31'
ORDER BY tick_timestamp DESC;

-- Get market summary
SELECT * FROM nse_market_summary WHERE trade_date = CURRENT_DATE;
```

## Data Flow

### 1. WebSocket Connection
- Service connects to NSE WebSocket endpoint
- Sends subscription messages for indices data
- Handles connection failures and reconnections

### 2. Data Processing
- Receives JSON messages from NSE
- Parses and validates data
- Converts to internal DTO format

### 3. Database Storage
- Converts DTO to entity
- Performs UPSERT operation
- Handles conflicts and updates

### 4. Data Distribution
- Updates local cache for WebSocket broadcasting
- Publishes to Kafka topics
- Broadcasts to subscribed clients

## Error Handling

### 1. WebSocket Failures
- Automatic reconnection attempts
- Exponential backoff strategy
- Logging of connection issues

### 2. Database Errors
- Transaction rollback on failures
- Detailed error logging
- Graceful degradation

### 3. Data Validation
- Null checks and validation
- Malformed data handling
- Source verification

## Performance Considerations

### 1. Database Optimization
- Indexes on frequently queried fields
- UPSERT operations for efficiency
- Regular cleanup of old data

### 2. Memory Management
- Limited local cache size (100 entries)
- Streaming data processing
- Efficient DTO conversion

### 3. Scalability
- Stateless service design
- Database connection pooling
- Kafka partitioning support

## Monitoring and Maintenance

### 1. Health Checks
- WebSocket connection status
- Database connectivity
- Service responsiveness

### 2. Data Quality
- Timestamp validation
- Price range checks
- Source verification

### 3. Cleanup Operations
- Automatic old data removal
- Configurable retention periods
- Manual cleanup triggers

## Troubleshooting

### 1. Connection Issues
```bash
# Check WebSocket status
curl http://localhost:8081/engines/api/nse-indices/status

# Check logs for connection errors
tail -f engines/logs/application.log | grep "WebSocket"
```

### 2. Database Issues
```bash
# Check database connectivity
curl http://localhost:8081/engines/api/nse-indices-ticks/health

# Verify table exists
psql -h your-db-host -U your-username -d your-db-name -c "\d nse_indices_ticks"
```

### 3. Data Issues
```bash
# Check data count
curl http://localhost:8081/engines/api/nse-indices-ticks/count

# Verify latest data
curl http://localhost:8081/engines/api/nse-indices-ticks/latest
```

## Future Enhancements

### 1. Data Validation
- Real-time data quality checks
- Anomaly detection
- Automated error correction

### 2. Performance Monitoring
- Response time metrics
- Throughput monitoring
- Resource utilization tracking

### 3. Advanced Analytics
- Historical trend analysis
- Predictive modeling
- Market sentiment analysis

## Conclusion

The new implementation provides a robust, scalable solution for real-time NSE indices data ingestion. By removing mock data and implementing proper database storage with UPSERT operations, the system now delivers authentic, real-time market data while maintaining high performance and reliability.

The system is designed to handle production workloads and can be easily monitored and maintained through the provided REST API endpoints and database views.
