#!/bin/bash
# Script to build Docker images for all MoneyPlant services
# This script is triggered after Maven package is created

echo -e "\e[32mBuilding Docker images for MoneyPlant services...\e[0m"

# Set the working directory to the project root
project_root=$(pwd)

# Function to build Docker image for a service
build_docker_image() {
    local service_name=$1
    local directory=$2

    echo -e "\e[36mBuilding Docker image for $service_name...\e[0m"

    # Navigate to the service directory
    cd "$directory" || exit

    # Build the Docker image using jib-maven-plugin
    # The -Djib.skip=false ensures the image is built even if skip is set to true in the pom.xml
    mvn clean package jib:build -DskipTests -Djib.skip=false

    # Return to the project root
    cd "$project_root" || exit

    echo -e "\e[32mDocker image for $service_name built successfully!\e[0m"
}

# Build Docker images for all services
echo -e "\e[36mBuilding Docker images for all services...\e[0m"


# Portfolio Service
build_docker_image "Portfolio Service" "$project_root/portfolio-service"

# Stock Service
build_docker_image "Stock Service" "$project_root/stock-service"

# Transaction Service
build_docker_image "Transaction Service" "$project_root/transaction-service"

# Watchlist Service
build_docker_image "Watchlist Service" "$project_root/watchlist-service"


echo -e "\e[32mAll Docker images have been built successfully!\e[0m"
echo -e "\e[32mYou can now run the containers using Docker commands.\e[0m"
