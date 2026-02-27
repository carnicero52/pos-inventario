import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Listar compras
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const proveedorId = searchParams.get('proveedorId');
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

    if (proveedorId) where.proveedorId = proveedorId;
    if (sucursalId) where.sucursalId = sucursalId;

    const compras = await db.compra.findMany({
      where,
      include: {
        proveedor: true,
        sucursal: true,
        detalles: {
          include: {
            producto: true
          }
        }
      },
      orderBy: { fecha: 'desc' }
    });

    return NextResponse.json(compras);
  } catch (error) {
    console.error('Error listando compras:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear compra
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { proveedorId, sucursalId, numeroFactura, fechaFactura, notas, detalles } = body;

    if (!detalles || detalles.length === 0) {
      return NextResponse.json({ error: 'No hay items en la compra' }, { status: 400 });
    }

    // Obtener sucursal por defecto
    let sucursalFinal = sucursalId;
    if (!sucursalFinal) {
      const sucursal = await db.sucursal.findFirst({ where: { activa: true } });
      sucursalFinal = sucursal?.id;
    }

    // Calcular totales
    let subtotal = 0;
    for (const item of detalles) {
      subtotal += parseFloat(item.costoUnitario) * parseInt(item.cantidad);
    }

    // Generar número de compra
    const ultimaCompra = await db.compra.findFirst({
      orderBy: { createdAt: 'desc' },
      select: { numeroCompra: true }
    });

    let numeroCompra = 'COMP-00000001';
    if (ultimaCompra) {
      const ultimo = parseInt(ultimaCompra.numeroCompra.replace('COMP-', ''));
      numeroCompra = `COMP-${(ultimo + 1).toString().padStart(8, '0')}`;
    }

    // Crear compra
    const compra = await db.compra.create({
      data: {
        numeroCompra,
        proveedorId: proveedorId || null,
        sucursalId: sucursalFinal || 'default',
        subtotal,
        itbis: 0,
        total: subtotal,
        numeroFactura: numeroFactura || null,
        fechaFactura: fechaFactura ? new Date(fechaFactura) : null,
        notas: notas || null,
        detalles: {
          create: detalles.map((item: { productoId: string; cantidad: number; costoUnitario: number }) => ({
            productoId: item.productoId,
            cantidad: parseInt(item.cantidad),
            costoUnitario: parseFloat(item.costoUnitario),
            subtotal: parseFloat(item.costoUnitario) * parseInt(item.cantidad)
          }))
        }
      },
      include: {
        detalles: { include: { producto: true } }
      }
    });

    // Actualizar stock de productos
    for (const item of detalles) {
      const stockSucursal = await db.productoSucursal.findFirst({
        where: {
          productoId: item.productoId,
          sucursalId: sucursalFinal
        }
      });

      if (stockSucursal) {
        await db.productoSucursal.update({
          where: { id: stockSucursal.id },
          data: { stock: stockSucursal.stock + parseInt(item.cantidad) }
        });
      } else {
        await db.productoSucursal.create({
          data: {
            productoId: item.productoId,
            sucursalId: sucursalFinal,
            stock: parseInt(item.cantidad),
            stockMinimo: 5
          }
        });
      }

      // Actualizar costo del producto
      await db.producto.update({
        where: { id: item.productoId },
        data: { costo: parseFloat(item.costoUnitario) }
      });
    }

    return NextResponse.json({ success: true, compra });
  } catch (error) {
    console.error('Error creando compra:', error);
    return NextResponse.json({ error: 'Error al crear compra' }, { status: 500 });
  }
}

// PUT - Anular compra
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, pin } = body;

    if (pin !== '2024') {
      return NextResponse.json({ error: 'PIN de seguridad incorrecto' }, { status: 403 });
    }

    const compra = await db.compra.findUnique({
      where: { id },
      include: { detalles: true }
    });

    if (!compra) {
      return NextResponse.json({ error: 'Compra no encontrada' }, { status: 404 });
    }

    if (compra.estado === 'cancelada') {
      return NextResponse.json({ error: 'La compra ya está cancelada' }, { status: 400 });
    }

    // Actualizar estado
    await db.compra.update({
      where: { id },
      data: { estado: 'cancelada' }
    });

    // Revertir stock
    for (const detalle of compra.detalles) {
      const stockSucursal = await db.productoSucursal.findFirst({
        where: {
          productoId: detalle.productoId,
          sucursalId: compra.sucursalId
        }
      });

      if (stockSucursal) {
        await db.productoSucursal.update({
          where: { id: stockSucursal.id },
          data: { stock: stockSucursal.stock - detalle.cantidad }
        });
      }
    }

    return NextResponse.json({ success: true, message: 'Compra cancelada' });
  } catch (error) {
    console.error('Error cancelando compra:', error);
    return NextResponse.json({ error: 'Error al cancelar compra' }, { status: 500 });
  }
}
