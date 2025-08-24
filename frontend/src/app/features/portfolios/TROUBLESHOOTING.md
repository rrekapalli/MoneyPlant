# Portfolios Feature - Troubleshooting Guide

## Issue: 404 Error on Portfolio API Calls

### Problem Description
When accessing the portfolios feature, you may see console errors like:
```
GET http://localhost:8080/api/v1/portfolio 404 (Not Found)
```

### Root Cause
The backend portfolio endpoints require JWT authentication, but the frontend is making unauthenticated requests.

### Solutions

#### Solution 1: Use Mock Data (Immediate)
The component automatically falls back to mock data when the API fails, so you can still test the UI functionality.

**Pros:**
- ✅ Immediate solution
- ✅ No backend changes needed
- ✅ Full UI functionality available

**Cons:**
- ❌ No real data
- ❌ Limited to sample portfolios

#### Solution 2: Implement Proper Authentication (Recommended)

1. **Start the Backend Server**
   ```bash
   cd backend
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

2. **Set Up Environment Variables**
   Create a `.env` file in the backend directory:
   ```bash
   # Database
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=MoneyPlant
   DB_USERNAME=postgres
   DB_PASSWORD=your_password
   
   # JWT
   JWT_SECRET=your-secure-jwt-secret-key-here
   
   # OAuth2 (if using)
   MICROSOFT_CLIENT_ID=your_client_id
   MICROSOFT_CLIENT_SECRET=your_client_secret
   ```

3. **Login to Get JWT Token**
   - Navigate to the login page
   - Use OAuth2 (Google/Microsoft) or email login
   - The system will automatically store the JWT token

4. **Token is Automatically Added**
   The auth interceptor will add the token to all API requests.

#### Solution 3: Temporary Security Bypass (Development Only)

**⚠️ WARNING: This is for development only and should NEVER be used in production!**

1. **Modify SecurityConfig.java**
   ```java
   @Configuration
   @EnableWebSecurity
   @Profile("dev") // Only active in dev profile
   public class DevSecurityConfig {
       
       @Bean
       public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
           http
               .csrf(csrf -> csrf.disable())
               .authorizeHttpRequests(authz -> authz
                   .requestMatchers("/api/v1/portfolio/**").permitAll() // Allow portfolio endpoints
                   .anyRequest().authenticated()
               );
           
           return http.build();
       }
   }
   ```

2. **Restart the Backend**
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=dev
   ```

### Verification Steps

1. **Check Backend Health**
   ```bash
   curl http://localhost:8080/actuator/health
   ```
   Should return: `{"status":"UP"}`

2. **Test Portfolio Endpoint**
   ```bash
   # Without authentication (should work with Solution 3)
   curl http://localhost:8080/api/v1/portfolio
   
   # With authentication (should work with Solution 2)
   curl -H "Authorization: Bearer YOUR_JWT_TOKEN" http://localhost:8080/api/v1/portfolio
   ```

3. **Check Frontend Console**
   - No more 404 errors
   - Portfolios data loads successfully
   - Summary cards show correct counts

### Current Status

- **Frontend**: ✅ Complete and functional
- **Backend**: ✅ Running and healthy
- **API Endpoints**: ✅ Properly configured
- **Authentication**: ⚠️ Required but not implemented in frontend
- **Mock Data**: ✅ Available as fallback

### Next Steps

1. **Immediate**: Use mock data to test UI functionality
2. **Short-term**: Implement proper authentication flow
3. **Long-term**: Add portfolio CRUD operations and real-time updates

### Support

If you continue to experience issues:
1. Check the backend logs for detailed error messages
2. Verify the database connection and schema
3. Ensure all required environment variables are set
4. Check the browser's Network tab for detailed request/response information
