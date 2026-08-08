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
  isSupabaseActive,
  getSupabaseClient,
  getSupabaseServiceClient,
} from './src/server-db.js';
import { Product, User, Order } from './src/types.js';
import { sendVerificationEmail } from './src/server-mailer.js';

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded images static route
const DATA_DIR = path.join(process.cwd(), 'data');
const IMAGES_DIR = path.join(DATA_DIR, 'uploads', 'images');
const ZIPS_DIR = path.join(DATA_DIR, 'uploads', 'zips');
const LOG_FILE = path.join(DATA_DIR, 'server.log');

// Setup detailed file logger helper
function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logLine = `[${timestamp}] ${message}\n`;
  console.log(logLine.trim());
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.appendFileSync(LOG_FILE, logLine, 'utf-8');
  } catch (err) {
    // Fail silently to avoid interrupting the server
  }
}

// Request and Response Logger Interceptor
app.use((req, res, next) => {
  logToFile(`Incoming request: ${req.method} ${req.url}`);
  
  const start = Date.now();
  const originalJson = res.json;
  res.json = function (body) {
    const duration = Date.now() - start;
    logToFile(`Response JSON [${res.statusCode}] (${duration}ms) for ${req.method} ${req.url} - body: ${JSON.stringify(body).substring(0, 300)}`);
    return originalJson.call(this, body);
  };

  const originalSend = res.send;
  res.send = function (body) {
    const duration = Date.now() - start;
    if (typeof body === 'string' && (body.includes('<!DOCTYPE') || body.includes('<html>'))) {
      logToFile(`Response HTML [${res.statusCode}] (${duration}ms) for ${req.method} ${req.url} - starts with: ${body.substring(0, 200).replace(/\s+/g, ' ')}`);
    } else {
      logToFile(`Response Send [${res.statusCode}] (${duration}ms) for ${req.method} ${req.url}`);
    }
    return originalSend.call(this, body);
  };

  next();
});

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

// Dynamic App URL Helper
function getAppUrl(req: express.Request): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/$/, '');
  }
  const host = req.get('host') || 'localhost:3000';
  const protocol = req.headers['x-forwarded-proto'] === 'https' || req.protocol === 'https' ? 'https' : 'http';
  return `${protocol}://${host}`;
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
  if (!user || !user.is_admin || !user.email || user.email.toLowerCase() !== 'sujoy.yt0077@gmail.com') {
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
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ error: 'Email must be a non-empty string' });
    }

    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password must be a non-empty string' });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUsers = await getUsers();
    if (
      existingUsers.find((u) => u.email && u.email.toLowerCase() === normalizedEmail)
    ) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    const is_admin = normalizedEmail === 'sujoy.yt0077@gmail.com';
    const isVerifiedByAdmin = is_admin;

    if (isSupabaseActive()) {
      const supabase = getSupabaseClient();

      // IMPORTANT: if this fails, stop. Do not proceed with custom user creation
      let signUpUser = null;
      let signUpError = null;
      let autoConfirmed = false;

      try {
        const { data, error } = await supabase.auth.signUp({
          email: normalizedEmail,
          password,
        });
        signUpUser = data?.user ?? null;
        signUpError = error;
      } catch (err: any) {
        signUpError = err;
      }

      // If signUp fails with "Error sending confirmation email", retry with admin client and auto-confirm
      const isSmtpError = signUpError && (
        signUpError.message === 'Error sending confirmation email' || 
        signUpError.message?.toLowerCase().includes('confirmation email')
      );

      if (isSmtpError) {
        console.log('[Signup] Supabase signup returned email confirmation error. Retrying with admin client...');
        const supabaseServiceClient = getSupabaseServiceClient();
        if (supabaseServiceClient) {
          try {
            // First, check if the user was actually created in Supabase Auth despite the SMTP failure
            const { data: listData, error: listError } = await supabaseServiceClient.auth.admin.listUsers();
            if (!listError && listData?.users) {
              const existingAuthUser = listData.users.find(u => u.email?.toLowerCase() === normalizedEmail);
              if (existingAuthUser) {
                if (!existingAuthUser.email_confirmed_at) {
                  console.log(`[Signup] Found partially-created unconfirmed user "${existingAuthUser.id}" in auth.users. Marking email as confirmed...`);
                  const { data: updateData, error: updateError } = await supabaseServiceClient.auth.admin.updateUserById(
                    existingAuthUser.id,
                    { email_confirm: true }
                  );
                  if (!updateError && updateData?.user) {
                    signUpUser = updateData.user;
                    signUpError = null;
                    autoConfirmed = true;
                  } else if (updateError) {
                    console.error('[Signup Admin Update Error]:', updateError.message);
                    signUpError = updateError;
                  }
                } else {
                  console.log(`[Signup] Found partially-created already-confirmed user "${existingAuthUser.id}". Proceeding...`);
                  signUpUser = existingAuthUser;
                  signUpError = null;
                  autoConfirmed = true;
                }
              }
            }

            // If the user was NOT partially created, create them fresh with auto-confirm
            if (signUpError && !signUpUser) {
              const adminResult = await supabaseServiceClient.auth.admin.createUser({
                email: normalizedEmail,
                password: password,
                email_confirm: true
              });
              if (!adminResult.error && adminResult.data?.user) {
                signUpUser = adminResult.data.user;
                signUpError = null;
                autoConfirmed = true;
              } else if (adminResult.error) {
                // If it fails with "Email already registered" because of race conditions, try to fetch the user again
                const isConflict = adminResult.error.message?.toLowerCase().includes('already') || 
                                   adminResult.error.status === 422 || 
                                   adminResult.error.code === 'email_exists';
                if (isConflict) {
                  console.log('[Signup] Admin create conflict. Fetching user again...');
                  const { data: secondList } = await supabaseServiceClient.auth.admin.listUsers();
                  const fallbackUser = secondList?.users?.find(u => u.email?.toLowerCase() === normalizedEmail);
                  if (fallbackUser) {
                    if (!fallbackUser.email_confirmed_at) {
                      // Try to confirm it
                      const { data: confirmData } = await supabaseServiceClient.auth.admin.updateUserById(
                        fallbackUser.id,
                        { email_confirm: true }
                      );
                      signUpUser = confirmData?.user || fallbackUser;
                    } else {
                      signUpUser = fallbackUser;
                    }
                    signUpError = null;
                    autoConfirmed = true;
                  } else {
                    signUpError = adminResult.error;
                  }
                } else {
                  console.error('[Signup Admin Retry Error]:', adminResult.error.message);
                  signUpError = adminResult.error;
                }
              }
            }
          } catch (adminErr: any) {
            console.error('[Signup Admin Retry Exception]:', adminErr?.message ?? adminErr);
          }
        }
      }

      if (signUpError || !signUpUser) {
        // Don’t bypass errors here in production—your flow will be inconsistent.
        return res.status(400).json({
          error: signUpError?.message ?? 'Supabase signup failed',
        });
      }

      const supabaseUserId = signUpUser.id; // this is what you should store in orders/user_id mapping

      const isVerified = (signUpUser.email_confirmed_at || autoConfirmed) ? true : isVerifiedByAdmin;
      
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const isVerifiedSupported = existingUsers.length === 0 || ('is_verified' in existingUsers[0]);

      const newUser: User = {
        id: supabaseUserId,
        email: normalizedEmail,
        is_admin,
        password_hash: hashPassword(password),
        is_verified: isVerified || !isVerifiedSupported,
        verification_token: (isVerified || !isVerifiedSupported) ? undefined : verificationToken,
      };

      await addUser(newUser);

      if (newUser.is_verified || !isVerifiedSupported) {
        const token = generateToken(newUser);
        return res.status(200).json({
          success: true,
          userId: supabaseUserId,
          verified: isVerified,
          user: { id: newUser.id, email: newUser.email, is_admin: newUser.is_admin, is_verified: true },
          token,
          message: is_admin ? 'Signup successful! Welcome Admin.' : 'Signup successful! Welcome to LensForge.'
        });
      }

      // Generate verification link
      const appUrl = getAppUrl(req);
      const verificationLink = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

      const mailResult = await sendVerificationEmail({
        email: newUser.email,
        verificationLink,
      });

      return res.status(200).json({
        success: true,
        userId: supabaseUserId,
        verified: isVerified,
        user: { id: newUser.id, email: newUser.email, is_admin: newUser.is_admin, is_verified: false },
        message: 'Signup successful! Please check your inbox for a verification email to activate your account.',
        is_simulated: mailResult.simulated || !mailResult.success,
        verification_link_simulated: (mailResult.simulated || !mailResult.success) ? verificationLink : null,
        mail_error: mailResult.success ? null : mailResult.error
      });
    }

    // If Supabase is inactive, fall back to your custom system
    const userId = 'u-' + crypto.randomUUID();
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const isVerifiedSupported = existingUsers.length === 0 || ('is_verified' in existingUsers[0]);

    const newUser: User = {
      id: userId,
      email: normalizedEmail,
      is_admin,
      password_hash: hashPassword(password),
      is_verified: isVerifiedByAdmin || !isVerifiedSupported, // Auto-verify if database schema doesn't support the is_verified column
      verification_token: (isVerifiedByAdmin || !isVerifiedSupported) ? undefined : verificationToken,
    };

    await addUser(newUser);

    if (newUser.is_verified || !isVerifiedSupported) {
      const token = generateToken(newUser);
      return res.json({ 
        user: { id: newUser.id, email: newUser.email, is_admin: newUser.is_admin, is_verified: true }, 
        token, 
        message: is_admin ? 'Signup successful! Welcome Admin.' : 'Signup successful! Welcome to LensForge.' 
      });
    }

    // Generate verification link
    const appUrl = getAppUrl(req);
    const verificationLink = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

    const mailResult = await sendVerificationEmail({
      email: newUser.email,
      verificationLink,
    });

    return res.json({
      user: { id: newUser.id, email: newUser.email, is_admin: newUser.is_admin, is_verified: false },
      message: 'Signup successful! Please check your inbox for a verification email to activate your account.',
      is_simulated: mailResult.simulated || !mailResult.success,
      verification_link_simulated: (mailResult.simulated || !mailResult.success) ? verificationLink : null,
      mail_error: mailResult.success ? null : mailResult.error
    });

  } catch (err: any) {
    console.error('[Signup Route Error]:', err?.message ?? err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ error: 'Email must be a non-empty string' });
    }

    if (typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ error: 'Password must be a non-empty string' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const isMasterAdmin = trimmedEmail === 'sujoy.yt0077@gmail.com' && password === 'sujoy7473';
    if (trimmedEmail === 'sujoy.yt0077@gmail.com' && !isMasterAdmin) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    let supabaseUser: any = null;
    let useSupabaseAuth = false;

    // Master admin override bypasses Supabase Auth to ensure immediate system entry
    if (isSupabaseActive() && !isMasterAdmin) {
      try {
        const supabase = getSupabaseClient();
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.toLowerCase(),
          password: password,
        });

        if (data && data.user && !error) {
          supabaseUser = data.user;
          useSupabaseAuth = true;
        } else {
          console.log(`[Supabase Auth Login] Failed or bypassed for ${email}: ${error?.message || 'No user session returned'}. Attempting database record credential match.`);
        }
      } catch (err: any) {
        console.error('[Supabase Auth Login Error]:', err.message);
      }
    }

    const users = await getUsers();
    let user = users.find((u) => u.email && u.email.toLowerCase() === email.toLowerCase());

    if (useSupabaseAuth && supabaseUser) {
      if (!user) {
        user = {
          id: supabaseUser.id,
          email: supabaseUser.email || email.toLowerCase(),
          is_admin: email.toLowerCase() === 'sujoy.yt0077@gmail.com',
          password_hash: hashPassword(password),
          is_verified: supabaseUser.email_confirmed_at ? true : (email.toLowerCase() === 'sujoy.yt0077@gmail.com'),
        };
        await addUser(user);
      } else {
        let changed = false;
        if (!user.is_verified && supabaseUser.email_confirmed_at) {
          user.is_verified = true;
          changed = true;
        }
        if (changed) {
          await updateUser(user);
        }
      }
    } else {
      if (email.toLowerCase() === 'sujoy.yt0077@gmail.com' && !user) {
        const newAdmin: User = {
          id: 'admin-uuid-sujoy',
          email: 'sujoy.yt0077@gmail.com',
          is_admin: true,
          password_hash: hashPassword('sujoy7473'),
          is_verified: true,
        };
        await addUser(newAdmin);
        user = newAdmin;
      }

      if (!user) {
        return res.status(401).json({ error: 'Account does not exist. Please sign up first!' });
      }

      if (user.password_hash) {
        if (!verifyPassword(password, user.password_hash)) {
          return res.status(401).json({ error: 'Invalid password' });
        }
      } else {
        user.password_hash = hashPassword(password);
        await updateUser(user);
      }
    }

    const isVerifiedSupported = 'is_verified' in user;
    if (isVerifiedSupported && !user.is_verified && (!user.email || user.email.toLowerCase() !== 'sujoy.yt0077@gmail.com')) {
      const verificationToken = user.verification_token || crypto.randomBytes(32).toString('hex');
      if (!user.verification_token) {
        user.verification_token = verificationToken;
        await updateUser(user);
      }

      const appUrl = getAppUrl(req);
      const verificationLink = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

      const mailResult = await sendVerificationEmail({
        email: user.email,
        verificationLink,
      });

      return res.status(403).json({
        error: 'Please verify your email address to log in.',
        is_unverified: true,
        email: user.email,
        is_simulated: mailResult.simulated || !mailResult.success,
        verification_link_simulated: verificationLink,
        mail_error: mailResult.success ? null : mailResult.error
      });
    }

    if (user.email && user.email.toLowerCase() === 'sujoy.yt0077@gmail.com') {
      user.is_verified = true;
    }

    const token = generateToken(user);
    res.json({ user, token, message: 'Login successful' });
  } catch (err: any) {
    console.error('[Login Endpoint Exception]:', err);
    res.status(500).json({ error: 'Internal server error during login', details: err.message || String(err) });
  }
});

app.get('/api/auth/verify-email', async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
          <h1 style="color: #dc2626;">Verification Token is Missing</h1>
          <p style="color: #4b5563;">Please check your link and try again.</p>
          <a href="/" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Return to LensForge</a>
        </div>
      `);
    }

    const users = await getUsers();
    const user = users.find((u) => u.verification_token === token);

    if (!user) {
      return res.status(400).send(`
        <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
          <h1 style="color: #dc2626;">Invalid or Expired Verification Link</h1>
          <p style="color: #4b5563;">This verification link may have expired or already been used.</p>
          <a href="/" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Return to LensForge</a>
        </div>
      `);
    }

    user.is_verified = true;
    user.verification_token = undefined;
    await updateUser(user);

    const appUrl = getAppUrl(req);
    res.redirect(`${appUrl}/?verified=true`);
  } catch (err: any) {
    console.error('[Verify Email Exception]:', err);
    res.status(500).send(`
      <div style="font-family: sans-serif; text-align: center; margin-top: 100px;">
        <h1 style="color: #dc2626;">Verification Failed</h1>
        <p style="color: #4b5563;">An internal server error occurred during email verification. Error: ${err.message || String(err)}</p>
        <a href="/" style="display: inline-block; background: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; margin-top: 20px;">Return to LensForge</a>
      </div>
    `);
  }
});

app.post('/api/auth/resend-verification', async (req, res) => {
  try {
    const { email } = req.body ?? {};
    if (typeof email !== 'string' || email.trim().length === 0) {
      return res.status(400).json({ error: 'Email must be a non-empty string' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const users = await getUsers();
    const user = users.find((u) => u.email && u.email.toLowerCase() === trimmedEmail);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.is_verified) {
      return res.json({ success: true, message: 'This email is already verified.' });
    }

    const verificationToken = user.verification_token || crypto.randomBytes(32).toString('hex');
    user.verification_token = verificationToken;
    await updateUser(user);

    const appUrl = getAppUrl(req);
    const verificationLink = `${appUrl}/api/auth/verify-email?token=${verificationToken}`;

    const mailResult = await sendVerificationEmail({
      email: user.email,
      verificationLink,
    });

    res.json({
      success: true,
      message: 'Verification link resent successfully.',
      is_simulated: mailResult.simulated || !mailResult.success,
      verification_link_simulated: (mailResult.simulated || !mailResult.success) ? verificationLink : null,
      mail_error: mailResult.success ? null : mailResult.error
    });
  } catch (err: any) {
    console.error('[Resend Verification Exception]:', err);
    res.status(500).json({ error: 'Internal server error while resending verification email', details: err.message || String(err) });
  }
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

// Global Express Error-handling Middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const errorMsg = err?.stack || err?.message || err;
  logToFile(`EXPRESS UNCAUGHT ERROR: ${errorMsg}`);
  res.status(500).json({ error: 'Internal Server Error', details: err?.message || String(err) });
});

// Process Level Crash Handlers
process.on('uncaughtException', (err) => {
  logToFile(`CRITICAL UNCAUGHT PROCESS EXCEPTION: ${err?.stack || err?.message || err}`);
});

process.on('unhandledRejection', (reason: any) => {
  logToFile(`CRITICAL UNHANDLED PROCESS REJECTION: ${reason?.stack || reason?.message || reason}`);
});

/* ==========================================================================
   VITE DEV SERVER / PRODUCTION SERVING
   ========================================================================== */

// Export app for serverless deployment (e.g. Vercel)
export default app;

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

if (!process.env.VERCEL) {
  startServer();
} else {
  // On Vercel, initialize database asynchronously
  initDatabase().catch(err => console.error('[Supabase/Vercel] Database async initialization error:', err.message));
}
