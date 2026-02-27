import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Obtener configuración
export async function GET() {
  try {
    let config = await db.configuracion.findUnique({ where: { id: 'default' } });
    
    if (!config) {
      config = await db.configuracion.create({
        data: {
          id: 'default',
          nombreNegocio: 'Mi Negocio',
          moneda: 'USD',
          simboloMoneda: '$'
        }
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      nombreNegocio: 'Mi Negocio',
      simboloMoneda: '$'
    });
  }
}

// POST - Guardar configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const config = await db.configuracion.upsert({
      where: { id: 'default' },
      update: {
        nombreNegocio: body.nombreNegocio,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email,
        ruc: body.ruc,
        moneda: body.moneda,
        simboloMoneda: body.simboloMoneda,
        mensajeTicket: body.mensajeTicket,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        nombreNegocio: body.nombreNegocio,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email,
        ruc: body.ruc,
        moneda: body.moneda,
        simboloMoneda: body.simboloMoneda,
        mensajeTicket: body.mensajeTicket
      }
    });
    
    return NextResponse.json({ success: true, config });
  } catch (error) {
    console.error('Error guardando configuración:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}
