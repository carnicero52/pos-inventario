import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let empresa = await db.empresa.findUnique({ where: { id: 'default' } });
    
    if (!empresa) {
      empresa = await db.empresa.create({
        data: {
          id: 'default',
          nombre: 'Mi Tienda POS',
          moneda: 'DOP',
          simboloMoneda: 'RD$'
        }
      });
    }
    
    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ nombre: 'Mi Tienda POS', simboloMoneda: 'RD$' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const empresa = await db.empresa.upsert({
      where: { id: 'default' },
      update: {
        nombre: body.nombre,
        nit: body.nit,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email,
        logoUrl: body.logoUrl,
        moneda: body.moneda,
        simboloMoneda: body.simboloMoneda,
        mensajeTicket: body.mensajeTicket
      },
      create: {
        id: 'default',
        nombre: body.nombre,
        nit: body.nit,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email,
        logoUrl: body.logoUrl,
        moneda: body.moneda,
        simboloMoneda: body.simboloMoneda,
        mensajeTicket: body.mensajeTicket
      }
    });
    
    return NextResponse.json({ success: true, empresa });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}
