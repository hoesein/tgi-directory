# Backend SKILL.md — Next.js + Supabase

## Overview
Directory App backend built with **Next.js 15 (App Router)** + **TypeScript** + **Supabase** (PostgreSQL + Auth).

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Validation | Zod |
| Package Manager | Bun |

---

## Project Structure

```
backend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # API docs landing page
│   │   └── api/
│   │       ├── health/route.ts     # GET /api/health
│   │       ├── auth/
│   │       │   ├── register/route.ts  # POST /api/auth/register
│   │       │   ├── login/route.ts     # POST /api/auth/login
│   │       │   └── me/route.ts        # GET  /api/auth/me
│   │       ├── listings/
│   │       │   ├── route.ts           # GET  /api/listings, POST /api/listings
│   │       │   └── [id]/route.ts      # GET/PUT/DELETE /api/listings/:id
│   │       └── categories/
│   │           └── route.ts           # GET  /api/categories, POST /api/categories
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client (public + admin)
│   │   └── api-helpers.ts         # Response helpers, auth utils
│   └── types/
│       └── index.ts               # TypeScript types + Zod schemas
├── supabase/
│   └── migrations/
│       └── 001_initial.sql        # Database schema + RLS + seed data
├── .env.example
├── next.config.js
├── tsconfig.json
├── eslint.config.mjs
└── package.json
```

---

## Setup

### 1. Install dependencies
```bash
cd backend
bun install
```

### 2. Create Supabase project
1. Go to https://supabase.com and create a new project
2. Note the **Project URL** and **Anon Key** from Settings → API
3. Note the **Service Role Key** from Settings → API (keep secret!)

### 3. Run database migration
1. Go to Supabase Dashboard → SQL Editor
2. Paste contents of `supabase/migrations/001_initial.sql`
3. Click **Run**

### 4. Configure environment
```bash
cp .env.example .env
```
Fill in:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 5. Start dev server
```bash
bun run dev
```
Server runs on **http://localhost:3000**

---

## API Endpoints

| # | Method | Endpoint | Auth | Description |
|---|--------|----------|------|-------------|
| 1 | GET | `/api/health` | Public | Health check |
| 2 | POST | `/api/auth/register` | Public | Register user |
| 3 | POST | `/api/auth/login` | Public | Login user |
| 4 | GET | `/api/auth/me` | Protected | Get current user |
| 5 | GET | `/api/listings` | Public | Get all listings |
| 6 | POST | `/api/listings` | Protected | Create listing |
| 7 | GET | `/api/listings/:id` | Public | Get single listing |
| 8 | PUT | `/api/listings/:id` | Protected | Update listing (owner/admin) |
| 9 | DELETE | `/api/listings/:id` | Protected | Delete listing (owner/admin) |
| 10 | GET | `/api/categories` | Public | Get all categories |
| 11 | POST | `/api/categories` | Admin only | Create category |

---

## Response Format

### Success
```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

### Error
```json
{
  "success": false,
  "data": null,
  "message": "Error description"
}
```

---

## Database Schema

### users
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, references auth.users |
| name | TEXT | Required, max 50 chars |
| email | TEXT | Unique |
| role | TEXT | 'user' or 'admin', default 'user' |
| created_at | TIMESTAMPTZ | Default now() |

### categories
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, auto-generated |
| name | TEXT | Unique, max 50 chars |
| description | TEXT | Optional, max 200 chars |
| created_at | TIMESTAMPTZ | Default now() |

### listings
| Column | Type | Notes |
|--------|------|-------|
| id | UUID | PK, auto-generated |
| title | TEXT | Required, max 100 chars |
| description | TEXT | Required, max 500 chars |
| category_id | UUID | FK → categories |
| user_id | UUID | FK → users |
| location | TEXT | Required |
| phone | TEXT | Optional, max 20 chars |
| email | TEXT | Optional |
| website | TEXT | Optional |
| image | TEXT | Optional (URL) |
| created_at | TIMESTAMPTZ | Default now() |

---

## Key Patterns

### Supabase Client Usage
```typescript
import { supabase, supabaseAdmin } from '@/lib/supabase';

// Public (anon key) — used in GET routes
const { data, error } = await supabase.from('table').select('*');

// Admin (service role) — used in POST/PUT/DELETE routes
const { data, error } = await supabaseAdmin.from('table').insert({...});
```

### Auth Verification
```typescript
import { supabaseAdmin } from '@/lib/supabase';
import { getTokenFromRequest } from '@/lib/api-helpers';

const token = getTokenFromRequest(request);
const { data, error } = await supabaseAdmin.auth.getUser(token);
```

### Zod Validation
```typescript
import { createListingSchema } from '@/types';

const parsed = createListingSchema.safeParse(body);
if (!parsed.success) {
  return errorResponse(parsed.error.errors[0].message, 400);
}
```

---

## Commands

```bash
bun run dev          # Start dev server (port 3000)
bun run build        # Build for production
bun run start        # Start production server
bun run lint         # Run ESLint
bun run typecheck    # TypeScript check
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (server only) |
| `NEXT_PUBLIC_API_URL` | No | App URL (default: http://localhost:3000) |

---

## Notes

- **Auth is Supabase Auth**: No custom JWT signing. Supabase handles password hashing, JWT tokens, and session management.
- **RLS is enabled**: Row-Level Security policies enforce access control at the database level.
- **Auto-profile creation**: A database trigger auto-creates a `users` row when a new auth user signs up.
- **Service role key**: Used server-side only for admin operations (user creation, listing management). Never expose to client.
- **Next.js 15**: Uses App Router with Route Handlers (not Pages API).
