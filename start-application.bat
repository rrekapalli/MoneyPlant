@echo off
echo 🚀 MoneyPlant Application Startup for Windows
echo =============================================
echo.

REM Check if we're on Windows
if "%OS%"=="Windows_NT" (
    echo ✅ Windows detected. Using Windows scripts...
    call scripts\start-application.bat
) else (
    echo ❌ This script is for Windows only.
    echo Please use start-application.sh for Linux/Mac.
    pause
    exit /b 1
) 