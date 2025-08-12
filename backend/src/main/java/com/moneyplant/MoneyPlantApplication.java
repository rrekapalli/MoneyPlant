package com.moneyplant;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.modulith.Modulith;
import org.springframework.scheduling.annotation.EnableScheduling;

@Slf4j
@SpringBootApplication(scanBasePackages = "com.moneyplant")
@Modulith
@EntityScan(basePackages = {"com.moneyplant"})
@EnableJpaRepositories(basePackages = {"com.moneyplant"})
@EnableScheduling
public class MoneyPlantApplication {

    public static void main(String[] args) {
        SpringApplication.run(MoneyPlantApplication.class, args);
        log.info("MoneyPlant Application started successfully!");
    }
}
