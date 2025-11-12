# Multi-stage Dockerfile for MoneyPlant Ingestion Engine
# Stage 1: Build stage with Maven
FROM eclipse-temurin:21-jdk-alpine AS builder

# Set working directory
WORKDIR /build

# Install Maven
RUN apk add --no-cache maven

# Copy Maven configuration files
COPY pom.xml .

# Download dependencies (cached layer)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN mvn clean package -DskipTests -B && \
    # Extract JAR layers for better caching
    java -Djarmode=layertools -jar target/*.jar extract

# Stage 2: Runtime stage with optimized JRE
FROM eclipse-temurin:21-jre-alpine

# Metadata
LABEL maintainer="MoneyPlant Team"
LABEL description="MoneyPlant Ingestion Engine - Market Data Ingestion Service"
LABEL version="1.0.0"

# Set working directory
WORKDIR /app

# Install runtime dependencies (minimal)
RUN apk add --no-cache \
    curl \
    tzdata && \
    # Set timezone to IST
    cp /usr/share/zoneinfo/Asia/Kolkata /etc/localtime && \
    echo "Asia/Kolkata" > /etc/timezone && \
    # Cleanup
    rm -rf /var/cache/apk/*

# Create non-root user for security
RUN addgroup -S moneyplant && \
    adduser -S -G moneyplant -h /app moneyplant && \
    chown -R moneyplant:moneyplant /app

# Copy application layers from builder
COPY --from=builder --chown=moneyplant:moneyplant /build/dependencies/ ./
COPY --from=builder --chown=moneyplant:moneyplant /build/spring-boot-loader/ ./
COPY --from=builder --chown=moneyplant:moneyplant /build/snapshot-dependencies/ ./
COPY --from=builder --chown=moneyplant:moneyplant /build/application/ ./

# Switch to non-root user
USER moneyplant

# Expose application port
EXPOSE 8081

# Health check endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=3 \
    CMD curl -f http://localhost:8081/engines/actuator/health || exit 1

# JVM optimization flags for containerized environment
ENV JAVA_OPTS="-XX:+UseContainerSupport \
    -XX:MaxRAMPercentage=75.0 \
    -XX:InitialRAMPercentage=50.0 \
    -XX:+UseG1GC \
    -XX:+UseStringDeduplication \
    -XX:+OptimizeStringConcat \
    -Djava.security.egd=file:/dev/./urandom \
    -Dspring.profiles.active=prod"

# Run the application using Spring Boot's layered JAR approach
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS org.springframework.boot.loader.launch.JarLauncher"]
