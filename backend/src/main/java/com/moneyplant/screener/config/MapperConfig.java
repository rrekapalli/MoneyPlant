package com.moneyplant.screener.config;

import com.moneyplant.screener.mappers.ParamsetMapper;
import com.moneyplant.screener.mappers.ParamsetMapperManualImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.cache.annotation.EnableCaching;
import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class MapperConfig {

    // Provide a fallback bean only if no ParamsetMapper bean is already available.
    @Bean
    @ConditionalOnMissingBean(ParamsetMapper.class)
    public ParamsetMapper paramsetMapper() {
        // Use hand-written implementation to avoid dependency on MapStruct codegen at runtime
        return new ParamsetMapperManualImpl();
    }

    /**
     * Cache manager for criteria metadata caching.
     * Uses Caffeine for high-performance in-memory caching.
     */
    @Bean("criteriaCacheManager")
    public CacheManager criteriaCacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager();
        cacheManager.setCaffeine(Caffeine.newBuilder()
            .maximumSize(1000)
            .expireAfterWrite(30, TimeUnit.MINUTES)
            .recordStats());
        
        // Define cache names for different criteria components
        cacheManager.setCacheNames(
            "fieldMetadata",
            "functionDefinitions", 
            "validationRules",
            "sqlTemplates"
        );
        
        return cacheManager;
    }
}
