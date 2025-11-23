package com.moneyplant.engines.ingestion.kite;

import com.moneyplant.engines.ingestion.kite.client.KiteConnectClient;
import com.moneyplant.engines.ingestion.kite.config.KiteIngestionConfig;
import com.moneyplant.engines.ingestion.kite.model.entity.KiteOhlcvHistoric;
import com.moneyplant.engines.ingestion.kite.model.enums.CandleInterval;
import com.zerodhatech.models.HistoricalData;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Manual test to verify OHLC data download from Kite Connect API.
 * 
 * To run this test:
 * 1. Set environment variables:
 *    export KITE_API_KEY=your_api_key
 *    export KITE_API_SECRET=your_api_secret
 *    export KITE_ACCESS_TOKEN=your_access_token
 * 
 * 2. Remove @Disabled annotation
 * 
 * 3. Run: mvn test -Dtest=ManualOHLCDownloadTest
 */
@SpringBootTest
@ActiveProfiles("test")
@Disabled("Manual test - requires Kite API credentials")
public class ManualOHLCDownloadTest {

    @Autowired(required = false)
    private KiteConnectClient kiteClient;

    @Test
    void testDownloadOHLCData() {
        // Skip if no credentials configured
        if (kiteClient == null) {
            System.out.println("⚠️  KiteConnectClient not available. Configure Kite API credentials.");
            return;
        }

        System.out.println("\n" + "=".repeat(80));
        System.out.println("Testing OHLC Data Download from Kite Connect API");
        System.out.println("=".repeat(80) + "\n");

        // Test parameters
        String instrumentToken = "738561"; // RELIANCE on NSE
        LocalDate fromDate = LocalDate.now().minusDays(7);
        LocalDate toDate = LocalDate.now().minusDays(1);
        String interval = "day";

        System.out.println("📊 Test Parameters:");
        System.out.println("   Instrument Token: " + instrumentToken + " (RELIANCE)");
        System.out.println("   From Date: " + fromDate);
        System.out.println("   To Date: " + toDate);
        System.out.println("   Interval: " + interval);
        System.out.println();

        try {
            // Step 1: Fetch data from Kite API
            System.out.println("🔄 Step 1: Fetching data from Kite Connect API...");
            HistoricalData data = kiteClient.getHistoricalData(
                instrumentToken,
                fromDate,
                toDate,
                interval,
                false
            );

            // Step 2: Verify data received
            assertThat(data).isNotNull();
            assertThat(data.dataArrayList).isNotNull();
            assertThat(data.dataArrayList).isNotEmpty();

            System.out.println("✅ Successfully fetched " + data.dataArrayList.size() + " candles");
            System.out.println();

            // Step 3: Display sample data
            System.out.println("📈 Sample OHLC Data (first 5 candles):");
            System.out.println("-".repeat(80));
            System.out.printf("%-20s %-10s %-10s %-10s %-10s %-12s%n",
                "Timestamp", "Open", "High", "Low", "Close", "Volume");
            System.out.println("-".repeat(80));

            data.dataArrayList.stream()
                .limit(5)
                .forEach(candle -> {
                    System.out.printf("%-20s %-10.2f %-10.2f %-10.2f %-10.2f %-12d%n",
                        candle.timeStamp,
                        candle.open,
                        candle.high,
                        candle.low,
                        candle.close,
                        candle.volume);
                });
            System.out.println("-".repeat(80));
            System.out.println();

            // Step 4: Test data transformation
            System.out.println("🔄 Step 2: Testing data transformation...");
            List<KiteOhlcvHistoric> entities = transformToEntities(
                data,
                instrumentToken,
                "NSE",
                interval
            );

            assertThat(entities).hasSize(data.dataArrayList.size());
            System.out.println("✅ Successfully transformed " + entities.size() + " candles to entities");
            System.out.println();

            // Step 5: Verify transformed data
            System.out.println("🔍 Step 3: Verifying transformed data...");
            KiteOhlcvHistoric firstEntity = entities.get(0);
            
            assertThat(firstEntity.getInstrumentToken()).isEqualTo(instrumentToken);
            assertThat(firstEntity.getExchange()).isEqualTo("NSE");
            assertThat(firstEntity.getDate()).isNotNull();
            assertThat(firstEntity.getCandleInterval()).isEqualTo(CandleInterval.DAY);
            assertThat(firstEntity.getOpen()).isGreaterThan(0);
            assertThat(firstEntity.getHigh()).isGreaterThanOrEqualTo(firstEntity.getOpen());
            assertThat(firstEntity.getLow()).isLessThanOrEqualTo(firstEntity.getClose());
            assertThat(firstEntity.getVolume()).isGreaterThan(0);

            System.out.println("✅ Data validation passed:");
            System.out.println("   - Instrument Token: " + firstEntity.getInstrumentToken());
            System.out.println("   - Exchange: " + firstEntity.getExchange());
            System.out.println("   - Date: " + firstEntity.getDate());
            System.out.println("   - Interval: " + firstEntity.getCandleInterval());
            System.out.println("   - OHLC: " + firstEntity.getOpen() + " / " + 
                firstEntity.getHigh() + " / " + firstEntity.getLow() + " / " + firstEntity.getClose());
            System.out.println("   - Volume: " + firstEntity.getVolume());
            System.out.println();

            // Step 6: Summary
            System.out.println("=".repeat(80));
            System.out.println("✅ TEST PASSED - OHLC Data Download Working!");
            System.out.println("=".repeat(80));
            System.out.println("Summary:");
            System.out.println("  ✓ API connection successful");
            System.out.println("  ✓ Data fetched: " + data.dataArrayList.size() + " candles");
            System.out.println("  ✓ Data transformation successful");
            System.out.println("  ✓ Data validation passed");
            System.out.println("=".repeat(80) + "\n");

        } catch (Exception e) {
            System.err.println("\n❌ TEST FAILED");
            System.err.println("Error: " + e.getMessage());
            e.printStackTrace();
            throw new AssertionError("OHLC data download test failed", e);
        }
    }

    @Test
    void testDownloadMultipleIntervals() {
        if (kiteClient == null) {
            System.out.println("⚠️  KiteConnectClient not available. Configure Kite API credentials.");
            return;
        }

        System.out.println("\n" + "=".repeat(80));
        System.out.println("Testing Multiple Intervals");
        System.out.println("=".repeat(80) + "\n");

        String instrumentToken = "738561"; // RELIANCE
        LocalDate fromDate = LocalDate.now().minusDays(2);
        LocalDate toDate = LocalDate.now().minusDays(1);

        String[] intervals = {"minute", "5minute", "15minute", "60minute", "day"};

        for (String interval : intervals) {
            try {
                System.out.println("📊 Testing interval: " + interval);
                HistoricalData data = kiteClient.getHistoricalData(
                    instrumentToken,
                    fromDate,
                    toDate,
                    interval,
                    false
                );

                assertThat(data).isNotNull();
                assertThat(data.dataArrayList).isNotNull();
                
                System.out.println("   ✅ Fetched " + data.dataArrayList.size() + " candles");
                
                if (!data.dataArrayList.isEmpty()) {
                    HistoricalData firstCandle = data.dataArrayList.get(0);
                    System.out.println("   First candle: " + firstCandle.timeStamp + 
                        " | O:" + firstCandle.open + " H:" + firstCandle.high + 
                        " L:" + firstCandle.low + " C:" + firstCandle.close);
                }
                System.out.println();

            } catch (Exception e) {
                System.err.println("   ❌ Failed for interval " + interval + ": " + e.getMessage());
            }
        }

        System.out.println("=".repeat(80) + "\n");
    }

    /**
     * Transform Kite API HistoricalData to entity objects.
     */
    private List<KiteOhlcvHistoric> transformToEntities(
        HistoricalData data,
        String instrumentToken,
        String exchange,
        String interval
    ) {
        return data.dataArrayList.stream()
            .map(candle -> {
                try {
                    // Parse timestamp (format: "2024-01-15T09:15:00+0530")
                    LocalDateTime date = LocalDateTime.parse(
                        candle.timeStamp.substring(0, 19),
                        DateTimeFormatter.ISO_LOCAL_DATE_TIME
                    );

                    CandleInterval candleInterval = CandleInterval.fromKiteValue(interval);

                    return KiteOhlcvHistoric.builder()
                        .instrumentToken(instrumentToken)
                        .exchange(exchange)
                        .date(date)
                        .candleInterval(candleInterval)
                        .open(candle.open)
                        .high(candle.high)
                        .low(candle.low)
                        .close(candle.close)
                        .volume(candle.volume)
                        .build();
                } catch (Exception e) {
                    System.err.println("Error transforming candle: " + e.getMessage());
                    return null;
                }
            })
            .filter(entity -> entity != null)
            .collect(Collectors.toList());
    }
}
