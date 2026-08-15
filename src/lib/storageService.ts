import { Product, Order, ProductCategory, UserProfile } from '@/types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  PRODUCTS: 'lensforge_products_app_v4',
  ORDERS: 'lensforge_orders_app_v4',
  PROFILES: 'lensforge_profiles_app_v4'
};

// 8-Second Query Timeout Helper to prevent infinite hangs
const withTimeout = <T>(promise: Promise<T>, ms = 8000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`[LensForge Supabase] Request timed out after ${ms}ms`)), ms)
    )
  ]);
};

// INITIAL PRODUCTS (Empty by default so deleted sample products never respawn)
export const INITIAL_PRODUCTS: Product[] = [];

// --- PRODUCTS DATA METHODS ---
export const getProducts = async (includeDrafts = false): Promise<Product[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!includeDrafts) {
        query = query.eq('status', 'published');
      }
      
      const { data, error } = await withTimeout(query, 8000);
      
      if (error) {
        console.error('[LensForge Supabase] Products fetch error:', error);
      } else if (data) {
        // Return whatever is in the Supabase DB (including 0 items if all deleted)
        return data.map(mapSupabaseProduct);
      }
    } catch (err: any) {
      console.warn('[LensForge Supabase] Supabase fetch error or timeout, falling back gracefully:', err?.message || err);
    }
  }

  // Fallback Local Storage
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw !== null) {
      const parsed: Product[] = JSON.parse(raw);
      return includeDrafts ? parsed : parsed.filter(p => p.status === 'published');
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  const products = await getProducts(true);
  return products.find(p => p.id === id) || null;
};

export const saveProduct = async (productData: Partial<Product>): Promise<Product> => {
  const now = new Date().toISOString();

  if (isSupabaseConfigured() && supabase) {
    try {
      const dbPayload = {
        title: productData.title,
        description: productData.description,
        category: productData.category,
        price: productData.price || 0,
        tags: productData.tags,
        thumbnail_url: productData.thumbnailUrl,
        file_url: productData.fileUrl,
        prompt_content: productData.promptContent,
        status: productData.status || 'published',
        updated_at: now
      };

      if (productData.id && !productData.id.startsWith('prod-')) {
        const { data, error } = await withTimeout(
          supabase
            .from('products')
            .update(dbPayload)
            .eq('id', productData.id)
            .select()
            .single(),
          8000
        );
        if (!error && data) return mapSupabaseProduct(data);
      } else {
        const { data, error } = await withTimeout(
          supabase
            .from('products')
            .insert([{ ...dbPayload, created_at: now }])
            .select()
            .single(),
          8000
        );
        if (!error && data) return mapSupabaseProduct(data);
      }
    } catch (err) {
      console.warn('[LensForge Supabase] Product save failed, falling back to local storage:', err);
    }
  }

  // Local Storage Fallback
  const products = await getProducts(true);
  let updatedProduct: Product;

  if (productData.id) {
    const existingIndex = products.findIndex(p => p.id === productData.id);
    if (existingIndex >= 0) {
      updatedProduct = {
        ...products[existingIndex],
        ...productData,
        updatedAt: now
      } as Product;
      products[existingIndex] = updatedProduct;
    } else {
      updatedProduct = {
        id: productData.id,
        title: productData.title || 'Untitled Product',
        description: productData.description || '',
        category: productData.category || 'templates',
        price: productData.price || 0,
        tags: productData.tags || [],
        thumbnailUrl: productData.thumbnailUrl || '',
        fileUrl: productData.fileUrl,
        promptContent: productData.promptContent,
        status: productData.status || 'published',
        viewsCount: 0,
        salesCount: 0,
        createdAt: now,
        updatedAt: now
      };
      products.unshift(updatedProduct);
    }
  } else {
    updatedProduct = {
      id: `prod-${Date.now()}`,
      title: productData.title || 'Untitled Product',
      description: productData.description || '',
      category: productData.category || 'templates',
      price: productData.price || 0,
      tags: productData.tags || [],
      thumbnailUrl: productData.thumbnailUrl || '',
      fileUrl: productData.fileUrl,
      promptContent: productData.promptContent,
      status: productData.status || 'published',
      viewsCount: 0,
      salesCount: 0,
      createdAt: now,
      updatedAt: now
    };
    products.unshift(updatedProduct);
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }
  return updatedProduct;
};

export const deleteProduct = async (id: string): Promise<boolean> => {
  // 1. Delete from Supabase database
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await withTimeout(supabase.from('products').delete().eq('id', id), 8000);
      if (error) {
        console.warn('[LensForge Supabase] Product delete warning:', error);
      }
    } catch (err) {
      console.warn('[LensForge Supabase] Product delete failed:', err);
    }
  }

  // 2. Always delete from local storage as well
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      if (raw) {
        const parsed: Product[] = JSON.parse(raw);
        const updated = parsed.filter(p => p.id !== id);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
      }
    } catch (e) {
      console.warn('Local storage delete error:', e);
    }
  }

  return true;
};

export const clearAllProducts = async (): Promise<boolean> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      await withTimeout(supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000'), 8000);
    } catch (err) {
      console.warn('[LensForge Supabase] Clear all products failed:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify([]));
  }

  return true;
};

// --- FILE UPLOAD TO SUPABASE STORAGE ---
export const uploadFileToStorage = async (
  file: File, 
  bucket: 'thumbnails' | 'products'
): Promise<string> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { data, error } = await withTimeout(
        supabase.storage
          .from(bucket)
          .upload(filePath, file),
        15000
      );

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('[LensForge Supabase] Upload failed, creating object URL fallback:', err);
    }
  }

  // Fallback Object URL for demo mode
  return URL.createObjectURL(file);
};

// --- ORDERS DATA METHODS ---
export const getOrders = async (): Promise<Order[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await withTimeout(
        supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false }),
        8000
      );
      if (!error && data) {
        return data.map(mapSupabaseOrder);
      }
    } catch (err) {
      console.warn('[LensForge Supabase] Orders fetch failed:', err);
    }
  }

  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

export const createOrder = async (
  email: string,
  totalAmount: number,
  items: { product: Product; unitPrice: number }[],
  userId?: string | null
): Promise<Order> => {
  const licenseKey = `LF-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}-PRO`;
  const now = new Date().toISOString();
  const orderId = `ord-${Date.now()}`;

  const newOrder: Order = {
    id: orderId,
    userId: userId || null,
    email,
    totalAmount,
    status: 'completed',
    licenseKey,
    createdAt: now,
    items: items.map(item => ({
      id: `item-${Date.now()}-${Math.random()}`,
      orderId,
      productId: item.product.id,
      unitPrice: item.unitPrice,
      product: item.product
    }))
  };

  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: orderData, error: orderErr } = await withTimeout(
        supabase
          .from('orders')
          .insert([{
            user_id: userId || null,
            email,
            total_amount: totalAmount,
            status: 'completed',
            license_key: licenseKey,
            created_at: now
          }])
          .select()
          .single(),
        8000
      );

      if (!orderErr && orderData) {
        const orderItemsPayload = items.map(item => ({
          order_id: orderData.id,
          product_id: item.product.id,
          unit_price: item.unitPrice
        }));
        await withTimeout(supabase.from('order_items').insert(orderItemsPayload), 8000);
        newOrder.id = orderData.id;
      }
    } catch (err) {
      console.warn('[LensForge Supabase] Create order failed:', err);
    }
  }

  // Update local storage
  if (typeof window !== 'undefined') {
    const existingOrders = await getOrders();
    existingOrders.unshift(newOrder);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(existingOrders));

    // Increment sales count on products
    const products = await getProducts(true);
    items.forEach(i => {
      const p = products.find(prod => prod.id === i.product.id);
      if (p) p.salesCount += 1;
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }

  return newOrder;
};

// HELPER MAPPER FUNCTIONS FOR SUPABASE DB ROWS
function mapSupabaseProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category as ProductCategory,
    price: Number(row.price),
    tags: row.tags || [],
    thumbnailUrl: row.thumbnail_url || '',
    fileUrl: row.file_url,
    promptContent: row.prompt_content,
    status: row.status || 'published',
    viewsCount: row.views_count || 0,
    salesCount: row.sales_count || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapSupabaseOrder(row: any): Order {
  return {
    id: row.id,
    userId: row.user_id,
    email: row.email,
    totalAmount: Number(row.total_amount),
    status: row.status,
    licenseKey: row.license_key,
    createdAt: row.created_at,
    items: (row.order_items || []).map((item: any) => ({
      id: item.id,
      orderId: item.order_id,
      productId: item.product_id,
      unitPrice: Number(item.unit_price)
    }))
  };
}
