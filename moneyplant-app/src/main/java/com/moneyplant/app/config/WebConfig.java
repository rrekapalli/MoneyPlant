package com.moneyplant.app.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.server.MimeMappings;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.web.servlet.config.annotation.ContentNegotiationConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web configuration for serving the Angular frontend.
 * This configuration ensures that Angular's client-side routing works properly
 * by forwarding all non-API requests to the index.html file.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Value("${spring.profiles.active:production}")
    private String activeProfile;

    private static final String DEVELOPMENT_DIST_PATH = "src/main/moneyplant-app/dist/money-plant-frontend/";
    private static final String DEVELOPMENT_BROWSER_PATH = "src/main/moneyplant-app/dist/money-plant-frontend/browser/";
    private static final String PRODUCTION_STATIC_PATH = "classpath:/static/";

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
        // Ensure all JavaScript files, including chunks, are served with the correct MIME type
        mappings.add("js", "application/javascript");
        return mappings;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String resourceLocation;
        String indexPath;
        boolean isDevelopment = isDevelopmentMode();
        
        if (isDevelopment) {
            // Check for Angular 20+ browser subdirectory first, then fallback to regular dist
            Path browserPath = Paths.get(DEVELOPMENT_BROWSER_PATH);
            if (Files.exists(browserPath) && Files.isDirectory(browserPath)) {
                resourceLocation = "file:" + DEVELOPMENT_BROWSER_PATH;
                indexPath = DEVELOPMENT_BROWSER_PATH + "index.html";
            } else {
                resourceLocation = "file:" + DEVELOPMENT_DIST_PATH;
                indexPath = DEVELOPMENT_DIST_PATH + "index.html";
            }
        } else {
            resourceLocation = PRODUCTION_STATIC_PATH;
            indexPath = "/static/index.html";
        }

        final String finalIndexPath = indexPath;
        final boolean finalIsDevelopment = isDevelopment;

        registry.addResourceHandler("/**")
                .addResourceLocations(resourceLocation)
                .resourceChain(true)
                .addResolver(new PathResourceResolver() {
                    @Override
                    protected Resource getResource(String resourcePath, Resource location) throws IOException {
                        Resource requestedResource = location.createRelative(resourcePath);

                        // If the requested resource exists, return it
                        if (requestedResource.exists() && requestedResource.isReadable()) {
                            return requestedResource;
                        }

                        // Special handling for favicon.ico - return null to get a 404 instead of a 500
                        if (resourcePath.equals("favicon.ico")) {
                            return null;
                        }

                        // If the resource doesn't exist, return index.html for client-side routing
                        if (finalIsDevelopment) {
                            Path indexFilePath = Paths.get(finalIndexPath);
                            if (Files.exists(indexFilePath)) {
                                return new FileSystemResource(indexFilePath);
                            }
                        } else {
                            return new ClassPathResource(finalIndexPath);
                        }
                        
                        return null;
                    }
                });
    }

    /**
     * Determines if the application is running in development mode.
     * Development mode is detected by:
     * 1. Active profile contains "dev" or "development"
     * 2. The dist folder or browser subfolder exists in the expected development location
     */
    private boolean isDevelopmentMode() {
        // Check if active profile indicates development
        boolean isDevProfile = activeProfile != null && 
            (activeProfile.contains("dev") || activeProfile.contains("development"));
        
        // Check if the development dist folder exists (Angular 20+ browser structure)
        Path browserPath = Paths.get(DEVELOPMENT_BROWSER_PATH);
        boolean browserExists = Files.exists(browserPath) && Files.isDirectory(browserPath);
        
        // Check if the development dist folder exists (regular structure)
        Path distPath = Paths.get(DEVELOPMENT_DIST_PATH);
        boolean distExists = Files.exists(distPath) && Files.isDirectory(distPath);
        
        // Return true if any condition is met (prioritizing folder existence)
        return browserExists || distExists || isDevProfile;
    }
}
