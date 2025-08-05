# JWT Authentication and Token Management

## Overview

The MoneyPlant application uses JWT (JSON Web Tokens) for authentication. This document explains how the token system works and how to handle token expiration.

## Token Configuration

### Backend Configuration

The JWT tokens are configured in the application properties:

```properties
# JWT Configuration
jwt.secret=your-256-bit-secret-key-here-make-it-long-and-secure-for-production
jwt.expiration=3600000        # 1 hour in milliseconds
jwt.refresh-expiration=86400000 # 24 hours in milliseconds
```

### Token Expiration Times

- **Access Token**: 1 hour (3,600,000 milliseconds)
- **Refresh Token**: 24 hours (86,400,000 milliseconds)

## Frontend Token Management

### Automatic Token Refresh

The application implements several mechanisms to handle token expiration:

1. **HTTP Interceptor**: Automatically catches 401 errors and attempts to refresh the token
2. **Periodic Refresh**: Refreshes tokens every 50 minutes to prevent expiration
3. **Page Load Check**: Validates token on page refresh and attempts refresh if expired

### Token Validation Flow

1. **On Page Load**: The `AuthService.checkAuthStatus()` method runs
2. **Token Check**: Validates if a token exists and is not expired
3. **Backend Validation**: If token exists and is not expired, validates with backend
4. **Auto Refresh**: If token is expired, attempts to refresh it
5. **Logout**: If refresh fails, redirects to login page

### HTTP Interceptor

The `AuthInterceptor` automatically handles 401 errors by:

1. Catching 401 responses (except for refresh endpoint)
2. Attempting to refresh the token
3. Retrying the original request with the new token
4. Redirecting to login if refresh fails

## Security Considerations

### JWT Secret

For production, generate a secure JWT secret:

```bash
# Generate a secure 256-bit secret
./backend/generate-jwt-secret.sh
```

### Environment Variables

In production, set the JWT secret as an environment variable:

```bash
export JWT_SECRET="your-generated-secret-here"
```

## Troubleshooting

### Common Issues

1. **Token Expired on Page Refresh**
   - The application should automatically refresh expired tokens
   - If this fails, check the browser console for errors
   - Ensure the backend refresh endpoint is working

2. **Redirected to Login Unexpectedly**
   - Check if the JWT secret is properly configured
   - Verify the token expiration times are reasonable
   - Check browser console for authentication errors

3. **Token Refresh Fails**
   - Ensure the backend `/api/auth/refresh` endpoint is accessible
   - Check that the token is valid before attempting refresh
   - Verify CORS configuration allows the refresh request

### Debugging

Enable debug logging in the frontend:

```typescript
// In auth.service.ts, add console.log statements
console.log('Token validation result:', result);
console.log('Token expiration check:', this.isTokenExpired());
```

## API Endpoints

### Authentication Endpoints

- `POST /api/auth/email-login` - Email-based login
- `GET /api/auth/validate` - Validate current token
- `POST /api/auth/refresh` - Refresh expired token
- `GET /oauth2/authorization/{provider}` - OAuth2 login

### Token Refresh Flow

1. Client sends expired token to `/api/auth/refresh`
2. Backend validates the expired token
3. If valid, generates a new token
4. Returns new token to client
5. Client updates stored token and continues

## Best Practices

1. **Never store sensitive data in JWT payload**
2. **Use HTTPS in production**
3. **Implement proper logout to clear tokens**
4. **Monitor token expiration and refresh success rates**
5. **Use environment variables for secrets in production** 