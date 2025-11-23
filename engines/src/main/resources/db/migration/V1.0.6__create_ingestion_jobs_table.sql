-- Create ingestion_jobs table for tracking NSE historical data ingestion jobs
-- Requirements: 3.5, 3.7, 3.8

CREATE TABLE IF NOT EXISTS ingestion_jobs (
    id BIGSERIAL PRIMARY KEY,
    job_id VARCHAR(36) NOT NULL UNIQUE,
    job_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    symbols TEXT,
    total_dates INTEGER,
    processed_dates INTEGER DEFAULT 0,
    total_records INTEGER DEFAULT 0,
    inserted_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP NOT NULL,
    completed_at TIMESTAMP,
    CONSTRAINT chk_status CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED', 'TIMEOUT'))
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_job_id ON ingestion_jobs(job_id);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_status ON ingestion_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_started_at ON ingestion_jobs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_date_range ON ingestion_jobs(start_date, end_date);

-- Add comments for documentation
COMMENT ON TABLE ingestion_jobs IS 'Tracks NSE historical data ingestion jobs with progress and statistics';
COMMENT ON COLUMN ingestion_jobs.job_id IS 'Unique job identifier (UUID)';
COMMENT ON COLUMN ingestion_jobs.job_type IS 'Type of ingestion job (e.g., NSE_BHAV_COPY)';
COMMENT ON COLUMN ingestion_jobs.status IS 'Current status: PENDING, RUNNING, COMPLETED, FAILED, TIMEOUT';
COMMENT ON COLUMN ingestion_jobs.start_date IS 'Start date of the ingestion range';
COMMENT ON COLUMN ingestion_jobs.end_date IS 'End date of the ingestion range';
COMMENT ON COLUMN ingestion_jobs.symbols IS 'Comma-separated list of symbols (null means all)';
COMMENT ON COLUMN ingestion_jobs.total_dates IS 'Total number of dates to process';
COMMENT ON COLUMN ingestion_jobs.processed_dates IS 'Number of dates processed so far';
COMMENT ON COLUMN ingestion_jobs.total_records IS 'Total number of records encountered';
COMMENT ON COLUMN ingestion_jobs.inserted_records IS 'Number of records successfully inserted';
COMMENT ON COLUMN ingestion_jobs.failed_records IS 'Number of records that failed to insert';
COMMENT ON COLUMN ingestion_jobs.error_message IS 'Error message if job failed';
COMMENT ON COLUMN ingestion_jobs.started_at IS 'Timestamp when the job was started';
COMMENT ON COLUMN ingestion_jobs.completed_at IS 'Timestamp when the job completed';
