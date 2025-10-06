# Criteria Builder Deployment Guide

This document provides instructions for deploying the Criteria Builder functionality as part of the existing MoneyPlant screener package.

## Overview

The Criteria Builder extends the existing screener package with:
- Field metadata management
- Function definition management  
- Criteria DSL validation
- SQL generation from criteria
- Visual interface support endpoints

## Prerequisites

1. **Java 21** - Required for Spring Boot 3.2.0
2. **Maven 3.6+** - For building the application
3. **PostgreSQL 12+** - Database with existing MoneyPlant schema
4. **Existing MoneyPlant Backend** - The criteria builder extends the existing screener package

## Deployment Steps

### 1. Database Migration

The criteria builder requires three new database tables:
- `field_metadata` - Stores available fields for criteria building
- `screener_functions` - Stores function definitions
- `screener_function_params` - Stores function parameter definitions

#### Option A: Automatic Migration (Recommended)
Run the deployment script:

**Windows:**
```cmd
scripts\deploy-criteria-builder.bat
```

**Linux/Mac:**
```bash
chmod +x scripts/deploy-criteria-builder.sh
./scripts/deploy-criteria-builder.sh
```

#### Option B: Manual Migration
Execute the migration scripts in order:

```sql
-- 1. Create tables and indexes
\i backend/src/main/resources/db/migration/V001__create_criteria_metadata_tables.sql

-- 2. Insert default field metadata
\i backend/src/main/resources/db/migration/V002__insert_default_field_metadata.sql

-- 3. Insert default function definitions
\i backend/src/main/resources/db/migration/V003__insert_default_screener_functions.sql
```

### 2. Configuration

The criteria builder uses the following configuration files:

#### Main Configuration
- `backend/src/main/resources/application.properties` - Extended with criteria settings
- `backend/src/main/resources/criteria-builder.properties` - Criteria-specific configuration

#### Security Configuration  
- `backend/src/main/resources/screener-security.properties` - Existing screener security (no changes needed)

#### Key Configuration Properties

```properties
# Validation limits
criteria.validation.max-group-depth=5
criteria.validation.max-conditions=50

# SQL generation security
criteria.sql.enable-parameter-binding=true
criteria.sql.enable-sql-injection-protection=true

# Caching configuration
criteria.cache.enabled=true
criteria.cache.field-metadata.ttl=3600

# Performance limits
criteria.performance.query-timeout-seconds=30
criteria.performance.max-result-size=10000
```

### 3. Build and Package

Build the application with criteria builder dependencies:

```bash
cd backend
mvn clean package -DskipTests
```

The criteria builder dependencies are already included in `pom.xml`:
- Spring Boot Cache (Caffeine)
- Apache Commons Lang3
- Apache Commons Collections4
- Hibernate Validator

### 4. Deployment

The criteria builder deploys as part of the existing screener package:

1. **No separate deployment** - Extends existing screener controllers and services
2. **Uses existing infrastructure** - Authentication, error handling, monitoring
3. **Backward compatible** - Existing screener functionality unchanged

### 5. Verification

After deployment, verify the criteria builder is working:

#### Health Check
```bash
curl http://localhost:8080/actuator/health
```

#### API Endpoints
Test the new criteria endpoints:

```bash
# Get available fields
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/screeners/fields

# Get available functions  
curl -H "Authorization: Bearer <token>" http://localhost:8080/api/screeners/functions

# Validate criteria DSL
curl -X POST -H "Content-Type: application/json" -H "Authorization: Bearer <token>" \
  -d '{"dsl": {"root": {"operator": "AND", "children": []}}}' \
  http://localhost:8080/api/screeners/validate-criteria
```

#### Database Verification
Check that tables were created and populated:

```sql
-- Check table creation
SELECT table_name FROM information_schema.tables 
WHERE table_name IN ('field_metadata', 'screener_functions', 'screener_function_params');

-- Check data population
SELECT COUNT(*) FROM field_metadata;
SELECT COUNT(*) FROM screener_functions;
SELECT COUNT(*) FROM screener_function_params;
```

## Integration with Existing CI/CD

The criteria builder integrates with existing deployment processes:

### Maven Build
- Dependencies added to existing `pom.xml`
- No separate build process required
- Uses existing Spring Boot packaging

### Database Migrations
- Migration scripts in `backend/src/main/resources/db/migration/`
- Compatible with Flyway or Liquibase if used
- Can be run manually or via deployment scripts

### Configuration Management
- Extends existing `application.properties`
- Additional `criteria-builder.properties` for specific settings
- Environment-specific overrides supported

### Monitoring and Logging
- Uses existing Spring Boot Actuator endpoints
- Integrates with existing logging configuration
- Extends existing metrics collection

## Troubleshooting

### Common Issues

1. **Database Connection Errors**
   - Verify database credentials in `application.properties`
   - Check database server is running and accessible
   - Ensure PostgreSQL driver is available

2. **Migration Failures**
   - Check database user has CREATE TABLE permissions
   - Verify no conflicting table names exist
   - Review migration logs for specific errors

3. **Build Failures**
   - Ensure Java 21 is installed and configured
   - Check Maven dependencies are accessible
   - Verify no version conflicts in `pom.xml`

4. **Runtime Errors**
   - Check application logs for startup errors
   - Verify all required configuration properties are set
   - Ensure database migrations completed successfully

### Log Locations

- Application logs: Standard Spring Boot logging location
- Migration logs: Database server logs or deployment script output
- Build logs: Maven output during compilation/packaging

### Support

For deployment issues:
1. Check the troubleshooting section above
2. Review application and database logs
3. Verify configuration settings
4. Test database connectivity independently

## Rollback Procedure

If rollback is needed:

1. **Application Rollback**
   - Deploy previous version of the application
   - No code changes needed (backward compatible)

2. **Database Rollback** (if necessary)
   ```sql
   DROP TABLE IF EXISTS screener_function_params;
   DROP TABLE IF EXISTS screener_functions;
   DROP TABLE IF EXISTS field_metadata;
   DROP FUNCTION IF EXISTS update_updated_at_column();
   ```

3. **Configuration Rollback**
   - Remove criteria-specific properties from `application.properties`
   - Remove `criteria-builder.properties` file

## Performance Considerations

- **Caching**: Field metadata and functions are cached for performance
- **Query Limits**: Configurable limits on criteria complexity and result size
- **Timeouts**: Configurable query timeouts to prevent long-running operations
- **Indexing**: Database indexes on frequently queried columns

## Security Considerations

- **SQL Injection Protection**: Parameterized queries and input sanitization
- **Access Control**: Role-based field and function access
- **Rate Limiting**: Configurable rate limits on criteria operations
- **Audit Logging**: Security events logged for monitoring