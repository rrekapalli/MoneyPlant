# MoneyPlant Troubleshooting Guide

This document provides solutions for common issues you might encounter when working with the MoneyPlant application.

## Table of Contents

- [General Issues](#general-issues)
- [API Gateway Issues](#api-gateway-issues)
- [Service Discovery Issues](#service-discovery-issues)
- [Config Server Issues](#config-server-issues)
- [Database Issues](#database-issues)
- [Microservice-Specific Issues](#microservice-specific-issues)
- [Authentication Issues](#authentication-issues)
- [Deployment Issues](#deployment-issues)
- [Performance Issues](#performance-issues)
- [Logging and Monitoring](#logging-and-monitoring)

## General Issues

### Permission denied when running scripts on Linux/Mac

Symptoms:
- Running a script like ./start-backend.sh results in: sudo-rs: cannot execute '.../start-backend.sh': Permission denied (os error 13)
- Or: Permission denied when invoking any .sh launcher

Cause:
- The script file is not marked as executable after a cross-OS checkout or recent changes.

Solutions:
- Do not use sudo to run project scripts. Run them as your normal user.
- Make scripts executable once:
  ```bash
  chmod +x ./start-backend.sh ./start-frontend.sh ./start-engines.sh ./start-application.sh
  chmod -R +x scripts/linux/*.sh scripts/linux/*/*.sh engines/scripts/*.sh
  ```
- Alternatively, invoke via bash without changing permissions:
  ```bash
  bash ./start-backend.sh
  ```
- If you still see issues related to line endings (e.g., /bin/bash^M), convert line endings:
  ```bash
  dos2unix ./start-backend.sh
  ```

Note:
- Using sudo to execute repo scripts can trigger unrelated errors from the sudo utility (e.g., internal error: entered unreachable code). Always run as a normal user unless absolutely necessary.

### Application Won't Start

**Symptoms:**
- Service fails to start
- Error messages in logs

**Possible Causes and Solutions:**

1. **Port already in use**
   ```
   Web server failed to start. Port 8080 was already in use.
   ```
   
   **Solution:** Change the port in the application.properties file or stop the process using the port:
   ```bash
   # Find the process using the port
   netstat -ano | findstr :8080
   
   # Kill the process
   taskkill /PID <PID> /F
   ```

2. **Java version mismatch**
   ```
   Unsupported class file major version 65
   ```
   
   **Solution:** Ensure you're using Java 21 or higher:
   ```bash
   java -version
   ```

3. **Missing dependencies**
   
   **Solution:** Run Maven to download dependencies:
   ```bash
   mvn dependency:resolve
   ```

### Connection Timeouts

**Symptoms:**
- Services can't communicate with each other
- Timeout exceptions in logs

**Possible Causes and Solutions:**

1. **Network issues**
   
   **Solution:** Check network connectivity between services:
   ```bash
   ping <service-host>
   ```

2. **Firewall blocking connections**
   
   **Solution:** Check firewall settings and ensure required ports are open.

3. **Service not running**
   
   **Solution:** Verify all required services are running:
   ```bash
   docker ps
   # or
   kubectl get pods
   ```

## API Gateway Issues

### Routes Not Working

**Symptoms:**
- 404 errors when accessing services through the gateway
- "No route found" errors in logs

**Possible Causes and Solutions:**

1. **Service discovery not working**
   
   **Solution:** Ensure the service is registered with Eureka:
   ```
   http://localhost:8761
   ```

2. **Incorrect route configuration**
   
   **Solution:** Check the API Gateway configuration:
   ```yaml
   spring:
     cloud:
       gateway:
         routes:
           - id: portfolio-service
             uri: lb://PORTFOLIO-SERVICE
             predicates:
               - Path=/api/v1/portfolio/**
   ```

3. **Service name mismatch**
   
   **Solution:** Ensure the service name in the gateway configuration matches the service's application name.

### Rate Limiting Issues

**Symptoms:**
- 429 Too Many Requests errors
- Requests being blocked unexpectedly

**Solution:** Check and adjust rate limiter configuration:
```yaml
resilience4j:
  ratelimiter:
    instances:
      default:
        limitForPeriod: 100
        limitRefreshPeriod: 1s
        timeoutDuration: 0
```

## Service Discovery Issues

### Services Not Registering

**Symptoms:**
- Services don't appear in Eureka dashboard
- "Cannot execute request on any known server" errors

**Possible Causes and Solutions:**

1. **Incorrect Eureka configuration**
   
   **Solution:** Check the client configuration:
   ```yaml
   eureka:
     client:
       serviceUrl:
         defaultZone: http://localhost:8761/eureka/
   ```

2. **Network issues**
   
   **Solution:** Ensure the service can reach the Eureka server:
   ```bash
   curl http://localhost:8761/eureka/apps
   ```

3. **Application name not set**
   
   **Solution:** Ensure the application has a name:
   ```yaml
   spring:
     application:
       name: portfolio-service
   ```

## Config Server Issues

### Configuration Not Loading

**Symptoms:**
- Services using default configuration instead of centralized config
- "Could not locate PropertySource" errors

**Possible Causes and Solutions:**

1. **Config Server not running**
   
   **Solution:** Start the Config Server before other services.

2. **Incorrect Config Server URL**
   
   **Solution:** Check the client configuration:
   ```yaml
   spring:
     cloud:
       config:
         uri: http://localhost:8888
   ```

3. **Configuration files not found in repository**
   
   **Solution:** Ensure the configuration files exist in the correct location with the correct naming convention:
   ```
   /{application}/{profile}[/{label}]
   /{application}-{profile}.yml
   /{label}/{application}-{profile}.yml
   /{application}-{profile}.properties
   /{label}/{application}-{profile}.properties
   ```

## Database Issues

### Connection Failures

**Symptoms:**
- "Could not open JPA EntityManager for transaction" errors
- "Connection refused" errors

**Possible Causes and Solutions:**

1. **Database not running**
   
   **Solution:** Start the database server:
   ```bash
   # PostgreSQL
   pg_ctl start
   ```

2. **Incorrect connection details**
   
   **Solution:** Check the database configuration:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/portfolio_service
       username: moneyplant
       password: secure_password
   ```

3. **Database schema issues**
   
   **Solution:** Check if the schema exists and is accessible:
   ```sql
   \l  -- List databases in PostgreSQL
   ```

### Migration Failures

**Symptoms:**
- "Migration checksum mismatch" errors
- "Migration failed" errors

**Solution:** Check Flyway migration files for errors:
```bash
mvn flyway:info
```

## Microservice-Specific Issues

### Portfolio Service Issues

**Symptoms:**
- Cannot create or retrieve portfolios
- Portfolio-related operations fail

**Solutions:**
1. Check portfolio service logs for specific errors
2. Verify database connectivity
3. Ensure required services are available

### Stock Service Issues

**Symptoms:**
- Stock data not available
- Stock price updates failing

**Solutions:**
1. Check external API connectivity
2. Verify API keys and credentials
3. Check rate limiting on external APIs

## Authentication Issues

### Login Failures

**Symptoms:**
- Cannot log in
- "Bad credentials" errors

**Solutions:**
1. Reset password
2. Check user account status
3. Verify authentication configuration

### Token Issues

**Symptoms:**
- "Invalid token" errors
- Premature token expiration

**Solutions:**
1. Check token expiration settings
2. Verify token signature configuration
3. Ensure clocks are synchronized between services

## Deployment Issues

### Docker Deployment Issues

**Symptoms:**
- Containers fail to start
- Services can't communicate

**Solutions:**
1. Check Docker logs:
   ```bash
   docker logs <container-id>
   ```
2. Verify network configuration:
   ```bash
   docker network inspect bridge
   ```
3. Check container health:
   ```bash
   docker ps -a
   ```

### Kubernetes Deployment Issues

**Symptoms:**
- Pods in CrashLoopBackOff or Error state
- Services not accessible

**Solutions:**
1. Check pod logs:
   ```bash
   kubectl logs <pod-name>
   ```
2. Describe the pod for events:
   ```bash
   kubectl describe pod <pod-name>
   ```
3. Check service endpoints:
   ```bash
   kubectl get endpoints
   ```

## Performance Issues

### Slow Response Times

**Symptoms:**
- API calls take longer than expected
- Timeouts occur during peak usage

**Solutions:**
1. Check database query performance
2. Monitor CPU and memory usage
3. Consider scaling services horizontally
4. Implement caching for frequently accessed data

### Memory Leaks

**Symptoms:**
- Increasing memory usage over time
- OutOfMemoryError exceptions

**Solutions:**
1. Take heap dumps for analysis:
   ```bash
   jmap -dump:format=b,file=heap.bin <pid>
   ```
2. Analyze with tools like VisualVM or Eclipse Memory Analyzer
3. Check for resource leaks (connections, file handles)

## Logging and Monitoring

### Missing Logs

**Symptoms:**
- Expected log entries not appearing
- Difficulty troubleshooting issues

**Solutions:**
1. Check log level configuration:
   ```yaml
   logging:
     level:
       root: INFO
       com.moneyplant: DEBUG
   ```
2. Verify log file permissions
3. Check disk space for log storage

### Monitoring Alerts

**Symptoms:**
- False positive alerts
- Missing critical alerts

**Solutions:**
1. Adjust alert thresholds
2. Review alert rules
3. Check monitoring service connectivity

### Distributed Tracing Issues

**Symptoms:**
- Incomplete traces
- Missing spans

**Solutions:**
1. Verify Zipkin configuration:
   ```yaml
   spring:
     zipkin:
       baseUrl: http://localhost:9411
   ```
2. Check sampling rate:
   ```yaml
   spring:
     sleuth:
       sampler:
         probability: 1.0
   ```
3. Ensure all services have tracing enabled