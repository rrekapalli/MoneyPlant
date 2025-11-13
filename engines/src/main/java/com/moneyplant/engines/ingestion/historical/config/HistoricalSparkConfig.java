package com.moneyplant.engines.ingestion.historical.config;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.spark.SparkConf;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.validation.annotation.Validated;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

/**
 * Configuration for Apache Spark session used for NSE historical data ingestion.
 * Configures Spark with optimal settings for CSV processing and bulk JDBC inserts.
 * Maps to 'spark' properties in application.yml.
 * 
 * Requirements: 1.5, 2.3, 2.7
 */
@Configuration
@ConfigurationProperties(prefix = "spark")
@Data
@Validated
@Slf4j
public class HistoricalSparkConfig {
    
    /**
     * Spark application name.
     * Default: NSE-Bhav-Ingestion
     * Requirement: 1.5
     */
    @NotBlank(message = "Spark app name must not be blank")
    private String appName = "NSE-Bhav-Ingestion";
    
    /**
     * Spark master URL.
     * Use 'local[*]' for local mode with all cores.
     * Use 'spark://host:port' for cluster mode.
     * Default: local[*]
     * Requirement: 1.5
     */
    @NotBlank(message = "Spark master must not be blank")
    private String master = "local[*]";
    
    /**
     * Spark driver memory allocation.
     * Default: 2g
     * Requirement: 1.5
     */
    @NotBlank(message = "Driver memory must not be blank")
    private String driverMemory = "2g";
    
    /**
     * Spark executor memory allocation.
     * Default: 4g
     * Requirement: 1.5
     */
    @NotBlank(message = "Executor memory must not be blank")
    private String executorMemory = "4g";
    
    /**
     * JDBC batch size for bulk inserts.
     * Default: 10000
     * Requirement: 2.3
     */
    @Min(value = 100, message = "JDBC batch size must be at least 100")
    private int jdbcBatchSize = 10000;
    
    /**
     * Number of parallel JDBC connections for writing.
     * Default: 4
     * Requirement: 2.7
     */
    @Min(value = 1, message = "JDBC num partitions must be at least 1")
    private int jdbcNumPartitions = 4;
    
    /**
     * Enable adaptive query execution.
     * Default: true
     */
    private boolean sqlAdaptiveEnabled = true;
    
    /**
     * Enable adaptive partition coalescing.
     * Default: true
     */
    private boolean sqlAdaptiveCoalescePartitionsEnabled = true;
    
    private SparkSession sparkSession;
    
    /**
     * Validate configuration on startup and log settings.
     * Requirement: 7.9
     */
    @PostConstruct
    public void init() {
        log.info("=== Spark Configuration ===");
        log.info("App Name: {}", appName);
        log.info("Master: {}", master);
        log.info("Driver Memory: {}", driverMemory);
        log.info("Executor Memory: {}", executorMemory);
        log.info("JDBC Batch Size: {}", jdbcBatchSize);
        log.info("JDBC Num Partitions: {}", jdbcNumPartitions);
        log.info("SQL Adaptive Enabled: {}", sqlAdaptiveEnabled);
        log.info("SQL Adaptive Coalesce Partitions: {}", sqlAdaptiveCoalescePartitionsEnabled);
        log.info("===========================");
        
        // Validate configuration
        validateConfiguration();
    }
    
    /**
     * Validate configuration values.
     * Fails fast if configuration is invalid.
     * Requirement: 7.9
     */
    private void validateConfiguration() {
        if (appName == null || appName.trim().isEmpty()) {
            throw new IllegalStateException("Spark app name must be configured");
        }
        
        if (master == null || master.trim().isEmpty()) {
            throw new IllegalStateException("Spark master must be configured");
        }
        
        if (driverMemory == null || driverMemory.trim().isEmpty()) {
            throw new IllegalStateException("Spark driver memory must be configured");
        }
        
        if (executorMemory == null || executorMemory.trim().isEmpty()) {
            throw new IllegalStateException("Spark executor memory must be configured");
        }
        
        if (jdbcBatchSize < 100) {
            throw new IllegalStateException("JDBC batch size must be at least 100");
        }
        
        if (jdbcNumPartitions < 1) {
            throw new IllegalStateException("JDBC num partitions must be at least 1");
        }
        
        log.info("Spark configuration validation passed");
    }
    
    /**
     * Create SparkSession bean for historical data ingestion.
     * Configured with optimal settings for CSV processing and bulk inserts.
     * 
     * @return SparkSession instance
     */
    @Bean(name = "historicalSparkSession")
    public SparkSession historicalSparkSession() {
        log.info("=== Starting Historical SparkSession initialization ===");
        log.info("Master: {}, App: {}", master, appName);
        
        log.info("Creating SparkConf...");
        SparkConf sparkConf = new SparkConf()
            .setAppName(appName)
            .setMaster(master)
            .set("spark.driver.memory", driverMemory)
            .set("spark.executor.memory", executorMemory)
            // Network configuration for Tailscale connectivity
            .set("spark.driver.host", "100.124.119.17") // Tailscale IP
            .set("spark.driver.bindAddress", "0.0.0.0")
            // Adaptive query execution for optimal performance
            .set("spark.sql.adaptive.enabled", String.valueOf(sqlAdaptiveEnabled))
            .set("spark.sql.adaptive.coalescePartitions.enabled", String.valueOf(sqlAdaptiveCoalescePartitionsEnabled))
            // CSV processing optimizations
            .set("spark.sql.files.maxPartitionBytes", "134217728") // 128MB per partition
            .set("spark.sql.files.openCostInBytes", "4194304") // 4MB
            // JDBC optimizations
            .set("spark.sql.execution.arrow.pyspark.enabled", "false")
            // Memory management
            .set("spark.memory.fraction", "0.8")
            .set("spark.memory.storageFraction", "0.3")
            // Shuffle optimizations
            .set("spark.shuffle.compress", "true")
            .set("spark.shuffle.spill.compress", "true")
            .set("spark.sql.shuffle.partitions", "8")
            // Serialization
            .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
            // Logging and UI
            .set("spark.ui.enabled", "false") // Disable Spark UI to avoid Jetty issues
            .set("spark.ui.showConsoleProgress", "false")
            .set("spark.sql.warehouse.dir", "/tmp/spark-warehouse");
        
        log.info("SparkConf created successfully");
        log.info("Building SparkSession...");
        
        sparkSession = SparkSession.builder()
            .config(sparkConf)
            .getOrCreate();
        
        log.info("SparkSession created successfully");
        
        // Try to set log level to WARN to reduce noise
        // This may fail with SLF4J/Logback, so we catch and ignore
        try {
            log.info("Setting Spark log level to WARN...");
            sparkSession.sparkContext().setLogLevel("WARN");
            log.info("Spark log level set successfully");
        } catch (Exception e) {
            log.warn("Could not set Spark log level (expected with SLF4J/Logback): {}", e.getMessage());
        }
        
        log.info("=== Historical SparkSession initialized successfully ===");
        
        return sparkSession;
    }
    
    /**
     * Get JDBC batch size for bulk inserts.
     * 
     * @return JDBC batch size
     */
    public int getJdbcBatchSize() {
        return jdbcBatchSize;
    }
    
    /**
     * Get number of parallel JDBC connections.
     * 
     * @return JDBC num partitions
     */
    public int getJdbcNumPartitions() {
        return jdbcNumPartitions;
    }
    
    /**
     * Clean up SparkSession on application shutdown.
     */
    @PreDestroy
    public void cleanup() {
        if (sparkSession != null) {
            log.info("Stopping Historical SparkSession");
            sparkSession.stop();
        }
    }
}
