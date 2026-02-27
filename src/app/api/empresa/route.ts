import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    let empresa = await db.empresa.findUnique({ where: { id: 'default' } });
    
    if (!empresa) {
      empresa = await db.empresa.create({
        data: {
          id: 'default',
          nombre: 'Mi Empresa',
          moneda: 'Quetzal',
          monedaSimbolo: 'Q',
          serieFactura: 'A',
          numeroFactura: 1
        }
      });
    }
    
    return NextResponse.json(empresa);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ nombre: 'Mi Empresa', monedaSimbolo: 'Q' });
  }
}

export async function POST(request: NextRequest) {
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
        logo: body.logo,
        moneda: body.moneda,
        monedaSimbolo: body.monedaSimbolo,
        serieFactura: body.serieFactura,
        resolucion: body.resolucion,
        ticketHeader: body.ticketHeader,
        ticketFooter: body.ticketFooter,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        nombre: body.nombre,
        nit: body.nit,
        direccion: body.direccion,
        telefono: body.telefono,
        email: body.email,
        logo: body.logo,
        moneda: body.moneda,
        monedaSimbolo: body.monedaSimbolo,
        serieFactura: body.serieFactura,
        resolucion: body.resolucion,
        ticketHeader: body.ticketHeader,
        ticketFooter: body.ticketFooter
      }
    });
    
    return NextResponse.json({ success: true, empresa });
  } catch (error) {
    console.error('Error guardando empresa:', error);
    return NextResponse.json({ error: 'Error al guardar' }, { status: 500 });
  }
}
