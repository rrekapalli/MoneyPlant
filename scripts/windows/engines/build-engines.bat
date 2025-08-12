@echo off
REM MoneyPlant Engines Build Script for Windows

echo Building MoneyPlant Engines...

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

echo Java version:
java -version 2>&1 | findstr "version"
echo Maven version:
mvn -version 2>&1 | findstr "Apache Maven"

REM Clean and build
echo Cleaning previous build...
cd .\engines
mvn clean

echo Building MoneyPlant Engines...
mvn package -DskipTests

if %ERRORLEVEL% EQU 0 (
    echo Build successful!
    echo JAR file location: target\moneyplant-engines-1.0-SNAPSHOT.jar
    
    REM Show JAR file size
    if exist "target\moneyplant-engines-1.0-SNAPSHOT.jar" (
        for %%A in ("target\moneyplant-engines-1.0-SNAPSHOT.jar") do echo JAR file size: %%~zA bytes
    )
) else (
    echo Build failed!
    pause
    exit /b 1
)

pause
