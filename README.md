# 🇻🇪 La Memoria de Venezuela

> **Public database exposing Venezuelan government officials under international sanctions and legal proceedings**

A transparency and accountability platform that documents information from official government sources including OFAC sanctions, US federal indictments, and IACHR reports covering the period from 1999 to 2026.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub Issues](https://img.shields.io/github/issues/takove/la-memoria-de-venezuela)](https://github.com/takove/la-memoria-de-venezuela/issues)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/takove/la-memoria-de-venezuela/pulls)

---

## 🎯 Mission

To create a comprehensive, public database that:
- Documents Venezuelan government officials involved in corruption, human rights violations, and drug trafficking
- Provides transparency through verified official sources
- Enables due diligence and compliance screening for businesses
- Supports journalists, researchers, and civil society
- Ensures accountability without violence

## ⚖️ Legal & Ethical Foundation

This platform:
- ✅ Uses **only public information** from official government sources
- ✅ Cites all sources (OFAC, DOJ, IACHR, court documents)
- ✅ Promotes **legal, non-violent** accountability mechanisms
- ✅ Supports international anti-corruption standards (UNCAC)
- ✅ Enables legitimate business compliance and due diligence

## 📊 Data Sources

| Source | Records | Coverage |
|--------|---------|----------|
| **OFAC Sanctions** | 131+ individuals | 2015-2026 |
| **US Federal Indictment** | 6+ defendants | 1999-2025 |
| **IACHR Report** | 2,000+ detained | Election violence, torture |
| **DEA/Treasury** | 50+ officials | Drug trafficking |

## 🏗️ Tech Stack

### Backend
- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL (Supabase)
- **ORM**: TypeORM
- **Search**: Full-text search in Spanish

### Frontend
- **Framework**: SvelteKit
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

### Infrastructure
- **Backend Hosting**: Fly.io
- **Database**: Supabase
- **Estimated Cost**: $25-50/month (or free tier)

## 📁 Project Structure

```
expose-enchufados/
├── backend/                 # NestJS API
│   ├── src/
│   │   ├── modules/
│   │   │   ├── officials/   # Officials CRUD
│   │   │   ├── sanctions/   # Sanctions data
│   │   │   ├── cases/       # Legal cases
│   │   │   └── search/      # Full-text search
│   │   ├── entities/        # TypeORM entities
│   │   └── common/          # Shared utilities
│   └── package.json
│
├── frontend/                # SvelteKit app
│   ├── src/
│   │   ├── routes/          # Pages
│   │   ├── lib/             # Components & utilities
│   │   └── app.css          # Global styles
│   └── package.json
│
├── database/                # SQL migrations & seeds
│   ├── migrations/
│   └── seeds/
│
└── docs/                    # Documentation
    ├── SPEC.md              # Full specification
    └── DATA_SOURCES.md      # Source documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL or Supabase account

### 1. Clone and Install

```bash
git clone https://github.com/takove/la-memoria-de-venezuela.git
cd la-memoria-de-venezuela

# Install backend dependencies
cd backend && pnpm install

# Install frontend dependencies
cd ../frontend && pnpm install
```

### 2. Environment Setup

```bash
# Backend (.env)
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Frontend (.env)
cp frontend/.env.example frontend/.env
# Edit frontend/.env with API URL
```

**Important**: Use Supabase Session Pooler URL for database connection:
```
DATABASE_URL=postgresql://postgres.PROJECT_REF:PASSWORD@aws-1-us-east-1.pooler.supabase.com:5432/postgres
```

### 3. Database Setup

```bash
# TypeORM will auto-sync schema in development
cd backend && pnpm start:dev
```

### 4. Start Development

```bash
# Terminal 1: Backend (port 3000)
cd backend && pnpm start:dev

# Terminal 2: Frontend (port 5173)
cd frontend && pnpm dev
```

Visit `http://localhost:5173` to see the app.

## 💻 Development

### Coding Standards

See [`.github/copilot-instructions.md`](.github/copilot-instructions.md) for comprehensive coding guidelines including:
- TypeScript best practices
- NestJS patterns
- SvelteKit component structure
- Database schema conventions
- API design principles
- Testing requirements

### Contributing

Please read [`CONTRIBUTING.md`](.github/CONTRIBUTING.md) before submitting pull requests.

### Running Tests

```bash
# Backend tests (Jest)
cd backend && pnpm test

# Frontend tests (Vitest) - Coming soon
cd frontend && pnpm test
```

## 📋 Roadmap

### ✅ Phase 1: Foundation (Completed)
- [x] Project setup (NestJS + SvelteKit)
- [x] Database schema (PostgreSQL + TypeORM)
- [x] Basic API endpoints (Officials, Sanctions, Cases)
- [x] Search functionality (Full-text search)
- [x] 5 sample officials with data
- [x] 3 OFAC sanctions
- [x] 2 federal cases with involvements

### 🚧 Phase 2: Enhanced Features (In Progress)
- [x] GitHub Copilot instructions
- [x] Social sharing with OG meta tags
  - [x] Share buttons (Twitter/X, Facebook, WhatsApp, LinkedIn, Copy, Native)
  - [x] Dynamic Open Graph meta tags per profile
  - [x] Auto-generated OG images (1200x630)
  - [x] Unit tests for components and endpoints
- [ ] Unit testing (Jest + Vitest)
- [ ] TIER 2: Testaferros database (200+ individuals)
- [ ] Business screening API for sanctions check
- [ ] Network visualization with D3.js

### 📅 Phase 3: Data Expansion (Planned)
- [ ] TIER 3: Business enablers (500+ entities)
- [ ] TIER 4: Cultural figures (500+ propagandists)
- [ ] TIER 5: International enablers
- [ ] Confidence level system (1-5 scale)
- [ ] Dispute resolution process

### 🚀 Phase 4: Production (Planned)
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Comprehensive documentation
- [ ] Security audit
- [ ] Performance optimization
- [ ] Public launch

**Current Status**: Core application functional with sample data. See [GitHub Issues](https://github.com/takove/la-memoria-de-venezuela/issues) for detailed tasks.

## ⚖️ Legal Disclaimer

This project aggregates **publicly available information** from:
- U.S. Treasury Department (OFAC)
- U.S. Department of Justice
- Inter-American Commission on Human Rights (IACHR)
- Other official government sources

All data is sourced from official public records and reports.

## 🔒 Security Considerations

- No user data collection beyond essential analytics
- All data is from public sources
- Hosted on reputable cloud providers
- Regular security updates

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

---

**Built with ❤️ for Venezuela's future**
