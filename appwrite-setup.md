# 🚀 Appwrite Setup Guide

Panduan setup Appwrite Storage untuk File Manager Pribadi Universal.

---

## 📋 Langkah Setup (5 menit)

### 1️⃣ Buat Project Appwrite

**A. Menggunakan Appwrite Cloud (Gratis):**
1. Buka [cloud.appwrite.io](https://cloud.appwrite.io)
2. Sign up / Login
3. Klik **Create Project**
4. Nama project: `file-manager-private`
5. **Simpan Project ID** (akan digunakan nanti)

**B. Self-Hosted (Opsional):**
```bash
docker run -d \
  --name appwrite \
  -p 80:80 -p 443:443 \
  -v appwrite-data:/storage \
  appwrite/appwrite:latest
```

---

### 2️⃣ Buat API Key

1. Buka project → **Settings** → **API Keys**
2. Klik **Create API Key**
3. **Name**: `file-manager-api`
4. **Scopes**: Centang semua di bagian **Files**:
   - ✅ `files.read`
   - ✅ `files.write`
5. **Expiration**: Never (atau sesuai kebutuhan)
6. Klik **Create**
7. **SIMPAN API Key** (hanya muncul sekali!)

---

### 3️⃣ Buat Storage Bucket

1. Buka **Storage** dari menu kiri
2. Klik **Create Bucket**
3. **Bucket ID**: `private-files` ⚠️ (HARUS sama dengan config)
4. **Name**: `Private Files`
5. **Permissions**: 
   - **File Security**: Enabled
   - Jangan tambahkan permission apapun (bucket private by default)
6. **File Upload Settings**:
   - **Maximum File Size**: 100 MB (atau sesuai kebutuhan)
   - **Allowed File Extensions**: Leave empty (allow all)
7. Klik **Create**

---

### 4️⃣ Set Bucket Permissions (PENTING!)

1. Buka bucket `private-files` yang baru dibuat
2. Klik tab **Settings**
3. Di bagian **Permissions**:
   - **JANGAN** tambahkan permission untuk `any` atau `guests`
   - Bucket harus tetap **private** (hanya API key yang bisa akses)
4. Di bagian **File Security**:
   - Pastikan **Enabled** (file permissions dikelola per-file)
   - Tapi kita tidak set permission per-file karena menggunakan API key

---

### 5️⃣ Dapatkan Credentials

Simpan 3 credentials ini untuk environment variables:

```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
# Atau https://your-domain.com/v1 jika self-hosted

APPWRITE_PROJECT_ID=your-project-id-here
# Dari: Project Settings → Project ID

APPWRITE_API_KEY=your-api-key-here
# Yang disimpan di step 2

APPWRITE_BUCKET_ID=private-files
# Nama bucket yang dibuat di step 3
```

---

## 🔐 Keamanan

### Cara Kerja Keamanan:
1. **Bucket Private**: Tidak bisa diakses tanpa autentikasi
2. **API Key di Server**: Tersimpan aman di environment variable server
3. **Custom API Key**: User harus punya API key custom untuk akses proxy server
4. **Double Protection**: 
   - Layer 1: Custom API key untuk akses proxy
   - Layer 2: Appwrite API key untuk akses storage (tersimpan di server)

### Keuntungan vs Supabase:
- ✅ Tidak perlu set RLS policy (lebih simple)
- ✅ File permissions built-in
- ✅ Open source & self-hostable
- ✅ Lebih cepat untuk file operations
- ✅ Built-in real-time updates (bonus feature)

---

## 🧪 Testing Credentials

Test apakah credentials sudah benar:

```bash
# Install Appwrite CLI (opsional)
npm install -g appwrite-cli

# Login
appwrite login

# List buckets
appwrite storage listBuckets --projectId=YOUR_PROJECT_ID
```

Atau test langsung dengan cURL:

```bash
curl -X GET \
  'https://cloud.appwrite.io/v1/storage/buckets/private-files' \
  -H 'X-Appwrite-Project: YOUR_PROJECT_ID' \
  -H 'X-Appwrite-Key: YOUR_API_KEY'
```

Expected response: JSON dengan info bucket `private-files`

---

## 📊 Limits & Quotas

### Appwrite Cloud (Free Tier):
- **Storage**: 2 GB
- **Bandwidth**: 10 GB/month
- **File Upload**: 50 MB per file (bisa dinaikkan di bucket settings)
- **API Calls**: Unlimited

### Self-Hosted:
- **No limits!** (hanya dibatasi server resources)

---

## 🔄 Migration dari Supabase

Jika sebelumnya pakai Supabase, cara migrate:

### 1. Export Files dari Supabase
```javascript
// Script export (jalankan di browser console Supabase)
const { data } = await supabase.storage.from('private-files').list();
for (const file of data) {
  const { data: blob } = await supabase.storage
    .from('private-files')
    .download(file.name);
  // Download ke lokal
}
```

### 2. Import ke Appwrite
Gunakan file manager ini untuk upload semua file kembali via GPT Actions!

---

## 🆘 Troubleshooting

### Error: "Project not found"
- ✅ Cek `APPWRITE_PROJECT_ID` benar
- ✅ Pastikan API key dibuat untuk project yang benar

### Error: "Bucket not found"
- ✅ Cek `APPWRITE_BUCKET_ID` = `private-files`
- ✅ Pastikan bucket sudah dibuat di Storage

### Error: "Unauthorized"
- ✅ Cek `APPWRITE_API_KEY` masih valid
- ✅ Pastikan API key punya scope `files.read` & `files.write`

### Error: "File too large"
- ✅ Naikkan **Maximum File Size** di bucket settings
- ✅ Default 50MB, bisa dinaikkan sampai 5GB (cloud) atau unlimited (self-hosted)

---

## 🎯 Next Steps

Setelah setup selesai:

1. ✅ Deploy proxy server (Vercel/Railway/Docker)
2. ✅ Set environment variables dengan credentials Appwrite
3. ✅ Import OpenAPI YAML ke GPT Actions
4. ✅ Test dengan perintah: "Tampilkan semua file saya"

**Selamat! File manager Anda sudah siap digunakan dengan Appwrite! 🎉**
