package com.moneyplant.engines.config;

import org.springframework.context.annotation.Configuration;

/**
 * Trino configuration for the engines application
 * Temporarily commented out to avoid dependency issues
 */
@Configuration
public class TrinoConfig {
    
    // Temporarily commented out to avoid dependency issues
    /*
    import org.springframework.beans.factory.annotation.Value;
    import org.springframework.context.annotation.Bean;
    import javax.sql.DataSource;
    import com.zaxxer.hikari.HikariConfig;
    import com.zaxxer.hikari.HikariDataSource;
    */

    // Temporarily commented out to avoid dependency issues
    /*
    @Value("${trino.url:jdbc:trino://localhost:8080}")
    private String trinoUrl;

    @Value("${trino.username:trino}")
    private String username;

    @Value("${trino.password:}")
    private String password;

    @Value("${trino.catalog:memory}")
    private String catalog;

    @Value("${trino.schema:default}")
    private String schema;

    @Bean
    public DataSource trinoDataSource() {
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(trinoUrl + "/" + catalog + "/" + schema);
        config.setUsername(username);
        config.setPassword(password);
        config.setDriverClassName("io.trino.jdbc.TrinoDriver");
        config.setMaximumPoolSize(10);
        config.setMinimumIdle(2);
        config.setConnectionTimeout(30000);
        config.setIdleTimeout(600000);
        config.setMaxLifetime(1800000);
        
        return new HikariDataSource(config);
    }
    */
}
