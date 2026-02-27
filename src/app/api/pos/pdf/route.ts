import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// POST - Generar PDF
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tipo, ventaId } = body;

    // Obtener datos de la venta
    const venta = await db.venta.findUnique({
      where: { id: ventaId },
      include: {
        cliente: true,
        usuario: true,
        sucursal: true,
        detalles: {
          include: { producto: true }
        }
      }
    });

    if (!venta) {
      return NextResponse.json({ error: 'Venta no encontrada' }, { status: 404 });
    }

    // Obtener empresa
    const empresa = await db.empresa.findUnique({
      where: { id: 'default' }
    }) || { nombre: 'Mi Negocio', direccion: '', telefono: '', nit: '' };

    const doc = new jsPDF();

    if (tipo === 'facturaA4') {
      // Factura A4
      generarFacturaA4(doc, venta, empresa);
    } else {
      // Ticket 80mm
      generarTicket80mm(doc, venta, empresa);
    }

    const pdfBase64 = doc.output('datauristring');
    return NextResponse.json({ success: true, pdf: pdfBase64 });
  } catch (error) {
    console.error('Error generando PDF:', error);
    return NextResponse.json({ error: 'Error al generar PDF' }, { status: 500 });
  }
}

function generarFacturaA4(doc: jsPDF, venta: {
  numeroFactura: string;
  fecha: Date;
  cliente?: { nombre: string; documento?: string | null; direccion?: string | null } | null;
  usuario: { nombre: string };
  sucursal: { nombre: string };
  subtotal: number;
  itbis: number;
  descuento: number;
  total: number;
  metodoPago: string;
  montoRecibido?: number | null;
  cambio?: number | null;
  detalles: { producto?: { codigo: string; nombre: string } | null; nombreManual?: string | null; cantidad: number; precioUnitario: number; descuento: number; subtotal: number }[];
}, empresa: { nombre: string; direccion?: string | null; telefono?: string | null; nit?: string | null }) {
  // Encabezado
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nombre, 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  if (empresa.direccion) doc.text(empresa.direccion, 20, 32);
  if (empresa.telefono) doc.text(`Tel: ${empresa.telefono}`, 20, 37);
  if (empresa.nit) doc.text(`NIT: ${empresa.nit}`, 20, 42);

  // Título factura
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA DE VENTA', 150, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`No. ${venta.numeroFactura}`, 150, 32);
  doc.text(`Fecha: ${venta.fecha.toLocaleDateString('es-DO')}`, 150, 37);
  doc.text(`Hora: ${venta.fecha.toLocaleTimeString('es-DO')}`, 150, 42);

  // Información del cliente
  doc.setDrawColor(200);
  doc.line(20, 50, 190, 50);

  doc.setFont('helvetica', 'bold');
  doc.text('DATOS DEL CLIENTE', 20, 58);
  doc.setFont('helvetica', 'normal');
  doc.text(`Nombre: ${venta.cliente?.nombre || 'Cliente General'}`, 20, 65);
  if (venta.cliente?.documento) doc.text(`Documento: ${venta.cliente.documento}`, 20, 70);
  doc.text(`Vendedor: ${venta.usuario.nombre}`, 20, 75);
  doc.text(`Sucursal: ${venta.sucursal.nombre}`, 100, 75);

  // Tabla de productos
  const tableData = venta.detalles.map(d => [
    d.producto?.codigo || 'MANUAL',
    d.nombreManual || d.producto?.nombre || 'Sin nombre',
    d.cantidad.toString(),
    `$${d.precioUnitario.toFixed(2)}`,
    `$${d.descuento.toFixed(2)}`,
    `$${d.subtotal.toFixed(2)}`
  ]);

  autoTable(doc, {
    startY: 85,
    head: [['Código', 'Descripción', 'Cant.', 'Precio', 'Desc.', 'Subtotal']],
    body: tableData,
    theme: 'striped',
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 9 }
  });

  // Totales
  const finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  doc.setFont('helvetica', 'normal');
  doc.text(`Subtotal:`, 140, finalY);
  doc.text(`$${venta.subtotal.toFixed(2)}`, 170, finalY, { align: 'right' });

  doc.text(`ITBIS (18%):`, 140, finalY + 7);
  doc.text(`$${venta.itbis.toFixed(2)}`, 170, finalY + 7, { align: 'right' });

  if (venta.descuento > 0) {
    doc.text(`Descuento:`, 140, finalY + 14);
    doc.text(`$${venta.descuento.toFixed(2)}`, 170, finalY + 14, { align: 'right' });
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(`TOTAL:`, 140, finalY + 24);
  doc.text(`$${venta.total.toFixed(2)}`, 170, finalY + 24, { align: 'right' });

  // Información de pago
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Método de pago: ${venta.metodoPago.toUpperCase()}`, 20, finalY + 40);
  if (venta.montoRecibido) {
    doc.text(`Recibido: $${venta.montoRecibido.toFixed(2)}`, 20, finalY + 47);
    if (venta.cambio && venta.cambio > 0) {
      doc.text(`Cambio: $${venta.cambio.toFixed(2)}`, 20, finalY + 54);
    }
  }

  // Pie de página
  doc.setFontSize(8);
  doc.text('¡Gracias por su compra!', 105, 280, { align: 'center' });
}

function generarTicket80mm(doc: jsPDF, venta: {
  numeroFactura: string;
  fecha: Date;
  cliente?: { nombre: string } | null;
  subtotal: number;
  itbis: number;
  descuento: number;
  total: number;
  metodoPago: string;
  montoRecibido?: number | null;
  cambio?: number | null;
  detalles: { producto?: { nombre: string } | null; nombreManual?: string | null; cantidad: number; precioUnitario: number; subtotal: number }[];
}, empresa: { nombre: string; nit?: string | null; telefono?: string | null }) {
  const pageWidth = doc.internal.pageSize.getWidth();
  const centerX = pageWidth / 2;

  // Encabezado
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(empresa.nombre, centerX, 15, { align: 'center' });

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  if (empresa.nit) doc.text(`NIT: ${empresa.nit}`, centerX, 20, { align: 'center' });
  if (empresa.telefono) doc.text(`Tel: ${empresa.telefono}`, centerX, 25, { align: 'center' });

  doc.setDrawColor(150);
  doc.line(10, 30, pageWidth - 10, 30);

  // Información de la venta
  doc.setFontSize(8);
  doc.text(`Factura: ${venta.numeroFactura}`, 10, 38);
  doc.text(`Fecha: ${venta.fecha.toLocaleDateString('es-DO')} ${venta.fecha.toLocaleTimeString('es-DO')}`, 10, 43);
  doc.text(`Cliente: ${venta.cliente?.nombre || 'Cliente General'}`, 10, 48);

  doc.line(10, 53, pageWidth - 10, 53);

  // Productos
  let y = 60;
  doc.setFont('helvetica', 'bold');
  doc.text('Producto', 10, y);
  doc.text('Cant.', 100, y);
  doc.text('Precio', 120, y);
  doc.text('Subt.', 150, y);

  y += 5;
  doc.setFont('helvetica', 'normal');

  for (const d of venta.detalles) {
    const nombre = (d.nombreManual || d.producto?.nombre || 'Sin nombre').substring(0, 20);
    doc.text(nombre, 10, y);
    doc.text(d.cantidad.toString(), 100, y);
    doc.text(`$${d.precioUnitario.toFixed(2)}`, 120, y);
    doc.text(`$${d.subtotal.toFixed(2)}`, 150, y);
    y += 5;
  }

  doc.line(10, y + 3, pageWidth - 10, y + 3);
  y += 10;

  // Totales
  doc.text(`Subtotal: $${venta.subtotal.toFixed(2)}`, pageWidth - 50, y, { align: 'right' });
  y += 5;
  doc.text(`ITBIS: $${venta.itbis.toFixed(2)}`, pageWidth - 50, y, { align: 'right' });

  if (venta.descuento > 0) {
    y += 5;
    doc.text(`Descuento: $${venta.descuento.toFixed(2)}`, pageWidth - 50, y, { align: 'right' });
  }

  y += 5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(`TOTAL: $${venta.total.toFixed(2)}`, pageWidth - 50, y, { align: 'right' });

  y += 8;
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Método: ${venta.metodoPago.toUpperCase()}`, pageWidth - 50, y, { align: 'right' });

  if (venta.montoRecibido) {
    y += 5;
    doc.text(`Recibido: $${venta.montoRecibido.toFixed(2)}`, pageWidth - 50, y, { align: 'right' });
    if (venta.cambio && venta.cambio > 0) {
      y += 5;
      doc.text(`Cambio: $${venta.cambio.toFixed(2)}`, pageWidth - 50, y, { align: 'right' });
    }
  }

  // Pie
  y += 15;
  doc.text('¡Gracias por su compra!', centerX, y, { align: 'center' });
}
