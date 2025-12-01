export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">📁 File Manager API</h1>
        <p className="text-gray-600 mb-8">
          File Manager Pribadi Universal dengan Appwrite Storage
        </p>
        <div className="bg-gray-100 p-6 rounded-lg text-left">
          <h2 className="font-bold mb-2">API Endpoints:</h2>
          <ul className="space-y-1 font-mono text-sm">
            <li>GET /api/list - List all files</li>
            <li>POST /api/upload - Upload or replace file</li>
            <li>DELETE /api/delete - Delete file</li>
            <li>POST /api/signed-url - Get download URL</li>
          </ul>
          <p className="mt-4 text-xs text-gray-500">
            Authentication: x-api-key header required
          </p>
        </div>
      </div>
    </main>
  )
}
