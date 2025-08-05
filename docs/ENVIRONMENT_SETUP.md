# Environment Setup Guide

## Overview

MoneyPlant uses a centralized environment configuration approach where all sensitive information (secrets, passwords, API keys) are stored in a single `.env` file in the backend directory. This ensures security and makes configuration management easier.

## Quick Start

1. **Run the setup script:**
   ```bash
   ./start-application.sh
   ```

2. **Edit the environment file:**
   ```bash
   nano backend/.env
   ```

3. **Replace placeholder values with your actual credentials**

## Environment Variables

### Database Configuration
```bash
DB_HOST=postgres.tailce422e.ts.net
DB_PORT=5432
DB_NAME=MoneyPlant
DB_USERNAME=postgres
DB_PASSWORD=your_database_password_here
```

### OAuth2 Configuration
```bash
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
```

### JWT Configuration
```bash
JWT_SECRET=your_super_secret_jwt_key_at_least_256_bits_long_here
```

### CORS Configuration
```bash
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://your-frontend-domain.com
```

### Apache Trino Configuration
```bash
TRINO_URL=jdbc:trino://trino.tailce422e.ts.net:8080
TRINO_CATALOG=
TRINO_SCHEMA=
TRINO_USER=trino
TRINO_PASSWORD=
TRINO_SSL_ENABLED=false
```

### Trino PostgreSQL Configuration
```bash
TRINO_PG_HOST=postgres.tailce422e.ts.net
TRINO_PG_PORT=5432
TRINO_PG_DATABASE=MoneyPlant
TRINO_PG_USER=postgres
TRINO_PG_PASSWORD=your_trino_pg_password_here
```

### Application Configuration
```bash
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
SERVER_HOST=0.0.0.0
```

### Logging Configuration
```bash
LOGGING_LEVEL_ROOT=info
LOGGING_LEVEL_COM_MONEYPLANT=debug
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=debug
```

## Security Best Practices

1. **Never commit `.env` files to version control**
   - The `.env` file is already in `.gitignore`
   - Use `.env.example` as a template

2. **Use different credentials for different environments**
   - Development: Use test credentials
   - Staging: Use staging credentials
   - Production: Use production credentials

3. **Rotate secrets regularly**
   - Change passwords and API keys periodically
   - Use strong, unique passwords

4. **Limit access to environment files**
   - Only authorized personnel should have access
   - Use secure file permissions

## Setup Scripts

### Backend Setup
```bash
cd backend
./setup-env.sh
```

### Frontend Setup
```bash
cd frontend
./setup-env.sh
```

### Complete Application Setup
```bash
./start-application.sh
```

## Troubleshooting

### Common Issues

1. **Environment variables not loading:**
   - Ensure the `.env` file exists in the backend directory
   - Check file permissions
   - Verify the file format (no spaces around `=`)

2. **Frontend not connecting to backend:**
   - Verify `apiUrl` in frontend environment files
   - Check CORS configuration
   - Ensure backend is running

3. **OAuth not working:**
   - Verify client IDs and secrets are correct
   - Check redirect URIs match your configuration
   - Ensure OAuth providers are properly configured

### Debug Mode

To enable debug logging, set:
```bash
LOGGING_LEVEL_COM_MONEYPLANT=debug
LOGGING_LEVEL_ORG_SPRINGFRAMEWORK_SECURITY=debug
```

## Production Deployment

For production deployment:

1. **Create production environment file:**
   ```bash
   cp backend/.env backend/.env.prod
   ```

2. **Set production values:**
   - Use production database credentials
   - Use production OAuth credentials
   - Set appropriate CORS origins
   - Use strong JWT secrets

3. **Set environment variables on server:**
   ```bash
   export SPRING_PROFILES_ACTIVE=prod
   source backend/.env.prod
   ```

## File Structure

```
MoneyPlant/
├── backend/
│   ├── .env                    # Environment variables (not in git)
│   ├── setup-env.sh           # Backend environment setup
│   └── src/main/resources/
│       └── application.yml     # Spring Boot configuration
├── frontend/
│   ├── setup-env.sh           # Frontend environment setup
│   └── src/environments/
│       ├── environment.ts      # Development environment
│       └── environment.prod.ts # Production environment
├── start-application.sh       # Complete application setup
└── docs/
    └── ENVIRONMENT_SETUP.md   # This file
``` 