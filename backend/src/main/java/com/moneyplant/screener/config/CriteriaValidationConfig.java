package com.moneyplant.screener.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration properties for criteria validation.
 */
@Configuration
@ConfigurationProperties(prefix = "screener.criteria.validation")
@Data
public class CriteriaValidationConfig {

    /**
     * Maximum nesting depth for groups.
     */
    private int maxGroupDepth = 10;

    /**
     * Maximum number of conditions in a single DSL.
     */
    private int maxConditions = 100;

    /**
     * Maximum number of function parameters.
     */
    private int maxFunctionParams = 10;

    /**
     * Whether to enable performance warnings.
     */
    private boolean enablePerformanceWarnings = true;

    /**
     * Threshold for complex condition warnings.
     */
    private int complexityWarningThreshold = 50;

    /**
     * Whether to enable strict validation mode.
     */
    private boolean strictMode = false;
}