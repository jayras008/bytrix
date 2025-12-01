import { Client, Storage } from 'node-appwrite';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify API Key
  const apiKey = request.headers.get('x-api-key');
  if (apiKey !== process.env.API_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    return NextResponse.json({ files, total: files.length });
  } catch (error: any) {
    console.error('List error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
