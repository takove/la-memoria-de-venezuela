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