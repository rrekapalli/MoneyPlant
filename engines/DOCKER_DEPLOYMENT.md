# Docker Deployment Guide - Ingestion Engine

This guide provides instructions for building and deploying the MoneyPlant Ingestion Engine using Docker.

## Prerequisites

- Docker 20.10 or higher
- Docker Compose 2.0 or higher
- At least 4GB of available RAM
- 10GB of available disk space

## Quick Start

### 1. Build the Docker Image

```bash
# Build the image
docker build -t moneyplant/ingestion-engine:latest .

# Verify the image size (should be < 500MB)
docker images moneyplant/ingestion-engine:latest
```

### 2. Run with Docker Compose

```bash
# Start all services (Ingestion Engine, TimescaleDB, MinIO, Kafka)
docker-compose -f docker-compose.ingestion.yml up -d

# Check service status
docker-compose -f docker-compose.ingestion.yml ps

# View logs
docker-compose -f docker-compose.ingestion.yml logs -f ingestion-engine
```

### 3. Stop Services

```bash
# Stop all services
docker-compose -f docker-compose.ingestion.yml down

# Stop and remove volumes (WARNING: This will delete all data)
docker-compose -f docker-compose.ingestion.yml down -v
```

## Configuration

### Environment Variables

Create a `.env` file in the `engines` directory with the following variables:

```bash
# Spring Profile (dev, prod)
SPRING_PROFILES_ACTIVE=prod

# TimescaleDB Configuration
TIMESCALEDB_USERNAME=postgres
TIMESCALEDB_PASSWORD=your_secure_password

# Kafka Configuration
KAFKA_BOOTSTRAP_SERVERS=kafka:9092
KAFKA_SCHEMA_REGISTRY_URL=http://schema-registry:8081

# Hudi S3/MinIO Configuration
HUDI_S3_ENDPOINT=http://minio:9000
HUDI_S3_ACCESS_KEY=minioadmin
HUDI_S3_SECRET_KEY=minioadmin
HUDI_S3_BUCKET=moneyplant-datalake

# Hive Metastore Configuration
HUDI_HIVE_METASTORE_ENABLED=true
HUDI_HIVE_METASTORE_URIS=thrift://hive-metastore:9083

# Ingestion Provider Configuration
INGESTION_NSE_ENABLED=true
INGESTION_NSE_RATE_LIMIT=1000
INGESTION_YAHOO_ENABLED=true
INGESTION_YAHOO_RATE_LIMIT=2000
```

### Custom Configuration

To use custom configuration files, mount them as volumes:

```yaml
volumes:
  - ./config/application-custom.yml:/app/config/application.yml
```

## Production Deployment

### 1. Build Optimized Image

```bash
# Build with build arguments
docker build \
  --build-arg MAVEN_OPTS="-Xmx1024m" \
  --tag moneyplant/ingestion-engine:1.0.0 \
  --tag moneyplant/ingestion-engine:latest \
  .
```

### 2. Push to Registry

```bash
# Tag for your registry
docker tag moneyplant/ingestion-engine:latest your-registry.com/moneyplant/ingestion-engine:latest

# Push to registry
docker push your-registry.com/moneyplant/ingestion-engine:latest
```

### 3. Deploy to Production

```bash
# Pull the latest image
docker pull your-registry.com/moneyplant/ingestion-engine:latest

# Run with production configuration
docker run -d \
  --name moneyplant-ingestion-engine \
  --restart unless-stopped \
  -p 8081:8081 \
  -e SPRING_PROFILES_ACTIVE=prod \
  -e TIMESCALEDB_URL=jdbc:postgresql://your-db-host:5432/MoneyPlant \
  -e TIMESCALEDB_USERNAME=postgres \
  -e TIMESCALEDB_PASSWORD=your_secure_password \
  -e KAFKA_BOOTSTRAP_SERVERS=your-kafka-host:9092 \
  -e HUDI_S3_ENDPOINT=https://s3.amazonaws.com \
  -e HUDI_S3_ACCESS_KEY=your_access_key \
  -e HUDI_S3_SECRET_KEY=your_secret_key \
  -v /var/log/moneyplant:/app/logs \
  your-registry.com/moneyplant/ingestion-engine:latest
```

## Health Checks

### Check Application Health

```bash
# Health endpoint
curl http://localhost:8081/engines/actuator/health

# Metrics endpoint
curl http://localhost:8081/engines/actuator/metrics

# Prometheus metrics
curl http://localhost:8081/engines/actuator/prometheus
```

### Check Container Health

```bash
# View container health status
docker inspect --format='{{.State.Health.Status}}' moneyplant-ingestion-engine

# View health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' moneyplant-ingestion-engine
```

## Troubleshooting

### View Logs

```bash
# View real-time logs
docker logs -f moneyplant-ingestion-engine

# View last 100 lines
docker logs --tail 100 moneyplant-ingestion-engine

# View logs with timestamps
docker logs -t moneyplant-ingestion-engine
```

### Access Container Shell

```bash
# Access container shell
docker exec -it moneyplant-ingestion-engine sh

# Check Java version
docker exec moneyplant-ingestion-engine java -version

# Check running processes
docker exec moneyplant-ingestion-engine ps aux
```

### Common Issues

#### 1. Out of Memory

If the container runs out of memory, increase the memory limit:

```yaml
deploy:
  resources:
    limits:
      memory: 4G
```

#### 2. Connection Refused

Check if dependent services are running:

```bash
# Check TimescaleDB
docker exec moneyplant-timescaledb pg_isready

# Check Kafka
docker exec kafka kafka-broker-api-versions --bootstrap-server localhost:9092

# Check MinIO
curl http://localhost:9000/minio/health/live
```

#### 3. Slow Startup

Increase the health check start period:

```yaml
healthcheck:
  start_period: 60s
```

## Performance Tuning

### JVM Options

Customize JVM options via environment variables:

```bash
JAVA_OPTS="-XX:+UseContainerSupport \
  -XX:MaxRAMPercentage=75.0 \
  -XX:+UseG1GC \
  -XX:MaxGCPauseMillis=200 \
  -XX:+UseStringDeduplication \
  -Djava.security.egd=file:/dev/./urandom"
```

### Resource Limits

Adjust CPU and memory limits based on workload:

```yaml
deploy:
  resources:
    limits:
      cpus: '4.0'
      memory: 4G
    reservations:
      cpus: '2.0'
      memory: 2G
```

## Monitoring

### Prometheus Integration

Add Prometheus scrape configuration:

```yaml
scrape_configs:
  - job_name: 'ingestion-engine'
    metrics_path: '/engines/actuator/prometheus'
    static_configs:
      - targets: ['ingestion-engine:8081']
```

### Grafana Dashboard

Import the provided Grafana dashboard from `grafana/ingestion-engine-dashboard.json`.

## Security

### Non-Root User

The container runs as a non-root user (`moneyplant`) for security.

### Secrets Management

Use Docker secrets or Kubernetes secrets for sensitive data:

```bash
# Create secret
echo "your_password" | docker secret create db_password -

# Use secret in service
docker service create \
  --name ingestion-engine \
  --secret db_password \
  moneyplant/ingestion-engine:latest
```

## Backup and Recovery

### Backup TimescaleDB

```bash
# Backup database
docker exec moneyplant-timescaledb pg_dump -U postgres MoneyPlant > backup.sql

# Restore database
docker exec -i moneyplant-timescaledb psql -U postgres MoneyPlant < backup.sql
```

### Backup MinIO Data

```bash
# Backup MinIO data
docker exec moneyplant-minio mc mirror /data /backup

# Restore MinIO data
docker exec moneyplant-minio mc mirror /backup /data
```

## Upgrading

### Rolling Update

```bash
# Pull new image
docker pull moneyplant/ingestion-engine:latest

# Stop old container
docker stop moneyplant-ingestion-engine

# Remove old container
docker rm moneyplant-ingestion-engine

# Start new container
docker-compose -f docker-compose.ingestion.yml up -d ingestion-engine
```

### Zero-Downtime Update

Use Docker Swarm or Kubernetes for zero-downtime updates.

## Support

For issues and questions:
- GitHub Issues: https://github.com/moneyplant/ingestion-engine/issues
- Documentation: https://docs.moneyplant.com/ingestion-engine
- Email: support@moneyplant.com
