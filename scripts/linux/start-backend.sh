#!/bin/bash

echo "🚀 Starting MoneyPlant Backend in Development Mode..."
echo "Backend will be available at: http://localhost:8080"
echo "API Documentation: http://localhost:8080/swagger-ui.html"
echo "Health Check: http://localhost:8080/actuator/health"
echo ""

cd backend

# Check if .env file exists
if [ -f ".env" ]; then
    echo "📋 Loading environment variables from .env file..."
    # Load environment variables from .env file
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
else
    echo "⚠️  .env file not found. Creating one with default values..."
    ../scripts/linux/backend/setup-env.sh
    echo "📋 Loading environment variables from newly created .env file..."
    set -a  # automatically export all variables
    source .env
    set +a  # stop automatically exporting
fi

echo "✅ Environment variables loaded from .env file"
echo ""

# Verify critical environment variables
echo "🔍 Verifying environment variables:"
echo "DB_HOST: $DB_HOST"
echo "DB_PASSWORD: [HIDDEN]"
echo "MICROSOFT_CLIENT_ID: $MICROSOFT_CLIENT_ID"
echo "JWT_SECRET: [HIDDEN]"
echo ""

echo "🏃 Starting Spring Boot application..."
echo ""

mvn spring-boot:run -Dspring-boot.run.profiles=dev 