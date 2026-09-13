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
  _id: string;
  title: string;
  description: string;
  category: Category;
  user: User;
  location: string;
  phone?: string;
  email?: string;
  website?: string;
  image?: string;
  createdAt: string;
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  count?: number;
}
