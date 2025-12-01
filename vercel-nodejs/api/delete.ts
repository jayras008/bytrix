import { Client, Storage } from 'node-appwrite';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const { filename } = req.body;

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

    await storage.deleteFile(process.env.APPWRITE_BUCKET_ID!, files.files[0].$id);

    return res.status(200).json({
      success: true,
      message: `File ${filename} deleted successfully`
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return res.status(500).json({ error: error.message });
  }
}
