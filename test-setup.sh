#!/bin/bash

echo "Testing MoneyPlant Separated Setup..."
echo "====================================="
echo ""

# Check if backend is running
echo "1. Testing Backend..."
if curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo "✅ Backend is running on port 8080"
else
    echo "❌ Backend is not running on port 8080"
    echo "   Start backend with: ./start-backend.sh"
fi

echo ""

# Check if frontend is running
echo "2. Testing Frontend..."
if curl -s http://localhost:4200 > /dev/null; then
    echo "✅ Frontend is running on port 4200"
else
    echo "❌ Frontend is not running on port 4200"
    echo "   Start frontend with: ./start-frontend.sh"
fi

echo ""

# Check API endpoints
echo "3. Testing API Endpoints..."
if curl -s http://localhost:8080/swagger-ui.html > /dev/null; then
    echo "✅ Swagger UI is accessible"
else
    echo "❌ Swagger UI is not accessible"
fi

echo ""

echo "Setup Test Complete!"
echo "If both services are running, you can access:"
echo "- Frontend: http://localhost:4200"
echo "- Backend API: http://localhost:8080"
echo "- API Documentation: http://localhost:8080/swagger-ui.html" 