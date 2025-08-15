@echo off
REM Script to start the MoneyPlant Engines application locally
REM This script ensures the correct profile is used and services are running

echo Starting MoneyPlant Engines application locally...

REM Check if we're in the right directory
if not exist "pom.xml" (
    echo Error: Please run this script from the engines directory
    echo Current directory: %CD%
    echo Expected: engines directory with pom.xml
    pause
    exit /b 1
)

REM Check if Docker is running
docker info >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Error: Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

REM Check if required services are running
echo Checking required services...

REM Check PostgreSQL
docker ps | findstr "moneyplant-engines-postgres" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting PostgreSQL...
    docker-compose up -d postgres
    echo Waiting for PostgreSQL to be ready...
    timeout /t 10 /nobreak >nul
) else (
    echo    ✅ PostgreSQL is running
)

REM Check Zookeeper
docker ps | findstr "moneyplant-engines-zookeeper" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Zookeeper...
    docker-compose up -d zookeeper
    echo Waiting for Zookeeper to be ready...
    timeout /t 10 /nobreak >nul
) else (
    echo    ✅ Zookeeper is running
)

REM Check Kafka
docker ps | findstr "moneyplant-engines-kafka" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Kafka...
    docker-compose up -d kafka
    echo Waiting for Kafka to be ready...
    timeout /t 15 /nobreak >nul
) else (
    echo    ✅ Kafka is running
)

REM Check Redis
docker ps | findstr "moneyplant-engines-redis" >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Starting Redis...
    docker-compose up -d redis
    echo Waiting for Redis to be ready...
    timeout /t 5 /nobreak >nul
) else (
    echo    ✅ Redis is running
)

REM Verify services are accessible
echo.
echo Verifying service connectivity...

REM Check PostgreSQL port
netstat -an | findstr ":5433" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ PostgreSQL port 5433 is accessible
) else (
    echo    ❌ PostgreSQL port 5433 is not accessible
    echo Please check Docker logs: docker logs moneyplant-engines-postgres
    pause
    exit /b 1
)

REM Check Kafka port
netstat -an | findstr ":9093" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Kafka port 9093 is accessible
) else (
    echo    ❌ Kafka port 9093 is not accessible
    echo Please check Docker logs: docker logs moneyplant-engines-kafka
    pause
    exit /b 1
)

REM Check Redis port
netstat -an | findstr ":6380" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Redis port 6380 is accessible
) else (
    echo    ❌ Redis port 6380 is not accessible
    echo Please check Docker logs: docker logs moneyplant-engines-redis
    pause
    exit /b 1
)

echo.
echo All services are running and accessible!
echo Starting MoneyPlant Engines application with 'local' profile...

REM Start the application with local profile
set SPRING_PROFILES_ACTIVE=local
echo Using profile: %SPRING_PROFILES_ACTIVE%

REM Check if Maven is available
where mvn >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Starting with Maven...
    mvn spring-boot:run
) else (
    echo Maven not found. Please install Maven or use your IDE to run the application.
    echo Make sure to set SPRING_PROFILES_ACTIVE=local
    pause
    exit /b 1
)
