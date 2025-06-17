# Script to build Docker image for MoneyPlant monolithic application
# This script is triggered after Maven package is created

Write-Host "Building Docker image for MoneyPlant monolithic application..." -ForegroundColor Green

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

# Build Docker image for the monolithic application
Write-Host "Building Docker image for monolithic application..." -ForegroundColor Cyan

# MoneyPlant App (Monolithic Application)
Build-DockerImage -serviceName "MoneyPlant App" -directory "$projectRoot\moneyplant-app"

Write-Host "Docker image has been built successfully!" -ForegroundColor Green
Write-Host "You can now run the container using Docker commands." -ForegroundColor Green
