package com.moneyplant.engines.scanner;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service interface for market scanning and analysis
 */
public interface MarketScannerService {

    /**
     * Scan market for trading opportunities based on criteria
     * @param criteria The scanning criteria
     * @return CompletableFuture with the scanning results
     */
    CompletableFuture<ScanResult> scanMarket(ScanCriteria criteria);

    /**
     * Scan for breakout patterns
     * @param symbols List of symbols to scan
     * @param timeframe The timeframe for analysis
     * @return CompletableFuture with the breakout scan results
     */
    CompletableFuture<List<BreakoutSignal>> scanForBreakouts(List<String> symbols, String timeframe);

    /**
     * Scan for support and resistance levels
     * @param symbols List of symbols to scan
     * @param timeframe The timeframe for analysis
     * @return CompletableFuture with the support/resistance scan results
     */
    CompletableFuture<List<SupportResistanceLevel>> scanForSupportResistance(List<String> symbols, String timeframe);

    /**
     * Scan for volume anomalies
     * @param symbols List of symbols to scan
     * @param threshold The volume threshold
     * @return CompletableFuture with the volume anomaly scan results
     */
    CompletableFuture<List<VolumeAnomaly>> scanForVolumeAnomalies(List<String> symbols, Double threshold);

    /**
     * Scan for technical indicator signals
     * @param symbols List of symbols to scan
     * @param indicators List of technical indicators to check
     * @return CompletableFuture with the technical indicator scan results
     */
    CompletableFuture<List<TechnicalSignal>> scanForTechnicalSignals(List<String> symbols, List<String> indicators);

    /**
     * Scan for fundamental data changes
     * @param symbols List of symbols to scan
     * @param fundamentalMetrics List of fundamental metrics to check
     * @return CompletableFuture with the fundamental scan results
     */
    CompletableFuture<List<FundamentalSignal>> scanForFundamentalSignals(List<String> symbols, List<String> fundamentalMetrics);

    /**
     * Get scanner configuration
     * @return CompletableFuture with the scanner configuration
     */
    CompletableFuture<ScannerConfig> getScannerConfig();

    /**
     * Update scanner configuration
     * @param config The new scanner configuration
     * @return CompletableFuture with the update result
     */
    CompletableFuture<Boolean> updateScannerConfig(ScannerConfig config);

    /**
     * Get scanning history
     * @param startDate Start date for history
     * @param endDate End date for history
     * @return CompletableFuture with the scanning history
     */
    CompletableFuture<List<ScanHistory>> getScanningHistory(LocalDateTime startDate, LocalDateTime endDate);
}
