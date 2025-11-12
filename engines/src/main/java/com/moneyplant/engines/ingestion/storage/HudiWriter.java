package com.moneyplant.engines.ingestion.storage;

import com.moneyplant.engines.ingestion.config.HudiConfig;
import com.moneyplant.engines.ingestion.model.TickData;
import lombok.extern.slf4j.Slf4j;
import org.apache.spark.sql.Dataset;
import org.apache.spark.sql.Row;
import org.apache.spark.sql.SaveMode;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Service for writing tick data to Apache Hudi data lake.
 * Handles batch writes with partitioning by date for efficient querying.
 * 
 * Requirements: 11.1, 11.3
 */
@Component
@Slf4j
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "hudi.enabled",
    havingValue = "true",
    matchIfMissing = false
)
public class HudiWriter {
    
    private final HudiConfig hudiConfig;
    private final SparkSession sparkSession;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    
    @Autowired
    public HudiWriter(HudiConfig hudiConfig, SparkSession sparkSession) {
        this.hudiConfig = hudiConfig;
        this.sparkSession = sparkSession;
        log.info("HudiWriter initialized with base path: {}", hudiConfig.getBasePath());
    }
    
    /**
     * Write a batch of tick data to Hudi table for a specific date.
     * Data is partitioned by date for efficient querying.
     * 
     * @param ticks List of tick data to write
     * @param date Date for partitioning
     * @return Mono with count of records written
     */
    public Mono<Long> writeBatch(List<TickData> ticks, LocalDate date) {
        return Mono.fromCallable(() -> {
            if (ticks == null || ticks.isEmpty()) {
                log.warn("No tick data to write for date: {}", date);
                return 0L;
            }
            
            log.info("Writing {} ticks to Hudi for date: {}", ticks.size(), date);
            
            try {
                // Convert TickData to Spark Dataset
                Dataset<Row> tickDataset = convertToDataset(ticks, date);
                
                // Get Hudi write options
                Map<String, String> hudiOptions = hudiConfig.getAllOptions();
                
                // Write to Hudi table
                tickDataset.write()
                    .format("hudi")
                    .options(hudiOptions)
                    .mode(SaveMode.Append)
                    .save(hudiConfig.getBasePath());
                
                long recordCount = tickDataset.count();
                log.info("Successfully wrote {} records to Hudi for date: {}", recordCount, date);
                
                return recordCount;
                
            } catch (Exception e) {
                log.error("Error writing to Hudi for date: {}", date, e);
                throw new HudiWriteException("Failed to write tick data to Hudi", e);
            }
        });
    }
    
    /**
     * Convert list of TickData to Spark Dataset with date partition field.
     * 
     * @param ticks List of tick data
     * @param date Date for partitioning
     * @return Spark Dataset
     */
    private Dataset<Row> convertToDataset(List<TickData> ticks, LocalDate date) {
        String dateStr = date.format(DATE_FORMATTER);
        
        // Create a list of rows with date partition field
        List<HudiTickRecord> records = ticks.stream()
            .map(tick -> HudiTickRecord.builder()
                .symbol(tick.getSymbol())
                .timestamp(tick.getTimestamp().toEpochMilli())
                .price(tick.getPrice().doubleValue())
                .volume(tick.getVolume())
                .bid(tick.getBid() != null ? tick.getBid().doubleValue() : null)
                .ask(tick.getAsk() != null ? tick.getAsk().doubleValue() : null)
                .metadata(tick.getMetadata())
                .date(dateStr)
                .build())
            .toList();
        
        // Create Spark Dataset from records
        return sparkSession.createDataFrame(records, HudiTickRecord.class);
    }
    
    /**
     * Verify data integrity by counting records in Hudi table for a specific date.
     * 
     * @param date Date to verify
     * @return Mono with count of records
     */
    public Mono<Long> verifyRecordCount(LocalDate date) {
        return Mono.fromCallable(() -> {
            try {
                String dateStr = date.format(DATE_FORMATTER);
                
                // Read from Hudi table and filter by date
                Dataset<Row> hudiData = sparkSession.read()
                    .format("hudi")
                    .load(hudiConfig.getBasePath())
                    .filter(String.format("date = '%s'", dateStr));
                
                long count = hudiData.count();
                log.info("Verified {} records in Hudi for date: {}", count, date);
                
                return count;
                
            } catch (Exception e) {
                log.error("Error verifying record count for date: {}", date, e);
                throw new HudiWriteException("Failed to verify record count in Hudi", e);
            }
        });
    }
    
    /**
     * Get the Hudi table path.
     * 
     * @return Table path
     */
    public String getTablePath() {
        return hudiConfig.getBasePath();
    }
    
    /**
     * Get the Hudi table name.
     * 
     * @return Table name
     */
    public String getTableName() {
        return hudiConfig.getTableName();
    }
    
    /**
     * Exception thrown when Hudi write operations fail.
     */
    public static class HudiWriteException extends RuntimeException {
        public HudiWriteException(String message, Throwable cause) {
            super(message, cause);
        }
    }
    
    /**
     * Record class for Hudi tick data with date partition field.
     * This is a Java Bean for Spark Dataset creation.
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    public static class HudiTickRecord implements java.io.Serializable {
        private String symbol;
        private Long timestamp;
        private Double price;
        private Long volume;
        private Double bid;
        private Double ask;
        private String metadata;
        private String date;  // Partition field in yyyy-MM-dd format
    }
}
