package com.moneyplant.trading.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

@Configuration
public class TrinoConfig {

    @Value("${trino.url:jdbc:trino://localhost:8080}")
    private String trinoUrl;

    @Value("${trino.user:admin}")
    private String trinoUser;

    @Value("${trino.catalog:hive}")
    private String trinoCatalog;

    @Value("${trino.schema:default}")
    private String trinoSchema;

    @Bean
    public DataSource trinoDataSource() {
        // TODO: Implement proper DataSource configuration
        return null;
    }

    @Bean
    public Connection trinoConnection() throws SQLException {
        return DriverManager.getConnection(trinoUrl, trinoUser, "");
    }

    public String getTrinoCatalog() {
        return trinoCatalog;
    }

    public String getTrinoSchema() {
        return trinoSchema;
    }
}
