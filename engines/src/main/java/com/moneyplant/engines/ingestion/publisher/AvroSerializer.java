package com.moneyplant.engines.ingestion.publisher;

import com.moneyplant.engines.ingestion.model.OhlcvData;
import com.moneyplant.engines.ingestion.model.TickData;
import lombok.extern.slf4j.Slf4j;
import org.apache.avro.Schema;
import org.apache.avro.generic.GenericData;
import org.apache.avro.generic.GenericRecord;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;

/**
 * Utility class for serializing TickData and OhlcvData to Avro GenericRecord format.
 * Handles conversion from domain models to Avro-compatible records for Kafka publishing.
 * 
 * Requirements: 3.5
 */
@Component
@Slf4j
public class AvroSerializer {

    private final Schema tickDataSchema;
    private final Schema ohlcvDataSchema;

    public AvroSerializer() {
        this.tickDataSchema = loadSchema("avro/tick-data.avsc");
        this.ohlcvDataSchema = loadSchema("avro/ohlcv-data.avsc");
    }

    /**
     * Converts TickData to Avro GenericRecord
     * 
     * @param tickData the tick data to serialize
     * @return Avro GenericRecord
     */
    public GenericRecord serializeTickData(TickData tickData) {
        GenericRecord record = new GenericData.Record(tickDataSchema);
        
        record.put("symbol", tickData.getSymbol());
        record.put("timestamp", tickData.getTimestamp().toEpochMilli());
        record.put("price", tickData.getPrice().toString());
        record.put("volume", tickData.getVolume());
        record.put("bid", tickData.getBid() != null ? tickData.getBid().toString() : null);
        record.put("ask", tickData.getAsk() != null ? tickData.getAsk().toString() : null);
        record.put("metadata", tickData.getMetadata());
        
        return record;
    }

    /**
     * Converts OhlcvData to Avro GenericRecord
     * 
     * @param ohlcvData the OHLCV data to serialize
     * @return Avro GenericRecord
     */
    public GenericRecord serializeOhlcvData(OhlcvData ohlcvData) {
        GenericRecord record = new GenericData.Record(ohlcvDataSchema);
        
        record.put("symbol", ohlcvData.getSymbol());
        record.put("timestamp", ohlcvData.getTimestamp().toEpochMilli());
        record.put("timeframe", ohlcvData.getTimeframe().getCode());
        record.put("open", ohlcvData.getOpen().toString());
        record.put("high", ohlcvData.getHigh().toString());
        record.put("low", ohlcvData.getLow().toString());
        record.put("close", ohlcvData.getClose().toString());
        record.put("volume", ohlcvData.getVolume());
        record.put("vwap", ohlcvData.getVwap() != null ? ohlcvData.getVwap().toString() : null);
        record.put("tradeCount", ohlcvData.getTradeCount());
        
        return record;
    }

    /**
     * Loads Avro schema from classpath resource
     * 
     * @param schemaPath path to schema file
     * @return parsed Avro schema
     */
    private Schema loadSchema(String schemaPath) {
        try {
            ClassPathResource resource = new ClassPathResource(schemaPath);
            try (InputStream inputStream = resource.getInputStream()) {
                return new Schema.Parser().parse(inputStream);
            }
        } catch (IOException e) {
            log.error("Failed to load Avro schema from {}", schemaPath, e);
            throw new RuntimeException("Failed to load Avro schema: " + schemaPath, e);
        }
    }

    /**
     * Gets the TickData Avro schema
     * 
     * @return TickData schema
     */
    public Schema getTickDataSchema() {
        return tickDataSchema;
    }

    /**
     * Gets the OhlcvData Avro schema
     * 
     * @return OhlcvData schema
     */
    public Schema getOhlcvDataSchema() {
        return ohlcvDataSchema;
    }
}
