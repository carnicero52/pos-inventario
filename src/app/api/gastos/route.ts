import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const gastos = await db.gasto.findMany({
      orderBy: { fecha: 'desc' },
      take: 100
    });
    return NextResponse.json(gastos);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const gasto = await db.gasto.create({
      data: {
        id: nanoid(),
        concepto: body.concepto,
        descripcion: body.descripcion,
        monto: parseFloat(body.monto),
        categoria: body.categoria,
        fecha: new Date()
      }
    });
    
    return NextResponse.json({ success: true, gasto });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pin = searchParams.get('pin');
    
    if (pin !== '2024') {
      return NextResponse.json({ error: 'PIN inválido' }, { status: 403 });
    }
    
    await db.gasto.delete({ where: { id: id! } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
