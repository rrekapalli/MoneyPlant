package com.moneyplant.engines.ingestion.kite.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

@Configuration
@EnableAsync
@Slf4j
public class AsyncConfig {
    
    @Bean(name = "kiteIngestionExecutor")
    public ThreadPoolTaskExecutor kiteIngestionExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(10);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("kite-ingestion-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        
        executor.setTaskDecorator(runnable -> () -> {
            String threadName = Thread.currentThread().getName();
            log.debug("Starting async task in thread: {}", threadName);
            try {
                runnable.run();
                log.debug("Completed async task in thread: {}", threadName);
            } catch (Exception e) {
                log.error("Error in async task in thread: {}", threadName, e);
                throw e;
            }
        });
        
        executor.initialize();
        log.info("Initialized kiteIngestionExecutor with core={}, max={}, queue={}", 
            executor.getCorePoolSize(), executor.getMaxPoolSize(), executor.getQueueCapacity());
        
        return executor;
    }
}
