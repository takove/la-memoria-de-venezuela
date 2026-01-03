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
- Node.js 20+
- pnpm (recommended) or npm
- PostgreSQL or Supabase account

### 1. Clone and Install

```bash
cd expose-enchufados

# Install backend dependencies
cd backend && pnpm install

# Install frontend dependencies
cd ../frontend && pnpm install
```

### 2. Environment Setup

```bash
# Backend (.env)
cp backend/.env.example backend/.env

# Frontend (.env)
cp frontend/.env.example frontend/.env
```

### 3. Database Setup

```bash
# Run migrations
cd backend && pnpm migration:run
```

### 4. Start Development

```bash
# Terminal 1: Backend
cd backend && pnpm start:dev

# Terminal 2: Frontend
cd frontend && pnpm dev
```

## 📋 Roadmap

### Phase 1: Foundation (Month 1)
- [x] Project setup
- [ ] Database schema
- [ ] Basic API endpoints
- [ ] Search functionality

### Phase 2: Data Ingestion (Month 2)
- [ ] OFAC sanctions import
- [ ] Indictment data parsing
- [ ] IACHR report integration

### Phase 3: Frontend (Month 2-3)
- [ ] Search interface
- [ ] Official profiles
- [ ] Timeline visualization
- [ ] Mobile responsive

### Phase 4: Launch (Month 3-4)
- [ ] Security audit
- [ ] Performance optimization
- [ ] Public launch

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
