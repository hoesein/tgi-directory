import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;

export interface Listing {
  id: string;
  title: string;
  description: string;
  category_id: string;
  category?: Category | null;
  user?: User | null;
  location: string;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  image?: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string | null;
  parent_id: string | null;
  icon?: string | null;
  level: number;
  sort_order: number;
  created_at: string;
  children?: Category[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}

// ─── Static directory data (aggregated_data/ hosted on GitHub) ─────────────

export interface DirectoryItem {
  name: string;
  phone: string;
  address: string;
  location: string;
  images: string;
  rating: string;
  type: string;
  source_file: string;
}

export interface DirectoryCategoryMeta {
  file: string;
  title: string;
  description: string;
  count: number;
  sort_order?: number;
  types: string[];
}
