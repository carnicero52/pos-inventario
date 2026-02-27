import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    // Crear usuario admin si no existe
    const existingAdmin = await db.usuario.findUnique({
      where: { username: 'admin' }
    });

    if (!existingAdmin) {
      await db.usuario.create({
        data: {
          username: 'admin',
          password: 'admin123',
          nombre: 'Administrador',
          rol: 'ADMIN',
          activo: true,
          permVentas: true,
          permInventario: true,
          permClientes: true,
          permProveedores: true,
          permCompras: true,
          permReportes: true,
          permGastos: true,
          permConfig: true,
          permUsuarios: true
        }
      });
    }

    // Crear empresa por defecto si no existe
    const existingEmpresa = await db.empresa.findUnique({
      where: { id: 'default' }
    });

    if (!existingEmpresa) {
      await db.empresa.create({
        data: {
          id: 'default',
          nombre: 'Mi Empresa',
          moneda: 'Quetzales',
          simboloMoneda: 'Q',
          serieFactura: 'A',
          numeroFactura: 1
        }
      });
    }

    // Crear cliente general si no existe
    const existingCliente = await db.cliente.findFirst({
      where: { nombre: 'Cliente General' }
    });

    if (!existingCliente) {
      await db.cliente.create({
        data: {
          nombre: 'Cliente General',
          activo: true
        }
      });
    }

    // Crear categorías básicas si no existen
    const categoriasCount = await db.categoria.count();

    if (categoriasCount === 0) {
      await db.categoria.createMany({
        data: [
          { nombre: 'General', descripcion: 'Productos generales', activa: true },
          { nombre: 'Bebidas', descripcion: 'Bebidas y refrescos', activa: true },
          { nombre: 'Alimentos', descripcion: 'Alimentos y comestibles', activa: true },
          { nombre: 'Limpieza', descripcion: 'Productos de limpieza', activa: true },
          { nombre: 'Papelería', descripcion: 'Artículos de papelería', activa: true }
        ]
      });
    }

    // Crear sucursal principal si no existe
    const sucursalesCount = await db.sucursal.count();

    if (sucursalesCount === 0) {
      await db.sucursal.create({
        data: {
          nombre: 'Sucursal Principal',
          principal: true,
          activa: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Datos iniciales creados correctamente',
      user: { username: 'admin', password: 'admin123' }
    });
  } catch (error) {
    console.error('Error en seed:', error);
    return NextResponse.json({ error: 'Error en seed: ' + (error as Error).message }, { status: 500 });
  }
}
