# NSE Provider - Lazy Session Initialization

## Overview

The NSE provider uses **lazy initialization** for session management. The session is initialized only when the first data request is made, not at application startup.

## Why Lazy Initialization?

### Benefits
1. **Faster Startup**: Application starts immediately without waiting for NSE session
2. **Resource Efficient**: No unnecessary network calls if NSE provider isn't used
3. **On-Demand**: Session is created only when actually needed
4. **Better Error Handling**: Session errors don't prevent application startup

### Trade-offs
- First data request takes ~2-4 seconds (includes session initialization)
- Subsequent requests are faster (~500ms-2s)

## Implementation

### Thread-Safe Initialization

```java
private volatile boolean sessionInitialized = false;

private synchronized void initializeNseSession() {
    // Double-check if already initialized (thread-safe)
    if (sessionInitialized) {
        log.debug("Session already initialized, skipping");
        return;
    }
    
    log.info("🔐 Initializing NSE session with cookie persistence...");
    
    // Visit NSE pages to establish session
    // ...
    
    sessionInitialized = true;
}
```

### Lazy Trigger

```java
@Override
public Mono<List<OhlcvData>> fetchHistorical(...) {
    // Lazy session initialization - only on first request
    if (!sessionInitialized) {
        log.info("First data request detected, initializing NSE session...");
        initializeNseSession();
    }
    
    // Make API call with established session
    // ...
}
```

## Execution Flow

### Application Startup
```
1. NseIndiaProvider constructor called
2. HttpClient created with cookie store
3. sessionInitialized = false
4. Log: "Session will be initialized lazily on first data request"
5. Application ready ✅
```

**Time**: ~100ms (no network calls)

### First Data Request
```
1. fetchHistorical() called
2. Check: sessionInitialized == false
3. Call initializeNseSession()
   a. Visit homepage (get cookies)
   b. Visit get-quotes page (get more cookies)
   c. Visit market-data page (get final cookies)
   d. sessionInitialized = true
4. Make API call with cookies
5. Return data ✅
```

**Time**: ~2-4 seconds (includes session init)

### Subsequent Data Requests
```
1. fetchHistorical() called
2. Check: sessionInitialized == true
3. Skip initialization
4. Make API call with existing cookies
5. Return data ✅
```

**Time**: ~500ms-2s (no session init)

## Thread Safety

### Scenario: Multiple Concurrent First Requests

```
Thread 1: fetchHistorical("RELIANCE")
Thread 2: fetchHistorical("TCS")
Thread 3: fetchHistorical("INFY")
```

**What Happens:**
1. All threads check `sessionInitialized == false`
2. All threads try to call `initializeNseSession()`
3. **synchronized** keyword ensures only one thread enters
4. First thread initializes session
5. Other threads wait at synchronized block
6. When they enter, they see `sessionInitialized == true` and return immediately
7. All threads proceed with their API calls

**Result**: Session initialized exactly once ✅

## Logging Timeline

### Startup Logs
```
[INFO] NseIndiaProvider initialized with Apache HttpClient 5 and persistent cookie store
[INFO] Session will be initialized lazily on first data request
```

### First Request Logs
```
[INFO] Fetching historical data from NSE India for symbol: RELIANCE from 2024-01-01 to 2024-01-31
[INFO] First data request detected, initializing NSE session...
[INFO] 🔐 Initializing NSE session with cookie persistence...
[DEBUG] 📍 Step 1/3: Visiting NSE homepage
[DEBUG] Homepage response: 200 - Cookies in store: 3
[DEBUG] 📍 Step 2/3: Visiting get-quotes/equity page
[DEBUG] Get-quotes response: 200 - Cookies in store: 5
[DEBUG] 📍 Step 3/3: Visiting market-data page
[DEBUG] Market-data response: 200 - Cookies in store: 7
[INFO] ✅ NSE session initialized successfully with 7 cookies
[DEBUG] Cookie: nsit = abc123...
[DEBUG] Cookie: nseappid = xyz789...
[DEBUG] Making request to: https://www.nseindia.com/api/historical...
[DEBUG] Cookies in store: 7
[INFO] ✅ Successfully fetched 21 historical records for RELIANCE from NSE India
```

### Subsequent Request Logs
```
[INFO] Fetching historical data from NSE India for symbol: TCS from 2024-01-01 to 2024-01-31
[DEBUG] Making request to: https://www.nseindia.com/api/historical...
[DEBUG] Cookies in store: 7
[INFO] ✅ Successfully fetched 21 historical records for TCS from NSE India
```

Notice: No session initialization logs!

## Session Lifecycle

```
Application Start
    ↓
[No Session]
    ↓
First Data Request → Initialize Session
    ↓
[Session Active with Cookies]
    ↓
Subsequent Requests → Reuse Session
    ↓
403 Error? → Re-initialize Session
    ↓
[Fresh Session with New Cookies]
    ↓
Continue Processing
```

## Comparison: Eager vs Lazy

### Eager Initialization (Old Approach)
```java
public NseIndiaProvider(...) {
    // ...
    initializeNseSession(); // Blocks constructor
}
```

**Pros:**
- Session ready immediately
- First request is fast

**Cons:**
- ❌ Slows down application startup
- ❌ Wastes resources if provider not used
- ❌ Startup fails if NSE is down
- ❌ Unnecessary network calls

### Lazy Initialization (Current Approach)
```java
public NseIndiaProvider(...) {
    // ...
    log.info("Session will be initialized lazily");
}

public Mono<List<OhlcvData>> fetchHistorical(...) {
    if (!sessionInitialized) {
        initializeNseSession();
    }
    // ...
}
```

**Pros:**
- ✅ Fast application startup
- ✅ Resource efficient
- ✅ Startup succeeds even if NSE is down
- ✅ On-demand initialization

**Cons:**
- First request is slower (~2-4s vs ~500ms)

## Best Practices

### 1. Monitor First Request
The first request will be slower. This is expected and normal.

### 2. Health Checks
Health checks also trigger lazy initialization:
```java
@Override
public Mono<Boolean> isHealthy() {
    if (!sessionInitialized) {
        initializeNseSession();
    }
    // Test API call
}
```

### 3. Pre-warming (Optional)
If you want to pre-initialize the session, call health check:
```bash
curl http://localhost:8081/actuator/health
```

### 4. Session Re-initialization
If 403 occurs, session is automatically re-initialized:
```java
if (statusCode == 403) {
    sessionInitialized = false;
    initializeNseSession();
    // Retry
}
```

## Testing

### Test Lazy Initialization
```bash
# 1. Start application
mvn spring-boot:run

# 2. Check logs - should NOT see session initialization
# Expected: "Session will be initialized lazily on first data request"

# 3. Make first data request
curl -X POST http://localhost:8081/api/ingestion/historical \
  -H "Content-Type: application/json" \
  -d '{"symbol": "RELIANCE", "startDate": "2024-01-01", "endDate": "2024-01-31"}'

# 4. Check logs - should NOW see session initialization
# Expected: "First data request detected, initializing NSE session..."

# 5. Make second data request
curl -X POST http://localhost:8081/api/ingestion/historical \
  -H "Content-Type: application/json" \
  -d '{"symbol": "TCS", "startDate": "2024-01-01", "endDate": "2024-01-31"}'

# 6. Check logs - should NOT see session initialization again
# Expected: Direct API call without initialization
```

### Test Thread Safety
```bash
# Make multiple concurrent requests
for i in {1..5}; do
  curl -X POST http://localhost:8081/api/ingestion/historical \
    -H "Content-Type: application/json" \
    -d '{"symbol": "RELIANCE", "startDate": "2024-01-01", "endDate": "2024-01-31"}' &
done

# Check logs - should see session initialized only once
```

## Summary

Lazy initialization provides:
- ✅ **Fast startup**: Application ready immediately
- ✅ **Efficient**: Resources used only when needed
- ✅ **Resilient**: Startup succeeds even if NSE is down
- ✅ **Thread-safe**: Synchronized to prevent duplicate initialization
- ✅ **Transparent**: First request slightly slower, then normal

This approach balances performance, resource efficiency, and reliability.
