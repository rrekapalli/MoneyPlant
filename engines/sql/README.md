# Database Setup Scripts for MoneyPlant Engines

This directory contains SQL scripts to set up and manage the database schema for the MoneyPlant Engines application.

## Files Overview

### 1. `create_nse_indices_ticks_table.sql`
**Purpose**: Creates the `nse_indices_ticks` table from scratch with the correct structure.

**When to use**: 
- Setting up a new database
- When you want to completely recreate the table structure
- Development/testing environments

**What it does**:
- Creates the table with all required columns
- Sets up proper data types (NUMERIC for prices, VARCHAR for text)
- Creates necessary indexes for performance
- Creates a view for latest tick data
- Sets up unique constraints for UPSERT operations

### 2. `migrate_nse_indices_ticks_table.sql`
**Purpose**: Safely migrates an existing `nse_indices_ticks` table to match the new entity structure.

**When to use**:
- When you have an existing table that needs to be updated
- Production environments where you can't drop the table
- When migrating from an older schema version

**What it does**:
- Checks if the table exists
- Safely alters column types (e.g., from DECIMAL to NUMERIC)
- Adds missing columns if they don't exist
- Updates column lengths to match the new specification
- Recreates the view that was causing conflicts
- Creates missing indexes

## Usage Instructions

### Option 1: Fresh Database Setup
If you're setting up a new database or can afford to lose existing data:

```bash
# Connect to your PostgreSQL database
psql -h postgres.tailce422e.ts.net -p 5432 -U postgres -d MoneyPlant

# Run the create script
\i create_nse_indices_ticks_table.sql
```

### Option 2: Migrate Existing Database
If you have an existing table that needs to be updated:

```bash
# Connect to your PostgreSQL database
psql -h postgres.tailce422e.ts.net -p 5432 -U postgres -d MoneyPlant

# Run the migration script
\i migrate_nse_indices_ticks_table.sql
```

### Option 3: Using Docker (if available)
```bash
# If you have access to the database container
docker exec -it your_postgres_container psql -U postgres -d MoneyPlant -f /path/to/script.sql
```

## Table Structure

The `nse_indices_ticks` table includes:

### Core Index Data
- `index_name`: Name of the NSE index (e.g., "NIFTY 50", "SENSEX")
- `index_symbol`: Symbol/abbreviation (e.g., "NIFTY", "SENSEX")
- `last_price`: Last traded price
- `variation`: Price change from previous close
- `percent_change`: Percentage change from previous close

### Price Data
- `open_price`: Opening price for the day
- `day_high`: Highest price during the day
- `day_low`: Lowest price during the day
- `previous_close`: Previous day's closing price
- `year_high`: 52-week high
- `year_low`: 52-week low
- `indicative_close`: Current session's indicative close

### Market Data
- `pe_ratio`: Price-to-Earnings ratio
- `pb_ratio`: Price-to-Book ratio
- `dividend_yield`: Dividend yield percentage
- `declines`: Number of declining stocks
- `advances`: Number of advancing stocks
- `unchanged`: Number of unchanged stocks

### Chart and Historical Data
- `percent_change_365d`: 365-day percentage change
- `percent_change_30d`: 30-day percentage change
- `chart_365d_path`: Path to 365-day chart
- `chart_30d_path`: Path to 30-day chart
- `chart_today_path`: Path to today's chart

### Metadata
- `tick_timestamp`: When the data was received
- `market_status`: Current market status
- `trade_date`: Trading date
- `created_by`, `created_on`: Audit fields
- `modified_by`, `modified_on`: Audit fields

## Important Notes

1. **Unique Constraint**: The table has a unique constraint on `(index_name, tick_timestamp)` to enable UPSERT operations.

2. **View Dependency**: The `latest_nse_indices_ticks` view provides the latest data for each index and is used by the application.

3. **Data Types**: All price fields use `NUMERIC(15,4)` for precision, and percentage fields use `NUMERIC(10,4)`.

4. **Indexes**: Performance indexes are created on commonly queried columns.

5. **Timezone**: The `tick_timestamp` field uses `TIMESTAMP WITH TIME ZONE` for proper timezone handling.

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure your database user has CREATE, ALTER, and DROP privileges.

2. **View Conflicts**: If you get view dependency errors, the migration script handles this automatically.

3. **Column Type Conflicts**: The migration script safely converts existing data types.

4. **Missing Columns**: The migration script adds any missing columns automatically.

### Verification

After running either script, verify the setup:

```sql
-- Check table structure
\d nse_indices_ticks

-- Check indexes
\di nse_indices_ticks*

-- Check view
\dv latest_nse_indices_ticks

-- Test with sample data
SELECT COUNT(*) FROM nse_indices_ticks;
```

## Next Steps

After running the database setup:

1. **Update Application Configuration**: Ensure `spring.jpa.hibernate.ddl-auto=validate` in your application properties.

2. **Test the Application**: Start the MoneyPlant Engines application to verify database connectivity.

3. **Monitor Logs**: Check for any remaining database-related errors.

4. **Data Migration**: If you had existing data, verify it's accessible and properly formatted.
