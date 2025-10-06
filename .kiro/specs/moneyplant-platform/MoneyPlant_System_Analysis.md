# MoneyPlant System Analysis - Comprehensive Documentation for Spec Creation

## Executive Summary

MoneyPlant is a comprehensive financial portfolio management application built using Spring Boot Modulith architecture. The system provides portfolio tracking, stock analysis, transaction management, market screening, and data processing capabilities through a modular monolithic design with clear module boundaries.

## System Architecture Overview

### Technology Stack

**Backend:**
- Java 21 with Spring Boot 3.2.0
- Spring Boot Modulith for modular architecture
- Spring Data JPA with PostgreSQL
- Spring Security with JWT authentication
- OAuth2 client support (Google, Microsoft)
- Apache Spark 3.5.0 for big data processing
- Apache Kafka for real-time data streaming
- Apache Hudi & Iceberg for data lake capabilities
- Trino for distributed SQL queries
- MapStruct for object mapping
- OpenAPI/Swagger for documentation

**Frontend:**
- Angular 20.0.4 with TypeScript 5.8.3
- PrimeNG 20.0.0 for UI components
- Chart.js & ECharts for data visualization
- Angular Gridster2 for dashboard layouts
- STOMP.js for WebSocket communication
- Azure MSAL for authentication

**Data Processing Engine:**
- Separate Spring Boot application for trading engines
- Backtesting, data ingestion, query processing
- Market screening and strategy execution
- Real-time data processing with Kafka

### Architectural Patterns

1. **Modular Monolith**: Clear module boundaries with Spring Boot Modulith
2. **Domain-Driven Design**: Each module represents a bounded context
3. **Event-Driven Architecture**: Kafka-based messaging between components
4. **CQRS Pattern**: Separate read/write models for complex queries
5. **Microservices-Ready**: Modules can be extracted as microservices

## Core Modules Analysis

### 1. Core Module (`com.moneyplant.core`)

**Purpose**: Shared functionality and common components across all modules

**Key Components:**
- Base entities with audit fields (`BaseEntity`, `BaseAuditEntity`)
- User management (`User` entity, `UserRepository`)
- Authentication & security (`JwtTokenProvider`, `CustomOAuth2UserService`)
- Global exception handling (`GlobalExceptionHandler`)
- Common configurations (`SecurityConfig`, `CorsConfig`)

**Entities:**
- User (authentication and user management)
- Base audit entities for tracking creation/modification
- NSE market data entities (equity, indices, historical data)

**APIs:**
- Authentication endpoints (`/api/auth/*`)
- Token validation and refresh
- OAuth2 integration endpoints

### 2. Portfolio Module (`com.moneyplant.portfolio`)

**Purpose**: Investment portfolio management and analysis

**Key Features:**
- Portfolio creation and management
- Holdings tracking with real-time valuations
- Transaction recording and analysis
- Benchmark comparison
- Performance metrics calculation
- Cash flow tracking

**Entities:**
- `Portfolio` - Main portfolio entity
- `PortfolioHolding` - Individual stock holdings
- `PortfolioTransaction` - Buy/sell transactions
- `PortfolioValuationDaily` - Daily portfolio valuations
- `PortfolioMetricsDaily` - Performance metrics
- `PortfolioBenchmark` - Benchmark associations
- `PortfolioCashFlow` - Cash flow tracking

**APIs:**
- CRUD operations for portfolios (`/api/v1/portfolio`)
- Holdings management
- Transaction recording
- Performance analytics
- Benchmark comparison

### 3. Stock Module (`com.moneyplant.stock`)

**Purpose**: Stock data management and market information

**Key Features:**
- Stock master data management
- Real-time price feeds
- Historical data storage
- Technical indicators
- Market indices tracking
- Stock ticks and quotes

**Entities:**
- `Stock` - Basic stock information
- `NseEquity` - NSE equity details
- `NseStockTick` - Real-time tick data
- `NseEquityHistoricData` - Historical OHLCV data
- `NseEqIndicator` - Technical indicators

**APIs:**
- Stock information retrieval (`/api/v1/stock`)
- Historical data queries
- Real-time tick data
- Technical indicators
- Market indices data

### 4. Transaction Module (`com.moneyplant.transaction`)

**Purpose**: Investment transaction processing and management

**Key Features:**
- Transaction recording (buy/sell/dividend)
- Transaction status tracking
- Transaction validation
- Portfolio integration
- Audit trail maintenance

**Entities:**
- `Transaction` - Main transaction entity
- `TransactionType` - Buy/Sell/Dividend enumeration
- `TransactionStatus` - Pending/Completed/Failed status

**APIs:**
- Transaction CRUD operations (`/api/v1/transactions`)
- Transaction filtering and search
- Status updates
- Bulk transaction processing

### 5. Screener Module (`com.moneyplant.screener`)

**Purpose**: Advanced stock screening and filtering capabilities

**Key Features:**
- Custom screener creation with SQL-based logic
- Version control for screeners
- Parameter sets for different configurations
- Scheduled screening runs
- Result analysis and comparison
- User favorites and saved views
- Alert system integration

**Entities:**
- `Screener` - Main screener definition
- `ScreenerVersion` - Version control
- `ScreenerParamset` - Parameter configurations
- `ScreenerRun` - Execution instances
- `ScreenerResult` - Screening results
- `ScreenerStar` - User favorites
- `ScreenerSavedView` - Custom views

**APIs:**
- Comprehensive screener management (`/api/screeners`)
- Version control operations
- Parameter set management
- Run execution and monitoring
- Result analysis and export
- User interaction features

### 6. Index Module (`com.moneyplant.index`)

**Purpose**: Market index tracking and analysis

**Key Features:**
- Index data management
- Historical index data
- Index composition tracking
- Performance analysis

**Entities:**
- `Index` - Market index definitions
- Index historical data entities

**APIs:**
- Index information retrieval (`/api/v1/index`)
- Historical data queries
- Index composition data

### 7. Watchlist Module (`com.moneyplant.watchlist`)

**Purpose**: User watchlist management (Currently minimal implementation)

**Key Features:**
- Stock watchlist creation
- Watchlist item management
- Real-time price monitoring
- Alert integration

## Data Processing Engine

### Separate Application (`engines/`)

**Purpose**: Heavy-duty data processing and trading operations

**Key Capabilities:**
- **Backtesting Engine**: Strategy backtesting with performance metrics
- **Data Ingestion**: Multi-source market data ingestion (Yahoo Finance, CSV, Excel)
- **Query Engine**: High-performance data querying and analytics
- **Market Screener**: Real-time market screening for trading opportunities
- **Storage Engine**: Efficient data storage with data lake capabilities
- **Strategy Engine**: Strategy management and execution

**Technology Stack:**
- Apache Spark for big data processing
- Apache Kafka for real-time streaming
- Apache Hudi & Iceberg for data lake storage
- Trino for distributed queries
- Redis for caching

## Frontend Architecture

### Angular Application Structure

**Core Features:**
- Responsive dashboard with customizable widgets
- Real-time data updates via WebSockets
- Interactive charts and visualizations
- Portfolio management interface
- Stock screening and analysis tools
- Authentication with OAuth2 support

**Key Modules:**
- Dashboard with gridster layout
- Portfolio management
- Holdings and positions tracking
- Market data visualization
- Screener interface
- Watchlist management

## Authentication & Security

### Multi-Provider Authentication
- JWT-based authentication with 9-hour expiration
- Automatic token refresh (24-hour refresh token)
- OAuth2 integration (Google, Microsoft Azure)
- Email-based login support
- CORS configuration for cross-origin requests

### Security Features
- Spring Security configuration
- JWT token validation and refresh
- OAuth2 user service integration
- Role-based access control
- API endpoint protection

## Data Management

### Database Design
- PostgreSQL as primary database
- Audit fields on all entities (created/modified by/on)
- Proper indexing for performance
- Foreign key relationships between modules
- Partitioning for historical data

### Data Lake Integration
- Apache Hudi for incremental data processing
- Apache Iceberg for large dataset management
- Parquet format for efficient storage
- Data versioning and time travel capabilities

## API Design

### RESTful API Standards
- Versioned APIs (`/api/v1/`)
- Consistent HTTP status codes
- Comprehensive OpenAPI documentation
- Standardized error responses (RFC-7807)
- Pagination support for list endpoints

### Real-time Features
- WebSocket integration for live data
- STOMP protocol for messaging
- Real-time portfolio updates
- Live market data feeds

## Development & Deployment

### Build System
- Maven-based build with multi-module structure
- Docker containerization
- Docker Compose for local development
- Automated frontend build integration
- Environment-specific configurations

### Monitoring & Observability
- Spring Boot Actuator for health checks
- Prometheus metrics export
- Structured logging with configurable levels
- Performance monitoring capabilities

## Current Implementation Gaps

### Areas for Enhancement

1. **Watchlist Module**: Currently minimal implementation
2. **Advanced Analytics**: Limited portfolio analytics features
3. **Risk Management**: Basic risk assessment capabilities
4. **Reporting**: Limited reporting and export features
5. **Mobile Support**: No dedicated mobile application
6. **Real-time Alerts**: Basic alert system implementation
7. **Social Features**: No social trading or sharing features
8. **Advanced Charting**: Limited technical analysis tools

### Technical Debt

1. **Test Coverage**: Inconsistent test coverage across modules
2. **Documentation**: Some modules lack comprehensive documentation
3. **Performance Optimization**: Potential query optimization opportunities
4. **Caching Strategy**: Limited caching implementation
5. **Error Handling**: Inconsistent error handling patterns

## Recommended Spec Areas

Based on this analysis, the following areas would benefit from comprehensive specs:

### High Priority
1. **Enhanced Portfolio Analytics** - Advanced performance metrics, risk analysis
2. **Comprehensive Watchlist System** - Full-featured watchlist management
3. **Advanced Reporting System** - Customizable reports and exports
4. **Real-time Alert System** - Comprehensive notification system
5. **Mobile Application** - React Native or Flutter mobile app

### Medium Priority
1. **Social Trading Features** - Portfolio sharing, following other traders
2. **Advanced Charting Tools** - Technical analysis capabilities
3. **Risk Management System** - Portfolio risk assessment and management
4. **Data Export/Import** - Comprehensive data management tools
5. **API Rate Limiting** - Advanced API management features

### Low Priority
1. **Multi-language Support** - Internationalization features
2. **Theme Customization** - Advanced UI customization
3. **Plugin System** - Extensible architecture for third-party integrations
4. **Advanced Caching** - Distributed caching implementation
5. **Performance Monitoring** - Advanced APM integration

## Conclusion

MoneyPlant represents a well-architected financial portfolio management system with a solid foundation for future enhancements. The modular design allows for incremental development and the existing infrastructure supports both current needs and future scalability requirements. The system would benefit from specs focusing on enhanced analytics, mobile support, and advanced user features to compete with modern fintech applications.