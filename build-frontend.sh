#!/bin/bash

# Script to build Angular app and copy single bundle files to backend static resources

# Store the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="$PROJECT_ROOT/backend/src/main/resources/static"
DIST_DIR="$PROJECT_ROOT/frontend/dist/money-plant-frontend"
BROWSER_DIR="$DIST_DIR/browser"

# Print paths for debugging
echo "Project root: $PROJECT_ROOT"
echo "Static directory: $STATIC_DIR"
echo "Dist directory: $DIST_DIR"
echo "Browser directory: $BROWSER_DIR"

# Ensure the static directory exists
mkdir -p "$STATIC_DIR"

# Clear the static directory
echo "Clearing static directory..."
rm -rf "$STATIC_DIR"/*

# Always build the Angular app to ensure latest changes are included
echo "Building Angular app..."
cd "$PROJECT_ROOT/frontend"
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
  cd "$PROJECT_ROOT/frontend"
fi

cd "$PROJECT_ROOT"

# Check if the browser directory exists and has files (Angular 20+ structure)
if [ -d "$BROWSER_DIR" ] && [ "$(ls -A "$BROWSER_DIR" 2>/dev/null)" ]; then
  echo "Found files in browser directory, copying single bundle files from: $BROWSER_DIR"
  # Copy only the single bundle files
  cp "$BROWSER_DIR"/main.js "$STATIC_DIR/" 2>/dev/null || echo "main.js not found"
  cp "$BROWSER_DIR"/polyfills.js "$STATIC_DIR/" 2>/dev/null || echo "polyfills.js not found"
  cp "$BROWSER_DIR"/styles.css "$STATIC_DIR/" 2>/dev/null || echo "styles.css not found"
  cp "$BROWSER_DIR"/index.html "$STATIC_DIR/" 2>/dev/null || echo "index.html not found"
  cp "$BROWSER_DIR"/favicon.ico "$STATIC_DIR/" 2>/dev/null || echo "favicon.ico not found"
# Check if the dist directory exists and has files (older Angular structure)
elif [ -d "$DIST_DIR" ] && [ "$(ls -A "$DIST_DIR" 2>/dev/null)" ]; then
  echo "Found files in dist directory, copying single bundle files from: $DIST_DIR"
  # Copy only the single bundle files
  cp "$DIST_DIR"/main.js "$STATIC_DIR/" 2>/dev/null || echo "main.js not found"
  cp "$DIST_DIR"/polyfills.js "$STATIC_DIR/" 2>/dev/null || echo "polyfills.js not found"
  cp "$DIST_DIR"/styles.css "$STATIC_DIR/" 2>/dev/null || echo "styles.css not found"
  cp "$DIST_DIR"/index.html "$STATIC_DIR/" 2>/dev/null || echo "index.html not found"
  cp "$DIST_DIR"/favicon.ico "$STATIC_DIR/" 2>/dev/null || echo "favicon.ico not found"
else
  echo "Error: No files found in either $BROWSER_DIR or $DIST_DIR"
  echo "Make sure to build the Angular app before running this script"
  exit 1
fi

# Copy assets from source to static directory
echo "Copying assets..."
if [ -d "$PROJECT_ROOT/frontend/src/assets" ]; then
  cp -r "$PROJECT_ROOT/frontend/src/assets" "$STATIC_DIR/"
  echo "Assets copied successfully"
else
  echo "Assets directory not found in frontend/src"
fi

# Remove chunk references from main.js and index.html to prevent 404 errors
echo "Removing chunk references from main.js and index.html..."
if [ -f "$STATIC_DIR/main.js" ]; then
  sed -i 's/import"\.\/chunk-[A-Z0-9]*\.js";//g' "$STATIC_DIR/main.js"
  echo "Chunk references removed from main.js"
else
  echo "main.js not found, skipping chunk removal"
fi

if [ -f "$STATIC_DIR/index.html" ]; then
  sed -i 's/<link rel="modulepreload" href="chunk-[A-Z0-9]*\.js">//g' "$STATIC_DIR/index.html"
  echo "Chunk references removed from index.html"
else
  echo "index.html not found, skipping chunk removal"
fi

# Debug: List files in static directory
echo "Files copied to static directory:"
ls -la "$STATIC_DIR"

echo "Frontend files copied successfully!"

# Make the script executable
chmod +x "$PROJECT_ROOT/build-frontend.sh"
