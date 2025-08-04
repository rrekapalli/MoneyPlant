#!/bin/bash

echo "Starting MoneyPlant Backend in Development Mode..."
echo "Backend will be available at: http://localhost:8080"
echo "API Documentation: http://localhost:8080/swagger-ui.html"
echo "Health Check: http://localhost:8080/actuator/health"
echo ""

cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev 