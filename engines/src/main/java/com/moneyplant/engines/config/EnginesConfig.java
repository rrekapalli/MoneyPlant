package com.moneyplant.engines.config;

import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.EnableAspectJAutoProxy;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main configuration class for MoneyPlant Engines
 */
@Configuration
@ComponentScan(basePackages = "com.moneyplant.engines")
@EnableJpaRepositories(basePackages = "com.moneyplant.engines")
@EnableTransactionManagement
@EnableAspectJAutoProxy
public class EnginesConfig {
    
    // Configuration beans will be added here as needed
}
