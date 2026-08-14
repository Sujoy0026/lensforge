export type UserRole = 'customer' | 'admin';

export type SubscriptionTier = 'none' | 'monthly' | 'annual';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  subscriptionExpiresAt?: string;
  purchasedProductIds?: string[];
  createdAt: string;
  isVerified?: boolean;
}

export type ProductCategory = 'templates' | 'dashboards' | '3d-heroes' | 'prompts';

export type ProductStatus = 'draft' | 'published';

export interface Product {
  id: string;
  title: string;
  description: string;
  category: ProductCategory;
  price: number;
  tags: string[];
  thumbnailUrl: string;
  fileUrl?: string; // Optional ZIP / package download
  promptContent?: string; // Optional Master Prompt markdown/text
  status: ProductStatus;
  viewsCount: number;
  salesCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  unitPrice: number;
  product?: Product;
}

export interface Order {
  id: string;
  userId?: string | null;
  email: string;
  totalAmount: number;
  status: 'completed' | 'pending' | 'failed';
  licenseKey: string;
  createdAt: string;
  items: OrderItem[];
}

export interface CartItem {
  product: Product;
  quantity: number;
}
