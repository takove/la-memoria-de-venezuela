## Data Sourcing Playbook

Curated, citable sources for tiers 2-5 with access modes and what they populate.

### Official / Government
- OFAC SDN list — https://sanctionssearch.ofac.treas.gov (CSV/XML, SLS API). Confirmed Venezuela programs. T2 testaferros, T3 shells, T5 enablers.
- OFAC recent actions — https://ofac.treasury.gov/recent-actions (RSS/HTML; filter EO13850/EO14059). New Venezuela designations/links.
- EU sanctions (Venezuela) — https://data.europa.eu/data/datasets/consolidated-list-of-persons-groups-and-entities-subject-to-eu-financial-sanctions?locale=en (CSV/Excel/SPARQL). Venezuela-tagged entries. T2/T5.
- UK sanctions list — https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets (CSV/XML/API). Venezuela regime/person tags. T2/T3/T5.
- Canada SEMA — https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/sema-rmea-eng.aspx (Excel/HTML). Venezuela-tagged entries. T2/T5.
- UN consolidated lists — https://www.un.org/securitycouncil/content/lists-entities-subject-sanctions (Excel/XML). T2 (narcotics/terror links touching Venezuela).
- FinCEN advisories — https://www.fincen.gov/resources/advisories (PDF/RSS). Venezuela-related advisories (e.g., PDVSA corruption). T2/T5 banks/laundering patterns.
- World Bank debarments — https://www.worldbank.org/en/projects-operations/procurement/debarment-list (CSV/API). Filter for Venezuela-linked contractors. T3.
- IDB sanctions — https://www.iadb.org/en/who-we-are/oversight-office/sanctions-list (Excel). Venezuela-related debarments. T3.

### Procurement / Beneficial Ownership
- OpenCorporates — https://opencorporates.com (API, bulk CSV). Query jurisdiction=VE or keyword “Venezuela”; officers/ownership for T2/T3/T5.
- SEC/EDGAR — https://www.sec.gov/edgar/search-and-access (API/JSON). CIK search (e.g., PDVSA 0001141025), keyword “Venezuela” in 10-K/20-F. T3/T5.
- Venezuela Compra (historic) — https://www.venezuelacompra.com.ve (scrape/CSV exports). CLAP/contractor data for T3.

### Investigative / Leaks
- ICIJ Offshore Leaks — https://offshoreleaks.icij.org (search/export/API). ~5k Venezuela-linked entities; offshore shells/officers (T2/T3/T5).
- OCCRP Aleph — https://aleph.occrp.org/api (search/entities). Venezuela datasets (CLAP/testaferros networks) via API. T2/T3/T5.
- Armando.info — https://armando.info (RSS/scrape). Extensive Venezuela investigations (CLAP, testaferros, contractors). T2/T3.
- InsightCrime — https://insightcrime.org/venezuela-organized-crime-news/ (RSS/scrape). Venezuela actor profiles. T2/T3.

### Cultural Propagandists (T4)
- State media payroll leaks — Wikileaks search https://wikileaks.org (search/download). No confirmed VTV/TeleSur payroll yet; monitor.
- Propaganda network reports — Bellingcat/Graphika (scrape PDFs/RSS). Limited Venezuela coverage; check reports for network diagrams.

### International Enablers (T5)
- Combine sanctions (OFAC/EU/UK/Canada) + OpenCorporates + EDGAR for foreign banks/agents and shells.
- OFAC Venezuela program advisories for evasion networks; World Bank/IDB debarments for foreign contractors.

### Access notes
- Prefer official CSV/XML/API; use RSS where offered (OFAC recent actions, FinCEN, media). Scrape only when no structured feed exists.
- Maintain separate staging/prod pulls; log source URL and timestamp for every imported record.

### Tier 2 (Testaferros) — source-to-field mapping
| Field (campo) | Purpose (propósito) | Primary source | Secondary / validation | Confidence guidance |
| --- | --- | --- | --- | --- |
| fullName | Canonical person name | OFAC SDN CSV/XML; EU/UK/Canada lists | OCCRP Aleph, Armando.info profiles | Use 5 when name matches official list with ID; 3-4 when media/ICIJ corroborate |
| aliases / aka | Alternate spellings and corporate signatures | OFAC SDN "aka" entries | ICIJ Offshore Leaks officer names; OpenCorporates officers | Promote to canonical if repeated across ≥2 sources |
| dateOfBirth, placeOfBirth | Identity disambiguation | OFAC/EU/UK/Canada structured fields | Passport leaks (when citable), court records | 5 when present on official list; 3 when media only |
| nationality, citizenship | Jurisdiction flagging | OFAC/EU/UK/Canada lists | Aleph corporate filings; EDGAR 20-F/6-K text matches | 4-5 when in gov list; 3 when inferred via filings |
| linkedOfficialId | Relationship to Tier 1 official | Manual mapping from OFAC narrative (e.g., "frontman for"), Armando.info investigations | Court indictments (DOJ), FinCEN advisories | 5 when explicit in gov doc; 4 when repeated in major investigations |
| linkedEntities (company ids) | Companies they control/use | OpenCorporates officers/beneficial owners; ICIJ Offshore Leaks entities | SEC/EDGAR filings; Aleph datasets; Armando.info company stories | 5 when official beneficial-owner field; 4 when repeated in leaks + media |
| sanctionsPrograms | EO/program references | OFAC program tags (e.g., VENEZUELA, VENEZUELA-EO13850) | EU/UK/Canada program tags | 5 when from source list |
| identifiers | Passport/national IDs, SDN IDs, EU IDs | OFAC UID, EU/UK list IDs | Court filings when available | Only store when present in official docs |
| roleDescription | How they act as front | OFAC narrative summaries | Armando.info, InsightCrime | Keep bilingual short text; 3-5 based on source |
| sourceUrls | Evidence links | Direct URLs to official list entries | PDF advisories, investigative stories | Always include at least one official link when available |
| confidenceLevel | 1-5 scoring | Derived from best source per record | Cross-source agreement | 5 official; 4 repeated investigative; 3 single investigative; ≤2 rumors excluded |

### Tier 2 ingestion checklist (EN/ES)
1. Fetch official lists (OFAC SDN CSV/XML, EU CSV, UK CSV, Canada Excel) → staging tables with source timestamps.
2. Normalize names (upper, strip accents), explode aliases, and attach identifiers (SDN IDs, EU IDs) for deterministic joins.
3. Pull corporate links: OpenCorporates officers/beneficial owners for Venezuela-related companies; ICIJ Offshore Leaks exports filtered by country=Venezuela or nationality contains "Venezuela".
4. Enrich with investigations: scrape/RSS Armando.info and InsightCrime; capture article URL, title, publication date, and extracted named entities.
5. Link to Tier 1 officials: parse OFAC narratives and Armando.info text for "testaferro de" / "frontman for" patterns; create `linkedOfficialId` via controlled mapping table.
6. Score confidence: 5 when official list contains person; 4 when investigations align with corporate records; 3 when only one investigative source.
7. QA pass: manual spot-check top 50 by sanctions recency and high-degree corporate networks; verify transliteration and dedupe collisions (DOB + nationality + alias match).
8. Write to production tables with source URLs and `ingestedAt`; keep staging snapshots for audit.
9. Schedule refresh: weekly for OFAC/EU/UK/Canada; monthly for ICIJ/Aleph; RSS poll daily for Armando.info/InsightCrime headlines.

### Tier 2 (Testaferros) — non-official discovery workflow
- Seed from Tier 1: scan OFAC/DOJ narratives for "frontman for" / "testaferro de" phrases and create candidate links to Tier 1 officials.
- Harvest investigations: ingest Armando.info and InsightCrime RSS, then extract people/companies/relationships (NER) with article URL, outlet, and publication date stored.
- Corporate triangulation: pull OpenCorporates officers/beneficial owners and ICIJ/Aleph entities; graph by shared officers, addresses, and emails to spot high-degree intermediaries around PDVSA/CLAP contractors.
- Confidence rubric (non-official cases): 5 = also on an official list; 4 = ≥2 independent investigative sources plus a corporate record tying the person to assets/companies; 3 = single investigative source plus corporate evidence; ≤2 = rumor/unlinked — exclude.
- Evidence logging: keep source URLs, retrievedAt, and extracted snippets; mark each link as investigative vs official for dispute handling.
- Review loop: weekly analyst pass on new investigative hits before promoting to prod; keep staging graph snapshots for audit.

### Tier 2 investigative ingestion spec (articles → graph → scores)
**Scope**: Armando.info + InsightCrime RSS (later add FinCEN/OFAC advisories where narratives exist).

**Pipeline**
- Fetch & archive: poll RSS daily; store article URL, title, outlet, language, publishedAt, retrievedAt, raw HTML/clean text.
- NER + entity typing: extract PERSON, ORG, LOCATION; keep offsets, language, model version; normalize names (upper, accent-strip) for matching.
- Entity linking:
	- Person matching: deterministic on exact match to Tier 1 canonical or alias; fuzzy (Jaro-Winkler ≥0.92) gated by same nationality or shared alias; log match score.
	- Org matching: OpenCorporates/ICIJ/Aleph IDs by name+jurisdiction; keep unmatched orgs as new nodes.
	- Relationship extraction: regex/patterns for "testaferro de", "frontman for", "empresario cercano a", "socios de"; store relation type + sentence snippet.
- Graph write (staging): nodes = person, org, article; edges = mentioned_in, co_mentioned_with (article window), relation_pattern (typed), ownership (from corp data), officer_of/beneficial_owner (OpenCorporates), leaked_officer_of (ICIJ/Aleph).

**Scoring (candidate testaferro linked to Tier 1)**
- Base features: (a) co-mention count with Tier 1 in investigative outlets; (b) presence of relation_pattern edge; (c) corporate tie edge to Tier 1-linked org; (d) number of independent outlets; (e) recency decay (e^{-Δt/180d}).
- Example composite: score = 40·I(pattern) + 25·I(corp_tie) + 15·min(outlets,2) + 10·log1p(co_mentions) + 10·recency.
- Thresholds: score ≥70 → confidence 4; 50-69 → confidence 3; <50 hold for review. If also on official list, force confidence 5.
- Dedup: collapse persons by deterministic IDs (official list IDs) else by (normalizedName + DOB + nationality) if available.

**Outputs**
- Candidate record with: normalized person name, matched Tier 1 id (if any), linked org ids, pattern evidence (snippet, sentence), outlets, publishedAt, recency-weighted score, proposed confidence level, sourceUrls.
- Audit: store model version, pattern hit, and all contributing edge ids to justify score.

### Implementation plan (lightweight)
- Queueing: use a daily cron to fetch RSS into a lightweight job queue (e.g., BullMQ) that writes raw HTML/text into `stg_articles` (article_id, outlet, title, url, published_at, retrieved_at, lang, raw_html, clean_text, hash).
- NER/linking worker: batch over new `stg_articles`, run NER, store entities in `stg_entities` (entity_id, article_id, type, raw_text, norm_text, offsets, model_version, lang); store relation patterns in `stg_relations` (relation_id, article_id, pattern, sentence, subject_entity_id, object_entity_id, confidence, model_version).
- Matching rules: deterministic join to Tier 1 by canonical or alias match (norm_text). Fuzzy: Jaro-Winkler ≥0.92 AND same nationality (if known) OR overlapping alias; log match score. Orgs: attempt OpenCorporates/ICIJ/Aleph lookup by name+jurs; keep unresolved as pending.
- Graph staging tables: `stg_nodes` (node_id, type=person|org|article, source_ids, names), `stg_edges` (edge_id, src, dst, type=mentioned_in|co_mentioned|relation_pattern|officer_of|beneficial_owner|leaked_officer_of|corp_tie, weight, evidence_ref).
- Scoring job: for each person node linked to Tier 1, compute features and composite score as in spec; write to `stg_scores` (person_node_id, tier1_id, score, confidence, components, computed_at).
- Promotion: nightly task to select candidates with confidence ≥3; materialize into `candidate_testaferros` with source URLs, snippets, contributing edges, and `ingested_at`. Keep staging for 30–60 days for audit.
- Monitoring: log per-stage counts and errors; alert if feed is empty >48h or NER failure rate >5%.

### Proposed table schemas (TypeORM-friendly)
- stg_articles
	- id UUID PK; outlet (varchar 80); title (text); url (varchar 512, unique); lang (char(2)); published_at (timestamptz, nullable); retrieved_at (timestamptz); raw_html (text); clean_text (text); content_hash (char(64), unique); created_at/updated_at.
- stg_entities
	- id UUID PK; article_id FK→stg_articles; type enum(PERSON, ORG, LOCATION); raw_text (text); norm_text (varchar 320); offsets (jsonb); lang (char(2)); model_version (varchar 40); created_at.
- stg_relations
	- id UUID PK; article_id FK; pattern (varchar 64); sentence (text); subject_entity_id FK→stg_entities; object_entity_id FK→stg_entities; confidence (numeric(5,3)); model_version (varchar 40); created_at.
- stg_nodes
	- id UUID PK; type enum(person, org, article); canonical_name (varchar 320); alt_names (jsonb array); source_ids (jsonb: ofac_sdn_id, oc_company_number, icij_node_id, aleph_id, article_id); tier1_id (UUID, nullable); created_at.
- stg_edges
	- id UUID PK; src_node_id FK→stg_nodes; dst_node_id FK→stg_nodes; type enum(mentioned_in, co_mentioned, relation_pattern, officer_of, beneficial_owner, leaked_officer_of, corp_tie); weight (numeric); evidence_ref (jsonb: relation_id, sentence, article_id); created_at.
- stg_scores
	- id UUID PK; person_node_id FK→stg_nodes; tier1_id FK→officials (nullable); score (numeric); confidence_level (int); components (jsonb: pattern, corp_tie, outlets, co_mentions, recency); computed_at.
- candidate_testaferros
	- id UUID PK; person_node_id FK→stg_nodes; tier1_id FK→officials; normalized_name (varchar 320); linked_org_ids (jsonb array); outlets (jsonb array of {name,url,published_at}); pattern_snippet (text); source_urls (jsonb array); published_at (timestamptz, nullable); recency_score (numeric); composite_score (numeric); confidence_level (int); evidence_edges (jsonb array of edge ids); ingested_at (timestamptz); created_at/updated_at.

Indexes/constraints
- stg_articles.url unique, content_hash unique; index on published_at for recency pulls.
- stg_entities (article_id, type, norm_text) index for matching; stg_relations article_id index.
- stg_nodes (type, canonical_name) btree; gin on alt_names for alias search.
- stg_edges (type, src_node_id, dst_node_id); partial index on type=relation_pattern to speed scoring.
- stg_scores (tier1_id, score desc); candidate_testaferros tier1_id index.

DTO hints (NestJS)
- IngestArticleDto: outlet, title, url, lang, publishedAt?, rawHtml?, cleanText?, retrievedAt.
- NEREntityDto: articleId, type, rawText, normText, offsets, lang, modelVersion.
- RelationDto: articleId, pattern, sentence, subjectEntityId, objectEntityId, confidence, modelVersion.
- CandidatePromotionDto: personNodeId, tier1Id, normalizedName, linkedOrgIds, outlets, patternSnippet, sourceUrls, publishedAt?, recencyScore, compositeScore, confidenceLevel, evidenceEdges.

### Module split (NestJS)
- FetcherModule: RSS polling + dedupe → writes `stg_articles` via ArticlesService; owns queue producer.
- NerModule: worker consuming fetcher queue; runs NER/linking; writes `stg_entities` and `stg_relations` via EntitiesService; emits match tasks.
- MatchModule: applies deterministic/fuzzy rules; upserts `stg_nodes` and `stg_edges` (mentioned_in, relation_pattern); resolves org lookups (OpenCorporates/ICIJ/Aleph client providers).
- GraphModule: materializes co_mentioned edges and merges corp data edges (officer_of, beneficial_owner, leaked_officer_of, corp_tie) into `stg_edges`.
- ScoringModule: computes features and composite score → `stg_scores`; uses Tier1 repository to resolve `tier1_id`.
- PromotionModule: selects confidence ≥3, writes `candidate_testaferros`, attaches evidence_edges/source URLs; handles retention/purge of staging tables.
- MonitoringModule: metrics and alerts (queue lag, NER failure rate, empty feed >48h); optional web dashboard.
- Shared infrastructure: BullMQ queue provider, HttpModule clients (RSS fetch, OC/ICIJ/Aleph), config module for intervals and thresholds.