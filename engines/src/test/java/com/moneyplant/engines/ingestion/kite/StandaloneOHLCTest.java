package com.moneyplant.engines.ingestion.kite;

import com.zerodhatech.kiteconnect.KiteConnect;
import com.zerodhatech.kiteconnect.kitehttp.exceptions.KiteException;
import com.zerodhatech.models.HistoricalData;

import java.io.IOException;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.Date;

/**
 * Standalone test to verify OHLC data download without Spring Boot.
 * 
 * Usage:
 * 1. Set environment variables:
 *    export KITE_API_KEY=your_api_key
 *    export KITE_ACCESS_TOKEN=your_access_token
 * 
 * 2. Run: ./test-ohlc-download.sh
 */
public class StandaloneOHLCTest {

    // Configuration - reads from environment variables
    private static final String API_KEY = System.getenv("KITE_API_KEY");
    private static final String ACCESS_TOKEN = System.getenv("KITE_ACCESS_TOKEN");

    public static void main(String[] args) {
        System.out.println("\n" + "=".repeat(80));
        System.out.println("Standalone OHLC Data Download Test");
        System.out.println("=".repeat(80) + "\n");

        // Check credentials
        if ("your_api_key".equals(API_KEY) || "your_access_token".equals(ACCESS_TOKEN)) {
            System.err.println("❌ ERROR: Please configure Kite API credentials");
            System.err.println("\nSet environment variables:");
            System.err.println("  export KITE_API_KEY=your_api_key");
            System.err.println("  export KITE_ACCESS_TOKEN=your_access_token");
            System.err.println("\nOr update the constants in this file.");
            System.exit(1);
        }

        try {
            // Initialize Kite Connect
            System.out.println("🔧 Initializing Kite Connect...");
            KiteConnect kiteConnect = new KiteConnect(API_KEY);
            kiteConnect.setAccessToken(ACCESS_TOKEN);
            System.out.println("✅ Kite Connect initialized");
            System.out.println();

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

            // Convert dates
            Date from = Date.from(fromDate.atStartOfDay(ZoneId.systemDefault()).toInstant());
            Date to = Date.from(toDate.atStartOfDay(ZoneId.systemDefault()).toInstant());

            // Fetch historical data
            System.out.println("🔄 Fetching OHLC data from Kite Connect API...");
            HistoricalData data = kiteConnect.getHistoricalData(
                from,
                to,
                instrumentToken,
                interval,
                false,
                false
            );

            // Verify data
            if (data == null || data.dataArrayList == null || data.dataArrayList.isEmpty()) {
                System.err.println("❌ No data received from API");
                System.exit(1);
            }

            System.out.println("✅ Successfully fetched " + data.dataArrayList.size() + " candles");
            System.out.println();

            // Display data
            System.out.println("📈 OHLC Data:");
            System.out.println("-".repeat(100));
            System.out.printf("%-25s %-12s %-12s %-12s %-12s %-15s%n",
                "Timestamp", "Open", "High", "Low", "Close", "Volume");
            System.out.println("-".repeat(100));

            data.dataArrayList.forEach(candle -> {
                System.out.printf("%-25s %-12.2f %-12.2f %-12.2f %-12.2f %-15d%n",
                    candle.timeStamp,
                    candle.open,
                    candle.high,
                    candle.low,
                    candle.close,
                    candle.volume);
            });
            System.out.println("-".repeat(100));
            System.out.println();

            // Validate data
            System.out.println("🔍 Validating data...");
            boolean allValid = true;
            for (HistoricalData candle : data.dataArrayList) {
                if (candle.high < candle.low) {
                    System.err.println("   ❌ Invalid: High < Low for " + candle.timeStamp);
                    allValid = false;
                }
                if (candle.high < candle.open || candle.high < candle.close) {
                    System.err.println("   ❌ Invalid: High < Open/Close for " + candle.timeStamp);
                    allValid = false;
                }
                if (candle.low > candle.open || candle.low > candle.close) {
                    System.err.println("   ❌ Invalid: Low > Open/Close for " + candle.timeStamp);
                    allValid = false;
                }
                if (candle.volume < 0) {
                    System.err.println("   ❌ Invalid: Negative volume for " + candle.timeStamp);
                    allValid = false;
                }
            }

            if (allValid) {
                System.out.println("✅ All data validated successfully");
            } else {
                System.err.println("❌ Some data validation failed");
            }
            System.out.println();

            // Summary
            System.out.println("=".repeat(80));
            System.out.println("✅ TEST PASSED - OHLC Data Download Working!");
            System.out.println("=".repeat(80));
            System.out.println("Summary:");
            System.out.println("  ✓ API connection successful");
            System.out.println("  ✓ Data fetched: " + data.dataArrayList.size() + " candles");
            System.out.println("  ✓ Date range: " + data.dataArrayList.get(0).timeStamp + 
                " to " + data.dataArrayList.get(data.dataArrayList.size() - 1).timeStamp);
            System.out.println("  ✓ Data validation: " + (allValid ? "PASSED" : "FAILED"));
            System.out.println("=".repeat(80) + "\n");

        } catch (KiteException e) {
            System.err.println("\n❌ Kite API Error:");
            System.err.println("   Code: " + e.code);
            System.err.println("   Message: " + e.message);
            System.err.println("\nPossible causes:");
            if (e.code == 403 || e.code == 401) {
                System.err.println("  - Invalid or expired access token");
                System.err.println("  - Access token needs to be regenerated daily");
            } else if (e.code == 429) {
                System.err.println("  - Rate limit exceeded");
                System.err.println("  - Wait a moment and try again");
            } else {
                System.err.println("  - Check Kite Connect API status");
                System.err.println("  - Verify instrument token is correct");
            }
            e.printStackTrace();
            System.exit(1);

        } catch (IOException e) {
            System.err.println("\n❌ Network Error:");
            System.err.println("   " + e.getMessage());
            System.err.println("\nPossible causes:");
            System.err.println("  - No internet connection");
            System.err.println("  - Kite API is down");
            System.err.println("  - Firewall blocking connection");
            e.printStackTrace();
            System.exit(1);

        } catch (Exception e) {
            System.err.println("\n❌ Unexpected Error:");
            System.err.println("   " + e.getMessage());
            e.printStackTrace();
            System.exit(1);
        }
    }
}
