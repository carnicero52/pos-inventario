import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Obtener la venta con sus detalles
    const venta = await db.venta.findUnique({
      where: { id },
      include: { 
        detalles: { include: { producto: true } }
      }
    });
    
    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }
    
    if (venta.estado === 'anulada') {
      return NextResponse.json({ error: 'La venta ya está anulada' }, { status: 400 });
    }
    
    // Actualizar estado de la venta
    await db.venta.update({
      where: { id },
      data: {
        estado: 'anulada',
        fechaAnulacion: new Date(),
        motivoAnulacion: 'Anulación autorizada'
      }
    });
    
    // Devolver stock de los productos
    for (const detalle of venta.detalles) {
      if (detalle.productoId && detalle.productoId !== 'manual') {
        await db.productoSucursal.updateMany({
          where: {
            productoId: detalle.productoId,
            sucursalId: venta.sucursalId
          },
          data: {
            stock: { increment: detalle.cantidad }
          }
        });
      }
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error anulando venta:', error);
    return NextResponse.json({ error: 'Error al anular venta' }, { status: 500 });
  }
}
