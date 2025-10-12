# Screener API Documentation

This document provides comprehensive documentation for the Screener API endpoints, including the advanced Criteria Builder functionality, sample cURL commands and usage examples.

## Overview

The Screener API provides a complete CRUD interface for managing stock screeners, including:
- Screener management (create, read, update, delete)
- Version control for screeners
- Parameter sets for different screening configurations
- Execution runs and results
- User interactions (stars, saved views)
- **Criteria Builder**: Advanced DSL-based query building with visual interface support

## Criteria Builder Integration

The Criteria Builder extends the existing screener functionality with:
- **Dynamic Field Management**: Database fields with role-based access control
- **Function Library**: Technical analysis functions stored in database tables
- **DSL Validation**: Real-time validation of criteria expressions
- **SQL Generation**: Secure parameterized SQL from criteria DSL
- **Visual Interface Support**: Endpoints for dropdowns, suggestions, and real-time feedback

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

### Criteria Builder Endpoints

#### Get Available Fields
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/fields
```

**Response:**
```json
[
  {
    "id": "market_cap",
    "label": "Market Capitalization",
    "dbColumn": "market_cap",
    "dataType": "CURRENCY",
    "allowedOps": ["=", "!=", "<", "<=", ">", ">="],
    "category": "Financial",
    "description": "Total market value of company shares",
    "example": "1.5B"
  }
]
```

#### Get Available Functions
```bash
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/functions
```

#### Validate Criteria DSL
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "dsl": {
         "version": "1.0",
         "root": {
           "operator": "AND",
           "children": [
             {
               "left": {
                 "type": "field",
                 "fieldId": "market_cap"
               },
               "operator": ">=",
               "right": {
                 "type": "literal",
                 "value": 1000000000,
                 "dataType": "number"
               }
             }
           ]
         }
       }
     }' \
     POST http://localhost:8080/api/screeners/validate-criteria
```

#### Generate SQL from DSL
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "dsl": {
         "version": "1.0",
         "root": {
           "operator": "AND",
           "children": [
             {
               "left": {
                 "type": "field",
                 "fieldId": "market_cap"
               },
               "operator": ">=",
               "right": {
                 "type": "literal",
                 "value": 1000000000,
                 "dataType": "number"
               }
             }
           ]
         }
       }
     }' \
     POST http://localhost:8080/api/screeners/generate-sql
```

**Response:**
```json
{
  "sql": "market_cap >= :p1",
  "parameters": {
    "p1": 1000000000
  },
  "generatedAt": "2024-01-15T10:30:00Z",
  "generatedBy": "12345"
}
```

#### Visual Interface Support Endpoints

```bash
# Get field-specific operators
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/fields/market_cap/operators

# Get value suggestions for a field
curl -H "Authorization: Bearer <JWT>" \
     "GET http://localhost:8080/api/screeners/fields/sector/suggestions?query=tech"

# Validate partial criteria for real-time feedback
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{"partialDsl": {"operator": "AND", "children": []}}' \
     POST http://localhost:8080/api/screeners/validate-partial-criteria

# Get function signature for dialog display
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/functions/sma/signature

# Preview criteria with human-readable description
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{"dsl": {...}}' \
     POST http://localhost:8080/api/screeners/preview-criteria

# Get all available operators
curl -H "Authorization: Bearer <JWT>" \
     GET http://localhost:8080/api/screeners/operators
```

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

#### Create Version with Criteria DSL
```bash
curl -H "Authorization: Bearer <JWT>" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Large Cap Tech Stocks",
       "description": "Technology stocks with market cap > $1B",
       "dslJson": {
         "version": "1.0",
         "root": {
           "operator": "AND",
           "children": [
             {
               "left": {
                 "type": "field",
                 "fieldId": "market_cap"
               },
               "operator": ">=",
               "right": {
                 "type": "literal",
                 "value": 1000000000,
                 "dataType": "number"
               }
             },
             {
               "left": {
                 "type": "field",
                 "fieldId": "sector"
               },
               "operator": "=",
               "right": {
                 "type": "literal",
                 "value": "Technology",
                 "dataType": "string"
               }
             }
           ]
         }
       }
     }' \
     POST http://localhost:8080/api/screeners/{screenerId}/versions
```

#### Create Version (Legacy SQL)
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

#### Create Run with Criteria Validation
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

**Note**: When executing runs for screener versions with criteria DSL, the system automatically:
- Re-validates the criteria DSL server-side
- Applies enhanced monitoring and performance tracking
- Uses existing screener execution infrastructure with criteria-specific optimizations

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

## Criteria DSL Structure

### Basic DSL Example

```json
{
  "version": "1.0",
  "root": {
    "operator": "AND",
    "children": [
      {
        "left": {
          "type": "field",
          "fieldId": "market_cap"
        },
        "operator": ">=",
        "right": {
          "type": "literal",
          "value": 1000000000,
          "dataType": "number"
        }
      }
    ]
  }
}
```

### Complex DSL with Functions

```json
{
  "version": "1.0",
  "root": {
    "operator": "AND",
    "children": [
      {
        "left": {
          "type": "function",
          "functionId": "sma",
          "args": [
            {
              "type": "field",
              "fieldId": "close_price"
            },
            {
              "type": "literal",
              "value": 20,
              "dataType": "integer"
            }
          ]
        },
        "operator": ">",
        "right": {
          "type": "function",
          "functionId": "sma",
          "args": [
            {
              "type": "field",
              "fieldId": "close_price"
            },
            {
              "type": "literal",
              "value": 50,
              "dataType": "integer"
            }
          ]
        }
      }
    ]
  }
}
```

### Expression Types

1. **Field Reference**: `{"type": "field", "fieldId": "market_cap"}`
2. **Function Call**: `{"type": "function", "functionId": "sma", "args": [...]}`
3. **Literal Value**: `{"type": "literal", "value": 1000000000, "dataType": "number"}`

### Supported Operators

- Comparison: `=`, `!=`, `<`, `<=`, `>`, `>=`
- Text: `LIKE`, `NOT_LIKE`
- Set: `IN`, `NOT_IN`
- Range: `BETWEEN`, `NOT_BETWEEN`
- Null: `IS_NULL`, `IS_NOT_NULL`

### Validation Rules

- Maximum nesting depth: 5 levels
- Maximum conditions per criteria: 100
- Field references must exist and be accessible to user
- Function calls must use active functions with correct parameters
- Operators must be compatible with field/function return types

## Integration with Existing Screener Workflows

The Criteria Builder seamlessly integrates with existing screener functionality:

1. **Storage**: Criteria DSL is stored in `ScreenerVersion.dsl_json` field
2. **SQL Generation**: Generated SQL is stored in `ScreenerVersion.compiled_sql` field
3. **Execution**: Uses existing screener run infrastructure with enhanced monitoring
4. **Results**: Leverages existing result storage, pagination, and filtering
5. **Security**: Integrates with existing JWT authentication and role-based access
6. **Performance**: Uses existing caching, connection pooling, and optimization

## Database Schema

The screener API uses the following main tables:

### Existing Tables
- `screener` - Main screener definitions
- `screener_version` - Version control for screeners (extended with `dsl_json` field)
- `screener_paramset` - Parameter sets for versions
- `screener_run` - Execution runs
- `screener_result` - Results from runs
- `screener_star` - User stars/favorites
- `screener_saved_view` - User saved views

### New Criteria Builder Tables
- `field_metadata` - Available fields with metadata and access control
- `screener_functions` - Function definitions with SQL templates
- `screener_function_params` - Function parameter definitions and validation rules

## Troubleshooting

### Common Criteria Builder Issues

#### Field Not Found Error
```json
{
  "valid": false,
  "errors": [
    {
      "code": "INVALID_FIELD_REFERENCE",
      "message": "Field 'invalid_field' does not exist or is not accessible",
      "path": "$.root.children[0].left.fieldId"
    }
  ]
}
```

**Solution**: Check field permissions and verify field ID spelling. Use `GET /api/screeners/fields` to see available fields.

#### Function Not Available Error
```json
{
  "valid": false,
  "errors": [
    {
      "code": "INVALID_FUNCTION_REFERENCE",
      "message": "Function 'invalid_function' does not exist or is not active",
      "path": "$.root.children[0].left.functionId"
    }
  ]
}
```

**Solution**: Verify function is active and accessible. Use `GET /api/screeners/functions` to see available functions.

#### Operator Type Mismatch
```json
{
  "valid": false,
  "errors": [
    {
      "code": "OPERATOR_TYPE_MISMATCH",
      "message": "Operator '>=' is not compatible with field type 'string'",
      "path": "$.root.children[0].operator"
    }
  ]
}
```

**Solution**: Use compatible operators for field types. Use `GET /api/screeners/fields/{fieldId}/operators` to see compatible operators.

#### Performance Warnings
```json
{
  "valid": true,
  "warnings": [
    {
      "code": "PERFORMANCE_CONCERN",
      "message": "Complex nested conditions may impact performance",
      "path": "$.root.children[2]",
      "suggestion": "Consider simplifying the condition structure"
    }
  ]
}
```

**Solution**: Simplify criteria structure, reduce nesting depth, or add database indexes for better performance.

### Debug Information

Enable debug logging by setting:
```properties
logging.level.com.moneyplant.screener.services.CriteriaValidationService=DEBUG
logging.level.com.moneyplant.screener.services.CriteriaSqlService=DEBUG
```

This provides detailed information about:
- Field and function resolution process
- Validation step-by-step details
- SQL generation process
- Parameter binding details
- Performance metrics

### Best Practices

1. **Start Simple**: Begin with basic conditions and add complexity gradually
2. **Validate Incrementally**: Use partial validation during criteria building
3. **Check Field Access**: Verify field permissions before building criteria
4. **Test Performance**: Monitor execution times for complex criteria
5. **Use Caching**: Leverage field and function metadata caching
6. **Handle Errors Gracefully**: Provide clear error messages to users

## Notes

- All timestamps are in ISO 8601 format with timezone information
- Pagination is 0-based (first page is 0)
- Default page size is 25, maximum is 200
- All endpoints require authentication except for public screener access
- The API enforces ownership at the service layer
- Rate limiting may be applied to run endpoints in production
- Criteria DSL validation is performed server-side for security
- Generated SQL uses parameterized queries to prevent SQL injection
- Field and function metadata is cached for performance
