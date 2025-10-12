@echo off
REM Script to run the NSE indices ticks table migration
REM This script will update the database schema to match the new entity structure

echo Starting NSE indices ticks table migration...

REM Database connection parameters (update these as needed)
set DB_HOST=postgres.tailce422e.ts.net
set DB_PORT=5432
set DB_NAME=MoneyPlant
set DB_USER=postgres
set DB_PASSWORD=mysecretpassword

REM Migration file path
set MIGRATION_FILE=sql\migrate_nse_indices_ticks_table.sql

echo Connecting to database: %DB_HOST%:%DB_PORT%\%DB_NAME%
echo Running migration from: %MIGRATION_FILE%

REM Run the migration
psql -h "%DB_HOST%" -p "%DB_PORT%" -U "%DB_USER%" -d "%DB_NAME%" -f "%MIGRATION_FILE%"

if %ERRORLEVEL% EQU 0 (
    echo Migration completed successfully!
    echo You can now start the application with 'ddl-auto: validate'
) else (
    echo Migration failed! Please check the error messages above.
    pause
    exit /b 1
)
