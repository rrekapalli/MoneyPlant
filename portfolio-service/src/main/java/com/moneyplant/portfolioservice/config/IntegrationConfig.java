package com.moneyplant.portfolioservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.ConversionService;
import org.springframework.core.convert.support.DefaultConversionService;
import org.springframework.scheduling.TaskScheduler;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;

/**
 * Configuration class to provide the integrationConversionService bean
 * required by Spring Cloud Stream's BinderFactoryAutoConfiguration.
 */
@Configuration
public class IntegrationConfig {

    /**
     * Creates a ConversionService bean named 'integrationConversionService'
     * This is required by Spring Cloud Stream when the IntegrationAutoConfiguration
     * is excluded but BinderFactoryAutoConfiguration is still active.
     *
     * @return a DefaultConversionService instance
     */
    @Bean(name = "integrationConversionService")
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
    public TaskScheduler taskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(5);
        scheduler.setThreadNamePrefix("stream-task-");
        scheduler.initialize();
        return scheduler;
    }
}
