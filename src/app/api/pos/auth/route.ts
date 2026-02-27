import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Login
export async function POST(request: NextRequest) {
  try {
    const { usuario, password } = await request.json();

    if (!usuario || !password) {
      return NextResponse.json({ error: 'Usuario y contraseña requeridos' }, { status: 400 });
    }

    // Buscar usuario (sensible a mayúsculas/minúsculas)
    const user = await db.usuario.findUnique({
      where: { usuario }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 401 });
    }

    if (!user.activo) {
      return NextResponse.json({ error: 'Usuario inactivo' }, { status: 401 });
    }

    // Verificar contraseña (comparación exacta, sensible a mayúsculas/minúsculas)
    if (user.password !== password) {
      return NextResponse.json({ error: 'Contraseña incorrecta' }, { status: 401 });
    }

    // Retornar usuario sin contraseña
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      usuario: userWithoutPassword
    });
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}

// PUT - Registrar nuevo usuario (requiere código de autorización)
export async function PUT(request: NextRequest) {
  try {
    const { codigo, nombre, usuario, password, rol } = await request.json();

    // Código de autorización para registrar nuevos usuarios
    if (codigo !== '1234') {
      return NextResponse.json({ error: 'Código de autorización inválido' }, { status: 403 });
    }

    if (!nombre || !usuario || !password) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 });
    }

    // Verificar si el usuario ya existe
    const existente = await db.usuario.findUnique({
      where: { usuario }
    });

    if (existente) {
      return NextResponse.json({ error: 'El usuario ya existe' }, { status: 400 });
    }

    // Crear usuario
    const nuevoUsuario = await db.usuario.create({
      data: {
        nombre,
        usuario,
        password,
        rol: rol || 'vendedor'
      }
    });

    const { password: _, ...userWithoutPassword } = nuevoUsuario;

    return NextResponse.json({
      success: true,
      usuario: userWithoutPassword
    });
  } catch (error) {
    console.error('Error registrando usuario:', error);
    return NextResponse.json({ error: 'Error del servidor' }, { status: 500 });
  }
}
