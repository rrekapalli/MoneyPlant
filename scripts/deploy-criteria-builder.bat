@echo off
REM Deployment script for Criteria Builder functionality
REM This script deploys the criteria builder as part of the existing screener package

echo Starting Criteria Builder deployment...

REM Set environment variables
set SCRIPT_DIR=%~dp0
set PROJECT_ROOT=%SCRIPT_DIR%..
set BACKEND_DIR=%PROJECT_ROOT%\backend
set DATABASE_SCRIPTS_DIR=%PROJECT_ROOT%\scripts\database

echo Project root: %PROJECT_ROOT%
echo Backend directory: %BACKEND_DIR%
echo Database scripts directory: %DATABASE_SCRIPTS_DIR%

REM Check if required directories exist
if not exist "%BACKEND_DIR%" (
    echo ERROR: Backend directory not found: %BACKEND_DIR%
    exit /b 1
)

if not exist "%DATABASE_SCRIPTS_DIR%" (
    echo ERROR: Database scripts directory not found: %DATABASE_SCRIPTS_DIR%
    exit /b 1
)

REM Step 1: Build the backend with criteria builder dependencies
echo.
echo Step 1: Building backend with criteria builder dependencies...
cd /d "%BACKEND_DIR%"

REM Check if pom.xml exists
if not exist "pom.xml" (
    echo ERROR: pom.xml not found in backend directory
    exit /b 1
)

REM Clean and compile
echo Running Maven clean compile...
call mvn clean compile
if %ERRORLEVEL% neq 0 (
    echo ERROR: Maven compilation failed
    exit /b 1
)

echo Backend compilation successful

REM Step 2: Run database migrations
echo.
echo Step 2: Running database migrations...

REM Check if database connection is available
echo Checking database connection...
if "%DB_HOST%"=="" set DB_HOST=localhost
if "%DB_PORT%"=="" set DB_PORT=5432
if "%DB_NAME%"=="" set DB_NAME=MoneyPlant
if "%DB_USERNAME%"=="" set DB_USERNAME=postgres

echo Database connection details:
echo Host: %DB_HOST%
echo Port: %DB_PORT%
echo Database: %DB_NAME%
echo Username: %DB_USERNAME%

REM Run migration script using psql if available
where psql >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo Running database migrations using psql...
    psql -h %DB_HOST% -p %DB_PORT% -d %DB_NAME% -U %DB_USERNAME% -f "%DATABASE_SCRIPTS_DIR%\deploy-criteria-migrations.sql"
    if %ERRORLEVEL% neq 0 (
        echo WARNING: Database migration failed. Please run migrations manually.
        echo Migration script location: %DATABASE_SCRIPTS_DIR%\deploy-criteria-migrations.sql
    ) else (
        echo Database migrations completed successfully
    )
) else (
    echo WARNING: psql not found in PATH. Please run database migrations manually.
    echo Migration script location: %DATABASE_SCRIPTS_DIR%\deploy-criteria-migrations.sql
)

REM Step 3: Package the application
echo.
echo Step 3: Packaging application...
cd /d "%BACKEND_DIR%"

echo Running Maven package...
call mvn package -DskipTests
if %ERRORLEVEL% neq 0 (
    echo ERROR: Maven packaging failed
    exit /b 1
)

echo Application packaging successful

REM Step 4: Verify deployment
echo.
echo Step 4: Verifying deployment...

REM Check if JAR file was created
if exist "target\*.jar" (
    echo JAR file created successfully
    dir target\*.jar
) else (
    echo WARNING: JAR file not found in target directory
)

REM Step 5: Display deployment summary
echo.
echo ========================================
echo Criteria Builder Deployment Summary
echo ========================================
echo Status: COMPLETED
echo.
echo Components deployed:
echo - Criteria validation services
echo - SQL generation services  
echo - Field metadata management
echo - Function definition management
echo - Database migration scripts
echo - Configuration files
echo.
echo Next steps:
echo 1. Verify database migrations were applied successfully
echo 2. Start the application using existing startup scripts
echo 3. Test criteria builder endpoints at /api/screeners/criteria/*
echo 4. Check application logs for any startup issues
echo.
echo Deployment completed at: %date% %time%
echo ========================================

cd /d "%SCRIPT_DIR%"
echo Deployment script finished.
pause