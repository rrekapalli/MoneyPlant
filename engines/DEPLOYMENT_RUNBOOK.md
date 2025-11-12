# Deployment Runbook - Market Data Ingestion Engine

## Overview

This runbook provides step-by-step procedures for deploying, operating, and troubleshooting the Market Data Ingestion Engine in production environments.

**Target Audience**: DevOps Engineers, SREs, System Administrators

**Prerequisites**:
- Access to production Kubernetes cluster
- kubectl configured with appropriate permissions
- Access to production databases and Kafka cluster
- Access to monitoring dashboards (Grafana, Prometheus)
- Access to log aggregation system

## Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Deployment Procedures](#deployment-procedures)
3. [Post-Deployment Verification](#post-deployment-verification)
4. [Rollback Procedures](#rollback-procedures)
5. [Common Issues and Solutions](#common-issues-and-solutions)
6. [Emergency Procedures](#emergency-procedures)
7. [Maintenance Procedures](#maintenance-procedures)
8. [Monitoring and Alerting](#monitoring-and-alerting)

---

## Pre-Deployment Checklist

### Infrastructure Readiness

- [ ] **Database**: TimescaleDB cluster is healthy and accessible
  ```bash
  psql -h prod-timescaledb.example.com -U postgres -d MoneyPlant -c "SELECT version();"
  ```

- [ ] **Kafka**: Kafka cluster is healthy with all brokers online
  ```bash
  kafka-broker-api-versions --bootstrap-server prod-kafka:9092
  ```

- [ ] **Data Lake**: S3/MinIO is accessible and has sufficient storage
  ```bash
  aws s3 ls s3://moneyplant-datalake/
  ```

- [ ] **Kubernetes**: Cluster has sufficient resources
  ```bash
  kubectl top nodes
  kubectl get nodes
  ```

- [ ] **Monitoring**: Prometheus and Grafana are operational
  ```bash
  curl -s http://prometheus.example.com/-/healthy
  curl -s http://grafana.example.com/api/health
  ```

### Configuration Verification

- [ ] **Secrets**: All required secrets are created
  ```bash
  kubectl get secrets -n moneyplant | grep ingestion-engine
  ```

- [ ] **ConfigMaps**: Configuration is up-to-date
  ```bash
  kubectl get configmap ingestion-engine-config -n moneyplant -o yaml
  ```

- [ ] **Environment Variables**: Production values are set correctly
  ```bash
  kubectl get deployment ingestion-engine -n moneyplant -o yaml | grep -A 20 env:
  ```

### Application Readiness

- [ ] **Docker Image**: Latest image is built and pushed to registry
  ```bash
  docker pull your-registry.com/moneyplant/ingestion-engine:v1.0.0
  docker inspect your-registry.com/moneyplant/ingestion-engine:v1.0.0
  ```

- [ ] **Database Migrations**: Flyway migrations are ready
  ```bash
  ls -la engines/src/main/resources/db/migration/
  ```

- [ ] **Tests**: All tests pass in CI/CD pipeline
  ```bash
  ./mvnw clean test
  ```


---

## Deployment Procedures

### Standard Deployment (Rolling Update)

**Duration**: ~15 minutes  
**Downtime**: None (zero-downtime deployment)  
**Risk Level**: Low

#### Step 1: Backup Current State

```bash
# Backup current deployment configuration
kubectl get deployment ingestion-engine -n moneyplant -o yaml > backup-deployment-$(date +%Y%m%d-%H%M%S).yaml

# Backup database (if schema changes)
pg_dump -h prod-timescaledb.example.com -U postgres -d MoneyPlant -F c -f backup-$(date +%Y%m%d).dump

# Note current image version
kubectl get deployment ingestion-engine -n moneyplant -o jsonpath='{.spec.template.spec.containers[0].image}'
```

#### Step 2: Update Image Tag

```bash
# Update deployment with new image
kubectl set image deployment/ingestion-engine \
  ingestion-engine=your-registry.com/moneyplant/ingestion-engine:v1.0.0 \
  -n moneyplant

# Or apply updated manifest
kubectl apply -f k8s/deployment.yaml -n moneyplant
```

#### Step 3: Monitor Rollout

```bash
# Watch rollout status
kubectl rollout status deployment/ingestion-engine -n moneyplant

# Monitor pods
watch kubectl get pods -n moneyplant -l app=ingestion-engine

# Check logs of new pods
kubectl logs -f deployment/ingestion-engine -n moneyplant --tail=100
```

#### Step 4: Verify Health

```bash
# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=ingestion-engine -n moneyplant --timeout=300s

# Check health endpoint
POD_NAME=$(kubectl get pods -n moneyplant -l app=ingestion-engine -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n moneyplant $POD_NAME -- curl -s http://localhost:8081/engines/actuator/health

# Check application logs for errors
kubectl logs -n moneyplant $POD_NAME --tail=50 | grep -i error
```

#### Step 5: Smoke Tests

```bash
# Test API endpoints
INGRESS_URL="https://api.moneyplant.com"

# Health check
curl -s $INGRESS_URL/engines/actuator/health | jq .

# Get ingestion status
curl -s $INGRESS_URL/engines/api/v1/ingestion/status | jq .

# Test market data query
curl -s "$INGRESS_URL/engines/api/v1/market-data/quote/RELIANCE" | jq .
```

#### Step 6: Monitor Metrics

```bash
# Check Prometheus metrics
curl -s $INGRESS_URL/engines/actuator/prometheus | grep ingestion_ticks_rate

# Check Grafana dashboard
# Navigate to: https://grafana.example.com/d/ingestion-engine

# Verify no spike in error rates
# Verify tick processing rate is normal
# Verify database write rate is normal
```

### Blue-Green Deployment

**Duration**: ~30 minutes  
**Downtime**: None  
**Risk Level**: Very Low (easy rollback)

#### Step 1: Deploy Green Environment

```bash
# Create green deployment
kubectl apply -f k8s/deployment-green.yaml -n moneyplant

# Wait for green pods to be ready
kubectl wait --for=condition=ready pod -l app=ingestion-engine,version=green -n moneyplant --timeout=300s

# Verify green environment
kubectl get pods -n moneyplant -l version=green
```

#### Step 2: Test Green Environment

```bash
# Port-forward to green pod for testing
GREEN_POD=$(kubectl get pods -n moneyplant -l app=ingestion-engine,version=green -o jsonpath='{.items[0].metadata.name}')
kubectl port-forward -n moneyplant $GREEN_POD 8082:8081 &

# Run smoke tests against green environment
curl -s http://localhost:8082/engines/actuator/health
curl -s http://localhost:8082/engines/api/v1/ingestion/status

# Kill port-forward
kill %1
```

#### Step 3: Switch Traffic to Green

```bash
# Update service selector to point to green
kubectl patch service ingestion-engine -n moneyplant -p '{"spec":{"selector":{"version":"green"}}}'

# Verify traffic is flowing to green
kubectl get endpoints ingestion-engine -n moneyplant
```

#### Step 4: Monitor Green Environment

```bash
# Monitor for 15 minutes
# Watch metrics, logs, and error rates
# If issues detected, switch back to blue (see rollback)
```

#### Step 5: Decommission Blue Environment

```bash
# After successful monitoring, scale down blue
kubectl scale deployment ingestion-engine-blue --replicas=0 -n moneyplant

# After 24 hours, delete blue deployment
kubectl delete deployment ingestion-engine-blue -n moneyplant
```


### Canary Deployment

**Duration**: ~45 minutes  
**Downtime**: None  
**Risk Level**: Very Low (gradual rollout)

#### Step 1: Deploy Canary

```bash
# Deploy canary with 10% traffic
kubectl apply -f k8s/deployment-canary.yaml -n moneyplant

# Verify canary pods
kubectl get pods -n moneyplant -l app=ingestion-engine,track=canary
```

#### Step 2: Route 10% Traffic to Canary

```bash
# Update Istio VirtualService or Ingress for traffic split
kubectl apply -f k8s/virtualservice-canary-10.yaml -n moneyplant

# Verify traffic split
kubectl get virtualservice ingestion-engine -n moneyplant -o yaml
```

#### Step 3: Monitor Canary (15 minutes)

```bash
# Compare metrics between stable and canary
# - Error rates
# - Latency (p50, p95, p99)
# - Throughput
# - Resource usage

# Check Grafana dashboard for comparison
# If metrics are good, proceed to next step
# If issues detected, rollback canary
```

#### Step 4: Increase Traffic Gradually

```bash
# Increase to 25%
kubectl apply -f k8s/virtualservice-canary-25.yaml -n moneyplant
# Monitor for 10 minutes

# Increase to 50%
kubectl apply -f k8s/virtualservice-canary-50.yaml -n moneyplant
# Monitor for 10 minutes

# Increase to 100%
kubectl apply -f k8s/virtualservice-canary-100.yaml -n moneyplant
# Monitor for 10 minutes
```

#### Step 5: Promote Canary to Stable

```bash
# Update stable deployment with canary image
kubectl set image deployment/ingestion-engine \
  ingestion-engine=your-registry.com/moneyplant/ingestion-engine:v1.0.0 \
  -n moneyplant

# Remove canary deployment
kubectl delete deployment ingestion-engine-canary -n moneyplant

# Reset traffic routing
kubectl apply -f k8s/virtualservice-stable.yaml -n moneyplant
```

---

## Post-Deployment Verification

### Automated Verification

```bash
#!/bin/bash
# post-deployment-verify.sh

set -e

NAMESPACE="moneyplant"
INGRESS_URL="https://api.moneyplant.com"

echo "=== Post-Deployment Verification ==="

# 1. Check pod status
echo "Checking pod status..."
kubectl get pods -n $NAMESPACE -l app=ingestion-engine
kubectl wait --for=condition=ready pod -l app=ingestion-engine -n $NAMESPACE --timeout=300s

# 2. Check health endpoint
echo "Checking health endpoint..."
HEALTH=$(curl -s $INGRESS_URL/engines/actuator/health | jq -r .status)
if [ "$HEALTH" != "UP" ]; then
  echo "ERROR: Health check failed. Status: $HEALTH"
  exit 1
fi
echo "✓ Health check passed"

# 3. Check database connectivity
echo "Checking database connectivity..."
DB_HEALTH=$(curl -s $INGRESS_URL/engines/actuator/health/db | jq -r .status)
if [ "$DB_HEALTH" != "UP" ]; then
  echo "ERROR: Database health check failed"
  exit 1
fi
echo "✓ Database connectivity OK"

# 4. Check Kafka connectivity
echo "Checking Kafka connectivity..."
KAFKA_HEALTH=$(curl -s $INGRESS_URL/engines/actuator/health/kafka | jq -r .status)
if [ "$KAFKA_HEALTH" != "UP" ]; then
  echo "ERROR: Kafka health check failed"
  exit 1
fi
echo "✓ Kafka connectivity OK"

# 5. Test API endpoints
echo "Testing API endpoints..."
STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" $INGRESS_URL/engines/api/v1/ingestion/status)
if [ "$STATUS_CODE" != "200" ]; then
  echo "ERROR: API endpoint returned $STATUS_CODE"
  exit 1
fi
echo "✓ API endpoints responding"

# 6. Check metrics
echo "Checking metrics..."
METRICS=$(curl -s $INGRESS_URL/engines/actuator/prometheus | grep -c "ingestion_")
if [ "$METRICS" -lt 10 ]; then
  echo "ERROR: Insufficient metrics exposed"
  exit 1
fi
echo "✓ Metrics exposed correctly"

# 7. Check logs for errors
echo "Checking logs for errors..."
POD_NAME=$(kubectl get pods -n $NAMESPACE -l app=ingestion-engine -o jsonpath='{.items[0].metadata.name}')
ERROR_COUNT=$(kubectl logs -n $NAMESPACE $POD_NAME --tail=100 | grep -c "ERROR" || true)
if [ "$ERROR_COUNT" -gt 5 ]; then
  echo "WARNING: Found $ERROR_COUNT errors in recent logs"
  kubectl logs -n $NAMESPACE $POD_NAME --tail=20 | grep "ERROR"
fi

echo "=== Verification Complete ==="
echo "✓ All checks passed"
```

### Manual Verification

1. **Check Grafana Dashboard**
   - Navigate to Ingestion Engine dashboard
   - Verify tick processing rate is normal
   - Verify no spike in error rates
   - Verify latency is within acceptable range

2. **Check Application Logs**
   ```bash
   kubectl logs -f deployment/ingestion-engine -n moneyplant --tail=100
   ```
   - Look for startup messages
   - Verify no ERROR or FATAL logs
   - Check for successful database connections
   - Check for successful Kafka connections

3. **Test Data Flow**
   ```bash
   # Trigger a backfill to test data flow
   curl -X POST $INGRESS_URL/engines/api/v1/ingestion/backfill \
     -H "Content-Type: application/json" \
     -d '{
       "symbol": "RELIANCE",
       "startDate": "2024-01-01",
       "endDate": "2024-01-02",
       "timeframe": "DAILY"
     }'
   
   # Verify data was ingested
   # Check TimescaleDB for new records
   # Check Kafka topics for published messages
   ```

4. **Verify Scheduled Jobs**
   ```bash
   # Check that scheduled jobs are configured
   kubectl logs -n moneyplant $POD_NAME | grep "Scheduled"
   
   # Verify cron expressions
   # - Symbol master refresh: 6:00 AM daily
   # - End-of-day archival: 3:30 PM daily
   ```


---

## Rollback Procedures

### Quick Rollback (Kubernetes)

**Duration**: ~5 minutes  
**Use When**: Critical issues detected immediately after deployment

```bash
# Rollback to previous version
kubectl rollout undo deployment/ingestion-engine -n moneyplant

# Monitor rollback
kubectl rollout status deployment/ingestion-engine -n moneyplant

# Verify pods are running
kubectl get pods -n moneyplant -l app=ingestion-engine

# Check health
POD_NAME=$(kubectl get pods -n moneyplant -l app=ingestion-engine -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n moneyplant $POD_NAME -- curl -s http://localhost:8081/engines/actuator/health
```

### Rollback to Specific Version

```bash
# List deployment history
kubectl rollout history deployment/ingestion-engine -n moneyplant

# Rollback to specific revision
kubectl rollout undo deployment/ingestion-engine --to-revision=3 -n moneyplant

# Verify rollback
kubectl rollout status deployment/ingestion-engine -n moneyplant
```

### Blue-Green Rollback

**Duration**: ~2 minutes  
**Use When**: Issues detected in green environment

```bash
# Switch traffic back to blue
kubectl patch service ingestion-engine -n moneyplant -p '{"spec":{"selector":{"version":"blue"}}}'

# Verify traffic is back on blue
kubectl get endpoints ingestion-engine -n moneyplant

# Scale down green
kubectl scale deployment ingestion-engine-green --replicas=0 -n moneyplant

# Investigate issues in green environment
kubectl logs deployment/ingestion-engine-green -n moneyplant --tail=200
```

### Database Rollback

**Use When**: Database migration causes issues

```bash
# Connect to database
psql -h prod-timescaledb.example.com -U postgres -d MoneyPlant

# Check Flyway history
SELECT * FROM flyway_schema_history ORDER BY installed_rank DESC LIMIT 5;

# Rollback migration (if supported)
# Note: Flyway doesn't support automatic rollback
# Manual rollback may be required

# Restore from backup if necessary
pg_restore -h prod-timescaledb.example.com -U postgres -d MoneyPlant backup-20240115.dump
```

### Post-Rollback Actions

1. **Verify System Stability**
   ```bash
   # Run post-deployment verification script
   ./post-deployment-verify.sh
   
   # Monitor for 30 minutes
   # Check Grafana dashboards
   # Check error rates
   # Check application logs
   ```

2. **Document Rollback**
   - Record rollback time and reason
   - Document issues encountered
   - Create incident report
   - Update runbook if needed

3. **Root Cause Analysis**
   - Analyze logs from failed deployment
   - Review metrics and traces
   - Identify root cause
   - Create action items to prevent recurrence

---

## Common Issues and Solutions

### Issue 1: Pods Stuck in CrashLoopBackOff

**Symptoms**:
```bash
kubectl get pods -n moneyplant
# NAME                                READY   STATUS             RESTARTS
# ingestion-engine-7d8f9c5b6d-abc12   0/1     CrashLoopBackOff   5
```

**Diagnosis**:
```bash
# Check pod logs
kubectl logs ingestion-engine-7d8f9c5b6d-abc12 -n moneyplant

# Check pod events
kubectl describe pod ingestion-engine-7d8f9c5b6d-abc12 -n moneyplant
```

**Common Causes and Solutions**:

1. **Database Connection Failure**
   ```bash
   # Verify database credentials
   kubectl get secret db-credentials -n moneyplant -o yaml
   
   # Test database connectivity
   kubectl run -it --rm debug --image=postgres:13 --restart=Never -n moneyplant -- \
     psql -h prod-timescaledb.example.com -U postgres -d MoneyPlant -c "SELECT 1;"
   
   # Solution: Update database credentials or fix network connectivity
   ```

2. **Kafka Connection Failure**
   ```bash
   # Verify Kafka is accessible
   kubectl run -it --rm debug --image=confluentinc/cp-kafka:latest --restart=Never -n moneyplant -- \
     kafka-broker-api-versions --bootstrap-server prod-kafka:9092
   
   # Solution: Update Kafka bootstrap servers or fix network connectivity
   ```

3. **Out of Memory**
   ```bash
   # Check pod resource limits
   kubectl describe pod ingestion-engine-7d8f9c5b6d-abc12 -n moneyplant | grep -A 5 Limits
   
   # Solution: Increase memory limits in deployment
   kubectl set resources deployment ingestion-engine -n moneyplant \
     --limits=memory=8Gi --requests=memory=4Gi
   ```

### Issue 2: High Memory Usage

**Symptoms**:
- Pods being OOMKilled
- Slow performance
- Frequent garbage collection

**Diagnosis**:
```bash
# Check memory usage
kubectl top pods -n moneyplant -l app=ingestion-engine

# Get heap dump
POD_NAME=$(kubectl get pods -n moneyplant -l app=ingestion-engine -o jsonpath='{.items[0].metadata.name}')
kubectl exec -n moneyplant $POD_NAME -- jcmd 1 GC.heap_dump /tmp/heapdump.hprof
kubectl cp moneyplant/$POD_NAME:/tmp/heapdump.hprof ./heapdump.hprof
```

**Solutions**:

1. **Increase Heap Size**
   ```yaml
   env:
     - name: JAVA_OPTS
       value: "-Xms4g -Xmx8g -XX:+UseG1GC"
   ```

2. **Tune Garbage Collection**
   ```yaml
   env:
     - name: JAVA_OPTS
       value: "-XX:+UseG1GC -XX:MaxGCPauseMillis=200 -XX:+UseStringDeduplication"
   ```

3. **Reduce Buffer Sizes**
   ```yaml
   ingestion:
     buffer-size: 50000  # Reduce from 100000
   ```

### Issue 3: Slow Data Ingestion

**Symptoms**:
- Tick processing rate below expected
- Increasing Kafka lag
- Database write backlog

**Diagnosis**:
```bash
# Check metrics
curl -s http://api.moneyplant.com/engines/actuator/metrics/ingestion.ticks.rate
curl -s http://api.moneyplant.com/engines/actuator/metrics/ingestion.db.writes

# Check database connections
kubectl exec -n moneyplant $POD_NAME -- curl -s http://localhost:8081/engines/actuator/metrics/hikaricp.connections.active

# Check Kafka lag
kafka-consumer-groups --bootstrap-server prod-kafka:9092 --describe --group ingestion-engine
```

**Solutions**:

1. **Increase Parallelism**
   ```yaml
   ingestion:
     parallelism: 32  # Increase from 16
   ```

2. **Increase Database Connection Pool**
   ```yaml
   spring:
     datasource:
       hikari:
         maximum-pool-size: 100  # Increase from 50
   ```

3. **Scale Horizontally**
   ```bash
   kubectl scale deployment ingestion-engine --replicas=5 -n moneyplant
   ```

### Issue 4: Data Quality Issues

**Symptoms**:
- Invalid data in database
- Data validation errors in logs
- Missing data for some symbols

**Diagnosis**:
```bash
# Check data quality metrics
curl -s http://api.moneyplant.com/engines/actuator/metrics/ingestion.data.quality

# Check validation errors
kubectl logs -n moneyplant deployment/ingestion-engine | grep "Validation failed"

# Check provider health
curl -s http://api.moneyplant.com/engines/api/v1/ingestion/status | jq .providers
```

**Solutions**:

1. **Check Provider Health**
   ```bash
   # Test NSE API
   curl -s "https://www.nseindia.com/api/quote-equity?symbol=RELIANCE"
   
   # Test Yahoo Finance API
   curl -s "https://query1.finance.yahoo.com/v8/finance/chart/RELIANCE.NS"
   ```

2. **Review Validation Rules**
   - Check circuit breaker limits
   - Review timestamp validation
   - Verify volume validation

3. **Trigger Manual Backfill**
   ```bash
   # Backfill missing data
   curl -X POST http://api.moneyplant.com/engines/api/v1/ingestion/backfill \
     -H "Content-Type: application/json" \
     -d '{
       "symbol": "RELIANCE",
       "startDate": "2024-01-01",
       "endDate": "2024-01-15",
       "timeframe": "DAILY"
     }'
   ```


---

## Emergency Procedures

### Emergency Shutdown

**Use When**: Critical system issue requires immediate shutdown

```bash
# Scale down to zero replicas
kubectl scale deployment ingestion-engine --replicas=0 -n moneyplant

# Verify all pods are terminated
kubectl get pods -n moneyplant -l app=ingestion-engine

# Stop data ingestion immediately
# Note: This will stop all data collection
```

### Emergency Restart

**Use When**: Application is unresponsive but infrastructure is healthy

```bash
# Delete all pods (they will be recreated)
kubectl delete pods -n moneyplant -l app=ingestion-engine

# Or restart deployment
kubectl rollout restart deployment/ingestion-engine -n moneyplant

# Monitor restart
kubectl rollout status deployment/ingestion-engine -n moneyplant
```

### Data Corruption Recovery

**Use When**: Database contains corrupted data

```bash
# 1. Stop ingestion
kubectl scale deployment ingestion-engine --replicas=0 -n moneyplant

# 2. Backup current database
pg_dump -h prod-timescaledb.example.com -U postgres -d MoneyPlant -F c -f backup-corrupted-$(date +%Y%m%d).dump

# 3. Identify corrupted data
psql -h prod-timescaledb.example.com -U postgres -d MoneyPlant
# Run queries to identify corrupted records

# 4. Delete corrupted data
DELETE FROM nse_eq_ticks WHERE time >= '2024-01-15' AND time < '2024-01-16';

# 5. Restore from Hudi data lake
# Use Trino to query historical data and re-insert

# 6. Restart ingestion
kubectl scale deployment ingestion-engine --replicas=3 -n moneyplant

# 7. Trigger backfill for missing data
curl -X POST http://api.moneyplant.com/engines/api/v1/ingestion/backfill \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "ALL",
    "startDate": "2024-01-15",
    "endDate": "2024-01-15",
    "timeframe": "DAILY"
  }'
```

### Kafka Topic Reset

**Use When**: Kafka consumer group is stuck or has incorrect offsets

```bash
# 1. Stop consumers
kubectl scale deployment ingestion-engine --replicas=0 -n moneyplant

# 2. Reset consumer group offsets
kafka-consumer-groups --bootstrap-server prod-kafka:9092 \
  --group ingestion-engine \
  --reset-offsets \
  --to-earliest \
  --topic market-data-ticks \
  --execute

# 3. Restart consumers
kubectl scale deployment ingestion-engine --replicas=3 -n moneyplant

# 4. Monitor lag
kafka-consumer-groups --bootstrap-server prod-kafka:9092 \
  --describe --group ingestion-engine
```

### Database Connection Pool Exhaustion

**Use When**: All database connections are in use

```bash
# 1. Check active connections
psql -h prod-timescaledb.example.com -U postgres -d MoneyPlant -c \
  "SELECT count(*) FROM pg_stat_activity WHERE datname = 'MoneyPlant';"

# 2. Kill long-running queries
psql -h prod-timescaledb.example.com -U postgres -d MoneyPlant -c \
  "SELECT pg_terminate_backend(pid) FROM pg_stat_activity 
   WHERE datname = 'MoneyPlant' AND state = 'idle in transaction' 
   AND query_start < NOW() - INTERVAL '5 minutes';"

# 3. Restart application
kubectl rollout restart deployment/ingestion-engine -n moneyplant

# 4. Increase connection pool size if needed
kubectl set env deployment/ingestion-engine -n moneyplant \
  HIKARI_MAXIMUM_POOL_SIZE=100
```

---

## Maintenance Procedures

### Scheduled Maintenance Window

**Frequency**: Monthly  
**Duration**: 2 hours  
**Recommended Time**: Sunday 2:00 AM - 4:00 AM IST

#### Pre-Maintenance

1. **Notify Stakeholders**
   - Send notification 1 week in advance
   - Send reminder 24 hours before
   - Send final notification 1 hour before

2. **Backup Everything**
   ```bash
   # Database backup
   pg_dump -h prod-timescaledb.example.com -U postgres -d MoneyPlant -F c \
     -f backup-maintenance-$(date +%Y%m%d).dump
   
   # Backup Kubernetes resources
   kubectl get all -n moneyplant -o yaml > k8s-backup-$(date +%Y%m%d).yaml
   
   # Backup data lake
   aws s3 sync s3://moneyplant-datalake s3://moneyplant-datalake-backup-$(date +%Y%m%d)
   ```

#### Maintenance Tasks

1. **Update Dependencies**
   ```bash
   # Update base image
   docker pull eclipse-temurin:21-jre-alpine
   
   # Rebuild application
   ./mvnw clean package
   docker build -t moneyplant/ingestion-engine:v1.1.0 .
   docker push moneyplant/ingestion-engine:v1.1.0
   ```

2. **Database Maintenance**
   ```sql
   -- Vacuum and analyze
   VACUUM ANALYZE nse_eq_ticks;
   VACUUM ANALYZE nse_eq_ohlcv_historic;
   
   -- Reindex if needed
   REINDEX TABLE nse_eq_ticks;
   
   -- Update statistics
   ANALYZE nse_eq_ticks;
   ```

3. **Kafka Maintenance**
   ```bash
   # Clean up old topics
   kafka-topics --bootstrap-server prod-kafka:9092 --delete --topic old-topic
   
   # Compact topics
   kafka-topics --bootstrap-server prod-kafka:9092 --alter \
     --topic market-data-ticks --config cleanup.policy=compact
   ```

4. **Data Lake Maintenance**
   ```bash
   # Compact Hudi tables
   spark-submit --class org.apache.hudi.utilities.HoodieCompactor \
     --master spark://spark-master:7077 \
     hudi-utilities.jar \
     --base-path s3://moneyplant-datalake/nse-eq-ticks \
     --table-name nse_eq_ticks_historical
   
   # Clean old versions
   spark-submit --class org.apache.hudi.utilities.HoodieCleaner \
     --master spark://spark-master:7077 \
     hudi-utilities.jar \
     --base-path s3://moneyplant-datalake/nse-eq-ticks \
     --table-name nse_eq_ticks_historical
   ```

#### Post-Maintenance

1. **Verify System Health**
   ```bash
   # Run verification script
   ./post-deployment-verify.sh
   
   # Check all services
   kubectl get all -n moneyplant
   
   # Monitor for 1 hour
   ```

2. **Update Documentation**
   - Document changes made
   - Update runbook if needed
   - Update configuration documentation

3. **Notify Stakeholders**
   - Send completion notification
   - Report any issues encountered
   - Provide summary of work completed

### Log Rotation

```bash
# Configure log rotation in Kubernetes
kubectl apply -f - <<EOF
apiVersion: v1
kind: ConfigMap
metadata:
  name: logrotate-config
  namespace: moneyplant
data:
  logrotate.conf: |
    /var/log/moneyplant/*.log {
      daily
      rotate 7
      compress
      delaycompress
      missingok
      notifempty
      create 0644 moneyplant moneyplant
    }
EOF
```

### Certificate Renewal

```bash
# Check certificate expiry
kubectl get certificate -n moneyplant

# Renew certificate (if using cert-manager)
kubectl delete certificate ingestion-engine-tls -n moneyplant
kubectl apply -f k8s/certificate.yaml

# Verify new certificate
kubectl get certificate ingestion-engine-tls -n moneyplant
```


---

## Monitoring and Alerting

### Key Metrics to Monitor

#### Application Metrics

1. **Tick Processing Rate**
   - Metric: `ingestion_ticks_rate`
   - Normal: 5000-10000 ticks/sec
   - Alert: < 1000 ticks/sec

2. **Kafka Publishing Rate**
   - Metric: `ingestion_kafka_published_rate`
   - Normal: 5000-10000 messages/sec
   - Alert: < 1000 messages/sec

3. **Database Write Rate**
   - Metric: `ingestion_db_writes_rate`
   - Normal: 1000-5000 writes/sec
   - Alert: < 500 writes/sec

4. **Error Rate**
   - Metric: `ingestion_errors_total`
   - Normal: < 0.1%
   - Alert: > 1%

5. **Latency (p99)**
   - Metric: `ingestion_latency_p99`
   - Normal: < 50ms
   - Alert: > 100ms

#### Infrastructure Metrics

1. **CPU Usage**
   - Normal: 40-70%
   - Alert: > 85%

2. **Memory Usage**
   - Normal: 50-75%
   - Alert: > 90%

3. **Disk Usage**
   - Normal: < 70%
   - Alert: > 85%

4. **Network I/O**
   - Monitor for saturation
   - Alert: > 80% of capacity

### Alert Rules

#### Prometheus Alert Rules

```yaml
groups:
  - name: ingestion-engine
    interval: 30s
    rules:
      - alert: IngestionEngineDown
        expr: up{job="ingestion-engine"} == 0
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Ingestion Engine is down"
          description: "Ingestion Engine has been down for more than 2 minutes"

      - alert: HighErrorRate
        expr: rate(ingestion_errors_total[5m]) > 0.01
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High error rate detected"
          description: "Error rate is {{ $value | humanizePercentage }}"

      - alert: LowTickProcessingRate
        expr: rate(ingestion_ticks_processed_total[5m]) < 1000
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low tick processing rate"
          description: "Processing only {{ $value }} ticks/sec"

      - alert: HighLatency
        expr: histogram_quantile(0.99, ingestion_latency_seconds_bucket) > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High latency detected"
          description: "P99 latency is {{ $value }}s"

      - alert: DatabaseConnectionPoolExhausted
        expr: hikaricp_connections_active >= hikaricp_connections_max
        for: 2m
        labels:
          severity: critical
        annotations:
          summary: "Database connection pool exhausted"
          description: "All database connections are in use"

      - alert: KafkaLagHigh
        expr: kafka_consumer_lag > 10000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High Kafka consumer lag"
          description: "Consumer lag is {{ $value }} messages"

      - alert: MemoryUsageHigh
        expr: jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.9
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Heap memory usage is {{ $value | humanizePercentage }}"

      - alert: DataFreshnessIssue
        expr: time() - ingestion_last_tick_timestamp_seconds > 300
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "Stale data detected"
          description: "No new data received for 5 minutes"
```

### Grafana Dashboards

#### Main Dashboard Panels

1. **Overview**
   - System status (UP/DOWN)
   - Active symbols count
   - Total ticks processed today
   - Current processing rate

2. **Performance**
   - Tick processing rate (time series)
   - Latency percentiles (p50, p95, p99)
   - Throughput (ticks/sec, messages/sec)

3. **Errors**
   - Error rate over time
   - Error breakdown by type
   - Recent error logs

4. **Resources**
   - CPU usage
   - Memory usage (heap, non-heap)
   - Garbage collection activity
   - Thread count

5. **Database**
   - Connection pool usage
   - Query execution time
   - Write rate
   - Active connections

6. **Kafka**
   - Publishing rate
   - Consumer lag
   - Failed messages
   - Partition distribution

### On-Call Procedures

#### Severity Levels

**Critical (P1)**:
- System completely down
- Data loss occurring
- Security breach
- Response Time: 15 minutes
- Escalation: Immediate

**High (P2)**:
- Degraded performance
- High error rate
- Partial outage
- Response Time: 30 minutes
- Escalation: After 1 hour

**Medium (P3)**:
- Minor issues
- Non-critical errors
- Response Time: 2 hours
- Escalation: After 4 hours

**Low (P4)**:
- Informational
- Planned maintenance
- Response Time: Next business day
- Escalation: None

#### On-Call Response

1. **Acknowledge Alert**
   - Acknowledge in PagerDuty/Opsgenie
   - Check Grafana dashboard
   - Review recent deployments

2. **Initial Assessment**
   - Check system health
   - Review error logs
   - Check metrics
   - Determine severity

3. **Mitigation**
   - Apply quick fix if available
   - Rollback if recent deployment
   - Scale resources if needed
   - Engage additional support if required

4. **Communication**
   - Update incident status
   - Notify stakeholders
   - Provide regular updates

5. **Resolution**
   - Verify fix
   - Monitor for stability
   - Document incident
   - Schedule post-mortem

### Contact Information

**Primary On-Call**: Check PagerDuty schedule

**Escalation Path**:
1. Senior Engineer
2. Engineering Manager
3. Director of Engineering

**External Contacts**:
- Database Team: db-team@moneyplant.com
- Infrastructure Team: infra-team@moneyplant.com
- Security Team: security@moneyplant.com

---

## Appendix

### Useful Commands Reference

```bash
# Quick health check
kubectl get pods -n moneyplant -l app=ingestion-engine
curl -s http://api.moneyplant.com/engines/actuator/health | jq .

# View logs
kubectl logs -f deployment/ingestion-engine -n moneyplant --tail=100

# Get metrics
curl -s http://api.moneyplant.com/engines/actuator/metrics | jq .

# Scale deployment
kubectl scale deployment ingestion-engine --replicas=5 -n moneyplant

# Restart deployment
kubectl rollout restart deployment/ingestion-engine -n moneyplant

# Rollback deployment
kubectl rollout undo deployment/ingestion-engine -n moneyplant

# Port forward for debugging
kubectl port-forward -n moneyplant deployment/ingestion-engine 8081:8081

# Execute command in pod
kubectl exec -it -n moneyplant deployment/ingestion-engine -- /bin/sh

# Check database
psql -h prod-timescaledb.example.com -U postgres -d MoneyPlant

# Check Kafka
kafka-topics --bootstrap-server prod-kafka:9092 --list
kafka-consumer-groups --bootstrap-server prod-kafka:9092 --describe --group ingestion-engine
```

### Runbook Maintenance

This runbook should be reviewed and updated:
- After each incident
- After major deployments
- Quarterly as part of regular maintenance
- When infrastructure changes

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintained By**: MoneyPlant SRE Team

---

**End of Runbook**
