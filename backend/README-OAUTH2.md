# OAuth2 Authentication Implementation

This document describes the OAuth2 authentication implementation for the MoneyPlant application using Google and Microsoft as authentication providers.

## Features

- ✅ OAuth2 login with Google and Microsoft
- ✅ JWT token generation and validation
- ✅ User storage in PostgreSQL database
- ✅ CORS configuration for frontend integration
- ✅ Protected REST API endpoints
- ✅ Token refresh functionality
- ✅ Comprehensive unit tests
- ✅ Custom OAuth2 user service
- ✅ Stateless authentication with JWT

## Prerequisites

1. **PostgreSQL Database** - Already configured in your application
2. **Google OAuth2 Client** - Create a project in Google Cloud Console
3. **Microsoft OAuth2 Client** - Register an application in Azure Portal

## Setup Instructions

### 1. Google OAuth2 Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure the OAuth consent screen
6. Create a Web application client
7. Add authorized redirect URIs:
   - `http://localhost:8080/login/oauth2/code/google` (for development)
   - `https://your-domain.com/login/oauth2/code/google` (for production)
8. Copy the Client ID and Client Secret

### 2. Microsoft OAuth2 Setup

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Configure the application:
   - Name: MoneyPlant
   - Supported account types: Personal Microsoft accounts only
   - Redirect URI: Web → `http://localhost:8080/login/oauth2/code/microsoft`
5. After registration, go to "Certificates & secrets"
6. Create a new client secret
7. Copy the Application (client) ID and Client Secret

### 3. Environment Configuration

Create a `.env` file or set environment variables:

```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth2
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-that-should-be-at-least-256-bits-long

# CORS Configuration
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://your-frontend-domain.com
```

### 4. Database Migration

The application will automatically create the `users` table when it starts. The table structure includes:

- `id` - Primary key
- `email` - User's email address
- `first_name`, `last_name`, `full_name` - User's name
- `profile_picture_url` - Profile picture URL (Google only)
- `provider` - OAuth2 provider (GOOGLE or MICROSOFT)
- `provider_user_id` - User ID from the provider
- `is_enabled` - Account status
- `last_login` - Last login timestamp
- `created_at`, `updated_at` - Audit timestamps

## API Endpoints

### Public Endpoints

- `GET /api/public/health` - Health check
- `GET /api/public/oauth2/authorization/{provider}` - Initiate OAuth2 login

### Authentication Endpoints

- `GET /api/auth/me` - Get current user info
- `POST /api/auth/refresh` - Refresh JWT token
- `POST /api/auth/logout` - Logout (client-side token removal)

### Protected Endpoints

- `GET /api/protected/user-info` - Get detailed user information
- `GET /api/admin/users` - Get all users (requires ADMIN role)

### OAuth2 Endpoints

- `GET /oauth2/authorization/google` - Google OAuth2 login
- `GET /oauth2/authorization/microsoft` - Microsoft OAuth2 login

## Frontend Integration

### 1. Login Flow

```javascript
// Redirect to OAuth2 login
window.location.href = 'http://localhost:8080/oauth2/authorization/google?redirect_uri=http://localhost:4200';
```

### 2. Handle OAuth2 Callback

```javascript
// Check for token in URL parameters
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const error = urlParams.get('error');

if (token) {
    localStorage.setItem('authToken', token);
    // Redirect to dashboard
} else if (error) {
    // Handle login error
    console.error('Login failed:', error);
}
```

### 3. API Calls with JWT

```javascript
// Make authenticated API calls
const response = await fetch('http://localhost:8080/api/auth/me', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
    }
});
```

## Security Configuration

### CORS Configuration

The application is configured to allow requests from your frontend domain:

```yaml
cors:
  allowed-origins: http://localhost:4200,https://your-frontend-domain.com
  allowed-methods: GET,POST,PUT,DELETE,OPTIONS
  allowed-headers: "*"
  allow-credentials: true
```

### JWT Configuration

```yaml
jwt:
  secret: your-super-secret-jwt-key-that-should-be-at-least-256-bits-long
  expiration: 86400000  # 24 hours
  refresh-expiration: 604800000  # 7 days
```

## Testing

### Run Unit Tests

```bash
mvn test
```

### Test OAuth2 Flow

1. Start the application:
   ```bash
   mvn spring-boot:run
   ```

2. Open the frontend example:
   ```bash
   open frontend-example.html
   ```

3. Test the login flow with Google or Microsoft

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your frontend domain is in the `cors.allowed-origins` configuration
2. **Invalid Redirect URI**: Verify the redirect URI matches exactly in your OAuth2 provider settings
3. **JWT Token Expired**: Implement token refresh logic in your frontend
4. **Database Connection**: Ensure PostgreSQL is running and accessible

### Debug Mode

Enable debug logging by adding to `application.yml`:

```yaml
logging:
  level:
    com.moneyplant: debug
    org.springframework.security: debug
```

## Production Deployment

### Security Considerations

1. **JWT Secret**: Use a strong, randomly generated secret key
2. **HTTPS**: Always use HTTPS in production
3. **Environment Variables**: Store sensitive configuration in environment variables
4. **Token Expiration**: Consider shorter token expiration times for better security
5. **Rate Limiting**: Implement rate limiting for authentication endpoints

### Environment Variables

```bash
# Production environment variables
export GOOGLE_CLIENT_ID=your-production-google-client-id
export GOOGLE_CLIENT_SECRET=your-production-google-client-secret
export MICROSOFT_CLIENT_ID=your-production-microsoft-client-id
export MICROSOFT_CLIENT_SECRET=your-production-microsoft-client-secret
export JWT_SECRET=your-production-jwt-secret
export CORS_ALLOWED_ORIGINS=https://your-production-domain.com
```

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Spring Boot   │    │   PostgreSQL    │
│   (Angular)     │◄──►│   Application   │◄──►│   Database      │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Google OAuth2 │    │   Microsoft     │    │   JWT Token     │
│   Provider      │    │   OAuth2        │    │   Validation    │
└─────────────────┘    │   Provider      │    └─────────────────┘
                       └─────────────────┘
```

## File Structure

```
backend/src/main/java/com/moneyplant/
├── app/
│   └── config/
│       └── SecurityConfig.java          # Main security configuration
├── core/
│   ├── controller/
│   │   └── AuthController.java          # Authentication endpoints
│   ├── entity/
│   │   └── User.java                   # User entity
│   ├── repository/
│   │   └── UserRepository.java         # User database operations
│   └── security/
│       ├── CustomOAuth2UserService.java # OAuth2 user processing
│       ├── CustomUserDetailsService.java # User details service
│       ├── JwtAuthenticationFilter.java # JWT authentication filter
│       └── JwtTokenProvider.java       # JWT token utilities
└── test/
    └── java/com/moneyplant/core/
        ├── controller/
        │   └── AuthControllerTest.java  # Controller tests
        └── security/
            └── JwtTokenProviderTest.java # JWT provider tests
```

## Next Steps

1. **Implement Token Blacklisting**: For better security, implement a token blacklist for logout
2. **Add Role-Based Access**: Implement more granular role-based access control
3. **Add Two-Factor Authentication**: Implement 2FA for additional security
4. **Add Account Linking**: Allow users to link multiple OAuth2 providers
5. **Add User Profile Management**: Implement user profile update functionality
6. **Add Email Verification**: Implement email verification for new accounts
7. **Add Password Reset**: Implement password reset functionality for OAuth2 users

## Support

For issues or questions, please refer to:
- Spring Security documentation: https://docs.spring.io/spring-security/reference/
- OAuth2 specification: https://oauth.net/2/
- JWT specification: https://jwt.io/ 