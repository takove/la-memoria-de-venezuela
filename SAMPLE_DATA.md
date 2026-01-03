# Sample Data Added to La Memoria de Venezuela

This document describes the sample data that has been added to the database for testing and demonstration purposes.

## Officials (5 total)

1. **Nicolás Maduro Moros** - Presidente de Venezuela
2. **Diosdado Cabello Rondón** - Presidente de la Asamblea Nacional
3. **Tareck El Aissami** - Ministro de Petróleo
4. **Vladimir Padrino López** - Ministro de Defensa
5. **Delcy Rodríguez Gómez** - Vicepresidenta Ejecutiva

## Sanctions (3 total)

### 1. Nicolás Maduro - OFAC SDN
- **Type**: OFAC SDN
- **Program**: Venezuela Sanctions Program
- **Code**: VENEZUELA
- **Reason**: Corruption, undermining democratic institutions
- **Imposed**: May 21, 2018
- **Source**: https://ofac.treasury.gov

### 2. Diosdado Cabello - OFAC SDN
- **Type**: OFAC SDN
- **Program**: Venezuela Sanctions Program
- **Code**: VENEZUELA
- **OFAC ID**: 18763
- **Reason**: Drug trafficking, corruption
- **Imposed**: March 14, 2019
- **Source**: https://ofac.treasury.gov/sanctions/programs/venezuela

### 3. Tareck El Aissami - OFAC SDN
- **Type**: OFAC SDN
- **Program**: Narcotics Trafficking Sanctions
- **Code**: NARCO
- **OFAC ID**: 21606
- **Reason**: International drug trafficking conspiracy
- **Imposed**: February 13, 2017
- **Source**: https://ofac.treasury.gov

## Legal Cases (2 total)

### 1. Narco-Terrorism Conspiracy
- **Case Number**: 1:20-cr-00177
- **Type**: Federal Indictment
- **Jurisdiction**: United States - SDNY
- **Court**: U.S. District Court for the Southern District of New York
- **Filed**: March 26, 2020
- **Description**: Federal indictment charging high-ranking Venezuelan officials with narco-terrorism, drug trafficking, and weapons offenses
- **Source**: https://www.justice.gov/opa/pr/nicol-s-maduro-moros-and-14-current-and-former-venezuelan-officials-charged-narco-terrorism

**Defendants:**
- Nicolás Maduro Moros - Charged with narco-terrorism conspiracy and drug trafficking
- Diosdado Cabello Rondón - Charged with narco-terrorism conspiracy

### 2. Money Laundering and Corruption
- **Case Number**: 1:19-cr-00531
- **Type**: Criminal
- **Jurisdiction**: United States - Southern District of Florida
- **Court**: U.S. District Court for the Southern District of Florida
- **Filed**: June 15, 2019
- **Description**: Investigation into corruption schemes and money laundering through shell companies

**Accused:**
- Tareck El Aissami - Accused of facilitating money laundering through front companies

## Testing the Application

All routes are now functional with sample data:

1. **Homepage** (http://localhost:5173) - Displays overview and statistics
2. **Officials** (http://localhost:5173/officials) - Shows all 5 officials
3. **Sanctions** (http://localhost:5173/sanctions) - Lists all 3 sanctions
4. **Cases** (http://localhost:5173/cases) - Displays 2 legal cases
5. **Official Detail** (e.g., /officials/[id]) - Shows biography, sanctions, and cases

## API Endpoints Used

```bash
# Create sanctions
POST http://localhost:3000/api/v1/sanctions

# Create cases
POST http://localhost:3000/api/v1/cases

# Link officials to cases
POST http://localhost:3000/api/v1/cases/{caseId}/involvements/{officialId}

# List all sanctions
GET http://localhost:3000/api/v1/sanctions

# List all cases
GET http://localhost:3000/api/v1/cases

# Get official with relations
GET http://localhost:3000/api/v1/officials/{id}
```

## Next Steps

Now that we have sample data and the core application is working:

1. **Issue #1**: Setup GitHub Copilot prompts for faster development
2. **Issue #2**: Implement unit testing (Jest + Vitest)
3. **Issue #3**: Add TIER 2 - Testaferros database (200+ individuals)
4. **Issue #4**: Build business screening API for sanctions check
5. **Issue #5**: Add TIER 4 - Cultural figures database (500+ individuals)
6. **Issue #6**: Implement network visualization with D3.js
7. **Issue #7**: Write comprehensive documentation
8. **Issue #8**: Add TIER 3 - Business enablers (500+ entities)
9. **Issue #9**: Setup CI/CD pipeline with GitHub Actions

All issues are tracked at: https://github.com/takove/la-memoria-de-venezuela/issues
