package com.moneyplant.engines.strategy;

import com.moneyplant.engines.model.Strategy;

import java.util.List;
import java.util.concurrent.CompletableFuture;

/**
 * Service interface for managing trading strategies
 */
public interface StrategyService {

    /**
     * Create a new strategy
     * @param strategy The strategy to create
     * @return CompletableFuture with the created strategy
     */
    CompletableFuture<Strategy> createStrategy(Strategy strategy);

    /**
     * Update an existing strategy
     * @param strategy The strategy to update
     * @return CompletableFuture with the updated strategy
     */
    CompletableFuture<Strategy> updateStrategy(Strategy strategy);

    /**
     * Get strategy by ID
     * @param strategyId The strategy ID
     * @return CompletableFuture with the strategy
     */
    CompletableFuture<Strategy> getStrategy(Long strategyId);

    /**
     * Get strategy by name
     * @param name The strategy name
     * @return CompletableFuture with the strategy
     */
    CompletableFuture<Strategy> getStrategyByName(String name);

    /**
     * Get all strategies
     * @return CompletableFuture with the list of strategies
     */
    CompletableFuture<List<Strategy>> getAllStrategies();

    /**
     * Get strategies by category
     * @param category The strategy category
     * @return CompletableFuture with the list of strategies
     */
    CompletableFuture<List<Strategy>> getStrategiesByCategory(String category);

    /**
     * Get active strategies
     * @return CompletableFuture with the list of active strategies
     */
    CompletableFuture<List<Strategy>> getActiveStrategies();

    /**
     * Delete strategy
     * @param strategyId The strategy ID to delete
     * @return CompletableFuture with the deletion result
     */
    CompletableFuture<Boolean> deleteStrategy(Long strategyId);

    /**
     * Activate strategy
     * @param strategyId The strategy ID to activate
     * @return CompletableFuture with the activation result
     */
    CompletableFuture<Boolean> activateStrategy(Long strategyId);

    /**
     * Deactivate strategy
     * @param strategyId The strategy ID to deactivate
     * @return CompletableFuture with the deactivation result
     */
    CompletableFuture<Boolean> deactivateStrategy(Long strategyId);

    /**
     * Validate strategy parameters
     * @param strategy The strategy to validate
     * @return CompletableFuture with the validation result
     */
    CompletableFuture<StrategyValidationResult> validateStrategy(Strategy strategy);

    /**
     * Clone strategy
     * @param strategyId The strategy ID to clone
     * @param newName The new name for the cloned strategy
     * @return CompletableFuture with the cloned strategy
     */
    CompletableFuture<Strategy> cloneStrategy(Long strategyId, String newName);
}
