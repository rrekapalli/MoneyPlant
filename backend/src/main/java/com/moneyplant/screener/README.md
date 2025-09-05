# Screener API Documentation

This document provides comprehensive documentation for the Screener API endpoints, including sample cURL commands and usage examples.

## Overview

The Screener API provides a complete CRUD interface for managing stock screeners, including:
- Screener management (create, read, update, delete)
- Version control for screeners
- Parameter sets for different screening configurations
- Execution runs and results
- User interactions (stars, saved views)

## Base URL

```
http://localhost:8080/api
```

## Authentication

All endpoints require JWT authentication. Include the JWT token in the Authorization header:

```bash
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### Screeners

#### Create Screener
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Value+Momentum Screener",
       "description": "P/E<15, RSI<30",
       "isPublic": false,
       "defaultUniverse": "NSE_500"
     }' \
     POST http://localhost:8080/api/screeners
```

#### Get Screener
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/{screenerId}
```

#### Update Screener
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated Screener Name",
       "description": "Updated description",
       "isPublic": true
     }' \
     PATCH http://localhost:8080/api/screeners/{screenerId}
```

#### Delete Screener
```bash
curl -H "Authorization: Bearer <JWT>" \
     DELETE http://localhost:8080/api/screeners/{screenerId}
```

#### List Screeners
```bash
# List all screeners (mine + public)
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/screeners?page=0&size=25&sort=createdAt,desc&q=value"

# List my screeners only
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/my

# List public screeners only
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/public
```

### Screener Versions

#### Create Version
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "versionNumber": 1,
       "engine": "sql",
       "compiledSql": "(rsi_14 < :rsi_max AND pe_ratio < :pe_max AND sma_50 > sma_200)",
       "paramsSchemaJson": {
         "rsi_max": {"type": "int", "default": 30},
         "pe_max": {"type": "decimal", "default": 15}
       }
     }' \
     POST http://localhost:8080/api/screeners/{screenerId}/versions
```

#### List Versions
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/{screenerId}/versions
```

#### Get Version
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/versions/{versionId}
```

#### Update Version
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "status": "active",
       "compiledSql": "updated SQL query"
     }' \
     PATCH http://localhost:8080/api/versions/{versionId}
```

### Parameter Sets

#### Create Parameter Set
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Conservative",
       "paramsJson": {
         "rsi_max": 35,
         "pe_max": 12
       }
     }' \
     POST http://localhost:8080/api/versions/{versionId}/paramsets
```

#### List Parameter Sets
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/versions/{versionId}/paramsets
```

#### Delete Parameter Set
```bash
curl -H "Authorization: Bearer <JWT>" \
     DELETE http://localhost:8080/api/paramsets/{paramsetId}
```

### Screener Runs

#### Create Run
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "screenerVersionId": 1,
       "paramsetId": 1,
       "runForTradingDay": "2025-01-15",
       "universeSymbolIds": [1, 2, 3, 4, 5]
     }' \
     POST http://localhost:8080/api/screeners/{screenerId}/runs
```

#### List Runs
```bash
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/screeners/{screenerId}/runs?page=0&size=25"
```

#### Get Run
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/runs/{runId}
```

#### Retry Run
```bash
curl -H "Authorization: Bearer <JWT>" \
     POST http://localhost:8080/api/runs/{runId}/retry
```

### Screener Results

#### Get Results (Paged)
```bash
# Get all results
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/runs/{runId}/results?page=0&size=50&sort=rank"

# Get only matched results
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/runs/{runId}/results?matched=true&page=0&size=50"

# Get results with minimum score
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/runs/{runId}/results?minScore=0.7&page=0&size=50"

# Get results sorted by score
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/runs/{runId}/results?sort=score,desc&page=0&size=50"
```

#### Get All Results
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/runs/{runId}/results/all
```

#### Get Matched Results
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/runs/{runId}/results/matched
```

#### Get Top Results
```bash
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/runs/{runId}/results/top?limit=20"
```

#### Get Result Diffs
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/runs/{runId}/diffs
```

#### Get Result Statistics
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/runs/{runId}/stats
```

### Stars

#### Toggle Star
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{"starred": true}' \
     PUT http://localhost:8080/api/screeners/{screenerId}/star
```

#### Check Star Status
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/{screenerId}/star
```

#### Get Starred Screeners
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/my/starred
```

### Saved Views

#### Create Saved View
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "My Custom View",
       "tablePrefs": {
         "columns": ["symbol", "score", "rank"],
         "sortBy": "score",
         "sortOrder": "desc"
       }
     }' \
     POST http://localhost:8080/api/screeners/{screenerId}/saved-views
```

#### List Saved Views
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/{screenerId}/saved-views
```

#### Update Saved View
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Updated View Name",
       "tablePrefs": {"updated": "preferences"}
     }' \
     PATCH http://localhost:8080/api/saved-views/{savedViewId}
```

#### Delete Saved View
```bash
curl -H "Authorization: Bearer <JWT>" \
     DELETE http://localhost:8080/api/saved-views/{savedViewId}
```

## Response Formats

### Success Response
```json
{
  "screenerId": 1,
  "ownerUserId": 123,
  "name": "Value Screener",
  "description": "P/E < 15",
  "isPublic": false,
  "defaultUniverse": "NSE_500",
  "createdAt": "2025-01-15T10:30:00Z",
  "updatedAt": "2025-01-15T10:30:00Z"
}
```

### Paginated Response
```json
{
  "content": [...],
  "page": 0,
  "size": 25,
  "totalElements": 100,
  "totalPages": 4,
  "sort": "createdAt,desc"
}
```

### Error Response (RFC-7807 Problem+JSON)
```json
{
  "type": "https://api.moneyplant.com/problems/validation-error",
  "title": "Validation Error",
  "status": 400,
  "detail": "Validation failed",
  "timestamp": "2025-01-15T10:30:00Z",
  "path": "/api/screeners",
  "fieldErrors": {
    "name": "Screener name is required"
  }
}
```

## Swagger Documentation

Interactive API documentation is available at:
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## Testing

Run the integration tests:
```bash
mvn test -Dtest=ScreenerIntegrationTest
```

## Database Schema

The screener API uses the following main tables:
- `screener` - Main screener definitions
- `screener_version` - Version control for screeners
- `screener_paramset` - Parameter sets for versions
- `screener_run` - Execution runs
- `screener_result` - Results from runs
- `screener_star` - User stars/favorites
- `screener_saved_view` - User saved views

## Notes

- All timestamps are in ISO 8601 format with timezone information
- Pagination is 0-based (first page is 0)
- Default page size is 25, maximum is 200
- All endpoints require authentication except for public screener access
- The API enforces ownership at the service layer
- Rate limiting may be applied to run endpoints in production
