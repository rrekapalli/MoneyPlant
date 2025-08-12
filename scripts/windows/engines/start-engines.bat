@echo off
REM MoneyPlant Engines Startup Script for Windows

echo Starting MoneyPlant Engines...

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo Error: Java is not installed. Please install Java 21 or higher.
    pause
    exit /b 1
)

REM Check if Maven is installed
mvn -version >nul 2>&1
if errorlevel 1 (
    echo Error: Maven is not installed. Please install Maven 3.8 or higher.
    pause
    exit /b 1
)

REM Set environment variables
set SPRING_PROFILES_ACTIVE=dev
set SERVER_PORT=8081

echo Java version:
java -version 2>&1 | findstr "version"
echo Maven version:
mvn -version 2>&1 | findstr "Apache Maven"
echo Spring profile: %SPRING_PROFILES_ACTIVE%
echo Server port: %SERVER_PORT%

REM Start the application
echo Starting MoneyPlant Engines on port %SERVER_PORT%...
cd .\engines
mvn spring-boot:run

pause
