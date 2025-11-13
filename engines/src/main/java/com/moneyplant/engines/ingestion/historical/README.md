# NSE Historical Data Ingestion Module

This module handles the ingestion of historical NSE bhavcopy data using Apache Spark for efficient bulk processing.

## Structure

```
historical/
├── config/          # Configuration classes (Spark, Ingestion settings)
├── controller/      # REST API endpoints
├── model/           # Data models and entities
├── provider/        # Data providers (NSE downloader)
├── repository/      # Database repositories
├── service/         # Business logic services
└── README.md        # This file
```

## Features

- Download NSE bhavcopy files for date ranges
- Process CSV files using Apache Spark for parallel processing
- Bulk insert to PostgreSQL/TimescaleDB
- Job tracking and progress monitoring
- Smart date range detection for incremental ingestion
- Retry logic with exponential backoff
- Staging directory management

## Configuration

See `application.yml` for configuration options under `ingestion.nse.historical` and `spark` sections.
