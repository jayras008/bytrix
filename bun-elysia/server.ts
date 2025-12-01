import { Elysia } from 'elysia';
import { Client, Storage, ID, InputFile } from 'node-appwrite';

const PORT = process.env.PORT || 3000;

// Initialize Appwrite client
const getAppwriteClient = () => {
  return new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT!)
    .setProject(process.env.APPWRITE_PROJECT_ID!)
    .setKey(process.env.APPWRITE_API_KEY!);
};

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
      const client = getAppwriteClient();
      const storage = new Storage(client);

      const result = await storage.listFiles(process.env.APPWRITE_BUCKET_ID!);

      const files = result.files.map((file: any) => ({
        name: file.name,
        size: file.sizeOriginal,
        type: file.mimeType,
        created_at: file.$createdAt,
        updated_at: file.$updatedAt
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

      const client = getAppwriteClient();
      const storage = new Storage(client);

      // Convert base64 to buffer
      const binaryString = atob(file_data);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // If replace, delete existing file first
      if (replace === true || replace === 'true') {
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
        InputFile.fromBuffer(bytes, filename)
      );

      return {
        success: true,
        filename: file.name,
        file_id: file.$id,
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

      const client = getAppwriteClient();
      const storage = new Storage(client);

      // Find file by name
      const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID!, [
        `equal("name", "${filename}")`
      ]);

      if (files.files.length === 0) {
        set.status = 404;
        return { error: 'File not found' };
      }

      await storage.deleteFile(process.env.APPWRITE_BUCKET_ID!, files.files[0].$id);

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

      const client = getAppwriteClient();
      const storage = new Storage(client);

      // Find file by name
      const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID!, [
        `equal("name", "${filename}")`
      ]);

      if (files.files.length === 0) {
        set.status = 404;
        return { error: 'File not found' };
      }

      const fileId = files.files[0].$id;
      
      // Get file download URL
      const downloadUrl = storage.getFileDownload(process.env.APPWRITE_BUCKET_ID!, fileId);

      return {
        success: true,
        signed_url: downloadUrl,
        expires_in: expires_in,
        expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
        note: 'Appwrite file URLs are permanent. Use bucket permissions to control access.'
      };
    } catch (error: any) {
      set.status = 500;
      return { error: error.message };
    }
  })

  .listen(PORT);

console.log(`🚀 File Manager running on port ${app.server?.port}`);
console.log(`📦 Storage bucket: ${process.env.APPWRITE_BUCKET_ID}`);
