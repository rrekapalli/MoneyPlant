package com.moneyplant.watchlistservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

@Slf4j
@Configuration
@ComponentScan(basePackages = "com.moneyplant.watchlistservice")
public class WatchlistServiceApplication {
    // No main method needed in modulith
}
