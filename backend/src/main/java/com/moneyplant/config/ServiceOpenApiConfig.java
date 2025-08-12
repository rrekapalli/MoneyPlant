package com.moneyplant.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

/**
 * Configuration class that provides service-specific OpenAPI beans for the monolithic application.
 * This ensures that each service module gets its own OpenAPI configuration with the appropriate
 * title and description, even though they're all running in the same application context.
 */
@Configuration
public class ServiceOpenApiConfig {

    @Value("${openapi.service.version:1.0.0}")
    private String serviceVersion;

    @Primary
    @Bean
    public OpenAPI mainApplicationApi(
            @Value("${openapi.service.title:MoneyPlant API}") String title,
            @Value("${openapi.service.description:REST API Documentation for MoneyPlant Application}") String description) {
        return createOpenApi(title, description);
    }

    @Bean(name = "stockServiceOpenApi")
    public OpenAPI stockServiceApi(
            @Value("${openapi.service.stock-service.title:Stock Service}") String title,
            @Value("${openapi.service.stock-service.description:REST API Documentation for Stock Service}") String description) {
        return createOpenApi(title, description);
    }

    @Bean(name = "portfolioServiceOpenApi")
    public OpenAPI portfolioServiceApi(
            @Value("${openapi.service.portfolio-service.title:Portfolio Service}") String title,
            @Value("${openapi.service.portfolio-service.description:REST API Documentation for Portfolio Service}") String description) {
        return createOpenApi(title, description);
    }

    @Bean(name = "transactionServiceOpenApi")
    public OpenAPI transactionServiceApi(
            @Value("${openapi.service.transaction-service.title:Transaction Service}") String title,
            @Value("${openapi.service.transaction-service.description:REST API Documentation for Transaction Service}") String description) {
        return createOpenApi(title, description);
    }

    @Bean(name = "watchlistServiceOpenApi")
    public OpenAPI watchlistServiceApi(
            @Value("${openapi.service.watchlist-service.title:Watchlist Service}") String title,
            @Value("${openapi.service.watchlist-service.description:REST API Documentation for Watchlist Service}") String description) {
        return createOpenApi(title, description);
    }

    private OpenAPI createOpenApi(String title, String description) {
        return new OpenAPI()
                .info(
                        new Info().title(title)
                                .description(description)
                                .version(serviceVersion)
                                .license(new License().name("Vislesha Pvt Ltd - 2022-2025"))
                );
    }
}