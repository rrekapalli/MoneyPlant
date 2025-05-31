package com.moneyplant.transactionservice.config;

/**
 * This class was removed as we're now disabling the problematic auto-configurations
 * through application.properties instead of overriding the beans.
 * 
 * The following properties were added to application.properties:
 * 
 * # Disable auto-configurations causing BeanPostProcessor warnings
 * spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.integration.IntegrationAutoConfiguration,org.springframework.cloud.stream.config.BindersHealthIndicatorAutoConfiguration,org.springframework.cloud.client.loadbalancer.LoadBalancerAutoConfiguration,org.springframework.cloud.client.loadbalancer.reactive.LoadBalancerBeanPostProcessorAutoConfiguration
 * 
 * # Disable JMX to avoid BeanPostProcessor warnings
 * spring.jmx.enabled=false
 */
