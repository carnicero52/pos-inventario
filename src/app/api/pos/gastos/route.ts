import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar gastos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const categoria = searchParams.get('categoria');
    const sucursalId = searchParams.get('sucursalId');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {};

    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      where.fecha = { gte: inicio, lte: fin };
    }

    if (categoria) where.categoria = categoria;
    if (sucursalId) where.sucursalId = sucursalId;

    const gastos = await db.gasto.findMany({
      where,
      include: {
        sucursal: true,
        usuario: { select: { id: true, nombre: true } }
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(gastos);
  } catch (error) {
    console.error('Error listando gastos:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear gasto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { concepto, monto, categoria, sucursalId, usuarioId, comprobante, notas } = body;

    if (!concepto || !monto) {
      return NextResponse.json({ error: 'Concepto y monto son requeridos' }, { status: 400 });
    }

    // Obtener sucursal por defecto
    let sucursalFinal = sucursalId;
    if (!sucursalFinal) {
      const sucursal = await db.sucursal.findFirst({ where: { activa: true } });
      sucursalFinal = sucursal?.id;
    }

    const gasto = await db.gasto.create({
      data: {
        concepto,
        monto: parseFloat(monto),
        categoria: categoria || 'otros',
        sucursalId: sucursalFinal || 'default',
        usuarioId: usuarioId || null,
        comprobante: comprobante || null,
        notas: notas || null
      }
    });

    return NextResponse.json({ success: true, gasto });
  } catch (error) {
    console.error('Error creando gasto:', error);
    return NextResponse.json({ error: 'Error al crear gasto' }, { status: 500 });
  }
}

// PUT - Actualizar/Eliminar gasto
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin, ...data } = body;

    if (pin) {
      if (pin !== '2024') {
        return NextResponse.json({ error: 'PIN de seguridad incorrecto' }, { status: 403 });
      }

      await db.gasto.delete({ where: { id } });
      return NextResponse.json({ success: true, message: 'Gasto eliminado' });
    }

    const gasto = await db.gasto.update({
      where: { id },
      data: {
        concepto: data.concepto,
        monto: parseFloat(data.monto),
        categoria: data.categoria || 'otros',
        comprobante: data.comprobante || null,
        notas: data.notas || null
      }
    });

    return NextResponse.json({ success: true, gasto });
  } catch (error) {
    console.error('Error actualizando gasto:', error);
    return NextResponse.json({ error: 'Error al actualizar gasto' }, { status: 500 });
  }
}

// DELETE - Eliminar gasto
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pin = searchParams.get('pin');

    if (pin !== '2024') {
      return NextResponse.json({ error: 'PIN de seguridad incorrecto' }, { status: 403 });
    }

    await db.gasto.delete({ where: { id: id! } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando gasto:', error);
    return NextResponse.json({ error: 'Error al eliminar gasto' }, { status: 500 });
  }
}
