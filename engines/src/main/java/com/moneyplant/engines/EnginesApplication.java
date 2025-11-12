package com.moneyplant.engines;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Main application class for MoneyPlant Engines
 * This service handles backtesting, data ingestion, querying, scanning, storage, and strategy execution
 */
@SpringBootApplication
@EnableCaching
@EnableAsync
@EnableScheduling
@ComponentScan(basePackages = {
    "com.moneyplant.engines",
    "com.moneyplant.engines.ingestion.api",
    "com.moneyplant.engines.ingestion.service",
    "com.moneyplant.engines.ingestion.repository",
    "com.moneyplant.engines.ingestion.provider",
    "com.moneyplant.engines.ingestion.config"
})
public class EnginesApplication {

    public static void main(String[] args) {
        SpringApplication.run(EnginesApplication.class, args);
    }
}
