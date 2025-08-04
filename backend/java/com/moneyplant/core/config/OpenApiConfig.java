package com.moneyplant.core.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Shared configuration for OpenAPI documentation across all MoneyPlant services.
 * This class provides a configurable OpenAPI bean that can be used by any service
 * by simply setting the appropriate properties in their application.properties file.
 */
@Configuration
public class OpenApiConfig {

    @Value("${openapi.service.title:MoneyPlant API}")
    private String serviceTitle;

    @Value("${openapi.service.description:REST API Documentation for MoneyPlant Service}")
    private String serviceDescription;

    @Value("${openapi.service.version:1.0.0}")
    private String serviceVersion;

    @Bean
    public OpenAPI serviceApi() {
        return new OpenAPI()
                .info(
                        new Info().title(serviceTitle)
                                .description(serviceDescription)
                                .version(serviceVersion)
                                .license(new License().name("Vislesha Pvt Ltd - 2022-2025"))
                );
    }
}