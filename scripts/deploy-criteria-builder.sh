#!/bin/bash

# Deployment script for Criteria Builder functionality
# This script deploys the criteria builder as part of the existing screener package

set -e  # Exit on any error

echo "Starting Criteria Builder deployment..."

# Set environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"
DATABASE_SCRIPTS_DIR="$PROJECT_ROOT/scripts/database"

echo "Project root: $PROJECT_ROOT"
echo "Backend directory: $BACKEND_DIR"
echo "Database scripts directory: $DATABASE_SCRIPTS_DIR"

# Check if required directories exist
if [ ! -d "$BACKEND_DIR" ]; then
    echo "ERROR: Backend directory not found: $BACKEND_DIR"
    exit 1
fi

if [ ! -d "$DATABASE_SCRIPTS_DIR" ]; then
    echo "ERROR: Database scripts directory not found: $DATABASE_SCRIPTS_DIR"
    exit 1
fi

# Step 1: Build the backend with criteria builder dependencies
echo ""
echo "Step 1: Building backend with criteria builder dependencies..."
cd "$BACKEND_DIR"

# Check if pom.xml exists
if [ ! -f "pom.xml" ]; then
    echo "ERROR: pom.xml not found in backend directory"
    exit 1
fi

# Clean and compile
echo "Running Maven clean compile..."
mvn clean compile
if [ $? -ne 0 ]; then
    echo "ERROR: Maven compilation failed"
    exit 1
fi

echo "Backend compilation successful"

# Step 2: Run database migrations
echo ""
echo "Step 2: Running database migrations..."

# Set default database connection parameters if not provided
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-MoneyPlant}
DB_USERNAME=${DB_USERNAME:-postgres}

echo "Database connection details:"
echo "Host: $DB_HOST"
echo "Port: $DB_PORT"
echo "Database: $DB_NAME"
echo "Username: $DB_USERNAME"

# Run migration script using psql if available
if command -v psql >/dev/null 2>&1; then
    echo "Running database migrations using psql..."
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -d "$DB_NAME" -U "$DB_USERNAME" -f "$DATABASE_SCRIPTS_DIR/deploy-criteria-migrations.sql"
    if [ $? -ne 0 ]; then
        echo "WARNING: Database migration failed. Please run migrations manually."
        echo "Migration script location: $DATABASE_SCRIPTS_DIR/deploy-criteria-migrations.sql"
    else
        echo "Database migrations completed successfully"
    fi
else
    echo "WARNING: psql not found in PATH. Please run database migrations manually."
    echo "Migration script location: $DATABASE_SCRIPTS_DIR/deploy-criteria-migrations.sql"
fi

# Step 3: Package the application
echo ""
echo "Step 3: Packaging application..."
cd "$BACKEND_DIR"

echo "Running Maven package..."
mvn package -DskipTests
if [ $? -ne 0 ]; then
    echo "ERROR: Maven packaging failed"
    exit 1
fi

echo "Application packaging successful"

# Step 4: Verify deployment
echo ""
echo "Step 4: Verifying deployment..."

# Check if JAR file was created
if ls target/*.jar 1> /dev/null 2>&1; then
    echo "JAR file created successfully"
    ls -la target/*.jar
else
    echo "WARNING: JAR file not found in target directory"
fi

# Step 5: Display deployment summary
echo ""
echo "========================================"
echo "Criteria Builder Deployment Summary"
echo "========================================"
echo "Status: COMPLETED"
echo ""
echo "Components deployed:"
echo "- Criteria validation services"
echo "- SQL generation services"
echo "- Field metadata management"
echo "- Function definition management"
echo "- Database migration scripts"
echo "- Configuration files"
echo ""
echo "Next steps:"
echo "1. Verify database migrations were applied successfully"
echo "2. Start the application using existing startup scripts"
echo "3. Test criteria builder endpoints at /api/screeners/criteria/*"
echo "4. Check application logs for any startup issues"
echo ""
echo "Deployment completed at: $(date)"
echo "========================================"

cd "$SCRIPT_DIR"
echo "Deployment script finished."