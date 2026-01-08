# Migration Guide: Adding Sources and Confidence Levels

## Overview

This migration adds `sources` (JSONB) and `confidence_level` (integer) fields to the core entities: Officials, Sanctions, Businesses, and Testaferros.

## Migration File

**File**: `backend/src/migrations/1736086800000-AddSourcesAndConfidence.ts`

## What the Migration Does

### 1. Officials Table
- Adds `sources` JSONB column (nullable)
- Adds `confidence_level` integer column (default: 3)
- Creates index on `confidence_level`

### 2. Sanctions Table
- Adds `sources` JSONB column (nullable)
- Adds `confidence_level` integer column (default: 3)
- Creates index on `confidence_level`

### 3. Businesses Table
- Adds `sources` JSONB column (nullable)
- Migrates data from `evidence_sources` to `sources`
- Drops old `evidence_sources` column
- Updates `confidence_level` default from 1 to 3
- Creates index on `confidence_level`

### 4. Testaferros Table
- Adds `sources` JSONB column (nullable)
- Adds `confidence_level` integer column if not exists (default: 3)
- Creates index on `confidence_level`

## Running the Migration

### Prerequisites

1. Ensure you have a DATABASE_URL in your `.env` file:
   ```bash
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

2. Install dependencies if not already installed:
   ```bash
   cd backend
   npm install
   ```

### Running with TypeORM CLI

**Note**: This requires a TypeORM data source configuration file. Since the project uses `autoLoadEntities: true` in `app.module.ts`, you may need to create a temporary data source file.

#### Option 1: Using npm scripts (Recommended)

```bash
cd backend
npm run migration:run
```

This runs:
```bash
pnpm typeorm migration:run -d src/config/typeorm.config.ts
```

#### Option 2: Manual SQL Execution

If you don't have a data source config file, you can run the migration SQL manually:

```bash
# Connect to your database
psql $DATABASE_URL

# Then execute the migration statements
```

See the migration file for the exact SQL statements.

### Verifying the Migration

After running, verify the changes:

```sql
-- Check officials table
\d officials

-- Verify sources column exists and is JSONB
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'officials'
AND column_name IN ('sources', 'confidence_level');

-- Check the index was created
SELECT indexname FROM pg_indexes
WHERE tablename = 'officials' AND indexname LIKE '%confidence%';

-- Repeat for other tables
```

### Test with Sample Data

```sql
-- Insert an official with sources
INSERT INTO officials (
  first_name, 
  last_name, 
  full_name, 
  status,
  confidence_level,
  sources
) VALUES (
  'Test',
  'Official',
  'Test Official',
  'active',
  5,
  '[{
    "url": "https://ofac.treasury.gov/test",
    "type": "official",
    "title": "OFAC SDN List"
  }]'::jsonb
);

-- Query to verify
SELECT 
  full_name, 
  confidence_level,
  sources
FROM officials
WHERE last_name = 'Official';
```

## Rollback

If you need to rollback the migration:

```bash
cd backend
npm run migration:revert
```

This will:
1. Drop `sources` and `confidence_level` columns from Officials and Sanctions
2. Restore `evidence_sources` column in Businesses (with data from `sources`)
3. Revert `confidence_level` default from 3 to 1 in Businesses
4. Drop `sources` column from Testaferros
5. Drop all `confidence_level` indexes

## Impact Assessment

### Breaking Changes
**None** - All new fields are optional with safe defaults.

### Existing Data
- All existing records will have:
  - `sources`: `null` (can be updated later)
  - `confidence_level`: `3` (Credible)
  
### Business Table Special Case
- Existing `evidence_sources` data is automatically migrated to `sources`
- The structure is compatible (both are JSONB)
- Default `confidence_level` changes from 1 to 3

## Performance Considerations

### Index Performance
The migration creates indexes on `confidence_level` for all tables:
- Speeds up queries filtering by confidence level
- Minimal overhead (integer index)

### JSONB Performance
- PostgreSQL JSONB is efficient for storing and querying JSON
- For large datasets, consider adding GIN indexes if needed:
  ```sql
  CREATE INDEX idx_officials_sources_gin ON officials USING GIN (sources);
  ```

## Troubleshooting

### Migration Already Ran

If you see "Migration has already been executed":
```bash
# Check migration status
psql $DATABASE_URL -c "SELECT * FROM migrations ORDER BY timestamp DESC LIMIT 5;"

# If you need to force re-run (NOT recommended in production)
psql $DATABASE_URL -c "DELETE FROM migrations WHERE name = 'AddSourcesAndConfidence1736086800000';"
```

### Column Already Exists

If columns already exist (from synchronize: true in development):
```bash
# The migration handles this with "IF NOT EXISTS" where applicable
# Business table migration uses explicit checks
```

### Database Connection Issues

Ensure your DATABASE_URL is correct:
```bash
# Test connection
psql $DATABASE_URL -c "SELECT version();"
```

## Post-Migration Steps

1. **Update existing records** (optional):
   ```sql
   -- Set high confidence for OFAC-sourced officials
   UPDATE officials
   SET confidence_level = 5,
       sources = '[{"url": "https://ofac.treasury.gov", "type": "official"}]'::jsonb
   WHERE id IN (SELECT DISTINCT official_id FROM sanctions WHERE type = 'ofac_sdn');
   ```

2. **Verify API responses** include new fields:
   ```bash
   curl http://localhost:3000/officials/{id}
   # Should include "confidenceLevel" and "sources" fields
   ```

3. **Test filtering**:
   ```bash
   curl "http://localhost:3000/api/v1/businesses?minConfidence=4"
   ```

## Next Steps

After successful migration:
1. ✅ Test CRUD operations with new fields
2. ✅ Verify DTOs validate sources correctly
3. ✅ Run full test suite: `npm run test:cov`
4. ✅ Deploy to staging environment
5. Document source addition workflow for editors
6. Train content team on confidence level guidelines
