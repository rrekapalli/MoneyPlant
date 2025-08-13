# Database Transaction Troubleshooting Guide

## Problem Description

The application is failing with the following database transaction error:

```
org.springframework.orm.jpa.JpaSystemException: Unable to commit against JDBC Connection
Caused by: org.hibernate.TransactionException: Unable to commit against JDBC Connection
Caused by: org.postgresql.util.PSQLException: Cannot commit when autoCommit is enabled.
```

## Root Cause

This error occurs because:

1. **Autocommit Conflict**: The database connection has `autoCommit` enabled, but Spring is trying to manage transactions manually
2. **Configuration Mismatch**: The `connection.provider_disables_autocommit: true` setting is not working properly
3. **Profile Configuration**: The application might be using the wrong profile or database configuration
4. **Connection Pool Settings**: HikariCP connection pool settings are not properly configured

## Solution

### 1. **Use Correct Application Profile**

The application should use the `local` profile when running locally with Docker services:

**Option A: Set Environment Variable**
```bash
export SPRING_PROFILES_ACTIVE=local
```

**Option B: Use the Provided Scripts**
```bash
# Linux/Mac
./scripts/start-local.sh

# Windows
scripts\start-local.bat
```

### 2. **Database Configuration Fixes**

The following configuration changes have been implemented:

**File**: `engines/src/main/resources/application-local.yml`
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5433/moneyplant_engines
    username: postgres
    password: postgres
    hikari:
      auto-commit: false
      connection-init-sql: SET SESSION autocommit = false
  
  jpa:
    properties:
      hibernate:
        connection:
          provider_disables_autocommit: true
        jdbc:
          batch_size: 20
        order_inserts: true
        order_updates: true
        batch_versioned_data: true
```

### 3. **Transaction Management Configuration**

A new transaction configuration class has been added:

**File**: `engines/src/main/java/com/moneyplant/engines/config/TransactionConfig.java`
```java
@Configuration
@EnableTransactionManagement
public class TransactionConfig {
    
    @Bean
    public PlatformTransactionManager transactionManager(DataSource dataSource) {
        JpaTransactionManager transactionManager = new JpaTransactionManager();
        transactionManager.setDataSource(dataSource);
        transactionManager.setDefaultTimeout(30);
        transactionManager.setRollbackOnCommitFailure(true);
        return transactionManager;
    }
}
```

## Configuration Profiles

### **Local Profile** (`application-local.yml`)
- **Database**: `localhost:5433` (Docker PostgreSQL)
- **Kafka**: `localhost:9093` (Docker Kafka)
- **Redis**: `localhost:6380` (Docker Redis)
- **Purpose**: Local development with Docker services

### **Docker Profile** (`application-docker.yml`)
- **Database**: `postgres:5432` (Container PostgreSQL)
- **Kafka**: `kafka:29092` (Container Kafka)
- **Redis**: `redis:6379` (Container Redis)
- **Purpose**: Running inside Docker containers

### **Development Profile** (`application-dev.yml`)
- **Database**: Remote database (for development team)
- **Kafka**: `localhost:9093` (Docker Kafka)
- **Purpose**: Development with remote database

## Step-by-Step Resolution

### **Step 1: Stop the Application**
If the application is running, stop it first.

### **Step 2: Start Required Services**
```bash
cd engines
docker-compose up -d postgres zookeeper kafka redis
```

### **Step 3: Wait for Services to Start**
```bash
# Check service status
docker-compose ps

# Check logs for any errors
docker logs moneyplant-engines-postgres
docker logs moneyplant-engines-kafka
```

### **Step 4: Start Application with Local Profile**
```bash
# Option A: Use the script
./scripts/start-local.sh

# Option B: Manual start
export SPRING_PROFILES_ACTIVE=local
mvn spring-boot:run
```

### **Step 5: Verify Database Connection**
Check application logs for successful database connection and transaction management.

## Verification Steps

### 1. **Check Service Status**
```bash
docker-compose ps
```

Expected output:
```
Name                           Command               State           Ports         
--------------------------------------------------------------------------------
moneyplant-engines-kafka       /etc/confluent/docker/entrypoint ...   Up      0.0.0.0:9093->9093/tcp
moneyplant-engines-postgres    docker-entrypoint.sh postgres         Up      0.0.0.0:5433->5432/tcp
moneyplant-engines-redis       docker-entrypoint.sh redis-server     Up      0.0.0.0:6380->6379/tcp
moneyplant-engines-zookeeper   /etc/confluent/docker/entrypoint ...   Up      0.0.0.0:2181->2181/tcp
```

### 2. **Check Port Accessibility**
```bash
# PostgreSQL
nc -z localhost 5433

# Kafka
nc -z localhost 9093

# Redis
nc -z localhost 6380
```

### 3. **Check Application Logs**
Look for these successful messages:
```
✅ HikariCP pool started
✅ JPA/Hibernate initialized
✅ Transaction management enabled
✅ Database connection established
```

### 4. **Test Database Operations**
Use the provided REST endpoints to test database operations:
```bash
# Test latest indices data retrieval
curl http://localhost:8081/engines/api/nse-indices/latest

# Test tick data retrieval
curl http://localhost:8081/engines/api/nse-indices-ticks/latest
```

## Common Issues and Solutions

### Issue 1: Wrong Profile Active
**Error**: Still getting autocommit errors

**Solution**: Ensure correct profile is active
```bash
echo $SPRING_PROFILES_ACTIVE
# Should show: local

# If not, set it:
export SPRING_PROFILES_ACTIVE=local
```

### Issue 2: Services Not Running
**Error**: Connection refused to database/Kafka

**Solution**: Start Docker services
```bash
cd engines
docker-compose up -d
```

### Issue 3: Port Conflicts
**Error**: Address already in use

**Solution**: Check for conflicting services
```bash
# Check what's using the ports
netstat -tulpn | grep :5433
netstat -tulpn | grep :9093
netstat -tulpn | grep :6380

# Stop conflicting services or change ports in docker-compose.yml
```

### Issue 4: Database Schema Issues
**Error**: Table not found or schema mismatch

**Solution**: Run database migration
```bash
cd engines
./scripts/run-migration.sh
```

### Issue 5: Connection Pool Exhaustion
**Error**: Connection pool timeout

**Solution**: Adjust HikariCP settings
```yaml
hikari:
  maximum-pool-size: 20  # Increase from 10
  connection-timeout: 60000  # Increase from 30000
```

## Prevention

To prevent this issue in the future:

1. **Always use the correct profile** for your environment
2. **Use the provided scripts** to start services and applications
3. **Verify service connectivity** before starting the application
4. **Check configuration files** for profile-specific settings
5. **Monitor application logs** for early warning signs

## Alternative Solutions

### Option 1: Disable Transactions Temporarily
If you need to get the application running quickly:

```java
@Transactional(propagation = Propagation.NOT_SUPPORTED)
public List<NseIndicesTickDto> getLatestTicksForAllIndices() {
    // Method implementation
}
```

### Option 2: Use Manual Transaction Management
```java
@Autowired
private PlatformTransactionManager transactionManager;

public void someMethod() {
    TransactionTemplate template = new TransactionTemplate(transactionManager);
    template.execute(status -> {
        // Database operations
        return null;
    });
}
```

### Option 3: Switch to Remote Database
If local Docker setup continues to have issues:

```bash
export SPRING_PROFILES_ACTIVE=dev
```

## Support

If you continue to experience issues:

1. **Check service logs**: `docker logs <container-name>`
2. **Verify network configuration**: `docker network ls`
3. **Test database connectivity**: Use `psql` or database client
4. **Review application logs**: Look for detailed error messages
5. **Check profile configuration**: Ensure correct profile is active

## Summary

The database transaction issue was caused by:

1. ✅ **Autocommit conflict** between database and Spring transaction management
2. ✅ **Configuration mismatch** in database connection settings
3. ✅ **Profile selection** not matching the local Docker environment

The solution involves:

1. ✅ **Using the `local` profile** for local development
2. ✅ **Proper database configuration** with autocommit disabled
3. ✅ **Transaction management configuration** for Spring
4. ✅ **Service startup scripts** to ensure proper environment

After applying these changes and using the correct profile, your application should connect to the database successfully without transaction errors.
