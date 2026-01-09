# 🚀 Financial Tracker - Quick Start Guide

## 🌐 Cara Cepat Deploy ke Web Hosting

### 📋 Pilihan Hosting (Pilih Salah Satu):

#### 🥇 **Opsi 1: Vercel (Paling Mudah - Gratis)**
```bash
# 1. Push ke GitHub
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/username/financial-tracker.git
git push -u origin main

# 2. Deploy ke Vercel
# - Buka vercel.com
# - Login dengan GitHub
# - Import repository
# - Deploy! 🎉
```

#### 🥈 **Opsi 2: Netlify (Mudah - Gratis)**
```bash
# 1. Build untuk static
bun run build

# 2. Deploy ke Netlify
# - Buka netlify.com
# - Drag & drop folder 'out'
# - Deploy! 🎉
```

#### 🥉 **Opsi 3: Shared Hosting (cPanel)**
```bash
# 1. Build aplikasi
bun run build

# 2. Compress
tar -czf financial-tracker.tar.gz .next/ public/ package.json prisma/

# 3. Upload ke cPanel
# - Upload financial-tracker.tar.gz
# - Extract
# - Setup Node.js app
# - Start! 🎉
```

#### 🏆 **Opsi 4: VPS (Full Control)**
```bash
# 1. Build aplikasi
bun run build

# 2. Deploy otomatis
./deploy.sh vps

# 3. Setup Nginx & SSL
# - Follow instructions in DEPLOYMENT.md
```

---

## 🔧 Konfigurasi Minimal

### 1. Environment Variables
Buat file `.env.production`:
```env
DATABASE_URL="file:./dev.db"
NODE_ENV="production"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here-minimum-32-characters"
```

### 2. Build & Run
```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Build application
bun run build

# Start production server
NODE_ENV=production bun start
```

---

## 📱 Test di Local Production
```bash
# Test production build locally
NODE_ENV=production bun start

# Aplikasi akan berjalan di http://localhost:3000
```

---

## 🌐 Domain Setup

### Setelah Deploy:
1. **Custom Domain:** Tambahkan domain di hosting dashboard
2. **SSL:** Aktifkan SSL certificate (gratis di Let's Encrypt)
3. **DNS:** Point A record ke server IP

---

## 🎯 Rekomendasi

### **Untuk Pemula:**
- Gunakan **Vercel** (gratis, mudah, auto-deploy)
- Tidak perlu setup server
- Domain gratis: `your-app.vercel.app`

### **Untuk Bisnis:**
- Gunakan **VPS** (DigitalOcean, Vultr, Linode)
- Full control over data
- Custom domain & SSL
- Scalable

### **Budget Terbatas:**
- Gunakan **Shared Hosting** (cPanel)
- Murah (mulai $5/bulan)
- Support included

---

## 🚨 Checklist Sebelum Deploy

- [ ] Build berhasil: `bun run build`
- [ ] Environment variables terisi
- [ ] Database ready (SQLite/PostgreSQL)
- [ ] Test lokal production: `NODE_ENV=production bun start`
- [ ] Backup data penting

---

## 🆘 Bantuan

### **Error Common:**
1. **Build failed:** Check `package.json` dan dependencies
2. **Database error:** Check `DATABASE_URL` format
3. **404 errors:** Check routing dan static files

### **Contact:**
- 📧 Email: support@financial-tracker.com
- 💬 Discord: [Join Community](https://discord.gg/financial-tracker)
- 📖 Docs: [Full Documentation](./DEPLOYMENT.md)

---

## 🎉 Selamat Deploy!

Aplikasi Financial Tracker Anda siap digunakan! 🚀

**Next Steps:**
1. Pilih hosting provider
2. Follow deployment steps
3. Setup custom domain
4. Monitor performance
5. Backup data regularly

Happy tracking! 💰📊