# Engines API Integration

## Overview

The MoneyPlant application has been updated to properly integrate with the engines module, which runs separately from the main backend and provides specialized functionality for data ingestion, real-time streaming, and analytics.

## Architecture

- **Main Backend**: Runs on port 8080, handles core application functionality (users, portfolios, transactions, etc.)
- **Engines Module**: Runs on port 8081 with context path `/engines`, handles specialized services like NSE indices data ingestion

## Changes Made

### 1. New Engines API Service

Created `EnginesApiService` (`frontend/src/app/services/apis/engines-api.base.ts`) that:
- Connects to the engines module on port 8081
- Provides HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Includes retry logic and error handling
- Supports authentication headers

### 2. Updated NSE Indices Service

Modified `NseIndicesService` (`frontend/src/app/services/apis/nse-indices.api.ts`) to:
- Use `EnginesApiService` instead of the main `ApiService`
- Call engines endpoints for all NSE indices operations
- Maintain the same public API interface

### 3. Environment Configuration

Updated environment files to include engines API URL:
- **Development**: `http://localhost:8081/engines`
- **Production**: `/engines` (relative to same domain)

### 4. CORS Configuration

Added CORS configuration to the engines module:
- Created `CorsConfig.java` in engines module
- Allows frontend origin `http://localhost:4200`
- Supports all HTTP methods (GET, POST, PUT, DELETE, OPTIONS, PATCH)
- Allows credentials and custom headers

## API Endpoints

The NSE indices service now calls these engines endpoints:

- **Ingestion Status**: `http://localhost:8081/engines/api/nse-indices/ingestion/status`
- **Latest Data**: `http://localhost:8081/engines/api/nse-indices/data/latest`
- **Start Ingestion**: `http://localhost:8081/engines/api/nse-indices/ingestion/start`
- **Stop Ingestion**: `http://localhost:8081/engines/api/nse-indices/ingestion/stop`
- **WebSocket Health**: `http://localhost:8081/engines/api/nse-indices/health/websocket`

## Setup Requirements

### 1. Start Both Services

```bash
# Terminal 1: Start main backend
cd scripts/linux
./start-backend.sh

# Terminal 2: Start engines module
cd scripts/linux/engines
./start-engines.sh
```

### 2. Verify Services

- Main Backend: http://localhost:8080
- Engines Module: http://localhost:8081/engines
- Health Check: http://localhost:8081/engines/actuator/health

### 3. Test CORS Configuration

Run the test script to verify endpoints and CORS:
```bash
cd frontend
node test-engines-api.js
```

## Usage

The NSE indices service can now be used normally in components:

```typescript
import { NseIndicesService } from '../../services/apis/nse-indices.api';

constructor(private nseIndicesService: NseIndicesService) {}

// These calls now go to the engines module
this.nseIndicesService.getIngestionStatus().subscribe(...);
this.nseIndicesService.getLatestIndicesData().subscribe(...);
```

## Benefits

1. **Proper Separation**: Core backend and engines functionality are now properly separated
2. **Scalability**: Engines module can be scaled independently
3. **Maintainability**: Clear separation of concerns
4. **Performance**: Engines module can be optimized for data processing tasks

## Troubleshooting

### Common Issues

1. **404 Errors**: Ensure both services are running
2. **Connection Refused**: Check if engines module is running on port 8081
3. **CORS Issues**: Verify engines module CORS configuration

### CORS Troubleshooting

If you see CORS errors like:
```
Access to XMLHttpRequest at 'http://localhost:8081/engines/api/nse-indices/...' from origin 'http://localhost:4200' has been blocked by CORS policy
```

**Solutions:**
1. **Restart engines module** after CORS configuration changes
2. **Verify CORS config** is properly loaded
3. **Check CORS headers** using the test script
4. **Clear browser cache** and reload

### Debug Steps

1. Check if engines module is running: `curl http://localhost:8081/engines/actuator/health`
2. Verify endpoint exists: `curl http://localhost:8081/engines/api/nse-indices/ingestion/status`
3. Test CORS configuration: `node frontend/test-engines-api.js`
4. Check browser console for detailed error messages

### CORS Test Commands

```bash
# Test basic connectivity
curl -v http://localhost:8081/engines/actuator/health

# Test CORS preflight
curl -v -X OPTIONS \
  -H "Origin: http://localhost:4200" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  http://localhost:8081/engines/api/nse-indices/ingestion/start
```

## Future Enhancements

1. **Load Balancing**: Multiple engines instances
2. **Service Discovery**: Dynamic engines endpoint discovery
3. **Circuit Breaker**: Handle engines service failures gracefully
4. **Metrics**: Monitor engines API performance
5. **CORS Management**: Dynamic CORS configuration based on environment
