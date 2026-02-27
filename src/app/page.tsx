'use client';

import { useState, useEffect } from 'react';
import { 
  Search, Plus, Minus, Trash2, ShoppingCart, Package, DollarSign,
  CreditCard, Banknote, Receipt, X, Check, User, FileText, XCircle,
  BarChart3, Settings, Users, Truck, Building, History, Eye, Printer,
  ChevronDown, Edit, Save, TrendingUp, TrendingDown, Calendar, Mail,
  Phone, MapPin, FileSpreadsheet, Download, AlertTriangle, Lock
} from 'lucide-react';

// ============================================
// SISTEMA POS - PALETA DE COLORES VIBRANTE
// ============================================
// Fondo: gradiente suave azul/verde oscuro
// Cada módulo tiene su color distintivo brillante

interface Producto {
  id: string;
  codigo: string;
  codigoBarras: string | null;
  nombre: string;
  precioVenta: number;
  costo: number;
  categoriaId: string | null;
  categoria?: { nombre: string; color?: string } | null;
  tieneItbis: boolean;
  porcentajeItbis: number;
  sucursales: { sucursalId: string; stock: number }[];
  proveedorId?: string;
  proveedor?: { nombre: string } | null;
}

interface ItemCarrito {
  producto: Producto | null;
  nombre: string;
  cantidad: number;
  precioUnitario: number;
  descuento: number;
  subtotal: number;
  esManual: boolean;
}

interface Cliente {
  id: string;
  nombre: string;
  apellido?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  totalCompras?: number;
  cantidadCompras?: number;
}

interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  documento?: string;
  email?: string;
  telefono?: string;
  direccion?: string;
  notas?: string;
  _count?: { productos: number; compras: number };
}

interface Venta {
  id: string;
  numeroFactura: string;
  cliente?: { nombre: string; apellido?: string } | null;
  total: number;
  metodoPago: string;
  estado: string;
  fecha: string;
  detalles?: { producto: { nombre: string }; cantidad: number; precioUnitario: number; subtotal: number }[];
}

interface Compra {
  id: string;
  numeroCompra: string;
  proveedor?: { nombre: string } | null;
  total: number;
  estado: string;
  fecha: string;
  detalles?: { producto: { nombre: string }; cantidad: number; costoUnitario: number; subtotal: number }[];
}

interface Gasto {
  id: string;
  concepto: string;
  monto: number;
  categoria: string;
  fecha: string;
  notas?: string;
  sucursal?: { nombre: string } | null;
  usuario?: { nombre: string } | null;
}

interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  rol: string;
  activo: boolean;
}

interface Config {
  id?: string;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  simboloMoneda: string;
  moneda?: string;
  mensajeTicket?: string;
}

interface Categoria {
  id: string;
  nombre: string;
  color?: string;
  _count?: { productos: number };
}

type Modulo = 'ventas' | 'historial' | 'inventario' | 'clientes' | 'proveedores' | 'compras' | 'gastos' | 'reportes' | 'config' | 'usuarios';

// Colores vibrantes para cada módulo
const coloresModulo = {
  ventas: { 
    bg: 'bg-gradient-to-r from-purple-600 to-pink-500', 
    solid: 'bg-purple-500',
    light: 'bg-purple-100', 
    text: 'text-purple-600', 
    border: 'border-purple-400',
    icon: 'text-purple-500'
  },
  historial: { 
    bg: 'bg-gradient-to-r from-gray-600 to-gray-500', 
    solid: 'bg-gray-500',
    light: 'bg-gray-100', 
    text: 'text-gray-600', 
    border: 'border-gray-400',
    icon: 'text-gray-500'
  },
  inventario: { 
    bg: 'bg-gradient-to-r from-teal-500 to-cyan-500', 
    solid: 'bg-teal-500',
    light: 'bg-teal-100', 
    text: 'text-teal-600', 
    border: 'border-teal-400',
    icon: 'text-teal-500'
  },
  clientes: { 
    bg: 'bg-gradient-to-r from-rose-500 to-red-400', 
    solid: 'bg-rose-500',
    light: 'bg-rose-100', 
    text: 'text-rose-600', 
    border: 'border-rose-400',
    icon: 'text-rose-500'
  },
  proveedores: { 
    bg: 'bg-gradient-to-r from-amber-500 to-orange-400', 
    solid: 'bg-amber-500',
    light: 'bg-amber-100', 
    text: 'text-amber-600', 
    border: 'border-amber-400',
    icon: 'text-amber-500'
  },
  compras: { 
    bg: 'bg-gradient-to-r from-emerald-500 to-green-400', 
    solid: 'bg-emerald-500',
    light: 'bg-emerald-100', 
    text: 'text-emerald-600', 
    border: 'border-emerald-400',
    icon: 'text-emerald-500'
  },
  gastos: { 
    bg: 'bg-gradient-to-r from-red-500 to-rose-400', 
    solid: 'bg-red-500',
    light: 'bg-red-100', 
    text: 'text-red-600', 
    border: 'border-red-400',
    icon: 'text-red-500'
  },
  reportes: { 
    bg: 'bg-gradient-to-r from-indigo-500 to-blue-400', 
    solid: 'bg-indigo-500',
    light: 'bg-indigo-100', 
    text: 'text-indigo-600', 
    border: 'border-indigo-400',
    icon: 'text-indigo-500'
  },
  config: { 
    bg: 'bg-gradient-to-r from-slate-600 to-gray-500', 
    solid: 'bg-slate-500',
    light: 'bg-slate-100', 
    text: 'text-slate-600', 
    border: 'border-slate-400',
    icon: 'text-slate-500'
  },
  usuarios: { 
    bg: 'bg-gradient-to-r from-sky-500 to-blue-400', 
    solid: 'bg-sky-500',
    light: 'bg-sky-100', 
    text: 'text-sky-600', 
    border: 'border-sky-400',
    icon: 'text-sky-500'
  },
};

export default function POS() {
  const [modulo, setModulo] = useState<Modulo>('ventas');
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<Config | null>(null);
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [carrito, setCarrito] = useState<ItemCarrito[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);
  const [mostrarClientes, setMostrarClientes] = useState(false);
  
  const [mostrarPago, setMostrarPago] = useState(false);
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [procesando, setProcesando] = useState(false);
  const [ventaCompletada, setVentaCompletada] = useState<any>(null);
  
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [ventaSeleccionada, setVentaSeleccionada] = useState<Venta | null>(null);
  
  const [mostrarModalPin, setMostrarModalPin] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [accionPendiente, setAccionPendiente] = useState<{ tipo: string; id: string; callback?: () => void } | null>(null);
  
  const [mostrarManual, setMostrarManual] = useState(false);
  const [manualNombre, setManualNombre] = useState('');
  const [manualPrecio, setManualPrecio] = useState('');
  
  const [sidebarAbierto, setSidebarAbierto] = useState(true);
  const [descuentoGlobal, setDescuentoGlobal] = useState(0);
  
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [compras, setCompras] = useState<Compra[]>([]);
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  
  const [mostrarModalCliente, setMostrarModalCliente] = useState(false);
  const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
  
  const [mostrarModalProveedor, setMostrarModalProveedor] = useState(false);
  const [proveedorEditando, setProveedorEditando] = useState<Proveedor | null>(null);
  
  const [mostrarModalGasto, setMostrarModalGasto] = useState(false);
  const [gastoEditando, setGastoEditando] = useState<Gasto | null>(null);
  
  const [mostrarModalCompra, setMostrarModalCompra] = useState(false);
  const [itemsCompra, setItemsCompra] = useState<{ productoId: string; producto?: Producto; cantidad: number; costoUnitario: number }[]>([]);
  const [proveedorCompra, setProveedorCompra] = useState<string>('');
  const [busquedaProductoCompra, setBusquedaProductoCompra] = useState('');
  
  const [mostrarModalUsuario, setMostrarModalUsuario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  
  const [mostrarModalProducto, setMostrarModalProducto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string>('');
  const [datosReporte, setDatosReporte] = useState<any>(null);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const usuario = { nombre: 'Administrador', rol: 'admin' };
  const sucursalId = 'default';

  useEffect(() => { cargarDatosIniciales(); }, []);

  const cargarDatosIniciales = async () => {
    try {
      const [prodRes, configRes, clientesRes, categoriasRes] = await Promise.all([
        fetch('/api/pos/productos'),
        fetch('/api/pos/empresa'),
        fetch('/api/pos/clientes'),
        fetch('/api/pos/categorias')
      ]);
      setProductos(await prodRes.json());
      const configData = await configRes.json();
      setConfig(configData);
      setClientes(await clientesRes.json());
      setCategorias(await categoriasRes.json());
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (modulo === 'historial') cargarHistorial();
    if (modulo === 'clientes') cargarClientes();
    if (modulo === 'proveedores') cargarProveedores();
    if (modulo === 'compras') cargarCompras();
    if (modulo === 'gastos') cargarGastos();
    if (modulo === 'usuarios') cargarUsuarios();
  }, [modulo]);

  const cargarHistorial = async () => {
    try { const res = await fetch('/api/pos/ventas'); setVentas(await res.json()); }
    catch (error) { console.error('Error:', error); }
  };

  const cargarClientes = async () => {
    try { const res = await fetch('/api/pos/clientes'); setClientes(await res.json()); }
    catch (error) { console.error('Error:', error); }
  };

  const cargarProveedores = async () => {
    try { const res = await fetch('/api/pos/proveedores'); setProveedores(await res.json()); }
    catch (error) { console.error('Error:', error); }
  };

  const cargarCompras = async () => {
    try { const res = await fetch('/api/pos/compras'); setCompras(await res.json()); }
    catch (error) { console.error('Error:', error); }
  };

  const cargarGastos = async () => {
    try { const res = await fetch('/api/pos/gastos'); setGastos(await res.json()); }
    catch (error) { console.error('Error:', error); }
  };

  const cargarUsuarios = async () => {
    try { const res = await fetch('/api/pos/usuarios'); setUsuarios(await res.json()); }
    catch (error) { console.error('Error:', error); }
  };

  const productosFiltrados = productos.filter(p => {
    if (!busqueda) return true;
    const b = busqueda.toLowerCase();
    return p.nombre.toLowerCase().includes(b) || p.codigo.toLowerCase().includes(b) || (p.codigoBarras && p.codigoBarras.includes(busqueda));
  });

  const getStock = (p: Producto) => {
    const suc = p.sucursales?.find(s => s.sucursalId === sucursalId);
    return suc?.stock ?? 0;
  };

  const agregarAlCarrito = (producto: Producto) => {
    const stock = getStock(producto);
    const existente = carrito.find(item => item.producto?.id === producto.id && !item.esManual);
    if (existente) {
      if (existente.cantidad >= stock) { alert('Stock insuficiente'); return; }
      setCarrito(carrito.map(item => 
        item.producto?.id === producto.id && !item.esManual
          ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
          : item
      ));
    } else {
      setCarrito([...carrito, { producto, nombre: producto.nombre, cantidad: 1, precioUnitario: producto.precioVenta, descuento: 0, subtotal: producto.precioVenta, esManual: false }]);
    }
    setBusqueda('');
  };

  const agregarManual = () => {
    if (!manualNombre || !manualPrecio) return;
    const precio = parseFloat(manualPrecio);
    if (isNaN(precio) || precio <= 0) return;
    setCarrito([...carrito, { producto: null, nombre: manualNombre, cantidad: 1, precioUnitario: precio, descuento: 0, subtotal: precio, esManual: true }]);
    setManualNombre(''); setManualPrecio(''); setMostrarManual(false);
  };

  const actualizarCantidad = (index: number, cantidad: number) => {
    if (cantidad <= 0) { eliminarItem(index); return; }
    const item = carrito[index];
    if (!item.esManual && item.producto) {
      const stock = getStock(item.producto);
      if (cantidad > stock) { alert('Stock insuficiente'); return; }
    }
    setCarrito(carrito.map((it, i) => i === index ? { ...it, cantidad, subtotal: cantidad * it.precioUnitario } : it));
  };

  const eliminarItem = (index: number) => setCarrito(carrito.filter((_, i) => i !== index));
  const vaciarCarrito = () => { setCarrito([]); setClienteSeleccionado(null); setDescuentoGlobal(0); };

  const subtotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const itbis = carrito.reduce((acc, item) => {
    if (item.producto?.tieneItbis) return acc + (item.subtotal * (item.producto.porcentajeItbis / 100));
    return acc;
  }, 0);
  const total = subtotal + itbis - descuentoGlobal;
  const cambio = montoRecibido ? parseFloat(montoRecibido) - total : 0;

  const formatoMoneda = (valor: number) => `${config?.simboloMoneda || '$'}${valor.toFixed(2)}`;
  const validarMonto = (valor: string) => /^\d*\.?\d{0,2}$/.test(valor);

  const procesarVenta = async () => {
    if (carrito.length === 0) return;
    if (metodoPago === 'efectivo' && parseFloat(montoRecibido) < total) { alert('El monto recibido es insuficiente'); return; }
    setProcesando(true);
    try {
      const res = await fetch('/api/pos/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: carrito.map(item => ({ productoId: item.producto?.id, nombre: item.nombre, cantidad: item.cantidad, precioUnitario: item.precioUnitario, costoUnitario: item.producto?.costo || 0, subtotal: item.subtotal, esManual: item.esManual })),
          clienteId: clienteSeleccionado?.id, subtotal, itbis, descuento: descuentoGlobal, total, metodoPago,
          montoRecibido: parseFloat(montoRecibido) || total, cambio: Math.max(0, cambio), sucursalId, usuarioId: 'default'
        })
      });
      const data = await res.json();
      if (data.success) {
        setVentaCompletada(data.venta);
        setCarrito([]); setClienteSeleccionado(null); setDescuentoGlobal(0); setMostrarPago(false); setMontoRecibido('');
        cargarDatosIniciales();
      }
    } catch (error) { console.error('Error:', error); }
    finally { setProcesando(false); }
  };

  const anularVenta = async (id: string) => {
    try {
      const res = await fetch(`/api/pos/ventas/${id}/anular`, { method: 'POST' });
      const data = await res.json();
      if (data.success) { cargarHistorial(); setVentaSeleccionada(null); alert('Venta anulada correctamente'); }
    } catch (error) { console.error('Error:', error); }
  };

  const verificarPin = () => {
    if (pinInput === '2024') {
      if (accionPendiente?.callback) accionPendiente.callback();
      else if (accionPendiente?.tipo === 'anular') anularVenta(accionPendiente.id);
      setMostrarModalPin(false); setPinInput(''); setAccionPendiente(null);
    } else { alert('PIN incorrecto'); setPinInput(''); }
  };

  const guardarCliente = async (cliente: Cliente) => {
    try {
      const res = await fetch('/api/pos/clientes', { method: clienteEditando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cliente) });
      const data = await res.json();
      if (data.success || data.cliente) { cargarClientes(); setMostrarModalCliente(false); setClienteEditando(null); }
    } catch (error) { console.error('Error:', error); }
  };

  const eliminarCliente = async (id: string) => {
    try {
      const res = await fetch('/api/pos/clientes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, pin: '2024' }) });
      const data = await res.json();
      if (data.success) cargarClientes();
    } catch (error) { console.error('Error:', error); }
  };

  const guardarProveedor = async (proveedor: Proveedor) => {
    try {
      const res = await fetch('/api/pos/proveedores', { method: proveedorEditando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(proveedor) });
      const data = await res.json();
      if (data.success || data.proveedor) { cargarProveedores(); setMostrarModalProveedor(false); setProveedorEditando(null); }
    } catch (error) { console.error('Error:', error); }
  };

  const eliminarProveedor = async (id: string) => {
    try {
      const res = await fetch('/api/pos/proveedores', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, pin: '2024' }) });
      const data = await res.json();
      if (data.success) cargarProveedores();
    } catch (error) { console.error('Error:', error); }
  };

  const guardarGasto = async (gasto: Gasto) => {
    try {
      const res = await fetch('/api/pos/gastos', { method: gastoEditando?.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(gastoEditando?.id ? { ...gasto, id: gastoEditando.id } : gasto) });
      const data = await res.json();
      if (data.success || data.gasto) { cargarGastos(); setMostrarModalGasto(false); setGastoEditando(null); }
    } catch (error) { console.error('Error:', error); }
  };

  const eliminarGasto = async (id: string) => {
    try {
      const res = await fetch(`/api/pos/gastos?id=${id}&pin=2024`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) cargarGastos();
    } catch (error) { console.error('Error:', error); }
  };

  const guardarCompra = async () => {
    if (itemsCompra.length === 0) { alert('Agregue productos a la compra'); return; }
    try {
      const res = await fetch('/api/pos/compras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ proveedorId: proveedorCompra || null, detalles: itemsCompra.map(item => ({ productoId: item.productoId, cantidad: item.cantidad, costoUnitario: item.costoUnitario })) })
      });
      const data = await res.json();
      if (data.success) { cargarCompras(); cargarDatosIniciales(); setMostrarModalCompra(false); setItemsCompra([]); setProveedorCompra(''); }
    } catch (error) { console.error('Error:', error); }
  };

  const guardarUsuario = async (usuario: Usuario & { password?: string }) => {
    try {
      const res = await fetch('/api/pos/usuarios', { method: usuarioEditando ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(usuario) });
      const data = await res.json();
      if (data.success || data.usuario) { cargarUsuarios(); setMostrarModalUsuario(false); setUsuarioEditando(null); }
    } catch (error) { console.error('Error:', error); }
  };

  const guardarConfig = async (newConfig: Config) => {
    try {
      const res = await fetch('/api/pos/empresa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newConfig) });
      const data = await res.json();
      if (data.success || data.empresa) { setConfig(data.empresa || newConfig); alert('Configuración guardada'); }
    } catch (error) { console.error('Error:', error); }
  };

  const cargarReporte = async (tipo: string) => {
    setReporteSeleccionado(tipo);
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      params.append('tipo', tipo);
      const res = await fetch(`/api/pos/reportes?${params.toString()}`);
      setDatosReporte(await res.json());
    } catch (error) { console.error('Error:', error); }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-20 h-20 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-purple-300 animate-ping"></div>
            <div className="absolute inset-0 rounded-full border-4 border-t-purple-500 border-r-pink-500 border-b-rose-500 border-l-amber-500 animate-spin"></div>
          </div>
          <p className="text-gray-600 text-lg font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex">
      {/* SIDEBAR */}
      <aside className={`${sidebarAbierto ? 'w-64' : 'w-20'} bg-white border-r border-gray-200 flex flex-col transition-all shadow-lg`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-pink-500 to-rose-500 flex items-center justify-center flex-shrink-0 shadow-lg">
              <Package className="w-5 h-5 text-white" />
            </div>
            {sidebarAbierto && (
              <div className="overflow-hidden">
                <h1 className="text-lg font-bold text-gray-800 truncate">{config?.nombre || 'POS Pro'}</h1>
                <p className="text-xs text-gray-400">Sistema Integral</p>
              </div>
            )}
          </div>
        </div>
        
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {[
            { id: 'ventas', icon: ShoppingCart, label: 'Ventas', color: 'purple' },
            { id: 'historial', icon: History, label: 'Historial', color: 'gray' },
            { id: 'inventario', icon: Package, label: 'Inventario', color: 'teal' },
            { id: 'clientes', icon: User, label: 'Clientes', color: 'rose' },
            { id: 'proveedores', icon: Truck, label: 'Proveedores', color: 'amber' },
            { id: 'compras', icon: Receipt, label: 'Compras', color: 'emerald' },
            { id: 'gastos', icon: DollarSign, label: 'Gastos', color: 'red' },
            { id: 'reportes', icon: BarChart3, label: 'Reportes', color: 'indigo' },
            { id: 'config', icon: Settings, label: 'Config', color: 'slate' },
            { id: 'usuarios', icon: Users, label: 'Usuarios', color: 'sky' },
          ].map(item => {
            const isActive = modulo === item.id;
            const colorClass = coloresModulo[item.id as keyof typeof coloresModulo];
            return (
              <button
                key={item.id}
                onClick={() => setModulo(item.id as Modulo)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isActive 
                    ? `${colorClass.light} ${colorClass.text} ${colorClass.border} border font-medium` 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                }`}
              >
                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? colorClass.icon : ''}`} />
                {sidebarAbierto && <span className="text-sm">{item.label}</span>}
              </button>
            );
          })}
        </nav>
        
        <button onClick={() => setSidebarAbierto(!sidebarAbierto)} className="p-4 border-t border-gray-100 text-gray-400 hover:text-gray-600 transition">
          <ChevronDown className={`w-5 h-5 transform transition-transform ${sidebarAbierto ? 'rotate-0' : '-rotate-90'}`} />
        </button>
      </aside>

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className={`${coloresModulo[modulo].bg} px-6 py-4 shadow-lg`}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white capitalize flex items-center gap-2">
              {modulo === 'ventas' && <ShoppingCart className="w-6 h-6" />}
              {modulo === 'historial' && <History className="w-6 h-6" />}
              {modulo === 'inventario' && <Package className="w-6 h-6" />}
              {modulo === 'clientes' && <User className="w-6 h-6" />}
              {modulo === 'proveedores' && <Truck className="w-6 h-6" />}
              {modulo === 'compras' && <Receipt className="w-6 h-6" />}
              {modulo === 'gastos' && <DollarSign className="w-6 h-6" />}
              {modulo === 'reportes' && <BarChart3 className="w-6 h-6" />}
              {modulo === 'config' && <Settings className="w-6 h-6" />}
              {modulo === 'usuarios' && <Users className="w-6 h-6" />}
              {modulo}
            </h2>
            <div className="flex items-center gap-4">
              <span className="text-white/90 text-sm font-medium">{usuario.nombre}</span>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </header>

        {/* MÓDULO DE VENTAS */}
        {modulo === 'ventas' && (
          <div className="flex-1 flex overflow-hidden bg-gray-50">
            <div className="flex-1 flex flex-col">
              <div className="p-4 bg-white border-b border-gray-100">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por nombre, código o código de barras..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-100"
                    />
                  </div>
                  <button onClick={() => setMostrarManual(true)} className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-xl flex items-center gap-2 transition shadow-md">
                    <Plus className="w-5 h-5" /> Manual
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {productosFiltrados.map((p, idx) => {
                    const stock = getStock(p);
                    const colors = ['purple', 'teal', 'rose', 'amber', 'emerald', 'indigo'];
                    const color = colors[idx % colors.length];
                    const colorStyles = coloresModulo[colors[idx % colors.length] as keyof typeof coloresModulo];
                    return (
                      <button
                        key={p.id}
                        onClick={() => agregarAlCarrito(p)}
                        disabled={stock <= 0}
                        className={`p-4 rounded-xl text-left transition-all transform hover:scale-[1.02] shadow-sm ${
                          stock <= 0 
                            ? 'bg-gray-100 opacity-50 cursor-not-allowed' 
                            : `bg-white border border-gray-100 hover:border-${color}-300 hover:shadow-md`
                        }`}
                      >
                        <div className={`w-12 h-12 ${colorStyles.light} rounded-xl flex items-center justify-center mb-3`}>
                          <Package className={`w-6 h-6 ${colorStyles.icon}`} />
                        </div>
                        <p className="font-medium text-gray-800 text-sm line-clamp-2">{p.nombre}</p>
                        <p className={`${coloresModulo.ventas.text} font-bold mt-1`}>{formatoMoneda(p.precioVenta)}</p>
                        <p className={`text-xs mt-1 ${stock <= 5 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                          Stock: {stock}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Panel del carrito */}
            <div className="w-96 bg-white border-l border-gray-100 flex flex-col shadow-lg">
              <div className="p-4 border-b border-gray-100">
                <button onClick={() => setMostrarClientes(true)} className="w-full p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition">
                  {clienteSeleccionado ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-800 font-medium">{clienteSeleccionado.nombre}</p>
                        <p className="text-gray-400 text-sm">{clienteSeleccionado.documento}</p>
                      </div>
                      <X className="w-4 h-4 text-gray-400" onClick={(e) => { e.stopPropagation(); setClienteSeleccionado(null); }} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-gray-400">
                      <User className="w-5 h-5" /> <span>Cliente General</span>
                    </div>
                  )}
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                {carrito.length === 0 ? (
                  <div className="text-center py-12 text-gray-400">
                    <ShoppingCart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Carrito vacío</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {carrito.map((item, i) => (
                      <div key={i} className="bg-gray-50 rounded-xl p-3">
                        <div className="flex items-start justify-between">
                          <p className="text-gray-800 text-sm font-medium flex-1">{item.nombre}</p>
                          <button onClick={() => eliminarItem(i)} className="text-gray-400 hover:text-red-500 ml-2">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => actualizarCantidad(i, item.cantidad - 1)} className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-300">
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-gray-800 w-8 text-center font-medium">{item.cantidad}</span>
                            <button onClick={() => actualizarCantidad(i, item.cantidad + 1)} className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 hover:bg-gray-300">
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-purple-600 font-bold">{formatoMoneda(item.subtotal)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-gray-100 bg-gray-50">
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-gray-500">
                    <span>Subtotal</span> <span>{formatoMoneda(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500">
                    <span>ITBIS</span> <span>{formatoMoneda(itbis)}</span>
                  </div>
                  {descuentoGlobal > 0 && (
                    <div className="flex justify-between text-red-500">
                      <span>Descuento</span> <span>-{formatoMoneda(descuentoGlobal)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-bold text-gray-800 pt-2 border-t border-gray-200">
                    <span>Total</span>
                    <span className="text-purple-600">{formatoMoneda(total)}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button onClick={vaciarCarrito} disabled={carrito.length === 0} className="px-4 py-3 bg-red-100 text-red-600 rounded-xl disabled:opacity-50 hover:bg-red-200 transition">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button onClick={() => setMostrarPago(true)} disabled={carrito.length === 0} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 transition shadow-lg">
                    <DollarSign className="w-5 h-5" /> Cobrar {formatoMoneda(total)}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO HISTORIAL */}
        {modulo === 'historial' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">Factura</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Cliente</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Fecha</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Total</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Estado</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {ventas.map(v => (
                    <tr key={v.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-800 font-mono font-medium">{v.numeroFactura}</td>
                      <td className="p-4 text-gray-600">{v.cliente?.nombre || 'Cliente General'}</td>
                      <td className="p-4 text-gray-600">{new Date(v.fecha).toLocaleString('es-DO')}</td>
                      <td className="p-4 text-right text-purple-600 font-bold">{formatoMoneda(v.total)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          v.estado === 'completada' ? 'bg-emerald-100 text-emerald-700' :
                          v.estado === 'anulada' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {v.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setVentaSeleccionada(v)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                            <Eye className="w-4 h-4" />
                          </button>
                          {v.estado !== 'anulada' && (
                            <button onClick={() => { setAccionPendiente({ tipo: 'anular', id: v.id }); setMostrarModalPin(true); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MÓDULO INVENTARIO */}
        {modulo === 'inventario' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-teal-500 text-white rounded-xl hover:bg-teal-600 flex items-center gap-2 transition shadow-md">
                  <FileSpreadsheet className="w-5 h-5" /> Exportar Excel
                </button>
                <button className="px-4 py-2 bg-white text-gray-700 rounded-xl hover:bg-gray-50 flex items-center gap-2 transition border border-gray-200">
                  <Download className="w-5 h-5" /> Importar
                </button>
              </div>
              <button className="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-xl hover:from-teal-600 hover:to-cyan-600 flex items-center gap-2 transition shadow-md">
                <Plus className="w-5 h-5" /> Nuevo Producto
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">Código</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Producto</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Categoría</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Costo</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Precio</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Stock</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {productos.map(p => (
                    <tr key={p.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-500 font-mono">{p.codigo}</td>
                      <td className="p-4 text-gray-800 font-medium">{p.nombre}</td>
                      <td className="p-4">
                        {p.categoria && (
                          <span className="px-2 py-1 rounded-lg text-xs bg-teal-100 text-teal-700">{p.categoria.nombre}</span>
                        )}
                      </td>
                      <td className="p-4 text-right text-gray-600">{formatoMoneda(p.costo)}</td>
                      <td className="p-4 text-right text-teal-600 font-bold">{formatoMoneda(p.precioVenta)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          getStock(p) <= 5 ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {getStock(p)}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                          <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MÓDULO CLIENTES */}
        {modulo === 'clientes' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex justify-end mb-4">
              <button onClick={() => { setClienteEditando(null); setMostrarModalCliente(true); }} className="px-4 py-2 bg-gradient-to-r from-rose-500 to-red-400 text-white rounded-xl hover:from-rose-600 hover:to-red-500 flex items-center gap-2 transition shadow-md">
                <Plus className="w-5 h-5" /> Nuevo Cliente
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">Nombre</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Documento</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Contacto</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Total Compras</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {clientes.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-rose-600" />
                          </div>
                          <span className="text-gray-800 font-medium">{c.nombre} {c.apellido}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{c.documento || '-'}</td>
                      <td className="p-4">
                        <div className="flex flex-col gap-1">
                          {c.telefono && <span className="text-gray-600 text-sm flex items-center gap-1"><Phone className="w-3 h-3" /> {c.telefono}</span>}
                          {c.email && <span className="text-gray-400 text-sm flex items-center gap-1"><Mail className="w-3 h-3" /> {c.email}</span>}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <span className="text-rose-600 font-bold">{formatoMoneda(c.totalCompras || 0)}</span>
                        <span className="text-gray-400 text-xs ml-2">({c.cantidadCompras || 0})</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setClienteEditando(c); setMostrarModalCliente(true); }} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { setAccionPendiente({ tipo: 'eliminar-cliente', id: c.id, callback: () => eliminarCliente(c.id) }); setMostrarModalPin(true); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MÓDULO PROVEEDORES */}
        {modulo === 'proveedores' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex justify-end mb-4">
              <button onClick={() => { setProveedorEditando(null); setMostrarModalProveedor(true); }} className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl hover:from-amber-600 hover:to-orange-500 flex items-center gap-2 transition shadow-md">
                <Plus className="w-5 h-5" /> Nuevo Proveedor
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {proveedores.map(p => (
                <div key={p.id} className="bg-white rounded-xl border border-gray-100 p-4 hover:border-amber-200 transition shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Truck className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="text-gray-800 font-medium">{p.nombre}</p>
                        {p.contacto && <p className="text-gray-400 text-sm">{p.contacto}</p>}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => { setProveedorEditando(p); setMostrarModalProveedor(true); }} className="p-2 text-gray-400 hover:text-amber-600 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                      <button onClick={() => { setAccionPendiente({ tipo: 'eliminar-proveedor', id: p.id, callback: () => eliminarProveedor(p.id) }); setMostrarModalPin(true); }} className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  </div>
                  <div className="space-y-1 text-sm">
                    {p.documento && <p className="text-gray-500"><span className="text-gray-400">RNC:</span> {p.documento}</p>}
                    {p.telefono && <p className="text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3 text-gray-400" /> {p.telefono}</p>}
                    {p.email && <p className="text-gray-500 flex items-center gap-1"><Mail className="w-3 h-3 text-gray-400" /> {p.email}</p>}
                  </div>
                  <div className="flex gap-3 mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400">{p._count?.productos || 0} productos</span>
                    <span className="text-xs text-gray-400">{p._count?.compras || 0} compras</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MÓDULO COMPRAS */}
        {modulo === 'compras' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex justify-end mb-4">
              <button onClick={() => { setItemsCompra([]); setProveedorCompra(''); setMostrarModalCompra(true); }} className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-xl hover:from-emerald-600 hover:to-green-500 flex items-center gap-2 transition shadow-md">
                <Plus className="w-5 h-5" /> Nueva Compra
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">N° Compra</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Proveedor</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Fecha</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Total</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Estado</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {compras.map(c => (
                    <tr key={c.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-800 font-mono">{c.numeroCompra}</td>
                      <td className="p-4 text-gray-600">{c.proveedor?.nombre || 'Sin proveedor'}</td>
                      <td className="p-4 text-gray-600">{new Date(c.fecha).toLocaleDateString('es-DO')}</td>
                      <td className="p-4 text-right text-emerald-600 font-bold">{formatoMoneda(c.total)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          c.estado === 'recibida' ? 'bg-emerald-100 text-emerald-700' :
                          c.estado === 'cancelada' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {c.estado}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"><Eye className="w-4 h-4" /></button>
                          {c.estado !== 'cancelada' && (
                            <button onClick={() => { setAccionPendiente({ tipo: 'cancelar-compra', id: c.id }); setMostrarModalPin(true); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><XCircle className="w-4 h-4" /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MÓDULO GASTOS */}
        {modulo === 'gastos' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-2 items-center">
                <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400" />
                <span className="text-gray-400">a</span>
                <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400" />
              </div>
              <button onClick={() => { setGastoEditando(null); setMostrarModalGasto(true); }} className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-400 text-white rounded-xl hover:from-red-600 hover:to-rose-500 flex items-center gap-2 transition shadow-md">
                <Plus className="w-5 h-5" /> Nuevo Gasto
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">Fecha</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Concepto</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Categoría</th>
                    <th className="text-right p-4 text-gray-600 font-medium">Monto</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {gastos.map(g => (
                    <tr key={g.id} className="hover:bg-gray-50">
                      <td className="p-4 text-gray-600">{new Date(g.fecha).toLocaleDateString('es-DO')}</td>
                      <td className="p-4 text-gray-800 font-medium">{g.concepto}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs ${
                          g.categoria === 'operativo' ? 'bg-blue-100 text-blue-700' :
                          g.categoria === 'salario' ? 'bg-green-100 text-green-700' :
                          g.categoria === 'servicio' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {g.categoria}
                        </span>
                      </td>
                      <td className="p-4 text-right text-red-600 font-bold">{formatoMoneda(g.monto)}</td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setGastoEditando(g); setMostrarModalGasto(true); }} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                          <button onClick={() => { setAccionPendiente({ tipo: 'eliminar-gasto', id: g.id, callback: () => eliminarGasto(g.id) }); setMostrarModalPin(true); }} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MÓDULO REPORTES */}
        {modulo === 'reportes' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {[
                { id: 'ventas-dia', label: 'Ventas del Día', icon: TrendingUp, color: 'purple' },
                { id: 'ventas-mes', label: 'Ventas del Mes', icon: TrendingUp, color: 'purple' },
                { id: 'productos-vendidos', label: 'Productos Más Vendidos', icon: Package, color: 'teal' },
                { id: 'ganancias', label: 'Ganancias', icon: DollarSign, color: 'emerald' },
                { id: 'gastos', label: 'Gastos por Categoría', icon: DollarSign, color: 'red' },
                { id: 'clientes-frecuentes', label: 'Clientes Frecuentes', icon: User, color: 'rose' },
              ].map(r => {
                const colorStyle = coloresModulo[r.color as keyof typeof coloresModulo];
                return (
                  <button
                    key={r.id}
                    onClick={() => cargarReporte(r.id)}
                    className={`p-4 bg-white rounded-xl border border-gray-100 hover:border-${r.color}-200 transition text-left group shadow-sm`}
                  >
                    <div className={`w-12 h-12 rounded-xl ${colorStyle.light} flex items-center justify-center mb-3 group-hover:${colorStyle.solid} transition`}>
                      <r.icon className={`w-6 h-6 ${colorStyle.icon}`} />
                    </div>
                    <p className="text-gray-800 font-medium">{r.label}</p>
                  </button>
                );
              })}
            </div>

            {reporteSeleccionado && datosReporte && (
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Resultado del Reporte</h3>
                <pre className="text-gray-600 text-sm overflow-auto">{JSON.stringify(datosReporte, null, 2)}</pre>
              </div>
            )}
          </div>
        )}

        {/* MÓDULO CONFIG */}
        {modulo === 'config' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Building className="w-5 h-5 text-gray-400" /> Datos de la Empresa
                </h3>
                <form onSubmit={(e) => { e.preventDefault(); guardarConfig(config as Config); }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Nombre</label>
                      <input type="text" value={config?.nombre || ''} onChange={(e) => setConfig({ ...config, nombre: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">NIT/RNC</label>
                      <input type="text" value={config?.nit || ''} onChange={(e) => setConfig({ ...config, nit: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Dirección</label>
                    <input type="text" value={config?.direccion || ''} onChange={(e) => setConfig({ ...config, direccion: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Teléfono</label>
                      <input type="text" value={config?.telefono || ''} onChange={(e) => setConfig({ ...config, telefono: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Email</label>
                      <input type="email" value={config?.email || ''} onChange={(e) => setConfig({ ...config, email: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Moneda</label>
                      <input type="text" value={config?.moneda || ''} onChange={(e) => setConfig({ ...config, moneda: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400" />
                    </div>
                    <div>
                      <label className="block text-gray-600 text-sm mb-1">Símbolo</label>
                      <input type="text" value={config?.simboloMoneda || ''} onChange={(e) => setConfig({ ...config, simboloMoneda: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 text-sm mb-1">Mensaje del Ticket</label>
                    <textarea value={config?.mensajeTicket || ''} onChange={(e) => setConfig({ ...config, mensajeTicket: e.target.value } as Config)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-gray-400 resize-none" rows={3} />
                  </div>
                  <button type="submit" className="w-full py-3 bg-gradient-to-r from-gray-600 to-gray-500 text-white rounded-xl font-medium hover:from-gray-700 hover:to-gray-600 flex items-center justify-center gap-2 transition shadow-md">
                    <Save className="w-5 h-5" /> Guardar Cambios
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* MÓDULO USUARIOS */}
        {modulo === 'usuarios' && (
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <div className="flex justify-end mb-4">
              <button onClick={() => { setUsuarioEditando(null); setMostrarModalUsuario(true); }} className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-400 text-white rounded-xl hover:from-sky-600 hover:to-blue-500 flex items-center gap-2 transition shadow-md">
                <Plus className="w-5 h-5" /> Nuevo Usuario
              </button>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left p-4 text-gray-600 font-medium">Nombre</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Usuario</th>
                    <th className="text-left p-4 text-gray-600 font-medium">Rol</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Estado</th>
                    <th className="text-center p-4 text-gray-600 font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuarios.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-sky-600" />
                          </div>
                          <span className="text-gray-800 font-medium">{u.nombre}</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-600">{u.usuario}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-lg text-xs ${u.rol === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-sky-100 text-sky-700'}`}>
                          {u.rol}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${u.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {u.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => { setUsuarioEditando(u); setMostrarModalUsuario(true); }} className="p-2 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition"><Edit className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* MODAL DE PAGO */}
      {mostrarPago && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Método de Pago</h3>
              <button onClick={() => setMostrarPago(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="text-center mb-6">
                <p className="text-gray-500 text-sm">Total a pagar</p>
                <p className="text-4xl font-bold text-purple-600">{formatoMoneda(total)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                  { id: 'efectivo', icon: Banknote, label: 'Efectivo', color: 'emerald' },
                  { id: 'tarjeta', icon: CreditCard, label: 'Tarjeta', color: 'purple' },
                  { id: 'transferencia', icon: Receipt, label: 'Transfer', color: 'teal' }
                ].map(m => {
                  const colorStyle = coloresModulo[m.color as keyof typeof coloresModulo];
                  return (
                    <button key={m.id} onClick={() => setMetodoPago(m.id)} className={`p-4 rounded-xl border-2 transition-all ${metodoPago === m.id ? `${colorStyle.border} ${colorStyle.light}` : 'border-gray-200 hover:border-gray-300'}`}>
                      <m.icon className={`w-6 h-6 mx-auto mb-2 ${metodoPago === m.id ? colorStyle.icon : 'text-gray-400'}`} />
                      <p className={`text-sm ${metodoPago === m.id ? colorStyle.text : 'text-gray-600'}`}>{m.label}</p>
                    </button>
                  );
                })}
              </div>
              {metodoPago === 'efectivo' && (
                <>
                  <div className="mb-4">
                    <label className="block text-gray-600 text-sm mb-2">Monto recibido</label>
                    <input type="text" inputMode="decimal" value={montoRecibido} onChange={(e) => { if (validarMonto(e.target.value)) setMontoRecibido(e.target.value); }} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-2xl font-bold text-center focus:outline-none focus:border-purple-400" placeholder="0.00" />
                  </div>
                  {parseFloat(montoRecibido) >= total && (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 text-center">
                      <p className="text-gray-500 text-sm">Cambio</p>
                      <p className="text-2xl font-bold text-emerald-600">{formatoMoneda(cambio)}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-4 gap-2 mb-4">
                    {[100, 200, 500, 1000].map(m => (
                      <button key={m} onClick={() => setMontoRecibido(m.toString())} className="py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-800 text-sm font-medium transition">{formatoMoneda(m)}</button>
                    ))}
                  </div>
                </>
              )}
              <button onClick={procesarVenta} disabled={procesando || (metodoPago === 'efectivo' && parseFloat(montoRecibido) < total)} className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 flex items-center justify-center gap-2 transition shadow-lg">
                {procesando ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Procesando...</> : <><Check className="w-5 h-5" /> Completar Venta</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VENTA COMPLETADA */}
      {ventaCompletada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">¡Venta Exitosa!</h3>
              <p className="text-gray-500">{ventaCompletada.numeroFactura}</p>
              <p className="text-3xl font-bold text-emerald-600 mt-4">{formatoMoneda(ventaCompletada.total)}</p>
            </div>
            <div className="p-4 border-t border-gray-100 flex gap-2">
              <button className="flex-1 py-3 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 flex items-center justify-center gap-2 transition"><Printer className="w-5 h-5" /> Ticket</button>
              <button onClick={() => setVentaCompletada(null)} className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition">Nueva Venta</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PRODUCTO MANUAL */}
      {mostrarManual && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Producto Manual</h3>
              <button onClick={() => setMostrarManual(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-gray-600 text-sm mb-1">Nombre</label>
                <input type="text" value={manualNombre} onChange={(e) => setManualNombre(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-purple-400" />
              </div>
              <div>
                <label className="block text-gray-600 text-sm mb-1">Precio</label>
                <input type="text" inputMode="decimal" value={manualPrecio} onChange={(e) => { if (validarMonto(e.target.value)) setManualPrecio(e.target.value); }} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-purple-400" placeholder="0.00" />
              </div>
              <button onClick={agregarManual} className="w-full py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition">Agregar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLIENTES */}
      {mostrarClientes && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Seleccionar Cliente</h3>
              <button onClick={() => setMostrarClientes(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              <button onClick={() => { setClienteSeleccionado(null); setMostrarClientes(false); }} className={`w-full p-3 rounded-xl text-left mb-2 transition ${!clienteSeleccionado ? 'bg-rose-100 border border-rose-300' : 'bg-gray-50 hover:bg-gray-100'}`}>
                <p className="text-gray-800">Cliente General</p>
              </button>
              {clientes.map(c => (
                <button key={c.id} onClick={() => { setClienteSeleccionado(c); setMostrarClientes(false); }} className={`w-full p-3 rounded-xl text-left mb-2 transition ${clienteSeleccionado?.id === c.id ? 'bg-rose-100 border border-rose-300' : 'bg-gray-50 hover:bg-gray-100'}`}>
                  <p className="text-gray-800">{c.nombre} {c.apellido}</p>
                  <p className="text-gray-400 text-sm">{c.documento}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL PIN */}
      {mostrarModalPin && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xs shadow-2xl">
            <div className="p-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 text-center flex items-center justify-center gap-2"><Lock className="w-5 h-5 text-amber-500" /> PIN de Seguridad</h3>
            </div>
            <div className="p-4">
              <input type="password" value={pinInput} onChange={(e) => setPinInput(e.target.value)} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-center text-2xl tracking-widest focus:outline-none focus:border-amber-400" placeholder="****" maxLength={4} autoFocus />
              <div className="flex gap-2 mt-4">
                <button onClick={() => { setMostrarModalPin(false); setPinInput(''); setAccionPendiente(null); }} className="flex-1 py-2 bg-gray-100 text-gray-800 rounded-xl hover:bg-gray-200 transition">Cancelar</button>
                <button onClick={verificarPin} className="flex-1 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DETALLE VENTA */}
      {ventaSeleccionada && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Detalle de Venta</h3>
              <button onClick={() => setVentaSeleccionada(null)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4">
              <div className="flex justify-between mb-4"><span className="text-gray-500">Factura:</span><span className="text-gray-800 font-mono">{ventaSeleccionada.numeroFactura}</span></div>
              <div className="flex justify-between mb-4"><span className="text-gray-500">Fecha:</span><span className="text-gray-800">{new Date(ventaSeleccionada.fecha).toLocaleString('es-DO')}</span></div>
              <div className="flex justify-between mb-4"><span className="text-gray-500">Cliente:</span><span className="text-gray-800">{ventaSeleccionada.cliente?.nombre || 'Cliente General'}</span></div>
              <div className="border-t border-gray-100 pt-4 mt-4">
                <p className="text-gray-500 text-sm mb-2">Productos:</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {ventaSeleccionada.detalles?.map((d, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-gray-800">{d.producto.nombre} x{d.cantidad}</span>
                      <span className="text-gray-600">{formatoMoneda(d.subtotal)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-gray-100 pt-4 mt-4">
                <div className="flex justify-between text-xl font-bold"><span className="text-gray-800">Total:</span><span className="text-purple-600">{formatoMoneda(ventaSeleccionada.total)}</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CLIENTE */}
      {mostrarModalCliente && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{clienteEditando ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
              <button onClick={() => { setMostrarModalCliente(false); setClienteEditando(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target as HTMLFormElement); guardarCliente({ id: clienteEditando?.id, nombre: formData.get('nombre') as string, apellido: formData.get('apellido') as string, documento: formData.get('documento') as string, email: formData.get('email') as string, telefono: formData.get('telefono') as string, direccion: formData.get('direccion') as string }); }} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-600 text-sm mb-1">Nombre *</label><input type="text" name="nombre" defaultValue={clienteEditando?.nombre || ''} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-400" /></div>
                <div><label className="block text-gray-600 text-sm mb-1">Apellido</label><input type="text" name="apellido" defaultValue={clienteEditando?.apellido || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-400" /></div>
              </div>
              <div><label className="block text-gray-600 text-sm mb-1">Documento</label><input type="text" name="documento" defaultValue={clienteEditando?.documento || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-400" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-600 text-sm mb-1">Teléfono</label><input type="text" name="telefono" defaultValue={clienteEditando?.telefono || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-400" /></div>
                <div><label className="block text-gray-600 text-sm mb-1">Email</label><input type="email" name="email" defaultValue={clienteEditando?.email || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-400" /></div>
              </div>
              <div><label className="block text-gray-600 text-sm mb-1">Dirección</label><input type="text" name="direccion" defaultValue={clienteEditando?.direccion || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-rose-400" /></div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-rose-500 to-red-400 text-white rounded-xl font-medium hover:from-rose-600 hover:to-red-500 transition">{clienteEditando ? 'Guardar Cambios' : 'Crear Cliente'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL PROVEEDOR */}
      {mostrarModalProveedor && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{proveedorEditando ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h3>
              <button onClick={() => { setMostrarModalProveedor(false); setProveedorEditando(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target as HTMLFormElement); guardarProveedor({ id: proveedorEditando?.id, nombre: formData.get('nombre') as string, contacto: formData.get('contacto') as string, documento: formData.get('documento') as string, email: formData.get('email') as string, telefono: formData.get('telefono') as string, direccion: formData.get('direccion') as string, notas: formData.get('notas') as string }); }} className="p-4 space-y-4">
              <div><label className="block text-gray-600 text-sm mb-1">Nombre *</label><input type="text" name="nombre" defaultValue={proveedorEditando?.nombre || ''} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-400" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-600 text-sm mb-1">Contacto</label><input type="text" name="contacto" defaultValue={proveedorEditando?.contacto || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-400" /></div>
                <div><label className="block text-gray-600 text-sm mb-1">RNC/Documento</label><input type="text" name="documento" defaultValue={proveedorEditando?.documento || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-400" /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-600 text-sm mb-1">Teléfono</label><input type="text" name="telefono" defaultValue={proveedorEditando?.telefono || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-400" /></div>
                <div><label className="block text-gray-600 text-sm mb-1">Email</label><input type="email" name="email" defaultValue={proveedorEditando?.email || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-400" /></div>
              </div>
              <div><label className="block text-gray-600 text-sm mb-1">Dirección</label><input type="text" name="direccion" defaultValue={proveedorEditando?.direccion || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-amber-400" /></div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-amber-500 to-orange-400 text-white rounded-xl font-medium hover:from-amber-600 hover:to-orange-500 transition">{proveedorEditando ? 'Guardar Cambios' : 'Crear Proveedor'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL GASTO */}
      {mostrarModalGasto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{gastoEditando ? 'Editar Gasto' : 'Nuevo Gasto'}</h3>
              <button onClick={() => { setMostrarModalGasto(false); setGastoEditando(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target as HTMLFormElement); guardarGasto({ concepto: formData.get('concepto') as string, monto: parseFloat(formData.get('monto') as string), categoria: formData.get('categoria') as string, notas: formData.get('notas') as string }); }} className="p-4 space-y-4">
              <div><label className="block text-gray-600 text-sm mb-1">Concepto *</label><input type="text" name="concepto" defaultValue={gastoEditando?.concepto || ''} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-600 text-sm mb-1">Monto *</label><input type="number" name="monto" defaultValue={gastoEditando?.monto || ''} required step="0.01" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400" /></div>
                <div><label className="block text-gray-600 text-sm mb-1">Categoría</label><select name="categoria" defaultValue={gastoEditando?.categoria || 'operativo'} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400">
                  <option value="operativo">Operativo</option><option value="salario">Salario</option><option value="servicio">Servicio</option><option value="inventario">Inventario</option><option value="otros">Otros</option>
                </select></div>
              </div>
              <div><label className="block text-gray-600 text-sm mb-1">Notas</label><textarea name="notas" defaultValue={gastoEditando?.notas || ''} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-red-400 resize-none" rows={3} /></div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-red-500 to-rose-400 text-white rounded-xl font-medium hover:from-red-600 hover:to-rose-500 transition">{gastoEditando ? 'Guardar Cambios' : 'Crear Gasto'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL COMPRA */}
      {mostrarModalCompra && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Nueva Compra</h3>
              <button onClick={() => { setMostrarModalCompra(false); setItemsCompra([]); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="mb-4">
                <label className="block text-gray-600 text-sm mb-1">Proveedor</label>
                <select value={proveedorCompra} onChange={(e) => setProveedorCompra(e.target.value)} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-emerald-400">
                  <option value="">Sin proveedor</option>
                  {proveedores.map(p => (<option key={p.id} value={p.id}>{p.nombre}</option>))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-600 text-sm mb-1">Buscar Producto</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input type="text" value={busquedaProductoCompra} onChange={(e) => setBusquedaProductoCompra(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-emerald-400" placeholder="Buscar..." />
                </div>
                {busquedaProductoCompra && (
                  <div className="mt-2 bg-gray-50 rounded-xl border border-gray-200 max-h-32 overflow-y-auto">
                    {productos.filter(p => p.nombre.toLowerCase().includes(busquedaProductoCompra.toLowerCase())).slice(0, 5).map(p => (
                      <button key={p.id} onClick={() => { if (!itemsCompra.find(i => i.productoId === p.id)) { setItemsCompra([...itemsCompra, { productoId: p.id, producto: p, cantidad: 1, costoUnitario: p.costo }]); } setBusquedaProductoCompra(''); }} className="w-full p-2 text-left hover:bg-gray-100 text-gray-800 text-sm">{p.nombre} - {formatoMoneda(p.costo)}</button>
                    ))}
                  </div>
                )}
              </div>
              {itemsCompra.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-gray-500 text-sm">Productos:</p>
                  {itemsCompra.map((item, i) => (
                    <div key={item.productoId} className="flex items-center gap-2 bg-gray-50 p-3 rounded-xl">
                      <span className="flex-1 text-gray-800 text-sm">{item.producto?.nombre}</span>
                      <input type="number" value={item.cantidad} onChange={(e) => { const newItems = [...itemsCompra]; newItems[i].cantidad = parseInt(e.target.value) || 1; setItemsCompra(newItems); }} className="w-20 px-2 py-1 bg-white border border-gray-200 rounded text-gray-800 text-sm text-center" />
                      <input type="number" value={item.costoUnitario} onChange={(e) => { const newItems = [...itemsCompra]; newItems[i].costoUnitario = parseFloat(e.target.value) || 0; setItemsCompra(newItems); }} className="w-24 px-2 py-1 bg-white border border-gray-200 rounded text-gray-800 text-sm text-center" step="0.01" />
                      <button onClick={() => setItemsCompra(itemsCompra.filter((_, idx) => idx !== i))} className="p-1 text-red-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              )}
              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between text-lg font-bold"><span className="text-gray-800">Total:</span><span className="text-emerald-600">{formatoMoneda(itemsCompra.reduce((acc, i) => acc + i.cantidad * i.costoUnitario, 0))}</span></div>
              </div>
            </div>
            <div className="p-4 border-t border-gray-100">
              <button onClick={guardarCompra} className="w-full py-3 bg-gradient-to-r from-emerald-500 to-green-400 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-green-500 transition">Registrar Compra</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL USUARIO */}
      {mostrarModalUsuario && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">{usuarioEditando ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
              <button onClick={() => { setMostrarModalUsuario(false); setUsuarioEditando(null); }} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); const formData = new FormData(e.target as HTMLFormElement); guardarUsuario({ id: usuarioEditando?.id, nombre: formData.get('nombre') as string, usuario: formData.get('usuario') as string, password: formData.get('password') as string, rol: formData.get('rol') as string, activo: true }); }} className="p-4 space-y-4">
              <div><label className="block text-gray-600 text-sm mb-1">Nombre *</label><input type="text" name="nombre" defaultValue={usuarioEditando?.nombre || ''} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-sky-400" /></div>
              <div><label className="block text-gray-600 text-sm mb-1">Usuario *</label><input type="text" name="usuario" defaultValue={usuarioEditando?.usuario || ''} required className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-sky-400" /></div>
              <div><label className="block text-gray-600 text-sm mb-1">Contraseña {!usuarioEditando && '*'}</label><input type="password" name="password" placeholder={usuarioEditando ? 'Dejar vacío para mantener' : ''} required={!usuarioEditando} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-sky-400" /></div>
              <div><label className="block text-gray-600 text-sm mb-1">Rol</label><select name="rol" defaultValue={usuarioEditando?.rol || 'vendedor'} className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:border-sky-400">
                <option value="admin">Administrador</option><option value="vendedor">Vendedor</option>
              </select></div>
              <button type="submit" className="w-full py-3 bg-gradient-to-r from-sky-500 to-blue-400 text-white rounded-xl font-medium hover:from-sky-600 hover:to-blue-500 transition">{usuarioEditando ? 'Guardar Cambios' : 'Crear Usuario'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
