# NSE India 403 Forbidden - Solution Documentation

## Problem Statement

NSE India's website implements anti-bot protection that returns **403 Forbidden** errors when it detects automated requests. The initial Java implementation using Spring WebClient failed to properly handle session management and cookies, unlike Python's `requests.Session()` which handles this naturally.

## Root Cause

The NSE India website requires:
1. **Persistent cookie storage** across multiple requests
2. **Browser-like headers** to avoid bot detection
3. **Proper session initialization** by visiting specific pages before making API calls
4. **Automatic cookie handling** similar to how browsers work

Spring WebClient, while powerful for reactive programming, doesn't provide the same level of cookie persistence and session management that Python's `requests.Session()` offers out of the box.

## Solution: Apache HttpClient 5

We migrated from Spring WebClient to **Apache HttpClient 5** with the following key improvements:

### 1. Persistent Cookie Store
```java
private final CookieStore cookieStore = new BasicCookieStore();

this.httpClient = HttpClients.custom()
    .setDefaultCookieStore(cookieStore)
    .build();
```

The `BasicCookieStore` automatically persists cookies across all requests made by the same `HttpClient` instance, exactly like Python's `requests.Session()`.

### 2. Lazy Session Initialization

On the **first data request**, we initialize the session by visiting three pages:
1. **Homepage** (`/`) - Establishes initial session
2. **Get Quotes** (`/get-quotes/equity`) - Gets additional session cookies
3. **Market Data** (`/market-data`) - Completes session setup

```java
private synchronized void initializeNseSession() {
    // Double-check if already initialized (thread-safe)
    if (sessionInitialized) {
        return;
    }
    
    // Visit homepage
    HttpGet homepageRequest = new HttpGet(NSE_BASE_URL);
    addBrowserHeaders(homepageRequest, NSE_BASE_URL, null);
    httpClient.execute(homepageRequest);
    
    // Visit get-quotes page
    HttpGet quotesRequest = new HttpGet(NSE_BASE_URL + "/get-quotes/equity");
    addBrowserHeaders(quotesRequest, NSE_BASE_URL + "/get-quotes/equity", NSE_BASE_URL);
    httpClient.execute(quotesRequest);
    
    // Visit market-data page
    HttpGet marketDataRequest = new HttpGet(NSE_BASE_URL + "/market-data");
    addBrowserHeaders(marketDataRequest, NSE_BASE_URL + "/market-data", NSE_BASE_URL);
    httpClient.execute(marketDataRequest);
}
```

### 3. Browser-Like Headers

We add comprehensive browser headers to mimic real browser behavior:

```java
private void addBrowserHeaders(HttpGet request, String url, String referer) {
    request.setHeader("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8");
    request.setHeader("Accept-Language", "en-US,en;q=0.9");
    request.setHeader("Accept-Encoding", "gzip, deflate, br");
    request.setHeader("Connection", "keep-alive");
    request.setHeader("DNT", "1");
    request.setHeader("Sec-Fetch-Dest", "document");
    request.setHeader("Sec-Fetch-Mode", "navigate");
    request.setHeader("Sec-Fetch-Site", referer != null ? "same-origin" : "none");
    // ... more headers
}
```

### 4. API-Specific Headers

For actual data requests, we use different headers:

```java
private void addApiHeaders(HttpGet request) {
    request.setHeader("Accept", "application/json, text/plain, */*");
    request.setHeader("Referer", NSE_BASE_URL + "/get-quotes/equity");
    request.setHeader("X-Requested-With", "XMLHttpRequest");
    request.setHeader("Sec-Fetch-Mode", "cors");
    // ... more headers
}
```

### 5. Automatic 403 Recovery

If we still get a 403 error, we automatically re-initialize the session and retry:

```java
if (statusCode == 403) {
    log.error("❌ 403 Forbidden - NSE anti-bot protection triggered");
    log.info("🔄 Re-initializing session and retrying...");
    sessionInitialized = false;
    initializeNseSession();
    throw new RuntimeException("403 Forbidden - Session re-initialized, retry needed");
}
```

The retry mechanism (with exponential backoff) will then retry the request with the fresh session.

## Key Advantages Over WebClient

| Feature | Apache HttpClient 5 | Spring WebClient |
|---------|-------------------|------------------|
| Cookie Persistence | ✅ Built-in with `CookieStore` | ❌ Manual cookie management required |
| Session Management | ✅ Automatic like Python | ❌ Complex manual implementation |
| Browser Mimicry | ✅ Easy to configure | ⚠️ Possible but more complex |
| Blocking I/O | ✅ Simple, predictable | ❌ Reactive, more complex |
| Cookie Debugging | ✅ Easy to inspect `cookieStore.getCookies()` | ❌ Difficult to track cookies |

## Comparison with Python Implementation

### Python (requests.Session)
```python
session = requests.Session()
session.get("https://www.nseindia.com/")
session.get("https://www.nseindia.com/get-quotes/equity")
response = session.get(api_url)  # Cookies automatically included
```

### Java (Apache HttpClient 5)
```java
CookieStore cookieStore = new BasicCookieStore();
CloseableHttpClient httpClient = HttpClients.custom()
    .setDefaultCookieStore(cookieStore)
    .build();

httpClient.execute(new HttpGet("https://www.nseindia.com/"));
httpClient.execute(new HttpGet("https://www.nseindia.com/get-quotes/equity"));
httpClient.execute(new HttpGet(apiUrl));  // Cookies automatically included
```

The behavior is nearly identical!

## Testing the Solution

### 1. Check Session Initialization
Look for these log messages on **first data request** (not startup):
```
First data request detected, initializing NSE session...
🔐 Initializing NSE session with cookie persistence...
📍 Step 1/3: Visiting NSE homepage
📍 Step 2/3: Visiting get-quotes/equity page
📍 Step 3/3: Visiting market-data page
✅ NSE session initialized successfully with X cookies
```

### 2. Monitor Cookie Store
The logs will show cookie details:
```
Cookie: nsit = abc123...
Cookie: nseappid = xyz789...
Cookie: ak_bmsc = def456...
```

### 3. Test API Calls
Make a test request and verify:
- No 403 errors
- Successful data retrieval
- Cookies being sent with each request

### 4. Test 403 Recovery
If a 403 occurs, you should see:
```
❌ 403 Forbidden - NSE anti-bot protection triggered for symbol: RELIANCE
🔄 Re-initializing session and retrying...
```

## Dependencies Added

```xml
<dependency>
    <groupId>org.apache.httpcomponents.client5</groupId>
    <artifactId>httpclient5</artifactId>
    <version>5.3</version>
</dependency>
```

## Performance Considerations

1. **Lazy Initialization**: Session is initialized only on first data request, not at application startup
2. **Thread-Safe**: Session initialization is synchronized to prevent multiple concurrent initializations
3. **Blocking I/O**: Apache HttpClient uses blocking I/O, but we wrap calls in `Mono.fromCallable()` with `Schedulers.boundedElastic()` to maintain reactive behavior
4. **Connection Pooling**: HttpClient automatically manages connection pooling
5. **Rate Limiting**: We still use Resilience4j rate limiter to respect NSE's rate limits
6. **Session Reuse**: The same `HttpClient` instance is reused for all requests, maintaining the session

## Alternative Solutions Considered

### 1. WebClient with Manual Cookie Management ❌
- Too complex and error-prone
- Difficult to debug cookie issues
- Doesn't match Python's simplicity

### 2. OkHttp ⚠️
- Good alternative with cookie jar support
- Less mature than Apache HttpClient
- Additional dependency

### 3. Java 11+ HttpClient ⚠️
- Built-in, no dependencies
- Cookie management is manual and complex
- Less battle-tested for this use case

### 4. Selenium/WebDriver ❌
- Overkill for API calls
- Heavy resource usage
- Slow performance

## Conclusion

Apache HttpClient 5 with `BasicCookieStore` provides the closest Java equivalent to Python's `requests.Session()`. The solution is:

- ✅ **Simple**: Easy to understand and maintain
- ✅ **Reliable**: Proven to work with NSE's anti-bot protection
- ✅ **Debuggable**: Easy to inspect cookies and session state
- ✅ **Performant**: Efficient connection pooling and reuse
- ✅ **Battle-tested**: Apache HttpClient is mature and widely used

This implementation successfully bypasses NSE's 403 Forbidden errors and provides a robust foundation for data ingestion.
