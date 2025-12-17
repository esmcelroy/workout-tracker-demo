import express from 'express';
import cors from 'cors';
import { existsSync, mkdirSync, readFileSync, writeFileSync, renameSync, unlinkSync, readdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';
// Note: .js extension required for ES module imports (references compiled output)
import { PASSWORD_VALIDATION } from './src/lib/validation.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json());

// Data storage directory
const dataDir = join(__dirname, '.data');
if (!existsSync(dataDir)) {
  mkdirSync(dataDir, { recursive: true });
}

const usersFilePath = join(dataDir, 'users.json');

interface User {
  id: string;
  email: string;
  password: string;
  createdAt: number;
}

/**
 * Load users from JSON file
 */
function loadUsers(): Record<string, User> {
  try {
    if (existsSync(usersFilePath)) {
      return JSON.parse(readFileSync(usersFilePath, 'utf-8'));
    }
  } catch (error) {
    console.error('Error loading users:', error);
  }
  return {};
}

/**
 * Save users to JSON file
 */
function saveUsers(users: Record<string, User>): void {
  try {
    const tempPath = `${usersFilePath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(users, null, 2), 'utf-8');
    renameSync(tempPath, usersFilePath);
  } catch (error) {
    console.error('Error saving users:', error);
    throw error;
  }
}

/**
 * Find user by email
 */
function findUserByEmail(email: string): User | undefined {
  const users = loadUsers();
  return Object.values(users).find((u) => u.email === email.toLowerCase());
}

/**
 * Find user by ID
 */
function findUserById(id: string): User | undefined {
  const users = loadUsers();
  return users[id];
}

/**
 * JWT verification middleware
 */
function verifyToken(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ success: false, error: 'Missing authorization token' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (_error) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
}

/**
 * Get the file path for a key
 */
function getKeyPath(key: string): string {
  // Sanitize key to prevent directory traversal
  const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return join(dataDir, `${sanitized}.json`);
}

/**
 * GET /api/data/:key
 * Retrieve data for a specific key (protected)
 */
app.get('/api/data/:key', verifyToken, (req, res) => {
  const { key } = req.params;
  const userId = req.userId;
  
  // Scope key by user ID
  const scopedKey = `user-${userId}-${key}`;
  const filePath = getKeyPath(scopedKey);

  try {
    if (!existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }
    const data = JSON.parse(readFileSync(filePath, 'utf-8'));
    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error reading ${scopedKey}:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/data/:key
 * Store data for a specific key (protected)
 */
app.put('/api/data/:key', verifyToken, (req, res) => {
  const { key } = req.params;
  const { data } = req.body;
  const userId = req.userId;

  if (data === undefined) {
    return res.status(400).json({ success: false, error: 'Missing data field' });
  }

  // Scope key by user ID
  const scopedKey = `user-${userId}-${key}`;
  const filePath = getKeyPath(scopedKey);

  try {
    // Create directory if needed
    const dir = dirname(filePath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    // Write file atomically
    const tempPath = `${filePath}.tmp`;
    writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    renameSync(tempPath, filePath);

    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error writing ${scopedKey}:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/data/:key
 * Delete data for a specific key (protected)
 */
app.delete('/api/data/:key', verifyToken, (req, res) => {
  const { key } = req.params;
  const userId = req.userId;
  
  // Scope key by user ID
  const scopedKey = `user-${userId}-${key}`;
  const filePath = getKeyPath(scopedKey);

  try {
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${scopedKey}:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/keys
 * List all stored keys for the current user (protected)
 */
app.get('/api/keys', verifyToken, (req, res) => {
  const userId = req.userId;
  try {
    const files = readdirSync(dataDir);
    const prefix = `user-${userId}-`;
    const keys = files
      .filter((file) => file.endsWith('.json') && file.startsWith(prefix))
      .map((file) => file.replace('.json', '').replace(prefix, ''));
    res.json({ success: true, keys });
  } catch (error) {
    console.error('Error listing keys:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/signup
 * Register a new user
 */
app.post('/api/auth/signup', async (req, res) => {
  const { email, password, name } = req.body;

  // Validation
  if (!email || !password || !name) {
    return res.status(400).json({ success: false, error: 'Missing required fields' });
  }

  if (password.length < PASSWORD_VALIDATION.MIN_LENGTH) {
    return res.status(400).json({ success: false, error: PASSWORD_VALIDATION.MIN_LENGTH_ERROR });
  }

  try {
    // Check if user already exists
    if (findUserByEmail(email)) {
      return res.status(409).json({ success: false, error: 'User already exists' });
    }

    // Hash password
    const passwordHash = await bcryptjs.hash(password, 10);

    // Create user
    const userId = randomUUID();
    const users = loadUsers();
    users[userId] = {
      id: userId,
      email: email.toLowerCase(),
      name,
      passwordHash,
      createdAt: Date.now(),
    };
    saveUsers(users);

    // Generate JWT token
    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      user: {
        id: userId,
        email: email.toLowerCase(),
        name,
        createdAt: users[userId].createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/login
 * Login with email and password
 */
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Missing email or password' });
  }

  try {
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcryptjs.compare(password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/verify
 * Verify current token and return user
 */
app.post('/api/auth/verify', verifyToken, (req, res) => {
  try {
    const user = findUserById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Error during verify:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/auth/logout
 * Logout (token invalidation is client-side)
 */
app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

/**
 * GET /api/health
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Backend is running' });
});

/**
 * POST /api/export
 * Export all data as JSON (useful for backups)
 */
app.post('/api/export', (req, res) => {
  try {
    const files = readdirSync(dataDir);
    const exportData: Record<string, unknown> = {};

    files.forEach((file) => {
      if (file.endsWith('.json')) {
        const key = file.replace('.json', '');
        const content = JSON.parse(readFileSync(join(dataDir, file), 'utf-8'));
        exportData[key] = content;
      }
    });

    res.json({ success: true, data: exportData });
  } catch (error) {
    console.error('Error exporting data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/import
 * Import data from JSON (useful for restores)
 */
app.post('/api/import', (req, res) => {
  const { data } = req.body;

  if (!data || typeof data !== 'object') {
    return res.status(400).json({ success: false, error: 'Invalid data format' });
  }

  try {
    Object.entries(data).forEach(([key, value]) => {
      const filePath = getKeyPath(key);
      const dir = dirname(filePath);
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
    });

    res.json({ success: true, imported: Object.keys(data).length });
  } catch (error) {
    console.error('Error importing data:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`🏋️ FitTrack Backend running on http://localhost:${port}`);
  console.log(`📁 Data stored in: ${dataDir}`);
});
