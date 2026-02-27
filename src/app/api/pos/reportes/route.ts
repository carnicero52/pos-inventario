import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener reportes
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const fechaInicio = searchParams.get('fechaInicio');
    const fechaFin = searchParams.get('fechaFin');
    const sucursalId = searchParams.get('sucursalId');

    // Preparar filtros de fecha
    let fechaFiltro = {};
    if (fechaInicio && fechaFin) {
      const inicio = new Date(fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      const fin = new Date(fechaFin);
      fin.setHours(23, 59, 59, 999);
      fechaFiltro = { gte: inicio, lte: fin };
    }

    switch (tipo) {
      case 'ventas-periodo':
        return await reporteVentasPeriodo(fechaFiltro, sucursalId);
      case 'ganancias-producto':
        return await reporteGananciasProducto(fechaFiltro, sucursalId);
      case 'ventas-categoria':
        return await reporteVentasCategoria(fechaFiltro, sucursalId);
      case 'ventas-vendedor':
        return await reporteVentasVendedor(fechaFiltro, sucursalId);
      case 'ventas-sucursal':
        return await reporteVentasSucursal(fechaFiltro);
      case 'productos-mas-vendidos':
        return await reporteProductosMasVendidos(fechaFiltro, sucursalId);
      case 'productos-menos-vendidos':
        return await reporteProductosMenosVendidos(fechaFiltro, sucursalId);
      case 'clientes-frecuentes':
        return await reporteClientesFrecuentes(fechaFiltro);
      case 'gastos-periodo':
        return await reporteGastosPeriodo(fechaFiltro, sucursalId);
      case 'gastos-categoria':
        return await reporteGastosCategoria(fechaFiltro, sucursalId);
      case 'flujo-caja':
        return await reporteFlujoCaja(fechaFiltro, sucursalId);
      case 'margen-ganancia':
        return await reporteMargenGanancia();
      case 'inventario-actual':
        return await reporteInventarioActual(sucursalId);
      default:
        return NextResponse.json({ error: 'Tipo de reporte no válido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error generando reporte:', error);
    return NextResponse.json({ error: 'Error al generar reporte' }, { status: 500 });
  }
}

// 1. Ventas por período
async function reporteVentasPeriodo(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { estado: 'completada' };
  if (Object.keys(fechaFiltro).length > 0) where.fecha = fechaFiltro;
  if (sucursalId) where.sucursalId = sucursalId;

  const ventas = await db.venta.findMany({
    where,
    include: { sucursal: true },
    orderBy: { fecha: 'asc' }
  });

  // Agrupar por día
  const porDia: Record<string, { fecha: string; total: number; cantidad: number }> = {};
  for (const v of ventas) {
    const fecha = v.fecha.toISOString().split('T')[0];
    if (!porDia[fecha]) {
      porDia[fecha] = { fecha, total: 0, cantidad: 0 };
    }
    porDia[fecha].total += v.total;
    porDia[fecha].cantidad += 1;
  }

  return NextResponse.json({
    ventas,
    resumen: {
      totalVentas: ventas.reduce((sum, v) => sum + v.total, 0),
      cantidadVentas: ventas.length,
      promedioVenta: ventas.length > 0 ? ventas.reduce((sum, v) => sum + v.total, 0) / ventas.length : 0
    },
    porDia: Object.values(porDia)
  });
}

// 2. Ganancias por producto
async function reporteGananciasProducto(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { venta: { estado: 'completada' } };
  if (Object.keys(fechaFiltro).length > 0) where.venta = { ...where.venta, fecha: fechaFiltro };
  if (sucursalId) where.venta = { ...where.venta, sucursalId };

  const detalles = await db.detalleVenta.findMany({
    where,
    include: { producto: true }
  });

  // Agrupar por producto
  const porProducto: Record<string, { producto: string; cantidad: number; ganancia: number; ingresos: number }> = {};
  for (const d of detalles) {
    const nombre = d.nombreManual || d.producto?.nombre || 'Sin nombre';
    if (!porProducto[nombre]) {
      porProducto[nombre] = { producto: nombre, cantidad: 0, ganancia: 0, ingresos: 0 };
    }
    porProducto[nombre].cantidad += d.cantidad;
    porProducto[nombre].ganancia += d.ganancia;
    porProducto[nombre].ingresos += d.subtotal;
  }

  return NextResponse.json({
    productos: Object.values(porProducto).sort((a, b) => b.ganancia - a.ganancia),
    totalGanancia: Object.values(porProducto).reduce((sum, p) => sum + p.ganancia, 0)
  });
}

// 3. Ventas por categoría
async function reporteVentasCategoria(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { venta: { estado: 'completada' } };
  if (Object.keys(fechaFiltro).length > 0) where.venta = { ...where.venta, fecha: fechaFiltro };
  if (sucursalId) where.venta = { ...where.venta, sucursalId };

  const detalles = await db.detalleVenta.findMany({
    where,
    include: { producto: { include: { categoria: true } } }
  });

  const porCategoria: Record<string, { categoria: string; total: number; cantidad: number }> = {};
  for (const d of detalles) {
    const nombre = d.producto?.categoria?.nombre || 'Sin categoría';
    if (!porCategoria[nombre]) {
      porCategoria[nombre] = { categoria: nombre, total: 0, cantidad: 0 };
    }
    porCategoria[nombre].total += d.subtotal;
    porCategoria[nombre].cantidad += d.cantidad;
  }

  return NextResponse.json(Object.values(porCategoria).sort((a, b) => b.total - a.total));
}

// 4. Ventas por vendedor
async function reporteVentasVendedor(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { estado: 'completada' };
  if (Object.keys(fechaFiltro).length > 0) where.fecha = fechaFiltro;
  if (sucursalId) where.sucursalId = sucursalId;

  const ventas = await db.venta.findMany({
    where,
    include: { usuario: true }
  });

  const porVendedor: Record<string, { vendedor: string; total: number; cantidad: number }> = {};
  for (const v of ventas) {
    const nombre = v.usuario?.nombre || 'Sin vendedor';
    if (!porVendedor[nombre]) {
      porVendedor[nombre] = { vendedor: nombre, total: 0, cantidad: 0 };
    }
    porVendedor[nombre].total += v.total;
    porVendedor[nombre].cantidad += 1;
  }

  return NextResponse.json(Object.values(porVendedor).sort((a, b) => b.total - a.total));
}

// 5. Ventas por sucursal
async function reporteVentasSucursal(fechaFiltro: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { estado: 'completada' };
  if (Object.keys(fechaFiltro).length > 0) where.fecha = fechaFiltro;

  const ventas = await db.venta.findMany({
    where,
    include: { sucursal: true }
  });

  const porSucursal: Record<string, { sucursal: string; total: number; cantidad: number }> = {};
  for (const v of ventas) {
    const nombre = v.sucursal?.nombre || 'Sin sucursal';
    if (!porSucursal[nombre]) {
      porSucursal[nombre] = { sucursal: nombre, total: 0, cantidad: 0 };
    }
    porSucursal[nombre].total += v.total;
    porSucursal[nombre].cantidad += 1;
  }

  return NextResponse.json(Object.values(porSucursal).sort((a, b) => b.total - a.total));
}

// 6. Productos más vendidos
async function reporteProductosMasVendidos(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { venta: { estado: 'completada' } };
  if (Object.keys(fechaFiltro).length > 0) where.venta = { ...where.venta, fecha: fechaFiltro };
  if (sucursalId) where.venta = { ...where.venta, sucursalId };

  const detalles = await db.detalleVenta.findMany({
    where,
    include: { producto: true }
  });

  const porProducto: Record<string, { producto: string; cantidad: number; ingresos: number }> = {};
  for (const d of detalles) {
    const nombre = d.nombreManual || d.producto?.nombre || 'Sin nombre';
    if (!porProducto[nombre]) {
      porProducto[nombre] = { producto: nombre, cantidad: 0, ingresos: 0 };
    }
    porProducto[nombre].cantidad += d.cantidad;
    porProducto[nombre].ingresos += d.subtotal;
  }

  return NextResponse.json(Object.values(porProducto).sort((a, b) => b.cantidad - a.cantidad).slice(0, 20));
}

// 7. Productos menos vendidos
async function reporteProductosMenosVendidos(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { venta: { estado: 'completada' } };
  if (Object.keys(fechaFiltro).length > 0) where.venta = { ...where.venta, fecha: fechaFiltro };
  if (sucursalId) where.venta = { ...where.venta, sucursalId };

  const detalles = await db.detalleVenta.findMany({
    where,
    include: { producto: true }
  });

  const porProducto: Record<string, { producto: string; cantidad: number; ingresos: number }> = {};
  for (const d of detalles) {
    const nombre = d.nombreManual || d.producto?.nombre || 'Sin nombre';
    if (!porProducto[nombre]) {
      porProducto[nombre] = { producto: nombre, cantidad: 0, ingresos: 0 };
    }
    porProducto[nombre].cantidad += d.cantidad;
    porProducto[nombre].ingresos += d.subtotal;
  }

  return NextResponse.json(Object.values(porProducto).sort((a, b) => a.cantidad - b.cantidad).slice(0, 20));
}

// 8. Clientes más frecuentes
async function reporteClientesFrecuentes(fechaFiltro: Record<string, unknown>) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { estado: 'completada' };
  if (Object.keys(fechaFiltro).length > 0) where.fecha = fechaFiltro;

  const ventas = await db.venta.findMany({
    where,
    include: { cliente: true }
  });

  const porCliente: Record<string, { cliente: string; total: number; cantidad: number }> = {};
  for (const v of ventas) {
    const nombre = v.cliente?.nombre || 'Cliente General';
    if (!porCliente[nombre]) {
      porCliente[nombre] = { cliente: nombre, total: 0, cantidad: 0 };
    }
    porCliente[nombre].total += v.total;
    porCliente[nombre].cantidad += 1;
  }

  return NextResponse.json(Object.values(porCliente).sort((a, b) => b.cantidad - a.cantidad).slice(0, 20));
}

// 9. Gastos por período
async function reporteGastosPeriodo(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (Object.keys(fechaFiltro).length > 0) where.fecha = fechaFiltro;
  if (sucursalId) where.sucursalId = sucursalId;

  const gastos = await db.gasto.findMany({
    where,
    include: { sucursal: true },
    orderBy: { fecha: 'asc' }
  });

  return NextResponse.json({
    gastos,
    total: gastos.reduce((sum, g) => sum + g.monto, 0)
  });
}

// 10. Gastos por categoría
async function reporteGastosCategoria(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (Object.keys(fechaFiltro).length > 0) where.fecha = fechaFiltro;
  if (sucursalId) where.sucursalId = sucursalId;

  const gastos = await db.gasto.findMany({ where });

  const porCategoria: Record<string, { categoria: string; total: number; cantidad: number }> = {};
  for (const g of gastos) {
    if (!porCategoria[g.categoria]) {
      porCategoria[g.categoria] = { categoria: g.categoria, total: 0, cantidad: 0 };
    }
    porCategoria[g.categoria].total += g.monto;
    porCategoria[g.categoria].cantidad += 1;
  }

  return NextResponse.json(Object.values(porCategoria).sort((a, b) => b.total - a.total));
}

// 11. Flujo de caja
async function reporteFlujoCaja(fechaFiltro: Record<string, unknown>, sucursalId: string | null) {
  // Ventas
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereVentas: any = { estado: 'completada' };
  if (Object.keys(fechaFiltro).length > 0) whereVentas.fecha = fechaFiltro;
  if (sucursalId) whereVentas.sucursalId = sucursalId;

  const ventas = await db.venta.findMany({ where: whereVentas });

  // Gastos
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereGastos: any = {};
  if (Object.keys(fechaFiltro).length > 0) whereGastos.fecha = fechaFiltro;
  if (sucursalId) whereGastos.sucursalId = sucursalId;

  const gastos = await db.gasto.findMany({ where: whereGastos });

  const totalVentas = ventas.reduce((sum, v) => sum + v.total, 0);
  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);

  return NextResponse.json({
    ingresos: totalVentas,
    egresos: totalGastos,
    balance: totalVentas - totalGastos,
    ventas: ventas.length,
    gastos: gastos.length
  });
}

// 12. Margen de ganancia
async function reporteMargenGanancia() {
  const productos = await db.producto.findMany({
    where: { activo: true },
    include: {
      sucursales: true
    }
  });

  const resultados = productos.map(p => {
    const stockTotal = p.sucursales.reduce((sum, s) => sum + s.stock, 0);
    return {
      codigo: p.codigo,
      nombre: p.nombre,
      costo: p.costo,
      precio: p.precioVenta,
      margen: p.margenGanancia,
      stock: stockTotal
    };
  });

  return NextResponse.json(resultados.sort((a, b) => b.margen - a.margen));
}

// 13. Inventario actual
async function reporteInventarioActual(sucursalId: string | null) {
  const productos = await db.producto.findMany({
    where: { activo: true },
    include: {
      categoria: true,
      sucursales: {
        include: { sucursal: true },
        where: sucursalId ? { sucursalId } : undefined
      }
    }
  });

  const resultados = productos.map(p => {
    const stockInfo = p.sucursales[0] || { stock: 0, stockMinimo: 5 };
    const valorInventario = stockInfo.stock * p.costo;

    return {
      codigo: p.codigo,
      nombre: p.nombre,
      categoria: p.categoria?.nombre || 'Sin categoría',
      stock: stockInfo.stock,
      stockMinimo: stockInfo.stockMinimo,
      costo: p.costo,
      precio: p.precioVenta,
      valorInventario,
      estado: stockInfo.stock <= 0 ? 'agotado' : stockInfo.stock <= stockInfo.stockMinimo ? 'bajo' : 'normal'
    };
  });

  return NextResponse.json({
    productos: resultados,
    resumen: {
      totalProductos: resultados.length,
      valorTotal: resultados.reduce((sum, p) => sum + p.valorInventario, 0),
      agotados: resultados.filter(p => p.estado === 'agotado').length,
      stockBajo: resultados.filter(p => p.estado === 'bajo').length
    }
  });
}
