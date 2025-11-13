package com.moneyplant.engines.ingestion.historical.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.spark.SparkConf;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import jakarta.annotation.PreDestroy;

/**
 * Configuration for Apache Spark session used for NSE historical data ingestion.
 * Configures Spark with optimal settings for CSV processing and bulk JDBC inserts.
 * 
 * Requirements: 1.5
 */
@Configuration
@Slf4j
public class HistoricalSparkConfig {
    
    @Value("${spark.app-name:NSE-Bhav-Ingestion}")
    private String appName;
    
    @Value("${spark.master:local[*]}")
    private String master;
    
    @Value("${spark.driver-memory:2g}")
    private String driverMemory;
    
    @Value("${spark.executor-memory:4g}")
    private String executorMemory;
    
    @Value("${spark.sql.adaptive.enabled:true}")
    private boolean adaptiveEnabled;
    
    @Value("${spark.sql.adaptive.coalescePartitions.enabled:true}")
    private boolean coalescePartitionsEnabled;
    
    private SparkSession sparkSession;
    
    /**
     * Create SparkSession bean for historical data ingestion.
     * Configured with optimal settings for CSV processing and bulk inserts.
     * 
     * @return SparkSession instance
     */
    @Bean(name = "historicalSparkSession")
    public SparkSession historicalSparkSession() {
        log.info("Initializing Historical SparkSession with master: {}, app: {}", master, appName);
        
        SparkConf sparkConf = new SparkConf()
            .setAppName(appName)
            .setMaster(master)
            .set("spark.driver.memory", driverMemory)
            .set("spark.executor.memory", executorMemory)
            // Adaptive query execution for optimal performance
            .set("spark.sql.adaptive.enabled", String.valueOf(adaptiveEnabled))
            .set("spark.sql.adaptive.coalescePartitions.enabled", String.valueOf(coalescePartitionsEnabled))
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
            // Logging
            .set("spark.ui.showConsoleProgress", "false")
            .set("spark.sql.warehouse.dir", "/tmp/spark-warehouse");
        
        sparkSession = SparkSession.builder()
            .config(sparkConf)
            .getOrCreate();
        
        // Set log level to WARN to reduce noise
        sparkSession.sparkContext().setLogLevel("WARN");
        
        log.info("Historical SparkSession initialized successfully");
        
        return sparkSession;
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
