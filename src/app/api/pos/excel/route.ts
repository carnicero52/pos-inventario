import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import * as XLSX from 'xlsx';

// POST - Exportar/Importar Excel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, datos, importar } = body;

    if (importar) {
      // Importar productos desde Excel
      return await importarProductos(datos);
    }

    // Exportar según el tipo
    switch (tipo) {
      case 'productos':
        return await exportarProductos();
      case 'ventas':
        return await exportarVentas(body.fechaInicio, body.fechaFin);
      case 'clientes':
        return await exportarClientes();
      case 'inventario':
        return await exportarInventario();
      case 'plantilla':
        return await generarPlantilla();
      default:
        return NextResponse.json({ error: 'Tipo de exportación no válido' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error en Excel:', error);
    return NextResponse.json({ error: 'Error al procesar Excel' }, { status: 500 });
  }
}

async function exportarProductos() {
  const productos = await db.producto.findMany({
    where: { activo: true },
    include: {
      categoria: true,
      proveedor: true,
      sucursales: { include: { sucursal: true } }
    }
  });

  const data = productos.map(p => ({
    Codigo: p.codigo,
    CodigoBarras: p.codigoBarras || '',
    Nombre: p.nombre,
    Descripcion: p.descripcion || '',
    Categoria: p.categoria?.nombre || '',
    Proveedor: p.proveedor?.nombre || '',
    Costo: p.costo,
    PrecioVenta: p.precioVenta,
    Margen: `${p.margenGanancia.toFixed(2)}%`,
    Stock: p.sucursales.reduce((sum, s) => sum + s.stock, 0),
    StockMinimo: p.sucursales[0]?.stockMinimo || 5,
    Unidad: p.unidad,
    TieneITBIS: p.tieneItbis ? 'Sí' : 'No'
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Productos');

  const excelBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  return NextResponse.json({ success: true, excel: excelBase64 });
}

async function exportarVentas(fechaInicio?: string, fechaFin?: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = { estado: 'completada' };

  if (fechaInicio && fechaFin) {
    const inicio = new Date(fechaInicio);
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date(fechaFin);
    fin.setHours(23, 59, 59, 999);
    where.fecha = { gte: inicio, lte: fin };
  }

  const ventas = await db.venta.findMany({
    where,
    include: {
      cliente: true,
      usuario: true,
      sucursal: true
    },
    orderBy: { fecha: 'desc' }
  });

  const data = ventas.map(v => ({
    Factura: v.numeroFactura,
    Fecha: v.fecha.toLocaleDateString('es-DO'),
    Hora: v.fecha.toLocaleTimeString('es-DO'),
    Cliente: v.cliente?.nombre || 'Cliente General',
    Vendedor: v.usuario.nombre,
    Sucursal: v.sucursal.nombre,
    Subtotal: v.subtotal,
    ITBIS: v.itbis,
    Descuento: v.descuento,
    Total: v.total,
    MetodoPago: v.metodoPago,
    Estado: v.estado
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Ventas');

  const excelBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  return NextResponse.json({ success: true, excel: excelBase64 });
}

async function exportarClientes() {
  const clientes = await db.cliente.findMany({
    where: { activo: true },
    include: {
      _count: { select: { ventas: true } },
      ventas: {
        where: { estado: 'completada' },
        select: { total: true }
      }
    }
  });

  const data = clientes.map(c => ({
    Nombre: c.nombre,
    Apellido: c.apellido || '',
    Documento: c.documento || '',
    Email: c.email || '',
    Telefono: c.telefono || '',
    Direccion: c.direccion || '',
    LimiteCredito: c.limiteCredito || 0,
    SaldoPendiente: c.saldoPendiente,
    Puntos: c.puntos,
    TotalCompras: c.ventas.reduce((sum, v) => sum + v.total, 0),
    CantidadCompras: c._count.ventas
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Clientes');

  const excelBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  return NextResponse.json({ success: true, excel: excelBase64 });
}

async function exportarInventario() {
  const productos = await db.producto.findMany({
    where: { activo: true },
    include: {
      categoria: true,
      sucursales: { include: { sucursal: true } }
    }
  });

  const data = productos.map(p => {
    const stockInfo = p.sucursales[0] || { stock: 0, stockMinimo: 5 };
    return {
      Codigo: p.codigo,
      Nombre: p.nombre,
      Categoria: p.categoria?.nombre || '',
      Stock: stockInfo.stock,
      StockMinimo: stockInfo.stockMinimo,
      Costo: p.costo,
      PrecioVenta: p.precioVenta,
      ValorInventario: stockInfo.stock * p.costo,
      Estado: stockInfo.stock <= 0 ? 'Agotado' : stockInfo.stock <= stockInfo.stockMinimo ? 'Stock Bajo' : 'Normal'
    };
  });

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  const excelBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  return NextResponse.json({ success: true, excel: excelBase64 });
}

async function generarPlantilla() {
  const data = [
    {
      Codigo: 'PROD-001',
      CodigoBarras: '',
      Nombre: 'Producto de ejemplo',
      Descripcion: 'Descripción del producto',
      Categoria: 'Categoría',
      Costo: 100,
      PrecioVenta: 150,
      Stock: 10,
      StockMinimo: 5
    }
  ];

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');

  const excelBase64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  return NextResponse.json({ success: true, excel: excelBase64 });
}

async function importarProductos(datos: unknown[]) {
  // Obtener categorías existentes
  const categorias = await db.categoria.findMany();
  const sucursales = await db.sucursal.findMany({ where: { activa: true } });

  let importados = 0;
  let errores = 0;

  for (const row of datos) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const item = row as any;

      // Verificar si ya existe
      const existente = await db.producto.findUnique({
        where: { codigo: item.Codigo || item.codigo }
      });

      if (existente) continue;

      // Buscar o crear categoría
      let categoriaId = null;
      const nombreCategoria = item.Categoria || item.categoria;
      if (nombreCategoria) {
        let cat = categorias.find(c => c.nombre.toLowerCase() === nombreCategoria.toLowerCase());
        if (!cat) {
          cat = await db.categoria.create({
            data: { nombre: nombreCategoria }
          });
          categorias.push(cat);
        }
        categoriaId = cat.id;
      }

      // Crear producto
      const costo = parseFloat(item.Costo || item.costo) || 0;
      const precio = parseFloat(item.PrecioVenta || item.precioVenta || item.Precio) || 0;
      const margen = costo > 0 ? ((precio - costo) / costo) * 100 : 0;

      const producto = await db.producto.create({
        data: {
          codigo: item.Codigo || item.codigo || `IMP-${Date.now()}`,
          codigoBarras: item.CodigoBarras || item.codigoBarras || null,
          nombre: item.Nombre || item.nombre || 'Sin nombre',
          descripcion: item.Descripcion || item.descripcion || null,
          categoriaId,
          costo,
          precioVenta: precio,
          margenGanancia: margen
        }
      });

      // Crear stock en sucursales
      const stock = parseInt(item.Stock || item.stock) || 0;
      const stockMinimo = parseInt(item.StockMinimo || item.stockMinimo) || 5;

      for (const suc of sucursales) {
        await db.productoSucursal.create({
          data: {
            productoId: producto.id,
            sucursalId: suc.id,
            stock,
            stockMinimo
          }
        });
      }

      importados++;
    } catch {
      errores++;
    }
  }

  return NextResponse.json({
    success: true,
    mensaje: `Se importaron ${importados} productos. Errores: ${errores}`
  });
}
