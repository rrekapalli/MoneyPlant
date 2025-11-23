# HFT Platform Migration - Global Context and Overview

## Executive Summary

This document provides the global context for migrating the Python-based trading system to a high-performance Java-based HFT platform. The migration is divided into three independent but interconnected specifications that can be implemented in parallel or sequentially while maintaining idempotency and consistency.

## Source System Analysis

### Python Codebase Overview
- **Location**: `/home/raja/code/money-plant-python/`
- **Components**:
  - `nse_airflow/`: Airflow DAGs for NSE data fetching (7 DAGs)
  - `back_testing/`: Backtesting framework with AAS strategy
- **Size**: ~11,000 lines of Python code
- **Performance**: 
  - 4 minutes for 2000 symbols (parallel processing)
  - 2-5 seconds per symbol
- **Architecture**: Airflow + PySpark + PostgreSQL

### Current System Limitations
1. **Latency**: Python's GIL and interpreted nature limits real-time performance
2. **Scalability**: Limited by single-machine Airflow execution
3. **Type Safety**: Dynamic typing leads to runtime errors
4. **Integration**: Difficult to integrate with low-latency trading systems
5. **Maintenance**: Airflow DAG complexity and PySpark overhead

## Target Architecture

### Technology Stack
- **Language**: Java 21 (with virtual threads)
- **Framework**: Spring Boot 3.x Modulith
- **Reactive**: Project Reactor + RxJava
- **Messaging**: Apache Kafka + LMAX Disruptor
- **Data Processing**: Apache Spark 3.x + Apache Flink
- **Storage**: PostgreSQL + TimescaleDB + Redis
- **Analytics**: Apache Trino + Apache Hudi/Iceberg
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker + Kubernetes

### Performance Targets
- **Latency**: <10ms for strategy execution, <50ms for order placement
- **Throughput**: 10,000+ market data updates/second
- **Scalability**: 1000+ symbols concurrently
- **Reliability**: 99.9% uptime
- **Performance Improvement**: 10-100x over Python

## Three-Spec Architecture

### Spec 1: Market Data Ingestion Engine
**Location**: `.kiro/specs/market-data-ingestion-engine/`

**Purpose**: Replace Python NSE data fetching with high-performance Java engine

**Key Components**:
- Real-time WebSocket connections for tick data
- Historical data ingestion from Yahoo Finance and CSV
- Kafka event streaming for downstream consumers
- TimescaleDB time-series storage
- Data normalization and validation
- Multi-source provider support

**Dependencies**: None (foundational component)

**Implementation Module**: `./engines/src/main/java/com/moneyplant/engines/ingestion/`

**Timeline**: Phase 1 (Months 1-3)

### Spec 2: Backtesting Engine Migration
**Location**: `.kiro/specs/backtesting-engine-migration/`

**Purpose**: Port Python backtesting framework to Java with 10-20x performance improvement

**Key Components**:
- Abstract strategy framework (port from Python)
- AAS strategy implementation
- TA4J technical indicators integration
- High-performance backtesting execution
- Parameter optimization (grid search, genetic algorithms)
- Apache Spark distributed processing
- Performance metrics calculation
- Walk-forward analysis

**Dependencies**: 
- Market Data Ingestion Engine (for historical data)
- Shared data models and schemas

**Implementation Module**: `./engines/src/main/java/com/moneyplant/engines/backtest/`

**Timeline**: Phase 2 (Months 3-6)

### Spec 3: Strategy Execution Engine
**Location**: `.kiro/specs/strategy-execution-engine/`

**Purpose**: Enable real-time strategy execution with broker integration

**Key Components**:
- Real-time strategy execution framework
- Zerodha Kite Connect integration
- FIX protocol support
- Order management system
- Position and P&L tracking
- Risk management and circuit breakers
- Smart order routing
- LMAX Disruptor for ultra-low latency

**Dependencies**:
- Market Data Ingestion Engine (for real-time data)
- Backtesting Engine (for strategy framework)
- Shared order and position models

**Implementation Module**: `./engines/src/main/java/com/moneyplant/engines/strategy/`

**Timeline**: Phase 3 (Months 6-10)

## Shared Components and Data Models

### Common Data Models
Located in: `./engines/src/main/java/com/moneyplant/engines/model/`

```java
// Shared across all three specs
- MarketData (tick and OHLCV)
- Symbol and SymbolUniverse
- Order and OrderStatus
- Position and Trade
- Strategy and StrategyParameters
- PerformanceMetrics
```

### Common Configuration
Located in: `./engines/src/main/java/com/moneyplant/engines/config/`

```java
- KafkaConfig (shared Kafka topics and serialization)
- DatabaseConfig (PostgreSQL and TimescaleDB)
- CacheConfig (Redis configuration)
- MonitoringConfig (Prometheus metrics)
```

### Shared Kafka Topics

```yaml
# Market Data Topics (Spec 1 produces, Spec 2 & 3 consume)
market-data-ticks: Real-time tick data
market-data-candles: OHLCV candles (1min, 5min, 15min, 1hour, 1day)
market-data-indices: Index values (Nifty 50, Sensex, etc.)

# Strategy Topics (Spec 3 produces)
strategy-signals: Trading signals generated by strategies
strategy-orders: Orders submitted by strategies
strategy-fills: Order fill notifications

# System Topics (All specs)
data-quality-alerts: Data validation failures
system-health: Health check events
audit-trail: Compliance and audit events
```

### Shared Database Schema

#### TimescaleDB Tables (Spec 1 writes, Spec 2 & 3 read)
```sql
-- Hypertable for tick data
CREATE TABLE market_data_ticks (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    price DECIMAL(18,4),
    volume BIGINT,
    bid DECIMAL(18,4),
    ask DECIMAL(18,4),
    metadata JSONB
);

-- Hypertable for OHLCV data
CREATE TABLE market_data_ohlcv (
    time TIMESTAMPTZ NOT NULL,
    symbol VARCHAR(20) NOT NULL,
    timeframe VARCHAR(10) NOT NULL,
    open DECIMAL(18,4),
    high DECIMAL(18,4),
    low DECIMAL(18,4),
    close DECIMAL(18,4),
    volume BIGINT
);
```

#### PostgreSQL Tables (Spec 2 & 3 write)
```sql
-- Backtest results (Spec 2)
CREATE TABLE backtest_runs (
    id UUID PRIMARY KEY,
    strategy_name VARCHAR(100),
    parameters JSONB,
    start_date DATE,
    end_date DATE,
    metrics JSONB,
    created_at TIMESTAMPTZ
);

-- Live positions (Spec 3)
CREATE TABLE positions (
    id UUID PRIMARY KEY,
    strategy_id UUID,
    symbol VARCHAR(20),
    quantity INTEGER,
    entry_price DECIMAL(18,4),
    current_price DECIMAL(18,4),
    unrealized_pnl DECIMAL(18,4),
    opened_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);

-- Order history (Spec 3)
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    strategy_id UUID,
    symbol VARCHAR(20),
    order_type VARCHAR(20),
    quantity INTEGER,
    price DECIMAL(18,4),
    status VARCHAR(20),
    broker_order_id VARCHAR(50),
    submitted_at TIMESTAMPTZ,
    filled_at TIMESTAMPTZ
);
```

## Implementation Strategy

### Idempotency Guarantees

Each spec is designed to be independently implementable with the following guarantees:

1. **Spec 1 (Market Data)**: Can be implemented first and used immediately by existing systems
   - Publishes to Kafka topics that can be consumed by any system
   - Stores data in TimescaleDB with standard schema
   - Provides REST API for historical data access

2. **Spec 2 (Backtesting)**: Can be implemented using mock data or Spec 1 data
   - Reads from TimescaleDB (can use existing Python-ingested data initially)
   - Produces backtest results to separate tables
   - Does not depend on Spec 3

3. **Spec 3 (Execution)**: Can be implemented with paper trading mode
   - Consumes from Kafka topics (can use Spec 1 or mock data)
   - Uses strategy framework from Spec 2 (or simplified version initially)
   - Can run in simulation mode without broker integration

### Parallel Implementation Approach

**Month 1-3: Foundation**
- Implement Spec 1 (Market Data Ingestion Engine)
- Set up shared infrastructure (Kafka, TimescaleDB, monitoring)
- Define common data models and interfaces

**Month 3-6: Backtesting**
- Implement Spec 2 (Backtesting Engine)
- Port AAS strategy from Python
- Validate against Python backtest results
- Begin using Spec 1 for data ingestion

**Month 6-10: Live Trading**
- Implement Spec 3 (Strategy Execution Engine)
- Integrate with Zerodha Kite Connect
- Start with paper trading mode
- Gradually transition to live trading

### Sequential Implementation Approach

If parallel implementation is not feasible:

**Phase 1 (Months 1-3)**: Market Data Foundation
- Complete Spec 1 implementation
- Migrate Python Airflow DAGs to Java
- Validate data quality and performance

**Phase 2 (Months 4-6)**: Backtesting Migration
- Complete Spec 2 implementation
- Port all Python strategies to Java
- Achieve 10-20x performance improvement

**Phase 3 (Months 7-10)**: Live Trading
- Complete Spec 3 implementation
- Broker integration and testing
- Production deployment with monitoring

## Data Migration Strategy

### Historical Data Migration
1. **Export from Python**: Export existing PostgreSQL data to Parquet files
2. **Import to TimescaleDB**: Bulk import using COPY protocol
3. **Validation**: Compare data completeness and accuracy
4. **Backfill**: Use Spec 1 to backfill any missing data

### Strategy Migration
1. **Code Translation**: Port Python strategy logic to Java
2. **Validation**: Run parallel backtests (Python vs Java)
3. **Parameter Mapping**: Ensure parameter compatibility
4. **Testing**: Extensive testing with historical data

### Incremental Cutover
1. **Dual Run**: Run Python and Java systems in parallel
2. **Comparison**: Compare results and identify discrepancies
3. **Gradual Shift**: Gradually shift load to Java system
4. **Decommission**: Retire Python system after validation period

## Testing Strategy

### Unit Testing
- JUnit 5 for all components
- Mockito for mocking external dependencies
- Target: 80%+ code coverage

### Integration Testing
- Testcontainers for PostgreSQL, Kafka, Redis
- Spring Boot Test for integration tests
- End-to-end testing of data flow

### Performance Testing
- JMH for micro-benchmarking
- Gatling for load testing
- Target: <10ms p99 latency

### Validation Testing
- Compare Java backtest results with Python
- Validate data quality and completeness
- Stress testing with 1000+ symbols

## Monitoring and Observability

### Metrics (Prometheus)
- Throughput: messages/sec, ticks/sec
- Latency: p50, p95, p99 for all operations
- Errors: error rate by type
- Resource: CPU, memory, GC metrics

### Dashboards (Grafana)
- Market Data Ingestion Dashboard
- Backtesting Performance Dashboard
- Live Trading Dashboard
- System Health Dashboard

### Alerting
- High latency (>50ms)
- High error rate (>1%)
- Data quality issues
- Risk limit breaches
- System health degradation

## Risk Mitigation

### Technical Risks
1. **Performance**: Continuous benchmarking and optimization
2. **Data Quality**: Comprehensive validation and monitoring
3. **Integration**: Extensive testing with broker APIs
4. **Scalability**: Load testing and capacity planning

### Operational Risks
1. **Downtime**: Blue-green deployment and rollback capability
2. **Data Loss**: Kafka retention and database backups
3. **Trading Errors**: Paper trading and gradual rollout
4. **Compliance**: Comprehensive audit trail and logging

## Success Criteria

### Performance Metrics
- ✅ 10-100x performance improvement over Python
- ✅ <10ms strategy execution latency
- ✅ <50ms order placement latency
- ✅ 10,000+ ticks/second processing
- ✅ 2000+ symbols backtested in <60 seconds

### Reliability Metrics
- ✅ 99.9% uptime
- ✅ Zero data loss
- ✅ <1% error rate
- ✅ Automatic failover and recovery

### Business Metrics
- ✅ Successful broker integration
- ✅ Profitable trading with backtested strategies
- ✅ Reduced infrastructure costs
- ✅ Faster strategy development cycle

## Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|--------------|
| Phase 1: Market Data | Months 1-3 | Spec 1 complete, data ingestion operational |
| Phase 2: Backtesting | Months 3-6 | Spec 2 complete, strategies ported and validated |
| Phase 3: Live Trading | Months 6-10 | Spec 3 complete, production deployment |
| Phase 4: Optimization | Months 10-12 | Performance tuning, monitoring, documentation |

**Total Timeline**: 10-12 months for full migration

## Team Requirements

### Core Team (2-3 developers)
- **Java/Spring Boot Expert**: Lead developer for all three specs
- **Quantitative Developer**: Strategy porting and validation
- **DevOps Engineer**: Infrastructure, deployment, monitoring

### Part-time Support
- **Data Engineer**: Data migration and validation
- **QA Engineer**: Testing and quality assurance
- **Domain Expert**: Trading logic validation

## Budget Considerations

### Infrastructure Costs
- **Cloud**: AWS/GCP compute, storage, networking (~$2000-5000/month)
- **Broker**: Zerodha API fees (minimal)
- **Monitoring**: Prometheus/Grafana (open-source, self-hosted)
- **Development**: Development environment and tools

### Software Licenses
- All core technologies are open-source
- Optional: Commercial support for Kafka, TimescaleDB

### Total Estimated Cost
- **Development**: 2-3 developers × 10 months
- **Infrastructure**: $20,000-50,000 for 10 months
- **Contingency**: 20% buffer for unexpected costs

## Next Steps

1. **Review and Approve**: Review all three specifications
2. **Team Assembly**: Hire or assign development team
3. **Infrastructure Setup**: Provision cloud resources, set up CI/CD
4. **Spec 1 Implementation**: Begin with Market Data Ingestion Engine
5. **Parallel Development**: Start Spec 2 once Spec 1 is 50% complete
6. **Testing and Validation**: Continuous testing throughout development
7. **Production Deployment**: Gradual rollout with monitoring

## References

- Market Data Ingestion Engine Spec: `.kiro/specs/market-data-ingestion-engine/requirements.md`
- Backtesting Engine Migration Spec: `.kiro/specs/backtesting-engine-migration/requirements.md`
- Strategy Execution Engine Spec: `.kiro/specs/strategy-execution-engine/requirements.md`
- Python Source Code: `/home/raja/code/money-plant-python/`
- Existing Java Engines: `./engines/src/main/java/com/moneyplant/engines/`
