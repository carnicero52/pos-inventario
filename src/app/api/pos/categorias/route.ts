import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar categorías
export async function GET() {
  try {
    const categorias = await db.categoria.findMany({
      where: { activa: true },
      include: {
        _count: { select: { productos: true } }
      },
      orderBy: { nombre: 'asc' }
    });

    return NextResponse.json(categorias);
  } catch (error) {
    console.error('Error listando categorías:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear categoría
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, descripcion, color } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    const existente = await db.categoria.findUnique({
      where: { nombre }
    });

    if (existente) {
      return NextResponse.json({ error: 'La categoría ya existe' }, { status: 400 });
    }

    const categoria = await db.categoria.create({
      data: {
        nombre,
        descripcion: descripcion || null,
        color: color || '#10b981'
      }
    });

    return NextResponse.json({ success: true, categoria });
  } catch (error) {
    console.error('Error creando categoría:', error);
    return NextResponse.json({ error: 'Error al crear categoría' }, { status: 500 });
  }
}

// PUT - Actualizar/Eliminar categoría
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin, ...data } = body;

    if (pin) {
      if (pin !== '2024') {
        return NextResponse.json({ error: 'PIN de seguridad incorrecto' }, { status: 403 });
      }

      await db.categoria.update({
        where: { id },
        data: { activa: false }
      });

      return NextResponse.json({ success: true, message: 'Categoría eliminada' });
    }

    const categoria = await db.categoria.update({
      where: { id },
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion || null,
        color: data.color || '#10b981'
      }
    });

    return NextResponse.json({ success: true, categoria });
  } catch (error) {
    console.error('Error actualizando categoría:', error);
    return NextResponse.json({ error: 'Error al actualizar categoría' }, { status: 500 });
  }
}
