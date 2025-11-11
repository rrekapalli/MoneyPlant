package com.moneyplant.engines.ingestion.config;

import lombok.Data;
import org.apache.hudi.common.model.HoodieTableType;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

/**
 * Configuration for Apache Hudi data lake integration.
 * Provides settings for writing tick data to Hudi tables with partitioning and optimization.
 * 
 * Requirements: 11.1, 11.3
 */
@Configuration
@ConfigurationProperties(prefix = "hudi")
@Data
public class HudiConfig {
    
    /**
     * Base path for Hudi tables (S3, HDFS, or local filesystem)
     * Example: s3://moneyplant-datalake/nse-eq-ticks or /tmp/hudi
     */
    private String basePath = "/tmp/hudi";
    
    /**
     * Hudi table name
     */
    private String tableName = "nse_eq_ticks_historical";
    
    /**
     * Key generator class for Hudi
     */
    private String keyGenerator = "org.apache.hudi.keygen.SimpleKeyGenerator";
    
    /**
     * Partition path field (date for daily partitions)
     */
    private String partitionPathField = "date";
    
    /**
     * Hudi write options
     */
    private WriteOptions writeOptions = new WriteOptions();
    
    /**
     * Hive Metastore configuration
     */
    private HiveMetastore hiveMetastore = new HiveMetastore();
    
    @Data
    public static class WriteOptions {
        /**
         * Table type: COPY_ON_WRITE or MERGE_ON_READ
         */
        private String tableType = "COPY_ON_WRITE";
        
        /**
         * Record key field (unique identifier)
         */
        private String recordkeyField = "symbol,timestamp";
        
        /**
         * Partition path field
         */
        private String partitionpathField = "date";
        
        /**
         * Pre-combine field (for deduplication)
         */
        private String precombineField = "timestamp";
        
        /**
         * Key generator class
         */
        private String keygeneratorClass = "org.apache.hudi.keygen.SimpleKeyGenerator";
        
        /**
         * Enable Hive style partitioning (date=2024-01-01)
         */
        private boolean hiveStylePartitioning = true;
        
        /**
         * Write operation: upsert, insert, bulk_insert
         */
        private String operation = "upsert";
        
        /**
         * Table name
         */
        private String tableName = "nse_eq_ticks_historical";
        
        /**
         * Base path
         */
        private String basePath = "/tmp/hudi";
        
        /**
         * Parallelism for write operations
         */
        private int parallelism = 4;
        
        /**
         * Enable inline compaction
         */
        private boolean inlineCompaction = false;
        
        /**
         * Max delta commits before compaction
         */
        private int maxDeltaCommitsBeforeCompaction = 10;
    }
    
    @Data
    public static class HiveMetastore {
        /**
         * Enable Hive sync
         */
        private boolean enabled = true;
        
        /**
         * Hive metastore URIs
         */
        private String uris = "thrift://localhost:9083";
        
        /**
         * Hive database name
         */
        private String database = "default";
        
        /**
         * Hive table name
         */
        private String table = "nse_eq_ticks_historical";
        
        /**
         * Partition fields
         */
        private String partitionFields = "date";
        
        /**
         * Partition extractor class
         */
        private String partitionExtractorClass = "org.apache.hudi.hive.MultiPartKeysValueExtractor";
        
        /**
         * JDBC URL for Hive
         */
        private String jdbcUrl = "jdbc:hive2://localhost:10000";
        
        /**
         * Username for Hive
         */
        private String username = "hive";
        
        /**
         * Password for Hive
         */
        private String password = "";
    }
    
    /**
     * Get all Hudi write options as a map
     */
    public Map<String, String> getWriteOptionsMap() {
        Map<String, String> options = new HashMap<>();
        
        options.put("hoodie.table.name", writeOptions.getTableName());
        options.put("hoodie.datasource.write.recordkey.field", writeOptions.getRecordkeyField());
        options.put("hoodie.datasource.write.partitionpath.field", writeOptions.getPartitionpathField());
        options.put("hoodie.datasource.write.precombine.field", writeOptions.getPrecombineField());
        options.put("hoodie.datasource.write.keygenerator.class", writeOptions.getKeygeneratorClass());
        options.put("hoodie.datasource.write.hive_style_partitioning", String.valueOf(writeOptions.isHiveStylePartitioning()));
        options.put("hoodie.datasource.write.operation", writeOptions.getOperation());
        options.put("hoodie.datasource.write.table.type", writeOptions.getTableType());
        options.put("hoodie.insert.shuffle.parallelism", String.valueOf(writeOptions.getParallelism()));
        options.put("hoodie.upsert.shuffle.parallelism", String.valueOf(writeOptions.getParallelism()));
        options.put("hoodie.bulkinsert.shuffle.parallelism", String.valueOf(writeOptions.getParallelism()));
        options.put("hoodie.compact.inline", String.valueOf(writeOptions.isInlineCompaction()));
        options.put("hoodie.compact.inline.max.delta.commits", String.valueOf(writeOptions.getMaxDeltaCommitsBeforeCompaction()));
        
        return options;
    }
    
    /**
     * Get Hive sync options as a map
     */
    public Map<String, String> getHiveSyncOptionsMap() {
        Map<String, String> options = new HashMap<>();
        
        if (hiveMetastore.isEnabled()) {
            options.put("hoodie.datasource.hive_sync.enable", "true");
            options.put("hoodie.datasource.hive_sync.database", hiveMetastore.getDatabase());
            options.put("hoodie.datasource.hive_sync.table", hiveMetastore.getTable());
            options.put("hoodie.datasource.hive_sync.partition_fields", hiveMetastore.getPartitionFields());
            options.put("hoodie.datasource.hive_sync.partition_extractor_class", hiveMetastore.getPartitionExtractorClass());
            options.put("hoodie.datasource.hive_sync.metastore.uris", hiveMetastore.getUris());
            options.put("hoodie.datasource.hive_sync.jdbcurl", hiveMetastore.getJdbcUrl());
            options.put("hoodie.datasource.hive_sync.username", hiveMetastore.getUsername());
            options.put("hoodie.datasource.hive_sync.password", hiveMetastore.getPassword());
            options.put("hoodie.datasource.hive_sync.mode", "hms");
        }
        
        return options;
    }
    
    /**
     * Get all Hudi options (write + hive sync)
     */
    public Map<String, String> getAllOptions() {
        Map<String, String> allOptions = new HashMap<>();
        allOptions.putAll(getWriteOptionsMap());
        allOptions.putAll(getHiveSyncOptionsMap());
        return allOptions;
    }
}
