#!/bin/bash

echo "🚀 MoneyPlant Application Startup"
echo "================================="
echo ""

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "🔍 Checking prerequisites..."

if ! command_exists java; then
    echo "❌ Java is not installed. Please install Java 17 or later."
    exit 1
fi

if ! command_exists node; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or later."
    exit 1
fi

if ! command_exists npm; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Setup backend environment
echo "🔧 Setting up backend environment..."
cd backend

if [ -f ".env" ]; then
    echo "📋 Backend .env file found"
else
    echo "📝 Creating backend .env file..."
    ../scripts/linux/backend/setup-env.sh
fi

cd ..

# Setup frontend environment
echo "🔧 Setting up frontend environment..."
cd frontend

echo "📝 Generating frontend environment files..."
../scripts/linux/frontend/setup-env.sh

cd ..

echo ""
echo "✅ Environment setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Edit backend/.env file with your actual credentials"
echo "2. Run 'npm install' in the frontend directory if not done already"
echo "3. Start the backend: scripts/linux/start-backend.sh"
echo "4. Start the frontend: cd frontend && npm start"
echo ""
echo "🔒 Security reminder:"
echo "- The .env file contains sensitive information and is in .gitignore"
echo "- Never commit the .env file to version control"
echo "- Use different credentials for development, staging, and production" 