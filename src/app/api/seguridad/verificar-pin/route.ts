import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Verificar PIN de seguridad
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { pin } = data;

    if (!pin) {
      return NextResponse.json({ 
        success: false, 
        error: 'PIN requerido' 
      }, { status: 400 });
    }

    // Obtener configuración de seguridad
    const config = await db.configSeguridad.findUnique({
      where: { id: 'default' }
    });

    if (!config) {
      // Crear configuración por defecto si no existe
      await db.configSeguridad.create({
        data: { id: 'default', pinSeguridad: '2024' }
      });
      
      // Verificar con el PIN por defecto
      if (pin === '2024') {
        return NextResponse.json({ success: true });
      }
    } else {
      if (pin === config.pinSeguridad) {
        return NextResponse.json({ success: true });
      }
    }

    return NextResponse.json({ 
      success: false, 
      error: 'PIN incorrecto' 
    }, { status: 401 });
  } catch (error) {
    console.error('Error al verificar PIN:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Error al verificar PIN' 
    }, { status: 500 });
  }
}
