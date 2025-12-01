# 📁 File Manager Pribadi Universal

File manager pribadi yang 100% aman dan bisa di-deploy di mana saja dengan Appwrite Storage.

## 🎯 Fitur

1. ✅ Lihat semua file pribadi
2. ⬆️ Upload file baru (drag & drop di chat GPT)
3. 🔄 Replace/ganti file existing (upload nama sama → auto overwrite)
4. 🗑️ Hapus file
5. 🔗 Dapatkan link download sementara (valid 7 hari)

## 🔐 Keamanan

- ✅ Appwrite API key **HANYA** ada di server (tidak pernah ke OpenAI)
- ✅ API key custom untuk autentikasi proxy server
- ✅ Storage bucket private (tidak bisa diakses langsung)
- ✅ File permissions per-file (optional)

---

## 🚀 DEPLOY 60 DETIK

### Persiapan Appwrite (Wajib - 5 menit)

1. Buat project di [Appwrite Cloud](https://cloud.appwrite.io) (gratis)
2. Buat API Key dengan scope `files.read` & `files.write`
3. Buat bucket `private-files` (set sebagai **Private**)
4. Lihat detail setup di `appwrite-setup.md`
5. Simpan credentials:
   - `APPWRITE_ENDPOINT`: https://cloud.appwrite.io/v1
   - `APPWRITE_PROJECT_ID`: your-project-id
   - `APPWRITE_API_KEY`: your-api-key
   - `APPWRITE_BUCKET_ID`: private-files

---

### 1️⃣ Deploy ke VERCEL (Tercepat - 60 detik)

```bash
# Install Vercel CLI
npm i -g vercel

# Masuk folder vercel-nodejs
cd vercel-nodejs

# Set environment variables (saat ditanya)
# APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
# APPWRITE_PROJECT_ID=your-project-id
# APPWRITE_API_KEY=your-api-key
# APPWRITE_BUCKET_ID=private-files
# API_KEY=rahasia-saya-123xx.supabase.co
# SUPABASE_ANON_KEY=eyJhbGc...
# STORAGE_BUCKET=private-files
# API_KEY=rahasia-saya-123

# Selesai! URL: https://your-project.vercel.app
```

**Alternatif via Dashboard:**
1. Push folder `vercel-nodejs` ke GitHub
2. Import di [Vercel Dashboard](https://vercel.com/new)
3. Set environment variables di Settings
4. Deploy!

---

### 2️⃣ Deploy ke RAILWAY (60 detik)

```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Masuk folder docker-express
cd docker-express
# Set environment variables di Railway Dashboard
# APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_BUCKET_ID, API_KEY, PORT=3000
railway up

# Set environment variables di Railway Dashboard
# SUPABASE_URL, SUPABASE_ANON_KEY, STORAGE_BUCKET, API_KEY, PORT=3000

# Selesai! URL: https://your-project.railway.app
```

**Alternatif via Dashboard:**
1. Buka [Railway Dashboard](https://railway.app)
2. New Project → Deploy from GitHub
3. Pilih repo & folder `docker-express`
4. Set env variables
5. Deploy!

---

### 3️⃣ Deploy ke RENDER (60 detik)

1. Buka [Render Dashboard](https://render.com)
2. New → Web Service → Connect GitHub repo
3. **Settings:**
   - **Name**: file-manager
   - **Root Directory**: `docker-express`
   - **Runtime**: Docker
4. **Environment Variables:**
   ```
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your-project-id
   APPWRITE_API_KEY=your-api-key
   APPWRITE_BUCKET_ID=private-files
   API_KEY=rahasia-saya-123
   PORT=3000
   ```T=3000
   ```
5. Create Web Service → Tunggu build selesai
6. Selesai! URL: https://your-project.onrender.com

---

### 4️⃣ Deploy ke FLY.IO (60 detik)

```bash
# Install Fly CLI
# Windows: iwr https://fly.io/install.ps1 -useb | iex
# Mac/Linux: curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Masuk folder docker-express
cd docker-express

# Launch
fly launch
# - App name: file-manager-pribadi
# - Region: Singapore (sin)
# - No PostgreSQL, No Redis

# Set secrets
fly secrets set APPWRITE_ENDPOINT="https://cloud.appwrite.io/v1"
fly secrets set APPWRITE_PROJECT_ID="your-project-id"
fly secrets set APPWRITE_API_KEY="your-api-key"
fly secrets set APPWRITE_BUCKET_ID="private-files"
fly secrets set API_KEY="rahasia-saya-123"

# Deploy
fly deploy

# Selesai! URL: https://file-manager-pribadi.fly.dev
```

---

### 5️⃣ Deploy DOCKER LOKAL (60 detik)

**A. Docker Express:**
```bash
cd docker-express

# Copy .env
cp .env.example .env
# Edit .env dengan credentials Supabase & API key Anda

# Build & run
docker build -t file-manager .
docker run -p 3000:3000 --env-file .env file-manager

# Akses: http://localhost:3000
```

**B. Bun Elysia (Super Cepat!):**
```bash
cd bun-elysia

# Copy .env
cp .env.example .env
# Edit .env dengan credentials Supabase & API key Anda

# Tanpa Docker (butuh Bun)
bun install
bun run server.ts

# Dengan Docker
docker build -t file-manager-bun .
docker run -p 3000:3000 --env-file .env file-manager-bun

# Akses: http://localhost:3000
```

---

## 🤖 SETUP GPT ACTIONS (3 Langkah - 2 menit)

### Langkah 1: Buka GPT Editor
1. Buka ChatGPT → **Explore GPTs** → **Create**
2. Tab **Configure** → Scroll ke **Actions**
3. Klik **Create new action**

### Langkah 2: Import OpenAPI Schema
1. Copy semua isi file `file-manager-proxy.yaml`
2. **GANTI** `[YOUR_DEPLOY_URL]` dengan URL deployment Anda:
   - Vercel: `https://your-project.vercel.app`
   - Railway: `https://your-project.railway.app`
   - Render: `https://your-project.onrender.com`
   - Fly.io: `https://your-project.fly.dev`
   - Lokal: `http://localhost:3000`
3. Paste di editor Actions → **Save**

### Langkah 3: Set Authentication
1. **Authentication**: API Key
2. **API Key**: Masukkan nilai `API_KEY` yang Anda set saat deploy
3. **Auth Type**: Custom
4. **Custom Header Name**: `x-api-key`
5. **Save**

**SELESAI!** GPT Anda sudah bisa kelola file.

---

## 💬 15 CONTOH PERINTAH (Bahasa Indonesia)

### 1. Lihat File
```
Tampilkan semua file saya
```
```
File apa aja yang ada?
```
```
Berapa total file yang tersimpan?
```

### 2. Upload File Baru
```
Upload file ini [drag & drop file]
```
```
Simpan dokumen ini dengan nama "Laporan Q4.pdf"
```
```
Upload gambar ini jadi "foto-profil-2024.jpg"
```

### 3. Replace File
```
Ganti file "dokumen-lama.pdf" dengan file ini [drag & drop]
```
```
Replace "logo.png" dengan gambar baru ini
```
```
Update file "data.xlsx" dengan yang ini
```

### 4. Hapus File
```
Hapus file "foto-lama.jpg"
```
```
Delete "dokumen-tidak-perlu.pdf"
```
```
Buang file "cache.tmp"
```

### 5. Download Link
```
Kasih link download untuk "kontrak-penting.pdf"
```
```
Buatin link download "presentasi-akhir.pptx" valid 3 hari
```
```
Generate signed URL untuk "backup-database.sql"
```

### 6. Kombinasi
```
Upload file ini sebagai "invoice-2024.pdf" lalu kasih link downloadnya
```
```
Ganti "readme.txt" dengan file ini, terus tampilkan semua file
```
```
Hapus file "temp.log" dan tampilkan sisa file yang ada
```

---

## 📊 Spesifikasi Teknis

### Ukuran File
- **Upload**: Sampai 100MB per file (bisa dinaikkan di config)
- **Total storage**: Sesuai plan Supabase Anda

### Karakter Filename Support
- ✅ Spasi: `Laporan 2024.pdf`
- ✅ Emoji: `Foto Liburan 🏖️.jpg`
- ✅ Unicode: `文档.docx`, `ドキュメント.pdf`
- ✅ Karakter spesial: `project_v2.0-final.zip`

### Security
- 🔒 Bucket private (tidak bisa diakses publik)
- 🔒 Anon key tersimpan di server (tidak exposed)
- 🔒 API key custom untuk autentikasi
- 🔒 Signed URL temporary (default 7 hari, custom 1 detik - 1 tahun)

### Performance
- ⚡ **Vercel**: Serverless, cold start ~500ms
- ⚡ **Railway/Render**: Always-on (free tier sleep setelah idle)
- ⚡ **Fly.io**: Edge compute, global deployment
- ⚡ **Docker lokal**: Instant, 0 latency
- ⚡ **Bun**: Startup <10ms, 3x lebih cepat dari Node.js

---

## 🛠️ Troubleshooting

### Error: "Unauthorized"
- ✅ Pastikan header `x-api-key` match dengan `API_KEY` di server
- ✅ Cek GPT Actions authentication sudah diset dengan benar

### Error: "Row Level Security"
- ✅ Jalankan `supabase-storage-policy.sql` di SQL Editor
- ✅ Pastikan bucket name match (`private-files`)

### Upload gagal (file >50MB)
- ✅ Vercel: Update `vercel.json` → maxDuration
- ✅ Docker: Update nginx timeout (jika pakai reverse proxy)
- ✅ Bun: Sudah support by default

### Deployment gagal
- ✅ Cek semua env variables sudah diset
- ✅ Vercel: Pastikan ada `package.json` & `vercel.json`
- ✅ Docker: Cek Dockerfile path & port exposure

---

## 📂 Struktur Project

```
file-manager-pribadi/
├── vercel-nodejs/          # ⚡ Vercel Serverless
│   ├── api/
│   │   ├── list.ts
│   │   ├── upload.ts
│   │   ├── delete.ts
│   │   └── signed-url.ts
│   ├── package.json
│   ├── vercel.json
│   └── .env.example
│
├── docker-express/         # 🐳 Docker + Express
│   ├── server.js
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── bun-elysia/            # 🚀 Bun + Elysia (fastest)
│   ├── server.ts
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── file-manager-proxy.yaml     # OpenAPI schema
├── appwrite-setup.md           # Appwrite setup guide
└── README.md                   # Dokumentasi ini
```

---

## 🎓 Environment Variables

### Wajib (Semua Varian)
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your-project-id
APPWRITE_API_KEY=your-api-key
APPWRITE_BUCKET_ID=private-files
API_KEY=your-secret-api-key-123
```

### Opsional
```env
PORT=3000  # Untuk Docker/lokal (Vercel auto-detect)
```

---

## 🔄 Update & Maintenance

### Update Code
```bash
# Pull latest changes
git pull

# Re-deploy
vercel --prod  # Vercel
railway up     # Railway
fly deploy     # Fly.io
docker build -t file-manager . && docker run -p 3000:3000 file-manager  # Docker
```
### Backup File
Appwrite sudah auto-backup (jika pakai Cloud), atau bisa:
1. Download semua file via GPT: "Download semua file"
2. Export dari Appwrite Storage dashboard
3. Self-hosted: Backup volume Docker
3. Gunakan Supabase CLI: `supabase db dump`

---

## 💡 Tips & Best Practices

1. **API Key**: Gunakan password generator untuk API key yang kuat
2. **CORS**: Jika pakai custom domain, update CORS di code
3. **Rate Limiting**: Tambahkan rate limiter untuk production
4. **Logging**: Enable logging untuk debugging (sudah built-in)
5. **Monitoring**: Gunakan Vercel/Railway/Fly dashboard untuk monitor uptime
6. **Backup**: Download file penting secara berkala
7. **Signed URL**: Gunakan expires_in lebih pendek untuk file sensitif

---
## 🆘 Support

- 📖 Dokumentasi Appwrite: https://appwrite.io/docs/products/storage
- 📖 Vercel Docs: https://vercel.com/docs
- 📖 Railway Docs: https://docs.railway.app
- 📖 Fly.io Docs: https://fly.io/docs
- 📖 Bun Docs: https://bun.sh/docsocs
- 📖 Bun Docs: https://bun.sh/docs

---

## 📝 License

MIT License - Bebas digunakan untuk keperluan pribadi maupun komersial.

---
## ✨ Dibuat dengan

- 🧠 Claude Sonnet 4.5 (GitHub Copilot)
- ☁️ Appwrite Storage
- ⚡ Node.js / Bun
- 🚀 Vercel / Railway / Render / Fly.io
- 🐳 Docker / Railway / Render / Fly.io
- 🐳 Docker

**Selamat mengelola file pribadi Anda dengan aman! 🎉**
