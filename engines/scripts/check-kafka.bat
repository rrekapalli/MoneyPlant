@echo off
REM Script to check Kafka connectivity and status

echo Checking Kafka connectivity...

REM Check if Kafka is running on the expected port
echo 1. Checking if port 9093 is accessible...
netstat -an | findstr ":9093" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Port 9093 is accessible
) else (
    echo    ❌ Port 9093 is not accessible
    echo    This might mean Kafka is not running or is on a different port
)

REM Check if Docker containers are running
echo.
echo 2. Checking Docker containers...
docker ps | findstr "moneyplant-engines-kafka" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Kafka container is running
    echo    Container details:
    docker ps | findstr "moneyplant-engines-kafka"
) else (
    echo    ❌ Kafka container is not running
)

REM Check if Zookeeper is running
docker ps | findstr "moneyplant-engines-zookeeper" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Zookeeper container is running
) else (
    echo    ❌ Zookeeper container is not running
)

REM Check Kafka logs
echo.
echo 3. Checking Kafka logs...
docker logs moneyplant-engines-kafka 2>&1 | findstr "started" >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo    ✅ Kafka appears to have started successfully
) else (
    echo    ⚠️  Kafka may not have started properly
    echo    Recent logs:
    docker logs moneyplant-engines-kafka --tail 10 2>&1
)

REM Check Docker Compose status
echo.
echo 4. Docker Compose status:
cd /d "%~dp0\.."
docker-compose ps

echo.
echo 5. Recommendations:
echo    - If containers are not running, start them with: docker-compose up -d
echo    - If port 9093 is not accessible, check Docker network configuration
echo    - If Kafka fails to start, check Zookeeper logs: docker logs moneyplant-engines-zookeeper
echo    - Make sure your application is configured to use localhost:9093
