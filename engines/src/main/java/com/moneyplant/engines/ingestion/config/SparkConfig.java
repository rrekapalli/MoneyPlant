package com.moneyplant.engines.ingestion.config;

import lombok.extern.slf4j.Slf4j;
import org.apache.spark.SparkConf;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration for Apache Spark session used by Hudi writer.
 * Configures Spark with Hudi extensions and optimizations.
 * 
 * Requirements: 11.1, 11.3
 */
@Configuration
@Slf4j
@org.springframework.boot.autoconfigure.condition.ConditionalOnProperty(
    name = "hudi.enabled",
    havingValue = "true",
    matchIfMissing = false
)
public class SparkConfig {
    
    @Value("${spark.app-name:MoneyPlant-Engines}")
    private String appName;
    
    @Value("${spark.master:local[*]}")
    private String master;
    
    @Value("${spark.driver-memory:2g}")
    private String driverMemory;
    
    @Value("${spark.executor-memory:2g}")
    private String executorMemory;
    
    @Value("${spark.executor-cores:2}")
    private String executorCores;
    
    /**
     * Create SparkSession bean for Hudi operations.
     * Configured with Hudi extensions and optimizations.
     * 
     * @return SparkSession instance
     */
    @Bean
    public SparkSession sparkSession() {
        log.info("Initializing SparkSession with master: {}, app: {}", master, appName);
        
        SparkConf sparkConf = new SparkConf()
            .setAppName(appName)
            .setMaster(master)
            .set("spark.driver.memory", driverMemory)
            .set("spark.executor.memory", executorMemory)
            .set("spark.executor.cores", executorCores)
            // Hudi specific configurations
            .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
            .set("spark.sql.extensions", "org.apache.spark.sql.hudi.HoodieSparkSessionExtension")
            .set("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.hudi.catalog.HoodieCatalog")
            // Adaptive query execution
            .set("spark.sql.adaptive.enabled", "true")
            .set("spark.sql.adaptive.coalescePartitions.enabled", "true")
            // Parquet optimizations
            .set("spark.sql.parquet.compression.codec", "snappy")
            .set("spark.sql.parquet.mergeSchema", "false")
            .set("spark.sql.parquet.filterPushdown", "true")
            // Memory management
            .set("spark.memory.fraction", "0.8")
            .set("spark.memory.storageFraction", "0.3")
            // Shuffle optimizations
            .set("spark.shuffle.compress", "true")
            .set("spark.shuffle.spill.compress", "true")
            // Logging
            .set("spark.ui.showConsoleProgress", "false")
            .set("spark.sql.warehouse.dir", "/tmp/spark-warehouse");
        
        SparkSession session = SparkSession.builder()
            .config(sparkConf)
            .getOrCreate();
        
        // Set log level to WARN to reduce noise
        session.sparkContext().setLogLevel("WARN");
        
        log.info("SparkSession initialized successfully");
        
        return session;
    }
}
