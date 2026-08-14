import { Product, Order, ProductCategory, UserProfile } from '@/types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

const STORAGE_KEYS = {
  PRODUCTS: 'lensforge_products_app_v3',
  ORDERS: 'lensforge_orders_app_v3',
  PROFILES: 'lensforge_profiles_app_v3'
};

// INITIAL PRODUCTS (Empty by default for clean start)
export const INITIAL_PRODUCTS: Product[] = [];

// --- PRODUCTS DATA METHODS ---
export const getProducts = async (includeDrafts = false): Promise<Product[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      let query = supabase.from('products').select('*').order('created_at', { ascending: false });
      if (!includeDrafts) {
        query = query.eq('status', 'published');
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(mapSupabaseProduct);
      }
    } catch (err) {
      console.warn('Supabase fetch failed, falling back to local storage', err);
    }
  }

  // Fallback Local Storage
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed: Product[] = JSON.parse(raw);
      return includeDrafts ? parsed : parsed.filter(p => p.status === 'published');
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    return includeDrafts ? INITIAL_PRODUCTS : INITIAL_PRODUCTS.filter(p => p.status === 'published');
  } catch (e) {
    return INITIAL_PRODUCTS;
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
        price: productData.price,
        tags: productData.tags,
        thumbnail_url: productData.thumbnailUrl,
        file_url: productData.fileUrl,
        prompt_content: productData.promptContent,
        status: productData.status || 'published',
        updated_at: now
      };

      if (productData.id && !productData.id.startsWith('prod-')) {
        const { data, error } = await supabase
          .from('products')
          .update(dbPayload)
          .eq('id', productData.id)
          .select()
          .single();
        if (!error && data) return mapSupabaseProduct(data);
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert([{ ...dbPayload, created_at: now }])
          .select()
          .single();
        if (!error && data) return mapSupabaseProduct(data);
      }
    } catch (err) {
      console.warn('Supabase product save failed, falling back to local storage', err);
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (!error) return true;
    } catch (err) {
      console.warn('Supabase product delete failed', err);
    }
  }

  const products = await getProducts(true);
  const updated = products.filter(p => p.id !== id);
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(updated));
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

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage
          .from(bucket)
          .getPublicUrl(filePath);
        return publicUrlData.publicUrl;
      }
    } catch (err) {
      console.warn('Supabase upload failed, creating object URL fallback', err);
    }
  }

  // Fallback Object URL for demo mode
  return URL.createObjectURL(file);
};

// --- ORDERS DATA METHODS ---
export const getOrders = async (): Promise<Order[]> => {
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('orders').select('*, order_items(*)').order('created_at', { ascending: false });
      if (!error && data) {
        return data.map(mapSupabaseOrder);
      }
    } catch (err) {
      console.warn('Supabase orders fetch failed', err);
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
      const { data: orderData, error: orderErr } = await supabase
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
        .single();

      if (!orderErr && orderData) {
        const orderItemsPayload = items.map(item => ({
          order_id: orderData.id,
          product_id: item.product.id,
          unit_price: item.unitPrice
        }));
        await supabase.from('order_items').insert(orderItemsPayload);
        newOrder.id = orderData.id;
      }
    } catch (err) {
      console.warn('Supabase create order failed', err);
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
