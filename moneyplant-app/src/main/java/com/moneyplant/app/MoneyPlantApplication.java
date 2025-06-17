package com.moneyplant.app;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.FilterType;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@Slf4j
@SpringBootApplication
@ComponentScan(
        basePackages = {
                "com.moneyplant.core",
                "com.moneyplant.stockservice",
                "com.moneyplant.portfolioservice",
                "com.moneyplant.transactionservice",
                "com.moneyplant.watchlistservice",
                "com.moneyplant.app"
        }
)
@EntityScan(basePackages = {
        "com.moneyplant.core.entities",
        "com.moneyplant.stockservice.entities",
        "com.moneyplant.portfolioservice.entities",
        "com.moneyplant.transactionservice.entities",
        "com.moneyplant.watchlistservice.entities"
})
@EnableJpaRepositories(basePackages = {
        "com.moneyplant.stockservice.repositories",
        "com.moneyplant.portfolioservice.repositories",
        "com.moneyplant.transactionservice.repositories"
})
public class MoneyPlantApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoneyPlantApplication.class, args);
        log.info("MoneyPlant Application started successfully!");
    }
}
