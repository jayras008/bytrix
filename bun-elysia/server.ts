import { Elysia } from 'elysia';
import { createClient } from '@supabase/supabase-js';

const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const app = new Elysia()
  // CORS middleware
  .onRequest(({ set }) => {
    set.headers['Access-Control-Allow-Origin'] = '*';
    set.headers['Access-Control-Allow-Methods'] = 'GET, POST, DELETE, OPTIONS';
    set.headers['Access-Control-Allow-Headers'] = 'Content-Type, x-api-key';
  })
  
  // API Key verification
  .derive(({ headers, set, request }) => {
    if (request.method === 'OPTIONS') return {};
    
    const path = new URL(request.url).pathname;
    if (path === '/health') return {};
    
    const apiKey = headers['x-api-key'];
    if (apiKey !== process.env.API_KEY) {
      set.status = 401;
      throw new Error('Unauthorized');
    }
    return {};
  })

  // Health check
  .get('/health', () => ({
    status: 'OK',
    timestamp: new Date().toISOString()
  }))

  // List all files
  .get('/api/list', async ({ set }) => {
    try {
      const { data, error } = await supabase.storage
        .from(process.env.STORAGE_BUCKET!)
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

      return { files, total: files.length };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  })

  // Upload or replace file
  .post('/api/upload', async ({ body, set }) => {
    try {
      const { filename, file_data, content_type, replace = false } = body as any;

      if (!filename || !file_data) {
        set.status = 400;
        return { error: 'filename and file_data required' };
      }

      // Convert base64 to ArrayBuffer
      const binaryString = atob(file_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const uploadOptions = {
        contentType: content_type || 'application/octet-stream',
        upsert: replace === true || replace === 'true'
      };

      const { data, error } = await supabase.storage
        .from(process.env.STORAGE_BUCKET!)
        .upload(filename, bytes, uploadOptions);

      if (error) throw error;

      return {
        success: true,
        filename: data.path,
        message: replace ? 'File replaced successfully' : 'File uploaded successfully'
      };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  })

  // Delete file
  .delete('/api/delete', async ({ body, set }) => {
    try {
      const { filename } = body as any;

      if (!filename) {
        set.status = 400;
        return { error: 'filename required' };
      }

      const { error } = await supabase.storage
        .from(process.env.STORAGE_BUCKET!)
        .remove([filename]);

      if (error) throw error;

      return {
        success: true,
        message: `File ${filename} deleted successfully`
      };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  })

  // Generate signed URL
  .post('/api/signed-url', async ({ body, set }) => {
    try {
      const { filename, expires_in = 604800 } = body as any; // Default 7 days

      if (!filename) {
        set.status = 400;
        return { error: 'filename required' };
      }

      const { data, error } = await supabase.storage
        .from(process.env.STORAGE_BUCKET!)
        .createSignedUrl(filename, expires_in);

      if (error) throw error;

      return {
        success: true,
        signed_url: data.signedUrl,
        expires_in: expires_in,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString()
      };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  })

  .listen(PORT);

console.log(`🚀 File Manager running on port ${app.server?.port}`);
console.log(`📦 Storage bucket: ${process.env.STORAGE_BUCKET}`);
