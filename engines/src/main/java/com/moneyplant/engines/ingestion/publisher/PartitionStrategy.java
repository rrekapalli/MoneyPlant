package com.moneyplant.engines.ingestion.publisher;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * Strategy for determining Kafka partition for market data messages.
 * Ensures ordered processing per symbol by consistently routing messages
 * for the same symbol to the same partition.
 * 
 * Requirements: 3.6
 */
@Component
@Slf4j
public class PartitionStrategy {

    /**
     * Determines the Kafka partition for a given symbol.
     * Uses consistent hashing to ensure all messages for the same symbol
     * go to the same partition, maintaining order.
     * 
     * @param symbol the trading symbol
     * @param numPartitions total number of partitions in the topic
     * @return partition number (0 to numPartitions-1)
     */
    public int getPartition(String symbol, int numPartitions) {
        if (symbol == null || symbol.isEmpty()) {
            log.warn("Null or empty symbol provided, using partition 0");
            return 0;
        }
        
        if (numPartitions <= 0) {
            log.warn("Invalid number of partitions: {}, using partition 0", numPartitions);
            return 0;
        }
        
        // Use absolute value of hashCode to ensure positive partition number
        int partition = Math.abs(symbol.hashCode()) % numPartitions;
        
        log.trace("Symbol {} mapped to partition {} (out of {})", symbol, partition, numPartitions);
        
        return partition;
    }

    /**
     * Determines the Kafka partition key for a given symbol.
     * The partition key is used by Kafka's default partitioner to route messages.
     * 
     * @param symbol the trading symbol
     * @return partition key (same as symbol for consistent routing)
     */
    public String getPartitionKey(String symbol) {
        return symbol != null ? symbol : "UNKNOWN";
    }
}
