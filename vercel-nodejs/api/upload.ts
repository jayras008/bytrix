import { Client, Storage, ID, InputFile } from 'node-appwrite';
import type { VercelRequest, VercelResponse } from '@vercel/node';

// Support file upload up to 100MB
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

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
    const { filename, file_data, content_type, replace = false } = req.body;

    if (!filename || !file_data) {
      return res.status(400).json({ error: 'filename and file_data required' });
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const storage = new Storage(client);

    // Convert base64 to buffer
    const buffer = Buffer.from(file_data, 'base64');

    // If replace, delete existing file first
    if (replace) {
      try {
        const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID!, [
          `equal("name", "${filename}")`
        ]);
        if (files.files.length > 0) {
          await storage.deleteFile(process.env.APPWRITE_BUCKET_ID!, files.files[0].$id);
        }
      } catch (err) {
        // File doesn't exist, ignore error
      }
    }

    const file = await storage.createFile(
      process.env.APPWRITE_BUCKET_ID!,
      ID.unique(),
      InputFile.fromBuffer(buffer, filename)
    );

    return res.status(200).json({
      success: true,
      filename: file.name,
      file_id: file.$id,
      message: replace ? 'File replaced successfully' : 'File uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
