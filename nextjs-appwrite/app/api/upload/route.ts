import { Client, Storage, ID, InputFile } from 'node-appwrite';
import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 60; // 60 seconds timeout
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Verify API Key
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename, file_data, content_type, replace = false } = body;

    if (!filename || !file_data) {
      return NextResponse.json({ error: 'filename and file_data required' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      filename: file.name,
      file_id: file.$id,
      message: replace ? 'File replaced successfully' : 'File uploaded successfully'
    });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
