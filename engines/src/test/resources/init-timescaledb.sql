-- Initialize TimescaleDB extension for testing
-- This script is run when the PostgreSQL test container starts

CREATE EXTENSION IF NOT EXISTS timescaledb CASCADE;
