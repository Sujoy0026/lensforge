/**
 * Shared Type Definitions for LensForge
 */

export type ProductCategory = 'Templates' | '3D SaaS' | 'Dashboards';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number; // in USD ($)
  description: string;
  image_url: string; // URL path or base64
  file_url: string; // download path
  created_at: string;
}

export interface User {
  id: string;
  email: string;
  is_admin: boolean;
}

export interface Order {
  id: string;
  user_id: string;
  product_id: string;
  payment_id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  created_at: string;
}

export interface AdminStats {
  totalProducts: number;
  totalSales: number;
  revenue: number;
}

export interface AuthResponse {
  user: User | null;
  token?: string;
  message?: string;
  error?: string;
}
