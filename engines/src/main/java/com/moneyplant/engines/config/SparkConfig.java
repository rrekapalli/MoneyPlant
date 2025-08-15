package com.moneyplant.engines.config;

import org.springframework.context.annotation.Configuration;

/**
 * Spark configuration for the engines application
 * Temporarily commented out to avoid dependency issues
 */
@Configuration
public class SparkConfig {
    
    // Temporarily commented out to avoid dependency issues
    /*
    import org.apache.spark.SparkConf;
    import org.apache.spark.sql.SparkSession;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.context.annotation.Bean;
    */

    // Temporarily commented out to avoid dependency issues
    /*
    @Value("${spark.app-name:MoneyPlant-Engines}")
    private String appName;

    @Value("${spark.master:local[*]}")
    private String master;

    @Value("${spark.driver-memory:2g}")
    private String driverMemory;

    @Value("${spark.executor-memory:2g}")
    private String executorMemory;

    @Bean
    public SparkConf sparkConf() {
        return new SparkConf()
                .setAppName(appName)
                .setMaster(master)
                .set("spark.driver.memory", driverMemory)
                .set("spark.executor.memory", executorMemory)
                .set("spark.sql.adaptive.enabled", "true")
                .set("spark.sql.adaptive.coalescePartitions.enabled", "true")
                .set("spark.sql.adaptive.skewJoin.enabled", "true")
                .set("spark.sql.adaptive.localShuffleReader.enabled", "true")
                .set("spark.sql.adaptive.optimizeSkewedJoin.enabled", "true");
    }

    @Bean
    public SparkSession sparkSession() {
        return SparkSession.builder()
                .config(sparkConf())
                .enableHiveSupport()
                .getOrCreate();
    }
    */
}
