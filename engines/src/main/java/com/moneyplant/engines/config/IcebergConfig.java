package com.moneyplant.engines.config;

import org.springframework.context.annotation.Configuration;

/**
 * Apache Iceberg configuration for the engines application
 * Temporarily commented out to avoid dependency issues
 */
@Configuration
public class IcebergConfig {
    
    // Temporarily commented out to avoid dependency issues
    /*
    import org.apache.iceberg.CatalogProperties;
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.context.annotation.Bean;
    import java.util.HashMap;
    import java.util.Map;
    */

    // Temporarily commented out to avoid dependency issues
    /*
    @Value("${iceberg.catalog-name:iceberg_catalog}")
    private String catalogName;

    @Value("${iceberg.warehouse-location:/tmp/iceberg}")
    private String warehouseLocation;

    @Value("${iceberg.io-impl:org.apache.iceberg.aws.s3.S3FileIO}")
    private String ioImpl;

    @Value("${iceberg.s3.endpoint:}")
    private String s3Endpoint;

    @Value("${iceberg.s3.access-key:}")
    private String s3AccessKey;

    @Value("${iceberg.s3.secret-key:}")
    private String s3SecretKey;

    @Bean
    public Map<String, String> icebergCatalogProperties() {
        Map<String, String> properties = new HashMap<>();
        properties.put(CatalogProperties.CATALOG_IMPL, "org.apache.iceberg.aws.glue.GlueCatalog");
        properties.put(CatalogProperties.WAREHOUSE_LOCATION, warehouseLocation);
        properties.put(CatalogProperties.BASE_PATH_OPT_KEY(), basePath);
        
        return properties;
    }

    @Bean
    public Map<String, String> icebergTableProperties() {
        Map<String, String> properties = new HashMap<>();
        properties.put("write.format.default", "parquet");
        properties.put("write.parquet.compression", "snappy");
        properties.put("write.parquet.row-group-size-bytes", "134217728");
        properties.put("write.parquet.page-size-bytes", "1048576");
        properties.put("write.parquet.dict-size-bytes", "2097152");
        
        return properties;
    }
    */
}
