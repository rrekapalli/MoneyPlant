package com.moneyplant.screener.services;

import com.moneyplant.screener.entities.ScreenerRun;

/**
 * Service Provider Interface for executing screener runs.
 * This allows pluggable implementations for different execution engines.
 */
public interface RunExecutor {

    /**
     * Executes a screener run.
     * 
     * @param run the screener run to execute
     * @return the updated screener run with results
     */
    ScreenerRun executeRun(ScreenerRun run);

    /**
     * Gets the executor type/name.
     * 
     * @return the executor type
     */
    String getExecutorType();
}
