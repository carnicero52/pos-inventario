import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// GET - Listar ventas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limite = searchParams.get('limite');
    const desde = searchParams.get('desde');
    const hasta = searchParams.get('hasta');
    
    let where: any = {};
    
    if (desde && hasta) {
      where.fecha = {
        gte: new Date(desde),
        lte: new Date(hasta + 'T23:59:59')
      };
    }
    
    const ventas = await db.venta.findMany({
      where,
      include: {
        cliente: true,
        usuario: true,
        sucursal: true,
        detalles: {
          include: { producto: true }
        }
      },
      orderBy: { fecha: 'desc' },
      take: limite ? parseInt(limite) : 100
    });
    
    return NextResponse.json(ventas);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear venta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, clienteId, subtotal, itbis, descuento, total, metodoPago, montoRecibido, cambio, sucursalId, usuarioId, ncf } = body;
    
    // Generar número de factura
    const ultimaVenta = await db.venta.findFirst({
      orderBy: { numeroFactura: 'desc' }
    });
    
    let numeroFactura = 'B0100000001';
    if (ultimaVenta?.numeroFactura) {
      const ultimo = parseInt(ultimaVenta.numeroFactura.replace('B01', ''));
      numeroFactura = `B01${(ultimo + 1).toString().padStart(8, '0')}`;
    }
    
    // Crear la venta
    const venta = await db.venta.create({
      data: {
        numeroFactura,
        clienteId,
        usuarioId: usuarioId || 'default',
        sucursalId: sucursalId || 'default',
        subtotal,
        itbis,
        descuento,
        total,
        metodoPago,
        montoRecibido,
        cambio,
        ncf,
        estado: 'completada',
        detalles: {
          create: items.map((item: any) => ({
            productoId: item.productoId || 'manual',
            cantidad: item.cantidad,
            precioUnitario: item.precioUnitario,
            costoUnitario: item.costoUnitario || 0,
            subtotal: item.subtotal
          }))
        }
      },
      include: {
        detalles: { include: { producto: true } }
      }
    });
    
    // Descontar stock de productos
    for (const item of items) {
      if (item.productoId && item.productoId !== 'manual') {
        await db.productoSucursal.updateMany({
          where: {
            productoId: item.productoId,
            sucursalId: sucursalId || 'default'
          },
          data: {
            stock: { decrement: item.cantidad }
          }
        });
      }
    }
    
    return NextResponse.json({ success: true, venta });
  } catch (error) {
    console.error('Error creando venta:', error);
    return NextResponse.json({ error: 'Error al procesar venta' }, { status: 500 });
  }
}
