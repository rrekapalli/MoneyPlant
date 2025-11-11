# Database Migration Quick Start

## TL;DR - Run This

```bash
# Connect to database
psql -h postgres.tailce422e.ts.net -U postgres -d MoneyPlant

# Run migrations
\i engines/src/main/resources/db/migration/V1__create_nse_eq_ticks_table.sql
\i engines/src/main/resources/db/migration/V2__convert_ohlcv_to_hypertable.sql
```

That's it! The migration script will:
- ✓ Check if TimescaleDB is available
- ✓ Add `time` column to existing `nse_eq_ohlcv_historic` table
- ✓ Migrate data from `date` to `time` column
- ✓ Convert to hypertable (if TimescaleDB available)
- ✓ Create `nse_eq_ticks` table for intraday data
- ✓ Handle all edge cases automatically

## What If I See Errors?

### "column 'time' does not exist" - FIXED ✓
The updated script now adds the `time` column automatically. Just re-run the migration.

### "extension 'timescaledb' already exists" - OK ✓
This is just a notice, not an error. The migration will continue.

### "timestamp without time zone" warnings - OK ✓
These are warnings about best practices. The table will work fine.

### "TimescaleDB extension not available" - OK ✓
The system will work with standard PostgreSQL. For better performance, install TimescaleDB:
```bash
sudo apt-get install timescaledb-2-postgresql-15
```

## Verify Migration

```sql
-- Check if time column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'nse_eq_ohlcv_historic' 
AND column_name IN ('date', 'time');

-- Should show both 'date' (date) and 'time' (timestamp with time zone)

-- Check if data was migrated
SELECT COUNT(*) as total, COUNT(time) as with_time 
FROM nse_eq_ohlcv_historic;

-- Should show same count for both

-- Check if nse_eq_ticks table exists
\d nse_eq_ticks
```

## If Migration Fails

See `DATABASE_MIGRATION_TROUBLESHOOTING.md` for detailed troubleshooting steps.

Or run the alternative migration (works without TimescaleDB):
```sql
\i engines/src/main/resources/db/migration/V2_alternative__add_time_column_without_timescaledb.sql
```

## Next Steps

After successful migration:
1. ✓ Verify tables exist
2. ✓ Build the project: `mvn clean compile -f engines/pom.xml`
3. ✓ Run tests: `mvn test -f engines/pom.xml`
4. ✓ Start implementing Task 2: Core data models

## Need Help?

- Full setup guide: `INFRASTRUCTURE_SETUP.md`
- Troubleshooting: `DATABASE_MIGRATION_TROUBLESHOOTING.md`
- Architecture: `src/main/java/com/moneyplant/engines/ingestion/README.md`
