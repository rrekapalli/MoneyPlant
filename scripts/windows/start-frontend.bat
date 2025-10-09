@echo off

echo Starting MoneyPlant Frontend in Development Mode...
echo Frontend will be available at: http://localhost:4200
echo Make sure the backend is running on port 8080
echo.

cd frontend
call npm install
call npm run start:dev 