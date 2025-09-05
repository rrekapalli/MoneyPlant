
CREATE TABLE IF NOT EXISTS screener (
  screener_id        BIGSERIAL PRIMARY KEY,
  owner_user_id      BIGINT NOT NULL REFERENCES "users"(id),
  name               TEXT NOT NULL,
  description        TEXT,
  is_public          BOOLEAN NOT NULL DEFAULT FALSE,
  default_universe   TEXT,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ix_screener_owner ON screener(owner_user_id);
CREATE INDEX IF NOT EXISTS ix_screener_public ON screener(is_public);

CREATE TABLE IF NOT EXISTS screener_version (
  screener_version_id BIGSERIAL PRIMARY KEY,
  screener_id         BIGINT NOT NULL REFERENCES screener(screener_id) ON DELETE CASCADE,
  version_number      INT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'active',
  engine              TEXT NOT NULL DEFAULT 'sql',
  dsl_json            JSONB,
  compiled_sql        TEXT,
  params_schema_json  JSONB,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (screener_id, version_number)
);

CREATE TABLE IF NOT EXISTS screener_paramset (
  paramset_id         BIGSERIAL PRIMARY KEY,
  screener_version_id BIGINT NOT NULL REFERENCES screener_version(screener_version_id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  params_json         JSONB NOT NULL,
  created_by_user_id  BIGINT NOT NULL REFERENCES "users"(id),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (screener_version_id, name)
);

CREATE TABLE IF NOT EXISTS screener_schedule (
  schedule_id         BIGSERIAL PRIMARY KEY,
  screener_id         BIGINT NOT NULL REFERENCES screener(screener_id) ON DELETE CASCADE,
  cron_expr           TEXT NOT NULL,
  timezone            TEXT NOT NULL DEFAULT 'Asia/Kolkata',
  is_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS screener_alert (
  alert_id            BIGSERIAL PRIMARY KEY,
  screener_id         BIGINT NOT NULL REFERENCES screener(screener_id) ON DELETE CASCADE,
  condition_json      JSONB NOT NULL,
  delivery_channels   TEXT[] NOT NULL DEFAULT ARRAY['inapp'],
  is_enabled          BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------
-- 3) EXECUTIONS / RUNS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS screener_run (
  screener_run_id      BIGSERIAL PRIMARY KEY,
  screener_id          BIGINT NOT NULL REFERENCES screener(screener_id) ON DELETE CASCADE,
  screener_version_id  BIGINT NOT NULL REFERENCES screener_version(screener_version_id),
  triggered_by_user_id BIGINT REFERENCES "users"(id),
  paramset_id          BIGINT REFERENCES screener_paramset(paramset_id),
  params_json          JSONB,
  universe_snapshot    JSONB,
  run_for_trading_day  DATE,
  started_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at          TIMESTAMPTZ,
  status               TEXT NOT NULL DEFAULT 'running',
  error_message        TEXT,
  total_candidates     INT,
  total_matches        INT
);

CREATE INDEX IF NOT EXISTS ix_screener_run_cascade
  ON screener_run(screener_id, run_for_trading_day DESC, started_at DESC);

CREATE INDEX IF NOT EXISTS ix_screener_run_status
  ON screener_run(status);

-- ---------------------------------------------------------------------
-- 4) RESULTS SNAPSHOTS
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS screener_result (
  screener_run_id  BIGINT NOT NULL REFERENCES screener_run(screener_run_id) ON DELETE CASCADE,
  symbol        TEXT NOT NULL REFERENCES nse_eq_master(symbol),
  matched          BOOLEAN NOT NULL,
  score_0_1        NUMERIC(6,4),
  rank_in_run      INT,
  metrics_json     JSONB,
  reason_json      JSONB,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (screener_run_id, symbol)
);

CREATE INDEX IF NOT EXISTS ix_screener_result_rank
  ON screener_result(screener_run_id, rank_in_run);

CREATE INDEX IF NOT EXISTS ix_screener_result_score
  ON screener_result(screener_run_id, score_0_1 DESC);

CREATE TABLE IF NOT EXISTS screener_result_diff (
  screener_run_id       BIGINT NOT NULL REFERENCES screener_run(screener_run_id) ON DELETE CASCADE,
  prev_screener_run_id  BIGINT NOT NULL REFERENCES screener_run(screener_run_id),
  symbol             TEXT NOT NULL REFERENCES nse_eq_master(symbol),
  change_type           TEXT NOT NULL,
  prev_rank             INT,
  new_rank              INT,
  PRIMARY KEY (screener_run_id, prev_screener_run_id, symbol)
);

-- ---------------------------------------------------------------------
-- 5) USER INTERACTION
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS screener_star (
  screener_id  BIGINT NOT NULL REFERENCES screener(screener_id) ON DELETE CASCADE,
  user_id      BIGINT NOT NULL REFERENCES "users"(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (screener_id, user_id)
);

CREATE TABLE IF NOT EXISTS screener_saved_view (
  saved_view_id BIGSERIAL PRIMARY KEY,
  screener_id   BIGINT NOT NULL REFERENCES screener(screener_id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES "users"(id),
  name          TEXT NOT NULL,
  table_prefs   JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (screener_id, user_id, name)
);

-- ---------------------------------------------------------------------
-- 8) VIEWS / HELPERS
-- ---------------------------------------------------------------------

CREATE OR REPLACE VIEW v_screener_last_run AS
SELECT DISTINCT ON (sr.screener_id)
  sr.screener_id, sr.screener_run_id, sr.run_for_trading_day, sr.started_at, sr.finished_at,
  sr.total_candidates, sr.total_matches
FROM screener_run sr
WHERE sr.status = 'success'
ORDER BY sr.screener_id, sr.run_for_trading_day DESC, sr.started_at DESC;

CREATE OR REPLACE VIEW v_screener_last_results AS
SELECT
  l.screener_id,
  r.symbol,
  r.matched,
  r.score_0_1,
  r.rank_in_run,
  r.metrics_json,
  r.reason_json
FROM v_screener_last_run l
JOIN screener_result r ON r.screener_run_id = l.screener_run_id
ORDER BY l.screener_id, r.rank_in_run NULLS LAST, r.score_0_1 DESC NULLS LAST;
