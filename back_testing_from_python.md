Create a comprehensive technical specification for migrating the current Python-based trading system to a high-performance Java-based HFT platform with the following requirements:

**System Overview:**
- Migrate from Python (Airflow + PySpark) to Java-based microservices architecture (from '/home/raja/code/money-plant-python/back_testing' & '/home/raja/code/money-plant-python/nse_airflow')
- Target: High-Frequency Trading (HFT) and intraday trading with <10ms latency
- Support for 1000+ symbols with real-time market data processing
- Integration with Zerodha/other brokers for automated trade execution (future)

**Current System Analysis:**
- Python codebase: ~11,000 lines (NSE data fetching + backtesting framework)
- Architecture: Airflow DAGs (7 DAGs), PySpark for indicators, PostgreSQL storage
- Backtesting: Abstract strategy pattern with AAS (Adaptive Accumulation Strategy)
- Performance: 4 minutes for 2000 symbols (parallel), 2-5 seconds per symbol
- Database: Unified event storage with 60-80% storage optimization

**Target Architecture:**
1. **Market Data Engine**
   - Kafka-based ingestion for NSE real-time data
   - WebSocket connections for tick-by-tick data
   - Support for 10,000+ ticks/second per symbol
   - Data normalization and validation

2. **Strategy Engine**
   - TA4J for technical indicators (RSI, MACD, Bollinger Bands, ATR, etc.)
   - Port existing AAS strategy to Java
   - Support for multiple concurrent strategies
   - Strategy backtesting framework with <100ms per symbol
   - Parallel backtesting for 2000+ symbols in <1 minute

3. **Order Execution Engine**
   - Zerodha Kite Connect Java SDK integration
   - FIX protocol support for direct market access
   - Order routing with smart order routing (SOR)
   - Position tracking and P&L calculation
   - Risk management (position limits, stop-loss, circuit breakers)

4. **Data Processing**
   - Apache Spark 3.x for historical data analysis
   - Apache Flink for real-time stream processing
   - Trino for fast SQL analytics
   - TimescaleDB for time-series optimization

5. **Infrastructure**
   - Spring Boot 3.x microservices
   - Implementation in './engines' as separate moduliths (leverage existing like 'backtest', 'strategy', 'ingestion' - market data engine etc)
   - Reactor/RxJava for reactive programming
   - Disruptor for ultra-low latency messaging
   - Redis for caching and session management
   - PostgreSQL for transactional data
   - Kafka for event streaming

**Technical Requirements:**
- Latency: <10ms for strategy execution, <50ms for order placement
- Throughput: 10,000+ market data updates/second
- Scalability: Support 1000+ symbols concurrently
- Reliability: 99.9% uptime, automatic failover
- Data retention: 10+ years of historical data
- Backtesting: 10-20x faster than current Python implementation

**Migration Strategy:**
- Phase 1: Core infrastructure (Kafka, Spark, database)
- Phase 2: Strategy engine and backtesting
- Phase 3: Real-time trading and order execution
- Phase 4: Production deployment and monitoring
- Hybrid approach: Keep Python for ETL, use Java for trading

**Deliverables:**
1. Detailed system architecture diagram
2. Component specifications with interfaces
3. Database schema (TimescaleDB + PostgreSQL)
4. API specifications (REST + WebSocket)
5. Performance benchmarks and SLAs
6. Migration plan with timeline (6-10 months)
7. Code structure and package organization
8. Testing strategy (unit, integration, load testing)
9. Deployment architecture (Docker, Kubernetes)
10. Monitoring and alerting setup (Prometheus, Grafana)

**Constraints:**
- Budget: Optimize for open-source technologies
- Timeline: 6-10 months for full migration
- Team: 2-3 developers with Java/Spring Boot experience
- Infrastructure: Cloud-based (AWS/GCP) or on-premise

**Success Criteria:**
- 10-100x performance improvement over Python
- <10ms strategy execution latency
- Support for HFT and intraday strategies
- Successful integration with broker APIs
- Zero data loss and 99.9% uptime
- Profitable trading with backtested strategies

Please provide a detailed specification document covering architecture, design, implementation plan, and deployment strategy for this Java-based HFT trading platform.