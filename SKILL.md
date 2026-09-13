# Skill.md - Package Knowledge & Workflows

## Expo + React Native Web

### Key Versions
- Expo SDK: 52.0.49
- React: 18.3.1
- React Native: 0.76.9
- react-native-web: 0.19.13

### Common Issues & Fixes

#### Blank white screen on web
- **Cause**: Missing `babel.config.js`
- **Fix**: Create `babel.config.js` with `babel-preset-expo`
- **Cause**: Missing `index.js` entry point
- **Fix**: Create `index.js` with `registerRootComponent`

#### GestureHandlerRootView error
- **Cause**: Missing `react-native-gesture-handler` or wrong version
- **Fix**: Install `react-native-gesture-handler@~2.20.2` (NOT v3)
- **Fix**: Wrap app in `<GestureHandlerRootView style={{ flex: 1 }}>` in App.tsx
- **Fix**: Import `'react-native-gesture-handler'` at top of App.tsx

#### Version mismatch warnings
- **Fix**: Run `bunx expo install --fix` to auto-install compatible versions

### Web Run Command
```bash
bunx expo start --web          # Standard
bunx expo start --web --clear  # Clear cache first
bunx expo start --web --port 8082  # Custom port
```

---

## React Navigation v7

### Required Dependencies
```json
{
  "@react-navigation/native": "^7.0.0",
  "@react-navigation/native-stack": "^7.0.0",
  "@react-navigation/bottom-tabs": "^7.0.0",
  "react-native-screens": "~4.4.0",
  "react-native-safe-area-context": "4.12.0",
  "react-native-gesture-handler": "~2.20.2"
}
```

### Navigation Pattern
```
App.tsx
└── GestureHandlerRootView
    └── QueryClientProvider (TanStack Query)
        └── PaperProvider (React Native Paper)
            └── NavigationContainer (in AppNavigator.tsx)
                ├── Stack.Navigator
                │   ├── Login (when no token)
                │   ├── Register (when no token)
                │   └── Main → BottomTabNavigator (when token exists)
                └── BottomTabNavigator
                    ├── Home
                    ├── Messages
                    ├── Notifications
                    └── Profile
```

### Key Rules
- Must wrap with `GestureHandlerRootView` at app root
- `NavigationContainer` goes in AppNavigator, NOT in App.tsx
- `headerShown: false` hides default header
- Bottom tabs use `tabBarIcon` with Ionicons

---

## Bun (Package Manager)

### Install
```bash
# Windows
powershell -c "irm bun.sh/install.ps1 | iex"
```

### Commands
```bash
bun install              # Install all deps
bun add <package>        # Add dependency
bun add -D <package>     # Add dev dependency
bun remove <package>     # Remove dependency
bunx <command>           # Run package binary (like npx)
bun pm ls                # List installed packages
```

### Notes
- `bun install` is faster than npm/yarn
- `bunx` replaces `npx` for running expo, etc.
- Lock file: `bun.lockb`

---

## React Native Paper v5

### Theme Colors Used
```typescript
const theme = {
  colors: {
    primary: '#FF6B35',    // Orange accent
    background: '#f5f5f5', // Light gray bg
    surface: '#ffffff',    // White cards
  }
};
```

### Common Components
```tsx
import { Text, TextInput, Button, Card } from 'react-native-paper';

<Text variant="headlineSmall">Title</Text>
<TextInput label="Email" mode="outlined" />
<Button mode="contained" onPress={handlePress}>Login</Button>
<Card><Card.Title title="Name" /></Card>
```

---

## TypeScript Setup

### Install
```bash
bun add -D typescript @types/react @types/react-native
```

### tsconfig.json
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx"]
}
```

### File Naming Convention
```
components/Header.tsx
screens/HomeScreen.tsx
services/api.ts
types/index.ts
store/authStore.ts
api/useListings.ts
lib/sentry.ts
lib/mmkv.ts
```

---

## TanStack Query (React Query)

### Install
```bash
bun add @tanstack/react-query
```

### Provider Setup (`App.tsx`)
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App components */}
    </QueryClientProvider>
  );
}
```

### Custom Hook Pattern (`api/useListings.ts`)
```typescript
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export function useListings() {
  return useQuery({
    queryKey: ['listings'],
    queryFn: async () => {
      const { data } = await api.get('/listings');
      return data.data;
    },
  });
}

export function useListing(id: string) {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
```

### Mutation Pattern
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newListing: CreateListingInput) => {
      const { data } = await api.post('/listings', newListing);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
    },
  });
}
```

### Key Concepts
- `queryKey` - Cache key for the query
- `queryFn` - Function that fetches data
- `enabled` - Condition to run query
- `invalidateQueries` - Refetch after mutation
- `useQuery` - For GET requests
- `useMutation` - For POST/PUT/DELETE

---

## React Hook Form + Zod

### Install
```bash
bun add react-hook-form zod @hookform/resolvers
```

### Validation Schema (`types/auth.ts`)
```typescript
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
```

### Form Component (`screens/LoginScreen.tsx`)
```tsx
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { TextInput, Button, Text } from 'react-native-paper';

export function LoginScreen() {
  const { control, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    console.log(data);
  };

  return (
    <>
      <Controller
        control={control}
        name="email"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Email"
            mode="outlined"
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.email}
          />
        )}
      />
      {errors.email && <Text style={{ color: 'red' }}>{errors.email.message}</Text>}

      <Controller
        control={control}
        name="password"
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            onBlur={onBlur}
            onChangeText={onChange}
            value={value}
            error={!!errors.password}
          />
        )}
      />
      {errors.password && <Text style={{ color: 'red' }}>{errors.password.message}</Text>}

      <Button mode="contained" onPress={handleSubmit(onSubmit)}>
        Login
      </Button>
    </>
  );
}
```

### Key Concepts
- `useForm` - Form hook with validation
- `Controller` - Connects RHF to React Native components
- `zodResolver` - Integrates Zod schemas
- `formState.errors` - Validation errors object
- `handleSubmit` - Validates and submits

---

## Zustand (State Management)

### Install
```bash
bun add zustand
```

### Store Pattern (`store/authStore.ts`)
```typescript
import { create } from 'zustand';

interface AuthState {
  userToken: string | null;
  isLoading: boolean;
  signIn: (token: string) => void;
  signOut: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  userToken: null,
  isLoading: false,
  signIn: (token) => set({ userToken: token }),
  signOut: () => set({ userToken: null }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
```

### Usage in Components
```tsx
import { useAuthStore } from '../store/authStore';

function LoginScreen() {
  const { signIn, userToken, isLoading } = useAuthStore();

  const handleLogin = async () => {
    const token = await api.post('/auth/login', { email, password });
    signIn(token);
  };
}
```

### Key Concepts
- `create` - Creates a store
- `set` - Updates state
- `get` - Reads state
- No providers needed (unlike Context)
- Automatic re-renders on used state changes

---

## Sentry (Error Tracking)

### Install
```bash
bun add @sentry/react-native
```

### Setup (`lib/sentry.ts`)
```typescript
import * as Sentry from '@sentry/react-native';

export function initSentry() {
  Sentry.init({
    dsn: 'YOUR_DSN_HERE',
    environment: __DEV__ ? 'development' : 'production',
  });
}
```

### Usage in App.tsx
```tsx
import * as Sentry from '@sentry/react-native';
import { initSentry } from './src/lib/sentry';

initSentry();

export default Sentry.wrap(function App() {
  return (
    // App content
  );
});
```

### Capture Errors
```typescript
import * as Sentry from '@sentry/react-native';

try {
  // risky code
} catch (error) {
  Sentry.captureException(error);
}
```

---

## react-native-mmkv (Fast Storage)

### Install
```bash
bun add react-native-mmkv
```

### Setup (`lib/mmkv.ts`)
```typescript
import { MMKV } from 'react-native-mmkv';

export const storage = new MMKV({
  id: 'directory-app',
});
```

### Usage (replaces AsyncStorage)
```typescript
import { storage } from '../lib/mmkv';

// Set
storage.set('userToken', 'abc123');
storage.set('count', 42);

// Get
const token = storage.getString('userToken');
const count = storage.getNumber('count');

// Delete
storage.delete('userToken');

// Clear all
storage.clearAll();
```

### Key Concepts
- 30x faster than AsyncStorage
- Synchronous API (no async/await needed)
- Encrypted storage available
- Works on iOS, Android, Web

---

## Axios API Service

### Setup (`services/api.ts`)
```typescript
import axios from 'axios';
import { storage } from '../lib/mmkv';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor adds JWT token
api.interceptors.request.use((config) => {
  const token = storage.getString('userToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## ESLint + Prettier

### Install
```bash
bun add -D eslint eslint-config-expo @typescript-eslint/parser @typescript-eslint/eslint-plugin prettier eslint-config-prettier eslint-plugin-prettier
```

### .eslintrc.js
```javascript
module.exports = {
  root: true,
  extends: ['expo', 'prettier'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn',
  },
};
```

### .prettierrc.js
```javascript
module.exports = {
  semi: true,
  trailingComma: 'all',
  singleQuote: true,
  printWidth: 100,
  tabWidth: 2,
};
```

### Package.json Scripts
```json
{
  "scripts": {
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write 'src/**/*.{ts,tsx}'"
  }
}
```

---

## Backend (Node.js/Express)

### Server Start
```bash
cd backend
npm install
cp .env.example .env   # Set MONGODB_URI, JWT_SECRET
npm run dev            # Development with nodemon
npm start              # Production
```

### Environment Variables (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/directory
JWT_SECRET=your_secret_here
JWT_EXPIRE=30d
```

### API Response Format
```json
{
  "success": true,
  "data": { ... },
  "count": 10
}
```

### Error Response Format
```json
{
  "success": false,
  "message": "Error description"
}
```

---

## Icon Reference (Ionicons)

### Bottom Tab Icons
| Tab | Active | Inactive |
|-----|--------|----------|
| Home | `home` | `home-outline` |
| Messages | `chatbubble` | `chatbubble-outline` |
| Notifications | `notifications` | `notifications-outline` |
| Profile | `person` | `person-outline` |

### Other Icons Used
- Search: `search-outline`
- Location: `location` / `location-outline`
- Rating: `star`
- Chevron: `chevron-down`

### Usage
```tsx
import { Ionicons } from '@expo/vector-icons';
<Ionicons name="home" size={24} color="#FF6B35" />
```

---

## Git Workflow

### Initial Setup
```bash
git init
git add .
git commit -m "Initial project setup"
```

### .gitignore
```
node_modules/
.env
coverage/
*.log
.DS_Store
```

---

## Windows-Specific Notes

### Long Path Issue
- `node_modules` with deep nested dirs can't be deleted via PowerShell
- Use `cmd /c "rmdir /s /q node_modules"` or `robocopy`
- Or just install over existing `node_modules` with `bun install`

### Port Cleanup
```powershell
netstat -ano | Select-String ":8081" | ForEach-Object { $_ -match '\s(\d+)$'; Stop-Process -Id $Matches[1] -Force }
```
