import { createClient } from '@supabase/supabase-js';
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

    const supabase = createClient(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.storage
      .from(process.env.STORAGE_BUCKET!)
      .createSignedUrl(filename, expires_in);

    if (error) throw error;

    return res.status(200).json({
      success: true,
      signed_url: data.signedUrl,
      expires_in: expires_in,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
    });
  } catch (error: any) {
    console.error('Signed URL error:', error);
    return res.status(500).json({ error: error.message });
  }
}
