# 📦 Financial Tracker - Deployment Guide

## 🚀 Opsi Deployment

### Opsi 1: Vercel (Recommended untuk Pemula)
**Keuntungan:** Mudah, gratis untuk personal use, auto-deployment dari GitHub

### Opsi 2: Netlify
**Keuntungan:** Mudah, gratis, good for static sites

### Opsi 3: Shared Hosting (cPanel, Plesk)
**Keuntungan:** Murah, banyak pilihan, control penuh

### Opsi 4: VPS/Dedicated Server
**Keuntungan:** Full control, scalable, best for production

---

## 🛠️ Persiapan Sebelum Deployment

### 1. Environment Variables
Buat file `.env.production`:

```env
# Database
DATABASE_URL="file:./dev.db"

# Next.js
NODE_ENV="production"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key-here"

# Z-AI Web Dev SDK (jika digunakan)
Z_AI_WEB_DEV_SDK_API_KEY="your-api-key"
```

### 2. Build Production
```bash
# Install dependencies
bun install

# Generate Prisma client
bun run db:generate

# Build application
bun run build
```

---

## 📋 Step-by-Step Deployment

### 🌐 Opsi 1: Vercel (Paling Mudah)

#### Prerequisites:
- Akun GitHub
- Akun Vercel

#### Steps:
1. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/username/financial-tracker.git
   git push -u origin main
   ```

2. **Deploy ke Vercel:**
   - Buka [vercel.com](https://vercel.com)
   - Sign in dengan GitHub
   - Click "New Project"
   - Import repository GitHub Anda
   - Vercel akan auto-detect Next.js
   - Add environment variables di Vercel dashboard
   - Click "Deploy"

3. **Setup Database di Vercel:**
   - Di Vercel dashboard, buka "Storage" tab
   - Pilih "PostgreSQL" (recommended) atau "SQLite"
   - Copy connection string ke environment variables

#### Auto-deployment:
- Setiap push ke main branch akan auto-deploy
- Preview deployments untuk setiap PR

---

### 🌐 Opsi 2: Netlify

#### Prerequisites:
- Akun GitHub
- Akun Netlify

#### Steps:
1. **Build untuk static export:**
   Tambahkan di `next.config.js`:
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     trailingSlash: true,
     images: {
       unoptimized: true
     }
   }
   module.exports = nextConfig
   ```

2. **Build:**
   ```bash
   bun run build
   ```

3. **Deploy ke Netlify:**
   - Buka [netlify.com](https://netlify.com)
   - Sign in dengan GitHub
   - Drag & drop folder `out` ke Netlify
   - Atur environment variables

---

### 🌐 Opsi 3: Shared Hosting (cPanel/Plesk)

#### Prerequisites:
- Shared hosting dengan Node.js support
- SSH access atau cPanel

#### Steps:
1. **Upload Files:**
   ```bash
   # Build aplikasi
   bun run build
   
   # Compress folder
   tar -czf financial-tracker.tar.gz .next/ public/ package.json prisma/ next.config.js
   ```

2. **Upload ke Hosting:**
   - Upload `financial-tracker.tar.gz` via cPanel File Manager
   - Extract di hosting
   - Atur permissions (755 untuk folders, 644 untuk files)

3. **Setup Database:**
   - Buat database via cPanel
   - Update `DATABASE_URL` di `.env.production`
   - Run migrations:
   ```bash
   bun run db:push
   ```

4. **Start Application:**
   - Di cPanel, buka "Setup Node.js App"
   - Set application root folder
   - Set startup file: `.next/standalone/server.js`
   - Set Node.js version (18+)
   - Click "Create"

---

### 🌐 Opsi 4: VPS/Dedicated Server

#### Prerequisites:
- VPS dengan Ubuntu 20.04+ atau CentOS 8+
- SSH access
- Domain name

#### Steps:
1. **Setup Server:**
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js 18+
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Install PM2 (process manager)
   sudo npm install -g pm2
   ```

2. **Deploy Application:**
   ```bash
   # Clone repository
   git clone https://github.com/username/financial-tracker.git
   cd financial-tracker
   
   # Install dependencies
   bun install
   
   # Setup environment
   cp .env.example .env.production
   # Edit .env.production dengan nano atau vim
   
   # Build application
   bun run build
   
   # Setup database
   bun run db:push
   
   # Start dengan PM2
   pm2 start ecosystem.config.js
   pm2 save
   pm2 startup
   ```

3. **Setup Nginx:**
   Buat `/etc/nginx/sites-available/financial-tracker`:
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Enable Site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/financial-tracker /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

5. **Setup SSL dengan Let's Encrypt:**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
   ```

---

## 📁 File yang Diperlukan untuk Deployment

### 1. `ecosystem.config.js` (untuk PM2)
```javascript
module.exports = {
  apps: [{
    name: 'financial-tracker',
    script: '.next/standalone/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

### 2. `.gitignore`
```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build
dist

# Misc
.DS_Store
*.pem

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env*.local
.env

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Database
*.db
*.sqlite
*.sqlite-journal

# Logs
dev.log
server.log
```

### 3. `Dockerfile` (Opsional)
```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN bun run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

---

## 🔧 Konfigurasi Khusus

### Database Production
Untuk production, disarankan menggunakan PostgreSQL:

1. **Setup PostgreSQL:**
   - Di Vercel: gunakan Vercel Postgres
   - Di shared hosting: cPanel PostgreSQL
   - Di VPS: install PostgreSQL manual

2. **Update Schema:**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Migration:**
   ```bash
   bun run db:generate
   bun run db:push
   ```

### Environment Variables Production
```env
# Required
DATABASE_URL="postgresql://username:password@host:port/database"
NODE_ENV="production"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="random-64-character-string"

# Optional
Z_AI_WEB_DEV_SDK_API_KEY="your-api-key"
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **Build Error:**
   - Pastikan `NODE_ENV=production`
   - Check environment variables
   - Clear cache: `rm -rf .next`

2. **Database Connection Error:**
   - Check DATABASE_URL format
   - Ensure database is accessible
   - Run migrations: `bun run db:push`

3. **Static Assets 404:**
   - Ensure `public` folder is copied
   - Check `next.config.js` asset prefix

4. **API Routes 404:**
   - Ensure serverless functions are deployed
   - Check `vercel.json` configuration

---

## 📊 Monitoring & Maintenance

### 1. Health Check
Buat `/api/health`:
```javascript
export async function GET() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString() 
  })
}
```

### 2. Error Monitoring
- Gunakan Vercel Analytics
- Setup Sentry untuk error tracking
- Monitor PM2 logs: `pm2 logs`

### 3. Backup Database
```bash
# SQLite
cp prisma/dev.db backup-$(date +%Y%m%d).db

# PostgreSQL
pg_dump financial_tracker > backup-$(date +%Y%m%d).sql
```

---

## 🎉 Deployment Checklist

Sebelum go-live, pastikan:

- [ ] Environment variables terkonfigurasi dengan benar
- [ ] Database production sudah disetup
- [ ] SSL certificate terinstall
- [ ] Custom domain terkonfigurasi
- [ ] Error monitoring ter-setup
- [ ] Backup strategy sudah ada
- [ ] Testing di production environment sudah dilakukan
- [ ] Performance optimization sudah dilakukan

---

## 🆘 Bantuan

Jika mengalami masalah:

1. **Check logs:** `pm2 logs` atau Vercel/Netlify logs
2. **Verify environment:** Pastikan semua env variables terisi
3. **Test locally:** `NODE_ENV=production bun run build && bun start`
4. **Check documentation:** [Next.js Deployment](https://nextjs.org/docs/deployment)

Selamat meng-deploy! 🚀