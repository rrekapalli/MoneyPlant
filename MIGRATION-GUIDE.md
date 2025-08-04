# Migration Guide: Separated Frontend/Backend Development

## Overview

The MoneyPlant application has been restructured to allow independent development of frontend and backend components. This enables parallel development by different teams while maintaining the ability to build a single production deployment.

## What Changed

### Before
- Frontend and backend were tightly coupled
- Both ran on port 8080
- Frontend was embedded in backend's static resources
- Single Maven build process

### After
- Frontend and backend are separate applications
- Backend runs on port 8080
- Frontend runs on port 4200 with proxy to backend
- Independent development and build processes
- Production build still creates single JAR with embedded frontend

## New Directory Structure

```
MoneyPlant/
├── frontend/              # Angular application
│   ├── src/              # Angular source code
│   ├── package.json      # Node.js dependencies
│   ├── angular.json      # Angular configuration
│   └── proxy.conf.json   # Development proxy config
├── backend/               # Spring Boot application
│   ├── java/             # Java source code
│   ├── resources/        # Application properties
│   ├── pom.xml          # Maven configuration
│   └── application-dev.properties # Development config
├── start-frontend.sh     # Frontend startup script
├── start-backend.sh      # Backend startup script
├── build-production.sh   # Production build script
└── test-setup.sh        # Setup verification script
```

## Development Workflow

### For Backend Team

1. **Setup**:
   ```bash
   cd backend
   mvn clean install
   ```

2. **Development**:
   ```bash
   ./start-backend.sh
   ```

3. **Testing**:
   - API endpoints: http://localhost:8080
   - Swagger UI: http://localhost:8080/swagger-ui.html
   - Health check: http://localhost:8080/actuator/health

### For Frontend Team

1. **Setup**:
   ```bash
   cd frontend
   npm install
   ```

2. **Development**:
   ```bash
   ./start-frontend.sh
   ```

3. **Testing**:
   - Application: http://localhost:4200
   - API calls are proxied to backend at port 8080

### For Integration Testing

1. Start backend first:
   ```bash
   ./start-backend.sh
   ```

2. Start frontend in another terminal:
   ```bash
   ./start-frontend.sh
   ```

3. Access the full application at: http://localhost:4200

## Configuration Changes

### Backend Configuration

- **Development Profile**: Uses `application-dev.properties`
- **CORS**: Configured to allow requests from http://localhost:4200
- **Port**: 8080 (unchanged)

### Frontend Configuration

- **Development Server**: Port 4200
- **Proxy**: All API calls proxied to http://localhost:8080
- **Hot Reload**: Enabled for development

## Production Deployment

The production build process remains the same:

```bash
./build-production.sh
```

This creates a single JAR file with the frontend embedded in the backend's static resources, maintaining the original deployment model.

## Benefits

1. **Parallel Development**: Teams can work independently
2. **Hot Reloading**: Frontend changes are immediately visible
3. **API Testing**: Backend can be tested independently
4. **No CORS Issues**: Proxy handles cross-origin requests
5. **Production Ready**: Single JAR deployment still available

## Troubleshooting

### Common Issues

1. **Port Conflicts**:
   - Backend: 8080
   - Frontend: 4200
   - Check if ports are available

2. **Proxy Issues**:
   - Ensure backend is running before frontend
   - Check `frontend/proxy.conf.json` configuration

3. **CORS Errors**:
   - Verify CORS configuration in `backend/application-dev.properties`
   - Ensure frontend is accessing backend through proxy

4. **Build Issues**:
   - Frontend: Check Node.js and npm versions
   - Backend: Check Java and Maven versions

### Testing Setup

Run the test script to verify everything is working:

```bash
./test-setup.sh
```

## Migration Checklist

- [ ] Install Node.js and npm for frontend development
- [ ] Verify Java and Maven for backend development
- [ ] Test backend startup with `./start-backend.sh`
- [ ] Test frontend startup with `./start-frontend.sh`
- [ ] Verify proxy configuration works
- [ ] Test production build with `./build-production.sh`
- [ ] Update CI/CD pipelines if needed
- [ ] Update documentation for team members

## Support

For issues or questions:
1. Check the troubleshooting section
2. Run `./test-setup.sh` to diagnose issues
3. Review the README-separated-setup.md file
4. Check application logs for detailed error messages 