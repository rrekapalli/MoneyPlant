#!/bin/bash

# Script to run the NSE indices ticks table migration
# This script will update the database schema to match the new entity structure

echo "Starting NSE indices ticks table migration..."

# Database connection parameters (update these as needed)
DB_HOST="postgres.tailce422e.ts.net"
DB_PORT="5432"
DB_NAME="MoneyPlant"
DB_USER="postgres"
DB_PASSWORD="mysecretpassword"

# Migration file path
MIGRATION_FILE="sql/migrate_nse_indices_ticks_table.sql"

echo "Connecting to database: $DB_HOST:$DB_PORT/$DB_NAME"
echo "Running migration from: $MIGRATION_FILE"

# Run the migration
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE"

if [ $? -eq 0 ]; then
    echo "Migration completed successfully!"
    echo "You can now start the application with 'ddl-auto: validate'"
else
    echo "Migration failed! Please check the error messages above."
    exit 1
fi
