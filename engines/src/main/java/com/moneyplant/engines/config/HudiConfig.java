package com.moneyplant.engines.config;

import org.springframework.context.annotation.Configuration;

/**
 * Apache Hudi configuration for the engines application
 * Temporarily commented out to avoid dependency issues
 */
@Configuration
public class HudiConfig {
    
    // Temporarily commented out to avoid dependency issues
    /*
    import org.apache.hudi.DataSourceWriteOptions;
    import org.apache.hudi.config.HoodieWriteConfig;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.context.annotation.Bean;
    import java.util.HashMap;
    import java.util.Map;
    */

    // Temporarily commented out to avoid dependency issues
    /*
    @Value("${hudi.base-path:/tmp/hudi}")
    private String basePath;

    @Value("${hudi.table-name:market_data}")
    private String tableName;

    @Value("${hudi.key-generator:org.apache.hudi.keygen.SimpleKeyGenerator}")
    private String keyGenerator;

    @Value("${hudi.partition-path-field:date}")
    private String partitionPathField;

    @Bean
    public Map<String, String> hudiWriteOptions() {
        Map<String, String> options = new HashMap<>();
        options.put(DataSourceWriteOptions.TABLE_TYPE_OPT_KEY(), "COPY_ON_WRITE");
        options.put(DataSourceWriteOptions.RECORDKEY_FIELD_OPT_KEY(), "symbol");
        options.put(DataSourceWriteOptions.PARTITIONPATH_FIELD_OPT_KEY(), partitionPathField);
        options.put(DataSourceWriteOptions.PRECOMBINE_FIELD_OPT_KEY(), "timestamp");
        options.put(DataSourceWriteOptions.KEYGENERATOR_CLASS_OPT_KEY(), keyGenerator);
        options.put(DataSourceWriteOptions.HIVE_STYLE_PARTITIONING_OPT_KEY(), "true");
        options.put(DataSourceWriteOptions.OPERATION_OPT_KEY(), "upsert");
        options.put(DataSourceWriteOptions.TABLE_NAME_OPT_KEY(), tableName);
        options.put(DataSourceWriteOptions.BASE_PATH_OPT_KEY(), basePath);
        
        return options;
    }

    @Bean
    public Map<String, String> hudiReadOptions() {
        Map<String, String> options = new HashMap<>();
        options.put(DataSourceWriteOptions.TABLE_TYPE_OPT_KEY(), "COPY_ON_WRITE");
        options.put(DataSourceWriteOptions.BASE_PATH_OPT_KEY(), basePath);
        
        return options;
    }
    */
}
