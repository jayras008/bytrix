import { Client, Storage } from 'node-appwrite';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function DELETE(request: NextRequest) {
  // Verify API Key
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { filename } = body;

    if (!filename) {
      return NextResponse.json({ error: 'filename required' }, { status: 400 });
    }

    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);

    const storage = new Storage(client);

    // Find file by name (search all files and filter)
    const files = await storage.listFiles(process.env.APPWRITE_BUCKET_ID!);
    
    const matchedFile = files.files.find(file => file.name === filename);
    
    if (!matchedFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    await storage.deleteFile(process.env.APPWRITE_BUCKET_ID!, matchedFile.$id);

    return NextResponse.json({
      success: true,
      message: `File ${filename} deleted successfully`
    });
  } catch (error: any) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
