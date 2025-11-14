package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.IngestionResult;
import io.github.resilience4j.reactor.retry.RetryOperator;
import io.github.resilience4j.retry.Retry;
import lombok.extern.slf4j.Slf4j;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.nio.file.Path;
import java.time.Duration;
import java.time.Instant;

import static org.apache.spark.sql.functions.*;

/**
 * Implementation of SparkProcessingService for processing CSV files using Apache Spark.
 * Handles bulk data processing and JDBC inserts for historical data ingestion.
 * 
 * Requirements: 1.5, 1.6, 1.7, 2.2, 2.3, 2.7, 1.11, 2.8
 */
@Service
@Slf4j
public class SparkProcessingServiceImpl implements SparkProcessingService {
    
    private final SparkSession spark;
    private final Retry databaseRetry;
    
    @Value("${spring.datasource.url}")
    private String jdbcUrl;
    
    @Value("${spring.datasource.username}")
    private String dbUser;
    
    @Value("${spring.datasource.password}")
    private String dbPassword;
    
    @Value("${spark.jdbc.batch-size:10000}")
    private int batchSize;
    
    @Value("${spark.jdbc.num-partitions:4}")
    private int numPartitions;
    
    @Autowired
    public SparkProcessingServiceImpl(
            @Qualifier("historicalSparkSession") SparkSession spark,
            @Qualifier("databaseRetry") Retry databaseRetry) {
        this.spark = spark;
        this.databaseRetry = databaseRetry;
    }
    
    /**
     * Process all CSV files in the staging directory using Spark and store them in the database.
     * 
     * Requirements: 1.5, 1.6, 1.7, 2.2, 2.3, 2.7, 1.11, 2.8
     */
    @Override
    public Mono<IngestionResult> processAndStore(Path stagingDirectory) {
        Instant startTime = Instant.now();
        log.info("Starting Spark processing for staging directory: {}", stagingDirectory);
        
        // 1. Check if there are any CSV files in the staging directory BEFORE calling Spark
        java.io.File stagingDir = stagingDirectory.toFile();
        
        if (!stagingDir.exists() || !stagingDir.isDirectory()) {
            log.warn("Staging directory does not exist or is not a directory: {}", stagingDirectory);
            return Mono.just(IngestionResult.builder()
                .totalRecordsProcessed(0)
                .totalRecordsInserted(0)
                .totalRecordsFailed(0)
                .duration(Duration.between(startTime, Instant.now()))
                .build());
        }
        
        java.io.File[] csvFiles = stagingDir.listFiles((dir, name) -> name.endsWith(".csv"));
        
        if (csvFiles == null || csvFiles.length == 0) {
            log.warn("No CSV files found in staging directory: {} (all dates were likely holidays/weekends)", 
                    stagingDirectory);
            return Mono.just(IngestionResult.builder()
                .totalRecordsProcessed(0)
                .totalRecordsInserted(0)
                .totalRecordsFailed(0)
                .duration(Duration.between(startTime, Instant.now()))
                .build());
        }
        
        log.info("Found {} CSV files to process in staging directory", csvFiles.length);
        for (java.io.File csvFile : csvFiles) {
            log.debug("  - {}", csvFile.getName());
        }
        
        // 2. Now proceed with Spark processing
        return Mono.fromCallable(() -> {
            try {
                // Read all CSV files from staging directory
                // Note: For cluster mode, we read files locally on driver and distribute to cluster
                String csvPath = stagingDirectory.toString() + "/*.csv";
                log.debug("Reading CSV files from local staging directory: {}", csvPath);
                
                // Use file:// prefix to ensure reading from local filesystem on driver
                Dataset<Row> df = spark.read()
                    .option("header", "true")
                    .option("inferSchema", "true")
                    .option("mode", "DROPMALFORMED")  // Skip invalid rows
                    .option("dateFormat", "dd-MMM-yyyy")
                    .csv("file://" + csvPath);
                
                long totalRecords = df.count();
                log.info("Read {} records from CSV files", totalRecords);
                
                if (totalRecords == 0) {
                    log.warn("No records found in CSV files");
                    return IngestionResult.builder()
                        .totalRecordsProcessed(0)
                        .totalRecordsInserted(0)
                        .totalRecordsFailed(0)
                        .duration(Duration.between(startTime, Instant.now()))
                        .build();
                }
                
                // 3. Apply schema mapping and transformations
                log.debug("Applying schema mapping and transformations");
                Dataset<Row> transformed = df
                    // Rename columns to match database schema
                    .withColumnRenamed("SYMBOL", "symbol")
                    .withColumnRenamed("SERIES", "series")
                    // Convert DATE1 to timestamp (TIMESTAMPTZ)
                    .withColumn("time", to_timestamp(col("DATE1"), "dd-MMM-yyyy"))
                    .withColumnRenamed("PREV_CLOSE", "prev_close")
                    .withColumnRenamed("OPEN_PRICE", "open")
                    .withColumnRenamed("HIGH_PRICE", "high")
                    .withColumnRenamed("LOW_PRICE", "low")
                    .withColumnRenamed("LAST_PRICE", "last")
                    .withColumnRenamed("CLOSE_PRICE", "close")
                    .withColumnRenamed("AVG_PRICE", "avg_price")
                    .withColumnRenamed("TTL_TRD_QNTY", "volume")
                    .withColumnRenamed("TURNOVER_LACS", "turnover_lacs")
                    .withColumnRenamed("NO_OF_TRADES", "no_of_trades")
                    .withColumnRenamed("DELIV_QTY", "deliv_qty")
                    .withColumnRenamed("DELIV_PER", "deliv_per")
                    // Add timeframe column with value '1day'
                    .withColumn("timeframe", lit("1day"))
                    // Select only the columns we need in the correct order
                    .select(
                        "time", "symbol", "series", "timeframe", "prev_close",
                        "open", "high", "low", "last", "close", "avg_price",
                        "volume", "turnover_lacs", "no_of_trades", "deliv_qty", "deliv_per"
                    )
                    // Filter out rows with null time (invalid dates)
                    .filter(col("time").isNotNull());
                
                long validRecords = transformed.count();
                long invalidRecords = totalRecords - validRecords;
                
                if (invalidRecords > 0) {
                    log.warn("Skipped {} invalid rows during transformation", invalidRecords);
                }
                
                if (validRecords == 0) {
                    log.error("No valid records after transformation");
                    return IngestionResult.builder()
                        .totalRecordsProcessed((int) totalRecords)
                        .totalRecordsInserted(0)
                        .totalRecordsFailed((int) invalidRecords)
                        .duration(Duration.between(startTime, Instant.now()))
                        .build();
                }
                
                // 4. Bulk insert to PostgreSQL using Spark JDBC writer with retry
                log.info("Writing {} valid records to PostgreSQL (batch size: {}, partitions: {})", 
                    validRecords, batchSize, numPartitions);
                
                // Wrap the Spark write operation with retry logic
                try {
                    databaseRetry.executeSupplier(() -> {
                        try {
                            transformed.write()
                                .mode(SaveMode.Append)
                                .format("jdbc")
                                .option("url", jdbcUrl)
                                .option("dbtable", "nse_eq_ohlcv_historic")
                                .option("user", dbUser)
                                .option("password", dbPassword)
                                .option("batchsize", String.valueOf(batchSize))
                                .option("numPartitions", String.valueOf(numPartitions))
                                .option("driver", "org.postgresql.Driver")
                                .option("isolationLevel", "READ_COMMITTED")
                                .option("truncate", "false")
                                .save();
                            
                            log.info("Successfully wrote {} records to database", validRecords);
                            return null;
                        } catch (Exception e) {
                            log.error("Database write failed: {}", e.getMessage());
                            throw new RuntimeException("Database write failed", e);
                        }
                    });
                } catch (Exception e) {
                    log.error("Database write failed after all retry attempts", e);
                    throw e;
                }
                
                Instant endTime = Instant.now();
                Duration duration = Duration.between(startTime, endTime);
                
                log.info("Successfully inserted {} records in {} seconds", 
                    validRecords, duration.getSeconds());
                log.info("Throughput: {} records/second", 
                    validRecords / Math.max(1, duration.getSeconds()));
                
                // 5. Return result
                return IngestionResult.builder()
                    .totalRecordsProcessed((int) totalRecords)
                    .totalRecordsInserted((int) validRecords)
                    .totalRecordsFailed((int) invalidRecords)
                    .duration(duration)
                    .build();
                
            } catch (Exception e) {
                Instant endTime = Instant.now();
                Duration duration = Duration.between(startTime, endTime);
                
                log.error("Error processing CSV files with Spark", e);
                
                // Return result with error information
                return IngestionResult.builder()
                    .totalRecordsProcessed(0)
                    .totalRecordsInserted(0)
                    .totalRecordsFailed(0)
                    .duration(duration)
                    .build();
            }
            
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
