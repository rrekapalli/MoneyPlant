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
    basePackages = {"com.moneyplant.*"}
)
@EntityScan(basePackages = {"com.moneyplant.*"})
@EnableJpaRepositories(basePackages = {"com.moneyplant.*"})
public class MoneyPlantApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoneyPlantApplication.class, args);
        log.info("MoneyPlant Application started successfully!");
    }
}
