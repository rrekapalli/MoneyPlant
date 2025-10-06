#!/bin/bash

# Simple script to start MoneyPlant Engines with local profile

echo "Starting MoneyPlant Engines with local profile..."

# Set the profile
export SPRING_PROFILES_ACTIVE=local
echo "Using profile: $SPRING_PROFILES_ACTIVE"

# Start the application
mvn spring-boot:run
