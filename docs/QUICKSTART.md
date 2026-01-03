# Quick Start Guide

## 🚀 Get Started in 15 Minutes

### Prerequisites

- **Node.js 20+** - [Download](https://nodejs.org/)
- **pnpm** - `npm install -g pnpm`
- **Supabase Account** - [Sign up free](https://supabase.com/)

### Step 1: Clone & Install

```bash
cd expose-enchufados

# Install backend dependencies
cd backend
pnpm install

# Install frontend dependencies
cd ../frontend
pnpm install
```

### Step 2: Set Up Supabase

1. Go to [supabase.com](https://supabase.com/) and create a new project
2. Wait for the database to be provisioned (2-3 minutes)
3. Go to **Settings > Database** and copy the connection string

### Step 3: Configure Environment

```bash
# Backend
cd backend
cp .env.example .env
# Edit .env and add your Supabase DATABASE_URL

# Frontend
cd ../frontend
cp .env.example .env
```

### Step 4: Set Up Database

1. Go to your Supabase project → **SQL Editor**
2. Copy the contents of `database/migrations/001_initial_schema.sql`
3. Run the SQL
4. Copy the contents of `database/seeds/001_sample_data.sql`
5. Run the SQL

### Step 5: Start Development Servers

```bash
# Terminal 1: Backend (port 3000)
cd backend
pnpm start:dev

# Terminal 2: Frontend (port 5173)
cd frontend
pnpm dev
```

### Step 6: Open the App

- **Frontend**: http://localhost:5173
- **API Docs**: http://localhost:3000/api/docs

---

## 📁 Project Structure

```
expose-enchufados/
├── backend/                    # NestJS API
│   ├── src/
│   │   ├── entities/          # TypeORM entities
│   │   ├── modules/           # Feature modules
│   │   │   ├── officials/     # Officials CRUD
│   │   │   ├── sanctions/     # Sanctions data
│   │   │   ├── cases/         # Legal cases
│   │   │   └── search/        # Full-text search
│   │   ├── app.module.ts      # Root module
│   │   └── main.ts            # Entry point
│   └── package.json
│
├── frontend/                   # SvelteKit app
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/    # UI components
│   │   │   ├── api.ts         # API client
│   │   │   └── types.ts       # TypeScript types
│   │   └── routes/            # Pages
│   └── package.json
│
├── database/                   # SQL files
│   ├── migrations/            # Schema migrations
│   └── seeds/                 # Sample data
│
└── docs/                       # Documentation
```

---

## 🔧 Common Tasks

### Add a New Official

```bash
# Using API (example with curl)
curl -X POST http://localhost:3000/api/v1/officials \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "Official",
    "status": "active"
  }'
```

### Run Database Migrations

If using TypeORM migrations:
```bash
cd backend
pnpm migration:run
```

### Build for Production

```bash
# Backend
cd backend
pnpm build
pnpm start:prod

# Frontend
cd frontend
pnpm build
pnpm preview
```

---

## 🚢 Deployment

### Backend → Fly.io

```bash
cd backend
fly launch
fly deploy
```

### Frontend → Vercel

```bash
cd frontend
vercel
```

### Database → Supabase

Already hosted! Just use the connection string.

---

## 📚 Next Steps

1. **Add more data** - Import from OFAC SDN list
2. **Enhance search** - Add PostgreSQL full-text search
3. **Add authentication** - For admin features
4. **Add image upload** - For official photos
5. **Add timeline** - Visual timeline of sanctions

---

## 🆘 Troubleshooting

### Backend won't start
- Check DATABASE_URL in `.env`
- Ensure Supabase project is running
- Check port 3000 is available

### Frontend won't connect to API
- Ensure backend is running on port 3000
- Check CORS settings in `backend/src/main.ts`
- Check PUBLIC_API_URL in frontend `.env`

### Database errors
- Ensure UUID extension is enabled: `CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
- Check that all enum types were created

---

Need help? Check the full documentation in `/docs` or open an issue.
