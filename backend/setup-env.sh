#!/bin/bash

# MoneyPlant Environment Setup Script
# This script helps you set up environment variables for development

echo "🔐 MoneyPlant Environment Setup"
echo "================================"
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "⚠️  .env file already exists. Do you want to overwrite it? (y/N)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Setup cancelled."
        exit 0
    fi
fi

echo "📝 Creating .env file with comprehensive template..."
echo ""

# Create .env file with comprehensive template
cat > .env << 'EOF'
# =============================================================================
# MoneyPlant Environment Configuration
# =============================================================================
# This file contains all environment variables for the MoneyPlant application.
# DO NOT commit this file to version control - it contains sensitive information.
# Copy this file to .env.local for local development and set actual values.

# =============================================================================
# Database Configuration
# =============================================================================
DB_HOST=postgres.tailce422e.ts.net
DB_PORT=5432
DB_NAME=MoneyPlant
DB_USERNAME=postgres
DB_PASSWORD=your_database_password_here

# =============================================================================
# OAuth2 Configuration
# =============================================================================
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here

# =============================================================================
# JWT Configuration
# =============================================================================
JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long_here

# =============================================================================
# CORS Configuration
# =============================================================================
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://your-frontend-domain.com

# =============================================================================
# Apache Trino Configuration
# =============================================================================
TRINO_URL=jdbc:trino://trino.tailce422e.ts.net:8080
TRINO_CATALOG=
TRINO_SCHEMA=
TRINO_USER=trino
TRINO_PASSWORD=
TRINO_SSL_ENABLED=false

# =============================================================================
# Trino PostgreSQL Configuration
# =============================================================================
TRINO_PG_HOST=postgres.tailce422e.ts.net
TRINO_PG_PORT=5432
TRINO_PG_DATABASE=MoneyPlant
TRINO_PG_USER=postgres
TRINO_PG_PASSWORD=your_trino_pg_password_here

# =============================================================================
# Application Configuration
# =============================================================================
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
SERVER_HOST=0.0.0.0

# =============================================================================
# Logging Configuration
# =============================================================================
LOGGING_LEVEL_ROOT=info
LOGGING_LEVEL_COM_MONEYPLANT=debug
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=debug
EOF

echo "✅ .env file created successfully!"
echo ""
echo "📋 Next steps:"
echo "1. Edit the .env file and replace the placeholder values with your actual credentials"
echo "2. Source the environment variables: source .env"
echo "3. Start your application"
echo ""
echo "🔒 Security reminder: The .env file is already in .gitignore and will not be committed to the repository."
echo ""
echo "📖 For more information, see docs/ENVIRONMENT_SETUP.md" 