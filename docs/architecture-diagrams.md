# MoneyPlant Architecture Diagrams

This document provides visual representations of the MoneyPlant system architecture.

## System Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │
│  Web Clients    │     │  Mobile Clients │
│                 │     │                 │
└────────┬────────┘     └────────┬────────┘
         │                       │
         │                       │
         ▼                       ▼
┌─────────────────────────────────────────┐
│                                         │
│             API Gateway                 │
│                                         │
└───────────────────┬─────────────────────┘
                    │
                    │
                    ▼
┌─────────────────────────────────────────┐
│                                         │
│          Service Discovery              │
│             (Eureka)                    │
│                                         │
└───────────────────┬─────────────────────┘
                    │
                    │
                    ▼
┌─────────────────────────────────────────┐
│                                         │
│         Config Server                   │
│                                         │
└───────────────────┬─────────────────────┘
                    │
                    │
                    ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                               Microservices                                  │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │                │  │                │  │                │  │            │ │
│  │  Portfolio     │  │  Stock         │  │  Transaction   │  │  Watchlist │ │
│  │  Service       │  │  Service       │  │  Service       │  │  Service   │ │
│  │                │  │                │  │                │  │            │ │
│  └────────┬───────┘  └────────┬───────┘  └────────┬───────┘  └─────┬──────┘ │
│           │                   │                   │                 │        │
└───────────┼───────────────────┼───────────────────┼─────────────────┼────────┘
            │                   │                   │                 │
            │                   │                   │                 │
            ▼                   ▼                   ▼                 ▼
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                               Databases                                      │
│                                                                              │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐  ┌────────────┐ │
│  │                │  │                │  │                │  │            │ │
│  │  Portfolio     │  │  Stock         │  │  Transaction   │  │  Watchlist │ │
│  │  DB            │  │  DB            │  │  DB            │  │  DB        │ │
│  │                │  │                │  │                │  │            │ │
│  └────────────────┘  └────────────────┘  └────────────────┘  └────────────┘ │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Communication Flow

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐     ┌───────────────┐
│              │     │               │     │               │     │               │
│   Client     │────▶│  API Gateway  │────▶│  Service      │────▶│  Database     │
│              │     │               │     │               │     │               │
└──────────────┘     └───────────────┘     └───────────────┘     └───────────────┘
                            │                     ▲
                            │                     │
                            ▼                     │
                     ┌───────────────┐     ┌───────────────┐
                     │               │     │               │
                     │  Service      │────▶│  Message      │
                     │  Discovery    │     │  Queue        │
                     │               │     │               │
                     └───────────────┘     └───────────────┘
```

## Resilience Patterns

```
┌──────────────┐     ┌───────────────┐     ┌───────────────┐
│              │     │               │     │               │
│   Client     │────▶│  API Gateway  │────▶│  Service A    │
│              │     │  (Rate Limit) │     │  (Circuit     │
└──────────────┘     └───────────────┘     │   Breaker)    │
                                           └───────────────┘
                                                  │
                                                  │ (fallback)
                                                  ▼
                                           ┌───────────────┐
                                           │               │
                                           │  Service B    │
                                           │               │
                                           └───────────────┘
```

## Database Schema

Each service has its own database with the following structure:

### Portfolio Service

```
┌────────────────────────────┐
│ Portfolio                  │
├────────────────────────────┤
│ id (PK)                    │
│ name                       │
│ description                │
│ createdBy                  │
│ modifiedBy                 │
│ createdOn                  │
│ modifiedOn                 │
└────────────────────────────┘
```

### Stock Service

```
┌────────────────────────────┐
│ Stock                      │
├────────────────────────────┤
│ id (PK)                    │
│ symbol                     │
│ name                       │
│ currentPrice               │
│ createdBy                  │
│ modifiedBy                 │
│ createdOn                  │
│ modifiedOn                 │
└────────────────────────────┘
```

### Transaction Service

```
┌────────────────────────────┐
│ Transaction                │
├────────────────────────────┤
│ id (PK)                    │
│ portfolioId (FK)           │
│ stockId (FK)               │
│ type                       │
│ quantity                   │
│ price                      │
│ date                       │
│ createdBy                  │
│ modifiedBy                 │
│ createdOn                  │
│ modifiedOn                 │
└────────────────────────────┘
```

### Watchlist Service

```
┌────────────────────────────┐
│ Watchlist                  │
├────────────────────────────┤
│ id (PK)                    │
│ name                       │
│ description                │
│ createdBy                  │
│ modifiedBy                 │
│ createdOn                  │
│ modifiedOn                 │
└────────────────────────────┘

┌────────────────────────────┐
│ WatchlistItem              │
├────────────────────────────┤
│ id (PK)                    │
│ watchlistId (FK)           │
│ stockId (FK)               │
│ createdBy                  │
│ modifiedBy                 │
│ createdOn                  │
│ modifiedOn                 │
└────────────────────────────┘
```