@echo off
setlocal enabledelayedexpansion
REM MoneyPlant Engines Startup Script for Windows

echo 🚀 Starting MoneyPlant Engines...

REM Check if Java is installed
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Java is not installed. Please install Java 21 or higher.
    pause
    exit /b 1
)

REM Set environment variables
set SPRING_PROFILES_ACTIVE=dev
set SERVER_PORT=8081

REM Move into engines directory
cd /d "%~dp0\..\..\..\engines"

REM Determine Maven command (prefer wrapper)
set "MAVEN_CMD="
if exist "mvnw.cmd" (
    echo ✅ Found Maven wrapper in engines directory. Using mvnw.cmd...
    set "MAVEN_CMD=mvnw.cmd"
) else (
    if exist "..\backend\mvnw.cmd" (
        echo ✅ Found Maven wrapper in backend. Using backend\mvnw.cmd with -f engines\pom.xml...
        set "MAVEN_CMD=..\backend\mvnw.cmd -f %CD%\pom.xml"
    ) else (
        where mvn >nul 2>&1
        if errorlevel 1 (
            echo ❌ Error: Maven is not installed and Maven wrapper was not found.
            echo    Please install Maven 3.8+ or add Maven wrapper ^(mvnw.cmd^) to the engines module.
            pause
            exit /b 1
        ) else (
            echo ✅ Found Maven in PATH. Using mvn...
            set "MAVEN_CMD=mvn"
        )
    )
)

echo Java version:
java -version 2>&1 | findstr "version"
echo Maven version:
%MAVEN_CMD% -version 2>&1 | findstr "Apache Maven"
echo Spring profile: %SPRING_PROFILES_ACTIVE%
echo Server port: %SERVER_PORT%

REM Start the application
echo 🏃 Starting MoneyPlant Engines on port %SERVER_PORT%...
%MAVEN_CMD% spring-boot:run -Dspring-boot.run.profiles=%SPRING_PROFILES_ACTIVE%

pause
endlocal
