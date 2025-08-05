#!/bin/bash

# MoneyPlant Security Verification Script
# This script verifies that the secure configuration is properly set up

echo "🔍 MoneyPlant Security Verification"
echo "==================================="
echo ""

# Check if .env file exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "⚠️  .env file not found. Run ./setup-env.sh to create it."
fi

echo ""

# Check for required environment variables
echo "📋 Checking required environment variables:"
echo ""

required_vars=(
    "DB_PASSWORD"
    "GOOGLE_CLIENT_ID"
    "GOOGLE_CLIENT_SECRET"
    "MICROSOFT_CLIENT_ID"
    "MICROSOFT_CLIENT_SECRET"
    "JWT_SECRET"
    "TRINO_PG_PASSWORD"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ $var is not set"
        missing_vars+=("$var")
    else
        echo "✅ $var is set"
    fi
done

echo ""

# Check for hardcoded secrets in configuration files
echo "🔍 Checking for hardcoded secrets in configuration files:"
echo ""

config_files=(
    "src/main/resources/application.yml"
    "src/main/resources/application.properties"
    "src/main/resources/application-dev.properties"
)

secrets_found=false

for file in "${config_files[@]}"; do
    if [ -f "$file" ]; then
        # Check for common secret patterns
        if grep -q "mysecretpassword\|wjB8Q~" "$file"; then
            echo "❌ Hardcoded secrets found in $file"
            secrets_found=true
        else
            echo "✅ $file appears to be clean"
        fi
    fi
done

echo ""

# Summary
echo "📊 Summary:"
echo "==========="

if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "✅ All required environment variables are set"
else
    echo "❌ Missing environment variables: ${missing_vars[*]}"
    echo "   Run ./setup-env.sh and edit the .env file"
fi

if [ "$secrets_found" = false ]; then
    echo "✅ No hardcoded secrets found in configuration files"
else
    echo "❌ Hardcoded secrets found - please remove them"
fi

echo ""

# Recommendations
if [ ${#missing_vars[@]} -gt 0 ] || [ "$secrets_found" = true ]; then
    echo "🔧 Recommendations:"
    echo "1. Run ./setup-env.sh to create .env file"
    echo "2. Edit .env file with your actual values"
    echo "3. Source the environment: source .env"
    echo "4. Test the application: mvn spring-boot:run"
    echo "5. Commit changes: git add . && git commit -m 'Secure configuration'"
else
    echo "🎉 Security configuration looks good!"
    echo "You can now safely commit and push your changes."
fi

echo ""
echo "📖 For more information, see SECURE_CONFIGURATION.md" 