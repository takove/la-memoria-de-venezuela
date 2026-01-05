# Tier 1 Sanctions Matching Implementation

## Overview

This implementation adds **Tier 1 sanctions list matching** to the La Memoria de Venezuela pipeline, enabling automatic verification of entities against OFAC (Office of Foreign Assets Control) and other sanctions lists.

## Architecture

```
NER Extraction → Tier 1 Fuzzy Matching → LLM Review → Human Curator
     ↓               ↓ (>95% = auto-approve)    ↓           ↓
StgEntity    →  Tier1Official Match  →   Review Queue   →  Graph
```

### Components

1. **Tier1Official Entity** (`tier1-official.entity.ts`)
   - Stores verified regime officials from sanctions lists
   - Fields: fullName, aliases, nationality, dateOfBirth, sanctionsPrograms, tier, source
   - Confidence level always 5 (OFFICIAL) for government sources

2. **OfacImporterService** (`ofac-importer.service.ts`)
   - Imports OFAC SDN (Specially Designated Nationals) list
   - Currently uses hardcoded Venezuelan regime officials
   - TODO: Parse actual OFAC XML/CSV from https://www.treasury.gov/ofac/downloads/

3. **Tier1MatchService** (`tier1-match.service.ts`)
   - Fuzzy matching using **fuzzball** (fuzzywuzzy port)
   - Token sort ratio algorithm (optimal for name matching)
   - Spanish text normalization (accent removal)
   - Scoring:
     - **>95%**: Confidence 5 (OFFICIAL) - Auto-approve
     - **85-95%**: Confidence 4 (VERIFIED) - LLM review
     - **<85%**: No match - Standard quality checks

4. **ReviewQueueService** (updated)
   - Enhanced with Tier 1 match context
   - LLM prompts include match details for verification
   - Auto-approval logic: Tier 1 match (>95%) + LLM approve = bypass human review

## Data Sources

### Current (Hardcoded)
- **10 Venezuelan regime officials**:
  - Nicolás Maduro (President, VENEZUELA + NARCOTICS)
  - Diosdado Cabello (National Assembly, VENEZUELA + NARCOTICS)
  - Delcy Rodríguez (VP, VENEZUELA)
  - Jorge Rodríguez (National Assembly, VENEZUELA)
  - Tareck El Aissami (Petroleum Minister, VENEZUELA + NARCOTICS)
  - Vladimir Padrino López (Defense Minister, VENEZUELA)
  - Néstor Reverol (Interior Minister, VENEZUELA + NARCOTICS)
  - Alex Saab (Financier/Testaferro, VENEZUELA + CORRUPTION)
  - PDVSA (State oil company, VENEZUELA)
  - CONVIASA (State airline, VENEZUELA)

### Planned (Production)

1. **OFAC SDN List** (Priority 1)
   - URL: https://www.treasury.gov/ofac/downloads/sdn.xml
   - Format: XML with SDN entries, aliases, addresses
   - Update frequency: Daily
   - Coverage: ~200 Venezuelan officials

2. **OpenSanctions.org API** (Priority 2)
   - URL: https://api.opensanctions.org/search/default?countries=ve
   - Format: JSON API
   - Aggregates: OFAC, EU, Canada, UK sanctions
   - Coverage: 25+ EU-sanctioned Venezuelan officials

3. **Atlantic Council Tracker** (Priority 3)
   - Manual scraping: https://www.atlanticcouncil.org/programs/adrienne-arsht-latin-america-center/venezuela-sanctions-tracker/
   - Data: 209 US, 123 Canadian, 69 EU sanctions
   - Update frequency: Weekly

## API Endpoints

### Import OFAC List
```bash
POST /api/v1/tier1/import/ofac
```

Response:
```json
{
  "message": "OFAC import complete",
  "imported": 10,
  "updated": 0,
  "skipped": 0
}
```

### Get All Tier 1 Officials
```bash
GET /api/v1/tier1/officials
```

Response:
```json
{
  "total": 10,
  "data": [
    {
      "id": "uuid",
      "externalId": "ofac-maduro-001",
      "fullName": "Nicolás Maduro Moros",
      "aliases": ["Nicolas Maduro", "Maduro Moros"],
      "nationality": "VE",
      "dateOfBirth": "1962-11-23",
      "sanctionsPrograms": ["VENEZUELA", "NARCOTICS"],
      "tier": 1,
      "entityType": "PERSON",
      "source": "OFAC",
      "confidenceLevel": 5,
      "notes": "President of Venezuela. Sanctioned July 31, 2017..."
    }
  ]
}
```

### Get Tier 1 Statistics
```bash
GET /api/v1/tier1/stats
```

Response:
```json
{
  "total": 10,
  "bySource": {
    "OFAC": 10
  },
  "byTier": {
    "1": 10
  }
}
```

## Fuzzy Matching Algorithm

### Normalization
```typescript
// Input: "Nicolás Maduro Moros"
// Normalized: "Nicolas Maduro Moros" (accent removed)
text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
```

### Scoring (Token Sort Ratio)
```typescript
import * as fuzzball from 'fuzzball';

// Example matches:
fuzzball.token_sort_ratio("Nicolás Maduro", "Nicolas Maduro") // → 100
fuzzball.token_sort_ratio("Maduro", "Nicolás Maduro Moros")   // → 53
fuzzball.token_sort_ratio("Diosdado Cabello", "Cabello")      // → 73
```

### Spanish Name Handling
- **Accents**: José → Jose, María → Maria
- **Nicknames** (planned):
  - Nicolás → Nicolas, Nico
  - José → Jose, Pepe
  - Francisco → Paco, Pancho

## Integration with Review Queue

### Before (No Tier 1)
```
NER Entity → Quality Check → LLM Review → Human Review
```

### After (With Tier 1)
```
NER Entity → Tier 1 Match (fuzzy) → Quality Check → LLM Review (with match context) → Human Review
             ↓ (if >95% match)
             Auto-Approve → Graph
```

### LLM Prompt Enhancement
```
**Entity:** Nicolás Maduro

**Tier 1 Match Found:**
- Matched official: Nicolás Maduro Moros
- Match score: 100% (exact match)
- Sanctions programs: VENEZUELA, NARCOTICS
- Aliases: Nicolas Maduro, Maduro Moros
- Source: OFAC
- Notes: President of Venezuela. Sanctioned July 31, 2017...

Does this entity match the sanctioned official? Consider:
1. Name variations (full name vs alias)
2. Context of the article
3. Potential false positives (common names, different people)
```

## Database Schema

```sql
CREATE TABLE tier1_officials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  external_id VARCHAR UNIQUE,              -- OFAC UID, OpenSanctions ID
  full_name VARCHAR(200),                  -- Nicolás Maduro Moros
  aliases JSONB DEFAULT '[]',              -- ["Nicolas Maduro", "Maduro Moros"]
  nationality VARCHAR,                     -- VE (ISO code)
  date_of_birth DATE,                      -- 1962-11-23
  sanctions_programs JSONB DEFAULT '[]',   -- ["VENEZUELA", "NARCOTICS"]
  tier INT DEFAULT 1,                      -- 1-5 (Tier 1 = govt officials)
  entity_type VARCHAR CHECK(entity_type IN ('PERSON', 'ORGANIZATION')),
  source VARCHAR(50),                      -- OFAC, OpenSanctions, AtlanticCouncil
  confidence_level INT DEFAULT 5,          -- Always 5 for official sources
  notes TEXT,                              -- Remarks, legal details
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_tier1_officials_full_name ON tier1_officials(full_name);
CREATE INDEX idx_tier1_officials_external_id_source ON tier1_officials(external_id, source);
```

## Testing

### Run Tier 1 Matching Test
```bash
# 1. Ensure backend is running
cd backend
pnpm start:dev  # (already running in watch mode)

# 2. Run test script
node test-tier1-matching.js
```

Expected output:
```
🚀 Testing Tier 1 Matching...

📥 Step 1: Importing OFAC sanctions list...
✅ Imported: 10, Updated: 0, Skipped: 0

📊 Step 2: Fetching all Tier 1 officials...
✅ Total Tier 1 officials: 10
Sample officials:
  - Nicolás Maduro Moros (OFAC)
    Aliases: Nicolas Maduro, Maduro Moros, Nicolas Ernesto Maduro Moros
    Programs: VENEZUELA, NARCOTICS

📈 Step 3: Tier 1 statistics...
✅ Total: 10
   By Source: {"OFAC":10}
   By Tier: {"1":10}

🔍 Step 4: Testing NER extraction with Tier 1 entities...
✅ Entities extracted: 7
✅ Nodes created: 2
Extracted entities:
  - Nicolás Maduro (PERSON)
  - Diosdado Cabello (PERSON)
  - Delcy Rodríguez (PERSON)
  ...

🔍 Step 5: Checking review queue for Tier 1 matches...
✅ Queue items: 0 pending

  Entity: "Nicolás Maduro"
  → Matched: "Nicolás Maduro Moros" (100% exact)
  → Sanctions: VENEZUELA, NARCOTICS
  → Status: auto_approved
```

## Cost Optimization

**Tier 1 matching reduces LLM costs by:**
- Auto-approving exact matches (>95%) → No LLM call needed
- Providing context for medium matches (85-95%) → More accurate LLM decisions
- Eliminating false negatives → Better recall

**Example savings:**
- Before Tier 1: 100 entities × $0.0003 = $0.03 per batch
- After Tier 1: 50 entities × $0.0003 = $0.015 per batch (50% reduction)
- **Assumes 50% of entities are auto-approved via Tier 1 match**

## Next Steps

### Week 1-2: Data Sources Integration
- [ ] Implement OFAC XML/CSV parser
- [ ] Integrate OpenSanctions.org API
- [ ] Schedule daily OFAC refresh cron job
- [ ] Add Atlantic Council scraper (optional)

### Week 2-3: Fuzzy Matching Enhancements
- [ ] Spanish nickname expansion
- [ ] Handle multi-part surnames (Maduro Moros)
- [ ] Optimize matching performance (cache, indexes)
- [ ] Add confidence scoring calibration

### Week 3-4: Production Deployment
- [ ] Database migration for tier1_officials table
- [ ] Monitoring/metrics for match accuracy
- [ ] API key management for external sources
- [ ] Documentation for human curators

## References

- **OFAC SDN List**: https://www.treasury.gov/ofac/downloads/
- **OpenSanctions**: https://www.opensanctions.org/
- **Atlantic Council Tracker**: https://www.atlanticcouncil.org/programs/adrienne-arsht-latin-america-center/venezuela-sanctions-tracker/
- **Fuzzball Library**: https://github.com/nol13/fuzzball.js
- **Fuzzywuzzy Algorithm**: https://chairnerd.seatgeek.com/fuzzywuzzy-fuzzy-string-matching-in-python/

## License

Part of La Memoria de Venezuela - Accountability Database for Venezuelan Regime Officials

