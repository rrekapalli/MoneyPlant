# Troubleshooting Database Migration Issues

## Problem Description

The application is failing to start with the following error:

```
ERROR: cannot alter type of a column used by a view or rule
Detail: rule _RETURN on view latest_nse_indices_ticks depends on column "day_high"
```

## Root Cause

This error occurs because:

1. **Existing Table**: The `nse_indices_ticks` table already exists in the database with a different schema
2. **Dependent Views**: There are database views (`latest_nse_indices_ticks`, `nse_market_summary`) that depend on the existing columns
3. **Schema Mismatch**: Hibernate is trying to alter the existing table to match the new entity definition, but can't because of the view dependencies
4. **Column Type Changes**: The new entity uses different column types (e.g., `DECIMAL(15,4)` instead of `DECIMAL(15,2)`)

## Solution

### Option 1: Run the Migration Script (Recommended)

1. **Stop the application** if it's running
2. **Run the migration script** to update the database schema:

   **Linux/Mac:**
   ```bash
   cd engines
   ./scripts/run-migration.sh
   ```

   **Windows:**
   ```cmd
   cd engines
   scripts\run-migration.bat
   ```

3. **Verify the migration** was successful
4. **Start the application** - it should now work with `ddl-auto: validate`

### Option 2: Manual Database Update

If you prefer to manually update the database:

1. **Connect to your PostgreSQL database**
2. **Drop the dependent views**:
   ```sql
   DROP VIEW IF EXISTS latest_nse_indices_ticks;
   DROP VIEW IF EXISTS nse_market_summary;
   ```

3. **Drop the existing table**:
   ```sql
   DROP TABLE IF EXISTS nse_indices_ticks CASCADE;
   ```

4. **Run the migration script** from `sql/migrate_nse_indices_ticks_table.sql`

### Option 3: Reset and Recreate (Development Only)

⚠️ **WARNING: This will delete all existing data!**

1. **Stop the application**
2. **Drop the entire database schema**:
   ```sql
   DROP SCHEMA public CASCADE;
   CREATE SCHEMA public;
   ```

3. **Change application.yml** back to:
   ```yaml
   jpa:
     hibernate:
       ddl-auto: create-drop  # This will recreate everything
   ```

4. **Start the application** - it will create the schema from scratch
5. **Change back to**:
   ```yaml
   jpa:
     hibernate:
       ddl-auto: validate
   ```

## Configuration Changes Made

### 1. Application Properties
The `application.yml` has been updated to prevent automatic schema changes:

```yaml
jpa:
  hibernate:
    ddl-auto: validate  # Changed from 'update' to 'validate'
```

### 2. Migration Script
A comprehensive migration script has been created at:
- `sql/migrate_nse_indices_ticks_table.sql`

### 3. Migration Scripts
Executable scripts have been created at:
- `scripts/run-migration.sh` (Linux/Mac)
- `scripts/run-migration.bat` (Windows)

## Verification Steps

After running the migration, verify the setup:

### 1. Check Table Structure
```sql
\d nse_indices_ticks
```

### 2. Check Sample Data
```sql
SELECT COUNT(*) FROM nse_indices_ticks;
SELECT * FROM latest_nse_indices_ticks;
```

### 3. Check Views
```sql
SELECT * FROM nse_market_summary;
```

### 4. Test Application
Start the application and check:
- Health endpoint: `GET /api/nse-indices-ticks/health`
- Data count: `GET /api/nse-indices-ticks/count`

## Common Issues and Solutions

### Issue 1: Permission Denied
**Error**: `permission denied for table nse_indices_ticks`

**Solution**: Ensure your database user has the necessary permissions:
```sql
GRANT ALL PRIVILEGES ON TABLE nse_indices_ticks TO your_app_user;
GRANT USAGE, SELECT ON SEQUENCE nse_indices_ticks_id_seq TO your_app_user;
```

### Issue 2: Connection Failed
**Error**: `could not connect to server`

**Solution**: Check your database connection parameters in the migration script:
- Host, port, database name
- Username and password
- Network connectivity

### Issue 3: Migration Script Errors
**Error**: SQL syntax errors in migration script

**Solution**: 
1. Check PostgreSQL version compatibility
2. Verify the script syntax
3. Run the script step by step

### Issue 4: Application Still Fails
**Error**: Application startup fails even after migration

**Solution**:
1. Verify `ddl-auto: validate` is set in `application.yml`
2. Check that the table structure matches the entity exactly
3. Restart the application completely

## Prevention

To prevent this issue in the future:

1. **Use Migration Scripts**: Always use proper database migration scripts instead of relying on Hibernate's auto-schema generation
2. **Version Control**: Keep database schema changes in version control
3. **Testing**: Test schema changes in development before applying to production
4. **Backup**: Always backup your database before running migrations

## Rollback Plan

If the migration fails and you need to rollback:

1. **Restore from backup** if available
2. **Manual rollback** by recreating the original table structure
3. **Contact support** if you need assistance

## Support

If you continue to experience issues:

1. **Check the logs** for detailed error messages
2. **Verify database connectivity** and permissions
3. **Review the migration script** for any syntax issues
4. **Check PostgreSQL version** compatibility

## Summary

The database migration issue is caused by a schema mismatch between the existing table and the new entity definition. The solution is to run the provided migration script to update the database schema to match the new entity structure. After the migration, the application should start successfully with the `ddl-auto: validate` setting.
