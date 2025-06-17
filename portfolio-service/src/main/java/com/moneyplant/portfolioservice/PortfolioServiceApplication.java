package com.moneyplant.portfolioservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ComponentScan(basePackages = "com.moneyplant.portfolioservice")
public class PortfolioServiceApplication {
    // No main method needed in modulith
}
