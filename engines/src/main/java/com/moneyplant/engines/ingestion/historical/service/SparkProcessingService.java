package com.moneyplant.engines.ingestion.historical.service;

import com.moneyplant.engines.ingestion.historical.model.IngestionResult;
import reactor.core.publisher.Mono;

import java.nio.file.Path;

/**
 * Service interface for processing CSV files using Apache Spark.
 * Handles bulk data processing and JDBC inserts for historical data ingestion.
 * 
 * Requirements: 1.5, 1.6, 1.7, 2.2, 2.3, 2.7
 */
public interface SparkProcessingService {
    
    /**
     * Process all CSV files in the staging directory using Spark and store them in the database.
     * 
     * This method:
     * 1. Reads all CSV files from the staging directory
     * 2. Applies schema mapping and transformations
     * 3. Performs bulk insert to PostgreSQL using Spark JDBC writer
     * 4. Returns ingestion statistics
     * 
     * @param stagingDirectory the directory containing CSV files to process
     * @return Mono containing ingestion result with statistics
     */
    Mono<IngestionResult> processAndStore(Path stagingDirectory);
}
