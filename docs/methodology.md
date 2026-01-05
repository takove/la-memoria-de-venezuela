# Methodology
## La Memoria de Venezuela — Data Verification and Confidence Framework

---

## 🎯 Overview / Visión General

**La Memoria de Venezuela** uses a rigorous, multi-source verification methodology to ensure data accuracy, transparency, and reliability. This document explains our confidence scoring system, verification processes, data sources, relationship mapping, and dispute resolution procedures.

**Our Commitment**: Every entry is sourced, scored, and citable. We prioritize official documents over investigative reports over rumors, and we never include unverified information.

---

## 📊 Confidence Level System / Sistema de Niveles de Confianza

Every individual, entity, sanction, and legal case in the database is assigned a **Confidence Level** from 1 to 5:

### Confidence Level 5: Official Document
**Criterio**: Information from official government sources or legal proceedings  
**Fuentes típicas**:
- OFAC SDN List entries with unique identifiers
- US Department of Justice indictments and court filings
- IACHR official reports with case numbers
- EU/UK/Canada official sanctions lists
- ICC warrants and decisions
- Published court verdicts

**Example**: Nicolás Maduro listed on OFAC SDN with UID 12345 → Confidence 5

**Reliability**: 99%+ accurate (official source)

---

### Confidence Level 4: Verified
**Criterio**: Information corroborated by multiple independent credible sources OR corporate records + investigative journalism  
**Fuentes típicas**:
- OpenCorporates beneficial ownership records + Armando.info investigation
- ICIJ Offshore Leaks + OFAC narrative summary
- Multiple international sanctions lists (OFAC + EU + UK)
- SEC/EDGAR filings + investigative reporting
- Court documents + media coverage

**Example**: Testaferro identified in Panama Papers + mentioned in Armando.info investigation + listed as beneficial owner in OpenCorporates → Confidence 4

**Reliability**: 90-95% accurate (multi-source verification)

---

### Confidence Level 3: Credible
**Criterio**: Information from a single credible investigative source OR secondary evidence  
**Fuentes típicas**:
- Single investigative journalism report from Armando.info, InsightCrime, OCCRP
- FinCEN advisories mentioning individuals (not sanctioned)
- OFAC narrative summaries without direct sanctions
- Academic research papers with primary sources
- NGO reports citing documents

**Example**: Individual named as "associate of" sanctioned official in Armando.info → Confidence 3

**Reliability**: 70-85% accurate (single credible source)

---

### Confidence Level 2: Unverified
**Criterio**: Information from less established sources or lacking corroboration  
**Fuentes típicas**:
- Social media reports from credible individuals
- Anonymous leaks without corroboration
- Secondary news reports without primary sources
- Allegations in non-official complaints

**Example**: Twitter thread from researcher alleging connection, without documents → Confidence 2

**Reliability**: 40-60% accurate (unverified claim)

**Status in database**: Generally NOT included unless newsworthy and flagged as unverified

---

### Confidence Level 1: Rumor
**Criterio**: Unsubstantiated claims, hearsay, or unverifiable information  
**Fuentes típicas**:
- Anonymous social media posts
- Rumors without any documentation
- Unverifiable allegations

**Example**: WhatsApp message claiming connection, no evidence → Confidence 1

**Reliability**: <30% accurate (rumor)

**Status in database**: **NOT INCLUDED** — We do not store rumors

---

## 🔍 Verification Process / Proceso de Verificación

### Step 1: Source Identification
- Identify the **primary source** of the information (official document, investigation, leak)
- Retrieve the **original document or URL**
- Record the **date accessed** and **archive URL** (Wayback Machine or archive.is)

### Step 2: Cross-Reference
- Search for **corroborating evidence** from independent sources
- Check **official sanctions lists** (OFAC, EU, UK, Canada, UN)
- Query **corporate databases** (OpenCorporates, SEC/EDGAR)
- Review **investigative databases** (ICIJ, OCCRP Aleph)
- Search **media archives** (Armando.info, InsightCrime, Reuters, AP)

### Step 3: Confidence Scoring
- Assign **initial confidence level** based on best source
- **Upgrade** if multiple independent sources agree
- **Downgrade** if sources conflict or evidence is weak
- Document the **reasoning** for the score

### Step 4: Bilingual Summary
- Write a **concise summary** in Spanish and English
- Include **key facts**: full name, role, sanctions, legal cases
- Cite **specific sources** with URLs

### Step 5: Relationship Mapping
- Identify **connections** to other individuals, entities, or cases
- Classify relationship types: family, business, political, criminal network
- Assign confidence levels to **relationships** (same 1-5 scale)

### Step 6: Quality Assurance
- **Peer review** by second analyst for entries above confidence level 3
- **Spot-check** 10% of entries monthly for accuracy
- **Update** when new information becomes available

---

## 📚 Data Sources / Fuentes de Datos

### Official Government Sources (Confidence 5)

#### 1. OFAC SDN List (US Treasury)
- **URL**: https://sanctionssearch.ofac.treas.gov
- **Format**: CSV, XML, API
- **Coverage**: 131+ Venezuelan officials, businesses, testaferros
- **Update frequency**: Weekly
- **Usage**: Primary source for sanctions data
- **Fields**: Name, aliases, DOB, nationality, addresses, identifiers (passport, ID, SDN UID), sanctions programs

#### 2. US Department of Justice (DOJ)
- **URL**: https://www.justice.gov
- **Format**: PDF court documents, press releases
- **Coverage**: 6+ federal cases involving Venezuelan officials (1999-2025)
- **Update frequency**: As cases develop
- **Usage**: Legal case information, indictments, plea agreements
- **Fields**: Defendant names, charges, case numbers, court, filing dates

#### 3. Inter-American Commission on Human Rights (IACHR)
- **URL**: https://www.oas.org/en/iachr/
- **Format**: PDF reports
- **Coverage**: 2,000+ documented human rights violations
- **Update frequency**: Annual reports, special investigations
- **Usage**: Human rights violation documentation
- **Fields**: Victim names, perpetrator descriptions (often anonymized), incident dates, locations, violation types

#### 4. EU Sanctions
- **URL**: https://data.europa.eu/data/datasets/
- **Format**: CSV, Excel, SPARQL
- **Coverage**: Venezuelan regime officials and entities
- **Update frequency**: Monthly
- **Usage**: Cross-reference with OFAC
- **Fields**: Name, identifiers, sanctions basis, program

#### 5. UK/Canada Sanctions
- **UK**: https://www.gov.uk/government/publications/financial-sanctions-consolidated-list-of-targets
- **Canada**: https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/sema-rmea-eng.aspx
- **Format**: CSV, XML, Excel
- **Coverage**: Venezuelan regime targets
- **Update frequency**: Monthly
- **Usage**: Additional verification and coverage

---

### Corporate & Financial Intelligence (Confidence 4-5)

#### 6. OpenCorporates
- **URL**: https://opencorporates.com
- **Format**: API, bulk CSV
- **Coverage**: Venezuelan companies, officers, beneficial owners
- **Update frequency**: Continuous (crowd-sourced + official registries)
- **Usage**: Corporate ownership, testaferro identification
- **Fields**: Company name, officers, registered address, jurisdiction, incorporation date

#### 7. SEC/EDGAR (US Securities)
- **URL**: https://www.sec.gov/edgar/search-and-access
- **Format**: JSON API, HTML filings
- **Coverage**: Public companies with Venezuelan operations (e.g., PDVSA)
- **Update frequency**: Real-time filings
- **Usage**: Financial disclosures, business relationships
- **Fields**: Company name, CIK, filing type, dates, text search

#### 8. ICIJ Offshore Leaks (Panama Papers, Paradise Papers, etc.)
- **URL**: https://offshoreleaks.icij.org
- **Format**: Search/export, API
- **Coverage**: ~5,000 Venezuela-linked entities and individuals
- **Update frequency**: Major leak releases (periodic)
- **Usage**: Offshore shell companies, hidden ownership
- **Fields**: Entity name, jurisdiction, officers, intermediaries, source (leak name)

---

### Investigative Journalism (Confidence 3-4)

#### 9. Armando.info
- **URL**: https://armando.info
- **Format**: RSS, web scraping
- **Coverage**: Venezuela-focused investigations (CLAP, testaferros, corruption)
- **Update frequency**: Weekly articles
- **Usage**: Investigative leads, relationship identification
- **Fields**: Named individuals/entities, relationships, evidence summaries, article URL

#### 10. InsightCrime
- **URL**: https://insightcrime.org/venezuela-organized-crime-news/
- **Format**: RSS, web articles
- **Coverage**: Organized crime, drug trafficking, corruption
- **Update frequency**: Weekly
- **Usage**: Criminal networks, contextual information
- **Fields**: Actor profiles, criminal activities, connections

#### 11. OCCRP Aleph
- **URL**: https://aleph.occrp.org
- **Format**: API, search/export
- **Coverage**: Investigative document collections (Venezuela datasets)
- **Update frequency**: Ongoing investigations
- **Usage**: Document evidence, cross-border corruption
- **Fields**: Documents, entities, relationships, source collections

---

### Exclusions (Not Used)

We **DO NOT** use the following sources:
- ❌ Anonymous social media posts
- ❌ Unverified WhatsApp/Telegram messages
- ❌ Partisan political blogs without primary sources
- ❌ Rumors or hearsay
- ❌ Personal data breaches or illegally obtained information

---

## 🔗 Relationship Mapping / Mapeo de Relaciones

### Relationship Types

1. **Family**: Parent-child, spouse, sibling
2. **Business**: Partner, director, shareholder, beneficial owner
3. **Political**: Superior-subordinate, party affiliation, appointment
4. **Criminal Network**: Co-defendant, co-conspirator, collaborator
5. **Testaferro/Principal**: Straw man holding assets for official
6. **Employment**: Employer-employee, contractor-client

### Relationship Confidence

Relationships also receive a confidence score (1-5):
- **5**: Documented in official records (e.g., corporate registry, court filing)
- **4**: Corroborated by multiple sources
- **3**: Single credible source
- **2**: Alleged but unverified
- **1**: Rumor (not included)

### Evidence Requirements

Every relationship must include:
- **Source citation** (document, article, database entry)
- **Relationship type** (see above)
- **Date range** (when relationship began/ended, if known)
- **Confidence level** with justification

**Example**:
- **Relationship**: Testaferro/Principal
- **From**: Alejandro Betancourt López (TIER 2)
- **To**: Rafael Ramírez (TIER 1, former PDVSA president)
- **Source**: OFAC SDN narrative + Armando.info investigation
- **Confidence**: 4 (official + investigative source)

---

## 📝 Data Entry Standards / Estándares de Entrada de Datos

### Required Fields (All Entries)

| Field | Description | Example |
|-------|-------------|---------|
| **fullName** | Canonical name (official spelling) | Nicolás Maduro Moros |
| **aliases** | Known aliases, alternate spellings | Nicolás Maduro, Maduro Moros |
| **confidenceLevel** | 1-5 score | 5 |
| **sourceUrls** | Array of evidence URLs | ["https://sanctionssearch.ofac.treas.gov/...", "https://armando.info/..."] |
| **summaryEs** | Spanish summary (100-500 words) | "Presidente de Venezuela desde 2013..." |
| **summaryEn** | English summary (100-500 words) | "President of Venezuela since 2013..." |
| **createdAt** | Database entry creation date | 2025-01-15T10:30:00Z |
| **updatedAt** | Last update date | 2025-01-15T10:30:00Z |

### Optional Fields (Context-Dependent)

| Field | Description | When Required |
|-------|-------------|---------------|
| **dateOfBirth** | Birth date (YYYY-MM-DD or partial) | If available in official source |
| **placeOfBirth** | City, country | If available in official source |
| **nationality** | Primary citizenship | If available |
| **identifiers** | Passport, national ID, SDN UID | If available in official source |
| **positions** | Government/business roles | For TIER 1 officials |
| **linkedEntities** | Companies controlled | For testaferros, businesses |
| **sanctions** | Sanctions programs | If sanctioned |
| **caseInvolvements** | Legal cases | If indicted/convicted |

---

## ⚖️ Dispute Resolution Process / Proceso de Resolución de Disputas

We recognize the **right to correction** and provide a transparent dispute process.

### How to File a Dispute

1. **Open a GitHub Issue**: https://github.com/takove/la-memoria-de-venezuela/issues
2. **Use the template**: "Data Correction Request"
3. **Provide**:
   - Entry ID or individual/entity name
   - Specific claim being disputed
   - Evidence supporting your correction (documents, URLs)
   - Your contact information (optional, for follow-up)

### Review Process

1. **Acknowledgment** (within 3 business days)
   - We confirm receipt and assign a reviewer

2. **Investigation** (within 30 days)
   - Reviewer examines original sources
   - Checks new evidence provided
   - Consults with fact-checkers if needed
   - Documents findings

3. **Decision** (within 7 days of investigation completion)
   - **Accept correction**: Update entry, add annotation, adjust confidence level
   - **Partial correction**: Update specific fields, add note explaining discrepancy
   - **Reject**: Provide reasoning, offer to add a "disputed" annotation
   - **Pending**: Request additional evidence, extend review period

4. **Update** (within 7 days of decision)
   - Make approved changes
   - Add annotation: "Updated [date] following dispute resolution"
   - Notify requester
   - Maintain audit trail (original + updated versions)

### Transparency

- All dispute resolutions are **public** (GitHub Issues)
- Audit trail shows **what changed and why**
- Disputed entries can be **flagged** if evidence is ambiguous
- Requester can **appeal** by providing additional evidence

### Exclusions

We do **NOT** accept disputes that:
- Request removal of official government records (OFAC, DOJ, etc.)
- Seek to hide verified criminal activity
- Lack any supporting evidence
- Are frivolous or abusive

---

## 🔒 Privacy and Ethics / Privacidad y Ética

### What We Collect

- **Only public information**: Official documents, published investigations, corporate records
- **No private data**: No personal communications, hacked data, or illegally obtained information
- **No user tracking**: Minimal analytics (page views, no PII)

### What We Do NOT Collect

- ❌ Personal communications (emails, messages)
- ❌ Financial account details (beyond public disclosures)
- ❌ Private addresses or phone numbers
- ❌ Family members (unless they are themselves officials, testaferros, or enablers)
- ❌ User data (no registration required, no cookies beyond analytics)

### Ethical Guidelines

1. **Accountability, not persecution**: We document public officials, not private citizens
2. **Legal, non-violent**: Support legal justice mechanisms only
3. **Right to correction**: Transparent dispute resolution
4. **Source transparency**: Every claim is cited
5. **No vigilante justice**: We do not encourage or condone violence

---

## 🔄 Update Procedures / Procedimientos de Actualización

### Automated Updates

- **OFAC SDN List**: Weekly ingestion via CSV/XML
- **EU/UK/Canada sanctions**: Monthly updates
- **RSS feeds**: Daily polling of Armando.info, InsightCrime
- **OpenCorporates**: Quarterly bulk refresh

### Manual Updates

- **New indictments**: Added within 7 days of publication
- **New IACHR reports**: Reviewed and ingested within 30 days
- **Major investigations**: Reviewed and added within 14 days
- **User corrections**: Processed within 37 days (see Dispute Resolution)

### Version Control

- All changes logged with **timestamp and source**
- **Previous versions** retained for audit (not public-facing)
- **Changelog** maintained for major updates

---

## 📈 Quality Assurance / Control de Calidad

### Internal Audits

- **Weekly**: New entries reviewed by second analyst
- **Monthly**: Random sample of 10% of entries spot-checked
- **Quarterly**: Full confidence level distribution audit (ensure 95%+ are level 4-5)

### External Validation

- **NGO partnerships**: Partner organizations review subsets of data
- **Academic collaboration**: Researchers validate methodology
- **Media fact-checking**: Journalists verify high-profile entries

### Metrics

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Confidence 4-5 entries | 95%+ | [TBD] | 🟡 In progress |
| Disputed entries resolved | <30 days | [TBD] | 🟡 In progress |
| Broken source URLs | <2% | [TBD] | 🟡 In progress |
| Update lag (OFAC) | <7 days | [TBD] | 🟡 In progress |

---

## 🛡️ Security and Integrity / Seguridad e Integridad

### Data Protection

- **Database backups**: Daily automated backups to secure storage
- **Access control**: Role-based permissions for contributors
- **Audit logs**: All changes tracked with user ID and timestamp
- **Encryption**: HTTPS for all connections, encrypted backups

### Preventing Abuse

- **Rate limiting**: API and web requests limited to prevent scraping attacks
- **Input validation**: All user input sanitized to prevent SQL injection, XSS
- **DDoS protection**: Cloudflare or equivalent
- **Monitoring**: 24/7 uptime monitoring and alerting

### Open Source

- **Code on GitHub**: Full transparency, community contributions welcome
- **MIT License**: Free for anyone to use, fork, and improve
- **No vendor lock-in**: Data exportable in CSV/JSON

---

## 📞 Contact for Methodology Questions

For questions about our methodology, data sources, or verification process:

- **GitHub Issues**: https://github.com/takove/la-memoria-de-venezuela/issues
- **Data Corrections**: Use "Data Correction Request" template
- **Partnership Inquiries**: Use "Partnership Request" template
- **General Questions**: Use "Question" template

---

**Last Updated**: 2025-01-05  
**Version**: 1.0  
**Next Review**: 2025-04-05 (quarterly)
