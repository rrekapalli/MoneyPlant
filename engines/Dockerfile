FROM openjdk:21-jdk-slim

# Set working directory
WORKDIR /app

# Install necessary packages
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    && rm -rf /var/lib/apt/lists/*

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Make Maven wrapper executable
RUN chmod +x mvnw

# Download dependencies
RUN ./mvnw dependency:go-offline -B

# Copy source code
COPY src src

# Build the application
RUN ./mvnw clean package -DskipTests

# Create runtime image
FROM openjdk:21-jre-slim

# Set working directory
WORKDIR /app

# Install necessary runtime packages
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy the built JAR file
COPY --from=0 /app/target/*.jar app.jar

# Create non-root user
RUN groupadd -r moneyplant && useradd -r -g moneyplant moneyplant
RUN chown -R moneyplant:moneyplant /app
USER moneyplant

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8081/engines/actuator/health || exit 1

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]
