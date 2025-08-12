package com.moneyplant.engines.storage;

import com.moneyplant.engines.model.MarketData;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service interface for data storage operations
 */
public interface DataStorageService {

    /**
     * Store market data
     * @param marketData The market data to store
     * @return CompletableFuture with the storage result
     */
    CompletableFuture<Boolean> storeMarketData(MarketData marketData);

    /**
     * Store multiple market data records
     * @param marketDataList List of market data to store
     * @return CompletableFuture with the storage result
     */
    CompletableFuture<Boolean> storeMarketDataBatch(List<MarketData> marketDataList);

    /**
     * Store data in data lake format (Parquet, Iceberg, Hudi)
     * @param data The data to store
     * @param format The storage format
     * @param tableName The table name
     * @return CompletableFuture with the storage result
     */
    CompletableFuture<Boolean> storeInDataLake(Object data, String format, String tableName);

    /**
     * Archive old market data
     * @param symbol The trading symbol
     * @param cutoffDate Cutoff date for archiving
     * @return CompletableFuture with the archiving result
     */
    CompletableFuture<Boolean> archiveMarketData(String symbol, LocalDateTime cutoffDate);

    /**
     * Compress market data
     * @param symbol The trading symbol
     * @param startDate Start date for compression
     * @param endDate End date for compression
     * @return CompletableFuture with the compression result
     */
    CompletableFuture<Boolean> compressMarketData(String symbol, LocalDateTime startDate, LocalDateTime endDate);

    /**
     * Create data partition
     * @param tableName The table name
     * @param partitionColumn The partition column
     * @param partitionValue The partition value
     * @return CompletableFuture with the partition creation result
     */
    CompletableFuture<Boolean> createDataPartition(String tableName, String partitionColumn, String partitionValue);

    /**
     * Optimize data storage
     * @param tableName The table name to optimize
     * @return CompletableFuture with the optimization result
     */
    CompletableFuture<Boolean> optimizeStorage(String tableName);

    /**
     * Get storage statistics
     * @return CompletableFuture with the storage statistics
     */
    CompletableFuture<StorageStatistics> getStorageStatistics();

    /**
     * Backup data
     * @param backupPath The backup path
     * @return CompletableFuture with the backup result
     */
    CompletableFuture<Boolean> backupData(String backupPath);

    /**
     * Restore data from backup
     * @param backupPath The backup path
     * @return CompletableFuture with the restore result
     */
    CompletableFuture<Boolean> restoreData(String backupPath);

    /**
     * Clean up temporary data
     * @return CompletableFuture with the cleanup result
     */
    CompletableFuture<Boolean> cleanupTempData();

    /**
     * Validate data integrity
     * @param tableName The table name to validate
     * @return CompletableFuture with the validation result
     */
    CompletableFuture<DataIntegrityReport> validateDataIntegrity(String tableName);
}
