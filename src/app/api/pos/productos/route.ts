import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const producto = await db.producto.findUnique({
        where: { id },
        include: { categoria: true, proveedor: true, sucursales: true }
      });
      return NextResponse.json(producto);
    }
    
    const productos = await db.producto.findMany({
      where: { activo: true },
      include: { 
        categoria: true, 
        sucursales: true 
      },
      orderBy: { nombre: 'asc' }
    });
    
    return NextResponse.json(productos);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { codigo, codigoBarras, nombre, descripcion, categoriaId, proveedorId, costo, precioVenta, tieneItbis, porcentajeItbis } = body;
    
    const producto = await db.producto.create({
      data: {
        codigo: codigo || `PROD-${nanoid(6).toUpperCase()}`,
        codigoBarras,
        nombre,
        descripcion,
        categoriaId,
        proveedorId,
        costo: parseFloat(costo) || 0,
        precioVenta: parseFloat(precioVenta) || 0,
        tieneItbis: tieneItbis ?? true,
        porcentajeItbis: parseFloat(porcentajeItbis) || 18
      }
    });
    
    return NextResponse.json({ success: true, producto });
  } catch (error) {
    console.error('Error creando producto:', error);
    return NextResponse.json({ error: 'Error al crear producto' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const producto = await db.producto.update({
      where: { id },
      data: {
        ...data,
        costo: data.costo ? parseFloat(data.costo) : undefined,
        precioVenta: data.precioVenta ? parseFloat(data.precioVenta) : undefined,
        porcentajeItbis: data.porcentajeItbis ? parseFloat(data.porcentajeItbis) : undefined
      }
    });
    
    return NextResponse.json({ success: true, producto });
  } catch (error) {
    console.error('Error actualizando producto:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    await db.producto.update({
      where: { id },
      data: { activo: false }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error eliminando producto:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
