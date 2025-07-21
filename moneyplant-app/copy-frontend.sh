#!/bin/bash

# Script to copy the Angular frontend files to the static directory

# Store the absolute path to the project root
PROJECT_ROOT="$(dirname "$0")"
STATIC_DIR="$PROJECT_ROOT/src/main/resources/static"
UI_DIR="$PROJECT_ROOT/src/main/java/com/moneyplant/ui"
BROWSER_DIR="$UI_DIR/dist/browser"

# Print paths for debugging
echo "Project root: $PROJECT_ROOT"
echo "Static directory: $STATIC_DIR"
echo "UI directory: $UI_DIR"
echo "Browser directory: $BROWSER_DIR"

# Ensure the static directory exists
mkdir -p "$STATIC_DIR"

# Clear the static directory
echo "Clearing static directory..."
rm -rf "$STATIC_DIR"/*

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
  cp "$BROWSER_DIR"/*.css "$STATIC_DIR/" || true
  
  # Copy index.html
  echo "Copying index.html..."
  cp "$BROWSER_DIR/index.html" "$STATIC_DIR/index.html" || true
  
  # Copy JavaScript files
  echo "Copying JavaScript files..."
  cp "$BROWSER_DIR"/*.js "$STATIC_DIR/" || true
else
  echo "Browser directory not found, searching for alternatives..."
  # Try to find any browser directory under dist
  BROWSER_DIR_ALT=$(find "$UI_DIR/dist" -type d -name "browser" | head -n 1)
  if [ -n "$BROWSER_DIR_ALT" ]; then
    echo "Found alternative browser directory: $BROWSER_DIR_ALT"
    BROWSER_DIR="$BROWSER_DIR_ALT"
    
    # Copy assets if they exist
    if [ -d "$BROWSER_DIR/assets" ]; then
      echo "Copying assets..."
      mkdir -p "$STATIC_DIR/assets"
      cp -r "$BROWSER_DIR/assets"/* "$STATIC_DIR/assets/" || true
    fi
    
    # Copy CSS files
    echo "Copying CSS files..."
    cp "$BROWSER_DIR"/*.css "$STATIC_DIR/" || true
    
    # Copy index.html
    echo "Copying index.html..."
    cp "$BROWSER_DIR/index.html" "$STATIC_DIR/index.html" || true
    
    # Copy JavaScript files
    echo "Copying JavaScript files..."
    cp "$BROWSER_DIR"/*.js "$STATIC_DIR/" || true
  else
    echo "No browser directory found, cannot copy files."
    exit 1
  fi
fi

# List files in static directory
echo "Files in static directory:"
ls -la "$STATIC_DIR"

echo "Frontend files copied successfully!"