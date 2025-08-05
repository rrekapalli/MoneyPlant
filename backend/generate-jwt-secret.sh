#!/bin/bash

# Generate a secure JWT secret for production
# This script generates a 256-bit (32-byte) random secret encoded in base64

echo "Generating secure JWT secret for production..."
SECRET=$(openssl rand -base64 32)
echo "Generated JWT secret:"
echo "$SECRET"
echo ""
echo "Add this to your application.properties or environment variables:"
echo "jwt.secret=$SECRET"
echo ""
echo "⚠️  IMPORTANT: Keep this secret secure and do not commit it to version control!" 