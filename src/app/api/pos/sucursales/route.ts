import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const sucursales = await db.sucursal.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(sucursales);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const sucursal = await db.sucursal.create({
      data: {
        nombre: body.nombre,
        direccion: body.direccion,
        telefono: body.telefono
      }
    });
    return NextResponse.json({ success: true, sucursal });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al crear sucursal' }, { status: 500 });
  }
}
