# Directory App - Requirements & Architecture

## Overview
A full-stack Directory Application with React Native (Expo) frontend and Next.js/Supabase backend.

---

## Tech Stack

### Backend
- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (JWT)
- **Validation:** Zod
- **Package Manager:** Bun

### Frontend
- **Framework:** React Native (Expo managed workflow)
- **Language:** TypeScript
- **Navigation:** React Navigation v7
- **State Management:** Zustand + TanStack Query
- **HTTP Client:** Custom fetch-based ApiService
- **UI Components:** React Native Paper
- **Storage:** react-native-mmkv (web fallback: localStorage)

---

## Architecture

### Backend Architecture (Next.js App Router)
```
backend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # API docs landing page
│   │   └── api/
│   │       ├── health/route.ts     # GET /api/health
│   │       ├── auth/
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   └── me/route.ts
│   │       ├── listings/
│   │       │   ├── route.ts        # GET (list), POST (create)
│   │       │   └── [id]/route.ts   # GET, PUT, DELETE
│   │       └── categories/
│   │           └── route.ts        # GET (list), POST (create)
│   ├── lib/
│   │   ├── supabase.ts             # Supabase client
│   │   └── api-helpers.ts          # Response helpers
│   └── types/
│       └── index.ts                # TypeScript types + Zod schemas
├── supabase/
│   └── migrations/
│       └── 001_initial.sql         # Database migration
├── .env.example
├── next.config.js
├── tsconfig.json
└── package.json
```

### Frontend Architecture
```
frontend/
├── src/
│   ├── api/                        # TanStack Query hooks
│   ├── components/                 # Reusable UI components
│   ├── lib/                        # Utility libraries
│   ├── navigation/                 # Navigation setup
│   ├── screens/                    # Screen components
│   ├── services/                   # API service layer
│   ├── store/                      # Zustand stores
│   └── types/                      # TypeScript types
├── App.tsx                         # Root component
├── index.tsx                       # Entry point
└── package.json
```

---

## API Endpoints

### Auth
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Directory Listings
- `GET /api/listings` - Get all listings
- `GET /api/listings/:id` - Get single listing
- `POST /api/listings` - Create listing
- `PUT /api/listings/:id` - Update listing
- `DELETE /api/listings/:id` - Delete listing

### Categories
- `GET /api/categories` - Get all categories
- `POST /api/categories` - Create category

---

## Project Structure (Root)
```
Directory/
├── backend/            # Next.js/Supabase API
├── frontend/           # React Native app
├── .gitignore
├── AGENTS.md           # Project guide
└── REQUIREMENTS.md     # This file
```

---

## Home Screen Design

### Layout (Top to Bottom)
1. **Hero Card (single box)**
   - Search bar (location/search input)
   - Notification bell icon (right of search bar)
   - Image Slider below: auto-scrolling carousel of famous places
     and restaurants with dot indicators, touch to view details

2. **Categories Section**
   - "Categories" header with "View All" link
   - Grid layout (4 columns per row, wraps to new rows)
   - New categories automatically flow into the grid, no layout change needed
   - Categories: Home Services, Daily Needs, Doctor, Cake Shop, etc.
   - Each category has icon and label

3. **Nearest for Your Home Section**
   - "Nearest for your Home" header
   - Horizontal scrollable listing cards
   - Each card shows:
     - Restaurant/Place image
     - Name
     - Address/Location
     - Rating (star)
     - Distance (km)

4. **Bottom Tab Navigation**
   - Home (active)
   - Messages/Chat
   - Notifications
   - Profile

### Components
- `ImageSlider` - Carousel for famous places/restaurants (responsive via `useWindowDimensions`)
- `CategoryCard` - Individual category item (grid cell)
- `CategoriesList` - Wrapping grid of categories (4 per row)
- `NearestCard` - Individual nearest listing card
- `NearestListings` - Horizontal scrollable nearest listings
- `BottomTabNavigator` - Bottom navigation tabs

---

## Current Development Notes

### Authentication (Skipped)
- Authentication is currently **skipped** for development
- Pressing Login/Register directly routes to Home screen with a dummy token
- No backend API calls for auth
- Will be re-enabled when Supabase is configured

---

## Development Rules
1. Use TypeScript for all new code
2. Use functional components with hooks in React Native
3. Implement proper error handling on both ends
4. Use Zod for all input validation
5. Use environment variables for sensitive data
6. Follow RESTful API design principles
7. Use Supabase Row-Level Security for access control
