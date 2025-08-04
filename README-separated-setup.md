# MoneyPlant - Separated Development Setup

This setup allows the frontend (Angular) and backend (Spring Boot) to be developed independently by different teams.

## Project Structure

```
MoneyPlant/
├── frontend/          # Angular application (port 4200)
├── backend/           # Spring Boot application (port 8080)
├── start-frontend.sh  # Script to start frontend
├── start-backend.sh   # Script to start backend
└── build-production.sh # Script to build production version
```

## Development Mode

### Prerequisites
- Node.js (v20.19.0 or later)
- npm (v9.5.1 or later)
- Java 17 or later
- Maven 3.6 or later

### Running Backend Only
```bash
./start-backend.sh
```
- Backend will be available at: http://localhost:8080
- API Documentation: http://localhost:8080/swagger-ui.html
- Health Check: http://localhost:8080/actuator/health

### Running Frontend Only
```bash
./start-frontend.sh
```
- Frontend will be available at: http://localhost:4200
- API requests will be proxied to backend at http://localhost:8080

### Running Both (Development)
1. Start backend first:
   ```bash
   ./start-backend.sh
   ```

2. In a new terminal, start frontend:
   ```bash
   ./start-frontend.sh
   ```

3. Access the application at: http://localhost:4200

## Production Build

To build the production version with frontend embedded in backend:

```bash
./build-production.sh
```

This will:
1. Build the Angular frontend
2. Copy the built files to backend's static resources
3. Build the Spring Boot application with embedded frontend
4. Create a single JAR file ready for deployment

## Configuration

### Backend Configuration
- Development config: `backend/application-dev.properties`
- CORS is configured to allow requests from http://localhost:4200
- All API endpoints are available under `/api/*`

### Frontend Configuration
- Proxy configuration: `frontend/proxy.conf.json`
- All API calls are proxied to backend at http://localhost:8080
- Development server runs on port 4200

## API Endpoints

The backend provides the following API endpoints:
- `/api/stock/*` - Stock management
- `/api/portfolio/*` - Portfolio management
- `/api/transaction/*` - Transaction management
- `/api/watchlist/*` - Watchlist management
- `/api/index/*` - Index management

## Development Workflow

### Backend Team
1. Work in the `backend/` directory
2. Use `./start-backend.sh` to run the application
3. API changes are immediately available at http://localhost:8080
4. Use Swagger UI for API testing: http://localhost:8080/swagger-ui.html

### Frontend Team
1. Work in the `frontend/` directory
2. Use `./start-frontend.sh` to run the application
3. Changes are hot-reloaded at http://localhost:4200
4. API calls are automatically proxied to backend

### Integration Testing
1. Start both applications
2. Frontend at http://localhost:4200 will communicate with backend at http://localhost:8080
3. All API calls are proxied through the Angular development server

## Benefits

1. **Independent Development**: Teams can work on frontend and backend simultaneously
2. **Hot Reloading**: Frontend changes are immediately reflected without restart
3. **API Testing**: Backend can be tested independently using Swagger UI
4. **Production Ready**: Single JAR file for deployment with embedded frontend
5. **CORS Handled**: No CORS issues during development due to proxy configuration

## Troubleshooting

### Port Conflicts
- Backend runs on port 8080
- Frontend runs on port 4200
- If ports are in use, modify the configuration files

### Proxy Issues
- Ensure backend is running before starting frontend
- Check `frontend/proxy.conf.json` for correct backend URL
- Verify CORS configuration in `backend/application-dev.properties`

### Build Issues
- Ensure Node.js and npm are installed
- Run `npm install` in frontend directory if dependencies are missing
- Check Maven configuration in backend directory 