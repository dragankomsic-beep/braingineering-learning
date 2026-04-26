import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

// In production with high concurrency, replace this with Vercel KV or a database.
// For <500 codes and low concurrency, file-based works fine on Vercel serverless.
const CODES_PATH = join(process.cwd(), 'api', 'codes.json');

function loadCodes() {
  try {
    const raw = readFileSync(CODES_PATH, 'utf-8');
    return JSON.parse(raw);
  } catch (e) {
    return {};
  }
}

function saveCodes(codes) {
  writeFileSync(CODES_PATH, JSON.stringify(codes, null, 2));
}

export default function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code, action } = req.body || {};
  
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'Kein Code eingegeben.' });
  }

  const cleanCode = code.trim().toUpperCase();
  const codes = loadCodes();

  if (action === 'validate') {
    // Just check if code exists and is unused — don't consume yet
    if (!codes[cleanCode]) {
      return res.status(200).json({ valid: false, error: 'Ungültiger Code.' });
    }
    if (codes[cleanCode].used) {
      return res.status(200).json({ valid: false, error: 'Dieser Code wurde bereits verwendet.' });
    }
    return res.status(200).json({ valid: true });
  }

  if (action === 'consume') {
    // Validate AND mark as used
    if (!codes[cleanCode]) {
      return res.status(200).json({ valid: false, error: 'Ungültiger Code.' });
    }
    if (codes[cleanCode].used) {
      return res.status(200).json({ valid: false, error: 'Dieser Code wurde bereits verwendet.' });
    }
    
    codes[cleanCode].used = true;
    codes[cleanCode].usedAt = new Date().toISOString();
    saveCodes(codes);
    
    return res.status(200).json({ valid: true, consumed: true });
  }

  return res.status(400).json({ error: 'Ungültige Aktion.' });
}
