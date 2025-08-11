# Index Historical Data Endpoint

## Overview

A new endpoint has been added to retrieve historical data for indices from the `nse_indices_historical_data` table using Trino queries.

## Endpoint Details

### GET `/api/v1/index/{indexName}/historical-data`

Retrieves historical data for a given index name.

#### Parameters
- `indexName` (path parameter): The name of the index to retrieve historical data for

#### Response
Returns a list of `IndexHistoricalDataDto` objects containing:
- `indexName`: The name of the index
- `date`: The date of the historical data (LocalDate)
- `open`: Opening price
- `high`: Highest price for the day
- `low`: Lowest price for the day
- `close`: Closing price
- `volume`: Trading volume

#### Example Request
```
GET /api/v1/index/NIFTY 50/historical-data
```

#### Example Response
```json
[
  {
    "indexName": "NIFTY 50",
    "date": "2024-01-01",
    "open": 100.0,
    "high": 105.0,
    "low": 98.0,
    "close": 103.0,
    "volume": 1000000.0
  },
  {
    "indexName": "NIFTY 50",
    "date": "2024-01-02",
    "open": 103.0,
    "high": 108.0,
    "low": 102.0,
    "close": 106.0,
    "volume": 1200000.0
  }
]
```

## Implementation Details

### Backend Components

1. **DTO**: `IndexHistoricalDataDto` - Data transfer object for historical data
2. **Service**: `IndexService.getIndexHistoricalData()` - Business logic with Trino query
3. **Controller**: `IndexController.getIndexHistoricalData()` - REST endpoint
4. **Circuit Breaker**: Includes fallback method for resilience

### Frontend Components

1. **Entity**: `IndexHistoricalData` - TypeScript interface
2. **Service**: `IndicesService.getIndexHistoricalData()` - API service method

### Database Query

The endpoint uses a Trino query to fetch data from the `nse_indices_historical_data` table:

```sql
SELECT 
    index_name,
    date,
    open,
    high,
    low,
    close,
    volume
FROM nse_indices_historical_data 
WHERE index_name = ? 
ORDER BY date DESC
```

## Error Handling

- Returns 404 if the index is not found
- Returns 500 for internal server errors
- Includes circuit breaker fallback for service resilience

## Security

- Requires authentication (JWT token)
- Validates index existence before querying historical data 