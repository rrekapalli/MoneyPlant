#!/bin/bash

echo "Starting MoneyPlant Backend in Development Mode..."
echo "Backend will be available at: http://localhost:8080"
echo "API Documentation: http://localhost:8080/swagger-ui.html"
echo ""

cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev 