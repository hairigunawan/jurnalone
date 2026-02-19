// app/api/trades/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Next.js 15+ Route Handler for deleting a trade.
 * Note: params must be awaited as it is a Promise in recent versions.
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json({ error: 'ID tidak ditemukan' }, { status: 400 });
    }

    await prisma.trade.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json({ message: 'Trade berhasil dihapus' });
  } catch (error) {
    console.error("Delete API Error:", error);
    return NextResponse.json({ error: 'Gagal menghapus trade dari database' }, { status: 500 });
  }
}
