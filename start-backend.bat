@echo off
echo 🚀 MoneyPlant Backend Startup for Windows
echo =========================================
echo.

REM Check if we're on Windows
if "%OS%"=="Windows_NT" (
    echo ✅ Windows detected. Using Windows build scripts...
    call build\windows\start-backend.bat
) else (
    echo ❌ This script is for Windows only.
    echo Please use start-backend.sh for Linux/Mac.
    pause
    exit /b 1
) 