#!/bin/bash

echo "Building MoneyPlant for Production..."
echo "This will build the frontend and embed it into the backend"
echo ""

# Build frontend
echo "Building frontend as single bundle..."
cd frontend
# Clean dist directory to ensure fresh build
rm -rf dist/
npm install
npm run build:single

# Clean up chunk files to keep only single bundle files
echo "Cleaning up chunk files..."
if [ -d "dist/money-plant-frontend/browser" ]; then
  cd dist/money-plant-frontend/browser
  # Remove all chunk files, keep only essential files
  rm -f chunk-*.js
  rm -rf assets/ media/
  cd ../../..
fi

# Copy built frontend to backend static resources
echo "Copying single bundle frontend to backend..."
mkdir -p ../backend/src/main/resources/static
# Copy only the single bundle files
cp dist/money-plant-frontend/browser/main.js ../backend/src/main/resources/static/ 2>/dev/null || echo "main.js not found"
cp dist/money-plant-frontend/browser/polyfills.js ../backend/src/main/resources/static/ 2>/dev/null || echo "polyfills.js not found"
cp dist/money-plant-frontend/browser/styles.css ../backend/src/main/resources/static/ 2>/dev/null || echo "styles.css not found"
cp dist/money-plant-frontend/browser/index.html ../backend/src/main/resources/static/ 2>/dev/null || echo "index.html not found"
cp dist/money-plant-frontend/browser/favicon.ico ../backend/src/main/resources/static/ 2>/dev/null || echo "favicon.ico not found"

# Copy assets from source to static directory
echo "Copying assets..."
if [ -d "../frontend/src/assets" ]; then
  cp -r "../frontend/src/assets" "../backend/src/main/resources/static/"
  echo "Assets copied successfully"
else
  echo "Assets directory not found in frontend/src"
fi

# Remove chunk references from main.js and index.html to prevent 404 errors
echo "Removing chunk references from main.js and index.html..."
if [ -f "../backend/src/main/resources/static/main.js" ]; then
  sed -i 's/import"\.\/chunk-[A-Z0-9]*\.js";//g' "../backend/src/main/resources/static/main.js"
  echo "Chunk references removed from main.js"
else
  echo "main.js not found, skipping chunk removal"
fi

if [ -f "../backend/src/main/resources/static/index.html" ]; then
  sed -i 's/<link rel="modulepreload" href="chunk-[A-Z0-9]*\.js">//g' "../backend/src/main/resources/static/index.html"
  echo "Chunk references removed from index.html"
else
  echo "index.html not found, skipping chunk removal"
fi

# Build backend with embedded frontend
echo "Building backend with embedded frontend..."
cd ../backend
mvn clean package -DskipTests

echo ""
echo "Production build complete!"
echo "JAR file location: backend/target/moneyplant-backend-1.0-SNAPSHOT.jar"
echo "Run with: java -jar backend/target/moneyplant-backend-1.0-SNAPSHOT.jar" 