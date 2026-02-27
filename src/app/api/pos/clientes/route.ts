import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar clientes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const busqueda = searchParams.get('busqueda');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = { activo: true };

    const clientes = await db.cliente.findMany({
      where,
      include: {
        _count: { select: { ventas: true } },
        ventas: {
          where: { estado: 'completada' },
          select: { total: true }
        }
      },
      orderBy: { nombre: 'asc' }
    });

    // Calcular total de compras
    let resultados = clientes.map(c => ({
      ...c,
      totalCompras: c.ventas.reduce((sum, v) => sum + v.total, 0),
      cantidadCompras: c._count.ventas
    }));

    // Filtrar por búsqueda
    if (busqueda) {
      const termino = busqueda.toLowerCase();
      resultados = resultados.filter(c =>
        c.nombre.toLowerCase().includes(termino) ||
        (c.apellido && c.apellido.toLowerCase().includes(termino)) ||
        (c.documento && c.documento.includes(termino)) ||
        (c.telefono && c.telefono.includes(termino))
      );
    }

    return NextResponse.json(resultados);
  } catch (error) {
    console.error('Error listando clientes:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear cliente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, apellido, documento, email, telefono, direccion, limiteCredito } = body;

    if (!nombre) {
      return NextResponse.json({ error: 'El nombre es requerido' }, { status: 400 });
    }

    // Verificar documento único
    if (documento) {
      const existente = await db.cliente.findUnique({
        where: { documento }
      });
      if (existente) {
        return NextResponse.json({ error: 'El documento ya está registrado' }, { status: 400 });
      }
    }

    const cliente = await db.cliente.create({
      data: {
        nombre,
        apellido: apellido || null,
        documento: documento || null,
        email: email || null,
        telefono: telefono || null,
        direccion: direccion || null,
        limiteCredito: parseFloat(limiteCredito) || 0
      }
    });

    return NextResponse.json({ success: true, cliente });
  } catch (error) {
    console.error('Error creando cliente:', error);
    return NextResponse.json({ error: 'Error al crear cliente' }, { status: 500 });
  }
}

// PUT - Actualizar/Eliminar cliente
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin, ...data } = body;

    // Si hay PIN, es una eliminación
    if (pin) {
      if (pin !== '2024') {
        return NextResponse.json({ error: 'PIN de seguridad incorrecto' }, { status: 403 });
      }

      await db.cliente.update({
        where: { id },
        data: { activo: false }
      });

      return NextResponse.json({ success: true, message: 'Cliente eliminado' });
    }

    // Actualización normal
    const cliente = await db.cliente.update({
      where: { id },
      data: {
        nombre: data.nombre,
        apellido: data.apellido || null,
        documento: data.documento || null,
        email: data.email || null,
        telefono: data.telefono || null,
        direccion: data.direccion || null,
        limiteCredito: parseFloat(data.limiteCredito) || 0
      }
    });

    return NextResponse.json({ success: true, cliente });
  } catch (error) {
    console.error('Error actualizando cliente:', error);
    return NextResponse.json({ error: 'Error al actualizar cliente' }, { status: 500 });
  }
}
