package com.moneyplant.engines.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.orm.jpa.JpaTransactionManager;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.annotation.EnableTransactionManagement;

import javax.sql.DataSource;

/**
 * Transaction configuration to ensure proper transaction management.
 * This configuration ensures that transactions are properly managed
 * and autocommit is disabled for database operations.
 */
@Configuration
@EnableTransactionManagement
public class TransactionConfig {

    /**
     * Configure JPA transaction manager with proper settings.
     * This ensures that transactions are properly managed and
     * autocommit is disabled for database operations.
     */
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setDataSource(dataSource);
        
        // Ensure proper transaction management
        transactionManager.setDefaultTimeout(30); // 30 seconds timeout
        transactionManager.setRollbackOnCommitFailure(true);
        
        return transactionManager;
    }
}
