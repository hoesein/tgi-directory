# Frontend SKILL.md — React Native (Expo) + TypeScript

## Overview
Directory App frontend built with **React Native (Expo SDK 52)** + **TypeScript**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React Native (Expo SDK 52) |
| Language | TypeScript |
| Package Manager | Bun |
| Navigation | React Navigation v7 |
| State | Zustand |
| Server State | TanStack Query (React Query) |
| Forms | React Hook Form + Zod |
| HTTP Client | Fetch (custom ApiService) |
| UI Library | React Native Paper v5 |
| Icons | @expo/vector-icons (Ionicons) |
| Storage | react-native-mmkv (web fallback: localStorage) |
| Error Tracking | Sentry |
| Linting | ESLint + Prettier |
| Web Support | react-dom + react-native-web |

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # TanStack Query hooks
│   │   ├── useListings.ts
│   │   └── useCategories.ts
│   ├── components/             # Reusable UI components
│   │   ├── CategoriesList.tsx
│   │   ├── CategoryCard.tsx
│   │   ├── CategoryListItem.tsx
│   │   ├── Header.tsx
│   │   ├── ImageSlider.tsx
│   │   ├── NearestCard.tsx
│   │   └── NearestListings.tsx
│   ├── lib/                    # Utility libraries
│   │   ├── mmkv.ts             # Storage (MMKV + web fallback)
│   │   └── sentry.ts           # Sentry init
│   ├── navigation/             # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   └── BottomTabNavigator.tsx
│   ├── screens/                # Screen components
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── RegisterScreen.tsx
│   │   ├── ListingDetailScreen.tsx
│   │   ├── CategoryDetailScreen.tsx
│   │   ├── MessagesScreen.tsx
│   │   ├── NotificationsScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── services/               # API service layer
│   │   └── api.ts              # Custom fetch-based API client
│   ├── store/                  # Zustand stores
│   │   └── authStore.ts
│   └── types/                  # TypeScript types + Zod schemas
│       └── index.ts
├── App.tsx                     # Root component
├── index.tsx                   # Entry point
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc.js
├── eslint.config.js
├── babel.config.js
├── app.json
└── package.json
```

---

## Setup

### 1. Install dependencies
```bash
cd frontend
bun install
```

### 2. Start dev server
```bash
bunx expo start --web          # Web
bunx expo start                # Mobile (QR code)
bunx expo start --web --clear  # Clear cache
```
Runs on **http://localhost:8081**

### 3. Connect to backend
Ensure the Next.js backend is running on `http://localhost:3000`.
The frontend API service is configured in `src/services/api.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

---

## Commands

```bash
bunx expo start --web          # Run on web
bunx expo start                # Run on device
bun run lint                   # ESLint
bun run lint:fix               # ESLint fix
bun run format                 # Prettier format
bun run typecheck              # TypeScript check
```

---

## Architecture

### Provider Hierarchy (App.tsx)
```
GestureHandlerRootView
└── QueryClientProvider (TanStack Query)
    └── SafeAreaProvider
        └── PaperProvider (React Native Paper)
            └── AppNavigator
                └── NavigationContainer
                    ├── Stack.Navigator
                    │   ├── Main → BottomTabNavigator
                    │   ├── ListingDetail
                    │   ├── CategoryDetail
                    │   ├── Login
                    │   └── Register
                    └── BottomTabNavigator
                        ├── Home
                        ├── Messages
                        ├── Notifications
                        └── Profile
```

### API Service Pattern
Custom `ApiService` class wrapping `fetch`:
```typescript
import { api } from '../services/api';
import { ApiResponse, Listing } from '../types';

// GET
const res = await api.get<ApiResponse<Listing[]>>('/listings');
const listings = res.data;

// POST
const res = await api.post<ApiResponse<Listing>>('/listings', { title: '...' });

// PUT
const res = await api.put<ApiResponse<Listing>>('/listings/123', { title: '...' });

// DELETE
await api.delete('/listings/123');
```

### TanStack Query Pattern
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';

export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const res = await api.get<ApiResponse<Listing[]>>('/listings');
      return res.data;
    },
  });
}
```

### Zustand Store Pattern
```typescript
import { create } from 'zustand';

interface AuthState {
  userToken: string | null;
  signIn: (token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userToken: null,
  signIn: (token) => set({ userToken: token }),
  signOut: () => set({ userToken: null }),
}));
```

### React Hook Form + Zod Pattern
```typescript
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../types';

const { control, handleSubmit } = useForm<LoginInput>({
  resolver: zodResolver(loginSchema),
});
```

---

## Key Patterns

### Storage (MMKV with web fallback)
```typescript
import { storage } from '../lib/mmkv';

// Set
storage.set('userToken', 'abc123');

// Get
const token = storage.getString('userToken');

// Delete
storage.delete('userToken');
```

### Navigation
```typescript
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  ListingDetail: { listingId: string };
  CategoryDetail: { categoryId: string };
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'ListingDetail'>;

const handlePress = (id: string) => {
  navigation.navigate('ListingDetail', { listingId: id });
};
```

---

## Cross-Platform Notes

### Shadows
Use `Platform.select` for iOS/Android shadows:
```typescript
import { Platform } from 'react-native';

...Platform.select({
  ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  android: { elevation: 3 },
})
```

### Safe Area
Use `SafeAreaView` from `react-native-safe-area-context` for notch-safe layouts.

### Image Slider
Use `useWindowDimensions()` instead of `Dimensions.get()` for responsive layouts that handle rotation.

### MMKV on Web
The `mmkv.ts` lib provides a `WebStorage` class using `localStorage` when running on web. Native uses `react-native-mmkv`.

---

## Environment Variables

None required for frontend. The API URL is hardcoded in `src/services/api.ts`.

---

## Notes

- **Auth is skipped**: Login/Register directly routes to Home with a dummy token
- **Images**: Using Unsplash URLs (no local assets yet)
- **Backend**: Next.js on port 3000
- **Web tested**: `bunx expo start --web` on port 8081
- **Old root SKILL.md**: This file replaces the combined root SKILL.md
