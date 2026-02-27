import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET() {
  try {
    const proveedores = await db.proveedor.findMany({
      where: { activo: true },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(proveedores);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const proveedor = await db.proveedor.create({
      data: {
        id: nanoid(),
        nombre: body.nombre,
        contacto: body.contacto,
        telefono: body.telefono,
        email: body.email,
        direccion: body.direccion,
        nit: body.nit,
        activo: true
      }
    });
    
    return NextResponse.json({ success: true, proveedor });
  } catch (error) {
    return NextResponse.json({ error: 'Error al crear' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    await db.proveedor.update({
      where: { id: body.id },
      data: {
        nombre: body.nombre,
        contacto: body.contacto,
        telefono: body.telefono,
        email: body.email,
        direccion: body.direccion,
        nit: body.nit,
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
    
    await db.proveedor.update({
      where: { id: id! },
      data: { activo: false }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
