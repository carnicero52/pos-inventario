import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// GET - Listar usuarios
export async function GET() {
  try {
    const usuarios = await db.usuario.findMany({
      orderBy: { createdAt: 'desc' }
    });
    
    // Ocultar contraseñas
    const usuariosSinPassword = usuarios.map(u => {
      const { password, ...rest } = u;
      return rest;
    });
    
    return NextResponse.json(usuariosSinPassword);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verificar si username ya existe
    const existente = await db.usuario.findUnique({
      where: { username: body.username }
    });
    
    if (existente) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }
    
    const usuario = await db.usuario.create({
      data: {
        id: nanoid(),
        username: body.username,
        password: body.password,
        nombre: body.nombre,
        rol: body.rol || 'VENDEDOR',
        activo: true,
        permVentas: body.permVentas ?? true,
        permInventario: body.permInventario ?? false,
        permClientes: body.permClientes ?? false,
        permProveedores: body.permProveedores ?? false,
        permCompras: body.permCompras ?? false,
        permReportes: body.permReportes ?? false,
        permGastos: body.permGastos ?? false,
        permConfig: body.permConfig ?? false,
        permUsuarios: body.permUsuarios ?? false,
      }
    });
    
    const { password, ...usuarioSinPassword } = usuario;
    return NextResponse.json({ success: true, usuario: usuarioSinPassword });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    
    const data: any = {
      nombre: body.nombre,
      rol: body.rol,
      activo: body.activo,
      permVentas: body.permVentas,
      permInventario: body.permInventario,
      permClientes: body.permClientes,
      permProveedores: body.permProveedores,
      permCompras: body.permCompras,
      permReportes: body.permReportes,
      permGastos: body.permGastos,
      permConfig: body.permConfig,
      permUsuarios: body.permUsuarios,
      updatedAt: new Date()
    };
    
    if (body.password) {
      data.password = body.password;
    }
    
    const usuario = await db.usuario.update({
      where: { id: body.id },
      data
    });
    
    const { password, ...usuarioSinPassword } = usuario;
    return NextResponse.json({ success: true, usuario: usuarioSinPassword });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

// DELETE - Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pin = searchParams.get('pin');
    
    if (pin !== '2024') {
      return NextResponse.json({ error: 'PIN de seguridad inválido' }, { status: 403 });
    }
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    await db.usuario.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
