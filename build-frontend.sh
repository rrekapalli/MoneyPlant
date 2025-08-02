#!/bin/bash

# Simple script to copy files from the Angular dist folder to resources/static

# Store the absolute path to the project root
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
STATIC_DIR="$PROJECT_ROOT/moneyplant-app/src/main/resources/static"
DIST_DIR="$PROJECT_ROOT/moneyplant-app/src/main/moneyplant-app/dist/money-plant-frontend"
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

# Check if the browser directory exists and has files (Angular 20+ structure)
if [ -d "$BROWSER_DIR" ] && [ "$(ls -A "$BROWSER_DIR" 2>/dev/null)" ]; then
  echo "Found files in browser directory, copying from: $BROWSER_DIR"
  cp -r "$BROWSER_DIR"/* "$STATIC_DIR/"
# Check if the dist directory exists and has files (older Angular structure)
elif [ -d "$DIST_DIR" ] && [ "$(ls -A "$DIST_DIR" 2>/dev/null)" ]; then
  echo "Found files in dist directory, copying from: $DIST_DIR"
  cp -r "$DIST_DIR"/* "$STATIC_DIR/"
else
  echo "Error: No files found in either $BROWSER_DIR or $DIST_DIR"
  echo "Make sure to build the Angular app before running this script"
  exit 1
fi

# Debug: List files in static directory
echo "Files copied to static directory:"
ls -la "$STATIC_DIR"

echo "Frontend files copied successfully!"

# Make the script executable
chmod +x "$PROJECT_ROOT/build-frontend.sh"
