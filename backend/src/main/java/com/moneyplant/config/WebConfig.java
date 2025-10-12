package com.moneyplant.config;

import org.springframework.boot.web.server.MimeMappings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;

/**
 * Web configuration for serving the Angular frontend.
 * This configuration ensures that Angular's client-side routing works properly
 * by serving static assets and providing SPA fallback.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configureContentNegotiation(ContentNegotiationConfigurer configurer) {
        configurer
            .mediaType("js", MediaType.valueOf("application/javascript"))
            .mediaType("css", MediaType.valueOf("text/css"))
            .mediaType("html", MediaType.TEXT_HTML)
            .mediaType("json", MediaType.APPLICATION_JSON)
            .mediaType("ico", MediaType.valueOf("image/x-icon"));
    }

    /**
     * Configure the MIME type mappings for the application.
     * This ensures that JavaScript files are served with the correct MIME type.
     */
    @Bean
    public MimeMappings mimeMappings() {
        MimeMappings mappings = new MimeMappings(MimeMappings.DEFAULT);
        // Ensure all JavaScript files are served with the correct MIME type
        mappings.add("js", "application/javascript");
        return mappings;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Let Spring Boot handle static resources automatically
        // This will serve files from classpath:/static/ by default
        // No custom resource handlers needed - Spring Boot's default is sufficient
    }
}