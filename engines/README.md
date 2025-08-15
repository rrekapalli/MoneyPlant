# MoneyPlant Engines

The MoneyPlant Engines module is a comprehensive Spring Boot application designed to handle all backend trading engine operations including backtesting, data ingestion, querying, market scanning, data storage, and strategy execution.

## Overview

This module serves as the core engine for the MoneyPlant trading platform, providing:

- **Backtesting Engine**: Comprehensive strategy backtesting with performance metrics
- **Data Ingestion**: Multi-source market data ingestion (Yahoo Finance, CSV, Excel, etc.)
- **Query Engine**: High-performance data querying and analytics
- **Market Scanner**: Real-time market scanning for trading opportunities
- **Storage Engine**: Efficient data storage with data lake capabilities
- **Strategy Engine**: Strategy management and execution

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
engines/
├── backtest/          # Strategy backtesting services
├── ingestion/         # Market data ingestion services
├── query/            # Data querying and analytics services
├── scanner/          # Market scanning services
├── storage/          # Data storage and management services
├── strategy/         # Strategy management services
└── config/           # Configuration classes
```

## Technology Stack

- **Java 21**: Latest LTS version with modern language features
- **Spring Boot 3.2.0**: Latest Spring Boot version with Spring 6
- **Apache Spark 3.5.0**: Big data processing and analytics
- **Apache Kafka 3.6.0**: Real-time data streaming
- **Apache Hudi 0.15.0**: Data lake table format
- **Apache Iceberg 1.4.3**: Table format for large datasets
- **Trino 443**: Distributed SQL query engine
- **PostgreSQL**: Primary database
- **Redis**: Caching layer
- **Lombok**: Reduces boilerplate code

## Features

### Backtesting Engine
- Multi-timeframe strategy backtesting
- Performance metrics calculation (Sharpe ratio, Sortino ratio, max drawdown)
- Custom parameter optimization
- Historical data simulation
- Commission and slippage modeling

### Data Ingestion
- Multiple data source support (Yahoo Finance, Alpha Vantage, Polygon)
- Batch and real-time ingestion
- File format support (CSV, Excel)
- Rate limiting and error handling
- Data validation and quality checks

### Query Engine
- High-performance data querying
- Technical indicator calculations
- Aggregated data queries
- Custom SQL execution
- Query optimization and caching

### Market Scanner
- Real-time market scanning
- Technical pattern recognition
- Support/resistance level detection
- Volume anomaly detection
- Alert system integration

### Storage Engine
- Multi-format data storage (Parquet, Iceberg, Hudi)
- Data compression and optimization
- Partitioning strategies
- Backup and archival
- Data integrity validation

### Strategy Engine
- Strategy creation and management
- Parameter validation
- Version control
- Performance tracking
- Risk management integration

## Getting Started

### Prerequisites

- Java 21 or higher
- Maven 3.8 or higher
- PostgreSQL 13 or higher
- Redis 6 or higher
- Apache Kafka 3.0 or higher
- Docker (optional)

### Auto-Start Configuration

The engines application supports **automatic startup** of critical services:

- **NSE Indices Ingestion**: Automatically starts WebSocket connection on boot
- **Configurable Delays**: Allow other services to initialize first
- **Profile-Based**: Different settings for development vs production
- **Fallback Handling**: Graceful error handling for connection failures

See [Auto-Start Configuration](./docs/AUTO_START_CONFIGURATION.md) for detailed setup instructions.

### Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DB_USERNAME=postgres
DB_PASSWORD=postgres

# Kafka
KAFKA_BOOTSTRAP_SERVERS=localhost:9092

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# API Keys (optional)
ALPHA_VANTAGE_API_KEY=your_key_here
POLYGON_API_KEY=your_key_here

# JWT
JWT_SECRET=your_secret_key_here
```

### Running the Application

#### Using Maven
```bash
cd engines
mvn spring-boot:run
```

#### Using Docker
```bash
# Build the image
docker build -t moneyplant-engines .

# Run the container
docker run -p 8081:8081 --env-file .env moneyplant-engines
```

#### Using Docker Compose
```bash
docker-compose up -d
```

### Configuration

The application uses `application.yml` for configuration. Key configuration sections:

- **Database**: Connection pooling and JPA settings
- **Kafka**: Producer/consumer configurations
- **Spark**: Big data processing settings
- **Data Lake**: Storage format and partitioning
- **Market Data**: Source configurations and rate limits
- **Backtesting**: Performance and risk parameters

## API Endpoints

The application exposes REST APIs under `/engines` context path:

- **Health Check**: `/engines/actuator/health`
- **Metrics**: `/engines/actuator/metrics`
- **Info**: `/engines/actuator/info`

## Development

### Project Structure

```
src/
├── main/
│   ├── java/
│   │   └── com/moneyplant/engines/
│   │       ├── EnginesApplication.java
│   │       ├── backtest/
│   │       ├── ingestion/
│   │       ├── query/
│   │       ├── scanner/
│   │       ├── storage/
│   │       ├── strategy/
│   │       └── config/
│   └── resources/
│       └── application.yml
└── test/
    └── java/
        └── com/moneyplant/engines/
```

### Adding New Features

1. Create service interfaces in the appropriate package
2. Implement services with proper error handling
3. Add configuration properties if needed
4. Write comprehensive tests
5. Update documentation

### Testing

```bash
# Run all tests
mvn test

# Run specific test class
mvn test -Dtest=BacktestServiceTest

# Run with coverage
mvn jacoco:report
```

## Monitoring and Observability

- **Health Checks**: Built-in health indicators
- **Metrics**: Prometheus metrics export
- **Logging**: Structured logging with configurable levels
- **Tracing**: Distributed tracing support (optional)

## Performance Considerations

- **Connection Pooling**: Optimized database connections
- **Caching**: Redis-based caching for frequently accessed data
- **Batch Processing**: Efficient batch operations for large datasets
- **Async Processing**: Non-blocking operations where possible
- **Data Partitioning**: Strategic data partitioning for query performance

## Security

- **JWT Authentication**: Token-based authentication
- **OAuth2 Support**: OAuth2 client integration
- **Input Validation**: Comprehensive input validation
- **SQL Injection Protection**: Parameterized queries
- **Rate Limiting**: API rate limiting

## Deployment

### Production Deployment

1. Set appropriate environment variables
2. Configure production database and messaging systems
3. Set up monitoring and alerting
4. Configure load balancing
5. Set up backup and disaster recovery

### Scaling

The application is designed to scale horizontally:
- Stateless design for easy scaling
- Kafka-based message queuing
- Database connection pooling
- Cache distribution

## Troubleshooting

### Common Issues

1. **Database Connection**: Check database credentials and connectivity
2. **Kafka Connection**: Verify Kafka broker configuration
3. **Memory Issues**: Adjust JVM heap size and Spark memory settings
4. **Performance**: Monitor query performance and optimize as needed

### Logs

Check application logs for detailed error information:
```bash
tail -f logs/engines.log
```

## Contributing

1. Follow the existing code style
2. Add comprehensive tests for new features
3. Update documentation
4. Submit pull requests with detailed descriptions

## License

This project is part of the MoneyPlant trading platform and follows the same licensing terms.

## Support

For support and questions:
- Create an issue in the project repository
- Contact the development team
- Check the documentation and troubleshooting guides
