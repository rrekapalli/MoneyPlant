package com.moneyplant.app.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.core.convert.ConversionService;
import org.springframework.core.convert.support.DefaultConversionService;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Centralized Integration Configuration for the MoneyPlant application.
 * This class consolidates the integration configuration from all service modules.
 */
@Configuration
@EnableIntegration
public class IntegrationConfig {

    /**
     * Creates a ConversionService bean named 'integrationConversionService'
     * This is required by Spring Cloud Stream when the IntegrationAutoConfiguration
     * is excluded but BinderFactoryAutoConfiguration is still active.
     *
     * @return a DefaultConversionService instance
     */
    @Bean(name = "integrationConversionService")
    @Primary
    public ConversionService integrationConversionService() {
        return new DefaultConversionService();
    }

    /**
     * Creates a TaskScheduler bean
     * This is required by Spring Cloud Stream's BindingServiceConfiguration
     * for scheduling tasks related to message binding.
     *
     * @return a configured ThreadPoolTaskScheduler instance
     */
    @Bean
    @Primary
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("stream-task-");
        scheduler.initialize();
        return scheduler;
    }
}