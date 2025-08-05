#!/bin/bash

# MoneyPlant Frontend Environment Setup Script
# This script generates frontend environment files from environment variables

echo "🔐 MoneyPlant Frontend Environment Setup"
echo "=========================================="
echo ""

# Check if we're in the frontend directory
if [ ! -f "angular.json" ]; then
    echo "❌ This script must be run from the frontend directory"
    exit 1
fi

# Check if .env file exists in the backend directory
if [ -f "../backend/.env" ]; then
    echo "📋 Loading environment variables from backend .env file..."
    set -a  # automatically export all variables
    source ../backend/.env
    set +a  # stop automatically exporting
else
    echo "⚠️  Backend .env file not found. Using default values..."
    # Set default values
    GOOGLE_CLIENT_ID="your-google-client-id"
    MICROSOFT_CLIENT_ID="your-microsoft-client-id"
fi

echo "📝 Generating frontend environment files..."
echo ""

# Generate development environment
cat > src/environments/environment.ts << EOF
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  useMockData: true,
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: '${GOOGLE_CLIENT_ID:-your-google-client-id}', // Replace with your Google Client ID
      redirectUri: 'http://localhost:4200'
    },
    microsoft: {
      clientId: '${MICROSOFT_CLIENT_ID:-your-microsoft-client-id}', // Replace with your Microsoft Azure AD Client ID
      redirectUri: 'http://localhost:4200'
    }
  }
};
EOF

# Generate production environment
cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: '/api', // In production, the API is typically served from the same domain
  useMockData: false,
  
  // OAuth Configuration
  oauth: {
    google: {
      clientId: '${GOOGLE_CLIENT_ID:-your-google-client-id}', // Replace with your Google Client ID
      redirectUri: window.location.origin
    },
    microsoft: {
      clientId: '${MICROSOFT_CLIENT_ID:-your-microsoft-client-id}', // Replace with your Microsoft Azure AD Client ID
      redirectUri: window.location.origin
    }
  }
};
EOF

echo "✅ Frontend environment files generated successfully!"
echo ""
echo "📋 Generated files:"
echo "- src/environments/environment.ts (development)"
echo "- src/environments/environment.prod.ts (production)"
echo ""
echo "🔒 Security reminder: Client IDs are not sensitive secrets and can be safely included in frontend code."
echo "However, client secrets should never be included in frontend code." 