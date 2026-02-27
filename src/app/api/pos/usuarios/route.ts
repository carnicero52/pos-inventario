import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nanoid } from 'nanoid';

// GET - Listar usuarios
export async function GET() {
  try {
    const usuarios = await db.usuario.findMany({
      where: { activo: true },
      select: {
        id: true,
        nombre: true,
        usuario: true,
        rol: true,
        activo: true,
        createdAt: true
      },
      orderBy: { nombre: 'asc' }
    });
    return NextResponse.json(usuarios);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json([]);
  }
}

// POST - Crear usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { nombre, usuario, password, rol, codigoAutorizacion } = body;
    
    // Verificar código de autorización para nuevos usuarios
    if (codigoAutorizacion !== '1234') {
      return NextResponse.json({ error: 'Código de autorización inválido' }, { status: 403 });
    }
    
    // Verificar si el usuario ya existe
    const existe = await db.usuario.findUnique({ where: { usuario } });
    if (existe) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }
    
    const nuevoUsuario = await db.usuario.create({
      data: {
        nombre,
        usuario,
        password, // En producción debería estar hasheado
        rol: rol || 'vendedor',
        activo: true
      }
    });
    
    return NextResponse.json({ success: true, usuario: nuevoUsuario });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al crear usuario' }, { status: 500 });
  }
}

// PUT - Actualizar usuario
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    const usuario = await db.usuario.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    });
    
    return NextResponse.json({ success: true, usuario });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al actualizar' }, { status: 500 });
  }
}

// DELETE - Eliminar usuario (requiere PIN)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const pin = searchParams.get('pin');
    
    if (!id) {
      return NextResponse.json({ error: 'ID requerido' }, { status: 400 });
    }
    
    if (pin !== '2024') {
      return NextResponse.json({ error: 'PIN de seguridad incorrecto' }, { status: 403 });
    }
    
    await db.usuario.update({
      where: { id },
      data: { activo: false }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al eliminar' }, { status: 500 });
  }
}
