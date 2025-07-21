#!/bin/bash

# Script to build the Angular frontend and move the dist files to resources/static

# Store the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="$PROJECT_ROOT/moneyplant-app/src/main/resources/static"
UI_DIR="$PROJECT_ROOT/moneyplant-app/src/main/java/com/moneyplant/ui"

# Create a temporary directory for the build output
TMP_BUILD_DIR="$PROJECT_ROOT/tmp-build"
mkdir -p "$TMP_BUILD_DIR"

# Print paths for debugging
echo "Project root: $PROJECT_ROOT"
echo "Static directory: $STATIC_DIR"
echo "UI directory: $UI_DIR"

# Ensure the static directory exists
mkdir -p "$STATIC_DIR"

# Copy the Angular project to the temporary directory
echo "Copying Angular project to temporary directory..."
cp -r "$UI_DIR"/* "$TMP_BUILD_DIR/"

# Navigate to the temporary directory
cd "$TMP_BUILD_DIR"

# Install dependencies with legacy peer deps to handle version conflicts
echo "Installing dependencies..."
npm install --legacy-peer-deps

# Create a custom webpack configuration for single bundle
echo "Creating custom webpack configuration for single bundle..."
cat > webpack.config.js << 'EOL'
const path = require('path');

module.exports = {
  optimization: {
    runtimeChunk: false,
    splitChunks: false,
  },
};
EOL

# Build the Angular frontend with single bundle configuration
echo "Building Angular frontend with single bundle configuration..."
# Use the updated build command for Angular 20
node build-single-bundle.js

# Create the static directory if it doesn't exist
mkdir -p "$STATIC_DIR"

# Clear the static directory
echo "Clearing static directory..."
rm -rf "$STATIC_DIR"/*

# Copy all files from the build output to the static directory
echo "Copying all files to resources/static..."
mkdir -p "$STATIC_DIR/assets"

# In Angular 20, the output is in the dist/money-plant-frontend/browser directory
DIST_DIR="$TMP_BUILD_DIR/dist/money-plant-frontend"
BROWSER_DIR="$DIST_DIR/browser"
echo "Looking for build output in: $BROWSER_DIR"

# Ensure the dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "Creating dist directory: $DIST_DIR"
  mkdir -p "$DIST_DIR"
fi

# Check if the browser directory exists
if [ -d "$BROWSER_DIR" ]; then
  echo "Found browser directory, copying files..."

  # Copy assets if they exist
  if [ -d "$BROWSER_DIR/assets" ]; then
    cp -r "$BROWSER_DIR/assets"/* "$STATIC_DIR/assets/" || true
  fi

  # Copy index.html
  cp "$BROWSER_DIR/index.html" "$STATIC_DIR/index.html" || true

  # Copy favicon if it exists
  if [ -f "$BROWSER_DIR/favicon.ico" ]; then
    cp "$BROWSER_DIR/favicon.ico" "$STATIC_DIR/"
  else
    echo "Note: favicon.ico not found in build output"
  fi

  # Copy all CSS files as a single bundle if possible
  if [ -f "$BROWSER_DIR/styles.css" ]; then
    cp "$BROWSER_DIR/styles.css" "$STATIC_DIR/styles.css" || true
  else
    # Fallback to copying all CSS files
    cp "$BROWSER_DIR"/*.css "$STATIC_DIR/" || true
  fi

  # Copy single JS bundle
  echo "Copying single JS bundle..."
  # Copy the single bundle file
  cp "$BROWSER_DIR/app.js" "$STATIC_DIR/app.js" || true

  # Fallback to copying individual files if app.js doesn't exist
  if [ ! -f "$STATIC_DIR/app.js" ]; then
    echo "Single bundle not found, falling back to individual files..."
    # Copy main bundle
    cp "$BROWSER_DIR/main*.js" "$STATIC_DIR/main.js" || true
    # Copy vendor bundle
    cp "$BROWSER_DIR/vendor*.js" "$STATIC_DIR/vendor.js" || true
    # Copy polyfills bundle
    cp "$BROWSER_DIR/polyfills*.js" "$STATIC_DIR/polyfills.js" || true
    # Copy runtime bundle
    cp "$BROWSER_DIR/runtime*.js" "$STATIC_DIR/runtime.js" || true
  fi

  # Copy license files if they exist
  if [ -f "$DIST_DIR/3rdpartylicenses.txt" ]; then
    cp "$DIST_DIR/3rdpartylicenses.txt" "$STATIC_DIR/" || true
  fi
else
  echo "Browser directory not found at $BROWSER_DIR"

  # Try to find the browser directory
  BROWSER_DIR_ALT=$(find "$TMP_BUILD_DIR/dist" -type d -name "browser" | head -n 1)

  if [ -n "$BROWSER_DIR_ALT" ]; then
    echo "Found alternative browser directory: $BROWSER_DIR_ALT"

    # Copy assets if they exist
    if [ -d "$BROWSER_DIR_ALT/assets" ]; then
      cp -r "$BROWSER_DIR_ALT/assets"/* "$STATIC_DIR/assets/" || true
    fi

    # Copy index.html
    cp "$BROWSER_DIR_ALT/index.html" "$STATIC_DIR/index.html" || true

    # Copy favicon if it exists
    if [ -f "$BROWSER_DIR_ALT/favicon.ico" ]; then
      cp "$BROWSER_DIR_ALT/favicon.ico" "$STATIC_DIR/"
    else
      echo "Note: favicon.ico not found in build output"
    fi

    # Copy all CSS files as a single bundle if possible
    if [ -f "$BROWSER_DIR_ALT/styles.css" ]; then
      cp "$BROWSER_DIR_ALT/styles.css" "$STATIC_DIR/styles.css" || true
    else
      # Fallback to copying all CSS files
      cp "$BROWSER_DIR_ALT"/*.css "$STATIC_DIR/" || true
    fi

    # Copy JS files as module bundles
    echo "Copying JS bundles..."
    # Copy main bundle
    cp "$BROWSER_DIR_ALT/main*.js" "$STATIC_DIR/main.js" || true
    # Copy vendor bundle
    cp "$BROWSER_DIR_ALT/vendor*.js" "$STATIC_DIR/vendor.js" || true
    # Copy polyfills bundle
    cp "$BROWSER_DIR_ALT/polyfills*.js" "$STATIC_DIR/polyfills.js" || true
    # Copy runtime bundle
    cp "$BROWSER_DIR_ALT/runtime*.js" "$STATIC_DIR/runtime.js" || true

    # Copy license files if they exist
    if [ -f "$DIST_DIR/3rdpartylicenses.txt" ]; then
      cp "$DIST_DIR/3rdpartylicenses.txt" "$STATIC_DIR/" || true
    fi
  else
    echo "Could not find any browser directory in the build output."
    exit 1
  fi
fi

# Debug: List files in static directory
echo "Debug: Files in static directory:"
ls -la "$STATIC_DIR"

# Clean up the temporary directory
echo "Cleaning up temporary directory..."
rm -rf "$TMP_BUILD_DIR"

echo "Frontend build and deployment completed successfully!"

# Make the script executable (using absolute path)
chmod +x "$PROJECT_ROOT/build-frontend.sh"
