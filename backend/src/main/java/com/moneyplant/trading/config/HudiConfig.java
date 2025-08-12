package com.moneyplant.trading.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class HudiConfig {

    @Value("${hudi.base.path:/tmp/hudi")
    private String hudiBasePath;

    @Value("${hudi.table.name:market_data")
    private String hudiTableName;

    @Value("${hudi.record.key.field:timestamp}")
    private String hudiRecordKeyField;

    @Value("${hudi.partition.path.field:date}")
    private String hudiPartitionPathField;

    @Bean
    public Map<String, String> hudiOptions() {
        Map<String, String> options = new HashMap<>();
        options.put("hoodie.table.name", hudiTableName);
        options.put("hoodie.datasource.write.recordkey.field", hudiRecordKeyField);
        options.put("hoodie.datasource.write.partitionpath.field", hudiPartitionPathField);
        options.put("hoodie.datasource.write.keygenerator.class", "org.apache.hudi.keygen.SimpleKeyGenerator");
        options.put("hoodie.datasource.write.operation", "upsert");
        options.put("hoodie.cleaner.policy", "KEEP_LATEST_COMMITS");
        options.put("hoodie.cleaner.commits.retained", "10");
        return options;
    }

    public String getHudiBasePath() {
        return hudiBasePath;
    }

    public String getHudiTableName() {
        return hudiTableName;
    }
}
