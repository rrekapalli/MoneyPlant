# MoneyPlant Changelog

All notable changes to the MoneyPlant project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial project setup with microservices architecture
- API Gateway with routing and rate limiting
- Service Discovery with Eureka
- Config Server for centralized configuration
- Portfolio Service for managing investment portfolios
- Stock Service for stock information
- Transaction Service for tracking investment transactions
- Watchlist Service for monitoring stocks of interest
- Circuit breaker pattern implementation with Resilience4j
- Distributed tracing with Zipkin
- Message queue integration with RabbitMQ
- API versioning strategy
- Environment-specific configurations
- Authentication and authorization with OAuth2/JWT
- Comprehensive documentation

## [1.0.0] - 2023-06-01

### Added
- Initial release of MoneyPlant
- Core functionality for portfolio management
- Basic stock information retrieval
- Simple transaction tracking
- Watchlist creation and management
- User authentication and authorization
- RESTful API endpoints for all services
- Swagger documentation for APIs
- Docker containerization support
- Kubernetes deployment manifests

### Security
- Secure storage of database credentials
- Password encryption
- HTTPS configuration
- API key validation
- Request validation to prevent injection attacks
- CORS configuration
- Security headers in API responses

## [0.9.0] - 2023-05-15

### Added
- Beta release for internal testing
- Portfolio management features
- Stock information retrieval
- Transaction tracking
- Watchlist management
- User authentication

### Changed
- Improved error handling
- Enhanced logging
- Better performance for stock data retrieval

### Fixed
- Issue with portfolio creation
- Bug in transaction amount calculation
- Error in watchlist item removal

## [0.8.0] - 2023-04-20

### Added
- Alpha release for early adopters
- Basic portfolio management
- Limited stock information
- Simple transaction recording
- Initial watchlist functionality

### Known Issues
- Performance issues with large portfolios
- Limited error handling
- Incomplete documentation
- No support for multiple currencies

## [0.7.0] - 2023-03-10

### Added
- Proof of concept implementation
- Core service structure
- Basic API endpoints
- Simple database schema
- Initial Docker support

### Changed
- Switched from monolithic to microservices architecture
- Improved database schema
- Enhanced API design

## [0.6.0] - 2023-02-15

### Added
- Initial project structure
- Basic service definitions
- Preliminary API design
- Database schema design
- Development environment setup

[Unreleased]: https://github.com/yourusername/money-plant/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/yourusername/money-plant/compare/v0.9.0...v1.0.0
[0.9.0]: https://github.com/yourusername/money-plant/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/yourusername/money-plant/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/yourusername/money-plant/compare/v0.6.0...v0.7.0
[0.6.0]: https://github.com/yourusername/money-plant/releases/tag/v0.6.0