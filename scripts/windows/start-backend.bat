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
    call ..\scripts\windows\backend\setup-env.bat
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

REM Check if Maven is installed
where mvn >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Maven is not installed or not in PATH.
    echo.
    echo 📋 To install Maven on Windows:
    echo 1. Download Maven from: https://maven.apache.org/download.cgi
    echo 2. Extract to a directory (e.g., C:\Program Files\Apache\maven)
    echo 3. Add Maven bin directory to your PATH environment variable
    echo 4. Restart your command prompt
    echo.
    echo 🔧 Alternative: Use the Maven wrapper (if available)
    if exist "mvnw.cmd" (
        echo ✅ Found Maven wrapper. Using mvnw.cmd instead...
        mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=dev
    ) else (
        echo ❌ Maven wrapper not found. Please install Maven.
        pause
        exit /b 1
    )
) else (
    mvn spring-boot:run -Dspring-boot.run.profiles=dev
) 