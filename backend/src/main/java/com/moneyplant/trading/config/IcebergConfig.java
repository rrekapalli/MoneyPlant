package com.moneyplant.trading.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Configuration
public class IcebergConfig {

    @Value("${iceberg.warehouse.path:/tmp/iceberg")
    private String icebergWarehousePath;

    @Value("${iceberg.table.name:market_data")
    private String icebergTableName;

    @Value("${iceberg.format.version:2}")
    private String icebergFormatVersion;

    @Value("${iceberg.write.delete.enabled:true}")
    private boolean icebergWriteDeleteEnabled;

    @Bean
    public Map<String, String> icebergOptions() {
        Map<String, String> options = new HashMap<>();
        options.put("warehouse", icebergWarehousePath);
        options.put("write.format.default", "parquet");
        options.put("write.parquet.compression", "snappy");
        options.put("write.parquet.row-group-size-bytes", "134217728");
        options.put("write.parquet.page-size-bytes", "1048576");
        options.put("write.delete.enabled", String.valueOf(icebergWriteDeleteEnabled));
        options.put("write.format-version", icebergFormatVersion);
        return options;
    }

    public String getIcebergWarehousePath() {
        return icebergWarehousePath;
    }

    public String getIcebergTableName() {
        return icebergTableName;
    }
}
