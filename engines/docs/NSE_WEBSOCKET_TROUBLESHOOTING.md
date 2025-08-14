# NSE WebSocket Connection Troubleshooting

## Current Status

The NSE WebSocket connection is currently experiencing issues connecting to `wss://www.nseindia.com/streams/indices/high/drdMkt`. This is a common issue with NSE (National Stock Exchange of India) WebSocket endpoints due to their strict security requirements.

## Issues Identified

### 1. **Authentication Requirements**
NSE WebSocket endpoints require:
- Valid session cookies
- Proper authentication headers
- Referer validation
- User-Agent validation
- Origin validation

### 2. **WebSocket URL Issues**
The current URL `wss://www.nseindia.com/streams/indices/high/drdMkt` may be:
- Incorrect or outdated
- Requiring different authentication
- Blocked by NSE's security policies

### 3. **Network Restrictions**
NSE may be:
- Blocking connections from certain IP ranges
- Requiring VPN or specific network access
- Implementing rate limiting

## Solutions Implemented

### 1. **Enhanced Configuration**
Updated `application.yml` with:
```yaml
nse:
  websocket:
    url: wss://www.nseindia.com/streams/indices/high/drdMkt
    alternative-urls:
      - wss://www.nseindia.com/streams/indices/high/drdMkt
      - wss://www.nseindia.com/streams/indices/low/drdMkt
      - wss://www.nseindia.com/streams/indices/medium/drdMkt
    headers:
      user-agent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
      origin: "https://www.nseindia.com"
      referer: "https://www.nseindia.com/get-quotes/equity"
      # ... additional headers
```

### 2. **Improved Connection Logic**
- Multiple URL fallback system
- Enhanced headers for authentication
- Exponential backoff reconnection
- Better error handling

### 3. **Fallback System**
- Mock data generation when WebSocket fails
- Configurable fallback intervals
- Graceful degradation

## Testing Steps

### 1. **Check Current Configuration**
```bash
# Verify the configuration is loaded
grep -A 20 "nse:" engines/src/main/resources/application.yml
```

### 2. **Test WebSocket Connection Manually**
```bash
# Test basic connectivity
curl -I "https://www.nseindia.com"

# Test WebSocket endpoint (if accessible)
wscat -c "wss://www.nseindia.com/streams/indices/high/drdMkt" \
  -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
  -H "Origin: https://www.nseindia.com" \
  -H "Referer: https://www.nseindia.com/get-quotes/equity"
```

### 3. **Monitor Application Logs**
```bash
# Start the application and watch logs
./start-engines.sh

# Look for WebSocket connection attempts
grep -i "websocket\|nse\|connection" logs/application.log
```

## Alternative Solutions

### 1. **Use NSE REST API Instead**
Consider using NSE's REST API endpoints for data retrieval:
```java
// Example REST API call
@Value("${nse.api.base-url:https://www.nseindia.com/api}")
private String nseApiBaseUrl;

@Value("${nse.api.indices-endpoint:/get-quotes/equity}")
private String indicesEndpoint;
```

### 2. **Third-Party Data Providers**
Consider alternative data sources:
- Alpha Vantage
- Yahoo Finance API
- Polygon.io
- IEX Cloud

### 3. **Browser-Based Scraping**
Use Selenium or Playwright to:
- Navigate to NSE website
- Extract data from the DOM
- Handle authentication properly

## Current Fallback Behavior

When NSE WebSocket fails:
1. **Connection Attempts**: Up to 5 attempts with exponential backoff
2. **Alternative URLs**: Tries multiple NSE endpoints
3. **Mock Data**: Generates realistic mock data every 5 seconds
4. **Kafka Publishing**: Continues to publish data to Kafka topics
5. **WebSocket Broadcasting**: Maintains frontend connectivity

## Next Steps

### 1. **Immediate Actions**
- [x] Enable enhanced logging for WebSocket connections
- [x] Implement fallback mock data generation
- [x] Add multiple URL fallback system
- [x] Improve error handling and reconnection logic

### 2. **Investigation Required**
- [ ] Verify correct NSE WebSocket endpoints
- [ ] Test with proper NSE authentication
- [ ] Check network connectivity and firewall rules
- [ ] Research NSE's current WebSocket policies

### 3. **Alternative Implementation**
- [ ] Implement NSE REST API integration
- [ ] Set up browser-based data extraction
- [ ] Integrate with third-party data providers
- [ ] Create hybrid data source system

## Configuration Files

### `application.yml`
- Main NSE WebSocket configuration
- Headers and authentication settings
- Fallback configuration

### `application-docker.yml`
- Docker-specific NSE WebSocket settings
- Mirrors main configuration

## Monitoring and Debugging

### 1. **Enable Debug Logging**
```yaml
logging:
  level:
    com.moneyplant.engines: DEBUG
    org.springframework.web.socket: DEBUG
    org.springframework.web.socket.client: DEBUG
```

### 2. **WebSocket Connection Status**
```java
// Check connection status
@Autowired
private NseIndicesService nseIndicesService;

boolean isConnected = nseIndicesService.isWebSocketConnected();
String stats = nseIndicesService.getConnectionStats();
```

### 3. **Health Check Endpoint**
```java
@GetMapping("/health/websocket")
public ResponseEntity<Map<String, Object>> getWebSocketHealth() {
    Map<String, Object> health = new HashMap<>();
    health.put("connected", nseIndicesService.isWebSocketConnected());
    health.put("stats", nseIndicesService.getConnectionStats());
    return ResponseEntity.ok(health);
}
```

## Support and Resources

### 1. **NSE Documentation**
- [NSE Official Website](https://www.nseindia.com)
- [NSE API Documentation](https://www.nseindia.com/api-documentation)
- [NSE WebSocket Guide](https://www.nseindia.com/websocket-guide)

### 2. **Community Resources**
- Stack Overflow: NSE WebSocket questions
- GitHub: Open-source NSE integration projects
- Reddit: r/IndiaInvestments technical discussions

### 3. **Contact Information**
- NSE Technical Support: tech-support@nseindia.com
- NSE API Support: api-support@nseindia.com

## Conclusion

The NSE WebSocket connection issues are primarily due to:
1. **Authentication requirements** that are difficult to meet programmatically
2. **Security policies** that block automated connections
3. **Endpoint changes** that may have occurred without public notice

The implemented fallback system ensures the application continues to function while providing realistic mock data. For production use, consider:
- Using NSE's official REST API
- Partnering with authorized data providers
- Implementing browser-based data extraction
- Setting up proper NSE authentication workflows
