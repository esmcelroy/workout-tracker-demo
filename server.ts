import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Data storage directory
const dataDir = path.join(__dirname, '.data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

/**
 * Get the file path for a key
 */
function getKeyPath(key: string): string {
  // Sanitize key to prevent directory traversal
  const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(dataDir, `${sanitized}.json`);
}

/**
 * GET /api/data/:key
 * Retrieve data for a specific key
 */
app.get('/api/data/:key', (req, res) => {
  const { key } = req.params;
  const filePath = getKeyPath(key);

  try {
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ success: false, error: 'Key not found' });
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error reading ${key}:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * PUT /api/data/:key
 * Store data for a specific key
 */
app.put('/api/data/:key', (req, res) => {
  const { key } = req.params;
  const { data } = req.body;

  if (data === undefined) {
    return res.status(400).json({ success: false, error: 'Missing data field' });
  }

  const filePath = getKeyPath(key);

  try {
    // Create directory if needed
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write file atomically
    const tempPath = `${filePath}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, filePath);

    res.json({ success: true, data });
  } catch (error) {
    console.error(`Error writing ${key}:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/data/:key
 * Delete data for a specific key
 */
app.delete('/api/data/:key', (req, res) => {
  const { key } = req.params;
  const filePath = getKeyPath(key);

  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (error) {
    console.error(`Error deleting ${key}:`, error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/keys
 * List all stored keys
 */
app.get('/api/keys', (req, res) => {
  try {
    const files = fs.readdirSync(dataDir);
    const keys = files
      .filter((file) => file.endsWith('.json'))
      .map((file) => file.replace('.json', ''));
    res.json({ success: true, keys });
  } catch (error) {
    console.error('Error listing keys:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
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
    const files = fs.readdirSync(dataDir);
    const exportData: Record<string, unknown> = {};

    files.forEach((file) => {
      if (file.endsWith('.json')) {
        const key = file.replace('.json', '');
        const content = JSON.parse(fs.readFileSync(path.join(dataDir, file), 'utf-8'));
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
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(value, null, 2), 'utf-8');
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
