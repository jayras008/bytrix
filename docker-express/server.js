import express from 'express';
import cors from 'cors';
import { Client, Storage, ID, InputFile } from 'node-appwrite';
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

// Initialize Appwrite client
const getAppwriteClient = () => {
  return new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);
};

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// List all files
app.get('/api/list', verifyApiKey, async (req, res) => {
  try {
    const client = getAppwriteClient();
    const storage = new Storage(client);
    
    const result = await storage.listFiles(process.env.APPWRITE_BUCKET_ID);

    const files = result.files.map(file => ({
      name: file.name,
      size: file.sizeOriginal,
      type: file.mimeType,
      created_at: file.$createdAt,
      updated_at: file.$updatedAt
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

    const client = getAppwriteClient();
    const storage = new Storage(client);

    // Convert base64 to buffer
    const buffer = Buffer.from(file_data, 'base64');

    // If replace, delete existing file first
    if (replace === true || replace === 'true') {
      try {
        const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID, [
          `equal("name", "${filename}")`
        ]);
        if (files.files.length > 0) {
          await storage.deleteFile(process.env.APPWRITE_BUCKET_ID, files.files[0].$id);
        }
      } catch (err) {
        // File doesn't exist, ignore error
      }
    }

    const file = await storage.createFile(
      process.env.APPWRITE_BUCKET_ID,
      ID.unique(),
      InputFile.fromBuffer(buffer, filename)
    );

    res.json({
      success: true,
      filename: file.name,
      file_id: file.$id,
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

    const client = getAppwriteClient();
    const storage = new Storage(client);

    // Find file by name
    const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID, [
      `equal("name", "${filename}")`
    ]);

    if (files.files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    await storage.deleteFile(process.env.APPWRITE_BUCKET_ID, files.files[0].$id);

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

    const client = getAppwriteClient();
    const storage = new Storage(client);

    // Find file by name
    const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID, [
      `equal("name", "${filename}")`
    ]);

    if (files.files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileId = files.files[0].$id;
    
    // Get file download URL
    const downloadUrl = storage.getFileDownload(process.env.APPWRITE_BUCKET_ID, fileId);

    res.json({
      success: true,
      signed_url: downloadUrl,
      expires_in: expires_in,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      note: 'Appwrite file URLs are permanent. Use bucket permissions to control access.'
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
  console.log(`📦 Storage bucket: ${process.env.APPWRITE_BUCKET_ID}`);
});
