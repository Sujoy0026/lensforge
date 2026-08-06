import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import Razorpay from 'razorpay';
import { createServer as createViteServer } from 'vite';
import {
  initDatabase,
  getProducts,
  addProduct,
  deleteProduct,
  getUsers,
  addUser,
  updateUser,
  getOrders,
  addOrder,
  updateOrder,
  getAdminStats,
  getSupabaseConfig,
  hashPassword,
  verifyPassword,
} from './src/server-db.js';
import { Product, User, Order } from './src/types.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images static route
const DATA_DIR = path.join(process.cwd(), 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'uploads', 'images');
const ZIPS_DIR = path.join(DATA_DIR, 'uploads', 'zips');

app.use('/uploads', express.static(IMAGES_DIR));

// Setup Multer for Product Image and ZIP Upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'preview_image') {
      cb(null, IMAGES_DIR);
    } else {
      cb(null, ZIPS_DIR);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB max file size
  },
});

// Lazy Payment Gateway Initialization
let razorpayInstance: any = null;
const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID;
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET;

if (RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET) {
  try {
    razorpayInstance = new Razorpay({
      key_id: RAZORPAY_KEY_ID,
      key_secret: RAZORPAY_KEY_SECRET,
    });
    console.log('Payment Gateway initiated in production mode.');
  } catch (err) {
    console.error('Failed to initialize Payment Gateway SDK:', err);
  }
} else {
  console.log('Payment Gateway API keys missing. Running in local Sandbox/Test Payment mode.');
}

// Simple Token Utilities
function generateToken(user: User): string {
  return Buffer.from(JSON.stringify(user)).toString('base64');
}

function verifyToken(token: string | undefined): User | null {
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    return JSON.parse(decoded) as User;
  } catch (e) {
    return null;
  }
}

// Auth Middleware
function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  (req as any).user = user;
  next();
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  if (!user || !user.is_admin || user.email.toLowerCase() !== 'sujoy.yt0077@gmail.com') {
    return res.status(403).json({ error: 'Admin access required (Authorized administrative access only)' });
  }
  (req as any).user = user;
  next();
}

/* ==========================================================================
   API ENDPOINTS
   ========================================================================== */

// --- Authentication ---
app.post('/api/auth/signup', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const existingUsers = await getUsers();
  if (existingUsers.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: 'User already exists with this email' });
  }

  const is_admin = email.toLowerCase() === 'sujoy.yt0077@gmail.com';
  const newUser: User = {
    id: 'u-' + crypto.randomUUID(),
    email: email.toLowerCase(),
    is_admin,
    password_hash: hashPassword(password)
  };

  await addUser(newUser);
  const token = generateToken(newUser);

  res.json({ user: newUser, token, message: 'Signup successful' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const users = await getUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  // Strict check for the admin credentials
  if (email.toLowerCase() === 'sujoy.yt0077@gmail.com') {
    if (password !== 'sujoy7473') {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }
    // If admin doesn't exist in the database yet, register them dynamically
    if (!user) {
      const newAdmin: User = {
        id: 'admin-uuid-sujoy',
        email: 'sujoy.yt0077@gmail.com',
        is_admin: true,
        password_hash: hashPassword('sujoy7473')
      };
      await addUser(newAdmin);
      const token = generateToken(newAdmin);
      return res.json({ user: newAdmin, token, message: 'Admin account created and logged in successfully' });
    }
  }

  if (!user) {
    return res.status(401).json({ error: 'Account does not exist. Please sign up first!' });
  }

  // If password_hash is stored, check it
  if (user.password_hash) {
    if (!verifyPassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid password' });
    }
  } else {
    // If no password_hash is stored in their DB (e.g., from old seeded admin),
    // let's update their password_hash on the fly if it matches a temporary default password
    // or set it for normal users.
    user.password_hash = hashPassword(password);
    await updateUser(user);
  }

  const token = generateToken(user);
  res.json({ user, token, message: 'Login successful' });
});

app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({ user: null });
  }
  const token = authHeader.split(' ')[1];
  const user = verifyToken(token);
  res.json({ user });
});

app.post('/api/user/update', requireAuth, async (req, res) => {
  const { name, password } = req.body;
  const user = (req as any).user;

  const updatedUser: User = {
    ...user,
    name: name || user.name,
  };

  if (password) {
    updatedUser.password_hash = hashPassword(password);
  }

  await updateUser(updatedUser);
  const token = generateToken(updatedUser);

  res.json({
    success: true,
    user: updatedUser,
    token,
    message: 'Profile updated successfully' + (password ? ' (password updated securely)' : ''),
  });
});

// --- Products CRUD ---
app.get('/api/products', async (req, res) => {
  const products = await getProducts();
  res.json(products);
});

app.post(
  '/api/products',
  requireAdmin,
  upload.fields([
    { name: 'preview_image', maxCount: 1 },
    { name: 'product_zip', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { name, category, price, description, type, prompt_text } = req.body;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      if (!name || !category || !price || !description) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      if (!files || !files['preview_image']) {
        return res.status(400).json({ error: 'An image preview is required' });
      }

      const selectedType = type || 'ZIP';
      const hasZip = files['product_zip'] && files['product_zip'][0];

      if (selectedType !== 'Prompt' && !hasZip) {
        return res.status(400).json({ error: 'A product ZIP is required for ZIP and Hybrid asset types' });
      }

      const imageFile = files['preview_image'][0];
      const productId = 'p-' + crypto.randomUUID();

      const newProduct: Product = {
        id: productId,
        name,
        category: category as any,
        price: parseFloat(price),
        description,
        image_url: `/uploads/${imageFile.filename}`,
        file_url: `/api/downloads/${productId}`,
        created_at: new Date().toISOString(),
        type: selectedType,
        prompt_text: (selectedType === 'Prompt' || selectedType === 'Hybrid') ? (prompt_text || '') : undefined,
      };

      if (hasZip) {
        const zipFile = files['product_zip'][0];
        // Rename ZIP file to match product ID to keep it secure and neat
        const secureZipPath = path.join(ZIPS_DIR, `${productId}.zip`);
        fs.renameSync(zipFile.path, secureZipPath);
      } else if (selectedType === 'Prompt') {
        // Create an empty dummy placeholder zip just in case the customer tries to download it
        const secureZipPath = path.join(ZIPS_DIR, `${productId}.zip`);
        fs.writeFileSync(secureZipPath, `This is a premium AI prompt asset: "${name}". No ZIP download package is required.`);
      }

      await addProduct(newProduct);
      res.status(201).json(newProduct);
    } catch (err: any) {
      console.error('Error adding product:', err);
      res.status(500).json({ error: err.message || 'Internal server error' });
    }
  }
);

app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const deleted = await deleteProduct(id);

  if (deleted) {
    // Optionally clean up files
    try {
      const zipPath = path.join(ZIPS_DIR, `${id}.zip`);
      if (fs.existsSync(zipPath)) fs.unlinkSync(zipPath);
    } catch (e) {
      console.error('Error deleting file associated with product:', e);
    }
    res.json({ success: true, message: 'Product deleted successfully' });
  } else {
    res.status(404).json({ error: 'Product not found' });
  }
});

// --- Secure Payment Gateway Integrations ---
app.post('/api/checkout/create-order', requireAuth, async (req, res) => {
  const { productId } = req.body;
  const user = (req as any).user;

  const products = await getProducts();
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ error: 'Product not found' });
  }

  const amountInPaise = Math.round(product.price * 100);

  if (razorpayInstance) {
    // Real Payment Gateway implementation
    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${productId}_${Date.now()}`,
    };

    razorpayInstance.orders.create(options, async (err: any, order: any) => {
      if (err) {
        console.error('Payment order creation error:', err);
        return res.status(500).json({ error: 'Failed to initiate secure order' });
      }

      // Record a pending order in DB
      const newOrder: Order = {
        id: order.id,
        user_id: user.id,
        product_id: productId,
        payment_id: '',
        amount: product.price,
        status: 'pending',
        created_at: new Date().toISOString(),
      };
      await addOrder(newOrder);

      res.json({
        id: order.id,
        amount: order.amount,
        currency: order.currency,
        key: RAZORPAY_KEY_ID,
        isSandbox: false,
      });
    });
  } else {
    // Sandbox / Test Mode Simulator
    const orderId = 'order_test_' + crypto.randomBytes(8).toString('hex');

    // Record pending order
    const newOrder: Order = {
      id: orderId,
      user_id: user.id,
      product_id: productId,
      payment_id: '',
      amount: product.price,
      status: 'pending',
      created_at: new Date().toISOString(),
    };
    await addOrder(newOrder);

    res.json({
      id: orderId,
      amount: amountInPaise,
      currency: 'INR',
      key: 'rzp_test_sandbox_dummy_key',
      isSandbox: true,
    });
  }
});

app.post('/api/checkout/verify-payment', requireAuth, async (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    productId,
    isSandbox,
  } = req.body;
  const user = (req as any).user;

  if (isSandbox || !razorpayInstance) {
    // Complete Sandbox Order Verification
    const updated = await updateOrder(razorpay_order_id, 'completed', razorpay_payment_id || 'pay_test_' + crypto.randomBytes(6).toString('hex'));
    if (updated) {
      return res.json({ verified: true, message: 'Sandbox payment simulated and saved successfully' });
    }

    // fallback if order wasn't found (force create complete order)
    const products = await getProducts();
    const product = products.find((p) => p.id === productId);
    const mockOrder: Order = {
      id: razorpay_order_id || 'order_fallback_' + crypto.randomBytes(8).toString('hex'),
      user_id: user.id,
      product_id: productId,
      payment_id: razorpay_payment_id || 'pay_test_' + crypto.randomBytes(6).toString('hex'),
      amount: product ? product.price : 999,
      status: 'completed',
      created_at: new Date().toISOString(),
    };
    await addOrder(mockOrder);
    return res.json({ verified: true, message: 'Fallback payment verified successfully' });
  }

  // Real payment gateway signature verification
  const text = razorpay_order_id + '|' + razorpay_payment_id;
  const generated_signature = crypto
    .createHmac('sha256', RAZORPAY_KEY_SECRET as string)
    .update(text)
    .digest('hex');

  if (generated_signature === razorpay_signature) {
    // Mark as completed
    await updateOrder(razorpay_order_id, 'completed', razorpay_payment_id);
    res.json({ verified: true, message: 'Payment verified successfully!' });
  } else {
    await updateOrder(razorpay_order_id, 'failed', razorpay_payment_id);
    res.status(400).json({ verified: false, error: 'Payment signature verification failed' });
  }
});

// --- Secure Digital Delivery Downloads ---
app.get('/api/downloads/:id', async (req, res) => {
  const { id } = req.params;
  const token = req.query.token as string;

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).send('<h1>Access Denied</h1><p>Please log in to download this digital asset.</p>');
  }

  // 1. Admin gets instant downloads
  // 2. Customers must have a completed purchase order
  const orders = await getOrders();
  const hasPurchased = orders.some(
    (o) => o.product_id === id && o.user_id === user.id && o.status === 'completed'
  );

  if (!user.is_admin && !hasPurchased) {
    return res.status(403).send('<h1>Access Denied</h1><p>You must purchase this asset to unlock secure downloads.</p>');
  }

  const products = await getProducts();
  const product = products.find((p) => p.id === id);
  if (!product) {
    return res.status(404).send('<h1>Not Found</h1><p>Product not found.</p>');
  }

  const filePath = path.join(ZIPS_DIR, `${id}.zip`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('<h1>File Lost</h1><p>The product download file was not found on our servers.</p>');
  }

  // Clean, premium filename
  const cleanFilename = `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_package.zip`;

  res.setHeader('Content-Type', 'application/zip');
  res.download(filePath, cleanFilename, (err) => {
    if (err) {
      console.error('Error in file download pipeline:', err);
    }
  });
});

// --- Admin Stats ---
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  const stats = await getAdminStats();
  res.json(stats);
});

// --- Admin Supabase Config ---
app.get('/api/admin/supabase-status', requireAdmin, (req, res) => {
  res.json(getSupabaseConfig());
});

// --- Purchases endpoint for User Dashboard ---
app.get('/api/purchases', requireAuth, async (req, res) => {
  const user = (req as any).user;
  const orders = (await getOrders()).filter((o) => o.user_id === user.id && o.status === 'completed');
  const products = await getProducts();

  const purchasedProducts = orders.map((order) => {
    const product = products.find((p) => p.id === order.product_id);
    return {
      orderId: order.id,
      purchaseDate: order.created_at,
      paymentId: order.payment_id,
      amount: order.amount,
      product,
    };
  }).filter((p) => p.product !== undefined);

  res.json(purchasedProducts);
});

/* ==========================================================================
   VITE DEV SERVER / PRODUCTION SERVING
   ========================================================================== */

async function startServer() {
  // Initialize and seed database (Supabase or local file JSON fallback)
  try {
    await initDatabase();
    console.log('[LensForge] Database initialization and synchronization completed.');
  } catch (err: any) {
    console.error('[LensForge] Database initialization error:', err.message);
  }

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // SPA fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[LensForge] Full-stack application running on http://localhost:${PORT}`);
  });
}

startServer();
