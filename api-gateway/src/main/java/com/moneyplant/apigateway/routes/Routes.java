package com.moneyplant.apigateway.routes;

import org.springframework.cloud.gateway.server.mvc.handler.GatewayRouterFunctions;
import org.springframework.cloud.gateway.server.mvc.handler.HandlerFunctions;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.function.RequestPredicates;
import org.springframework.web.servlet.function.RouterFunction;
import org.springframework.web.servlet.function.ServerResponse;

import static org.springframework.cloud.gateway.server.mvc.filter.FilterFunctions.setPath;

@Configuration
public class Routes {

    @Bean
    public RouterFunction<ServerResponse> stockServiceRoute() {
        return GatewayRouterFunctions.route("stock_service")
                .route(RequestPredicates.path("/api/v1/stock/**"),
                        HandlerFunctions.http("lb://stock-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> stockServiceSwaggerRoute() {
        return GatewayRouterFunctions.route("stock_service_swagger")
                .route(RequestPredicates.path("/aggregate/stock-service/v1/api-docs"),
                        HandlerFunctions.http("lb://stock-service"))
                .filter(setPath("/api-docs"))
                .build();
    }


    @Bean
    public RouterFunction<ServerResponse> portfolioServiceRoute() {
        return GatewayRouterFunctions.route("portfolio_service")
                .route(RequestPredicates.path("/api/v1/portfolio/**"),
                        HandlerFunctions.http("lb://portfolio-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> portfolioServiceSwaggerRoute() {
        return GatewayRouterFunctions.route("portfolio_service_swagger")
                .route(RequestPredicates.path("/aggregate/portfolio-service/v1/api-docs"),
                        HandlerFunctions.http("lb://portfolio-service"))
                .filter(setPath("/api-docs"))
                .build();
    }


    @Bean
    public RouterFunction<ServerResponse> transactionServiceRoute() {
        return GatewayRouterFunctions.route("transaction_service")
                .route(RequestPredicates.path("/api/v1/transaction/**"),
                        HandlerFunctions.http("lb://transaction-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> transactionServiceSwaggerRoute() {
        return GatewayRouterFunctions.route("transaction_service_swagger")
                .route(RequestPredicates.path("/aggregate/transaction-service/v1/api-docs"),
                        HandlerFunctions.http("lb://transaction-service"))
                .filter(setPath("/api-docs"))
                .build();
    }


    @Bean
    public RouterFunction<ServerResponse> watchlistServiceRoute() {
        return GatewayRouterFunctions.route("watchlist_service")
                .route(RequestPredicates.path("/api/v1/watchlist/**"),
                        HandlerFunctions.http("lb://watchlist-service"))
                .build();
    }

    @Bean
    public RouterFunction<ServerResponse> watchlistServiceSwaggerRoute() {
        return GatewayRouterFunctions.route("watchlist_service_swagger")
                .route(RequestPredicates.path("/aggregate/watchlist-service/v1/api-docs"),
                        HandlerFunctions.http("lb://watchlist-service"))
                .filter(setPath("/api-docs"))
                .build();
    }
}
