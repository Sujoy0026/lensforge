import fs from 'fs';
import path from 'path';
import { Product, User, Order } from './types.js';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

dotenv.config();

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export function verifyPassword(password: string, hash: string): boolean {
  if (!hash) return false;
  try {
    if (hash.startsWith('$2a$') || hash.startsWith('$2b$')) {
      return bcrypt.compareSync(password, hash);
    }
  } catch (e) {
    // Fallback to legacy check if bcrypt fails
  }
  const salt = 'lensforge_secure_salt_2026_prod';
  const legacyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === legacyHash;
}

const DATA_DIR = path.join(process.cwd(), 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const IMAGES_DIR = path.join(UPLOADS_DIR, 'images');
const ZIPS_DIR = path.join(UPLOADS_DIR, 'zips');
const DB_FILE = path.join(DATA_DIR, 'db.json');

interface Schema {
  users: User[];
  products: Product[];
  orders: Order[];
}

// -------------------------------------------------------------------------
// Supabase Lazy Client Setup
// -------------------------------------------------------------------------
const rawUrl = process.env.SUPABASE_URL || '';
let cleanUrl = rawUrl.trim();
if (cleanUrl.endsWith('/')) {
  cleanUrl = cleanUrl.slice(0, -1);
}
if (cleanUrl.endsWith('/rest/v1')) {
  cleanUrl = cleanUrl.substring(0, cleanUrl.length - 8);
}
if (cleanUrl.endsWith('/')) {
  cleanUrl = cleanUrl.slice(0, -1);
}

const SUPABASE_URL = cleanUrl;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || '';

let supabase: any = null;

export function isSupabaseActive(): boolean {
  if (SUPABASE_URL && SUPABASE_ANON_KEY) {
    if (!supabase) {
      try {
        supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          auth: { persistSession: false }
        });
        console.log('[Supabase] Initialized cloud-hosted client.');
      } catch (err) {
        console.error('[Supabase] Failed to instantiate SDK client:', err);
      }
    }
    return !!supabase;
  }
  return false;
}

export function getSupabaseConfig() {
  return {
    active: isSupabaseActive(),
    url: SUPABASE_URL ? `${SUPABASE_URL.substring(0, 15)}...` : '',
    hasKey: !!SUPABASE_ANON_KEY,
    schemaSql: `-- LensForge Database Setup Schema
-- Run this in your Supabase SQL Editor to provision your database tables in 5 seconds.

-- 1. Create 'users' table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    is_admin BOOLEAN DEFAULT false,
    name TEXT,
    password_hash TEXT,
    is_verified BOOLEAN DEFAULT false,
    verification_token TEXT
);

-- Note: If you already have a 'users' table created, run the following SQL commands to add security & verification:
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS password_hash TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS verification_token TEXT;

-- 2. Create 'products' table
CREATE TABLE IF NOT EXISTS public.products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price NUMERIC NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT NOT NULL,
    file_url TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    type TEXT DEFAULT 'ZIP'::text,
    prompt_text TEXT
);

-- 3. Create 'orders' table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    product_id TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
    payment_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Disable Row Level Security (RLS) for seamless integration,
-- or you can configure security policies to fit your requirements.
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
`
  };
}

// -------------------------------------------------------------------------
// Local File DB Engine (Fallback)
// -------------------------------------------------------------------------
function loadLocalDatabase(): Schema {
  let db: Schema = { users: [], products: [], orders: [] };

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
    } catch (e) {
      console.error('Error reading local DB, resetting to defaults', e);
    }
  }

  if (!db.users) db.users = [];
  if (!db.products) db.products = [];
  if (!db.orders) db.orders = [];

  return db;
}

function saveLocalDatabase(db: Schema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

// -------------------------------------------------------------------------
// Unified Database APIs (Synchronous seeding, asynchronous runtime)
// -------------------------------------------------------------------------

const defaultProducts: Product[] = [
  {
    id: 'p-quantum-dashboard',
    name: 'Quantum Dashboard UI Kit',
    category: 'Dashboards',
    price: 99,
    description: 'Sleek, premium dashboard system crafted with high contrast styling, featuring 60+ customizable React UI blocks, fluid responsive charts (Recharts), customizable layouts, and comprehensive application screens.',
    image_url: '/uploads/quantum_dashboard.png',
    file_url: '/api/downloads/p-quantum-dashboard',
    created_at: new Date().toISOString(),
    type: 'Hybrid',
    prompt_text: `system_prompt = """\\nYou are a senior frontend developer specializing in high-performance dashboard UI design.\\nAnalyze the provided layout guidelines and build a responsive React component.\\n"""\\ncomponents = ["Sidebar", "KPI_Cards", "InteractiveChart", "TransactionTable"]\\ntheme = "Dark Mode / Premium Slate"\\n`
  },
  {
    id: 'p-aura-3d-saas',
    name: 'Aura 3D SaaS Landing Template',
    category: 'Templates',
    price: 49,
    description: 'A premium Next.js landing page template optimized for SaaS conversions. Framer Motion powered interactions, scroll-bound 3D floating mockups, dark/light transitions, and standard integration forms built-in.',
    image_url: '/uploads/aura_saas.png',
    file_url: '/api/downloads/p-aura-3d-saas',
    created_at: new Date().toISOString(),
    type: 'ZIP'
  },
  {
    id: 'p-helix-assets',
    name: 'Helix 3D Glass Asset Pack',
    category: '3D SaaS',
    price: 79,
    description: 'Set of 20 high-fidelity customizable 3D glassmorphic icons and decorative elements. Rendered in premium translucent materials, optimized for web integration and standard visual tools (Figma, PNG, OBJ).',
    image_url: '/uploads/helix_assets.png',
    file_url: '/api/downloads/p-helix-assets',
    created_at: new Date().toISOString(),
    type: 'ZIP'
  },
  {
    id: 'p-stark-admin',
    name: 'Stark Admin UI Pro',
    category: 'Dashboards',
    price: 129,
    description: 'An ultra-dense, developer-first dashboard kit featuring full Tailwind control, custom data tables, inline analytics visualization, drag-and-drop kanbans, and highly polished visual styles for SaaS controllers.',
    image_url: '/uploads/stark_admin.png',
    file_url: '/api/downloads/p-stark-admin',
    created_at: new Date().toISOString(),
    type: 'ZIP'
  },
  {
    id: 'p-vortex-landing',
    name: 'Vortex Landing Template',
    category: 'Templates',
    price: 29,
    description: 'Sleek high-converting template with pristine whitespace, premium font pairing, clean grids, and smooth reveal animations. Highly customizable and built for modern web standards.',
    image_url: '/uploads/vortex_landing.png',
    file_url: '/api/downloads/p-vortex-landing',
    created_at: new Date().toISOString(),
    type: 'ZIP'
  },
  {
    id: 'p-ai-prompt-engineer',
    name: 'SaaS Generator Premium Prompt',
    category: 'Templates',
    price: 19,
    description: 'An advanced, fine-tuned System Prompt for LLMs to generate pristine, production-ready SaaS landing pages with elegant typography, mathematical padding, and modern dark mode colors.',
    image_url: '/uploads/ai_prompt_engineer.png',
    file_url: '/api/downloads/p-ai-prompt-engineer',
    created_at: new Date().toISOString(),
    type: 'Prompt',
    prompt_text: `/imagine prompt: a premium software-as-a-service application web page design, sleek minimalist dashboard, dark mode #09090b backdrop, glowing subtle indigo lines, translucent cards, 3D clay render spheres floating, high fidelity design, shot on 35mm lens, 8k resolution, photorealistic, cinematic lighting --ar 16:9 --v 6.0`
  }
];

export async function initDatabase() {
  // Ensure local directories exist
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  if (!fs.existsSync(ZIPS_DIR)) fs.mkdirSync(ZIPS_DIR, { recursive: true });

  // 1. Initial Local JSON DB Setup
  let localDb = loadLocalDatabase();
  let localSaved = false;

  const hasLocalAdmin = localDb.users.some(u => u.email.toLowerCase() === 'sujoy.yt0077@gmail.com');
  if (!hasLocalAdmin) {
    localDb.users.push({
      id: 'admin-uuid-sujoy',
      email: 'sujoy.yt0077@gmail.com',
      is_admin: true,
      name: 'Sujoy Admin',
      password_hash: hashPassword('sujoy7473'),
      is_verified: true
    });
    localSaved = true;
  } else {
    // Ensure existing local admin has is_verified = true
    const localAdmin = localDb.users.find(u => u.email.toLowerCase() === 'sujoy.yt0077@gmail.com');
    if (localAdmin && !localAdmin.is_verified) {
      localAdmin.is_verified = true;
      localSaved = true;
    }
  }

  if (localDb.products.length === 0) {
    localDb.products = defaultProducts;
    localSaved = true;
  }

  if (localSaved) {
    saveLocalDatabase(localDb);
  }

  // Ensure default download zip binaries exist on Disk (required for both configurations)
  const dummyContent = 'Thank you for purchasing LensForge premium digital assets! This is your download package.';
  defaultProducts.forEach((p) => {
    const filePath = path.join(ZIPS_DIR, `${p.id}.zip`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, `${dummyContent}\nProduct ID: ${p.id}\nLicense: Commercial Single Use`);
    }
  });

  // 2. Initial Supabase Cloud Seeding
  if (isSupabaseActive()) {
    try {
      console.log('[Supabase] Synchronizing database tables and checking seed status...');

      // Check users table
      const { data: users, error: usersErr } = await supabase.from('users').select('*');
      if (usersErr) {
        console.warn('[Supabase] Could not query "users" table. Please run migration schema in Supabase console:', usersErr.message);
      } else {
        const hasCloudAdmin = users && users.some((u: any) => u.email.toLowerCase() === 'sujoy.yt0077@gmail.com');
        if (!hasCloudAdmin) {
          console.log('[Supabase] Seeding default admin user: sujoy.yt0077@gmail.com...');
          const adminPayload: any = {
            id: 'admin-uuid-sujoy',
            email: 'sujoy.yt0077@gmail.com',
            is_admin: true,
            name: 'Sujoy Admin',
            password_hash: hashPassword('sujoy7473'),
            is_verified: true
          };
          
          let { error: seedUserErr } = await supabase.from('users').insert([adminPayload]);
          if (seedUserErr) {
            console.warn('[Supabase] Seeding with verification failed. Trying with basic payload...');
            const fallbackPayload: any = {
              id: 'admin-uuid-sujoy',
              email: 'sujoy.yt0077@gmail.com',
              is_admin: true,
              name: 'Sujoy Admin',
            };
            if (adminPayload.password_hash) {
              fallbackPayload.password_hash = adminPayload.password_hash;
            }
            const { error: fallbackSeedErr } = await supabase.from('users').insert([fallbackPayload]);
            if (fallbackSeedErr) {
              console.error('[Supabase] Failed to seed default admin user fallback:', fallbackSeedErr.message);
            } else {
              console.log('[Supabase] Default admin user seeded successfully (fallback, basic columns).');
            }
          } else {
            console.log('[Supabase] Default admin user sujoy.yt0077@gmail.com seeded successfully with full security and verification.');
          }
        }
      }

      // Check products table
      const { data: products, error: productsErr } = await supabase.from('products').select('*');
      if (productsErr) {
        console.warn('[Supabase] Could not query "products" table. Please run migration schema in Supabase console:', productsErr.message);
      } else if (products && products.length === 0) {
        console.log('[Supabase] Seeding default marketplace catalog products...');
        const mappedProducts = defaultProducts.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          price: p.price,
          description: p.description,
          image_url: p.image_url,
          file_url: p.file_url,
          created_at: p.created_at,
          type: p.type || 'ZIP',
          prompt_text: p.prompt_text || null
        }));
        const { error: seedProductsErr } = await supabase.from('products').insert(mappedProducts);
        if (seedProductsErr) {
          console.error('[Supabase] Failed to seed default products:', seedProductsErr.message);
        } else {
          console.log('[Supabase] Default products seeded successfully.');
        }
      }
    } catch (e: any) {
      console.error('[Supabase] Auto-seeding synchronizer failed:', e.message);
    }
  }
}

// --- Product APIs ---
export async function getProducts(): Promise<Product[]> {
  if (isSupabaseActive()) {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Product[];
    } catch (err: any) {
      console.error('[Supabase] Error in getProducts query, serving local database:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  return localDb.products;
}

export async function addProduct(product: Product): Promise<void> {
  if (isSupabaseActive()) {
    try {
      const { error } = await supabase
        .from('products')
        .insert([{
          id: product.id,
          name: product.name,
          category: product.category,
          price: product.price,
          description: product.description,
          image_url: product.image_url,
          file_url: product.file_url,
          created_at: product.created_at,
          type: product.type || 'ZIP',
          prompt_text: product.prompt_text || null
        }]);

      if (error) throw error;
      console.log(`[Supabase] Successfully inserted product: "${product.name}"`);
      return;
    } catch (err: any) {
      console.error('[Supabase] Error adding product, updating local database instead:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  localDb.products.unshift(product);
  saveLocalDatabase(localDb);
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (isSupabaseActive()) {
    try {
      const { error, status } = await supabase
        .from('products')
        .delete()
        .eq('id', id);

      if (error) throw error;
      console.log(`[Supabase] Successfully deleted product: ${id}`);
      return true;
    } catch (err: any) {
      console.error('[Supabase] Error deleting product, updating local database instead:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  const initialLength = localDb.products.length;
  localDb.products = localDb.products.filter((p) => p.id !== id);
  if (localDb.products.length !== initialLength) {
    saveLocalDatabase(localDb);
    return true;
  }
  return false;
}

// --- User APIs ---
export async function getUsers(): Promise<User[]> {
  if (isSupabaseActive()) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*');

      if (error) throw error;
      return (data || []) as User[];
    } catch (err: any) {
      console.error('[Supabase] Error in getUsers query, serving local database:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  return localDb.users;
}

export async function addUser(user: User): Promise<void> {
  if (isSupabaseActive()) {
    try {
      const payload: any = {
        id: user.id,
        email: user.email,
        is_admin: user.is_admin,
        name: user.name || null
      };
      if (user.password_hash) {
        payload.password_hash = user.password_hash;
      }
      if (user.is_verified !== undefined) {
        payload.is_verified = user.is_verified;
      }
      if (user.verification_token !== undefined) {
        payload.verification_token = user.verification_token;
      }

      const { error } = await supabase
        .from('users')
        .insert([payload]);

      if (error) {
        // If password_hash, is_verified, or verification_token columns do not exist in users table yet, fallback and try inserting with only core columns
        const isColumnError = error.code === '42703' || (error.message && (
          error.message.includes('password_hash') || 
          error.message.includes('is_verified') || 
          error.message.includes('verification_token')
        ));
        if (isColumnError) {
          console.warn('[Supabase] Advanced columns not found. Retrying adding user with basic columns...');
          const fallbackPayload: any = {
            id: user.id,
            email: user.email,
            is_admin: user.is_admin,
            name: user.name || null
          };
          if (user.password_hash) {
            fallbackPayload.password_hash = user.password_hash;
          }
          const { error: retryError } = await supabase
            .from('users')
            .insert([fallbackPayload]);
          
          if (retryError) {
            // Absolute minimal fallback
            console.warn('[Supabase] Retrying adding user with absolute minimal columns...');
            const { error: minimalError } = await supabase
              .from('users')
              .insert([{
                id: user.id,
                email: user.email,
                is_admin: user.is_admin,
                name: user.name || null
              }]);
            if (minimalError) throw minimalError;
          }
        } else {
          throw error;
        }
      }
      
      console.log(`[Supabase] Successfully added user: "${user.email}"`);
      return;
    } catch (err: any) {
      console.error('[Supabase] Error adding user, updating local database instead:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  if (!localDb.users.find((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    localDb.users.push(user);
    saveLocalDatabase(localDb);
  }
}

export async function updateUser(updatedUser: User): Promise<void> {
  if (isSupabaseActive()) {
    try {
      const updateData: any = {
        name: updatedUser.name || null,
        is_admin: updatedUser.is_admin
      };
      if (updatedUser.password_hash) {
        updateData.password_hash = updatedUser.password_hash;
      }
      if (updatedUser.is_verified !== undefined) {
        updateData.is_verified = updatedUser.is_verified;
      }
      if (updatedUser.verification_token !== undefined) {
        updateData.verification_token = updatedUser.verification_token;
      }

      let { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('id', updatedUser.id);

      const isColumnError = error && (error.code === '42703' || (error.message && (
        error.message.includes('password_hash') || 
        error.message.includes('is_verified') || 
        error.message.includes('verification_token')
      )));

      if (isColumnError) {
        console.warn('[Supabase] Advanced columns not found on updateUser. Retrying with basic columns...');
        const retryData: any = {
          name: updatedUser.name || null,
          is_admin: updatedUser.is_admin
        };
        if (updatedUser.password_hash) {
          retryData.password_hash = updatedUser.password_hash;
        }
        const { error: retryError } = await supabase
          .from('users')
          .update(retryData)
          .eq('id', updatedUser.id);
        
        if (retryError) {
          // Retry with absolute minimum columns
          const { error: minimalError } = await supabase
            .from('users')
            .update({
              name: updatedUser.name || null,
              is_admin: updatedUser.is_admin
            })
            .eq('id', updatedUser.id);
          error = minimalError;
        } else {
          error = null;
        }
      }

      if (error) throw error;
      console.log(`[Supabase] Successfully updated user: "${updatedUser.email}"`);
      return;
    } catch (err: any) {
      console.error('[Supabase] Error updating user, updating local database instead:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  const idx = localDb.users.findIndex((u) => u.id === updatedUser.id);
  if (idx !== -1) {
    localDb.users[idx] = { ...localDb.users[idx], ...updatedUser };
    saveLocalDatabase(localDb);
  }
}

// --- Order APIs ---
export async function getOrders(): Promise<Order[]> {
  if (isSupabaseActive()) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as Order[];
    } catch (err: any) {
      console.error('[Supabase] Error in getOrders query, serving local database:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  return localDb.orders;
}

export async function addOrder(order: Order): Promise<void> {
  if (isSupabaseActive()) {
    try {
      const { error } = await supabase
        .from('orders')
        .insert([{
          id: order.id,
          user_id: order.user_id,
          product_id: order.product_id,
          amount: order.amount,
          status: order.status,
          payment_id: order.payment_id || null,
          created_at: order.created_at
        }]);

      if (error) throw error;
      console.log(`[Supabase] Successfully added order: "${order.id}"`);
      return;
    } catch (err: any) {
      console.error('[Supabase] Error adding order, updating local database instead:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  localDb.orders.push(order);
  saveLocalDatabase(localDb);
}

export async function updateOrder(id: string, status: 'completed' | 'failed', payment_id: string): Promise<boolean> {
  if (isSupabaseActive()) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status,
          payment_id: payment_id || null
        })
        .eq('id', id);

      if (error) throw error;
      console.log(`[Supabase] Successfully updated order status: "${id}" to ${status}`);
      return true;
    } catch (err: any) {
      console.error('[Supabase] Error updating order, updating local database instead:', err.message);
    }
  }

  // Local fallback
  const localDb = loadLocalDatabase();
  const orderIndex = localDb.orders.findIndex((o) => o.id === id);
  if (orderIndex !== -1) {
    localDb.orders[orderIndex].status = status;
    localDb.orders[orderIndex].payment_id = payment_id;
    saveLocalDatabase(localDb);
    return true;
  }
  return false;
}

export async function getAdminStats(): Promise<{ totalProducts: number; totalSales: number; revenue: number }> {
  const products = await getProducts();
  const orders = (await getOrders()).filter((o) => o.status === 'completed');
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return {
    totalProducts: products.length,
    totalSales: orders.length,
    revenue,
  };
}
