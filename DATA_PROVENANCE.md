# Data Provenance System - Source Tracking & Confidence Levels

## Overview

This system implements comprehensive source tracking and editorial confidence scoring across all core entities (Officials, Businesses, Testaferros, and Sanctions) to enhance credibility and enable users to verify information.

## Features

### 1. Source Attribution (`sources` field)

Every entity can have multiple sources documenting claims. Each source includes:

- **url** (required): Original source URL
- **archiveUrl** (optional): Archived version (archive.org, archive.is) to prevent link rot
- **type** (required): Source category
  - `media`: News articles, journalism
  - `official`: Government documents, OFAC lists, official statements
  - `court`: Court records, legal filings, ICC indictments
  - `academic`: Research papers, academic publications
- **publicationDate** (optional): When the source was published
- **title** (optional): Title of the source document
- **accessedDate** (optional): When the source was last accessed

### 2. Confidence Levels (`confidenceLevel` field)

Each entity has a confidence level (1-5) indicating data quality:

| Level | Name | Description | Examples |
|-------|------|-------------|----------|
| 1 | Rumor | Unverified social media, anonymous tips | Twitter rumors, unconfirmed allegations |
| 2 | Unverified | Single-source media reports | One news article without corroboration |
| 3 | Credible | Multiple independent media sources | 2+ reputable outlets reporting same facts |
| 4 | Verified | Official statements, leaked documents | Government press releases, WikiLeaks documents |
| 5 | Official | OFAC lists, court records, ICC indictments | U.S. Treasury SDN list, DOJ indictments |

**Default**: All new records default to level 3 (Credible) unless specified otherwise.

## API Usage

### Creating an Official with Sources

```json
POST /officials
{
  "firstName": "Nicolás",
  "lastName": "Maduro",
  "confidenceLevel": 5,
  "sources": [
    {
      "url": "https://ofac.treasury.gov/specially-designated-nationals-list-data-formats-data-schemas",
      "archiveUrl": "https://archive.is/abc123",
      "type": "official",
      "publicationDate": "2024-01-15",
      "title": "OFAC SDN List - Venezuela Sanctions Program"
    },
    {
      "url": "https://www.justice.gov/opa/pr/venezuelan-president-nicolas-maduro",
      "type": "court",
      "publicationDate": "2020-03-26",
      "title": "DOJ Indictment - Narco-Terrorism Charges"
    }
  ]
}
```

### Creating a Business with Lower Confidence

```json
POST /api/v1/businesses
{
  "name": "Shell Company XYZ",
  "category": "shell_company_operator",
  "confidenceLevel": 2,
  "sources": [
    {
      "url": "https://news-outlet.com/corruption-report",
      "type": "media",
      "publicationDate": "2023-06-10",
      "title": "Report Links Business to Official"
    }
  ]
}
```

### Filtering by Confidence Level

```bash
# Get only high-confidence businesses
GET /api/v1/businesses?minConfidence=4

# Get only high-confidence testaferros
GET /api/v1/testaferros?minConfidence=4
```

## Database Schema

### Entity Changes

All core entities now include:

```typescript
sources?: Array<{
  url: string;
  archiveUrl?: string;
  type: 'media' | 'official' | 'court' | 'academic';
  publicationDate?: Date;
  title?: string;
  accessedDate?: Date;
}>;

confidenceLevel: number; // 1-5, default 3
```

### Migration

The migration `1736086800000-AddSourcesAndConfidence.ts` adds:

1. `sources` JSONB column to `officials`, `sanctions`, `businesses`, `testaferros`
2. `confidence_level` integer column with default 3
3. Indexes on `confidence_level` for query performance
4. Data migration for Business entity (renames `evidence_sources` to `sources`)

## DTOs & Validation

### SourceDto

```typescript
export class SourceDto {
  @IsUrl()
  url: string;

  @IsOptional()
  @IsUrl()
  archiveUrl?: string;

  @IsEnum(SourceType)
  type: SourceType; // 'media' | 'official' | 'court' | 'academic'

  @IsOptional()
  @IsDateString()
  publicationDate?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsDateString()
  accessedDate?: string;
}
```

### Confidence Level Validation

All DTOs include:

```typescript
@IsOptional()
@IsInt()
@Min(1)
@Max(5)
confidenceLevel?: number;
```

## Best Practices

### When to Use Each Confidence Level

**Level 5 (Official)**: Reserve for:
- OFAC SDN List entries
- DOJ indictments and court records
- ICC arrest warrants
- Official government sanctions lists

**Level 4 (Verified)**: Use for:
- Leaked documents (WikiLeaks, Panama Papers)
- Government press releases
- Congressional testimony
- Official company registries

**Level 3 (Credible)**: Use for:
- Multiple reputable media sources
- Investigative journalism with multiple sources
- Academic research
- NGO reports (IACHR, UN)

**Level 2 (Unverified)**: Use for:
- Single media source
- Investigative reports awaiting corroboration
- Insider tips from credible sources

**Level 1 (Rumor)**: Use for:
- Social media allegations
- Unconfirmed tips
- Speculative connections

### Archive URLs

Always include `archiveUrl` for:
- Media articles (subject to deletion)
- Government press releases (may be removed)
- Any source that might disappear

Use services like:
- https://archive.org/web/ (Wayback Machine)
- https://archive.is/ (archive.today)

### Source Type Selection

- **official**: Government documents, OFAC, EU sanctions, official lists
- **court**: Legal filings, indictments, judgments, ICC warrants
- **media**: News articles, investigative journalism
- **academic**: Research papers, university studies, think tank reports

## Testing

The system includes comprehensive unit tests covering:
- Creating entities with sources
- Default confidence levels (3)
- Custom confidence levels
- Source validation
- Filtering by confidence level

Coverage: **80.96%** (exceeds 80% requirement)

## API Response Examples

### Official with Sources

```json
{
  "id": "uuid-123",
  "firstName": "Nicolás",
  "lastName": "Maduro",
  "fullName": "Nicolás Maduro Moros",
  "confidenceLevel": 5,
  "sources": [
    {
      "url": "https://ofac.treasury.gov/sdn",
      "archiveUrl": "https://archive.is/abc123",
      "type": "official",
      "publicationDate": "2024-01-15",
      "title": "OFAC SDN List"
    }
  ],
  "status": "active",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z"
}
```

## Future Enhancements

Potential additions:
- Source reliability scoring
- Automated archive URL generation
- Source freshness tracking
- Citation formatting (APA, Chicago, etc.)
- Source deduplication
- Broken link monitoring

## References

- [ICIJ Pandora Papers Methodology](https://www.icij.org/investigations/pandora-papers/about-pandora-papers-investigation/)
- [Bellingcat Source Standards](https://www.bellingcat.com/resources/)
- [TypeORM JSONB Documentation](https://typeorm.io/entities#column-types-for-postgres)
