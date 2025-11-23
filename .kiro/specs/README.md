# MoneyPlant Specifications

This directory contains detailed specifications for all features and migrations in the MoneyPlant platform.

## Active Specifications

### Platform Features
1. **MoneyPlant Platform** (`moneyplant-platform/`)
   - Comprehensive financial portfolio management platform
   - Status: In development

2. **QueryBuilder Integration** (`querybuilder-integration/`)
   - Custom Angular QueryBuilder library for stock screeners
   - Status: In development

3. **RestTemplate Configuration** (`resttemplate-configuration/`)
   - REST client configuration and integration
   - Status: In development

4. **Screeners Auth Unification** (`screeners-auth-unification/`)
   - Unified authentication for screeners module
   - Status: In development

### HFT Platform Migration (Python to Java)

The HFT Platform Migration is a comprehensive project to migrate the Python-based trading system to a high-performance Java-based platform. This migration is divided into three independent but interconnected specifications:

#### Overview Document
**File**: `hft-platform-migration-overview.md`

This document provides the global context, shared components, implementation strategy, and timeline for the entire migration project. **Read this first** to understand how the three specs work together.

#### Spec 1: Market Data Ingestion Engine
**Directory**: `market-data-ingestion-engine/`
**Status**: Ready for implementation
**Timeline**: Phase 1 (Months 1-3)

**Purpose**: Replace Python NSE data fetching with high-performance Java engine

**Key Features**:
- Real-time WebSocket connections for tick data (10,000+ ticks/sec)
- Historical data ingestion from Yahoo Finance and CSV
- Kafka event streaming for downstream consumers
- TimescaleDB time-series storage with compression
- Data normalization and validation
- Multi-source provider support

**Dependencies**: None (foundational component)

**Implementation Module**: `./engines/src/main/java/com/moneyplant/engines/ingestion/`

#### Spec 2: Backtesting Engine Migration
**Directory**: `backtesting-engine-migration/`
**Status**: Ready for implementation
**Timeline**: Phase 2 (Months 3-6)

**Purpose**: Port Python backtesting framework to Java with 10-20x performance improvement

**Key Features**:
- Abstract strategy framework (port from Python)
- AAS (Adaptive Accumulation Strategy) implementation
- TA4J technical indicators integration
- High-performance backtesting (<100ms per symbol)
- Parameter optimization (grid search, genetic algorithms)
- Apache Spark distributed processing
- Performance metrics calculation (Sharpe, Sortino, drawdown)
- Walk-forward analysis for validation

**Dependencies**: 
- Market Data Ingestion Engine (for historical data)
- Shared data models and schemas

**Implementation Module**: `./engines/src/main/java/com/moneyplant/engines/backtest/`

#### Spec 3: Strategy Execution Engine
**Directory**: `strategy-execution-engine/`
**Status**: Ready for implementation
**Timeline**: Phase 3 (Months 6-10)

**Purpose**: Enable real-time strategy execution with broker integration

**Key Features**:
- Real-time strategy execution (<10ms latency)
- Zerodha Kite Connect integration
- FIX protocol support for direct market access
- Order management system with lifecycle tracking
- Position and P&L tracking
- Risk management and circuit breakers
- Smart order routing
- LMAX Disruptor for ultra-low latency messaging
- Paper trading and simulation mode

**Dependencies**:
- Market Data Ingestion Engine (for real-time data)
- Backtesting Engine (for strategy framework)
- Shared order and position models

**Implementation Module**: `./engines/src/main/java/com/moneyplant/engines/strategy/`

## Implementation Approach

### Option 1: Sequential Implementation (Recommended for Small Teams)
1. **Months 1-3**: Complete Spec 1 (Market Data Ingestion)
2. **Months 4-6**: Complete Spec 2 (Backtesting Engine)
3. **Months 7-10**: Complete Spec 3 (Strategy Execution)

### Option 2: Parallel Implementation (For Larger Teams)
1. **Months 1-3**: Spec 1 (100%) + Spec 2 (0-30%)
2. **Months 3-6**: Spec 1 (Complete) + Spec 2 (100%) + Spec 3 (0-30%)
3. **Months 6-10**: Spec 2 (Complete) + Spec 3 (100%)

## Getting Started

### For Market Data Ingestion Engine (Spec 1)
```bash
# Navigate to the spec directory
cd .kiro/specs/market-data-ingestion-engine

# Read the requirements
cat requirements.md

# Start implementation in engines module
cd ../../../engines/src/main/java/com/moneyplant/engines/ingestion
```

### For Backtesting Engine (Spec 2)
```bash
# Navigate to the spec directory
cd .kiro/specs/backtesting-engine-migration

# Read the requirements
cat requirements.md

# Start implementation in engines module
cd ../../../engines/src/main/java/com/moneyplant/engines/backtest
```

### For Strategy Execution Engine (Spec 3)
```bash
# Navigate to the spec directory
cd .kiro/specs/strategy-execution-engine

# Read the requirements
cat requirements.md

# Start implementation in engines module
cd ../../../engines/src/main/java/com/moneyplant/engines/strategy
```

## Shared Components

All three HFT specs share common components located in:
- **Data Models**: `./engines/src/main/java/com/moneyplant/engines/model/`
- **Configuration**: `./engines/src/main/java/com/moneyplant/engines/config/`
- **Common Utilities**: `./engines/src/main/java/com/moneyplant/engines/common/`

## Performance Targets

| Metric | Current (Python) | Target (Java) | Improvement |
|--------|------------------|---------------|-------------|
| Backtest 2000 symbols | 4 minutes | <60 seconds | 4x |
| Per-symbol backtest | 2-5 seconds | <100ms | 20-50x |
| Strategy execution latency | N/A | <10ms | N/A |
| Order placement latency | N/A | <50ms | N/A |
| Market data throughput | Limited | 10,000+ ticks/sec | N/A |

## Technology Stack

- **Language**: Java 21 (with virtual threads)
- **Framework**: Spring Boot 3.x Modulith
- **Reactive**: Project Reactor + RxJava
- **Messaging**: Apache Kafka + LMAX Disruptor
- **Data Processing**: Apache Spark 3.x + Apache Flink
- **Storage**: PostgreSQL + TimescaleDB + Redis
- **Analytics**: Apache Trino + Apache Hudi/Iceberg
- **Monitoring**: Prometheus + Grafana
- **Deployment**: Docker + Kubernetes

## Success Criteria

- ✅ 10-100x performance improvement over Python
- ✅ <10ms strategy execution latency
- ✅ <50ms order placement latency
- ✅ 10,000+ ticks/second processing
- ✅ 99.9% uptime
- ✅ Zero data loss
- ✅ Successful broker integration
- ✅ Profitable trading with backtested strategies

## Questions or Issues?

For questions about specifications or implementation guidance, please refer to:
1. The overview document: `hft-platform-migration-overview.md`
2. Individual spec requirements documents
3. Existing codebase in `./engines/` for patterns and conventions

## Next Steps

1. **Review**: Read the overview document and all three spec requirements
2. **Plan**: Decide on sequential vs parallel implementation approach
3. **Setup**: Provision infrastructure (Kafka, TimescaleDB, monitoring)
4. **Implement**: Start with Spec 1 (Market Data Ingestion Engine)
5. **Test**: Continuous testing and validation throughout development
6. **Deploy**: Gradual rollout with monitoring and validation
