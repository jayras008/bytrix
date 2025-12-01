import { createClient } from '@supabase/supabase-js';
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

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    // Convert base64 to buffer
    const buffer = Buffer.from(file_data, 'base64');

    const uploadOptions: any = {
      contentType: content_type || 'application/octet-stream',
      upsert: replace === true || replace === 'true'
    };

    const { data, error } = await supabase.storage
      .from(process.env.STORAGE_BUCKET!)
      .upload(filename, buffer, uploadOptions);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      filename: data.path,
      message: replace ? 'File replaced successfully' : 'File uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message });
  }
}
