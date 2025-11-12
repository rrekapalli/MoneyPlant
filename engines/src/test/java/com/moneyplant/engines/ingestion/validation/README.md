# Python Implementation Validation Tests

This directory contains validation tests that compare the Java ingestion engine implementation with the existing Python implementation.

## Purpose

These tests ensure that the Java ingestion engine produces identical or equivalent results to the Python implementation for:
- Data completeness (same number of records)
- Data accuracy (same OHLCV values)
- Data quality (valid price relationships, volumes)
- Date continuity (no unexpected gaps)

## Prerequisites

### 1. Python Implementation Data
The Python implementation must have already ingested data for the test date range:
- Default test range: January 1-31, 2024
- Test symbols: RELIANCE, TCS, INFY, HDFC, ICICI

### 2. Database Access
Tests require access to the production or staging database containing Python-ingested data:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://your-db-host:5432/moneyplant
    username: your-username
    password: your-password
```

### 3. Environment Variable
Set the environment variable to enable these tests:
```bash
export PYTHON_VALIDATION_ENABLED=true
```

## Running Validation Tests

### Enable and Run All Validation Tests
```bash
cd engines
export PYTHON_VALIDATION_ENABLED=true
mvn test -Dtest=PythonImplementationValidationTest
```

### Run Specific Validation Test
```bash
export PYTHON_VALIDATION_ENABLED=true
mvn test -Dtest=PythonImplementationValidationTest#testDataCompletenessComparison
```

### Run Without Validation Tests (Default)
```bash
# Validation tests are skipped by default
mvn test
```

## Test Cases

### 1. Data Completeness Comparison
**Purpose**: Verify that the same number of data points exist for a given date range

**Test**: `testDataCompletenessComparison()`

**Validation**:
- Query OHLCV data for RELIANCE from Jan 1-31, 2024
- Verify at least 15 trading days of data exist
- Expected: ~21-22 trading days in January

### 2. Data Accuracy Comparison
**Purpose**: Verify that OHLCV values are valid and follow market rules

**Test**: `testDataAccuracyComparison()`

**Validation**:
- Query specific date (Jan 15, 2024)
- Verify all OHLCV fields are present
- Verify OHLC relationships (High >= Open, Low <= Close, etc.)
- Verify volume is positive

### 3. Multiple Symbols Comparison
**Purpose**: Verify data exists for all major symbols

**Test**: `testMultipleSymbolsComparison()`

**Validation**:
- Query data for RELIANCE, TCS, INFY, HDFC, ICICI
- Verify each symbol has data points
- Verify data quality for each symbol

### 4. Date Range Continuity
**Purpose**: Verify no unexpected gaps in data

**Test**: `testDateRangeContinuity()`

**Validation**:
- Query data for date range
- Sort by timestamp
- Verify gaps don't exceed 5 days (accounting for weekends/holidays)

### 5. Volume Consistency
**Purpose**: Verify volume data is consistent and realistic

**Test**: `testVolumeConsistency()`

**Validation**:
- Calculate average daily volume
- Verify no zero volumes
- Verify volumes within 10x of average (detect anomalies)

### 6. Price Consistency
**Purpose**: Verify price movements follow circuit breaker rules

**Test**: `testPriceConsistency()`

**Validation**:
- Compare consecutive day prices
- Verify daily price change doesn't exceed 25%
- Detect potential data quality issues

### 7. Backfill Gap Detection
**Purpose**: Verify gap detection logic works correctly

**Test**: `testBackfillGapDetection()`

**Validation**:
- Query date range for potential gaps
- Verify gap detection service identifies missing dates
- Expected: No gaps if Python ingestion is complete

### 8. Data Format Consistency
**Purpose**: Verify data format matches expected schema

**Test**: `testDataFormatConsistency()`

**Validation**:
- Verify symbol format (uppercase alphanumeric)
- Verify price precision (max 4 decimal places)
- Verify timeframe is set
- Verify timestamp is present

## Expected Results

### Successful Validation
```
Python implementation data points: 22
Python data validation passed for 2024-01-15
OHLCV: 2450.00, 2460.00, 2445.00, 2455.00, 5000000
RELIANCE: 22 data points
TCS: 22 data points
INFY: 22 data points
HDFC: 22 data points
ICICI: 22 data points
Date continuity validation passed
Average daily volume: 4500000
Price consistency validation passed
Data format consistency validation passed
```

### Failed Validation Examples

**Missing Data**:
```
Expected: at least 15 data points
Actual: 0
```
**Solution**: Run Python ingestion for the test date range

**Data Quality Issue**:
```
Expected: High >= Low
Actual: High (2450.00) < Low (2460.00)
```
**Solution**: Investigate data source or ingestion logic

**Circuit Breaker Violation**:
```
Expected: Daily change < 25%
Actual: 35% change detected
```
**Solution**: Check for corporate actions or data errors

## Troubleshooting

### Tests Are Skipped
```
Tests run: 0, Skipped: 8
```
**Solution**: Set environment variable:
```bash
export PYTHON_VALIDATION_ENABLED=true
```

### No Data Found
```
Expected: at least 15 data points
Actual: 0
```
**Solution**: 
1. Verify Python implementation has run for test date range
2. Check database connection
3. Verify table name: `nse_eq_ohlcv_historic`

### Connection Refused
```
Error: Connection refused to localhost:5432
```
**Solution**: Update `application-test.yml` with correct database URL

### Authentication Failed
```
Error: password authentication failed
```
**Solution**: Update database credentials in configuration

## Customizing Test Parameters

### Change Test Date Range
Edit `PythonImplementationValidationTest.java`:
```java
private static final LocalDate TEST_START_DATE = LocalDate.of(2024, 2, 1);
private static final LocalDate TEST_END_DATE = LocalDate.of(2024, 2, 29);
```

### Change Test Symbol
```java
private static final String TEST_SYMBOL = "TCS";
```

### Add More Symbols
```java
List<String> testSymbols = List.of("RELIANCE", "TCS", "INFY", "HDFC", "ICICI", "SBIN", "WIPRO");
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Python Validation Tests

on:
  schedule:
    - cron: '0 0 * * 0'  # Weekly on Sunday

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up JDK 21
        uses: actions/setup-java@v3
        with:
          java-version: '21'
      - name: Run Validation Tests
        env:
          PYTHON_VALIDATION_ENABLED: true
          DB_URL: ${{ secrets.DB_URL }}
          DB_USERNAME: ${{ secrets.DB_USERNAME }}
          DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
        run: |
          cd engines
          mvn test -Dtest=PythonImplementationValidationTest \
            -Dspring.datasource.url=$DB_URL \
            -Dspring.datasource.username=$DB_USERNAME \
            -Dspring.datasource.password=$DB_PASSWORD
```

## Validation Checklist

Before considering Java implementation production-ready:

- [ ] Data completeness matches Python (±5%)
- [ ] All OHLCV relationships are valid
- [ ] No circuit breaker violations detected
- [ ] Volume data is consistent
- [ ] Date continuity is maintained
- [ ] All major symbols have data
- [ ] Data format is consistent
- [ ] Gap detection works correctly

## Reporting Issues

If validation tests fail:

1. **Document the failure**:
   - Test name
   - Expected vs actual values
   - Date range and symbols affected

2. **Investigate root cause**:
   - Python implementation issue?
   - Java implementation issue?
   - Data source issue?

3. **Create issue with**:
   - Test output
   - Database query results
   - Comparison screenshots

## Future Enhancements

- [ ] Add automated backtest comparison
- [ ] Add performance comparison (latency, throughput)
- [ ] Add data drift detection over time
- [ ] Add statistical analysis of differences
- [ ] Add automated remediation suggestions
