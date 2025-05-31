#!/bin/bash
# Script to run all MoneyPlant APIs
# This script starts all the microservices in the correct order

echo -e "\e[32mStarting MoneyPlant services...\e[0m"

# Function to start a service in a new terminal window
start_service() {
    local service_name=$1
    local directory=$2

    echo -e "\e[36mStarting $service_name...\e[0m"

    # Try to detect the terminal emulator available
    if command -v gnome-terminal &> /dev/null; then
        gnome-terminal -- bash -c "cd $directory && export SPRING_PROFILES_ACTIVE=dev && mvn spring-boot:run; exec bash"
    elif command -v xterm &> /dev/null; then
        xterm -e "cd $directory && export SPRING_PROFILES_ACTIVE=dev && mvn spring-boot:run; exec bash" &
    elif command -v konsole &> /dev/null; then
        konsole --new-tab -e bash -c "cd $directory && export SPRING_PROFILES_ACTIVE=dev && mvn spring-boot:run; exec bash" &
    else
        echo -e "\e[31mNo supported terminal emulator found. Please install gnome-terminal, xterm, or konsole.\e[0m"
        exit 1
    fi

    # Wait a moment to allow the service to start
    sleep 5
}

# Set the working directory to the project root
project_root=$(pwd)

# 1. Start Config Server (first, as it provides configuration for other services)
start_service "Config Server" "$project_root/config-server"

# Wait for Config Server to fully start
echo -e "\e[33mWaiting for Config Server to start...\e[0m"
sleep 15

# 2. Start Discovery Server (Eureka)
start_service "Discovery Server" "$project_root/discovery-server"

# Wait for Discovery Server to fully start
echo -e "\e[33mWaiting for Discovery Server to start...\e[0m"
sleep 15

# 3. Start Microservices
# Portfolio Service
start_service "Portfolio Service" "$project_root/portfolio-service"

# Stock Service
start_service "Stock Service" "$project_root/stock-service"

# Transaction Service
start_service "Transaction Service" "$project_root/transaction-service"

# Watchlist Service
start_service "Watchlist Service" "$project_root/watchlist-service"

# Wait for microservices to register with Eureka
echo -e "\e[33mWaiting for microservices to register with Eureka...\e[0m"
sleep 20

# 4. Start API Gateway (last, as it needs to connect to the other services)
start_service "API Gateway" "$project_root/api-gateway"

echo -e "\e[32mAll MoneyPlant services have been started!\e[0m"
echo -e "\e[32mYou can access the application through the API Gateway at http://rrdesktop:9700\e[0m"
echo -e "\e[32mEureka Dashboard is available at http://localhost:8761\e[0m"
