# Implementation Plan

- [x] 1. Set up project structure and dependencies
  - Add KiteConnect Java library dependency to engines/pom.xml
  - Add Resilience4j Spring Boot starter dependency
  - Add jqwik dependency for property-based testing
  - Add TestContainers dependency for integration testing
  - Create package structure under com.moneyplant.engines.ingestion.kite
  - _Requirements: 16.1, 17.2_

- [x] 2. Create database schema with Flyway migration
  - Create Flyway migration script V{version}__create_kite_tables.sql
  - Define kite_instrument_master table with composite primary key
  - Define kite_ohlcv_historic table
  - Convert kite_ohlcv_historic to TimescaleDB hypertable with 7-day chunks
  - Create indexes for both tables optimized for query patterns
  - Add compression policy for kite_ohlcv_historic (compress data older than 30 days)
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 11.1, 11.2, 11.3, 11.4, 11.5, 18.1, 18.2_

- [x] 2.1 Write property test for idempotent table creation
  - **Property 5: Idempotent table creation**
  - **Validates: Requirements 2.1**

- [x] 3. Create JPA entities and composite key classes
  - Create KiteInstrumentMaster entity with @Entity and @Table annotations
  - Create KiteInstrumentMasterId composite key class implementing Serializable
  - Create KiteOhlcvHistoric entity with @Entity and @Table annotations
  - Create KiteOhlcvHistoricId composite key class implementing Serializable
  - Add appropriate indexes using @Index annotations
  - Add validation annotations (@NotNull, @Column constraints)
  - _Requirements: 3.1, 4.3_

- [x] 4. Create enums and DTOs
  - Create CandleInterval enum with Kite API value mappings
  - Create JobStatus enum (PENDING, IN_PROGRESS, COMPLETED, FAILED, CANCELLED)
  - Create Exchange enum (NSE, BSE, NFO, BFO, CDS, MCX)
  - Create InstrumentImportRequest DTO
  - Create HistoricalDataRequest DTO with validation annotations
  - Create BatchHistoricalDataRequest DTO
  - Create JobStatusResponse DTO
  - Create IngestionSummary DTO
  - Create ErrorResponse DTO for exception handling
  - _Requirements: 7.3, 7.4, 9.3_

- [x] 5. Create Spring Data JPA repositories
  - Create KiteInstrumentMasterRepository extending JpaRepository
  - Add custom query methods (findByTradingsymbol, countByInstrumentTokenIn, etc.)
  - Create KiteOhlcvHistoricRepository extending JpaRepository
  - Add custom query methods for time-range queries
  - _Requirements: 4.3, 8.4_

- [x] 6. Create batch repository with JDBC operations
  - Create KiteBatchRepository class with @Repository annotation
  - Inject JdbcTemplate dependency
  - Implement batchUpsertInstruments() using INSERT ... ON CONFLICT ... DO UPDATE
  - Implement batchInsertOhlcv() using INSERT ... ON CONFLICT DO NOTHING
  - Use configurable batch size from application properties
  - _Requirements: 17.1, 17.4_

- [x] 6.1 Write property test for upsert idempotence
  - **Property 6: Upsert idempotence**
  - **Validates: Requirements 3.2**

- [x] 6.2 Write property test for composite key uniqueness
  - **Property 7: Composite key uniqueness**
  - **Validates: Requirements 3.3**

- [x] 6.3 Write property test for upsert count accuracy
  - **Property 8: Upsert count accuracy**
  - **Validates: Requirements 3.4**


- [x] 7. Create configuration classes
  - Create KiteIngestionConfig class with @ConfigurationProperties(prefix = "kite")
  - Add nested classes for ApiConfig, IngestionConfig, RateLimitConfig, RetryConfig, CircuitBreakerConfig
  - Add validation annotations (@NotNull, @NotBlank, @Min, @Max)
  - Create AsyncConfig class with @EnableAsync
  - Configure ThreadPoolTaskExecutor bean named "kiteIngestionExecutor"
  - Create Resilience4jConfig class
  - Configure RetryConfig bean for Kite API with exponential backoff
  - Configure RateLimiterConfig bean for Kite API
  - Configure CircuitBreakerConfig bean for Kite API
  - _Requirements: 5.2, 9.1, 9.3, 9.4, 12.2, 14.2, 17.2_

- [x] 8. Create custom exception classes
  - Create KiteAuthenticationException extending RuntimeException
  - Create KiteApiException extending RuntimeException
  - Create KiteRateLimitException extending RuntimeException with retryAfterSeconds field
  - Create KiteIngestionException extending RuntimeException
  - Add appropriate constructors and error messages
  - _Requirements: 5.4_

- [x] 9. Create global exception handler
  - Create KiteIngestionExceptionHandler class with @RestControllerAdvice
  - Add @ExceptionHandler for KiteAuthenticationException returning HTTP 401
  - Add @ExceptionHandler for KiteRateLimitException returning HTTP 429 with Retry-After header
  - Add @ExceptionHandler for MethodArgumentNotValidException returning HTTP 400
  - Add @ExceptionHandler for KiteApiException returning HTTP 502/503
  - Add @ExceptionHandler for DataAccessException returning HTTP 500
  - Log all exceptions with appropriate log levels
  - _Requirements: 5.3, 5.4_

- [x] 10. Create KiteConnect client wrapper
  - Create KiteConnectClient class with @Component annotation
  - Inject KiteIngestionConfig dependency
  - Initialize KiteConnect instance with API key and access token in constructor
  - Inject RetryTemplate bean
  - Implement getInstruments() method with @Retry, @RateLimiter, @CircuitBreaker annotations
  - Implement getHistoricalData() method with @Retry, @RateLimiter, @CircuitBreaker annotations
  - Add fallback methods for circuit breaker
  - Handle KiteException and convert to custom exceptions
  - Add detailed logging for all API calls
  - _Requirements: 1.1, 1.2, 5.2, 6.1, 6.2, 6.3, 6.4, 12.1, 12.2, 16.1, 16.2, 16.3, 16.4_

- [x] 10.1 Write property test for authentication precedes fetching
  - **Property 1: Authentication precedes data fetching**
  - **Validates: Requirements 1.1**

- [x] 10.2 Write property test for retry with exponential backoff
  - **Property 11: Retry with exponential backoff**
  - **Validates: Requirements 5.2**

- [x] 10.3 Write property test for rate limit backoff
  - **Property 18: Rate limit backoff**
  - **Validates: Requirements 12.1, 12.2**

- [x] 11. Create job tracking service
  - Create KiteJobTrackingService interface
  - Create KiteJobTrackingServiceImpl class with @Service annotation
  - Implement in-memory job tracking using ConcurrentHashMap
  - Implement startJob() method to create job with PENDING status
  - Implement updateJobStatus() method to update job progress
  - Implement completeJob() method to mark job as COMPLETED with summary
  - Implement failJob() method to mark job as FAILED with error message
  - Implement getJobStatus() method to retrieve job information
  - Add cleanup for old completed jobs (older than 24 hours)
  - _Requirements: 7.5, 14.3, 14.4, 14.5_

- [x] 11.1 Write property test for async job tracking
  - **Property 20: Async job tracking**
  - **Validates: Requirements 14.3, 14.4, 14.5**

- [x] 12. Create instrument service
  - Create KiteInstrumentService interface
  - Create KiteInstrumentServiceImpl class with @Service and @Transactional annotations
  - Inject KiteConnectClient, KiteInstrumentMasterRepository, KiteBatchRepository, KiteJobTrackingService
  - Implement importInstruments() method with @Async("kiteIngestionExecutor") annotation
  - Generate unique job ID using UUID
  - Call kiteClient.getInstruments() to fetch instruments
  - Filter by exchanges if specified in request
  - Transform Instrument objects to KiteInstrumentMaster entities
  - Validate required fields (instrument_token, exchange, tradingsymbol)
  - Call batchRepository.batchUpsertInstruments() for bulk insert
  - Calculate summary statistics (total, by exchange, by instrument_type)
  - Update job tracking with progress and completion
  - Handle exceptions and update job status to FAILED
  - Return CompletableFuture<String> with job ID
  - Implement getInstrument() method for querying by token and exchange
  - Implement searchByTradingSymbol() method
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4, 3.5, 4.2, 5.1, 5.5, 8.1, 8.2, 8.3, 14.1, 14.3_

- [x] 12.1 Write property test for all required fields parsed
  - **Property 2: All required fields are parsed**
  - **Validates: Requirements 1.3**

- [x] 12.2 Write property test for required field validation
  - **Property 3: Required field validation**
  - **Validates: Requirements 1.4**

- [x] 12.3 Write property test for schema transformation correctness
  - **Property 4: Schema transformation correctness**
  - **Validates: Requirements 1.5, 3.1**

- [x] 12.4 Write property test for transaction rollback on error
  - **Property 9: Transaction rollback on error**
  - **Validates: Requirements 3.5**

- [x] 12.5 Write property test for operation logging completeness
  - **Property 10: Operation logging completeness**
  - **Validates: Requirements 5.1**

- [x] 12.6 Write property test for complete instrument storage
  - **Property 13: Complete instrument storage**
  - **Validates: Requirements 8.1**

- [x] 12.7 Write property test for metadata preservation
  - **Property 14: Metadata preservation**
  - **Validates: Requirements 8.2**

- [x] 12.8 Write property test for summary statistics by category
  - **Property 15: Summary statistics by category**
  - **Validates: Requirements 8.3**


- [x] 13. Create historical data service
  - Create KiteHistoricalDataService interface
  - Create KiteHistoricalDataServiceImpl class with @Service and @Transactional annotations
  - Inject KiteConnectClient, KiteOhlcvHistoricRepository, KiteBatchRepository, KiteJobTrackingService
  - Inject configuration properties for batch size and parallel requests
  - Implement fetchHistoricalData() method with @Async("kiteIngestionExecutor") annotation
  - Generate unique job ID using UUID
  - Validate date range (from_date before to_date, both not in future)
  - Call kiteClient.getHistoricalData() to fetch OHLCV data
  - Transform HistoricalData candles to KiteOhlcvHistoric entities
  - Call batchRepository.batchInsertOhlcv() for bulk insert
  - Calculate summary statistics
  - Update job tracking with progress and completion
  - Handle exceptions and update job status to FAILED
  - Return CompletableFuture<String> with job ID
  - Implement batchFetchHistoricalData() method for multiple instruments
  - Use CompletableFuture for parallel processing with rate limiting
  - Process instruments with throttled executor to respect API limits
  - Aggregate results from all instruments
  - Implement queryHistoricalData() method for database queries
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5, 12.4, 13.1, 13.2, 13.3, 13.4, 13.5, 14.1, 17.2_

- [x] 13.1 Write property test for date range validation
  - **Property 16: Date range validation**
  - **Validates: Requirements 10.2**

- [x] 13.2 Write property test for historical data parsing completeness
  - **Property 17: Historical data parsing completeness**
  - **Validates: Requirements 10.4, 10.5**

- [x] 13.3 Write property test for batch processing completeness
  - **Property 19: Batch processing completeness**
  - **Validates: Requirements 13.4, 13.5**

- [x] 14. Create REST API controller
  - Create KiteIngestionController class with @RestController and @RequestMapping("/api/ingestion/kite")
  - Inject KiteInstrumentService, KiteHistoricalDataService, KiteJobTrackingService
  - Implement POST /instruments endpoint
  - Accept optional InstrumentImportRequest body
  - Call instrumentService.importInstruments() asynchronously
  - Return ResponseEntity<JobStatusResponse> with job ID and HTTP 202 (Accepted)
  - Implement POST /historical endpoint
  - Accept @Valid HistoricalDataRequest body
  - Validate request parameters using Spring validation
  - Call historicalDataService.fetchHistoricalData() asynchronously
  - Return ResponseEntity<JobStatusResponse> with job ID and HTTP 202 (Accepted)
  - Implement POST /historical/batch endpoint
  - Accept @Valid BatchHistoricalDataRequest body
  - Call historicalDataService.batchFetchHistoricalData() asynchronously
  - Return ResponseEntity<JobStatusResponse> with job ID and HTTP 202 (Accepted)
  - Implement GET /status/{jobId} endpoint
  - Call jobTrackingService.getJobStatus()
  - Return ResponseEntity<JobStatusResponse> with job details
  - Return HTTP 404 if job not found
  - Add @Slf4j for logging all API requests
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 14.3_

- [x] 14.1 Write integration test for REST API endpoints
  - Test POST /instruments endpoint returns job ID
  - Test POST /historical endpoint with valid request
  - Test POST /historical endpoint with invalid date range returns 400
  - Test GET /status/{jobId} endpoint returns job status
  - Test error responses for validation failures
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 15. Create application configuration file
  - Create application.yml in engines/src/main/resources
  - Add kite.api configuration section with placeholders for API key, secret, access token
  - Add kite.ingestion configuration section with batch size, parallel requests, rate limit, retry, circuit breaker settings
  - Add spring.datasource configuration (use existing database connection)
  - Add spring.jpa configuration with Hibernate batch settings
  - Add spring.flyway configuration
  - Add spring.task.execution configuration for async thread pool
  - Add logging configuration with appropriate log levels
  - Add management.endpoints configuration for health checks
  - Create application-dev.yml with development-specific settings
  - Create application-test.yml with test-specific settings (H2 database)
  - _Requirements: 9.1, 9.2, 9.3, 9.4, 15.1, 15.2, 15.3_

- [x] 16. Create environment variables template
  - Create .env.example file in engines directory
  - Add KITE_API_KEY placeholder
  - Add KITE_API_SECRET placeholder
  - Add KITE_ACCESS_TOKEN placeholder
  - Add DB_USERNAME placeholder
  - Add DB_PASSWORD placeholder
  - Document how to obtain Kite API credentials
  - _Requirements: 9.1, 16.2_

- [x] 17. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 18. Write integration tests
  - Create KiteInstrumentServiceIntegrationTest with @SpringBootTest
  - Use @Testcontainers with PostgreSQL container
  - Mock KiteConnectClient to return test data
  - Test complete instrument import flow
  - Verify all instruments are stored in database
  - Verify summary statistics are correct
  - Create KiteHistoricalDataServiceIntegrationTest
  - Test historical data fetch for single instrument
  - Test batch fetch for multiple instruments
  - Verify data is stored in kite_ohlcv_historic table
  - Create KiteIngestionControllerIntegrationTest with @WebMvcTest
  - Test all REST endpoints with MockMvc
  - Verify request validation
  - Verify response formats
  - Create error handling integration tests
  - Test authentication failure scenarios
  - Test API error scenarios with retries
  - Test database error scenarios with rollback
  - Test rate limit scenarios with backoff
  - _Requirements: All_

- [x] 18.1 Write integration test for complete instrument import flow
  - Test end-to-end import from mocked Kite API to database
  - Verify all instruments stored correctly
  - Verify logging output

- [x] 18.2 Write integration test for historical data fetch flow
  - Test fetching historical data for single instrument
  - Test batch fetching for multiple instruments
  - Verify data stored in TimescaleDB hypertable

- [x] 18.3 Write integration test for error handling
  - Test authentication failure handling
  - Test API error handling with retries
  - Test database error handling with rollback
  - Test rate limit handling with backoff

- [x] 18.4 Write integration test for async execution and job tracking
  - Test async job execution
  - Test job status tracking
  - Test concurrent job execution

- [x] 19. Create documentation
  - Create README.md in engines/src/main/java/com/moneyplant/engines/ingestion/kite
  - Document system overview and architecture
  - Document API endpoints with examples
  - Document configuration properties
  - Document how to run the system
  - Document how to obtain Kite API credentials
  - Add troubleshooting section
  - Add examples of API requests using curl
  - Document TimescaleDB setup requirements
  - _Requirements: 15.1_

- [x] 20. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
