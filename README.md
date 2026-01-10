💰 Financial Tracker
Aplikasi pencatatan keuangan modern dengan multi-profil, dashboard interaktif, dan manajemen target tabungan.

✨ Fitur Utama
🏠 Dashboard
Real-time Charts - Visualisasi arus kas 6 bulan terakhir
Financial Health Metrics - Rasio kesehatan keuangan dengan status indicator
Savings Progress - Tracking progress target tabungan
Category Breakdown - Analisis pengeluaran per kategori
Monthly Trends - Tren keuangan bulanan
Export Functionality - Download laporan ke Excel
💸 Kas Masuk
Form Input - Tambah pemasukan dengan kategori
Category Management - Atur kategori pemasukan
Edit & Delete - Kelola transaksi pemasukan
Statistics - Total dan rata-rata pemasukan
Date Filtering - Filter berdasarkan tanggal
💳 Kas Keluar
Form Input - Tambah pengeluaran dengan kategori
Category Management - Atur kategori pengeluaran
Edit & Delete - Kelola transaksi pengeluaran
Statistics - Total dan rata-rata pengeluaran
Date Filtering - Filter berdasarkan tanggal
🎯 Target Tabungan
Goal Setting - Set target tabungan dengan jangka waktu
Automatic Allocation - Alokasi otomatis dari pemasukan
Progress Tracking - Monitor pencapaian target
Multiple Goals - Kelola beberapa target sekaligus
Deadline Management - Tracking sisa waktu target
📊 Laporan
Transaction History - Riwayat semua transaksi
Savings Summary - Ringkasan target tabungan
Data Export - Export ke Excel/CSV
Period Filtering - Filter berdasarkan periode
Category Analysis - Analisis per kategori
👥 Multi-Profil System
Profile Management - Tambah, edit, hapus profil
Session Persistence - Sesi profil tersimpan otomatis
Data Isolation - Data terpisah per profil
Quick Switching - Ganti profil tanpa reload
Profile Indicators - Visual indicators untuk profil aktif
🛠️ Tech Stack
Framework: Next.js 15 with App Router
Language: TypeScript 5
Database: Prisma ORM with SQLite
Styling: Tailwind CSS 4
UI Components: shadcn/ui (New York style)
Icons: Lucide React
State Management: React Query + Zustand
Charts: Recharts
Forms: React Hook Form + Zod
🚀 Quick Start
Prerequisites
Node.js 18+
Bun atau npm
Git
Installation
bash

# Clone repository
git clone https://github.com/username/financial-tracker.git
cd financial-tracker

# Install dependencies
bun install

# Setup database
bun run db:generate
bun run db:push

# Run development server
bun run dev
Environment Variables
Copy .env.example to .env.local:

env

DATABASE_URL="file:./dev.db"
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key-here"
📱 Responsive Design
Mobile First - Optimized for mobile devices
Desktop Enhancement - Enhanced experience on larger screens
Touch Friendly - Large touch targets for mobile
Adaptive Layout - Layout adjusts to screen size
Dark Theme - Modern black theme with high contrast
🔐 Security Features
Session Management - Secure session handling
Data Isolation - User data separated by profile
Input Validation - Form validation with Zod schemas
SQL Injection Prevention - Prisma ORM protection
XSS Protection - Built-in Next.js security
📊 Database Schema
Core Models
Profil - User profiles with session management
Transaksi - Financial transactions (income/expense)
KategoriPemasukan - Income categories
KategoriPengeluaran - Expense categories
TargetTabungan - Savings goals
AlokasiTabungan - Automatic allocation tracking
🚀 Deployment
Vercel (Recommended)
bash

# Deploy to Vercel
bun run build
# Connect GitHub repo to Vercel
# Auto-deploy on push
Other Platforms
Netlify - Static export
Shared Hosting - Node.js support
VPS - Full control deployment
📈 Performance
Optimized Build - Next.js standalone output
Static Generation - Pre-built pages where possible
Image Optimization - Next.js Image component
Bundle Splitting - Code splitting by routes
Caching Strategy - Efficient data fetching
🧪 Testing
bash

# Run linting
bun run lint

# Build test
bun run build

# Production test
NODE_ENV=production bun start
🤝 Contributing
Fork the repository
Create feature branch (git checkout -b feature/amazing-feature)
Commit changes (git commit -m 'Add amazing feature')
Push to branch (git push origin feature/amazing-feature)
Open Pull Request
📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

🆘 Support
Documentation: DEPLOYMENT.md
Quick Start: QUICK_START.md
GitHub Guide: GITHUB_GUIDE.md
Issues: GitHub Issues
🌟 Acknowledgments
Next.js - The React Framework
Prisma - Next-generation ORM
Tailwind CSS - Utility-first CSS
shadcn/ui - Beautiful UI components
Lucide - Beautiful icons
Built with ❤️ for personal finance management 💰📊
