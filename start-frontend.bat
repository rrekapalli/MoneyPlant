@echo off
echo 🚀 MoneyPlant Frontend Startup for Windows
echo ==========================================
echo.

REM Check if we're on Windows
if "%OS%"=="Windows_NT" (
    echo ✅ Windows detected. Using Windows build scripts...
    call build\windows\start-frontend.bat
) else (
    echo ❌ This script is for Windows only.
    echo Please use start-frontend.sh for Linux/Mac.
    pause
    exit /b 1
) 