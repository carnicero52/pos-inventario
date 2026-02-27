import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar proveedores
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { activo: true };

    const proveedores = await db.proveedor.findMany({
      where,
      include: {
        _count: { select: { productos: true, compras: true } }
      },
      orderBy: { nombre: 'asc' }
    });

    let resultados = proveedores;

    if (busqueda) {
      const termino = busqueda.toLowerCase();
      resultados = proveedores.filter(p =>
        p.nombre.toLowerCase().includes(termino) ||
        (p.contacto && p.contacto.toLowerCase().includes(termino)) ||
        (p.documento && p.documento.includes(termino))
      );
    }

    return NextResponse.json(resultados);
  } catch (error) {
    console.error('Error listando proveedores:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear proveedor
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, contacto, documento, email, telefono, direccion, notas } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    if (documento) {
      const existente = await db.proveedor.findUnique({
        where: { documento }
      });
      if (existente) {
        return NextResponse.json({ error: 'El documento ya está registrado' }, { status: 400 });
      }
    }

    const proveedor = await db.proveedor.create({
      data: {
        nombre,
        contacto: contacto || null,
        documento: documento || null,
        email: email || null,
        telefono: telefono || null,
        direccion: direccion || null,
        notas: notas || null
      }
    });

    return NextResponse.json({ success: true, proveedor });
  } catch (error) {
    console.error('Error creando proveedor:', error);
    return NextResponse.json({ error: 'Error al crear proveedor' }, { status: 500 });
  }
}

// PUT - Actualizar/Eliminar proveedor
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin, ...data } = body;

    if (pin) {
      if (pin !== '2024') {
        return NextResponse.json({ error: 'PIN de seguridad incorrecto' }, { status: 403 });
      }

      await db.proveedor.update({
        where: { id },
        data: { activo: false }
      });

      return NextResponse.json({ success: true, message: 'Proveedor eliminado' });
    }

    const proveedor = await db.proveedor.update({
      where: { id },
      data: {
        nombre: data.nombre,
        contacto: data.contacto || null,
        documento: data.documento || null,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        notas: data.notas || null
      }
    });

    return NextResponse.json({ success: true, proveedor });
  } catch (error) {
    console.error('Error actualizando proveedor:', error);
    return NextResponse.json({ error: 'Error al actualizar proveedor' }, { status: 500 });
  }
}
