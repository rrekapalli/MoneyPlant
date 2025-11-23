package com.moneyplant.engines.ingestion.kite;

import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMaster;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMasterId;
import com.moneyplant.engines.ingestion.kite.repository.KiteBatchRepository;
import com.moneyplant.engines.ingestion.kite.repository.KiteInstrumentMasterRepository;
import net.jqwik.api.*;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for upsert operations.
 * Tests Properties 6, 7, and 8 related to upsert behavior.
 */
@SpringBootTest
@TestPropertySource(properties = {
    "spring.flyway.enabled=true",
    "spring.jpa.hibernate.ddl-auto=validate"
})
@Tag("property-test")
public class UpsertPropertyTests {

    @Autowired
    private KiteBatchRepository batchRepository;
    
    @Autowired
    private KiteInstrumentMasterRepository repository;

    /**
     * Property 6: Upsert idempotence
     * For any instrument, performing an upsert operation multiple times with the same data
     * must result in exactly one record in the database with the latest data.
     * Validates: Requirements 3.2
     */
    @Property(tries = 10)
    @Tag("property-test")
    void upsertIsIdempotent(@ForAll @IntRange(min = 2, max = 5) int repeatCount) {
        // Create a test instrument
        KiteInstrumentMaster instrument = KiteInstrumentMaster.builder()
            .instrumentToken("TEST" + System.currentTimeMillis())
            .exchange("NSE")
            .tradingsymbol("TESTSTOCK")
            .name("Test Stock")
            .instrumentType("EQ")
            .segment("NSE")
            .build();
        
        // Upsert the same instrument multiple times
        for (int i = 0; i < repeatCount; i++) {
            batchRepository.batchUpsertInstruments(List.of(instrument));
        }
        
        // Verify only one record exists
        Optional<KiteInstrumentMaster> result = repository.findById(
            new KiteInstrumentMasterId(instrument.getInstrumentToken(), instrument.getExchange())
        );
        
        assertThat(result).isPresent();
        assertThat(result.get().getTradingsymbol()).isEqualTo(instrument.getTradingsymbol());
        
        // Cleanup
        repository.delete(result.get());
    }

    /**
     * Property 7: Composite key uniqueness
     * For any two instruments with the same (instrument_token, exchange) composite key,
     * only one record must exist in the database after upsert operations complete.
     * Validates: Requirements 3.3
     */
    @Property(tries = 10)
    @Tag("property-test")
    void compositeKeyEnforcesUniqueness() {
        String token = "UNIQUE" + System.currentTimeMillis();
        String exchange = "NSE";
        
        // Create two instruments with same composite key but different data
        KiteInstrumentMaster instrument1 = KiteInstrumentMaster.builder()
            .instrumentToken(token)
            .exchange(exchange)
            .tradingsymbol("STOCK1")
            .name("Stock One")
            .instrumentType("EQ")
            .segment("NSE")
            .build();
        
        KiteInstrumentMaster instrument2 = KiteInstrumentMaster.builder()
            .instrumentToken(token)
            .exchange(exchange)
            .tradingsymbol("STOCK2")  // Different trading symbol
            .name("Stock Two")
            .instrumentType("EQ")
            .segment("NSE")
            .build();
        
        // Upsert both
        batchRepository.batchUpsertInstruments(List.of(instrument1));
        batchRepository.batchUpsertInstruments(List.of(instrument2));
        
        // Verify only one record exists (the second one should have updated the first)
        Optional<KiteInstrumentMaster> result = repository.findById(
            new KiteInstrumentMasterId(token, exchange)
        );
        
        assertThat(result).isPresent();
        assertThat(result.get().getTradingsymbol()).isEqualTo("STOCK2");
        
        // Cleanup
        repository.delete(result.get());
    }

    /**
     * Property 8: Upsert count accuracy
     * For any batch upsert operation, the sum of inserted and updated counts must equal
     * the total number of instruments processed.
     * Validates: Requirements 3.4
     */
    @Property(tries = 10)
    @Tag("property-test")
    void upsertCountIsAccurate(@ForAll @IntRange(min = 1, max = 10) int instrumentCount) {
        // Create test instruments
        List<KiteInstrumentMaster> instruments = new java.util.ArrayList<>();
        for (int i = 0; i < instrumentCount; i++) {
            instruments.add(KiteInstrumentMaster.builder()
                .instrumentToken("COUNT" + System.currentTimeMillis() + "_" + i)
                .exchange("NSE")
                .tradingsymbol("STOCK" + i)
                .name("Stock " + i)
                .instrumentType("EQ")
                .segment("NSE")
                .build());
        }
        
        // Perform batch upsert
        int[] results = batchRepository.batchUpsertInstruments(instruments);
        
        // Verify count matches
        int totalAffected = java.util.Arrays.stream(results).sum();
        assertThat(totalAffected).isEqualTo(instrumentCount);
        
        // Cleanup
        instruments.forEach(inst -> repository.deleteById(
            new KiteInstrumentMasterId(inst.getInstrumentToken(), inst.getExchange())
        ));
    }
}
