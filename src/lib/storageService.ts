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

// INITIAL SEED PRODUCTS (High quality studio assets so the catalog is never stuck/empty)
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-nexus-saas-starter',
    title: 'Nexus SaaS — Multi-Tenant Next.js 15 Boilerplate',
    description: 'Production-ready SaaS boilerplate with Supabase Auth, PostgreSQL RLS, multi-tenant team workspaces, and dark telemetry dashboard.',
    category: 'templates',
    price: 49.00,
    tags: ['Next.js 15', 'TypeScript', 'Tailwind', 'Supabase', 'SaaS'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileUrl: 'https://twojvapofapmqpgptfgz.supabase.co/storage/v1/object/public/products/nexus-saas-starter.zip',
    promptContent: `# NEXUS SAAS STARTER INSTRUCTIONS
1. Unzip the package: \`unzip nexus-saas-starter.zip\`
2. Install dependencies: \`npm install\`
3. Run migrations in Supabase SQL editor: \`schema.sql\`
4. Start local development server: \`npm run dev\``,
    status: 'published',
    viewsCount: 1420,
    salesCount: 89,
    createdAt: '2026-08-10T10:00:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z'
  },
  {
    id: 'prod-nextjs-architect-prompt',
    title: 'Full-Stack Next.js 15 Master Architect Prompt',
    description: 'Battle-tested LLM system prompt engineered to output strict type-safe App Router architecture, zero-layout-shift hydration, and secure Server Actions.',
    category: 'prompts',
    price: 19.00,
    tags: ['LLM Prompt', 'Architecture', 'Next.js', 'Claude', 'GPT-4'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    promptContent: `# ROLE: Senior Full-Stack Next.js Architect
You write strict, idiomatic TypeScript with Next.js 15 App Router.
You prioritize:
1. Zero unnecessary client components (Server Components by default).
2. Bulletproof Error Boundaries & Suspense streaming.
3. Cryptographically secure server actions with Zod validation.
4. Tailwind CSS v4 styling with dark mode tokens.

Always output production-ready code with complete imports and clean documentation.`,
    status: 'published',
    viewsCount: 2890,
    salesCount: 214,
    createdAt: '2026-08-11T11:00:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z'
  },
  {
    id: 'prod-vanguard-financial-dashboard',
    title: 'Vanguard — High-Frequency Analytics & UI Kit',
    description: 'Dark-mode financial telemetry suite with real-time MRR meters, transaction ledgers, typography-led tables, and exportable charts.',
    category: 'dashboards',
    price: 39.00,
    tags: ['Dashboard', 'Tailwind CSS', 'Analytics', 'FinTech', 'Charts'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
    fileUrl: 'https://twojvapofapmqpgptfgz.supabase.co/storage/v1/object/public/products/vanguard-dashboard.zip',
    promptContent: `# VANGUARD DASHBOARD SETUP
- Built with React 19 & Tailwind CSS v4
- Copy components into your \`/components/dashboard\` directory
- Import and pass metrics payload to <RevenueTelemetry data={liveData} />`,
    status: 'published',
    viewsCount: 1750,
    salesCount: 112,
    createdAt: '2026-08-12T09:30:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z'
  },
  {
    id: 'prod-hypersphere-3d-scene',
    title: 'HyperSphere — WebGL Three.js Kinetic Glass Hero',
    description: 'Customizable Three.js shader scene featuring an interactive iridescent glass polyhedron with cursor-responsive particle field.',
    category: '3d-heroes',
    price: 29.00,
    tags: ['Three.js', 'WebGL', '3D Shader', 'Canvas', 'Interactive'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    fileUrl: 'https://twojvapofapmqpgptfgz.supabase.co/storage/v1/object/public/products/hypersphere-3d.zip',
    promptContent: `# THREE.JS HYPERSPHERE INTEGRATION
Import the <HyperSphereCanvas /> component and place it inside your hero layout.
Custom uniforms:
- uSpeed: Controls rotation velocity (default: 0.8)
- uFresnelPower: Adjusts iridescent glass edge glow (default: 2.5)`,
    status: 'published',
    viewsCount: 3100,
    salesCount: 178,
    createdAt: '2026-08-12T14:15:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z'
  },
  {
    id: 'prod-refactor-system-prompt',
    title: 'Code Refactoring & Zero-Bloat Audit Agent Prompt',
    description: 'Structured prompt for Claude 3.7 & GPT-4o to eliminate dead code, optimize bundle sizes, and convert legacy React components to React 19.',
    category: 'prompts',
    price: 15.00,
    tags: ['Prompt', 'Refactoring', 'React 19', 'Optimization'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    promptContent: `# ROLE: Zero-Bloat Codebase Auditor
Perform an exhaustive code quality audit.
1. Remove all unused imports, dead variables, and redundant state.
2. Eliminate unnecessary re-renders using immutable patterns.
3. Optimize TypeScript types to reduce compilation latency.`,
    status: 'published',
    viewsCount: 1980,
    salesCount: 94,
    createdAt: '2026-08-13T08:00:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z'
  },
  {
    id: 'prod-pulse-agency-starter',
    title: 'Pulse — Minimalist Studio & Portfolio Starter',
    description: 'High-contrast editorial portfolio theme with fluid typography, case study ledger, MDX blog, and smooth scroll transitions.',
    category: 'templates',
    price: 29.00,
    tags: ['Portfolio', 'Next.js', 'Editorial', 'MDX', 'Tailwind'],
    thumbnailUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    fileUrl: 'https://twojvapofapmqpgptfgz.supabase.co/storage/v1/object/public/products/pulse-agency.zip',
    promptContent: `# PULSE AGENCY THEME SETUP
Run: \`npm install\` then \`npm run dev\`.
Configure your brand identity in \`src/config/site.ts\`.`,
    status: 'published',
    viewsCount: 1620,
    salesCount: 76,
    createdAt: '2026-08-13T16:00:00.000Z',
    updatedAt: '2026-08-14T12:00:00.000Z'
  }
];

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
      } else if (data && data.length > 0) {
        return data.map(mapSupabaseProduct);
      }
    } catch (err: any) {
      console.warn('[LensForge Supabase] Supabase fetch error or timeout, falling back gracefully:', err?.message || err);
    }
  }

  // Fallback Local Storage & Seed Products
  if (typeof window === 'undefined') return INITIAL_PRODUCTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    if (raw) {
      const parsed: Product[] = JSON.parse(raw);
      if (parsed.length > 0) {
        return includeDrafts ? parsed : parsed.filter(p => p.status === 'published');
      }
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
  if (isSupabaseConfigured() && supabase) {
    try {
      const { error } = await withTimeout(supabase.from('products').delete().eq('id', id), 8000);
      if (!error) return true;
    } catch (err) {
      console.warn('[LensForge Supabase] Product delete failed:', err);
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
