# Kafka Producer Shutdown Fix

## Problem
The application was experiencing `KafkaException: Producer closed while send in progress` errors when the NSE WebSocket connection was closing or the application was shutting down. This occurred because:

1. Kafka messages were being sent asynchronously using `CompletableFuture`
2. The producer was being closed before pending async sends could complete
3. No graceful shutdown mechanism was in place to wait for pending operations

## Root Cause
The error occurred in the following scenario:
- WebSocket receives data and calls `publishToKafka()`
- `publishToKafka()` sends message asynchronously via `kafkaTemplate.send()`
- Before the async send completes, the application/service shuts down
- Spring closes the Kafka producer
- The pending send operation fails with "Producer closed while send in progress"

## Solution Implemented

### 1. Enhanced Cleanup Method (`NseIndicesServiceImpl.java`)
Added proper shutdown sequence in the `@PreDestroy` cleanup method:
- Stop ingestion first to prevent new messages
- Wait 2 seconds for pending Kafka operations to complete
- Gracefully shutdown the reconnect executor with timeout
- Added proper logging for troubleshooting

### 2. Improved Error Handling in `publishToKafka()`
- Added check for `kafkaEnabled` flag before attempting to publish
- Added specific handling for "Producer closed" exceptions
- Downgraded error logs to warnings when producer is closed (expected during shutdown)
- Wrapped Kafka-specific exceptions separately for better error handling

### 3. Enhanced Kafka Configuration (`KafkaConfig.java`)
- Enabled idempotence for safer retries
- Added `MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION` configuration
- Added shutdown hook to flush pending messages before JVM shutdown
- Improved producer resilience settings

## Changes Made

### File: `engines/src/main/java/com/moneyplant/engines/ingestion/service/impl/NseIndicesServiceImpl.java`

1. **Enhanced `cleanup()` method**:
   - Added 2-second wait for pending Kafka operations
   - Added graceful executor shutdown with timeout
   - Improved logging

2. **Improved `publishToKafka()` method**:
   - Added `kafkaEnabled` check
   - Added specific handling for "Producer closed" errors
   - Better exception handling for Kafka-specific errors

### File: `engines/src/main/java/com/moneyplant/engines/config/KafkaConfig.java`

1. **Enhanced `producerFactory()` method**:
   - Enabled idempotence
   - Added `MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION` setting

2. **Enhanced `kafkaTemplate()` method**:
   - Added shutdown hook to flush pending messages
   - Ensures graceful shutdown of Kafka producer

## Testing Recommendations

1. **Normal Shutdown Test**:
   - Start the application with Kafka running
   - Let it receive some NSE data
   - Gracefully stop the application
   - Verify no "Producer closed" errors in logs

2. **WebSocket Reconnection Test**:
   - Start the application
   - Trigger WebSocket disconnection/reconnection
   - Verify no errors during reconnection

3. **Kafka Unavailable Test**:
   - Start application with Kafka disabled
   - Verify graceful handling with warning logs

## Configuration

### Required Configuration Changes

1. **Producer Acks Setting** (for idempotence):
   ```yaml
   spring:
     kafka:
       producer:
         acks: all  # Required for idempotent producer
   ```

2. **Kafka Enabled Flag**:
   ```yaml
   spring:
     kafka:
       enabled: true  # default
   ```

All other existing Kafka producer/consumer settings remain unchanged.

## Benefits

1. **Eliminates Error**: No more "Producer closed while send in progress" errors
2. **Graceful Shutdown**: Pending messages are flushed before shutdown
3. **Better Logging**: Clear distinction between expected shutdown behavior and actual errors
4. **Improved Resilience**: Better handling of edge cases during shutdown/reconnection

## Monitoring

After deployment, monitor for:
- Absence of "Producer closed" errors in logs
- Successful message delivery during shutdown sequences
- Clean application shutdown without Kafka-related exceptions
