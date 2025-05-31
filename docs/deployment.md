# MoneyPlant Deployment Guide

This document provides instructions for deploying the MoneyPlant application to different environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
  - [Local Development](#local-development)
  - [Docker Deployment](#docker-deployment)
  - [Kubernetes Deployment](#kubernetes-deployment)
  - [Cloud Deployment](#cloud-deployment)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Monitoring and Logging](#monitoring-and-logging)
- [Backup and Recovery](#backup-and-recovery)
- [Scaling](#scaling)
- [Continuous Integration/Continuous Deployment](#continuous-integrationcontinuous-deployment)

## Prerequisites

Before deploying MoneyPlant, ensure you have the following:

- Java 21 or higher
- Maven 3.8 or higher
- Docker and Docker Compose (for containerized deployment)
- Kubernetes (for orchestrated deployment)
- PostgreSQL database
- RabbitMQ message broker
- Zipkin (for distributed tracing)

## Environment Setup

### Development Environment

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/money-plant.git
   cd money-plant
   ```

2. Build the project:
   ```bash
   mvn clean package
   ```

3. Set up environment variables:
   ```bash
   # Windows
   set SPRING_PROFILES_ACTIVE=dev
   
   # Linux/macOS
   export SPRING_PROFILES_ACTIVE=dev
   ```

### Test Environment

1. Build the project with the test profile:
   ```bash
   mvn clean package -P test
   ```

2. Set up environment variables:
   ```bash
   # Windows
   set SPRING_PROFILES_ACTIVE=test
   
   # Linux/macOS
   export SPRING_PROFILES_ACTIVE=test
   ```

### Production Environment

1. Build the project with the production profile:
   ```bash
   mvn clean package -P prod
   ```

2. Set up environment variables:
   ```bash
   # Windows
   set SPRING_PROFILES_ACTIVE=prod
   
   # Linux/macOS
   export SPRING_PROFILES_ACTIVE=prod
   ```

## Deployment Options

### Local Development

1. Start the services in the following order:
   - Config Server
   - Discovery Server
   - Other services
   - API Gateway

   ```bash
   # Example for starting the Config Server
   cd config-server
   mvn spring-boot:run
   ```

### Docker Deployment

1. Build Docker images for all services:
   ```bash
   mvn clean package jib:build
   ```

2. Create a `docker-compose.yml` file:
   ```yaml
   version: '3.8'
   services:
     config-server:
       image: rrekapalli/money-plant:config-server
       ports:
         - "8888:8888"
       environment:
         - SPRING_PROFILES_ACTIVE=docker
     
     discovery-server:
       image: rrekapalli/money-plant:discovery-server
       ports:
         - "8761:8761"
       environment:
         - SPRING_PROFILES_ACTIVE=docker
       depends_on:
         - config-server
     
     # Add other services here
     
     api-gateway:
       image: rrekapalli/money-plant:api-gateway
       ports:
         - "8080:8080"
       environment:
         - SPRING_PROFILES_ACTIVE=docker
       depends_on:
         - discovery-server
         - config-server
   ```

3. Start the services:
   ```bash
   docker-compose up -d
   ```

### Kubernetes Deployment

1. Create Kubernetes deployment manifests for each service:

   **config-server.yaml**:
   ```yaml
   apiVersion: apps/v1
   kind: Deployment
   metadata:
     name: config-server
   spec:
     replicas: 1
     selector:
       matchLabels:
         app: config-server
     template:
       metadata:
         labels:
           app: config-server
       spec:
         containers:
         - name: config-server
           image: rrekapalli/money-plant:config-server
           ports:
           - containerPort: 8888
           env:
           - name: SPRING_PROFILES_ACTIVE
             value: "k8s"
   ---
   apiVersion: v1
   kind: Service
   metadata:
     name: config-server
   spec:
     selector:
       app: config-server
     ports:
     - port: 8888
       targetPort: 8888
   ```

2. Apply the manifests:
   ```bash
   kubectl apply -f kubernetes/
   ```

### Cloud Deployment

#### AWS

1. Create an Elastic Container Registry (ECR) repository
2. Push Docker images to ECR
3. Deploy using ECS or EKS

#### Azure

1. Create an Azure Container Registry (ACR)
2. Push Docker images to ACR
3. Deploy using Azure Kubernetes Service (AKS)

#### Google Cloud

1. Create a Google Container Registry (GCR) repository
2. Push Docker images to GCR
3. Deploy using Google Kubernetes Engine (GKE)

## Configuration

### Config Server Setup

1. Configure the Config Server to use a Git repository:
   ```yaml
   spring:
     cloud:
       config:
         server:
           git:
             uri: https://github.com/yourusername/money-plant-config.git
             search-paths: '{application}'
             default-label: main
   ```

2. Secure sensitive configuration with encryption:
   ```yaml
   encrypt:
     key: your-encryption-key
   ```

### Environment-Specific Configuration

Create environment-specific configuration files in the config repository:

- `application-dev.properties`
- `application-test.properties`
- `application-prod.properties`

## Database Setup

### PostgreSQL Setup

1. Create databases for each service:
   ```sql
   CREATE DATABASE portfolio_service;
   CREATE DATABASE stock_service;
   CREATE DATABASE transaction_service;
   CREATE DATABASE watchlist_service;
   ```

2. Create a dedicated user for the application:
   ```sql
   CREATE USER moneyplant WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE portfolio_service TO moneyplant;
   GRANT ALL PRIVILEGES ON DATABASE stock_service TO moneyplant;
   GRANT ALL PRIVILEGES ON DATABASE transaction_service TO moneyplant;
   GRANT ALL PRIVILEGES ON DATABASE watchlist_service TO moneyplant;
   ```

### Database Migration

MoneyPlant uses Flyway for database migrations:

1. Place migration scripts in `src/main/resources/db/migration`
2. Follow the naming convention: `V{version}__{description}.sql`
3. Migrations run automatically on application startup

## Monitoring and Logging

### Prometheus and Grafana Setup

1. Deploy Prometheus and Grafana:
   ```bash
   kubectl apply -f monitoring/
   ```

2. Configure Prometheus to scrape metrics from MoneyPlant services

3. Import Grafana dashboards for monitoring

### Centralized Logging with ELK Stack

1. Deploy Elasticsearch, Logstash, and Kibana
2. Configure Logstash to collect logs from MoneyPlant services
3. Create Kibana dashboards for log visualization

## Backup and Recovery

### Database Backup

1. Set up automated PostgreSQL backups:
   ```bash
   pg_dump -U postgres -d portfolio_service > portfolio_backup_$(date +%Y%m%d).sql
   ```

2. Store backups in a secure location (e.g., S3, Azure Blob Storage)

### Disaster Recovery

1. Create a disaster recovery plan
2. Test the recovery process regularly
3. Document the recovery procedures

## Scaling

### Horizontal Scaling

1. Increase the number of replicas in Kubernetes:
   ```bash
   kubectl scale deployment portfolio-service --replicas=3
   ```

2. Configure auto-scaling:
   ```yaml
   apiVersion: autoscaling/v2
   kind: HorizontalPodAutoscaler
   metadata:
     name: portfolio-service
   spec:
     scaleTargetRef:
       apiVersion: apps/v1
       kind: Deployment
       name: portfolio-service
     minReplicas: 2
     maxReplicas: 5
     metrics:
     - type: Resource
       resource:
         name: cpu
         target:
           type: Utilization
           averageUtilization: 70
   ```

### Vertical Scaling

Adjust resource limits in Kubernetes deployment manifests:
```yaml
resources:
  requests:
    memory: "512Mi"
    cpu: "500m"
  limits:
    memory: "1Gi"
    cpu: "1000m"
```

## Continuous Integration/Continuous Deployment

### GitHub Actions CI/CD Pipeline

Create a `.github/workflows/ci-cd.yml` file:
```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven
    - name: Build with Maven
      run: mvn clean package
    - name: Run tests
      run: mvn test
    
  deploy:
    needs: build
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 21
      uses: actions/setup-java@v3
      with:
        java-version: '21'
        distribution: 'temurin'
        cache: maven
    - name: Build and push Docker images
      run: mvn clean package jib:build
```

### Jenkins Pipeline

Create a `Jenkinsfile`:
```groovy
pipeline {
    agent any
    
    stages {
        stage('Build') {
            steps {
                sh 'mvn clean package'
            }
        }
        
        stage('Test') {
            steps {
                sh 'mvn test'
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'mvn clean package jib:build'
                sh 'kubectl apply -f kubernetes/'
            }
        }
    }
}
```