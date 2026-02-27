'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Banknote, Receipt, X } from 'lucide-react';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  precio: number;
  costo: number;
  stock: number;
}

interface ItemCarrito {
  productoId?: string;
  codigoProducto: string;
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  costoUnitario: number;
  descuento: number;
  subtotal: number;
  esManual?: boolean;
}

interface Cliente {
  id: string;
  nombre: string;
  nit?: string;
}

interface Empresa {
  nombre: string;
  moneda: string;
  simboloMoneda: string;
}

export default function VentasModule() {
  const { usuario } = useAuth();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [empresa, setEmpresa] = useState<Empresa | null>(null);
  
  const [busqueda, setBusqueda] = useState('');
  const [resultados, setResultados] = useState<Producto[]>([]);
  const [showResultados, setShowResultados] = useState(false);
  
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [nombreCliente, setNombreCliente] = useState('Cliente General');
  const [nitCliente, setNitCliente] = useState('');
  
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [descuentoTotal, setDescuentoTotal] = useState('0');
  
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);
  const [showCobrarModal, setShowCobrarModal] = useState(false);
  const [showVentasModal, setShowVentasModal] = useState(false);
  const [ventas, setVentas] = useState<any[]>([]);
  
  const [productoManual, setProductoManual] = useState({
    nombre: '',
    precio: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  useEffect(() => {
    if (busqueda.length >= 1) {
      const filtrados = productos.filter(p => 
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
      ).slice(0, 10);
      setResultados(filtrados);
      setShowResultados(true);
    } else {
      setResultados([]);
      setShowResultados(false);
    }
  }, [busqueda, productos]);

  const cargarDatos = async () => {
    try {
      const [prodRes, cliRes, empRes] = await Promise.all([
        fetch('/api/productos'),
        fetch('/api/clientes'),
        fetch('/api/config/empresa')
      ]);
      setProductos(await prodRes.json());
      setClientes(await cliRes.json());
      setEmpresa(await empRes.json());
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const agregarProducto = (producto: Producto) => {
    const existente = carrito.find(item => item.productoId === producto.id);
    
    if (existente) {
      if (existente.cantidad >= producto.stock) {
        alert('Stock insuficiente');
        return;
      }
      setCarrito(carrito.map(item => 
        item.productoId === producto.id
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
          : item
      ));
    } else {
      if (producto.stock <= 0) {
        alert('Producto sin stock');
        return;
      }
      setCarrito([...carrito, {
        productoId: producto.id,
        codigoProducto: producto.codigo,
        nombreProducto: producto.nombre,
        cantidad: 1,
        precioUnitario: producto.precio,
        costoUnitario: producto.costo,
        descuento: 0,
        subtotal: producto.precio
      }]);
    }
    
    setBusqueda('');
    setShowResultados(false);
  };

  const agregarProductoManual = () => {
    if (!productoManual.nombre || !productoManual.precio) {
      alert('Completa todos los campos');
      return;
    }
    
    const precio = parseFloat(productoManual.precio);
    if (isNaN(precio) || precio <= 0) {
      alert('Precio inválido');
      return;
    }
    
    setCarrito([...carrito, {
      codigoProducto: 'MANUAL',
      nombreProducto: productoManual.nombre,
      cantidad: 1,
      precioUnitario: precio,
      costoUnitario: 0,
      descuento: 0,
      subtotal: precio,
      esManual: true
    }]);
    
    setProductoManual({ nombre: '', precio: '' });
    setShowManualModal(false);
  };

  const actualizarCantidad = (index: number, nuevaCantidad: number) => {
    if (nuevaCantidad <= 0) {
      eliminarItem(index);
      return;
    }
    
    const item = carrito[index];
    if (!item.esManual && item.productoId) {
      const producto = productos.find(p => p.id === item.productoId);
      if (producto && nuevaCantidad > producto.stock) {
        alert('Stock insuficiente');
        return;
      }
    }
    
    const nuevosItems = [...carrito];
    nuevosItems[index] = {
      ...item,
      cantidad: nuevaCantidad,
      subtotal: nuevaCantidad * item.precioUnitario
    };
    setCarrito(nuevosItems);
  };

  const eliminarItem = (index: number) => {
    setCarrito(carrito.filter((_, i) => i !== index));
  };

  const limpiarCarrito = () => {
    if (carrito.length > 0 && confirm('¿Vaciar el carrito?')) {
      setCarrito([]);
      setDescuentoTotal('0');
    }
  };

  const subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
  const descuento = parseFloat(descuentoTotal) || 0;
  const total = subtotal - descuento;
  const cambio = parseFloat(montoRecibido) - total;

  const procesarVenta = async () => {
    if (carrito.length === 0) {
      alert('El carrito está vacío');
      return;
    }
    
    if (parseFloat(montoRecibido) < total) {
      alert('El monto recibido es insuficiente');
      return;
    }
    
    try {
      const res = await fetch('/api/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clienteId: clienteSeleccionado?.id || null,
          nombreCliente: clienteSeleccionado?.nombre || nombreCliente,
          nitCliente: clienteSeleccionado?.nit || nitCliente,
          subtotal,
          descuento,
          total,
          metodoPago,
          montoRecibido: parseFloat(montoRecibido),
          cambio: cambio > 0 ? cambio : 0,
          usuarioId: usuario?.id,
          detalles: carrito
        })
      });
      
      const data = await res.json();
      
      if (data.success) {
        alert('¡Venta procesada correctamente!');
        // Limpiar todo
        setCarrito([]);
        setDescuentoTotal('0');
        setMontoRecibido('');
        setClienteSeleccionado(null);
        setNombreCliente('Cliente General');
        setNitCliente('');
        setShowCobrarModal(false);
        cargarDatos(); // Recargar productos
      } else {
        alert(data.error || 'Error al procesar la venta');
      }
    } catch (error) {
      alert('Error de conexión');
    }
  };

  const formatPrecio = (valor: number) => {
    return `${empresa?.simboloMoneda || 'Q'} ${valor.toFixed(2)}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-180px)]">
      {/* Panel izquierdo - Búsqueda y productos */}
      <div className="lg:col-span-2 space-y-4">
        {/* Buscador */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar producto por nombre o código..."
          />
          
          {/* Resultados de búsqueda */}
          {showResultados && (
            <div className="absolute top-full left-0 right-0 bg-white border rounded-xl mt-1 shadow-lg z-10 max-h-80 overflow-y-auto">
              {resultados.length === 0 ? (
                <div className="p-4 text-center text-slate-500">No hay resultados</div>
              ) : (
                resultados.map(p => (
                  <button
                    key={p.id}
                    onClick={() => agregarProducto(p)}
                    className="w-full p-3 flex items-center justify-between hover:bg-slate-50 border-b last:border-b-0"
                  >
                    <div className="text-left">
                      <p className="font-medium">{p.nombre}</p>
                      <p className="text-sm text-slate-500">{p.codigo}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-blue-600">{formatPrecio(p.precio)}</p>
                      <p className="text-sm text-slate-500">Stock: {p.stock}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => setShowManualModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" />
            Producto Manual
          </button>
          <button
            onClick={limpiarCarrito}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </button>
          <button
            onClick={() => { cargarVentas(); setShowVentasModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-500 text-white rounded-lg hover:bg-slate-600"
          >
            <Receipt className="w-4 h-4" />
            Historial
          </button>
        </div>

        {/* Tabla del carrito */}
        <div className="bg-white rounded-xl shadow flex-1 overflow-hidden">
          <div className="overflow-x-auto h-full">
            {carrito.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ShoppingCart className="w-16 h-16 mb-4" />
                <p>Carrito vacío</p>
                <p className="text-sm">Busca productos para agregar</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="text-left p-3">Producto</th>
                    <th className="text-center p-3 w-32">Cantidad</th>
                    <th className="text-right p-3">Precio</th>
                    <th className="text-right p-3">Subtotal</th>
                    <th className="p-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.map((item, index) => (
                    <tr key={index} className="border-b hover:bg-slate-50">
                      <td className="p-3">
                        <p className="font-medium">{item.nombreProducto}</p>
                        <p className="text-sm text-slate-500">{item.codigoProducto}</p>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => actualizarCantidad(index, item.cantidad - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded hover:bg-slate-300"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <input
                            type="number"
                            value={item.cantidad}
                            onChange={(e) => actualizarCantidad(index, parseInt(e.target.value) || 0)}
                            className="w-12 text-center border rounded py-1"
                          />
                          <button
                            onClick={() => actualizarCantidad(index, item.cantidad + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-slate-200 rounded hover:bg-slate-300"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-right">{formatPrecio(item.precioUnitario)}</td>
                      <td className="p-3 text-right font-medium">{formatPrecio(item.subtotal)}</td>
                      <td className="p-3">
                        <button
                          onClick={() => eliminarItem(index)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Panel derecho - Resumen y cobro */}
      <div className="space-y-4">
        {/* Cliente */}
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="w-5 h-5" />
              Cliente
            </h3>
            <button
              onClick={() => setShowClienteModal(true)}
              className="text-sm text-blue-500 hover:text-blue-600"
            >
              Cambiar
            </button>
          </div>
          <p className="font-medium">{clienteSeleccionado?.nombre || nombreCliente}</p>
          {nitCliente && <p className="text-sm text-slate-500">NIT: {nitCliente}</p>}
        </div>

        {/* Resumen */}
        <div className="bg-white rounded-xl shadow p-4 space-y-3">
          <h3 className="font-semibold">Resumen</h3>
          
          <div className="flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatPrecio(subtotal)}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-slate-600">Descuento</span>
            <input
              type="number"
              step="0.01"
              value={descuentoTotal}
              onChange={(e) => setDescuentoTotal(e.target.value)}
              className="w-24 text-right border rounded px-2 py-1"
            />
          </div>
          
          <div className="border-t pt-3 flex justify-between text-lg font-bold">
            <span>TOTAL</span>
            <span className="text-blue-600">{formatPrecio(total)}</span>
          </div>
          
          <div className="text-sm text-slate-500">
            {carrito.length} producto(s) - {carrito.reduce((sum, item) => sum + item.cantidad, 0)} unidad(es)
          </div>
        </div>

        {/* Método de pago */}
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="font-semibold mb-3">Método de Pago</h3>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'EFECTIVO', icon: Banknote, label: 'Efectivo' },
              { id: 'TARJETA', icon: CreditCard, label: 'Tarjeta' },
              { id: 'TRANSFERENCIA', icon: Banknote, label: 'Transfer' },
            ].map(m => (
              <button
                key={m.id}
                onClick={() => setMetodoPago(m.id)}
                className={`p-3 rounded-lg border flex flex-col items-center gap-1 ${
                  metodoPago === m.id 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'hover:bg-slate-50'
                }`}
              >
                <m.icon className="w-5 h-5" />
                <span className="text-xs">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Botón cobrar */}
        <button
          onClick={() => setShowCobrarModal(true)}
          disabled={carrito.length === 0}
          className="w-full py-4 bg-green-500 text-white rounded-xl font-bold text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          COBRAR {formatPrecio(total)}
        </button>
      </div>

      {/* Modal Cliente */}
      {showClienteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Seleccionar Cliente</h3>
              <button onClick={() => setShowClienteModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <input
                type="text"
                value={nombreCliente}
                onChange={(e) => { setNombreCliente(e.target.value); setClienteSeleccionado(null); }}
                className="w-full px-3 py-2 border rounded-lg mb-3"
                placeholder="Nombre del cliente"
              />
              <input
                type="text"
                value={nitCliente}
                onChange={(e) => setNitCliente(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg mb-4"
                placeholder="NIT (opcional)"
              />
              
              <p className="text-sm text-slate-500 mb-2">Clientes frecuentes:</p>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                <button
                  onClick={() => {
                    setClienteSeleccionado(null);
                    setNombreCliente('Cliente General');
                    setNitCliente('');
                    setShowClienteModal(false);
                  }}
                  className="w-full p-2 text-left hover:bg-slate-50 rounded"
                >
                  Cliente General
                </button>
                {clientes.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setClienteSeleccionado(c);
                      setNombreCliente(c.nombre);
                      setNitCliente(c.nit || '');
                      setShowClienteModal(false);
                    }}
                    className="w-full p-2 text-left hover:bg-slate-50 rounded"
                  >
                    {c.nombre} {c.nit && <span className="text-slate-500">- {c.nit}</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Producto Manual */}
      {showManualModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Producto Manual</h3>
              <button onClick={() => setShowManualModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nombre</label>
                <input
                  type="text"
                  value={productoManual.nombre}
                  onChange={(e) => setProductoManual({ ...productoManual, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Descripción del producto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Precio</label>
                <input
                  type="number"
                  step="0.01"
                  value={productoManual.precio}
                  onChange={(e) => setProductoManual({ ...productoManual, precio: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="0.00"
                />
              </div>
              <button
                onClick={agregarProductoManual}
                className="w-full py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cobrar */}
      {showCobrarModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-sm">
            <div className="p-4 border-b">
              <h3 className="text-xl font-bold text-center">Procesar Venta</h3>
            </div>
            <div className="p-4 space-y-4">
              <div className="text-center">
                <p className="text-slate-500">Total a pagar</p>
                <p className="text-4xl font-bold text-blue-600">{formatPrecio(total)}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Monto Recibido</label>
                <input
                  type="number"
                  step="0.01"
                  value={montoRecibido}
                  onChange={(e) => setMontoRecibido(e.target.value)}
                  className="w-full px-3 py-3 border rounded-lg text-2xl text-center"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
              
              {parseFloat(montoRecibido) >= total && (
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-slate-500">Cambio</p>
                  <p className="text-2xl font-bold text-green-600">{formatPrecio(cambio)}</p>
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCobrarModal(false)}
                  className="flex-1 py-3 bg-slate-200 rounded-lg font-medium hover:bg-slate-300"
                >
                  Cancelar
                </button>
                <button
                  onClick={procesarVenta}
                  disabled={parseFloat(montoRecibido) < total}
                  className="flex-1 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 disabled:opacity-50"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Historial */}
      {showVentasModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Historial de Ventas</h3>
              <button onClick={() => setShowVentasModal(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {ventas.length === 0 ? (
                <p className="text-center text-slate-500 py-8">No hay ventas recientes</p>
              ) : (
                <div className="space-y-2">
                  {ventas.map((v: any) => (
                    <div key={v.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">Factura {v.serie}-{v.numero.toString().padStart(6, '0')}</p>
                          <p className="text-sm text-slate-500">{v.nombreCliente}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{formatPrecio(v.total)}</p>
                          <p className="text-sm text-slate-500">
                            {new Date(v.fecha).toLocaleString('es-ES')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function cargarVentas() {
    try {
      const res = await fetch('/api/ventas');
      setVentas(await res.json());
    } catch (error) {
      console.error('Error:', error);
    }
  }
}
