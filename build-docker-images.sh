#!/bin/bash
# Script to build Docker image for MoneyPlant monolithic application
# This script is triggered after Maven package is created

echo -e "\e[32mBuilding Docker image for MoneyPlant monolithic application...\e[0m"

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

# Build Docker image for the monolithic application
echo -e "\e[36mBuilding Docker image for monolithic application...\e[0m"

# MoneyPlant App (Monolithic Application)
build_docker_image "MoneyPlant App" "$project_root/moneyplant-app"

echo -e "\e[32mDocker image has been built successfully!\e[0m"
echo -e "\e[32mYou can now run the container using Docker commands.\e[0m"
