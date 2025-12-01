import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// API Key verification middleware
const verifyApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// Initialize Supabase client
const getSupabaseClient = () => {
  return createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  );
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// List all files
app.get('/api/list', verifyApiKey, async (req, res) => {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(process.env.STORAGE_BUCKET)
      .list('', {
        limit: 1000,
        sortBy: { column: 'created_at', order: 'desc' }
      });

    if (error) throw error;

    const files = data.map(file => ({
      name: file.name,
      size: file.metadata?.size || 0,
      type: file.metadata?.mimetype || 'unknown',
      created_at: file.created_at,
      updated_at: file.updated_at
    }));

    res.json({ files, total: files.length });
  } catch (error) {
    console.error('List error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Upload or replace file
app.post('/api/upload', verifyApiKey, async (req, res) => {
  try {
    const { filename, file_data, content_type, replace = false } = req.body;

    if (!filename || !file_data) {
      return res.status(400).json({ error: 'filename and file_data required' });
    }

    const supabase = getSupabaseClient();

    // Convert base64 to buffer
    const buffer = Buffer.from(file_data, 'base64');

    const uploadOptions = {
      contentType: content_type || 'application/octet-stream',
      upsert: replace === true || replace === 'true'
    };

    const { data, error } = await supabase.storage
      .from(process.env.STORAGE_BUCKET)
      .upload(filename, buffer, uploadOptions);

    if (error) throw error;

    res.json({
      success: true,
      filename: data.path,
      message: replace ? 'File replaced successfully' : 'File uploaded successfully'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete file
app.delete('/api/delete', verifyApiKey, async (req, res) => {
  try {
    const { filename } = req.body;

    if (!filename) {
      return res.status(400).json({ error: 'filename required' });
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase.storage
      .from(process.env.STORAGE_BUCKET)
      .remove([filename]);

    if (error) throw error;

    res.json({
      success: true,
      message: `File ${filename} deleted successfully`
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Generate signed URL
app.post('/api/signed-url', verifyApiKey, async (req, res) => {
  try {
    const { filename, expires_in = 604800 } = req.body; // Default 7 days

    if (!filename) {
      return res.status(400).json({ error: 'filename required' });
    }

    const supabase = getSupabaseClient();

    const { data, error } = await supabase.storage
      .from(process.env.STORAGE_BUCKET)
      .createSignedUrl(filename, expires_in);

    if (error) throw error;

    res.json({
      success: true,
      signed_url: data.signedUrl,
      expires_in: expires_in,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
    });
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 File Manager running on port ${PORT}`);
  console.log(`📦 Storage bucket: ${process.env.STORAGE_BUCKET}`);
});
