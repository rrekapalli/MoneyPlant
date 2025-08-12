package com.moneyplant.engines.config;

import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.sql.SparkSession;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Spark configuration for MoneyPlant Engines
 */
@Configuration
public class SparkConfig {

    @Value("${spark.app.name:MoneyPlant-Engines}")
    private String appName;

    @Value("${spark.master:local[*]}")
    private String master;

    @Value("${spark.driver.memory:2g}")
    private String driverMemory;

    @Value("${spark.executor.memory:2g}")
    private String executorMemory;

    @Bean
    public SparkConf sparkConf() {
        return new SparkConf()
                .setAppName(appName)
                .setMaster(master)
                .set("spark.driver.memory", driverMemory)
                .set("spark.executor.memory", executorMemory)
                .set("spark.serializer", "org.apache.spark.serializer.KryoSerializer")
                .set("spark.sql.adaptive.enabled", "true")
                .set("spark.sql.adaptive.coalescePartitions.enabled", "true")
                .set("spark.sql.adaptive.skewJoin.enabled", "true")
                .set("spark.sql.adaptive.localShuffleReader.enabled", "true")
                .set("spark.sql.adaptive.optimizeSkewsInRebalancePartitions.enabled", "true")
                .set("spark.sql.adaptive.advisoryPartitionSizeInBytes", "128m")
                .set("spark.sql.adaptive.coalescePartitions.minPartitionSize", "1MB")
                .set("spark.sql.adaptive.coalescePartitions.maxPartitionSize", "512MB");
    }

    @Bean
    public JavaSparkContext javaSparkContext() {
        return new JavaSparkContext(sparkConf());
    }

    @Bean
    public SparkSession sparkSession() {
        return SparkSession.builder()
                .config(sparkConf())
                .config("spark.sql.warehouse.dir", "/tmp/spark-warehouse")
                .config("spark.sql.adaptive.enabled", "true")
                .config("spark.sql.adaptive.coalescePartitions.enabled", "true")
                .config("spark.sql.adaptive.skewJoin.enabled", "true")
                .config("spark.sql.adaptive.localShuffleReader.enabled", "true")
                .config("spark.sql.adaptive.optimizeSkewsInRebalancePartitions.enabled", "true")
                .config("spark.sql.adaptive.advisoryPartitionSizeInBytes", "128m")
                .config("spark.sql.adaptive.coalescePartitions.minPartitionSize", "1MB")
                .config("spark.sql.adaptive.coalescePartitions.maxPartitionSize", "512MB")
                .enableHiveSupport()
                .getOrCreate();
    }
}
