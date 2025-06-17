package com.moneyplant.transactionservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ComponentScan(basePackages = "com.moneyplant.transactionservice")
public class TransactionServiceApplication {
    // No main method needed in modulith
}
