package com.moneyplant.engines.ingestion.historical.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.ToString;
import lombok.EqualsAndHashCode;

import java.io.Serializable;
import java.time.Duration;

/**
 * Immutable data model representing the result of an ingestion operation.
 * Contains summary statistics about the ingestion process.
 * 
 * Requirements: 2.9
 */
@Getter
@Builder
@AllArgsConstructor
@ToString
@EqualsAndHashCode
public class IngestionResult implements Serializable {
    
    /**
     * Total number of dates processed
     */
    @Builder.Default
    private final int totalDatesProcessed = 0;
    
    /**
     * Total number of records encountered during ingestion
     */
    @Builder.Default
    private final int totalRecordsProcessed = 0;
    
    /**
     * Total number of records successfully inserted into the database
     */
    @Builder.Default
    private final int totalRecordsInserted = 0;
    
    /**
     * Total number of records that failed to insert
     */
    @Builder.Default
    private final int totalRecordsFailed = 0;
    
    /**
     * Total duration of the ingestion process
     */
    @Builder.Default
    private final Duration duration = Duration.ZERO;
    
    /**
     * Default constructor for empty result
     */
    public IngestionResult() {
        this.totalDatesProcessed = 0;
        this.totalRecordsProcessed = 0;
        this.totalRecordsInserted = 0;
        this.totalRecordsFailed = 0;
        this.duration = Duration.ZERO;
    }
    
    /**
     * Merges this result with another result, combining all statistics.
     * Used to aggregate results from multiple batches or parallel operations.
     * 
     * @param other the other result to merge with
     * @return a new IngestionResult containing the combined statistics
     */
    public IngestionResult merge(IngestionResult other) {
        if (other == null) {
            return this;
        }
        
        return IngestionResult.builder()
                .totalDatesProcessed(this.totalDatesProcessed + other.totalDatesProcessed)
                .totalRecordsProcessed(this.totalRecordsProcessed + other.totalRecordsProcessed)
                .totalRecordsInserted(this.totalRecordsInserted + other.totalRecordsInserted)
                .totalRecordsFailed(this.totalRecordsFailed + other.totalRecordsFailed)
                .duration(this.duration.plus(other.duration))
                .build();
    }
    
    /**
     * Calculates the success rate as a percentage
     * 
     * @return success rate (0-100)
     */
    public double getSuccessRate() {
        if (totalRecordsProcessed == 0) {
            return 0.0;
        }
        return (totalRecordsInserted * 100.0) / totalRecordsProcessed;
    }
    
    /**
     * Calculates the failure rate as a percentage
     * 
     * @return failure rate (0-100)
     */
    public double getFailureRate() {
        if (totalRecordsProcessed == 0) {
            return 0.0;
        }
        return (totalRecordsFailed * 100.0) / totalRecordsProcessed;
    }
    
    /**
     * Calculates the average processing time per date
     * 
     * @return average duration per date
     */
    public Duration getAverageDurationPerDate() {
        if (totalDatesProcessed == 0) {
            return Duration.ZERO;
        }
        return duration.dividedBy(totalDatesProcessed);
    }
    
    /**
     * Calculates the average processing time per record
     * 
     * @return average duration per record
     */
    public Duration getAverageDurationPerRecord() {
        if (totalRecordsProcessed == 0) {
            return Duration.ZERO;
        }
        return duration.dividedBy(totalRecordsProcessed);
    }
    
    /**
     * Calculates the throughput in records per second
     * 
     * @return records per second
     */
    public double getRecordsPerSecond() {
        if (duration.isZero() || totalRecordsProcessed == 0) {
            return 0.0;
        }
        return totalRecordsProcessed / (duration.toMillis() / 1000.0);
    }
    
    /**
     * Checks if the ingestion was successful (no failures)
     * 
     * @return true if all records were inserted successfully
     */
    public boolean isSuccessful() {
        return totalRecordsFailed == 0 && totalRecordsProcessed > 0;
    }
    
    /**
     * Checks if the ingestion had any failures
     * 
     * @return true if any records failed to insert
     */
    public boolean hasFailures() {
        return totalRecordsFailed > 0;
    }
}
