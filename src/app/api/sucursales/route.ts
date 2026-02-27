import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener todas las sucursales
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda');

    const where: any = { activa: true };

    if (busqueda) {
      where.nombre = { contains: busqueda };
    }

    const sucursales = await db.sucursal.findMany({
      where,
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(sucursales);
  } catch (error) {
    console.error('Error al obtener sucursales:', error);
    return NextResponse.json({ error: 'Error al obtener sucursales' }, { status: 500 });
  }
}

// POST - Crear nueva sucursal
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const sucursal = await db.sucursal.create({
      data: {
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        principal: data.principal || false,
        activa: true
      }
    });

    return NextResponse.json(sucursal);
  } catch (error) {
    console.error('Error al crear sucursal:', error);
    return NextResponse.json({ error: 'Error al crear sucursal' }, { status: 500 });
  }
}

// PUT - Actualizar sucursal
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();

    const sucursal = await db.sucursal.update({
      where: { id: data.id },
      data: {
        nombre: data.nombre,
        direccion: data.direccion || null,
        telefono: data.telefono || null,
        principal: data.principal || false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json(sucursal);
  } catch (error) {
    console.error('Error al actualizar sucursal:', error);
    return NextResponse.json({ error: 'Error al actualizar sucursal' }, { status: 500 });
  }
}

// DELETE - Eliminar sucursal (soft delete)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pin = searchParams.get('pin');

    // Verificar PIN
    if (pin !== '2024') {
      return NextResponse.json({ error: 'PIN incorrecto' }, { status: 401 });
    }

    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }

    // Verificar si hay productos en esta sucursal
    const productosEnSucursal = await db.producto.count({
      where: { sucursalId: id, activo: true }
    });

    if (productosEnSucursal > 0) {
      return NextResponse.json({
        error: `No se puede eliminar. Hay ${productosEnSucursal} productos en esta sucursal`
      }, { status: 400 });
    }

    await db.sucursal.update({
      where: { id },
      data: { activa: false }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error al eliminar sucursal:', error);
    return NextResponse.json({ error: 'Error al eliminar sucursal' }, { status: 500 });
  }
}
