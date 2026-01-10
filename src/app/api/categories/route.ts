import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const profilId = searchParams.get('profilId')
    const jenis = searchParams.get('jenis') // 'MASUK' or 'KELUAR'

    if (!profilId || !jenis) {
      return NextResponse.json({ error: 'ProfilId and jenis are required' }, { status: 400 })
    }

    let categories
    if (jenis === 'MASUK') {
      categories = await db.kategoriPemasukan.findMany({
        where: { profilId },
        include: {
          _count: {
            select: { transaksi: true }
          }
        },
        orderBy: { nama: 'asc' }
      })
    } else {
      categories = await db.kategoriPengeluaran.findMany({
        where: { profilId },
        include: {
          _count: {
            select: { transaksi: true }
          }
        },
        orderBy: { nama: 'asc' }
      })
    }

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { nama, deskripsi, warna, profilId, jenis } = await request.json()
    
    if (!nama || !profilId || !jenis) {
      return NextResponse.json({ 
        error: 'Nama, profilId, and jenis are required' 
      }, { status: 400 })
    }

    let category
    if (jenis === 'MASUK') {
      category = await db.kategoriPemasukan.create({
        data: {
          nama,
          deskripsi,
          warna: warna || '#10b981',
          profilId
        }
      })
    } else {
      category = await db.kategoriPengeluaran.create({
        data: {
          nama,
          deskripsi,
          warna: warna || '#ef4444',
          profilId
        }
      })
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}