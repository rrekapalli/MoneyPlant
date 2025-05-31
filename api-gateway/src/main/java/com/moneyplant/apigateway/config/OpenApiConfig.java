package com.moneyplant.apigateway.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI apiGatewayOpenAPI() {
        return new OpenAPI()
                .info(
                        new Info().title("MoneyPlant API Gateway")
                                .description("Central API Documentation for MoneyPlant Microservices")
                                .version("1.0.0")
                                .license(new License().name("Vislesha Pvt Ltd - 2022-2025"))
                );
    }
}