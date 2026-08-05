import fs from 'fs';
import path from 'path';
import { Product, User, Order } from './types.js';

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

export function initDatabase() {
  // Ensure directories exist
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  if (!fs.existsSync(IMAGES_DIR)) fs.mkdirSync(IMAGES_DIR, { recursive: true });
  if (!fs.existsSync(ZIPS_DIR)) fs.mkdirSync(ZIPS_DIR, { recursive: true });

  let db: Schema = { users: [], products: [], orders: [] };

  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf-8');
      db = JSON.parse(data);
    } catch (e) {
      console.error('Error reading DB, resetting to defaults', e);
    }
  }

  // Ensure default structure
  if (!db.users) db.users = [];
  if (!db.products) db.products = [];
  if (!db.orders) db.orders = [];

  // Seed default admin user if none exists
  if (db.users.length === 0) {
    db.users.push({
      id: 'admin-uuid',
      email: 'admin@lensforge.com',
      is_admin: true,
    });
  }

  // Seed default marketplace products if none exist
  if (db.products.length === 0) {
    db.products = [
      {
        id: 'p-quantum-dashboard',
        name: 'Quantum Dashboard UI Kit',
        category: 'Dashboards',
        price: 99,
        description: 'Sleek, premium dashboard system crafted with high contrast styling, featuring 60+ customizable React UI blocks, fluid responsive charts (Recharts), customizable layouts, and comprehensive application screens.',
        image_url: '/uploads/quantum_dashboard.png',
        file_url: '/api/downloads/p-quantum-dashboard',
        created_at: new Date().toISOString()
      },
      {
        id: 'p-aura-3d-saas',
        name: 'Aura 3D SaaS Landing Template',
        category: 'Templates',
        price: 49,
        description: 'A premium Next.js landing page template optimized for SaaS conversions. Framer Motion powered interactions, scroll-bound 3D floating mockups, dark/light transitions, and standard integration forms built-in.',
        image_url: '/uploads/aura_saas.png',
        file_url: '/api/downloads/p-aura-3d-saas',
        created_at: new Date().toISOString()
      },
      {
        id: 'p-helix-assets',
        name: 'Helix 3D Glass Asset Pack',
        category: '3D SaaS',
        price: 79,
        description: 'Set of 20 high-fidelity customizable 3D glassmorphic icons and decorative elements. Rendered in premium translucent materials, optimized for web integration and standard visual tools (Figma, PNG, OBJ).',
        image_url: '/uploads/helix_assets.png',
        file_url: '/api/downloads/p-helix-assets',
        created_at: new Date().toISOString()
      },
      {
        id: 'p-stark-admin',
        name: 'Stark Admin UI Pro',
        category: 'Dashboards',
        price: 129,
        description: 'An ultra-dense, developer-first dashboard kit featuring full Tailwind control, custom data tables, inline analytics visualization, drag-and-drop kanbans, and highly polished visual styles for SaaS controllers.',
        image_url: '/uploads/stark_admin.png',
        file_url: '/api/downloads/p-stark-admin',
        created_at: new Date().toISOString()
      },
      {
        id: 'p-vortex-landing',
        name: 'Vortex Landing Template',
        category: 'Templates',
        price: 29,
        description: 'Sleek high-converting template with pristine whitespace, premium font pairing, clean grids, and smooth reveal animations. Highly customizable and built for modern web standards.',
        image_url: '/uploads/vortex_landing.png',
        file_url: '/api/downloads/p-vortex-landing',
        created_at: new Date().toISOString()
      }
    ];

    // Seed dummy files for default seeded products so that downloads can actually work
    const dummyContent = 'Thank you for purchasing LensForge premium digital assets! This is your download package.';
    ['p-quantum-dashboard', 'p-aura-3d-saas', 'p-helix-assets', 'p-stark-admin', 'p-vortex-landing'].forEach((id) => {
      const filePath = path.join(ZIPS_DIR, `${id}.zip`);
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, `${dummyContent}\nProduct ID: ${id}\nLicense: Commercial Single Use`);
      }
    });

    // Also copy dummy visual cards to the uploads directory for elegant visual display
    // We will build elegant CSS-gradient visual placeholders if files do not exist
  }

  saveDatabase(db);
}

function saveDatabase(db: Schema) {
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
}

export function getProducts(): Product[] {
  if (!fs.existsSync(DB_FILE)) initDatabase();
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  return db.products || [];
}

export function addProduct(product: Product): void {
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  db.products.unshift(product);
  saveDatabase(db);
}

export function deleteProduct(id: string): boolean {
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const initialLength = db.products.length;
  db.products = db.products.filter((p) => p.id !== id);
  if (db.products.length !== initialLength) {
    saveDatabase(db);
    return true;
  }
  return false;
}

export function getUsers(): User[] {
  if (!fs.existsSync(DB_FILE)) initDatabase();
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  return db.users || [];
}

export function addUser(user: User): void {
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  if (!db.users.find((u) => u.email === user.email)) {
    db.users.push(user);
    saveDatabase(db);
  }
}

export function getOrders(): Order[] {
  if (!fs.existsSync(DB_FILE)) initDatabase();
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  return db.orders || [];
}

export function addOrder(order: Order): void {
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  db.orders.push(order);
  saveDatabase(db);
}

export function updateOrder(id: string, status: 'completed' | 'failed', payment_id: string): boolean {
  const db: Schema = JSON.parse(fs.readFileSync(DB_FILE, 'utf-8'));
  const orderIndex = db.orders.findIndex((o) => o.id === id);
  if (orderIndex !== -1) {
    db.orders[orderIndex].status = status;
    db.orders[orderIndex].payment_id = payment_id;
    saveDatabase(db);
    return true;
  }
  return false;
}

export function getAdminStats(): { totalProducts: number; totalSales: number; revenue: number } {
  const products = getProducts();
  const orders = getOrders().filter((o) => o.status === 'completed');
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);

  return {
    totalProducts: products.length,
    totalSales: orders.length,
    revenue,
  };
}
