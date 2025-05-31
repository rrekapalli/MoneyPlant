package com.moneyplant.transactionservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.ConversionService;
import org.springframework.core.convert.support.DefaultConversionService;
import org.springframework.integration.config.EnableIntegration;

@Configuration
@EnableIntegration
public class IntegrationConfig {

    /**
     * Creates the integrationConversionService bean required by Spring Cloud Stream.
     * This bean is needed by the messageConverterConfigurer method in BinderFactoryAutoConfiguration.
     *
     * @return a ConversionService instance
     */
    @Bean(name = "integrationConversionService")
    public ConversionService integrationConversionService() {
        return new DefaultConversionService();
    }
}