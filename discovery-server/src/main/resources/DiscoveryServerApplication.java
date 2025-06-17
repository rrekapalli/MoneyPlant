package com.moneyplant.discoveryserver;


import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@Slf4j
@EnableEurekaServer
@SpringBootApplication
public class DiscoveryServerApplication
{
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
        log.info("Discovery server application started!");
    }
}
