import { z } from 'zod';

// ─── Database Types ──────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  icon: string | null;
  level: number;
  sort_order: number;
  created_at: string;
  // populated
  children?: Category[];
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  category_id: string;
  user_id: string | null;
  location: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  image: string | null;
  created_at: string;
  // Joined fields
  category?: Category;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
}

// ─── API Response ────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
  message?: string;
}

// ─── Zod Schemas ─────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, 'Name is required').max(50),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const createListingSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(1).max(500),
  category_id: z.string().uuid(),
  location: z.string().min(1),
  phone: z.string().max(20).optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  image: z.string().url().optional(),
});

export const updateListingSchema = createListingSchema.partial();

export const createCategorySchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional().nullable(),
  parent_id: z.string().uuid().nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  level: z.number().int().min(0).max(5).optional(),
  sort_order: z.number().int().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
