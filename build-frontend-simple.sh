#!/bin/bash

# Simple script to build Angular app and copy all files to backend static resources

PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="$PROJECT_ROOT/backend/src/main/resources/static"

echo "Building Angular app..."
cd "$PROJECT_ROOT/frontend"

# Clean and build
rm -rf dist/
npm install
npm run build:single

# Copy all built files to backend static resources
echo "Copying frontend files to backend..."
mkdir -p "$STATIC_DIR"
rm -rf "$STATIC_DIR"/*

# Copy everything from the browser directory
if [ -d "dist/money-plant-frontend/browser" ]; then
  cp -r dist/money-plant-frontend/browser/* "$STATIC_DIR/"
  echo "All files copied successfully"
else
  echo "Error: Browser directory not found"
  exit 1
fi

# Copy assets from source
if [ -d "src/assets" ]; then
  cp -r src/assets "$STATIC_DIR/"
  echo "Assets copied successfully"
fi

echo "Frontend build complete!"
echo "Files in static directory:"
ls -la "$STATIC_DIR"
