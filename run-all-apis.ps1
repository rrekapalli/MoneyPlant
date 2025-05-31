# Script to run all MoneyPlant APIs
# This script starts all the microservices in the correct order

Write-Host "Starting MoneyPlant services..." -ForegroundColor Green

# Function to start a service in a new window
function Start-Service {
    param (
        [string]$serviceName,
        [string]$directory
    )

    Write-Host "Starting $serviceName..." -ForegroundColor Cyan

    # Create a new PowerShell window and start the service
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $directory; $env:SPRING_PROFILES_ACTIVE='dev'; mvn spring-boot:run"

    # Wait a moment to allow the service to start
    Start-Sleep -Seconds 5
}

# Set the working directory to the project root
$projectRoot = Get-Location

# 1. Start Config Server (first, as it provides configuration for other services)
Start-Service -serviceName "Config Server" -directory "$projectRoot\config-server"

# Wait for Config Server to fully start
Write-Host "Waiting for Config Server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 2. Start Discovery Server (Eureka)
Start-Service -serviceName "Discovery Server" -directory "$projectRoot\discovery-server"

# Wait for Discovery Server to fully start
Write-Host "Waiting for Discovery Server to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 3. Start Microservices
# Portfolio Service
Start-Service -serviceName "Portfolio Service" -directory "$projectRoot\portfolio-service"

# Stock Service
Start-Service -serviceName "Stock Service" -directory "$projectRoot\stock-service"

# Transaction Service
Start-Service -serviceName "Transaction Service" -directory "$projectRoot\transaction-service"

# Watchlist Service
Start-Service -serviceName "Watchlist Service" -directory "$projectRoot\watchlist-service"

# Wait for microservices to register with Eureka
Write-Host "Waiting for microservices to register with Eureka..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# 4. Start API Gateway (last, as it needs to connect to the other services)
Start-Service -serviceName "API Gateway" -directory "$projectRoot\api-gateway"

Write-Host "All MoneyPlant services have been started!" -ForegroundColor Green
Write-Host "You can access the application through the API Gateway at http://rrdesktop:9700" -ForegroundColor Green
Write-Host "Eureka Dashboard is available at http://localhost:8761" -ForegroundColor Green
