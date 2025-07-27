#!/bin/bash

# Script to copy the Angular frontend files from the browser directory to the static directory

# Store the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="$PROJECT_ROOT/src/main/resources/static"
BROWSER_DIR="$PROJECT_ROOT/src/main/moneyplant-app/src/main/java/com/moneyplant/ui/dist/browser"

# Print paths for debugging
echo "Project root: $PROJECT_ROOT"
echo "Static directory: $STATIC_DIR"
echo "Browser directory: $BROWSER_DIR"

# Ensure the static directory exists
mkdir -p "$STATIC_DIR"

# Check if browser directory exists
if [ -d "$BROWSER_DIR" ]; then
  echo "Found browser directory, copying files..."

  # Copy assets if they exist
  if [ -d "$BROWSER_DIR/assets" ]; then
    echo "Copying assets..."
    mkdir -p "$STATIC_DIR/assets"
    cp -r "$BROWSER_DIR/assets"/* "$STATIC_DIR/assets/" || true
  fi

  # Copy CSS files
  echo "Copying CSS files..."
  cp "$BROWSER_DIR"/*.css "$STATIC_DIR/styles.css" || true

  # Copy main JavaScript file
  echo "Copying main JavaScript file..."
  cp "$BROWSER_DIR/main-"*.js "$STATIC_DIR/main.js" || true

  # Copy polyfills JavaScript file
  echo "Copying polyfills JavaScript file..."
  cp "$BROWSER_DIR/polyfills-"*.js "$STATIC_DIR/polyfills.js" || true

  # Copy chunk JavaScript files
  echo "Copying chunk JavaScript files..."
  cp "$BROWSER_DIR/chunk-"*.js "$STATIC_DIR/" || true

  # List files in static directory
  echo "Files in static directory:"
  ls -la "$STATIC_DIR"

  echo "Angular files copied successfully!"
else
  echo "Browser directory not found: $BROWSER_DIR"
  exit 1
fi

# Make the script executable
chmod +x "$PROJECT_ROOT/copy-angular-files.sh"