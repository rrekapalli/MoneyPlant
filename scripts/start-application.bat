@echo off
setlocal enabledelayedexpansion

echo 🚀 MoneyPlant Application Startup
echo =================================
echo.

REM Function to check if a command exists
:command_exists
where %1 >nul 2>&1
if %errorlevel% equ 0 (
    exit /b 0
) else (
    exit /b 1
)

REM Check prerequisites
echo 🔍 Checking prerequisites...

where java >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Java is not installed. Please install Java 17 or later.
    pause
    exit /b 1
)

where node >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or later.
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Setup backend environment
echo 🔧 Setting up backend environment...
cd backend

if exist ".env" (
    echo 📋 Backend .env file found
) else (
    echo 📝 Creating backend .env file...
    call ..\scripts\windows\backend\setup-env.bat
)

cd ..

REM Setup frontend environment
echo 🔧 Setting up frontend environment...
cd frontend

echo 📝 Generating frontend environment files...
call ..\scripts\windows\frontend\setup-env.bat

cd ..

echo.
echo ✅ Environment setup completed!
echo.
echo 📋 Next steps:
echo 1. Edit backend\.env file with your actual credentials
echo 2. Run 'npm install' in the frontend directory if not done already
echo 3. Start the backend: scripts\windows\start-backend.bat
echo 4. Start the frontend: cd frontend ^&^& npm start
echo.
echo 📖 For detailed setup instructions, see scripts\windows\WINDOWS_SETUP.md
echo.
echo 🔒 Security reminder:
echo - The .env file contains sensitive information and is in .gitignore
echo - Never commit the .env file to version control
echo - Use different credentials for development, staging, and production
pause 