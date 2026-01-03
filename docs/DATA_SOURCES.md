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
