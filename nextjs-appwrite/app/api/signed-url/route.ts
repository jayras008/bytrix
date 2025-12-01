import { Client, Storage } from 'node-appwrite';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Verify API Key
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename, expires_in = 604800 } = body; // Default 7 days

    if (!filename) {
      return NextResponse.json({ error: 'filename required' }, { status: 400 });
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
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const fileId = files.files[0].$id;
    
    // Get file download URL
    const downloadUrl = storage.getFileDownload(process.env.APPWRITE_BUCKET_ID!, fileId);

    return NextResponse.json({
      success: true,
      signed_url: downloadUrl,
      expires_in: expires_in,
      expires_at: new Date(Date.now() + expires_in * 1000).toISOString(),
      note: 'Appwrite file URLs are permanent. Use bucket permissions to control access.'
    });
  } catch (error: any) {
    console.error('Signed URL error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
