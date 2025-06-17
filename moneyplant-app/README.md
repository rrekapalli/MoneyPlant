# MoneyPlant Modulith

This module serves as the entry point for the MoneyPlant application as a modulith. A modulith is a modular monolith, where the application is structured as a set of modules within a single deployment unit.

## Architecture

The MoneyPlant application has been converted from a microservices architecture to a modulith architecture. This means that all the services (stock-service, portfolio-service, transaction-service, watchlist-service) are now modules within a single application, rather than separate microservices.

The main benefits of this approach are:
- Simplified deployment and operations
- Direct method calls between modules instead of HTTP calls
- Shared database connection pool
- Reduced overhead and improved performance
- Easier testing and debugging

## Modules

The MoneyPlant application consists of the following modules:
- **moneyplant-core**: Common code and utilities used by all modules
- **stock-service**: Handles stock-related operations
- **portfolio-service**: Manages user portfolios
- **transaction-service**: Processes financial transactions
- **watchlist-service**: Manages user watchlists
- **moneyplant-app**: The main application module that integrates all other modules

## Running the Application

To run the MoneyPlant application as a modulith, follow these steps:

1. Build the application:
   ```
   mvn clean install
   ```

2. Run the application:
   ```
   cd moneyplant-app
   mvn spring-boot:run
   ```

3. Access the application at http://localhost:8080

## API Documentation

The API documentation is available at http://localhost:8080/swagger-ui.html

## Differences from Microservices Version

The main differences from the microservices version are:
- No need for service discovery (Eureka)
- No need for API Gateway
- No need for Config Server
- Direct method calls between modules instead of HTTP calls
- Single database connection pool
- Single deployment unit

## Future Improvements

Potential future improvements for the modulith architecture:
- Implement module boundaries using Spring Modulith
- Add event-driven communication between modules
- Implement CQRS pattern for better separation of concerns
- Add more comprehensive testing