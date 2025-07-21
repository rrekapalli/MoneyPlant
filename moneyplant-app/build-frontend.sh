#!/bin/bash

# Script to build the Angular frontend and move the dist files to resources/static

# Store the absolute path to the project root
PROJECT_ROOT="$(dirname "$0")"
STATIC_DIR="$PROJECT_ROOT/src/main/resources/static"
UI_DIR="$PROJECT_ROOT/src/main/java/com/moneyplant/ui"

# Remove any redundant static directory under UI_DIR if it exists
echo "Removing redundant static directory under UI_DIR if it exists..."
rm -rf "$UI_DIR/src/main/resources/static"

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

# Modify angular.json to optimize bundling
echo "Modifying angular.json for optimized bundling..."
# Create a backup of the original file
cp angular.json angular.json.bak

# Try to update the configuration for single bundle
# This is a safer approach that works with Angular 16+
jq '.projects["money-plant-frontend"].architect.build.configurations.production += {"outputHashing": "all", "sourceMap": false}' angular.json > angular.json.tmp
if [ $? -eq 0 ]; then
  mv angular.json.tmp angular.json
  echo "Successfully updated angular.json"
else
  echo "Failed to update angular.json with jq, using original file"
  mv angular.json.bak angular.json
fi

# Build the Angular frontend
echo "Building Angular frontend..."
npm run build --legacy-peer-deps

# Create the static directory if it doesn't exist
mkdir -p "$STATIC_DIR"

# Clear the static directory
echo "Clearing static directory..."
rm -rf "$STATIC_DIR"/*

# Copy all files to the static directory first
echo "Copying all files to resources/static..."
mkdir -p "$STATIC_DIR/assets"
cp -r dist/money-plant-frontend/browser/assets/* "$STATIC_DIR/assets/" || true
cp dist/money-plant-frontend/browser/*.css "$STATIC_DIR/" || true
cp dist/money-plant-frontend/3rdpartylicenses.txt "$STATIC_DIR/" || true
cp dist/money-plant-frontend/prerendered-routes.json "$STATIC_DIR/" || true

# Copy the index.html
cp dist/money-plant-frontend/browser/index.html "$STATIC_DIR/index.html" || true

# Create a single bundle from all JavaScript files
echo "Creating a single bundle from all JavaScript files..."
# First, find all JS files and create a list
find dist/money-plant-frontend/browser -name "*.js" > js_files.txt
echo "JavaScript files found:"
cat js_files.txt
echo "Total files: $(wc -l < js_files.txt)"

# Then concatenate them into a single file
if [ -s js_files.txt ]; then
  echo "Found JavaScript files, creating bundle..."

  # Create a temporary directory for processing
  mkdir -p temp_js

  # Copy all JS files to the temp directory with numbered prefixes
  counter=0
  while IFS= read -r file; do
    counter=$((counter+1))
    cp "$file" "temp_js/${counter}_$(basename "$file")"
    echo "Copied $file to temp_js/${counter}_$(basename "$file")"
  done < js_files.txt

  # Concatenate all files in order
  echo "Concatenating files..."
  cat temp_js/* > "$STATIC_DIR/app.js"

  # Check if app.js was created successfully
  if [ -f "$STATIC_DIR/app.js" ]; then
    echo "app.js created successfully. Size: $(du -h "$STATIC_DIR/app.js" | cut -f1)"

    # Modify the index.html to use the single bundle
    echo "Modifying index.html to use single bundle..."
    # Create a backup of the original file
    cp "$STATIC_DIR/index.html" "$STATIC_DIR/index.html.bak"

    # Replace all script tags with a single script tag for app.js
    sed -i 's/<script src="[^"]*\.js[^"]*"><\/script>/<script src="app.js"><\/script>/g' "$STATIC_DIR/index.html"
    # Remove duplicate script tags, keeping only the first one
    sed -i '0,/<script src="app.js"><\/script>/!s/<script src="app.js"><\/script>//g' "$STATIC_DIR/index.html"

    echo "Single bundle created successfully."
  else
    echo "Failed to create app.js. Falling back to individual files."
    # Copy all JS files individually as a fallback
    cp dist/money-plant-frontend/browser/*.js "$STATIC_DIR/" || true
  fi

  # Clean up temp directory
  rm -rf temp_js
else
  echo "No JavaScript files found in the build output."
  # Copy all JS files individually as a fallback
  cp dist/money-plant-frontend/browser/*.js "$STATIC_DIR/" || true
fi

# Clean up
rm -f js_files.txt

# Ensure the browser directory is completely removed from static
echo "Ensuring browser directory is removed from static..."
# Force removal regardless of whether the directory exists
rm -rf "$STATIC_DIR/browser"

# Double check with a different command to make sure it's gone
echo "Double checking browser directory removal..."
# Use find to locate any browser directories and remove them
find "$STATIC_DIR" -name "browser" -type d -exec rm -rf {} \; 2>/dev/null || true

# Triple check by directly removing the directory again
echo "Triple checking browser directory removal..."
cd "$STATIC_DIR" && rm -rf browser

# Final cleanup of any redundant static directory under UI_DIR
echo "Final cleanup of any redundant static directory under UI_DIR..."
rm -rf "$UI_DIR/src/main/resources/static"

echo "Frontend build and deployment completed successfully!"
