package com.moneyplant.engines.screener.datasource;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;

import javax.sql.DataSource;

public class TrinoDataSource {
    private final HikariDataSource ds;

    public TrinoDataSource(String jdbcUrl, String username) {
        HikariConfig cfg = new HikariConfig();
        cfg.setJdbcUrl(jdbcUrl);
        cfg.setUsername(username);
        cfg.setMaximumPoolSize(8);
        cfg.setConnectionTimeout(3000);
        cfg.setDriverClassName("io.trino.jdbc.TrinoDriver");
        this.ds = new HikariDataSource(cfg);
    }

    public DataSource getDataSource() {
        return ds;
    }
}
