@echo off
setlocal enabledelayedexpansion

echo 🔐 MoneyPlant Frontend Environment Setup
echo ==========================================
echo.

REM Check if we're in the frontend directory
if not exist "angular.json" (
    echo ❌ This script must be run from the frontend directory
    pause
    exit /b 1
)

REM Check if .env file exists in the backend directory
if exist "..\..\backend\.env" (
    echo 📋 Loading environment variables from backend .env file...
    REM Load environment variables from backend .env file
    for /f "tokens=1,* delims==" %%a in (..\..\backend\.env) do (
        if not "%%a"=="" if not "%%a:~0,1%"=="#" (
            set "%%a=%%b"
        )
    )
) else (
    echo ⚠️  Backend .env file not found. Using default values...
    REM Set default values
    set "GOOGLE_CLIENT_ID=your-google-client-id"
    set "MICROSOFT_CLIENT_ID=your-microsoft-client-id"
)

echo 📝 Generating frontend environment files...
echo.

REM Generate development environment
(
echo export const environment = {
echo   production: false,
echo   apiUrl: 'http://localhost:8080',
echo   useMockData: true,
echo   
echo   // OAuth Configuration
echo   oauth: {
echo     google: {
echo       clientId: '!GOOGLE_CLIENT_ID!', // Replace with your Google Client ID
echo       redirectUri: 'http://localhost:4200'
echo     },
echo     microsoft: {
echo       clientId: '!MICROSOFT_CLIENT_ID!', // Replace with your Microsoft Azure AD Client ID
echo       redirectUri: 'http://localhost:4200'
echo     }
echo   }
echo };
) > src\environments\environment.ts

REM Generate production environment
(
echo export const environment = {
echo   production: true,
echo   apiUrl: '/api', // In production, the API is typically served from the same domain
echo   useMockData: false,
echo   
echo   // OAuth Configuration
echo   oauth: {
echo     google: {
echo       clientId: '!GOOGLE_CLIENT_ID!', // Replace with your Google Client ID
echo       redirectUri: window.location.origin
echo     },
echo     microsoft: {
echo       clientId: '!MICROSOFT_CLIENT_ID!', // Replace with your Microsoft Azure AD Client ID
echo       redirectUri: window.location.origin
echo     }
echo   }
echo };
) > src\environments\environment.prod.ts

echo ✅ Frontend environment files generated successfully!
echo.
echo 📋 Generated files:
echo - src/environments/environment.ts (development)
echo - src/environments/environment.prod.ts (production)
echo.
echo 🔒 Security reminder: Client IDs are not sensitive secrets and can be safely included in frontend code.
echo However, client secrets should never be included in frontend code. 