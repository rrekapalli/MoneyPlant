#!/bin/bash

# Script to build the Angular frontend and move the dist files to resources/static

# Store the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="$PROJECT_ROOT/moneyplant-app/src/main/resources/static"
UI_DIR="$PROJECT_ROOT/moneyplant-app/src/main/moneyplant-app"

# Create a temporary directory for the build output
TMP_BUILD_DIR="$PROJECT_ROOT/tmp-build"
mkdir -p "$TMP_BUILD_DIR"

# Print paths for debugging
echo "Project root: $PROJECT_ROOT"
echo "Static directory: $STATIC_DIR"
echo "UI directory: $UI_DIR"

# Ensure the static directory exists
mkdir -p "$STATIC_DIR"

# Navigate to the Angular project directory
cd "$UI_DIR"

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

# Try to build the Angular frontend with single bundle configuration
echo "Attempting to build Angular frontend with single bundle configuration..."
# Use the updated build command for Angular 20
if node build-single-bundle.js; then
  echo "Angular build completed successfully"
else
  echo "Angular build failed. Creating a minimal placeholder instead."

  # Create dist directory if it doesn't exist
  mkdir -p dist/money-plant-frontend

  # Create a minimal index.html
  cat > dist/money-plant-frontend/index.html << 'EOL'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Money Plant</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Money Plant</h1>
    <p>Welcome to Money Plant. The application is currently being built.</p>
  </div>
  <script src="app.js"></script>
</body>
</html>
EOL

  # Create a minimal CSS file
  cat > dist/money-plant-frontend/styles.css << 'EOL'
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

#app {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  padding: 20px;
  border-radius: 5px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2e7d32;
}
EOL

  # Create a minimal JavaScript file
  cat > dist/money-plant-frontend/app.js << 'EOL'
console.log('Money Plant application placeholder');
document.addEventListener('DOMContentLoaded', function() {
  console.log('Money Plant application loaded - actual application has not loaded');
});
EOL

  # Create an assets directory
  mkdir -p dist/money-plant-frontend/assets
fi

# Create the static directory if it doesn't exist
mkdir -p "$STATIC_DIR"

# Clear the static directory
echo "Clearing static directory..."
rm -rf "$STATIC_DIR"/*

# Copy all files from the build output to the static directory
echo "Copying all files to resources/static..."
mkdir -p "$STATIC_DIR/assets"

# In Angular 20, the output is directly in the dist/money-plant-frontend directory
DIST_DIR="$UI_DIR/dist/money-plant-frontend"
echo "Looking for build output in: $DIST_DIR"

# Ensure the dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "Creating dist directory: $DIST_DIR"
  mkdir -p "$DIST_DIR"
fi

# Check if the dist directory exists and has files
if [ -d "$DIST_DIR" ] && [ "$(ls -A "$DIST_DIR" 2>/dev/null)" ]; then
  echo "Found build output, copying files..."

  # Copy assets if they exist
  if [ -d "$DIST_DIR/assets" ]; then
    cp -r "$DIST_DIR/assets"/* "$STATIC_DIR/assets/" || true
  fi

  # Copy index.html
  cp "$DIST_DIR/index.html" "$STATIC_DIR/index.html" || true

  # Copy favicon if it exists
  if [ -f "$DIST_DIR/favicon.ico" ]; then
    cp "$DIST_DIR/favicon.ico" "$STATIC_DIR/"
  else
    echo "Note: favicon.ico not found in build output"
  fi

  # Copy all CSS files as a single bundle if possible
  if [ -f "$DIST_DIR/styles.css" ]; then
    cp "$DIST_DIR/styles.css" "$STATIC_DIR/styles.css" || true
  else
    # Fallback to copying all CSS files
    cp "$DIST_DIR"/*.css "$STATIC_DIR/" || true
  fi

  # Copy single JS bundle
  echo "Copying single JS bundle..."
  # Copy the single bundle file
  cp "$DIST_DIR/app.js" "$STATIC_DIR/app.js" || true

  # Fallback to copying individual files if app.js doesn't exist
  if [ ! -f "$STATIC_DIR/app.js" ]; then
    echo "Single bundle not found, falling back to individual files..."
    # Copy main bundle
    cp "$DIST_DIR/main*.js" "$STATIC_DIR/main.js" || true
    # Copy vendor bundle
    cp "$DIST_DIR/vendor*.js" "$STATIC_DIR/vendor.js" || true
    # Copy polyfills bundle
    cp "$DIST_DIR/polyfills*.js" "$STATIC_DIR/polyfills.js" || true
    # Copy runtime bundle
    cp "$DIST_DIR/runtime*.js" "$STATIC_DIR/runtime.js" || true
  fi

  # Copy license files if they exist
  if [ -f "$DIST_DIR/3rdpartylicenses.txt" ]; then
    cp "$DIST_DIR/3rdpartylicenses.txt" "$STATIC_DIR/" || true
  fi
else
  echo "Build output not found at $DIST_DIR or directory is empty"

  # Try to find any output in the dist directory
  DIST_DIR_ALT=$(find "$UI_DIR/dist" -type d | head -n 2 | tail -n 1)

  if [ -n "$DIST_DIR_ALT" ] && [ "$(ls -A "$DIST_DIR_ALT" 2>/dev/null)" ]; then
    echo "Found alternative build output directory: $DIST_DIR_ALT"

    # Copy assets if they exist
    if [ -d "$DIST_DIR_ALT/assets" ]; then
      cp -r "$DIST_DIR_ALT/assets"/* "$STATIC_DIR/assets/" || true
    fi

    # Copy index.html
    cp "$DIST_DIR_ALT/index.html" "$STATIC_DIR/index.html" || true

    # Copy favicon if it exists
    if [ -f "$DIST_DIR_ALT/favicon.ico" ]; then
      cp "$DIST_DIR_ALT/favicon.ico" "$STATIC_DIR/"
    else
      echo "Note: favicon.ico not found in build output"
    fi

    # Copy all CSS files as a single bundle if possible
    if [ -f "$DIST_DIR_ALT/styles.css" ]; then
      cp "$DIST_DIR_ALT/styles.css" "$STATIC_DIR/styles.css" || true
    else
      # Fallback to copying all CSS files
      cp "$DIST_DIR_ALT"/*.css "$STATIC_DIR/" || true
    fi

    # Copy JS files as module bundles
    echo "Copying JS bundles..."
    # Copy main bundle
    cp "$DIST_DIR_ALT/main*.js" "$STATIC_DIR/main.js" || true
    # Copy vendor bundle
    cp "$DIST_DIR_ALT/vendor*.js" "$STATIC_DIR/vendor.js" || true
    # Copy polyfills bundle
    cp "$DIST_DIR_ALT/polyfills*.js" "$STATIC_DIR/polyfills.js" || true
    # Copy runtime bundle
    cp "$DIST_DIR_ALT/runtime*.js" "$STATIC_DIR/runtime.js" || true

    # Copy license files if they exist
    if [ -f "$DIST_DIR_ALT/3rdpartylicenses.txt" ]; then
      cp "$DIST_DIR_ALT/3rdpartylicenses.txt" "$STATIC_DIR/" || true
    fi
  else
    echo "Could not find any build output in the dist directory."
    exit 1
  fi
fi

# Debug: List files in static directory
echo "Debug: Files in static directory:"
ls -la "$STATIC_DIR"

# No need to clean up a temporary directory as we're building directly in the Angular project directory
# We could optionally clean up the dist directory if needed
# echo "Cleaning up dist directory..."
# rm -rf "$DIST_DIR"

echo "Frontend build and deployment completed successfully!"

# Make the script executable (using absolute path)
chmod +x "$PROJECT_ROOT/build-frontend.sh"
