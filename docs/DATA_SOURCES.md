# Data Sources Documentation

## Overview

This document catalogs all data sources used in La Memoria de Venezuela, including access methods, update frequencies, and data structure information.

## Primary Sources

### 1. OFAC - Office of Foreign Assets Control

**Authority**: U.S. Department of the Treasury

**URL**: https://ofac.treasury.gov/sanctions-programs-and-country-information/venezuela-related-sanctions

**Data Available**:
- Specially Designated Nationals (SDN) list
- Blocked persons
- Sanction programs (VENEZUELA-EO13692, SDNTK, etc.)

**Access Method**:
- SDN List download (XML, CSV): https://sanctionssearch.ofac.treas.gov/
- API (unofficial): Various third-party APIs available

**Update Frequency**: Weekly or as needed

**Key Fields**:
- Full name, aliases
- Date of birth
- Nationality
- Passport/ID numbers
- Designation date
- Program code
- Reason for designation

### 2. DOJ - Department of Justice

**Authority**: U.S. Department of Justice

**URL**: https://www.justice.gov/

**Data Available**:
- Federal indictments
- Press releases on Venezuelan officials
- Case documents (PACER)

**Key Cases**:
- **United States v. Nicolás Maduro Moros** (1:20-cr-00116)
  - Filed: March 26, 2020
  - Court: SDNY
  - Charges: Narco-terrorism, cocaine trafficking
  - Defendants: 15 officials

**Access Method**:
- Press releases (free)
- PACER for court documents ($0.10/page)

### 3. IACHR - Inter-American Commission on Human Rights

**Authority**: Organization of American States (OAS)

**URL**: https://www.oas.org/en/iachr/

**Key Reports**:
- "Serious Human Rights Violations in the Context of the 2024 Elections in Venezuela"
- Annual reports on Venezuela
- Precautionary measures

**Data Available**:
- Detained persons
- Torture allegations
- Political prisoners
- Human rights violations timeline

**Access Method**: PDF reports (free download)

### 4. DEA - Drug Enforcement Administration

**Authority**: U.S. Department of Justice

**URL**: https://www.dea.gov/

**Data Available**:
- Press releases on Venezuelan drug trafficking
- Indictment announcements
- Reward information

**Key Announcements**:
- March 26, 2020: Maduro indictment announcement
- Narcotics Rewards Program entries

### 5. European Union Sanctions

**Authority**: Council of the European Union

**URL**: https://www.sanctionsmap.eu/

**Data Available**:
- EU sanctions list for Venezuela
- Asset freezes
- Travel bans

**Access Method**: EU Sanctions Map (free)

### 6. UK Sanctions

**Authority**: HM Treasury (OFSI)

**URL**: https://www.gov.uk/government/publications/financial-sanctions-venezuela

**Data Available**:
- UK sanctions list
- Designated persons

### 7. Canada Sanctions

**Authority**: Global Affairs Canada

**URL**: https://www.international.gc.ca/world-monde/international_relations-relations_internationales/sanctions/venezuela.aspx

**Data Available**:
- Special Economic Measures (Venezuela)
- Designated persons

---

## RSS/Atom Feed Sources

### Automated News Ingestion

The platform monitors RSS and Atom feeds from reputable news sources and government agencies for Venezuela-related content. Articles are automatically queued for processing through the NER (Named Entity Recognition) pipeline.

#### Spanish-Language News Sources

1. **CNN Español**
   - **URL**: https://cnnespanol.cnn.com/feed/
   - **Format**: RSS 2.0
   - **Language**: Spanish
   - **Coverage**: International news, Latin America, Venezuela
   - **Last Verified**: 2026-01-08

2. **DW Español Internacional**
   - **URL**: http://rss.dw.com/rdf/rss-sp-inter
   - **Format**: RSS 2.0
   - **Language**: Spanish
   - **Coverage**: International news including Venezuela
   - **Last Verified**: 2026-01-08

3. **VOA Español (Voice of America)**
   - **URL**: https://www.vozdeamerica.com/api/zgjqoepvqo
   - **Format**: RSS 2.0
   - **Language**: Spanish
   - **Coverage**: US news, Latin America, Venezuela
   - **Last Verified**: 2026-01-08

4. **El Nacional Venezuela**
   - **URL**: http://www.el-nacional.com/feed/
   - **Format**: RSS 2.0
   - **Language**: Spanish
   - **Coverage**: Venezuelan domestic news
   - **Last Verified**: 2026-01-08

5. **BBC Mundo**
   - **URL**: https://feeds.bbci.co.uk/mundo/rss.xml
   - **Format**: RSS 2.0
   - **Language**: Spanish
   - **Coverage**: International news, Latin America
   - **Last Verified**: 2026-01-08

#### English-Language News Sources

6. **Caracas Chronicles**
   - **URL**: https://www.caracaschronicles.com/feed/
   - **Format**: RSS 2.0
   - **Language**: English
   - **Coverage**: Venezuelan politics, analysis, human rights
   - **Last Verified**: 2026-01-08

7. **Bloomberg Markets**
   - **URL**: http://feeds.bloomberg.com/markets/news.rss
   - **Format**: RSS 2.0
   - **Language**: English
   - **Coverage**: Financial news, sanctions impact
   - **Last Verified**: 2026-01-08

8. **CNBC International**
   - **URL**: https://www.cnbc.com/id/100003114/device/rss/rss.html
   - **Format**: RSS 2.0
   - **Language**: English
   - **Coverage**: Business, economics, international trade
   - **Last Verified**: 2026-01-08

#### Official Government Sources

9. **US State Department - Venezuela**
   - **URL**: https://www.state.gov/rss-feed/venezuela/feed/
   - **Format**: RSS 2.0
   - **Language**: English
   - **Coverage**: US diplomatic statements, sanctions announcements
   - **Last Verified**: 2026-01-08

10. **UK Foreign, Commonwealth & Development Office**
    - **URL**: https://www.gov.uk/government/organisations/foreign-commonwealth-development-office.atom
    - **Format**: Atom 1.0
    - **Language**: English
    - **Coverage**: UK foreign policy, sanctions, diplomatic updates
    - **Last Verified**: 2026-01-08

#### Feed Monitoring Process

1. **Polling Frequency**: Every 10 minutes (via automated cron job)
2. **Manual Trigger**: Available via `POST /api/v1/ingestion/webhook/poll`
3. **Article Limit**: Last 10 items per feed per poll cycle
4. **Deduplication**: Articles are checked against existing URLs before ingestion
5. **Error Handling**: Malformed XML feeds are logged and skipped; service continues with remaining feeds
6. **Queue System**: New articles are queued via BullMQ for asynchronous processing

#### Notes on Official Sources

- **OFAC RSS Feed**: As of January 31, 2025, the US Treasury retired the official OFAC RSS feed. Sanctions updates are now available via email subscription at [GovDelivery](https://service.govdelivery.com/service/subscribe.html?code=USTREAS_61) or through the [OFAC Recent Actions](https://ofac.treasury.gov/recent-actions) page.
- **EU Council Sanctions**: The EU Sanctions Map (https://www.sanctionsmap.eu/) provides structured data but does not offer an official RSS feed. Updates are monitored manually or via third-party aggregators.

---

## Data Update Procedures

### OFAC SDN List
1. Download latest SDN list from Treasury website
2. Parse XML/CSV format
3. Filter for Venezuela-related programs
4. Cross-reference with existing records
5. Update database with new/modified entries

### DOJ Indictments
1. Monitor DOJ press releases
2. Search PACER for new Venezuela-related cases
3. Extract defendant information
4. Update cases and involvements tables

### IACHR Reports
1. Monitor OAS/IACHR publications
2. Extract relevant individual and case data
3. Add new cases to database
4. Link to existing officials where applicable

---

## Data Quality Standards

1. **Verification**: All entries must have source URLs
2. **Dual Language**: Spanish and English where available
3. **Attribution**: Clear source attribution for all data
4. **Timestamps**: Track created_at and updated_at for all records
5. **Changelog**: Maintain update history in metadata

---

## API Rate Limits & Access

| Source | Rate Limit | Authentication |
|--------|------------|----------------|
| OFAC | None (file download) | None |
| PACER | None | Account required |
| IACHR | None | None |
| EU Sanctions | None | None |

---

## Legal Considerations

- All data is from public governmental sources
- No personal data beyond official records
- Data used for transparency and accountability
- Regular review for accuracy and updates
