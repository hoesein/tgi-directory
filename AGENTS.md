# AGENTS.md - Directory App Project Guide

## Project Overview
Full-stack Directory Application: **React Native (Expo)** frontend + **Next.js/Supabase** backend.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (JWT) |
| Validation | Zod |
| Package Manager | Bun |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 52) |
| Language | **TypeScript** |
| Package Manager | Bun |
| Navigation | React Navigation v7 |
| State | **Zustand** |
| Server State | **TanStack Query** (React Query) |
| Forms | **React Hook Form + Zod** |
| HTTP Client | Custom fetch-based ApiService |
| UI Library | React Native Paper v5 |
| Icons | @expo/vector-icons (Ionicons) |
| Storage | **react-native-mmkv** |
| Error Tracking | **Sentry** |
| Linting | **ESLint + Prettier** |
| Web Support | react-dom + react-native-web |

---

## Priority Standards

### P0 - Must Have (Implemented)
| Standard | Purpose | Package |
|----------|---------|---------|
| TypeScript | Type safety, fewer runtime errors | `typescript` |
| TanStack Query | API caching, loading/error states | `@tanstack/react-query` |
| React Hook Form + Zod | Form handling + schema validation | `react-hook-form`, `zod` |

### P1 - Should Have (Implemented)
| Standard | Purpose | Package |
|----------|---------|---------|
| ESLint + Prettier | Code quality + formatting | `eslint`, `prettier` |
| Sentry | Crash reporting, performance | `@sentry/react-native` |
| react-native-mmkv | Fast key-value storage | `react-native-mmkv` |

### P2 - Nice to Have (Implemented)
| Standard | Purpose | Package |
|----------|---------|---------|
| Zustand | Lightweight state management | `zustand` |

---

## Project Structure

```
Directory/
├── backend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx              # Root layout
│   │   │   ├── page.tsx                # API docs landing page
│   │   │   └── api/
│   │   │       ├── health/route.ts     # GET /api/health
│   │   │       ├── auth/
│   │   │       │   ├── register/route.ts
│   │   │       │   ├── login/route.ts
│   │   │       │   └── me/route.ts
│   │   │       ├── listings/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/route.ts
│   │   │       └── categories/
│   │   │           └── route.ts
│   │   ├── lib/
│   │   │   ├── supabase.ts
│   │   │   └── api-helpers.ts
│   │   └── types/
│   │       └── index.ts
│   ├── supabase/
│   │   └── migrations/
│   │       └── 001_initial.sql
│   ├── SKILL.md                       # Backend-specific skill file
│   ├── .env.example
│   ├── next.config.js
│   ├── tsconfig.json
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/                        # TanStack Query hooks
│   │   ├── components/                 # Reusable UI
│   │   ├── lib/                        # Utility libraries
│   │   ├── navigation/                 # Navigation setup
│   │   ├── screens/                    # Screen components
│   │   ├── services/                   # API service layer
│   │   ├── store/                      # Zustand stores
│   │   └── types/                      # TypeScript types
│   ├── SKILL.md                        # Frontend-specific skill file
│   ├── App.tsx
│   ├── index.tsx
│   └── package.json
├── .gitignore
├── AGENTS.md                           # This file
└── REQUIREMENTS.md
```

---

## Build & Run Commands

### Backend
```bash
cd backend
bun install
cp .env.example .env   # Configure Supabase keys
bun run dev             # Start dev server (port 3000)
bun run build           # Build for production
bun run start           # Start production server
bun run lint            # ESLint
bun run typecheck       # TypeScript check
```

### Frontend
```bash
cd frontend
bun install
bunx expo start --web          # Run on web (port 8081)
bunx expo start --web --clear  # Clear cache and run
bunx expo start                # Run on device (QR code)
bun run lint                   # ESLint
bun run format                 # Prettier
bun run typecheck              # TypeScript check
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing (protected)
- `PUT /api/listings/:id` - Update listing (protected)
- `DELETE /api/listings/:id` - Delete listing (protected)

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category (admin only)

---

## Conventions

### Backend (Next.js + Supabase)
- App Router with Route Handlers (`src/app/api/`)
- Zod validation on all POST/PUT inputs
- Supabase client: `supabase` (public/anon) and `supabaseAdmin` (service role)
- Response format: `{ success: boolean, data: ..., count?: number, message?: string }`
- Auth: Supabase Auth JWT verified via `supabaseAdmin.auth.getUser(token)`
- Env vars: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

### Frontend (React Native/Expo)
- **TypeScript** for all files (.ts/.tsx)
- Functional components with hooks
- Screen files: `src/screens/[Name]Screen.tsx`
- Reusable components: `src/components/[Name].tsx`
- API hooks: `src/api/use[Resource].ts` (TanStack Query)
- Zustand stores: `src/store/[name]Store.ts`
- Types: `src/types/index.ts`
- Services: `src/services/api.ts` (custom fetch-based)
- Navigation: Stack + Bottom Tabs pattern
- Forms: React Hook Form + Zod validation schemas

### Git
- Initial commit on `master` branch
- `.gitignore` excludes: `node_modules/`, `.env`, `.next/`, `coverage/`, `*.log`

---

## Skill Files

| File | Scope |
|------|-------|
| `backend/SKILL.md` | Next.js + Supabase backend reference |
| `frontend/SKILL.md` | React Native (Expo) frontend reference |

---

## Current Development Notes

- **Auth is skipped**: Login/Register directly routes to Home with dummy token
- **Images**: Using Unsplash URLs (no local assets yet)
- **Backend**: Next.js on port 3000, Supabase for database
- **Frontend**: Expo on port 8081, connects to backend on port 3000
- **Database**: Requires Supabase project + migration SQL

---

## Home Screen Components

| Component | File | Purpose |
|-----------|------|---------|
| ImageSlider | `components/ImageSlider.tsx` | Auto-scroll carousel (responsive via `useWindowDimensions`) |
| CategoriesList | `components/CategoriesList.tsx` | Wrapping category grid (4 per row) |
| CategoryCard | `components/CategoryCard.tsx` | Individual category grid cell |
| NearestListings | `components/NearestListings.tsx` | Horizontal listing scroll |
| NearestCard | `components/NearestCard.tsx` | Individual listing card |
| BottomTabNavigator | `navigation/BottomTabNavigator.tsx` | Bottom tabs (Home/Messages/Notifications/Profile) |
