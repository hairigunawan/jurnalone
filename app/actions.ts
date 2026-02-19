// app/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { Trade, Transaction } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getTrades(): Promise<Trade[]> {
  try {
    return await prisma.trade.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error("Error fetching trades:", error);
    return [];
  }
}

export async function addTrade(data: Partial<Trade>) {
  try {
    const newTrade = await prisma.trade.create({
      data: {
        dateEntry: String(data.dateEntry),
        dateExit: data.dateExit ? String(data.dateExit) : null,
        instrument: String(data.instrument),
        position: String(data.position),
        status: String(data.status || "Closed"),
        entry: Number(data.entry),
        exit: data.exit ? Number(data.exit) : null,
        tp: data.tp ? Number(data.tp) : null,
        sl: data.sl ? Number(data.sl) : null,
        lot: Number(data.lot),
        fees: Number(data.fees),
        pnl: Number(data.pnl),
        rate: Number(data.rate),
        result: String(data.result),
        setup: data.setup ? String(data.setup) : null,
        timeframe: data.timeframe ? String(data.timeframe) : null,
        notes: data.notes || null,
      },
    })
    revalidatePath('/')
    return newTrade
  } catch (error) {
    console.error("Error creating trade:", error);
    throw new Error("Gagal menyimpan trade ke database");
  }
}

export async function getTransactions(): Promise<Transaction[]> {
  try {
    return await prisma.transaction.findMany({
      orderBy: { createdAt: 'desc' },
    })
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return [];
  }
}

export async function addTransaction(data: Partial<Transaction>) {
  try {
    // Validasi data sebelum simpan
    if (!data.amount || isNaN(Number(data.amount))) {
      throw new Error("Jumlah (amount) harus berupa angka valid");
    }

    const newTx = await prisma.transaction.create({
      data: {
        date: String(data.date),
        type: String(data.type),
        amount: Number(data.amount),
        note: data.note ? String(data.note) : null,
      },
    })
    revalidatePath('/')
    return newTx
  } catch (error) {
    console.error("Error creating transaction in DB:", error);
    // Kita lempar error yang lebih spesifik agar tertangkap di catch UI
    throw error;
  }
}

export async function deleteTrade(id: number) {
  try {
    await prisma.trade.delete({
      where: { id },
    })
    revalidatePath('/')
  } catch (error) {
    console.error("Error deleting trade:", error);
    throw new Error("Gagal menghapus data");
  }
}

export async function updateTrade(id: number, data: Partial<Trade>) {
  try {
    const updatedTrade = await prisma.trade.update({
      where: { id },
      data: {
        dateEntry: String(data.dateEntry),
        dateExit: data.dateExit ? String(data.dateExit) : null,
        instrument: String(data.instrument),
        position: String(data.position),
        status: String(data.status || "Closed"),
        entry: Number(data.entry),
        exit: data.exit ? Number(data.exit) : null,
        tp: data.tp ? Number(data.tp) : null,
        sl: data.sl ? Number(data.sl) : null,
        lot: Number(data.lot),
        fees: Number(data.fees),
        pnl: Number(data.pnl),
        rate: Number(data.rate),
        result: String(data.result),
        setup: data.setup ? String(data.setup) : null,
        timeframe: data.timeframe ? String(data.timeframe) : null,
        notes: data.notes || null,
      },
    })
    revalidatePath('/')
    return updatedTrade
  } catch (error) {
    console.error("Error updating trade:", error);
    throw new Error("Gagal memperbarui trade di database");
  }
}
