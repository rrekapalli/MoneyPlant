package com.moneyplant.watchlistservice;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@Slf4j
@SpringBootApplication
public class WatchlistServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(WatchlistServiceApplication.class, args);
        log.info("Watchlist service application started!");
    }
}