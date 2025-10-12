# Screener Security Infrastructure Integration

This document describes how the criteria builder API integrates with the existing screener security infrastructure.

## Overview

The criteria builder API leverages the existing MoneyPlant screener security infrastructure to provide:

1. **JWT Authentication** - Uses existing `ScreenerJwtAuthenticationFilter`
2. **Rate Limiting** - Implements screener-specific rate limiting
3. **CORS Configuration** - Applies existing CORS settings
4. **Security Headers** - Adds API-specific security headers
5. **Audit Logging** - Integrates with existing audit logging patterns

## Security Components

### 1. JWT Authentication Filter (`ScreenerJwtAuthenticationFilter`)

- **Purpose**: Authenticates requests using JWT tokens
- **Integration**: Uses existing `JwtTokenProvider` from core security
- **User Context**: Sets user ID in security context for screener services
- **Location**: `com.moneyplant.screener.security.ScreenerJwtAuthenticationFilter`

### 2. Rate Limiting Filter (`ScreenerRateLimitingFilter`)

- **Purpose**: Prevents abuse by limiting requests per user
- **Configuration**: 
  - 100 requests per minute per user
  - 1000 requests per hour per user
- **Integration**: Uses `CriteriaAuditService` for logging violations
- **Headers**: Adds rate limit headers to responses
- **Location**: `com.moneyplant.screener.security.ScreenerRateLimitingFilter`

### 3. Security Headers Filter (`ScreenerSecurityHeadersFilter`)

- **Purpose**: Adds security headers to API responses
- **Headers Applied**:
  - `Strict-Transport-Security`
  - `X-Content-Type-Options`
  - `X-Frame-Options`
  - `X-XSS-Protection`
  - `Cache-Control` (API-specific)
- **Location**: `com.moneyplant.screener.security.ScreenerSecurityHeadersFilter`

### 4. Security Configuration (`ScreenerSecurityConfig`)

- **Purpose**: Configures security filter chain for screener endpoints
- **Order**: Higher precedence than main security config
- **Scope**: Applies only to `/api/screeners/**` endpoints
- **Integration**: Uses existing CORS configuration
- **Location**: `com.moneyplant.screener.config.ScreenerSecurityConfig`

## Security Flow

```
Request → ScreenerJwtAuthenticationFilter → ScreenerRateLimitingFilter → ScreenerSecurityHeadersFilter → Controller
```

1. **JWT Authentication**: Validates JWT token and sets user context
2. **Rate Limiting**: Checks user request limits and logs violations
3. **Security Headers**: Adds security headers to response
4. **Controller**: Processes authenticated request with user context

## Audit Logging Integration

The `CriteriaAuditService` integrates with existing screener audit logging:

- **Validation Events**: Logs criteria DSL validation attempts
- **SQL Generation**: Logs SQL generation from DSL
- **Field Access**: Logs field metadata access attempts
- **Function Access**: Logs function metadata access attempts
- **Execution Events**: Logs criteria execution attempts
- **Security Events**: Logs security violations and suspicious activity

## Configuration

Security settings are configured in `screener-security.properties`:

```properties
# Rate limiting
screener.security.rate-limit.enabled=true
screener.security.rate-limit.max-requests-per-minute=100
screener.security.rate-limit.max-requests-per-hour=1000

# Security headers
screener.security.headers.enabled=true
screener.security.headers.strict-transport-security=true

# Audit logging
screener.security.audit.enabled=true
screener.security.audit.log-validation-events=true
```

## Controller Security Annotations

All screener controllers use security annotations:

```java
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("isAuthenticated()")
public class ScreenerController {
    // Controller methods require authentication
}
```

## Integration Points

### 1. Existing JWT Infrastructure
- Uses `JwtTokenProvider` from core security
- Leverages existing token validation logic
- Maintains compatibility with existing authentication

### 2. Existing CORS Configuration
- Uses `CorsConfigurationSource` from main security config
- Applies same CORS rules as other API endpoints
- Maintains consistent cross-origin policy

### 3. Existing User Service
- Uses `CurrentUserService` for user context
- Maintains consistent user identification
- Integrates with existing user management

### 4. Existing Audit Patterns
- Follows existing logging patterns
- Uses structured logging format
- Integrates with existing monitoring

## Security Best Practices

1. **Authentication Required**: All endpoints require valid JWT
2. **Rate Limiting**: Prevents abuse and DoS attacks
3. **Input Validation**: All DSL inputs are validated server-side
4. **SQL Injection Prevention**: Uses parameterized queries exclusively
5. **Audit Logging**: All security events are logged
6. **Security Headers**: Proper security headers are applied
7. **CORS Policy**: Consistent cross-origin policy

## Monitoring and Alerting

Security events are logged with structured format for monitoring:

```
CRITERIA_SECURITY_EVENT - User: 123, Event: RATE_LIMIT_EXCEEDED, Details: ..., Timestamp: ...
```

These logs can be monitored for:
- Rate limit violations
- Authentication failures
- Unauthorized access attempts
- SQL injection attempts
- Suspicious activity patterns

## Testing Security

Security integration can be tested by:

1. **Authentication Tests**: Verify JWT validation
2. **Rate Limiting Tests**: Test request limits
3. **Authorization Tests**: Verify user permissions
4. **Audit Tests**: Verify security event logging
5. **Header Tests**: Verify security headers are applied

## Troubleshooting

Common security issues and solutions:

1. **Authentication Failures**: Check JWT token validity and format
2. **Rate Limiting**: Check user request patterns and limits
3. **CORS Issues**: Verify origin configuration
4. **Missing Headers**: Check security header filter configuration
5. **Audit Logging**: Verify audit service configuration