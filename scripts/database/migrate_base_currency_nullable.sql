-- Migration script to make base_currency nullable in existing portfolios table
-- Run this script if you have an existing database with the old schema

-- Check if the column exists and is NOT NULL
DO $$
BEGIN
    -- Check if the column is currently NOT NULL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'portfolios' 
        AND column_name = 'base_currency' 
        AND is_nullable = 'NO'
    ) THEN
        -- Make the column nullable
        ALTER TABLE public.portfolios ALTER COLUMN base_currency DROP NOT NULL;
        
        -- Update any NULL values to 'INR' (though this shouldn't happen with the default)
        UPDATE public.portfolios SET base_currency = 'INR' WHERE base_currency IS NULL;
        
        RAISE NOTICE 'Successfully made base_currency column nullable in portfolios table';
    ELSE
        RAISE NOTICE 'base_currency column is already nullable or does not exist';
    END IF;
END $$;
