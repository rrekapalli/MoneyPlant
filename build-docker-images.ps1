# Script to build Docker images for all MoneyPlant services
# This script is triggered after Maven package is created

Write-Host "Building Docker images for MoneyPlant services..." -ForegroundColor Green

# Set the working directory to the project root
$projectRoot = Get-Location

# Function to build Docker image for a service
function Build-DockerImage {
    param (
        [string]$serviceName,
        [string]$directory
    )
    
    Write-Host "Building Docker image for $serviceName..." -ForegroundColor Cyan
    
    # Navigate to the service directory
    Push-Location $directory
    
    # Build the Docker image using jib-maven-plugin
    # The -Djib.skip=false ensures the image is built even if skip is set to true in the pom.xml
    mvn clean package jib:build -DskipTests -Djib.skip=false
    
    # Return to the project root
    Pop-Location
    
    Write-Host "Docker image for $serviceName built successfully!" -ForegroundColor Green
}

# Build Docker images for all services
Write-Host "Building Docker images for all services..." -ForegroundColor Cyan

# Config Server
Build-DockerImage -serviceName "Config Server" -directory "$projectRoot\config-server"

# Discovery Server
Build-DockerImage -serviceName "Discovery Server" -directory "$projectRoot\discovery-server"

# Portfolio Service
Build-DockerImage -serviceName "Portfolio Service" -directory "$projectRoot\portfolio-service"

# Stock Service
Build-DockerImage -serviceName "Stock Service" -directory "$projectRoot\stock-service"

# Transaction Service
Build-DockerImage -serviceName "Transaction Service" -directory "$projectRoot\transaction-service"

# Watchlist Service
Build-DockerImage -serviceName "Watchlist Service" -directory "$projectRoot\watchlist-service"

# API Gateway
Build-DockerImage -serviceName "API Gateway" -directory "$projectRoot\api-gateway"

Write-Host "All Docker images have been built successfully!" -ForegroundColor Green
Write-Host "You can now run the containers using Docker commands." -ForegroundColor Green