#!/bin/bash

# Script to build the Angular frontend and copy it to the static directory

# Store the absolute path to the project root
PROJECT_ROOT="$(dirname "$0")"
UI_DIR="$PROJECT_ROOT/src/main/moneyplant-app"

# Print paths for debugging
echo "Project root: $PROJECT_ROOT"
echo "UI directory: $UI_DIR"

# Check if UI directory exists
if [ ! -d "$UI_DIR" ]; then
  echo "UI directory not found: $UI_DIR"
  exit 1
fi

# Navigate to the UI directory
cd "$UI_DIR" || exit 1

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Run the build-chunked.js script
echo "Building Angular app with chunking model..."
node build-chunked.js

# Check if build was successful
if [ $? -ne 0 ]; then
  echo "Build failed"
  exit 1
fi

# Navigate back to the project root
cd "$PROJECT_ROOT" || exit 1

# Run the copy-frontend.sh script to copy the build output to the static directory
echo "Copying frontend files to static directory..."
# Get the absolute path to the copy-frontend.sh script
COPY_SCRIPT="/home/raja/IdeaProjects/MoneyPlant/moneyplant-app/copy-frontend.sh"
echo "Copy script path: $COPY_SCRIPT"
if [ -f "$COPY_SCRIPT" ]; then
  bash "$COPY_SCRIPT"
else
  echo "Error: copy-frontend.sh not found at $COPY_SCRIPT"
  ls -la
fi

echo "Frontend build and copy completed successfully!"
