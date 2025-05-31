# MoneyPlant

MoneyPlant is a microservices-based financial portfolio management application that allows users to track investments, monitor stocks, and manage their financial portfolios.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Services](#services)
- [Technologies](#technologies)
- [Prerequisites](#prerequisites)
- [Setup Instructions](#setup-instructions)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [Troubleshooting](#troubleshooting)

## Architecture Overview

MoneyPlant follows a microservices architecture with the following components:

- **API Gateway**: Entry point for all client requests, handles routing, authentication, and rate limiting
- **Discovery Server**: Service registry for dynamic service discovery (Eureka)
- **Config Server**: Centralized configuration management
- **Core Services**: Portfolio, Stock, Transaction, and Watchlist services

## Services

- **api-gateway**: Routes requests to appropriate services, handles authentication and rate limiting
- **config-server**: Provides centralized configuration for all services
- **discovery-server**: Service registry for dynamic service discovery (Eureka)
- **money-plant-core**: Common code and utilities shared across services
- **portfolio-service**: Manages user portfolios
- **stock-service**: Provides stock information and market data
- **transaction-service**: Handles investment transactions
- **watchlist-service**: Manages user watchlists for tracking stocks

## Technologies

- **Java 21**: Core programming language
- **Spring Boot 3.3.0**: Application framework
- **Spring Cloud**: Microservices ecosystem
- **Spring Data JPA**: Data access layer
- **PostgreSQL**: Database (configurable per environment)
- **RabbitMQ**: Message queue for asynchronous communication
- **Docker**: Containerization
- **Kubernetes**: Container orchestration (for production)
- **Resilience4j**: Circuit breaker implementation
- **Zipkin**: Distributed tracing
- **OpenAPI/Swagger**: API documentation

## Prerequisites

- Java 21 or higher
- Maven 3.8 or higher
- Docker and Docker Compose (for local development)
- PostgreSQL (if running services directly)
- RabbitMQ (if running services directly)

## Setup Instructions

### Docker Image Building

The project is configured to automatically build Docker images whenever a Maven package is created. This is done using the Maven Exec Plugin, which runs a script after the package phase.

For more details, see the [Docker Image Building Guide](README-docker-images.md).

### Local Development with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-plant.git
   cd money-plant
   ```

2. Build the project:
   ```bash
   mvn clean package
   ```
   This will also build Docker images for all services automatically.

3. Start the services using Docker Compose:
   ```bash
   docker-compose up -d
   ```

4. Access the services:
   - API Gateway: http://localhost:8080
   - Eureka Dashboard: http://localhost:8761
   - Swagger UI: http://localhost:8080/swagger-ui.html

### Manual Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-plant.git
   cd money-plant
   ```

2. Build the project:
   ```bash
   mvn clean package
   ```

3. Start the services in the following order:
   - Config Server
   - Discovery Server
   - Other services
   - API Gateway

   ```bash
   # Example for starting the Config Server
   cd config-server
   mvn spring-boot:run
   ```

## API Documentation

The API documentation is available through Swagger UI at:
http://localhost:8080/swagger-ui.html

All APIs follow a versioned approach with the format:
```
/api/v{version_number}/{resource}
```

For more details, see the [API Versioning Strategy](docs/api-versioning-strategy.md).

## Contributing

Please read the [Contribution Guidelines](docs/contributing.md) before submitting pull requests.

## Troubleshooting

For common issues and solutions, please refer to the [Troubleshooting Guide](docs/troubleshooting.md).
