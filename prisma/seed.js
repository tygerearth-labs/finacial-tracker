const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create default profile if not exists
  const defaultProfile = await prisma.profil.upsert({
    where: { nama: 'Profil Utama' },
    update: {},
    create: {
      nama: 'Profil Utama',
      deskripsi: 'Profil default untuk penggunaan awal',
      isActive: true
    }
  })

  console.log('✅ Default profile created:', defaultProfile.nama)

  // Create income categories
  const incomeCategories = [
    { nama: 'Gaji', deskripsi: 'Pemasukan dari gaji bulanan', warna: '#10b981' },
    { nama: 'Bonus', deskripsi: 'Pemasukan tambahan dari bonus', warna: '#3b82f6' },
    { nama: 'Investasi', deskripsi: 'Pemasukan dari hasil investasi', warna: '#8b5cf6' },
    { nama: 'Usaha Sampingan', deskripsi: 'Pemasukan dari usaha sampingan', warna: '#f59e0b' },
    { nama: 'Lainnya', deskripsi: 'Pemasukan lainnya', warna: '#6b7280' }
  ]

  for (const category of incomeCategories) {
    await prisma.kategoriPemasukan.upsert({
      where: { 
        profilId_nama: {
          profilId: defaultProfile.id,
          nama: category.nama
        }
      },
      update: category,
      create: {
        ...category,
        profilId: defaultProfile.id
      }
    })
  }

  console.log('✅ Income categories created')

  // Create expense categories
  const expenseCategories = [
    { nama: 'Makanan', deskripsi: 'Pengeluaran untuk makanan dan minuman', warna: '#ef4444' },
    { nama: 'Transportasi', deskripsi: 'Pengeluaran untuk transportasi', warna: '#f97316' },
    { nama: 'Belanja', deskripsi: 'Pengeluaran untuk belanja kebutuhan', warna: '#eab308' },
    { nama: 'Tagihan', deskripsi: 'Pengeluaran untuk tagihan bulanan', warna: '#a855f7' },
    { nama: 'Hiburan', deskripsi: 'Pengeluaran untuk hiburan', warna: '#ec4899' },
    { nama: 'Kesehatan', deskripsi: 'Pengeluaran untuk kesehatan', warna: '#14b8a6' },
    { nama: 'Pendidikan', deskripsi: 'Pengeluaran untuk pendidikan', warna: '#0ea5e9' },
    { nama: 'Lainnya', deskripsi: 'Pengeluaran lainnya', warna: '#6b7280' }
  ]

  for (const category of expenseCategories) {
    await prisma.kategoriPengeluaran.upsert({
      where: { 
        profilId_nama: {
          profilId: defaultProfile.id,
          nama: category.nama
        }
      },
      update: category,
      create: {
        ...category,
        profilId: defaultProfile.id
      }
    })
  }

  console.log('✅ Expense categories created')

  // Create sample savings targets
  const savingsTargets = [
    {
      nama: 'Dana Darurat',
      deskripsi: 'Dana darurat untuk kebutuhan tak terduga',
      target: 10000000,
      tanggalMulai: new Date(),
      tanggalTarget: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      alokasiPersen: 10
    },
    {
      nama: 'Gadget Baru',
      deskripsi: 'Dana untuk membeli gadget baru',
      target: 8000000,
      tanggalMulai: new Date(),
      tanggalTarget: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000), // 4 months
      alokasiPersen: 5
    },
    {
      nama: 'Liburan',
      deskripsi: 'Dana untuk liburan tahunan',
      target: 15000000,
      tanggalMulai: new Date(),
      tanggalTarget: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      alokasiPersen: 5
    }
  ]

  for (const target of savingsTargets) {
    await prisma.targetTabungan.upsert({
      where: { 
        profilId_nama: {
          profilId: defaultProfile.id,
          nama: target.nama
        }
      },
      update: target,
      create: {
        ...target,
        profilId: defaultProfile.id
      }
    })
  }

  console.log('✅ Savings targets created')

  // Create sample transactions
  const incomeCategory = await prisma.kategoriPemasukan.findFirst({
    where: { profilId: defaultProfile.id, nama: 'Gaji' }
  })

  const expenseCategory = await prisma.kategoriPengeluaran.findFirst({
    where: { profilId: defaultProfile.id, nama: 'Makanan' }
  })

  if (incomeCategory) {
    await prisma.transaksi.create({
      data: {
        jenis: 'MASUK',
        nominal: 5000000,
        deskripsi: 'Gaji bulanan Januari',
        tanggal: new Date(),
        kategoriPemasukanId: incomeCategory.id,
        profilId: defaultProfile.id
      }
    })
  }

  if (expenseCategory) {
    await prisma.transaksi.create({
      data: {
        jenis: 'KELUAR',
        nominal: 1500000,
        deskripsi: 'Belanja bulanan',
        tanggal: new Date(),
        kategoriPengeluaranId: expenseCategory.id,
        profilId: defaultProfile.id
      }
    })
  }

  console.log('✅ Sample transactions created')
  console.log('🎉 Database seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })