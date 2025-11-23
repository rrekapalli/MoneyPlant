# Kite Connect Ingestion System

A robust, production-ready system for ingesting market data from Zerodha's Kite Connect API into TimescaleDB for historical analysis and backtesting.

## Overview

This module provides:
- **Instrument Master Data Import**: Fetch and store all tradable instruments from Kite Connect
- **Historical OHLCV Data Ingestion**: Retrieve historical candlestick data with multiple timeframes
- **Async Job Processing**: Non-blocking API with job tracking and status monitoring
- **Resilience Patterns**: Built-in retry, rate limiting, and circuit breaker using Resilience4j
- **TimescaleDB Optimization**: Hypertable partitioning and compression for efficient time-series storage

## Architecture

```
┌─────────────────┐
│  REST API       │  POST /api/ingestion/kite/instruments
│  Controller     │  POST /api/ingestion/kite/historical
└────────┬────────┘  GET  /api/ingestion/kite/status/{jobId}
         │
         ▼
┌─────────────────┐
│  Service Layer  │  - KiteInstrumentService
│  (Async)        │  - KiteHistoricalDataService
└────────┬────────┘  - KiteJobTrackingService
         │
         ▼
┌─────────────────┐
│  KiteConnect    │  Resilience4j:
│  Client Wrapper │  - Retry (exponential backoff)
└────────┬────────┘  - Rate Limiter (3 req/sec)
         │           - Circuit Breaker
         ▼
┌─────────────────┐
│  Kite Connect   │  Zerodha's Official API
│  API (v3.5.1)   │  
└─────────────────┘

         │
         ▼
┌─────────────────┐
│  Batch          │  JDBC Batch Operations
│  Repository     │  - Upsert Instruments
└────────┬────────┘  - Insert OHLCV Data
         │
         ▼
┌─────────────────┐
│  TimescaleDB    │  - kite_instrument_master
│  (PostgreSQL)   │  - kite_ohlcv_historic (hypertable)
└─────────────────┘
```

## API Endpoints

### 1. Import Instruments

Fetch all instruments from Kite Connect and store in database.

```bash
curl -X POST http://localhost:8080/api/ingestion/kite/instruments \
  -H "Content-Type: application/json" \
  -d '{
    "exchanges": ["NSE", "BSE"]
  }'
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "IN_PROGRESS",
  "startTime": "2024-01-15T10:30:00"
}
```

### 2. Fetch Historical Data

Retrieve historical OHLCV data for a single instrument.

```bash
curl -X POST http://localhost:8080/api/ingestion/kite/historical \
  -H "Content-Type: application/json" \
  -d '{
    "instrumentToken": "738561",
    "exchange": "NSE",
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31",
    "interval": "DAY"
  }'
```

**Supported Intervals:**
- `MINUTE`, `THREE_MINUTE`, `FIVE_MINUTE`, `TEN_MINUTE`
- `FIFTEEN_MINUTE`, `THIRTY_MINUTE`, `SIXTY_MINUTE`
- `DAY`

### 3. Batch Fetch Historical Data

Fetch historical data for multiple instruments in parallel.

```bash
curl -X POST http://localhost:8080/api/ingestion/kite/historical/batch \
  -H "Content-Type: application/json" \
  -d '{
    "instrumentTokens": ["738561", "779521", "895745"],
    "exchange": "NSE",
    "fromDate": "2024-01-01",
    "toDate": "2024-01-31",
    "interval": "DAY"
  }'
```

### 4. Check Job Status

Monitor the progress of async ingestion jobs.

```bash
curl http://localhost:8080/api/ingestion/kite/status/550e8400-e29b-41d4-a716-446655440000
```

**Response:**
```json
{
  "jobId": "550e8400-e29b-41d4-a716-446655440000",
  "status": "COMPLETED",
  "startTime": "2024-01-15T10:30:00",
  "endTime": "2024-01-15T10:32:15",
  "summary": {
    "totalRecords": 2500,
    "successCount": 2500,
    "failureCount": 0,
    "executionTime": "PT2M15S",
    "recordsByCategory": {
      "exchange_NSE": 1500,
      "exchange_BSE": 1000,
      "type_EQ": 2000,
      "type_FUT": 500
    }
  }
}
```

## Configuration

### Application Properties

```yaml
kite:
  api:
    key: ${KITE_API_KEY}
    secret: ${KITE_API_SECRET}
    access-token: ${KITE_ACCESS_TOKEN}
  
  ingestion:
    batch-size: 1000
    parallel-requests: 5
    
    retry:
      max-attempts: 3
      initial-delay-ms: 1000
      multiplier: 2.0
    
    rate-limit:
      requests-per-second: 3
      burst-capacity: 10
    
    circuit-breaker:
      failure-rate-threshold: 50
      wait-duration-seconds: 60
      sliding-window-size: 10
```

### Environment Variables

Create a `.env` file in the `engines` directory:

```bash
# Kite Connect API Credentials
KITE_API_KEY=your_api_key_here
KITE_API_SECRET=your_api_secret_here
KITE_ACCESS_TOKEN=your_access_token_here

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moneyplant
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

## Obtaining Kite API Credentials

1. **Sign up** for a Kite Connect developer account at https://kite.trade/
2. **Create an app** in the Kite Connect dashboard
3. **Get your API Key and Secret** from the app settings
4. **Generate Access Token**:
   - Use the login flow to authenticate
   - Exchange the request token for an access token
   - Access tokens are valid for one trading day

For detailed instructions, see: https://kite.trade/docs/connect/v3/

## Database Schema

### kite_instrument_master

Stores master data for all tradable instruments.

| Column | Type | Description |
|--------|------|-------------|
| instrument_token | VARCHAR(50) | Primary key - Zerodha's unique identifier |
| exchange | VARCHAR(10) | Primary key - Exchange code (NSE, BSE, etc.) |
| tradingsymbol | VARCHAR(100) | Trading symbol |
| name | VARCHAR(255) | Full name of the instrument |
| last_price | FLOAT8 | Last traded price |
| expiry | DATE | Expiry date (for derivatives) |
| strike | FLOAT8 | Strike price (for options) |
| tick_size | FLOAT8 | Minimum price movement |
| lot_size | INTEGER | Trading lot size |
| instrument_type | VARCHAR(10) | Type (EQ, FUT, CE, PE, etc.) |
| segment | VARCHAR(20) | Market segment |

### kite_ohlcv_historic (TimescaleDB Hypertable)

Stores historical OHLCV candlestick data.

| Column | Type | Description |
|--------|------|-------------|
| instrument_token | VARCHAR(50) | Primary key |
| exchange | VARCHAR(10) | Primary key |
| date | TIMESTAMPTZ | Primary key - Timestamp of candle |
| candle_interval | VARCHAR(20) | Primary key - Interval (minute, day, etc.) |
| open | FLOAT8 | Opening price |
| high | FLOAT8 | Highest price |
| low | FLOAT8 | Lowest price |
| close | FLOAT8 | Closing price |
| volume | BIGINT | Trading volume |

**TimescaleDB Features:**
- 7-day chunk partitioning for optimal query performance
- Automatic compression for data older than 30 days
- Optimized indexes for common query patterns

## Resilience Features

### Retry with Exponential Backoff

Automatically retries failed API calls with increasing delays:
- Initial delay: 1 second
- Multiplier: 2x
- Max attempts: 3

### Rate Limiting

Respects Kite Connect API limits:
- 3 requests per second
- Burst capacity: 10 requests

### Circuit Breaker

Prevents cascading failures:
- Opens after 50% failure rate
- Waits 60 seconds before retry
- Sliding window: 10 calls

## Error Handling

The system handles various error scenarios:

| Error Type | HTTP Status | Retry | Description |
|------------|-------------|-------|-------------|
| Authentication | 401 | No | Invalid or expired access token |
| Rate Limit | 429 | Yes | Too many requests, automatic backoff |
| API Error | 502/503 | Yes | Kite API temporary issues |
| Validation | 400 | No | Invalid request parameters |
| Database | 500 | No | Database connection or constraint errors |

## Running the System

### Prerequisites

- Java 21+
- PostgreSQL 14+ with TimescaleDB extension
- Maven 3.8+
- Kite Connect API credentials

### Build

```bash
cd engines
mvn clean install
```

### Run

```bash
mvn spring-boot:run
```

Or with environment variables:

```bash
KITE_API_KEY=xxx KITE_API_SECRET=yyy KITE_ACCESS_TOKEN=zzz mvn spring-boot:run
```

## Testing

### Unit Tests

```bash
mvn test
```

### Property-Based Tests

```bash
mvn test -Dtest=*PropertyTest*
```

### Integration Tests

```bash
mvn verify -P integration-tests
```

## Troubleshooting

### Authentication Errors

**Problem:** `401 Unauthorized` or `Access token not set`

**Solution:**
1. Verify your access token is valid and not expired
2. Regenerate access token using Kite Connect login flow
3. Update `KITE_ACCESS_TOKEN` environment variable

### Rate Limit Errors

**Problem:** `429 Too Many Requests`

**Solution:**
- The system automatically handles rate limiting with backoff
- Reduce `parallel-requests` in configuration
- Increase `rate-limit.requests-per-second` delay

### Database Connection Issues

**Problem:** `Connection refused` or `Database not found`

**Solution:**
1. Verify PostgreSQL is running: `pg_isready`
2. Check TimescaleDB extension: `SELECT * FROM pg_extension WHERE extname = 'timescaledb';`
3. Verify database credentials in configuration

### Circuit Breaker Open

**Problem:** `Circuit breaker is OPEN`

**Solution:**
- Wait for the configured wait duration (default: 60 seconds)
- Check Kite Connect API status
- Review logs for underlying error patterns

## Performance Tips

1. **Batch Operations**: Use batch endpoints for multiple instruments
2. **Parallel Processing**: Adjust `parallel-requests` based on your rate limits
3. **Chunk Size**: Optimize `batch-size` for your database performance
4. **Compression**: TimescaleDB automatically compresses old data
5. **Indexes**: Use provided indexes for common query patterns

## Monitoring

### Health Check

```bash
curl http://localhost:8080/actuator/health
```

### Metrics

```bash
curl http://localhost:8080/actuator/metrics
```

Key metrics to monitor:
- `kite.api.requests.total` - Total API calls
- `kite.api.requests.failed` - Failed API calls
- `kite.ingestion.jobs.active` - Active ingestion jobs
- `kite.ingestion.records.total` - Total records ingested

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
- GitHub Issues: https://github.com/your-org/moneyplant
- Kite Connect Docs: https://kite.trade/docs/connect/v3/
- TimescaleDB Docs: https://docs.timescale.com/

## Version History

- **v1.0.0** (2024-01-15)
  - Initial release
  - Kite Connect API v3.5.1 integration
  - TimescaleDB hypertable support
  - Async job processing with tracking
  - Resilience4j patterns (retry, rate limit, circuit breaker)
