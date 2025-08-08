@echo off
setlocal enabledelayedexpansion

echo 🚀 Starting MoneyPlant Backend in Development Mode...
echo Backend will be available at: http://localhost:8080
echo API Documentation: http://localhost:8080/swagger-ui.html
echo Health Check: http://localhost:8080/actuator/health
echo.

cd backend

REM Check if .env file exists
if exist ".env" (
    echo 📋 Loading environment variables from .env file...
    REM Load environment variables from .env file
    for /f "tokens=1,* delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo ⚠️  .env file not found. Creating one with default values...
    call setup-env.bat
    echo 📋 Loading environment variables from newly created .env file...
    for /f "tokens=1,* delims==" %%a in (.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
)

echo ✅ Environment variables loaded from .env file
echo.

REM Verify critical environment variables
echo 🔍 Verifying environment variables:
echo DB_HOST: %DB_HOST%
echo DB_PASSWORD: [HIDDEN]
echo MICROSOFT_CLIENT_ID: %MICROSOFT_CLIENT_ID%
echo JWT_SECRET: [HIDDEN]
echo.

echo 🏃 Starting Spring Boot application...
echo.

mvn spring-boot:run -Dspring-boot.run.profiles=dev 