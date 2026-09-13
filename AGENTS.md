# AGENTS.md - Directory App Project Guide

## Project Overview
Full-stack Directory Application: **React Native (Expo)** frontend + **Node.js/Express** backend.

---

## Tech Stack

### Backend
| Layer | Technology |
|-------|-----------|
| Runtime | Node.js v18+ |
| Framework | Express.js |
| Language | JavaScript (ES6+) |
| Database | MongoDB + Mongoose ODM |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| Validation | express-validator |
| Env | dotenv |
| Testing | Jest + Supertest |

### Frontend
| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 52) |
| Language | **TypeScript** |
| Package Manager | Bun |
| Navigation | React Navigation v7 |
| State | **Zustand** + React Context API |
| Server State | **TanStack Query** (React Query) |
| Forms | **React Hook Form + Zod** |
| HTTP Client | Axios |
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
| ESLint + Prettier | Code quality + formatting | `eslint`, `prettier`, `eslint-config-expo` |
| Sentry | Crash reporting, performance | `@sentry/react-native` |
| react-native-mmkv | Fast key-value storage (30x faster than AsyncStorage) | `react-native-mmkv` |

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
│   │   ├── config/         # db.ts (MongoDB connection)
│   │   ├── controllers/    # auth.ts, listings.ts, categories.ts
│   │   ├── middleware/      # auth.ts (JWT protect/authorize)
│   │   ├── models/         # User.ts, Listing.ts, Category.ts
│   │   ├── routes/         # auth.ts, listings.ts, categories.ts
│   │   └── utils/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   └── server.js           # Entry point
├── frontend/
│   ├── src/
│   │   ├── api/            # TanStack Query hooks + API functions
│   │   ├── assets/         # Images, fonts
│   │   ├── components/     # Reusable UI (Header, ImageSlider, etc.)
│   │   ├── hooks/          # Custom hooks
│   │   ├── lib/            # Utility libraries (sentry, mmkv, etc.)
│   │   ├── navigation/     # AppNavigator.tsx, BottomTabNavigator.tsx
│   │   ├── screens/        # Home, Login, Register, Listings, etc.
│   │   ├── services/       # api.ts (Axios instance)
│   │   ├── store/          # Zustand stores
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Helper functions
│   ├── __tests__/
│   ├── App.tsx             # Root component (GestureHandlerRootView wrapper)
│   ├── index.tsx           # Entry point (registerRootComponent)
│   ├── app.json
│   ├── babel.config.js
│   ├── tsconfig.json
│   ├── .eslintrc.js
│   ├── .prettierrc.js
│   └── package.json
├── .gitignore
├── AGENTS.md               # This file
├── skill.md                # Package knowledge & workflows
└── REQUIREMENTS.md
```

---

## Build & Run Commands

### Backend
```bash
cd backend
npm install          # Install dependencies
cp .env.example .env # Configure env vars
npm run dev          # Start with nodemon (dev)
npm start            # Start with node (prod)
npm test             # Run Jest tests
```

### Frontend
```bash
cd frontend
bun install          # Install dependencies
bunx expo start --web          # Run on web
bunx expo start --web --clear  # Clear cache and run
bunx expo start                # Run on device (QR code)
bunx expo install --fix        # Fix version compatibility
bun run lint        # Run ESLint
bun run format      # Run Prettier
bun run typecheck   # Run TypeScript check
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

### Backend
- MVC pattern: Models → Controllers → Routes
- Error handling: `try/catch` in controllers, global error middleware
- Auth middleware: `protect` (JWT verify), `authorize(...roles)` (role check)
- Response format: `{ success: boolean, data: ..., count?: number }`
- Env vars: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`

### Frontend
- **TypeScript** for all files (.ts/.tsx)
- Functional components with hooks
- Screen files: `src/screens/[Name]Screen.tsx`
- Reusable components: `src/components/[Name].tsx`
- API hooks: `src/api/use[Resource].ts` (TanStack Query)
- Zustand stores: `src/store/[name]Store.ts`
- Types: `src/types/[name].ts`
- Services: `src/services/api.ts` (Axios instance with interceptor)
- Navigation: Stack + Bottom Tabs pattern
- Forms: React Hook Form + Zod validation schemas

### Git
- Initial commit on `master` branch
- `.gitignore` excludes: `node_modules/`, `.env`, `coverage/`, `*.log`

---

## Current Development Notes

- **Auth is skipped**: Login/Register directly routes to Home with dummy token
- **Images**: Using Unsplash URLs (no local assets yet)
- **Backend**: Not running, frontend uses mock data
- **Web tested**: `bunx expo start --web` on port 8081

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
