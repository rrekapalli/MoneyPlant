package com.moneyplant.screener.config;

import com.moneyplant.screener.mappers.ParamsetMapper;
import com.moneyplant.screener.mappers.ParamsetMapperManualImpl;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    // Provide a fallback bean only if no ParamsetMapper bean is already available.
    @Bean
    @ConditionalOnMissingBean(ParamsetMapper.class)
    public ParamsetMapper paramsetMapper() {
        // Use hand-written implementation to avoid dependency on MapStruct codegen at runtime
        return new ParamsetMapperManualImpl();
    }
}
