package com.moneyplant.engines.ingestion.storage;

import com.moneyplant.engines.ingestion.config.HudiConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.hudi.sync.common.HoodieSyncConfig;
import org.apache.hudi.hive.HiveSyncTool;
import org.apache.hadoop.conf.Configuration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.Properties;

/**
 * Service for syncing Hudi tables with Hive Metastore.
 * Automatically registers tables after write operations for Trino/Presto access.
 * 
 * Requirements: 11.7
 */
@Component
@Slf4j
public class HiveMetastoreSync {
    
    private final HudiConfig hudiConfig;
    private final Configuration hadoopConf;
    
    @Autowired
    public HiveMetastoreSync(HudiConfig hudiConfig) {
        this.hudiConfig = hudiConfig;
        this.hadoopConf = new Configuration();
        log.info("HiveMetastoreSync initialized");
    }
    
    /**
     * Sync Hudi table with Hive Metastore.
     * This makes the table queryable via Trino, Presto, and Hive.
     * 
     * @return Mono indicating completion
     */
    public Mono<Void> syncTable() {
        return Mono.fromRunnable(() -> {
            if (!hudiConfig.getHiveMetastore().isEnabled()) {
                log.info("Hive Metastore sync is disabled");
                return;
            }
            
            try {
                log.info("Starting Hive Metastore sync for table: {}", 
                    hudiConfig.getHiveMetastore().getTable());
                
                // Create Hive sync configuration
                Properties props = createHiveSyncProperties();
                
                // Create and execute Hive sync tool
                HiveSyncTool hiveSyncTool = new HiveSyncTool(props, hadoopConf);
                hiveSyncTool.syncHoodieTable();
                
                log.info("Successfully synced Hudi table to Hive Metastore: {}.{}", 
                    hudiConfig.getHiveMetastore().getDatabase(),
                    hudiConfig.getHiveMetastore().getTable());
                
            } catch (Exception e) {
                log.error("Error syncing Hudi table to Hive Metastore", e);
                throw new HiveMetastoreSyncException("Failed to sync table to Hive Metastore", e);
            }
        });
    }
    
    /**
     * Create Hive sync properties from Hudi configuration.
     * 
     * @return Properties for Hive sync
     */
    private Properties createHiveSyncProperties() {
        Properties props = new Properties();
        
        HudiConfig.HiveMetastore hiveConfig = hudiConfig.getHiveMetastore();
        
        // Basic Hudi table properties
        props.setProperty(HoodieSyncConfig.META_SYNC_BASE_PATH.key(), hudiConfig.getBasePath());
        props.setProperty(HoodieSyncConfig.META_SYNC_DATABASE_NAME.key(), hiveConfig.getDatabase());
        props.setProperty(HoodieSyncConfig.META_SYNC_TABLE_NAME.key(), hiveConfig.getTable());
        props.setProperty(HoodieSyncConfig.META_SYNC_PARTITION_FIELDS.key(), hiveConfig.getPartitionFields());
        
        // Hive Metastore connection properties
        props.setProperty("hoodie.datasource.hive_sync.metastore.uris", hiveConfig.getUris());
        props.setProperty("hoodie.datasource.hive_sync.jdbcurl", hiveConfig.getJdbcUrl());
        props.setProperty("hoodie.datasource.hive_sync.username", hiveConfig.getUsername());
        props.setProperty("hoodie.datasource.hive_sync.password", hiveConfig.getPassword());
        
        // Partition extractor
        props.setProperty(HoodieSyncConfig.META_SYNC_PARTITION_EXTRACTOR_CLASS.key(), 
            hiveConfig.getPartitionExtractorClass());
        
        // Sync mode
        props.setProperty("hoodie.datasource.hive_sync.mode", "hms");
        
        // Enable Hive style partitioning
        props.setProperty("hoodie.datasource.hive_sync.use_jdbc", "false");
        props.setProperty("hoodie.datasource.hive_sync.support_timestamp", "true");
        
        return props;
    }
    
    /**
     * Check if Hive Metastore sync is enabled.
     * 
     * @return true if enabled
     */
    public boolean isSyncEnabled() {
        return hudiConfig.getHiveMetastore().isEnabled();
    }
    
    /**
     * Get the Hive database name.
     * 
     * @return Database name
     */
    public String getDatabaseName() {
        return hudiConfig.getHiveMetastore().getDatabase();
    }
    
    /**
     * Get the Hive table name.
     * 
     * @return Table name
     */
    public String getTableName() {
        return hudiConfig.getHiveMetastore().getTable();
    }
    
    /**
     * Exception thrown when Hive Metastore sync operations fail.
     */
    public static class HiveMetastoreSyncException extends RuntimeException {
        public HiveMetastoreSyncException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
