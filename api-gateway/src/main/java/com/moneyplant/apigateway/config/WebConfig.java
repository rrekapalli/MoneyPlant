package com.moneyplant.apigateway.config;

import com.moneyplant.apigateway.interceptors.RateLimiterInterceptor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private static final Logger logger = LoggerFactory.getLogger(WebConfig.class);

    @Value("${rate-limiter.enabled:true}")
    private boolean rateLimiterEnabled;

    private RateLimiterInterceptor rateLimiterInterceptor;

    // Default constructor for when RateLimiterInterceptor is not available
    public WebConfig() {
        logger.info("Creating WebConfig with default constructor, rate limiting will be disabled");
        this.rateLimiterInterceptor = null;
    }

    @Autowired(required = false)
    public WebConfig(RateLimiterInterceptor rateLimiterInterceptor) {
        logger.info("Creating WebConfig with RateLimiterInterceptor");
        this.rateLimiterInterceptor = rateLimiterInterceptor;
        if (rateLimiterInterceptor == null) {
            logger.info("RateLimiterInterceptor is not available, rate limiting will be disabled");
        }
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        // Apply rate limiting to all API endpoints only if rate limiting is enabled and interceptor is available
        if (rateLimiterEnabled && rateLimiterInterceptor != null) {
            logger.info("Adding rate limiter interceptor to registry");
            registry.addInterceptor(rateLimiterInterceptor)
                    .addPathPatterns("/api/**")
                    .excludePathPatterns("/swagger-ui/**", "/api-docs/**", "/actuator/**", "/login/**", "/oauth2/**");
        } else {
            logger.info("Rate limiting is disabled: Rate limiter enabled = {}, interceptor available = {}", 
                        rateLimiterEnabled, rateLimiterInterceptor != null);
        }
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Register static resources
        registry.addResourceHandler("/**")
                .addResourceLocations("classpath:/static/")
                .setCachePeriod(3600); // Cache for 1 hour

        // Register Swagger UI resources
        registry.addResourceHandler("/swagger-ui/**")
                .addResourceLocations("classpath:/META-INF/resources/webjars/")
                .setCachePeriod(3600);
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Redirect root to login page if not authenticated
        registry.addViewController("/").setViewName("redirect:/login");
        // Map login path to the login view
        registry.addViewController("/login").setViewName("login.html");
        // Map success path to the success view
        registry.addViewController("/success").setViewName("success.html");
    }
}
