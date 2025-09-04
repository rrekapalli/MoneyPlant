# Screeners Schema: PostgreSQL Views and Materialized Views

This document defines the PostgreSQL views and materialized views expected by the Engines Screener module. Trino reads these objects via the `postgres` catalog and `public` schema, and the Java TrinoExecutor composes queries against them.

Assumptions:
- Base tables in PostgreSQL (schema `public`):
  - `nse_eq_master` — master/security metadata (symbol, company_name, sector, industry, etc.)
  - `nse_eq_indicators` — historical technical indicators with columns such as `symbol`, `date`, `rsi_14`, `macd_line`, `macd_signal`, `sma_50`, `sma_200`, etc.
  - `nse_eq_ohlcv_historic` — historical daily OHLCV with columns: `symbol`, `date`, `open`, `high`, `low`, `close`, `volume`, etc.
- All objects are created in `public` schema.
- Materialized views are used for fast “latest snapshot” selection in Trino.

Note: PostgreSQL does not support `CREATE MATERIALIZED VIEW IF NOT EXISTS`. Use `DROP MATERIALIZED VIEW IF EXISTS ...;` before `CREATE MATERIALIZED VIEW` when recreating.

---

## 1) Latest Indicators per Symbol

Materialized view that keeps only the most recent indicator row per `symbol`.

```sql
-- Latest indicators per symbol
DROP MATERIALIZED VIEW IF EXISTS public.latest_indicators_mv;
CREATE MATERIALIZED VIEW public.latest_indicators_mv AS
WITH ranked AS (
  SELECT i.*,
         ROW_NUMBER() OVER (PARTITION BY i.symbol ORDER BY i.date DESC) AS rn
  FROM public.nse_eq_indicators i
)
SELECT *
FROM ranked
WHERE rn = 1;

-- Optional index to speed up joins on symbol
CREATE INDEX IF NOT EXISTS idx_latest_indicators_mv_symbol
  ON public.latest_indicators_mv (symbol);
```

Refresh strategy:
```sql
-- Refresh after indicator loads complete
REFRESH MATERIALIZED VIEW CONCURRENTLY public.latest_indicators_mv;
```

> Use CONCURRENTLY only if the view has at least one unique index that covers all rows (often a synthetic unique key). If not available, use a regular refresh.

---

## 2) Latest OHLCV Date Snapshot

Materialized view that contains all symbols’ OHLCV rows for the latest available trading `date`.

```sql
-- Latest OHLCV snapshot for the max(date)
DROP MATERIALIZED VIEW IF EXISTS public.latest_ohlcv_mv;
CREATE MATERIALIZED VIEW public.latest_ohlcv_mv AS
WITH md AS (
  SELECT MAX(h.date) AS max_date
  FROM public.nse_eq_ohlcv_historic h
)
SELECT h.*
FROM public.nse_eq_ohlcv_historic h
JOIN md ON h.date = md.max_date;

-- Optional index to speed up joins on symbol
CREATE INDEX IF NOT EXISTS idx_latest_ohlcv_mv_symbol
  ON public.latest_ohlcv_mv (symbol);
```

Refresh strategy:
```sql
-- Refresh after daily OHLCV load is completed
REFRESH MATERIALIZED VIEW CONCURRENTLY public.latest_ohlcv_mv;
```

---

## 3) Convenience View: Unified Latest Snapshot

A regular view that joins Master with both materialized views for quick, ad-hoc inspection or simple reporting. Trino queries in the Engines module already perform left joins; this view is optional but handy for manual queries.

```sql
DROP VIEW IF EXISTS public.latest_snapshot_v;
CREATE VIEW public.latest_snapshot_v AS
WITH li AS (
  SELECT * FROM public.latest_indicators_mv
),
lh AS (
  SELECT * FROM public.latest_ohlcv_mv
)
SELECT em.symbol,
       em.company_name,
       em.sector,
       em.industry,
       lh.date        AS ohlcv_date,
       lh.open,
       lh.high,
       lh.low,
       lh.close,
       lh.volume,
       li.rsi_14,
       li.macd_line,
       li.macd_signal,
       li.sma_50,
       li.sma_200
FROM public.nse_eq_master em
LEFT JOIN li ON li.symbol = em.symbol
LEFT JOIN lh ON lh.symbol = em.symbol;
```

---

## Operational Notes

- Ownership and permissions: ensure the database role used by Trino (and by your app) has SELECT on the base tables, views, and materialized views.
- Refresh cadence:
  - `latest_indicators_mv`: refresh after indicator calculation loads finish (e.g., cron or ingestion pipeline step).
  - `latest_ohlcv_mv`: refresh after daily OHLCV loads finish.
- Indexes: the suggested indexes on `symbol` help join performance from Trino. Depending on your workload, consider a composite index for frequent filters (e.g., `sector` on `nse_eq_master`) but those apply to base tables rather than the MVs.
- Naming: these objects are referenced from the Engines module as `postgres.public.latest_indicators_mv` and `postgres.public.latest_ohlcv_mv` when accessed via Trino. In PostgreSQL they are created as `public.latest_indicators_mv` and `public.latest_ohlcv_mv`.

## Validation Checklist

- [ ] Base tables exist with expected columns.
- [ ] Materialized views created successfully.
- [ ] Optional indexes created.
- [ ] Refresh executed post-ingestion.
- [ ] Engines service can query via Trino without errors.
