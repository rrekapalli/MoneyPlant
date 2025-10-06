#!/bin/bash

echo "Starting MoneyPlant Frontend in Development Mode..."
echo "Frontend will be available at: http://localhost:4200"
echo "Make sure the backend is running on port 8080"
echo ""

cd frontend
npm install
npm run start:dev 