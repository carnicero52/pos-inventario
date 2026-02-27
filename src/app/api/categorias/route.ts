import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const categorias = await db.categoria.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(categorias);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const categoria = await db.categoria.create({
      data: {
        id: nanoid(),
        nombre: body.nombre,
        descripcion: body.descripcion,
        activa: true
      }
    });
    
    return NextResponse.json({ success: true, categoria });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    await db.categoria.update({
      where: { id: body.id },
      data: {
        nombre: body.nombre,
        descripcion: body.descripcion,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
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
    
    await db.categoria.update({
      where: { id: id! },
      data: { activa: false }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
