# Planning: Category Detail Page Enhancement (PWA App)

## Project Overview

**Application:** Directory App (PWA-only)
- **Architecture:** Static directory data (GitHub `aggregated_data/` in production, `public/data/` in dev)
- **Tech Stack:** React, React Query, TanStack Query, Lucide React, Tailwind CSS
- **Scope:** PWA (Progressive Web App) - no backend or frontend (Expo) dependencies

## Current Status

### Completed Work

| File | Change | Status |
|------|--------|---------|
| `web/src/services/directory.ts` | Updated `isDirectoryDataConfigured()` to return `true` in dev mode | ✅ Done |
| `web/src/pages/CategoryPage.tsx` | Refactored to use only static directory data; removed `useCategory`, `useListings`; removed mock fallbacks | ✅ Done |
| `web/src/api/useDirectory.ts` | Unchanged (still provides static data via `fetchDirectoryCategories`/`fetchDirectoryFile`) | ✅ Existing |

### Refactored Behavior

**Before:**
- Mixed static and backend data sources
- Used `useCategory` (backend) and `useListings` (backend) hooks
- Had mock fallback (`MOCK_LISTINGS`)
- Conditional logic based on `isStatic` flag

**After:**
- **Single source of truth:** Static directory data only
- **Dev mode:** Uses `public/data/` (local copy of GitHub data)
- **Prod mode:** Uses `VITE_DATA_URL` → GitHub `aggregated_data/`
- **No backend calls** for category/listing data
- **Direct mapping:** `staticMeta.types` → `typeOptions`; `staticItems` → `displayListings`

## Main Feature: Category Detail Page

### Goal
Enhance `CategoryPage` to source category and listings data exclusively from static directory data, enabling a pure PWA experience with zero backend dependencies.

### Features Implemented

1. **Static Data Flow**
   - `useDirectoryCategories()` → `manifest` (JSON from `categories.json`)
   - `useDirectoryFile(categoryId)` → `staticItems` (individual listing files)
   - `staticMeta` → category metadata (title, description, count, types)
   - `staticItems` → listing details (name, location, rating, image, type)

2. **UI Improvements**
   - Removed `catLoading` spinner (no more network-dependent loading)
   - Simplified `typeOptions` derivation (direct from `staticMeta?.types`)
   - Kept chip-based type selection (All + individual categories)
   - Preserved search/filter functionality
   - Maintained navigation to listing details

3. **Offline Capability**
   - All data served locally in `public/data/` during development
   - Production falls back to GitHub `aggregated_data/` via `VITE_DATA_URL`
   - No network calls required for category/listing rendering

## Roadmap for PWA App

### Phase 1: Core Pages (Completed)
- [x] **Home Page** - Hero slider + category list
- [x] **Category Detail Page** - Enhanced with static data only
- [x] **Place to Visit** - Listings view
- [x] **Event Page** - Event listings
- [x] **Profile Page** - User profiles

### Phase 2: Enhanced Features (Planned)

| Feature | Description | Status |
|---------|-------------|---------|
| **Deep Linking** | Add deep links for category IDs (e.g., `/category/hotels.json`) | ⏳ Planned |
| **Offline Cache** | ServiceWorker caching for all static assets | ⏳ Planned |
| **PWA Manifest** | Add favicon, theme colors, app name, icons | ⏳ Planned |
| **Authentication** | Add login/registration (backend integration) | ⏳ Planned |
| **Search Indexing** | Elasticsearch/Firestore indexing for faster search | ⏳ Planned |
| **Analytics** | Integrate analytics (Google Analytics, Mixpanel) | ⏳ Planned |

### Phase 3: Performance & Quality

| Task | Description | Owner |
|------|-------------|-------|
| **TypeScript Typing** | Finalize all type definitions | Frontend Team |
| **Linting & Formatting** | Ensure code passes ESLint/Prettier | CI Pipeline |
| **Accessibility Audit** | WCAG compliance for all pages | QA |
| **Cross-browser Testing** | Test on Chrome, Firefox, Safari, Edge | QA |
| **Performance Optimization** | Lazy loading, code splitting, image optimization | Frontend Team |

## Technical Considerations

### Data Flow
```
User Request → CategoryPage → useDirectoryCategories() → manifest.json
                                      → useDirectoryFile(categoryId) → staticItems.json
                                      → Display listings + type options
```

### Environment Variables
- `VITE_DATA_URL` - Points to GitHub `aggregated_data/` (prod)
- `PUBLIC_DATA_PATH` - Path to local `public/data/` (dev)

### Offline Strategy
- All category/listing data cached in `public/data/` during dev
- Production builds serve from GitHub via `VITE_DATA_URL`
- No API calls required for category/listing rendering

## Next Steps

1. **Verify PWA Build** - Run `bun run build` in `web/` to ensure production build works
2. **Test Dev Mode** - Confirm `public/data/` is populated correctly
3. **Add Deep Links** - Implement route parameters for category IDs
4. **Implement ServiceWorker** - Cache static assets for offline access
5. **Add Manifests** - Configure PWA manifest for proper installation

## Success Criteria

- [ ] CategoryPage renders without any backend API calls
- [ ] Works in PWA mode (offline capable)
- [ ] Search and filtering functional
- [ ] Responsive design across devices
- [ ] All tests pass (unit, integration, e2e)
- [ ] CI pipeline runs clean (lint, typecheck, build)

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Missing data in `public/data/` | Broken UI | Automated CI check for data completeness |
| Large JSON files causing slow loads | Poor performance | Lazy loading, pagination, compression |
| Cache invalidation | Stale data | Versioned manifest, cache busting |
| Cross-browser inconsistencies | User experience issues | Extensive testing on target browsers |

## Ownership
- **Primary:** Frontend Team (CategoryPage, Home, Place to Visit)
- **Support:** Backend Team (providing `aggregated_data/` on GitHub)
- **QA:** Testing across devices and network conditions

---
*Plan last updated: 2026-10-03*
*Project:* Directory App (PWA)
*Status:* Ready for Phase 2 implementation
