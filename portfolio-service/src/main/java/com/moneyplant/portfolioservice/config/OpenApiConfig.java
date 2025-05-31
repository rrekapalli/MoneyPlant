package com.moneyplant.portfolioservice.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI portfolioServiceApi() {
        return new OpenAPI()
                .info(
                    new Info().title("Portfolio Service")
                            .description("REST API Documentation for Portfolio Service")
                            .version("1.0.0")
                            .license(new License().name("Vislesha Pvt Ltd - 2022-2025"))
                );
    }
}
