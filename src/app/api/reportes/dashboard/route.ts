import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

    // Ventas de hoy
    const ventasHoy = await db.venta.aggregate({
      where: {
        fecha: { gte: new Date(today) },
        estado: 'completada'
      },
      _sum: { total: true },
      _count: true
    });

    // Ventas del mes
    const ventasMes = await db.venta.aggregate({
      where: {
        fecha: { gte: new Date(firstDayOfMonth) },
        estado: 'completada'
      },
      _sum: { total: true, ganancia: true }
    });

    // Gastos del mes
    const gastosMes = await db.gasto.aggregate({
      where: {
        fecha: { gte: new Date(firstDayOfMonth) }
      },
      _sum: { monto: true }
    });

    // Productos
    const productos = await db.producto.count({
      where: { activo: true }
    });

    // Clientes
    const clientes = await db.cliente.count({
      where: { activo: true }
    });

    // Stock bajo (simplificado para SQLite)
    const productosStock = await db.producto.findMany({
      where: { activo: true },
      select: { stock: true, stockMinimo: true }
    });
    const stockBajo = productosStock.filter(p => p.stock <= p.stockMinimo).length;

    return NextResponse.json({
      ventasHoy: ventasHoy._sum.total || 0,
      ventasHoyCount: ventasHoy._count || 0,
      ventasMes: ventasMes._sum.total || 0,
      gananciaMes: ventasMes._sum.ganancia || 0,
      gastosMes: gastosMes._sum.monto || 0,
      productos,
      clientes,
      stockBajo
    });
  } catch (error) {
    console.error('Error en dashboard:', error);
    return NextResponse.json({
      ventasHoy: 0,
      ventasHoyCount: 0,
      ventasMes: 0,
      gananciaMes: 0,
      gastosMes: 0,
      productos: 0,
      clientes: 0,
      stockBajo: 0
    });
  }
}
