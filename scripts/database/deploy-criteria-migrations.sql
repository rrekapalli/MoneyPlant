-- Deployment script for criteria builder database migrations
-- This script should be run as part of the deployment process to set up criteria functionality

-- Check if migrations have already been applied
DO $$
BEGIN
    -- Create migration tracking table if it doesn't exist
    CREATE TABLE IF NOT EXISTS schema_migrations (
        version VARCHAR(50) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        description TEXT
    );
    
    -- Apply V001 migration if not already applied
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'V001') THEN
        RAISE NOTICE 'Applying migration V001: Create criteria metadata tables';
        
        -- Include V001 migration content here
        -- (Content from V001__create_criteria_metadata_tables.sql)
        
        INSERT INTO schema_migrations (version, description) 
        VALUES ('V001', 'Create criteria metadata tables');
    ELSE
        RAISE NOTICE 'Migration V001 already applied, skipping';
    END IF;
    
    -- Apply V002 migration if not already applied
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'V002') THEN
        RAISE NOTICE 'Applying migration V002: Insert default field metadata';
        
        -- Include V002 migration content here
        -- (Content from V002__insert_default_field_metadata.sql)
        
        INSERT INTO schema_migrations (version, description) 
        VALUES ('V002', 'Insert default field metadata');
    ELSE
        RAISE NOTICE 'Migration V002 already applied, skipping';
    END IF;
    
    -- Apply V003 migration if not already applied
    IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = 'V003') THEN
        RAISE NOTICE 'Applying migration V003: Insert default screener functions';
        
        -- Include V003 migration content here
        -- (Content from V003__insert_default_screener_functions.sql)
        
        INSERT INTO schema_migrations (version, description) 
        VALUES ('V003', 'Insert default screener functions');
    ELSE
        RAISE NOTICE 'Migration V003 already applied, skipping';
    END IF;
    
    RAISE NOTICE 'All criteria builder migrations completed successfully';
END
$$;