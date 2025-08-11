@echo off
setlocal enabledelayedexpansion

echo 🔐 MoneyPlant Environment Setup
echo ================================
echo.

REM Check if .env file exists
if exist ".env" (
    echo ⚠️  .env file already exists. Do you want to overwrite it? (Y/N)
    set /p response=
    if /i not "!response!"=="Y" (
        echo Setup cancelled.
        exit /b 0
    )
)

echo 📝 Creating .env file with comprehensive template...
echo.

REM Create .env file with comprehensive template
(
echo # =============================================================================
echo # MoneyPlant Environment Configuration
echo # =============================================================================
echo # This file contains all environment variables for the MoneyPlant application.
echo # DO NOT commit this file to version control - it contains sensitive information.
echo # Copy this file to .env.local for local development and set actual values.
echo.
echo # =============================================================================
echo # Database Configuration
echo # =============================================================================
echo DB_HOST=postgres.tailce422e.ts.net
echo DB_PORT=5432
echo DB_NAME=MoneyPlant
echo DB_USERNAME=postgres
echo DB_PASSWORD=your_database_password_here
echo.
echo # =============================================================================
echo # OAuth2 Configuration
echo # =============================================================================
echo GOOGLE_CLIENT_ID=your_google_client_id_here
echo GOOGLE_CLIENT_SECRET=your_google_client_secret_here
echo MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
echo MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
echo.
echo # =============================================================================
echo # JWT Configuration
echo # =============================================================================
echo JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long_here
echo.
echo # =============================================================================
echo # CORS Configuration
echo # =============================================================================
echo CORS_ALLOWED_ORIGINS=http://localhost:4200,https://your-frontend-domain.com
echo.
echo # =============================================================================
echo # Apache Trino Configuration
echo # =============================================================================
echo TRINO_URL=jdbc:trino://trino.tailce422e.ts.net:8080
echo TRINO_CATALOG=
echo TRINO_SCHEMA=
echo TRINO_USER=trino
echo TRINO_PASSWORD=
echo TRINO_SSL_ENABLED=false
echo.
echo # =============================================================================
echo # Trino PostgreSQL Configuration
echo # =============================================================================
echo TRINO_PG_HOST=postgres.tailce422e.ts.net
echo TRINO_PG_PORT=5432
echo TRINO_PG_DATABASE=MoneyPlant
echo TRINO_PG_USER=postgres
echo TRINO_PG_PASSWORD=your_trino_pg_password_here
echo.
echo # =============================================================================
echo # Application Configuration
echo # =============================================================================
echo SPRING_PROFILES_ACTIVE=dev
echo SERVER_PORT=8080
echo SERVER_HOST=0.0.0.0
echo.
echo # =============================================================================
echo # Logging Configuration
echo # =============================================================================
echo LOGGING_LEVEL_ROOT=info
echo LOGGING_LEVEL_COM_MONEYPLANT=debug
echo LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=debug
) > .env

echo ✅ .env file created successfully!
echo.
echo 📋 Next steps:
echo 1. Edit the .env file and replace the placeholder values with your actual credentials
echo 2. Start your application
echo.
echo 🔒 Security reminder: The .env file is already in .gitignore and will not be committed to the repository.
echo.
echo 📖 For more information, see docs/ENVIRONMENT_SETUP.md 