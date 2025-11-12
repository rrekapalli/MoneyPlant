# Data Flow Explanation - Where Does Kafka Data Go?

## Your Question
"Where are the Kafka topic outputs getting stored? I do not see any data being saved in PostgreSQL's MoneyPlant database?!"

## Answer: The Data Flow Architecture

Your system has a **circular data flow** with multiple storage/distribution points:

```
NSE WebSocket → Engines Service → Kafka → Engines Service → PostgreSQL + WebSocket Clients
     (1)              (2)           (3)         (4)                    (5)
```

### Detailed Flow:

#### 1. **NSE WebSocket** (Data Source)
- Real-time market data from NSE
- Received by `NseIndicesServiceImpl.handleTextMessage()`

#### 2. **First Processing** (Producer)
- Method: `processNseIndicesMessage()` → `publishToKafka()`
- **Action**: Publishes to Kafka topic `nse-indices-ticks`
- **Also**: Broadcasts to STOMP WebSocket subscribers (real-time frontend updates)
- **Storage**: In-memory cache (`latestIndexDataMap`)

#### 3. **Kafka** (Message Broker)
- Topic: `nse-indices-ticks`
- **Purpose**: Decouples producers from consumers
- **Storage**: Kafka's own disk-based log (temporary, configurable retention)
- **Location**: Docker volume `moneyplant_kafka-data`

#### 4. **Second Processing** (Consumer)
- Method: `consumeNseIndicesData()` with `@KafkaListener`
- **Reads from**: Kafka topic `nse-indices-ticks`
- **Consumer Group**: `engines-websocket-group`

#### 5. **Final Storage & Distribution**
The consumer does THREE things:

**a) PostgreSQL Database** ✅ (This is what you're asking about!)
```java
if (nseIndicesTickService != null) {
    nseIndicesTickService.upsertMultipleTickData(forUpsert);
    log.debug("Upserted {} flattened index ticks into nse_idx_ticks", forUpsert.size());
}
```
- **Table**: `nse_idx_ticks` (or similar)
- **Method**: `upsertMultipleTickData()` - Updates existing or inserts new
- **Data**: Flattened per-index records

**b) STOMP WebSocket** (Real-time to Frontend)
```java
messagingTemplate.convertAndSend("/topic/nse-indices", payload);
```
- **Purpose**: Real-time updates to connected web clients
- **Topics**: `/topic/nse-indices` and `/topic/nse-indices/{index-name}`

**c) In-Memory Cache**
```java
latestIndexDataMap.put(index.getIndexSymbol(), indicesData);
```
- **Purpose**: Fast access to latest values
- **Used by**: REST API endpoints

---

## Why You Might Not See Data in PostgreSQL

### Check 1: Is the Kafka Consumer Running?

Look for this log message:
```
Processing X indices from Kafka for DB upsert and WebSocket distribution
```

If you see:
```
NseIndicesTickService bean not available - skipping DB upsert
```
**Problem**: The database service bean is not available!

### Check 2: Is the Database Service Bean Available?

In `NseIndicesServiceImpl.java`:
```java
@Autowired(required = false)
private NseIndicesTickService nseIndicesTickService;
```

The `required = false` means the service is **optional**. If it's not available, data won't be saved to PostgreSQL.

### Check 3: Is the Database Table Created?

The table should be created by Hibernate/JPA. Check if it exists:

```sql
-- Connect to PostgreSQL
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant

-- List tables
\dt

-- Check if nse_idx_ticks exists
SELECT * FROM nse_idx_ticks LIMIT 5;
```

### Check 4: Are There Any Database Errors?

Look for errors in logs:
```
Error during DB upsert of flattened index ticks
```

---

## How to Verify Data is Being Saved

### 1. Check Application Logs
```bash
tail -f engines/logs/ingestion-dev.log | grep -E "Upserted|DB upsert"
```

Look for:
```
✅ Upserted 5 flattened index ticks into nse_idx_ticks (if DB enabled)
```

### 2. Check Kafka Messages
```bash
docker exec -it moneyplant-kafka kafka-console-consumer \
  --bootstrap-server localhost:9092 \
  --topic nse-indices-ticks \
  --from-beginning \
  --max-messages 5
```

### 3. Check PostgreSQL Directly
```sql
-- Connect to database
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant

-- Check recent records
SELECT 
    index_symbol, 
    last_price, 
    tick_timestamp, 
    ingestion_timestamp 
FROM nse_idx_ticks 
ORDER BY ingestion_timestamp DESC 
LIMIT 10;

-- Count total records
SELECT COUNT(*) FROM nse_idx_ticks;

-- Check latest timestamp
SELECT MAX(ingestion_timestamp) as latest_data FROM nse_idx_ticks;
```

### 4. Check if Service Bean Exists
Look for this in startup logs:
```bash
grep -i "NseIndicesTickService" engines/logs/ingestion-dev.log
```

---

## Common Issues & Solutions

### Issue 1: NseIndicesTickService Bean Not Found

**Symptom**: Log shows "NseIndicesTickService bean not available"

**Cause**: The service is not being created by Spring

**Solution**: Check if the service implementation exists and is annotated with `@Service`

```bash
# Find the service
find . -name "*NseIndicesTickService*.java"
```

### Issue 2: Database Connection Failed

**Symptom**: Errors about database connection

**Solution**: Verify PostgreSQL connection in `application-dev.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://postgres.tailce422e.ts.net:5432/MoneyPlant
    username: postgres
    password: mysecretpassword
```

Test connection:
```bash
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant -c "SELECT 1"
```

### Issue 3: Table Doesn't Exist

**Symptom**: SQL error "relation nse_idx_ticks does not exist"

**Solution**: Check Hibernate DDL setting:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Should create tables automatically
```

Or create manually:
```sql
CREATE TABLE IF NOT EXISTS nse_idx_ticks (
    id BIGSERIAL PRIMARY KEY,
    index_symbol VARCHAR(50),
    index_name VARCHAR(100),
    last_price DECIMAL(20, 4),
    variation DECIMAL(20, 4),
    percent_change DECIMAL(10, 4),
    tick_timestamp TIMESTAMP,
    ingestion_timestamp TIMESTAMP,
    source VARCHAR(50),
    -- Add other fields as needed
    UNIQUE(index_symbol, tick_timestamp)
);
```

### Issue 4: Kafka Consumer Not Starting

**Symptom**: No logs about "Received NSE indices data from Kafka"

**Cause**: Kafka listener not starting

**Solution**: Check if Kafka is enabled and listener is auto-starting:
```yaml
spring:
  kafka:
    enabled: true
```

In `KafkaConfig.java`:
```java
factory.setAutoStartup(true);  // Should be true
```

---

## Summary

**Where Kafka Data Goes:**

1. ✅ **Kafka Disk** - Temporary storage in Docker volume
2. ✅ **PostgreSQL** - Permanent storage (if `NseIndicesTickService` is available)
3. ✅ **STOMP WebSocket** - Real-time to frontend clients
4. ✅ **In-Memory Cache** - Fast access for REST APIs

**Most Likely Issue:**

The `NseIndicesTickService` bean is probably not available or not working. Check:
1. Does the service class exist?
2. Is it annotated with `@Service`?
3. Are there any database connection errors?
4. Does the table exist in PostgreSQL?

**Next Steps:**

1. Check logs for "NseIndicesTickService bean not available"
2. Verify database connection
3. Check if table exists
4. Look for database errors in logs

Let me know what you find, and I can help you fix the specific issue!
