import { Client, Storage } from 'node-appwrite';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify API Key
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const storage = new Storage(client);

    const result = await storage.listFiles(process.env.APPWRITE_BUCKET_ID!);

    const files = result.files.map((file: any) => ({
      name: file.name,
      size: file.sizeOriginal,
      type: file.mimeType,
      created_at: file.$createdAt,
      updated_at: file.$updatedAt
    }));

    return res.status(200).json({ files, total: files.length });
  } catch (error: any) {
    console.error('List error:', error);
    return res.status(500).json({ error: error.message });
  }
}
