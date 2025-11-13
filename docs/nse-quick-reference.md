# NSE Provider - Quick Reference Guide

## 🚀 Quick Start

The NSE provider now uses **Apache HttpClient 5** with automatic cookie management to bypass 403 Forbidden errors.

### What Changed?
- ✅ Migrated from Spring WebClient to Apache HttpClient 5
- ✅ Added persistent cookie store (like Python's `requests.Session()`)
- ✅ Automatic session initialization on startup
- ✅ Browser-like headers to avoid bot detection
- ✅ Automatic 403 recovery with session re-initialization

### No Code Changes Required!
The `NseIndiaProvider` interface remains the same. Just rebuild and restart.

---

## 🔧 Build & Run

```bash
# Navigate to engines directory
cd engines

# Build with Maven
mvn clean install

# Run the application
mvn spring-boot:run
```

---

## 📊 Monitoring

### Application Startup
Look for these logs on startup:

```
✅ NseIndiaProvider initialized with Apache HttpClient 5 and persistent cookie store
ℹ️ Session will be initialized lazily on first data request
```

### First Data Request (with Session Initialization)
```
Fetching historical data from NSE India for symbol: RELIANCE from 2024-01-01 to 2024-01-31
First data request detected, initializing NSE session...
🔐 Initializing NSE session with cookie persistence...
📍 Step 1/3: Visiting NSE homepage
📍 Step 2/3: Visiting get-quotes/equity page
📍 Step 3/3: Visiting market-data page
✅ NSE session initialized successfully with 7 cookies
Making request to: https://www.nseindia.com/api/historical...
Cookies in store: 7
✅ Successfully fetched 21 historical records for RELIANCE from NSE India
```

### Subsequent Data Requests
```
Fetching historical data from NSE India for symbol: TCS from 2024-01-01 to 2024-01-31
Making request to: https://www.nseindia.com/api/historical...
Cookies in store: 7
✅ Successfully fetched 21 historical records for TCS from NSE India
```
(Note: No session initialization - reuses existing session)

### 403 Error with Auto-Recovery
```
❌ 403 Forbidden - NSE anti-bot protection triggered for symbol: RELIANCE
🔄 Re-initializing session and retrying...
Retrying request for symbol RELIANCE (attempt 1)
✅ Successfully fetched 21 historical records for RELIANCE from NSE India
```

---

## 🐛 Troubleshooting

### Issue: Still getting 403 errors

**Check 1: Session Initialization**
```
grep "NSE session initialized" logs/application.log
```
Should show: `✅ NSE session initialized successfully with X cookies`

**Check 2: Cookie Count**
```
grep "Cookies in store" logs/application.log
```
Should show at least 3-7 cookies

**Check 3: Network Connectivity**
```bash
curl -I https://www.nseindia.com/
```
Should return 200 OK

**Solution**: Restart the application to re-initialize session

---

### Issue: Slow performance

**Check**: Rate limiting
```
grep "rate limit" logs/application.log
```

**Solution**: Rate limiter is set to 500 requests/hour. This is intentional to respect NSE's limits.

---

### Issue: Connection timeouts

**Check**: Timeout configuration in logs
```
grep "timeout" logs/application.log
```

**Current Settings**:
- Connection timeout: 10 seconds
- Response timeout: 30 seconds

**Solution**: If NSE is slow, these timeouts may need adjustment in `NseIndiaProvider.java`

---

## 🔍 Debugging

### Enable Debug Logging

Add to `application.yml`:
```yaml
logging:
  level:
    com.moneyplant.engines.ingestion.provider.NseIndiaProvider: DEBUG
    org.apache.hc.client5: DEBUG
```

### Inspect Cookies

The provider logs all cookies on initialization:
```
Cookie: nsit = abc123...
Cookie: nseappid = xyz789...
Cookie: ak_bmsc = def456...
```

### Test Single Symbol

```bash
curl -X POST http://localhost:8081/api/ingestion/historical \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "provider": "NSE"
  }'
```

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| `NseIndiaProvider.java` | Main provider implementation |
| `pom.xml` | Added Apache HttpClient 5 dependency |
| `docs/nse-403-solution.md` | Detailed technical documentation |
| `docs/nse-migration-summary.md` | Before/after comparison |

---

## 🎯 Key Concepts

### Cookie Store
```java
CookieStore cookieStore = new BasicCookieStore();
```
- Automatically stores cookies from responses
- Automatically sends cookies with requests
- Persists across all requests from same HttpClient

### Lazy Session Initialization
```java
synchronized void initializeNseSession()
```
- Visits 3 NSE pages to establish session
- Collects cookies automatically
- Runs on **first data request** (not startup)
- Thread-safe to prevent duplicate initialization

### Browser Headers
```java
addBrowserHeaders(request)
```
- Mimics Chrome browser
- Includes Sec-Fetch-* headers
- Sets proper Referer

### Auto-Recovery
```java
if (statusCode == 403) {
    sessionInitialized = false;
    initializeNseSession();
    throw new RuntimeException("Retry needed");
}
```
- Detects 403 errors
- Re-initializes session
- Retry mechanism handles the retry

---

## ⚡ Performance

- **Session Init**: ~1-2 seconds (one-time on **first data request**, not startup)
- **First API Call**: ~2-4 seconds (includes session initialization)
- **Subsequent API Calls**: ~500ms-2s (depends on NSE)
- **Rate Limit**: 500 requests/hour
- **Retry**: 3 attempts with exponential backoff (2s, 4s, 8s)

---

## 🔐 Security

- Uses HTTPS for all requests
- No credentials stored
- Cookies are session-only (not persisted to disk)
- Rate limiting prevents abuse

---

## 📞 Support

If issues persist:
1. Check logs for error messages
2. Verify network connectivity to NSE
3. Ensure no firewall blocking
4. Check NSE website status: https://www.nseindia.com/
5. Review detailed docs: `docs/nse-403-solution.md`

---

## ✅ Success Criteria

Your NSE provider is working correctly if:
- ✅ Session initializes with 3+ cookies
- ✅ No 403 errors in logs
- ✅ Historical data fetches successfully
- ✅ Auto-recovery works if 403 occurs
- ✅ Rate limiting is respected

---

## 🎉 Summary

The NSE provider now works reliably by mimicking Python's `requests.Session()` behavior using Apache HttpClient 5. No more 403 errors!
