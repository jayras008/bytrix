import { Client, Storage } from 'node-appwrite';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { filename, expires_in = 604800 } = req.body; // Default 7 days (604800 seconds)

    if (!filename) {
      return res.status(400).json({ error: 'filename required' });
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const storage = new Storage(client);

    // Find file by name
    const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID!, [
      `equal("name", "${filename}")`
    ]);

    if (files.files.length === 0) {
      return res.status(404).json({ error: 'File not found' });
    }

    const fileId = files.files[0].$id;
    
    // Get file download URL
    const downloadUrl = storage.getFileDownload(process.env.APPWRITE_BUCKET_ID!, fileId);

    return res.status(200).json({
      success: true,
      signed_url: downloadUrl,
      expires_in: expires_in,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      note: 'Appwrite file URLs are permanent. Use bucket permissions to control access.'
    });
  } catch (error: any) {
    console.error('Signed URL error:', error);
    return res.status(500).json({ error: error.message });
  }
}
