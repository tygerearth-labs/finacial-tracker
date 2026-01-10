import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Create default profil
  const profil = await prisma.profil.upsert({
    where: { nama: 'Profil Utama' },
    update: {},
    create: {
      nama: 'Profil Utama',
      deskripsi: 'Profil default untuk penggunaan awal',
      isActive: true,
    },
  })

  console.log('Created profil:', profil)

  // Create default kategori pemasukan
  const kategoriPemasukan = [
    { nama: 'Gaji', deskripsi: 'Pemasukan dari gaji bulanan', warna: '#10b981' },
    { nama: 'Bonus', deskripsi: 'Pemasukan tambahan dari bonus', warna: '#3b82f6' },
    { nama: 'Investasi', deskripsi: 'Pemasukan dari hasil investasi', warna: '#8b5cf6' },
    { nama: 'Usaha Sampingan', deskripsi: 'Pemasukan dari usaha sampingan', warna: '#f59e0b' },
    { nama: 'Lainnya', deskripsi: 'Pemasukan lainnya', warna: '#6b7280' },
  ]

  for (const kategori of kategoriPemasukan) {
    await prisma.kategoriPemasukan.upsert({
      where: { 
        profilId_nama: {
          profilId: profil.id,
          nama: kategori.nama
        }
      },
      update: {},
      create: {
        ...kategori,
        profilId: profil.id,
      },
    })
  }

  console.log('Created kategori pemasukan')

  // Create default kategori pengeluaran
  const kategoriPengeluaran = [
    { nama: 'Makanan', deskripsi: 'Pengeluaran untuk makanan dan minuman', warna: '#ef4444' },
    { nama: 'Transportasi', deskripsi: 'Pengeluaran untuk transportasi', warna: '#f97316' },
    { nama: 'Belanja', deskripsi: 'Pengeluaran untuk belanja kebutuhan', warna: '#eab308' },
    { nama: 'Tagihan', deskripsi: 'Pengeluaran untuk tagihan bulanan', warna: '#a855f7' },
    { nama: 'Hiburan', deskripsi: 'Pengeluaran untuk hiburan', warna: '#ec4899' },
    { nama: 'Kesehatan', deskripsi: 'Pengeluaran untuk kesehatan', warna: '#14b8a6' },
    { nama: 'Pendidikan', deskripsi: 'Pengeluaran untuk pendidikan', warna: '#0ea5e9' },
    { nama: 'Lainnya', deskripsi: 'Pengeluaran lainnya', warna: '#6b7280' },
  ]

  for (const kategori of kategoriPengeluaran) {
    await prisma.kategoriPengeluaran.upsert({
      where: { 
        profilId_nama: {
          profilId: profil.id,
          nama: kategori.nama
        }
      },
      update: {},
      create: {
        ...kategori,
        profilId: profil.id,
      },
    })
  }

  console.log('Created kategori pengeluaran')

  // Create sample target tabungan
  const targetTabungan = [
    {
      nama: 'Dana Darurat',
      deskripsi: 'Dana darurat untuk kebutuhan tak terduga',
      target: 10000000,
      tanggalMulai: new Date(),
      tanggalTarget: new Date(Date.now() + 6 * 30 * 24 * 60 * 60 * 1000), // 6 months from now
      alokasiPersen: 10,
    },
    {
      nama: 'Liburan',
      deskripsi: 'Dana untuk liburan tahunan',
      target: 15000000,
      tanggalMulai: new Date(),
      tanggalTarget: new Date(Date.now() + 12 * 30 * 24 * 60 * 60 * 1000), // 12 months from now
      alokasiPersen: 5,
    },
    {
      nama: 'Gadget Baru',
      deskripsi: 'Dana untuk membeli gadget baru',
      target: 8000000,
      tanggalMulai: new Date(),
      tanggalTarget: new Date(Date.now() + 4 * 30 * 24 * 60 * 60 * 1000), // 4 months from now
      alokasiPersen: 5,
    },
  ]

  for (const target of targetTabungan) {
    await prisma.targetTabungan.upsert({
      where: { 
        profilId_nama: {
          profilId: profil.id,
          nama: target.nama
        }
      },
      update: {},
      create: {
        ...target,
        profilId: profil.id,
      },
    })
  }

  console.log('Created target tabungan')

  console.log('Seeding finished.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })