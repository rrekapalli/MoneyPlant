# Criteria Builder API Documentation

## Overview

The Criteria Builder API extends the existing MoneyPlant screener functionality to support dynamic query building through a Domain Specific Language (DSL). This API allows users to create complex filtering conditions using a visual interface while maintaining security and performance.

## Table of Contents

1. [Authentication](#authentication)
2. [Core Concepts](#core-concepts)
3. [API Endpoints](#api-endpoints)
4. [DSL Structure](#dsl-structure)
5. [Examples](#examples)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

## Authentication

All criteria builder endpoints require JWT authentication using the existing screener security infrastructure:

```http
Authorization: Bearer <jwt-token>
```

## Core Concepts

### Criteria DSL

The Criteria DSL is a JSON-based language for expressing complex database queries. It consists of:

- **Groups**: Logical containers with AND/OR/NOT operators
- **Conditions**: Individual comparisons between expressions
- **Expressions**: Field references, function calls, or literal values

### Field Metadata

Fields represent database columns available for filtering. Each field has:
- Data type (number, string, date, etc.)
- Allowed operators
- Validation rules
- Category for organization

### Function Definitions

Functions enable advanced calculations and technical analysis:
- SQL templates for secure execution
- Parameter definitions with validation
- Return type information
- Category organization

## API Endpoints

### Field Management

#### Get Available Fields

```http
GET /api/screeners/fields
```

Returns field metadata available for the current user based on role permissions.

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

#### Get Field Operators

```http
GET /api/screeners/fields/{fieldId}/operators
```

Returns operators compatible with a specific field type.

**Response:**
```json
[
  {
    "operator": ">=",
    "label": "Greater than or equal to",
    "description": "Checks if left value is greater than or equal to right value",
    "compatibleTypes": ["number", "integer", "date"],
    "requiresRightSide": true
  }
]
```

#### Get Field Value Suggestions

```http
GET /api/screeners/fields/{fieldId}/suggestions?query={text}
```

Returns value suggestions for enum fields or fields with suggestion APIs.

**Response:**
```json
[
  {
    "value": "Technology",
    "label": "Technology Sector",
    "description": "Companies in technology industry",
    "category": "Sectors"
  }
]
```

### Function Management

#### Get Available Functions

```http
GET /api/screeners/functions
```

Returns function definitions available for the current user.

**Response:**
```json
[
  {
    "id": "sma",
    "label": "Simple Moving Average",
    "returnType": "NUMBER",
    "category": "Technical Analysis",
    "description": "Calculates simple moving average over specified periods",
    "examples": ["SMA(close, 20)", "SMA(volume, 10)"],
    "parameters": [
      {
        "name": "field",
        "type": "FIELD",
        "required": true,
        "description": "Field to calculate moving average for"
      },
      {
        "name": "period",
        "type": "INTEGER",
        "required": true,
        "description": "Number of periods for moving average",
        "validationRules": {
          "min": 1,
          "max": 200
        }
      }
    ]
  }
]
```

#### Get Function Signature

```http
GET /api/screeners/functions/{functionId}/signature
```

Returns detailed parameter information for function dialog display.

### Criteria Validation

#### Validate Criteria DSL

```http
POST /api/screeners/validate-criteria
```

Validates complete criteria DSL structure and semantics.

**Request:**
```json
{
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
}
```

**Response:**
```json
{
  "valid": true,
  "errors": [],
  "warnings": [],
  "validatedAt": "2024-01-15T10:30:00Z",
  "validatedBy": "12345"
}
```

#### Validate Partial Criteria

```http
POST /api/screeners/validate-partial-criteria
```

Validates incomplete criteria DSL for real-time feedback.

#### Preview Criteria

```http
POST /api/screeners/preview-criteria
```

Returns human-readable description and estimated result count.

**Response:**
```json
{
  "description": "Market Capitalization >= $1.0B",
  "estimatedResults": 1250,
  "complexity": "LOW",
  "executionTimeEstimate": "< 1 second"
}
```

### SQL Generation

#### Generate SQL from DSL

```http
POST /api/screeners/generate-sql
```

Generates parameterized SQL from validated criteria DSL.

**Request:**
```json
{
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
}
```

**Response:**
```json
{
  "sql": "market_cap >= :p1",
  "parameters": {
    "p1": 1000000000
  },
  "generatedAt": "2024-01-15T10:30:00Z",
  "generatedBy": "12345",
  "estimatedComplexity": 1
}
```

### Screener Integration

#### Create Screener Version with Criteria

```http
POST /api/screeners/{id}/versions
```

Creates a screener version with criteria DSL validation and SQL generation.

**Request:**
```json
{
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
}
```

#### Execute Screener Run with Criteria

```http
POST /api/screeners/{id}/runs
```

Executes a screener run with criteria DSL re-validation and monitoring.

## DSL Structure

### Complete DSL Example

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
      },
      {
        "operator": "OR",
        "children": [
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
          },
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
              "type": "field",
              "fieldId": "close_price"
            }
          }
        ]
      }
    ]
  }
}
```

### Expression Types

#### Field Reference
```json
{
  "type": "field",
  "fieldId": "market_cap"
}
```

#### Function Call
```json
{
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
}
```

#### Literal Value
```json
{
  "type": "literal",
  "value": 1000000000,
  "dataType": "number"
}
```

## Examples

### Simple Market Cap Filter

Filter stocks with market capitalization greater than $1 billion:

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

### Complex Multi-Condition Filter

Technology stocks with market cap > $1B OR P/E ratio < 20:

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
      },
      {
        "operator": "OR",
        "children": [
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
          },
          {
            "left": {
              "type": "field",
              "fieldId": "pe_ratio"
            },
            "operator": "<",
            "right": {
              "type": "literal",
              "value": 20,
              "dataType": "number"
            }
          }
        ]
      }
    ]
  }
}
```

### Technical Analysis with Functions

Stocks where 20-day SMA > 50-day SMA (golden cross):

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

## Error Handling

### Validation Errors

When criteria validation fails, the API returns detailed error information:

```json
{
  "valid": false,
  "errors": [
    {
      "code": "INVALID_FIELD_REFERENCE",
      "message": "Field 'invalid_field' does not exist or is not accessible",
      "path": "$.root.children[0].left.fieldId"
    },
    {
      "code": "OPERATOR_TYPE_MISMATCH",
      "message": "Operator '>=' is not compatible with field type 'string'",
      "path": "$.root.children[1].operator"
    }
  ],
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

### Common Error Codes

- `INVALID_FIELD_REFERENCE`: Field does not exist or is not accessible
- `INVALID_FUNCTION_REFERENCE`: Function does not exist or is not accessible
- `OPERATOR_TYPE_MISMATCH`: Operator not compatible with field type
- `INVALID_PARAMETER_COUNT`: Wrong number of function parameters
- `INVALID_PARAMETER_TYPE`: Parameter type doesn't match function definition
- `MAX_DEPTH_EXCEEDED`: Too many nested groups
- `MAX_CONDITIONS_EXCEEDED`: Too many conditions in criteria
- `CIRCULAR_REFERENCE`: Circular reference detected in function calls

### HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request data or validation failed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied to field or function
- `404 Not Found`: Resource not found
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

## Best Practices

### Performance Optimization

1. **Limit Nesting Depth**: Keep group nesting to 3 levels or less
2. **Use Indexes**: Filter on indexed fields when possible
3. **Avoid Complex Functions**: Use simple functions for better performance
4. **Cache Results**: Leverage caching for repeated queries

### Security Considerations

1. **Field Access Control**: Only use fields accessible to your role
2. **Function Whitelisting**: Only approved functions are available
3. **Parameter Validation**: All parameters are validated server-side
4. **SQL Injection Prevention**: All queries use parameterized SQL

### DSL Design Guidelines

1. **Start Simple**: Begin with basic conditions and add complexity gradually
2. **Use Meaningful Names**: Choose descriptive field and function names
3. **Group Related Conditions**: Use logical grouping for readability
4. **Test Incrementally**: Validate criteria as you build them

### Error Handling

1. **Check Validation Results**: Always validate criteria before execution
2. **Handle Partial Validation**: Use partial validation for real-time feedback
3. **Provide User Feedback**: Show clear error messages to users
4. **Implement Retry Logic**: Handle transient errors gracefully

## Integration with Existing Screener Workflows

The Criteria Builder API seamlessly integrates with existing screener functionality:

1. **Screener Versions**: Criteria DSL is stored in `ScreenerVersion.dsl_json`
2. **SQL Generation**: Generated SQL is stored in `ScreenerVersion.compiled_sql`
3. **Execution**: Uses existing screener run infrastructure
4. **Results**: Leverages existing result storage and pagination
5. **Security**: Integrates with existing JWT authentication and authorization
6. **Monitoring**: Uses existing performance monitoring and alerting

## Troubleshooting

### Common Issues

1. **Field Not Found**: Check field permissions and spelling
2. **Function Not Available**: Verify function is active and accessible
3. **Validation Errors**: Review DSL structure and data types
4. **Performance Issues**: Simplify criteria or add indexes
5. **Authentication Errors**: Verify JWT token is valid and not expired

### Debug Information

Enable debug logging to get detailed information about:
- Field and function resolution
- Validation process details
- SQL generation steps
- Parameter binding
- Execution metrics

### Support

For additional support:
1. Check the API documentation at `/swagger-ui.html`
2. Review server logs for detailed error information
3. Use the validation endpoints to debug DSL issues
4. Contact the development team for complex scenarios