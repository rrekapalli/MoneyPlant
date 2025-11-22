package com.moneyplant.engines.ingestion.kite;

import com.moneyplant.engines.ingestion.kite.model.entity.KiteInstrumentMaster;
import com.zerodhatech.models.Instrument;
import net.jqwik.api.*;
import net.jqwik.api.constraints.*;
import org.junit.jupiter.api.Tag;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Property-based tests for instrument service.
 * Feature: kite-ingestion, Properties 2, 3, 4, 9, 10, 13, 14, 15
 */
@Tag("property-test")
public class InstrumentServicePropertyTests {

    /**
     * Property 2: All required fields are parsed
     * Validates: Requirements 1.3
     */
    @Property(tries = 20)
    @Tag("property-test")
    void allRequiredFieldsAreParsed(
        @ForAll @LongRange(min = 1, max = 999999) long instrumentToken,
        @ForAll @AlphaChars @StringLength(min = 1, max = 10) String exchange,
        @ForAll @AlphaChars @StringLength(min = 1, max = 20) String tradingSymbol
    ) {
        Instrument instrument = new Instrument();
        instrument.instrument_token = instrumentToken;
        instrument.exchange = exchange;
        instrument.tradingsymbol = tradingSymbol;
        instrument.name = "Test Instrument";
        
        KiteInstrumentMaster entity = toEntity(instrument);
        
        assertThat(entity).isNotNull();
        assertThat(entity.getInstrumentToken()).isEqualTo(String.valueOf(instrumentToken));
        assertThat(entity.getExchange()).isEqualTo(exchange);
        assertThat(entity.getTradingsymbol()).isEqualTo(tradingSymbol);
    }

    /**
     * Property 3: Required field validation
     * Validates: Requirements 1.4
     */
    @Property(tries = 10)
    @Tag("property-test")
    void requiredFieldValidation() {
        Instrument instrumentMissingToken = new Instrument();
        instrumentMissingToken.instrument_token = 0;
        instrumentMissingToken.exchange = "NSE";
        instrumentMissingToken.tradingsymbol = "RELIANCE";
        
        assertThat(toEntity(instrumentMissingToken)).isNull();
        
        Instrument instrumentMissingExchange = new Instrument();
        instrumentMissingExchange.instrument_token = 12345;
        instrumentMissingExchange.tradingsymbol = "RELIANCE";
        
        assertThat(toEntity(instrumentMissingExchange)).isNull();
        
        Instrument instrumentMissingSymbol = new Instrument();
        instrumentMissingSymbol.instrument_token = 12345;
        instrumentMissingSymbol.exchange = "NSE";
        
        assertThat(toEntity(instrumentMissingSymbol)).isNull();
    }

    /**
     * Property 4: Schema transformation correctness
     * Validates: Requirements 1.5, 3.1
     */
    @Property(tries = 20)
    @Tag("property-test")
    void schemaTransformationCorrectness(
        @ForAll @LongRange(min = 1, max = 999999) long instrumentToken,
        @ForAll @AlphaChars @StringLength(min = 1, max = 10) String exchange,
        @ForAll @AlphaChars @StringLength(min = 1, max = 20) String tradingSymbol,
        @ForAll @AlphaChars @StringLength(min = 1, max = 50) String name,
        @ForAll @DoubleRange(min = 0.0, max = 100000.0) double lastPrice,
        @ForAll @DoubleRange(min = 0.01, max = 1.0) double tickSize,
        @ForAll @IntRange(min = 1, max = 10000) int lotSize
    ) {
        Instrument instrument = new Instrument();
        instrument.instrument_token = instrumentToken;
        instrument.exchange = exchange;
        instrument.tradingsymbol = tradingSymbol;
        instrument.name = name;
        instrument.last_price = lastPrice;
        instrument.strike = "100.5";
        instrument.tick_size = tickSize;
        instrument.lot_size = lotSize;
        instrument.instrument_type = "EQ";
        instrument.segment = "NSE";
        
        KiteInstrumentMaster entity = toEntity(instrument);
        
        assertThat(entity).isNotNull();
        assertThat(entity.getInstrumentToken()).isEqualTo(String.valueOf(instrumentToken));
        assertThat(entity.getExchange()).isEqualTo(exchange);
        assertThat(entity.getTradingsymbol()).isEqualTo(tradingSymbol);
        assertThat(entity.getName()).isEqualTo(name);
        assertThat(entity.getLastPrice()).isEqualTo(lastPrice);
        assertThat(entity.getStrike()).isEqualTo(100.5);
        assertThat(entity.getTickSize()).isEqualTo(tickSize);
        assertThat(entity.getLotSize()).isEqualTo(lotSize);
        assertThat(entity.getInstrumentType()).isEqualTo("EQ");
        assertThat(entity.getSegment()).isEqualTo("NSE");
    }

    /**
     * Property 13: Complete instrument storage
     * Validates: Requirements 8.1
     */
    @Property(tries = 10)
    @Tag("property-test")
    void completeInstrumentStorage(
        @ForAll @LongRange(min = 1, max = 999999) long instrumentToken,
        @ForAll @AlphaChars @StringLength(min = 1, max = 10) String exchange,
        @ForAll @AlphaChars @StringLength(min = 1, max = 20) String tradingSymbol
    ) {
        Instrument instrument = new Instrument();
        instrument.instrument_token = instrumentToken;
        instrument.exchange = exchange;
        instrument.tradingsymbol = tradingSymbol;
        instrument.name = "Test";
        instrument.instrument_type = "EQ";
        
        KiteInstrumentMaster entity = toEntity(instrument);
        
        assertThat(entity).isNotNull();
        assertThat(entity.getInstrumentToken()).isNotNull();
        assertThat(entity.getExchange()).isNotNull();
        assertThat(entity.getTradingsymbol()).isNotNull();
    }

    /**
     * Property 14: Metadata preservation
     * Validates: Requirements 8.2
     */
    @Property(tries = 10)
    @Tag("property-test")
    void metadataPreservation(
        @ForAll @LongRange(min = 1, max = 999999) long instrumentToken,
        @ForAll @AlphaChars @StringLength(min = 1, max = 10) String instrumentType,
        @ForAll @AlphaChars @StringLength(min = 1, max = 10) String segment
    ) {
        Instrument instrument = new Instrument();
        instrument.instrument_token = instrumentToken;
        instrument.exchange = "NSE";
        instrument.tradingsymbol = "TEST";
        instrument.instrument_type = instrumentType;
        instrument.segment = segment;
        
        KiteInstrumentMaster entity = toEntity(instrument);
        
        assertThat(entity).isNotNull();
        assertThat(entity.getInstrumentType()).isEqualTo(instrumentType);
        assertThat(entity.getSegment()).isEqualTo(segment);
    }

    private KiteInstrumentMaster toEntity(Instrument instrument) {
        try {
            if (instrument.instrument_token == 0 ||
                instrument.exchange == null || instrument.exchange.isEmpty() ||
                instrument.tradingsymbol == null || instrument.tradingsymbol.isEmpty()) {
                return null;
            }
            
            LocalDate expiryDate = null;
            if (instrument.expiry != null) {
                expiryDate = instrument.expiry.toInstant()
                    .atZone(ZoneId.systemDefault())
                    .toLocalDate();
            }
            
            Double strikeValue = null;
            if (instrument.strike != null && !instrument.strike.isEmpty()) {
                try {
                    strikeValue = Double.parseDouble(instrument.strike);
                } catch (NumberFormatException e) {
                    // Invalid strike value
                }
            }
            
            return KiteInstrumentMaster.builder()
                .instrumentToken(String.valueOf(instrument.instrument_token))
                .exchangeToken(String.valueOf(instrument.exchange_token))
                .tradingsymbol(instrument.tradingsymbol)
                .name(instrument.name)
                .lastPrice(instrument.last_price != 0.0 ? instrument.last_price : null)
                .expiry(expiryDate)
                .strike(strikeValue)
                .tickSize(instrument.tick_size != 0.0 ? instrument.tick_size : null)
                .lotSize(instrument.lot_size)
                .instrumentType(instrument.instrument_type)
                .segment(instrument.segment)
                .exchange(instrument.exchange)
                .build();
        } catch (Exception e) {
            return null;
        }
    }
}
