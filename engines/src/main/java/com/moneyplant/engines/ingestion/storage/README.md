# Storage Layer - Apache Hudi Integration

## Overview

This package contains the Apache Hudi integration for archiving intraday tick data to the data lake. The implementation provides efficient long-term storage with support for querying via Trino, Presto, and Hive.

## Components

### HudiWriter

Main service for writing tick data to Apache Hudi tables.

**Key Features:**
- Batch write operations for daily tick data export
- Date-based partitioning for efficient querying
- Data integrity verification
- Reactive API using Project Reactor Mono
- Automatic conversion from TickData to Spark Dataset

**Usage Example:**
```java
@Autowired
private HudiWriter hudiWriter;

public void archiveData(List<TickData> ticks, LocalDate date) {
    hudiWriter.writeBatch(ticks, date)
        .doOnSuccess(count -> log.info("Wrote {} records", count))
        .subscribe();
}
```

### HiveMetastoreSync

Service for syncing Hudi tables with Hive Metastore.

**Key Features:**
- Automatic table registration after writes
- Configurable Hive Metastore connection
- Support for Trino/Presto/Hive access
- Reactive API

**Usage Example:**
```java
@Autowired
private HiveMetastoreSync hiveSync;

public void syncAfterWrite() {
    hiveSync.syncTable()
        .doOnSuccess(() -> log.info("Sync completed"))
        .subscribe();
}
```

## Configuration

### Application Properties

```yaml
hudi:
  base-path: /tmp/hudi/nse-eq-ticks
  table-name: nse_eq_ticks_historical
  write-options:
    table-type: COPY_ON_WRITE
    recordkey-field: symbol,timestamp
    partitionpath-field: date
    precombine-field: timestamp
    parallelism: 4
  hive-metastore:
    enabled: true
    uris: thrift://localhost:9083
    database: default
    table: nse_eq_ticks_historical
```

### Spark Configuration

```yaml
spark:
  app-name: MoneyPlant-Engines
  master: local[*]
  driver-memory: 2g
  executor-memory: 2g
  executor-cores: 2
```

## Data Flow

1. **Intraday Storage**: Tick data is stored in TimescaleDB `nse_eq_ticks` table during trading hours
2. **End-of-Day Export**: At market close, data is exported from TimescaleDB
3. **Hudi Write**: Data is written to Hudi table with date partitioning
4. **Hive Sync**: Table is registered in Hive Metastore
5. **Verification**: Record count is verified between source and destination
6. **Cleanup**: TimescaleDB table is truncated for next trading day

## Table Schema

### Hudi Table: nse_eq_ticks_historical

```
symbol: STRING
timestamp: LONG (epoch milliseconds)
price: DOUBLE
volume: LONG
bid: DOUBLE (nullable)
ask: DOUBLE (nullable)
metadata: STRING (nullable)
date: STRING (partition field, format: yyyy-MM-dd)
```

### Partitioning Strategy

- **Partition Field**: `date` (yyyy-MM-dd format)
- **Record Key**: `symbol,timestamp` (composite key)
- **Pre-combine Field**: `timestamp` (for deduplication)

## Querying Data

### Via Trino

```sql
SELECT symbol, timestamp, price, volume
FROM hive.default.nse_eq_ticks_historical
WHERE date = '2024-01-15'
  AND symbol = 'RELIANCE'
ORDER BY timestamp;
```

### Via Spark SQL

```scala
spark.read
  .format("hudi")
  .load("/tmp/hudi/nse-eq-ticks")
  .filter("date = '2024-01-15' AND symbol = 'RELIANCE'")
  .show()
```

## Performance Considerations

- **Table Type**: COPY_ON_WRITE for optimal read performance
- **Compression**: Snappy compression for Parquet files
- **Parallelism**: Configurable write parallelism (default: 4)
- **Compaction**: Disabled inline compaction, scheduled separately
- **Partitioning**: Date-based partitioning reduces scan overhead

## Error Handling

Both services throw custom exceptions:
- `HudiWriter.HudiWriteException`: Thrown on write failures
- `HiveMetastoreSync.HiveMetastoreSyncException`: Thrown on sync failures

These exceptions wrap the underlying cause for debugging.

## Dependencies

- Apache Hudi 0.14.0 (hudi-spark3.3-bundle)
- Apache Spark 3.3.2 (spark-core, spark-sql)
- Apache Hadoop 3.3.4 (hadoop-common, hadoop-hdfs-client)
- Project Reactor (for reactive operations)

## Future Enhancements

- Support for incremental updates
- Automatic compaction scheduling
- Multi-table support
- S3/MinIO integration for cloud storage
- Advanced partitioning strategies (by symbol, hour)
- Data quality metrics tracking
