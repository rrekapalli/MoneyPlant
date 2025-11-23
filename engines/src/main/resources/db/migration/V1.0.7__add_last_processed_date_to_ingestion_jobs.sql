-- Add last_processed_date column to ingestion_jobs table for resume functionality
-- Requirements: 6.8

ALTER TABLE ingestion_jobs 
ADD COLUMN IF NOT EXISTS last_processed_date DATE;

-- Add index for efficient querying of resumable jobs
CREATE INDEX IF NOT EXISTS idx_ingestion_jobs_resumable 
ON ingestion_jobs(status, last_processed_date) 
WHERE status IN ('FAILED', 'TIMEOUT') AND last_processed_date IS NOT NULL;

-- Add comment to document the column purpose
COMMENT ON COLUMN ingestion_jobs.last_processed_date IS 
'Last successfully processed date for resume functionality. Tracks the most recent date that was fully processed and stored.';
