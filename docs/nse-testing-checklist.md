# NSE Provider Testing Checklist

## Pre-Testing Setup

- [ ] Apache HttpClient 5 dependency added to `pom.xml`
- [ ] `NseIndiaProvider.java` updated with new implementation
- [ ] Code compiles without errors
- [ ] No diagnostic issues in IDE

---

## Build & Deployment

### 1. Clean Build
```bash
cd engines
mvn clean install
```

**Expected Output:**
```
[INFO] BUILD SUCCESS
[INFO] Total time: XX s
```

- [ ] Build succeeds without errors
- [ ] No compilation warnings related to NseIndiaProvider

### 2. Start Application
```bash
mvn spring-boot:run
```

**Expected Output:**
```
NseIndiaProvider initialized with Apache HttpClient 5 and persistent cookie store
🔐 Initializing NSE session with cookie persistence...
```

- [ ] Application starts successfully
- [ ] No startup errors in logs

---

## Session Initialization Tests

### Test 1: Session Init Success
**Look for these logs:**
```
📍 Step 1/3: Visiting NSE homepage
Homepage response: 200 - Cookies in store: 3
📍 Step 2/3: Visiting get-quotes/equity page
Get-quotes response: 200 - Cookies in store: 5
📍 Step 3/3: Visiting market-data page
Market-data response: 200 - Cookies in store: 7
✅ NSE session initialized successfully with 7 cookies
```

- [ ] All 3 steps complete successfully
- [ ] Cookie count increases with each step
- [ ] Final cookie count is 3-7
- [ ] No errors during initialization

### Test 2: Cookie Details
**Look for cookie logs:**
```
Cookie: nsit = abc123...
Cookie: nseappid = xyz789...
Cookie: ak_bmsc = def456...
```

- [ ] At least 3 cookies logged
- [ ] Cookie names look valid (nsit, nseappid, ak_bmsc, bm_sv, bm_sz, etc.)
- [ ] Cookie values are not empty

---

## API Call Tests

### Test 3: Single Symbol Fetch
**Test Command:**
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

**Expected Logs:**
```
Fetching historical data from NSE India for symbol: RELIANCE from 2024-01-01 to 2024-01-31
Making request to: https://www.nseindia.com/api/historical...
Cookies in store: 7
✅ Successfully fetched 21 historical records for RELIANCE from NSE India
```

- [ ] Request completes successfully
- [ ] No 403 errors
- [ ] Data returned (21 records for January)
- [ ] Response time < 5 seconds

### Test 4: Multiple Symbols
**Test with these symbols:**
- RELIANCE
- TCS
- INFY
- HDFCBANK
- ICICIBANK

**For each symbol:**
- [ ] No 403 errors
- [ ] Data fetched successfully
- [ ] Cookies remain in store
- [ ] Response time reasonable

### Test 5: Date Range Variations
**Test different date ranges:**
- [ ] 1 day: 2024-01-01 to 2024-01-01
- [ ] 1 week: 2024-01-01 to 2024-01-07
- [ ] 1 month: 2024-01-01 to 2024-01-31
- [ ] 3 months: 2024-01-01 to 2024-03-31
- [ ] 1 year: 2023-01-01 to 2023-12-31

**For each range:**
- [ ] No 403 errors
- [ ] Appropriate number of records returned
- [ ] No timeout errors

---

## Error Handling Tests

### Test 6: Invalid Symbol
**Test Command:**
```bash
curl -X POST http://localhost:8081/api/ingestion/historical \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "INVALID_SYMBOL_XYZ",
    "startDate": "2024-01-01",
    "endDate": "2024-01-31",
    "provider": "NSE"
  }'
```

**Expected:**
- [ ] Graceful error handling
- [ ] No 403 error
- [ ] Empty data or appropriate error message
- [ ] Session remains valid

### Test 7: Future Dates
**Test Command:**
```bash
curl -X POST http://localhost:8081/api/ingestion/historical \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "startDate": "2025-12-01",
    "endDate": "2025-12-31",
    "provider": "NSE"
  }'
```

**Expected:**
- [ ] No 403 error
- [ ] Empty data or appropriate message
- [ ] Session remains valid

### Test 8: Weekend/Holiday Dates
**Test Command:**
```bash
curl -X POST http://localhost:8081/api/ingestion/historical \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "RELIANCE",
    "startDate": "2024-01-06",
    "endDate": "2024-01-07",
    "provider": "NSE"
  }'
```

**Expected (Jan 6-7, 2024 is weekend):**
- [ ] No 403 error
- [ ] Empty data or no trading day message
- [ ] Session remains valid

---

## Rate Limiting Tests

### Test 9: Rapid Requests
**Send 10 requests quickly:**
```bash
for i in {1..10}; do
  curl -X POST http://localhost:8081/api/ingestion/historical \
    -H "Content-Type: application/json" \
    -d '{
      "symbol": "RELIANCE",
      "startDate": "2024-01-01",
      "endDate": "2024-01-31",
      "provider": "NSE"
    }' &
done
wait
```

**Expected:**
- [ ] Rate limiter kicks in
- [ ] Some requests may be delayed
- [ ] No 403 errors
- [ ] All requests eventually complete

### Test 10: Rate Limit Logs
**Check logs for:**
```
Rate limiter: Acquired permission
Rate limiter: Waiting for permission
```

- [ ] Rate limiter is active
- [ ] Requests are throttled appropriately
- [ ] No rate limit violations from NSE

---

## Recovery Tests

### Test 11: Session Expiry Simulation
**Steps:**
1. Start application
2. Wait 30 minutes (session may expire)
3. Make API call

**Expected:**
- [ ] If 403 occurs, auto-recovery triggers
- [ ] Logs show: "🔄 Re-initializing session and retrying..."
- [ ] Session re-initialized successfully
- [ ] Request retries and succeeds

### Test 12: Network Hiccup Simulation
**Steps:**
1. Start application
2. Temporarily block NSE (firewall/hosts file)
3. Make API call
4. Unblock NSE

**Expected:**
- [ ] Initial request fails
- [ ] Retry logic kicks in
- [ ] After unblock, request succeeds
- [ ] No permanent failure

---

## Performance Tests

### Test 13: Response Time
**Measure response times for:**
- [ ] Session initialization: < 3 seconds
- [ ] First API call: < 5 seconds
- [ ] Subsequent API calls: < 2 seconds
- [ ] 100 API calls: < 5 minutes (with rate limiting)

### Test 14: Memory Usage
**Monitor memory during:**
- [ ] Session initialization
- [ ] 100 API calls
- [ ] 1000 API calls

**Expected:**
- [ ] No memory leaks
- [ ] Stable memory usage
- [ ] Cookie store size remains reasonable

### Test 15: Connection Pooling
**Check logs for:**
```
Connection pool stats
Active connections
Idle connections
```

- [ ] Connections are reused
- [ ] No connection leaks
- [ ] Pool size is reasonable

---

## Health Check Tests

### Test 16: Health Endpoint
**Test Command:**
```bash
curl http://localhost:8081/actuator/health
```

**Expected:**
- [ ] Returns 200 OK
- [ ] NSE provider shows as healthy
- [ ] No errors in response

### Test 17: Provider Health Check
**Check logs for:**
```
NSE India provider health check: true
```

- [ ] Health check passes
- [ ] Uses RELIANCE symbol for test
- [ ] Completes within 10 seconds

---

## Integration Tests

### Test 18: Full Ingestion Flow
**Test end-to-end:**
1. Start application
2. Trigger historical data ingestion
3. Verify data in database
4. Check Kafka messages (if applicable)

- [ ] Data ingested successfully
- [ ] No 403 errors
- [ ] Data stored in database
- [ ] Kafka messages published (if applicable)

### Test 19: Multiple Providers
**Test with different providers:**
- [ ] NSE provider works
- [ ] Other providers still work
- [ ] No interference between providers

---

## Stress Tests

### Test 20: High Volume
**Ingest data for:**
- [ ] 10 symbols
- [ ] 50 symbols
- [ ] 100 symbols
- [ ] 500 symbols

**For each:**
- [ ] No 403 errors
- [ ] Rate limiting works
- [ ] All data fetched successfully
- [ ] No timeouts or crashes

### Test 21: Long Running
**Run for extended period:**
- [ ] 1 hour continuous operation
- [ ] 6 hours continuous operation
- [ ] 24 hours continuous operation

**Monitor:**
- [ ] No 403 errors
- [ ] Session remains valid
- [ ] No memory leaks
- [ ] No connection leaks

---

## Regression Tests

### Test 22: Existing Functionality
**Verify these still work:**
- [ ] Other data providers (Yahoo, etc.)
- [ ] Equity master data fetch
- [ ] Real-time data ingestion
- [ ] Backtesting engine
- [ ] API endpoints

### Test 23: Configuration
**Test with different configs:**
- [ ] Different rate limits
- [ ] Different timeouts
- [ ] Different retry settings

- [ ] All configurations work
- [ ] No unexpected behavior

---

## Documentation Tests

### Test 24: Documentation Accuracy
**Verify documentation:**
- [ ] `docs/nse-403-solution.md` is accurate
- [ ] `docs/nse-migration-summary.md` is accurate
- [ ] `docs/nse-quick-reference.md` is accurate
- [ ] `NSE_403_SOLUTION.md` is accurate

### Test 25: Code Comments
**Check code for:**
- [ ] Clear comments
- [ ] Accurate JavaDoc
- [ ] No outdated comments
- [ ] Helpful explanations

---

## Final Checklist

### Pre-Production
- [ ] All tests pass
- [ ] No 403 errors observed
- [ ] Performance is acceptable
- [ ] Documentation is complete
- [ ] Code is reviewed
- [ ] Logs are clean and informative

### Production Readiness
- [ ] Monitoring in place
- [ ] Alerts configured
- [ ] Rollback plan ready
- [ ] Team trained on new implementation
- [ ] Documentation shared

### Post-Deployment
- [ ] Monitor logs for 403 errors
- [ ] Monitor session initialization
- [ ] Monitor cookie count
- [ ] Monitor response times
- [ ] Monitor error rates

---

## Success Criteria

✅ **All tests pass**  
✅ **No 403 Forbidden errors**  
✅ **Session initialization works reliably**  
✅ **Cookies persist across requests**  
✅ **Auto-recovery works if 403 occurs**  
✅ **Performance is acceptable**  
✅ **No memory or connection leaks**  
✅ **Documentation is accurate**  

---

## Sign-Off

**Tested By:** _______________  
**Date:** _______________  
**Status:** [ ] PASS [ ] FAIL  
**Notes:** _______________

---

## Issues Found

| # | Issue | Severity | Status | Notes |
|---|-------|----------|--------|-------|
| 1 |       |          |        |       |
| 2 |       |          |        |       |
| 3 |       |          |        |       |

---

## Next Steps

After all tests pass:
1. Deploy to staging environment
2. Run smoke tests in staging
3. Monitor for 24 hours
4. Deploy to production
5. Monitor closely for first week

---

**Remember**: The goal is zero 403 errors! 🎯
