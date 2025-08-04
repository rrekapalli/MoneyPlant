#!/bin/bash

echo "Building MoneyPlant for Production..."
echo "This will build the frontend and embed it into the backend"
echo ""

# Build frontend
echo "Building frontend..."
cd frontend
npm install
npm run build:prod

# Copy built frontend to backend static resources
echo "Copying frontend build to backend..."
mkdir -p ../backend/src/main/resources/static
cp -r dist/money-plant-frontend/* ../backend/src/main/resources/static/

# Build backend with embedded frontend
echo "Building backend with embedded frontend..."
cd ../backend
mvn clean package -DskipTests

echo ""
echo "Production build complete!"
echo "JAR file location: backend/target/moneyplant-backend-1.0-SNAPSHOT.jar"
echo "Run with: java -jar backend/target/moneyplant-backend-1.0-SNAPSHOT.jar" 