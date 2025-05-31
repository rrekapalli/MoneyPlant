package com.moneyplant.transactionservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI transactionServiceApi() {
        return new OpenAPI()
                .info(
                        new Info().title("Transaction Service")
                                .description("REST API Documentation for Transaction Service")
                                .version("1.0.0")
                                .license(new License().name("Vislesha Pvt Ltd - 2022-2025"))
                );
    }
}