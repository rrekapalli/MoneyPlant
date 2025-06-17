package com.moneyplant.app.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.EnableWebMvc;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration for the MoneyPlant application.
 * This class ensures that all controllers from the different modules are properly mapped.
 */
@Configuration
@EnableWebMvc
public class WebMvcConfig implements WebMvcConfigurer {
    // The @ComponentScan in the main application class will pick up all controllers
    // from the different modules, so we don't need to do anything special here.
    // This class is mainly a placeholder for any future web MVC configuration.
}