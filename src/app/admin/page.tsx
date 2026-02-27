'use client';

import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Settings, 
  Plus, Edit, Trash2, Search, X, Save, BarChart3, TrendingUp,
  DollarSign, AlertTriangle, Clock, Tag, Truck
} from 'lucide-react';

interface Producto {
  id: string;
  codigo: string;
  codigoBarras: string | null;
  nombre: string;
  descripcion: string | null;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  categoriaId: string | null;
  categoria?: { nombre: string } | null;
  activo: boolean;
}

interface Categoria {
  id: string;
  nombre: string;
  color: string | null;
  _count?: { productos: number };
}

interface Venta {
  id: string;
  numeroVenta: string;
  total: number;
  metodoPago: string;
  fecha: string;
  estado: string;
  cliente?: { nombre: string } | null;
  detalles?: { producto: { nombre: string }; cantidad: number }[];
}

interface Cliente {
  id: string;
  nombre: string;
  apellido: string | null;
  documento: string | null;
  telefono: string | null;
  email: string | null;
  puntos: number;
}

interface Config {
  nombreNegocio: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  ruc: string | null;
  moneda: string;
  simboloMoneda: string;
  mensajeTicket: string | null;
}

type Tab = 'dashboard' | 'productos' | 'categorias' | 'clientes' | 'ventas' | 'config';

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [loading, setLoading] = useState(true);
  
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [config, setConfig] = useState<Config | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'producto' | 'categoria' | 'cliente'>('producto');
  const [editItem, setEditItem] = useState<any>(null);
  
  const [productoForm, setProductoForm] = useState({
    codigo: '', codigoBarras: '', nombre: '', descripcion: '',
    categoriaId: '', precioCompra: '', precioVenta: '', stock: '', stockMinimo: '5'
  });
  const [categoriaForm, setCategoriaForm] = useState({ nombre: '', color: '#3b82f6' });
  const [clienteForm, setClienteForm] = useState({
    nombre: '', apellido: '', documento: '', telefono: '', email: ''
  });
  const [configForm, setConfigForm] = useState<Config>({
    nombreNegocio: '', direccion: '', telefono: '', email: '', ruc: '',
    moneda: 'USD', simboloMoneda: '$', mensajeTicket: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodRes, catRes, cliRes, ventRes, configRes] = await Promise.all([
        fetch('/api/pos/productos'),
        fetch('/api/pos/categorias'),
        fetch('/api/pos/clientes'),
        fetch('/api/pos/ventas?limite=20'),
        fetch('/api/pos/config')
      ]);
      
      setProductos(await prodRes.json());
      setCategorias(await catRes.json());
      setClientes(await cliRes.json());
      setVentas(await ventRes.json());
      const configData = await configRes.json();
      setConfig(configData);
      setConfigForm(configData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const totalProductos = productos.length;
  const stockBajo = productos.filter(p => p.stock <= p.stockMinimo).length;
  const ventasHoy = ventas.filter(v => new Date(v.fecha).toDateString() === new Date().toDateString());
  const totalVentasHoy = ventasHoy.reduce((acc, v) => acc + v.total, 0);
  const totalClientes = clientes.length;

  const formatoMoneda = (valor: number) => `${config?.simboloMoneda || '$'}${valor.toFixed(2)}`;

  const guardarProducto = async () => {
    try {
      const url = '/api/pos/productos';
      const method = editItem ? 'PUT' : 'POST';
      const body = editItem ? { ...productoForm, id: editItem.id } : productoForm;
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setShowModal(false); setEditItem(null);
      setProductoForm({ codigo: '', codigoBarras: '', nombre: '', descripcion: '', categoriaId: '', precioCompra: '', precioVenta: '', stock: '', stockMinimo: '5' });
      cargarDatos();
    } catch (error) { console.error('Error:', error); }
  };

  const eliminarProducto = async (id: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await fetch(`/api/pos/productos?id=${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const guardarCategoria = async () => {
    try {
      const url = '/api/pos/categorias';
      const method = editItem ? 'PUT' : 'POST';
      const body = editItem ? { ...categoriaForm, id: editItem.id } : categoriaForm;
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setShowModal(false); setEditItem(null);
      setCategoriaForm({ nombre: '', color: '#3b82f6' });
      cargarDatos();
    } catch (error) { console.error('Error:', error); }
  };

  const eliminarCategoria = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;
    await fetch(`/api/pos/categorias?id=${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const guardarCliente = async () => {
    try {
      const url = '/api/pos/clientes';
      const method = editItem ? 'PUT' : 'POST';
      const body = editItem ? { ...clienteForm, id: editItem.id } : clienteForm;
      await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      setShowModal(false); setEditItem(null);
      setClienteForm({ nombre: '', apellido: '', documento: '', telefono: '', email: '' });
      cargarDatos();
    } catch (error) { console.error('Error:', error); }
  };

  const eliminarCliente = async (id: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    await fetch(`/api/pos/clientes?id=${id}`, { method: 'DELETE' });
    cargarDatos();
  };

  const guardarConfig = async () => {
    await fetch('/api/pos/config', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(configForm) });
    cargarDatos();
    alert('Configuración guardada');
  };

  const productosFiltrados = productos.filter(p => p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || p.codigo.toLowerCase().includes(searchTerm.toLowerCase()));

  if (loading) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center"><div className="text-center"><div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-500 border-t-transparent mx-auto mb-4"></div><p>Cargando...</p></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center"><BarChart3 className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-lg font-bold text-slate-800">{config?.nombreNegocio || 'Panel Admin'}</h1><p className="text-xs text-slate-500">Sistema de Inventario POS</p></div>
          </div>
          <a href="/" className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-medium">Ir al POS</a>
        </div>
      </header>

      <nav className="bg-white border-b border-slate-200">
        <div className="px-4 flex gap-1 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'productos', label: 'Productos', icon: Package },
            { id: 'categorias', label: 'Categorías', icon: Tag },
            { id: 'clientes', label: 'Clientes', icon: Users },
            { id: 'ventas', label: 'Ventas', icon: ShoppingCart },
            { id: 'config', label: 'Config', icon: Settings },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as Tab)} className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${activeTab === tab.id ? 'text-emerald-600 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-700'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
          ))}
        </div>
      </nav>

      <main className="p-4 max-w-7xl mx-auto">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center"><Package className="w-5 h-5 text-blue-600" /></div><div><p className="text-2xl font-bold text-slate-800">{totalProductos}</p><p className="text-xs text-slate-500">Productos</p></div></div></div>
              <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-amber-600" /></div><div><p className="text-2xl font-bold text-slate-800">{stockBajo}</p><p className="text-xs text-slate-500">Stock Bajo</p></div></div></div>
              <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center"><DollarSign className="w-5 h-5 text-emerald-600" /></div><div><p className="text-2xl font-bold text-slate-800">{formatoMoneda(totalVentasHoy)}</p><p className="text-xs text-slate-500">Ventas Hoy</p></div></div></div>
              <div className="bg-white rounded-xl p-4 border border-slate-200"><div className="flex items-center gap-3"><div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-purple-600" /></div><div><p className="text-2xl font-bold text-slate-800">{totalClientes}</p><p className="text-xs text-slate-500">Clientes</p></div></div></div>
            </div>
            {stockBajo > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <div className="p-4 border-b border-slate-200 bg-amber-50"><h2 className="font-semibold text-amber-800 flex items-center gap-2"><AlertTriangle className="w-5 h-5" />Productos con Stock Bajo</h2></div>
                <div className="divide-y divide-slate-100">
                  {productos.filter(p => p.stock <= p.stockMinimo).slice(0, 5).map(p => (
                    <div key={p.id} className="p-4 flex items-center justify-between"><div><p className="font-medium text-slate-800">{p.nombre}</p><p className="text-sm text-slate-500">{p.codigo}</p></div><span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">{p.stock} unidades</span></div>
                  ))}
                </div>
              </div>
            )}
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200"><h2 className="font-semibold text-slate-800">Últimas Ventas</h2></div>
              <div className="divide-y divide-slate-100">
                {ventas.slice(0, 5).map(v => (
                  <div key={v.id} className="p-4 flex items-center justify-between"><div><p className="font-medium text-slate-800">{v.numeroVenta}</p><p className="text-sm text-slate-500">{new Date(v.fecha).toLocaleString('es-ES')}</p></div><p className="font-bold text-emerald-600">{formatoMoneda(v.total)}</p></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Productos */}
        {activeTab === 'productos' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" /><input type="text" placeholder="Buscar productos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
              <button onClick={() => { setModalType('producto'); setEditItem(null); setProductoForm({ codigo: '', codigoBarras: '', nombre: '', descripcion: '', categoriaId: '', precioCompra: '', precioVenta: '', stock: '', stockMinimo: '5' }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium"><Plus className="w-5 h-5" />Nuevo Producto</button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="text-left p-4 font-medium text-slate-600">Producto</th><th className="text-left p-4 font-medium text-slate-600">Código</th><th className="text-right p-4 font-medium text-slate-600">Precio</th><th className="text-center p-4 font-medium text-slate-600">Stock</th><th className="text-right p-4 font-medium text-slate-600">Acciones</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {productosFiltrados.map(p => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="p-4"><p className="font-medium text-slate-800">{p.nombre}</p><p className="text-sm text-slate-500">{p.categoria?.nombre || 'Sin categoría'}</p></td>
                        <td className="p-4 text-slate-600">{p.codigo}</td>
                        <td className="p-4 text-right font-medium text-slate-800">{formatoMoneda(p.precioVenta)}</td>
                        <td className="p-4 text-center"><span className={`px-2 py-1 rounded-full text-sm font-medium ${p.stock <= p.stockMinimo ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{p.stock}</span></td>
                        <td className="p-4"><div className="flex items-center justify-end gap-2"><button onClick={() => { setModalType('producto'); setEditItem(p); setProductoForm({ codigo: p.codigo, codigoBarras: p.codigoBarras || '', nombre: p.nombre, descripcion: p.descripcion || '', categoriaId: p.categoriaId || '', precioCompra: p.precioCompra.toString(), precioVenta: p.precioVenta.toString(), stock: p.stock.toString(), stockMinimo: p.stockMinimo.toString() }); setShowModal(true); }} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit className="w-4 h-4" /></button><button onClick={() => eliminarProducto(p.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Categorías */}
        {activeTab === 'categorias' && (
          <div className="space-y-4">
            <div className="flex justify-end"><button onClick={() => { setModalType('categoria'); setEditItem(null); setCategoriaForm({ nombre: '', color: '#3b82f6' }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium"><Plus className="w-5 h-5" />Nueva Categoría</button></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {categorias.map(cat => (
                <div key={cat.id} className="bg-white rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-lg" style={{ backgroundColor: cat.color || '#3b82f6' }} /><div><p className="font-medium text-slate-800">{cat.nombre}</p><p className="text-sm text-slate-500">{cat._count?.productos || 0} productos</p></div></div>
                    <div className="flex gap-1"><button onClick={() => { setModalType('categoria'); setEditItem(cat); setCategoriaForm({ nombre: cat.nombre, color: cat.color || '#3b82f6' }); setShowModal(true); }} className="p-2 text-slate-500 hover:text-amber-600 rounded-lg transition"><Edit className="w-4 h-4" /></button><button onClick={() => eliminarCategoria(cat.id)} className="p-2 text-slate-500 hover:text-red-600 rounded-lg transition"><Trash2 className="w-4 h-4" /></button></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clientes */}
        {activeTab === 'clientes' && (
          <div className="space-y-4">
            <div className="flex justify-end"><button onClick={() => { setModalType('cliente'); setEditItem(null); setClienteForm({ nombre: '', apellido: '', documento: '', telefono: '', email: '' }); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium"><Plus className="w-5 h-5" />Nuevo Cliente</button></div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="text-left p-4 font-medium text-slate-600">Nombre</th><th className="text-left p-4 font-medium text-slate-600">Documento</th><th className="text-left p-4 font-medium text-slate-600">Teléfono</th><th className="text-left p-4 font-medium text-slate-600">Email</th><th className="text-right p-4 font-medium text-slate-600">Acciones</th></tr></thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientes.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50">
                        <td className="p-4 font-medium text-slate-800">{c.nombre} {c.apellido}</td>
                        <td className="p-4 text-slate-600">{c.documento || '-'}</td>
                        <td className="p-4 text-slate-600">{c.telefono || '-'}</td>
                        <td className="p-4 text-slate-600">{c.email || '-'}</td>
                        <td className="p-4"><div className="flex items-center justify-end gap-2"><button onClick={() => { setModalType('cliente'); setEditItem(c); setClienteForm({ nombre: c.nombre, apellido: c.apellido || '', documento: c.documento || '', telefono: c.telefono || '', email: c.email || '' }); setShowModal(true); }} className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"><Edit className="w-4 h-4" /></button><button onClick={() => eliminarCliente(c.id)} className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 className="w-4 h-4" /></button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Ventas */}
        {activeTab === 'ventas' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200"><tr><th className="text-left p-4 font-medium text-slate-600">Venta</th><th className="text-left p-4 font-medium text-slate-600">Fecha</th><th className="text-left p-4 font-medium text-slate-600">Método</th><th className="text-right p-4 font-medium text-slate-600">Total</th><th className="text-center p-4 font-medium text-slate-600">Estado</th></tr></thead>
                <tbody className="divide-y divide-slate-100">
                  {ventas.map(v => (
                    <tr key={v.id} className="hover:bg-slate-50">
                      <td className="p-4"><p className="font-medium text-slate-800">{v.numeroVenta}</p><p className="text-sm text-slate-500">{v.cliente?.nombre || 'Cliente general'}</p></td>
                      <td className="p-4 text-slate-600">{new Date(v.fecha).toLocaleString('es-ES')}</td>
                      <td className="p-4 text-slate-600 capitalize">{v.metodoPago}</td>
                      <td className="p-4 text-right font-bold text-emerald-600">{formatoMoneda(v.total)}</td>
                      <td className="p-4 text-center"><span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">{v.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Configuración */}
        {activeTab === 'config' && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="p-4 border-b border-slate-200 bg-slate-50"><h2 className="font-semibold text-slate-800">Configuración del Negocio</h2></div>
              <div className="p-4 space-y-4">
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Negocio</label><input type="text" value={configForm.nombreNegocio} onChange={(e) => setConfigForm({ ...configForm, nombreNegocio: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Moneda</label><input type="text" value={configForm.moneda} onChange={(e) => setConfigForm({ ...configForm, moneda: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Símbolo</label><input type="text" value={configForm.simboloMoneda} onChange={(e) => setConfigForm({ ...configForm, simboloMoneda: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label><input type="text" value={configForm.direccion || ''} onChange={(e) => setConfigForm({ ...configForm, direccion: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label><input type="text" value={configForm.telefono || ''} onChange={(e) => setConfigForm({ ...configForm, telefono: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={configForm.email || ''} onChange={(e) => setConfigForm({ ...configForm, email: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                </div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">RUC / NIT</label><input type="text" value={configForm.ruc || ''} onChange={(e) => setConfigForm({ ...configForm, ruc: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                <div><label className="block text-sm font-medium text-slate-700 mb-1">Mensaje en Ticket</label><textarea value={configForm.mensajeTicket || ''} onChange={(e) => setConfigForm({ ...configForm, mensajeTicket: e.target.value })} className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" rows={2} /></div>
                <button onClick={guardarConfig} className="w-full py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium flex items-center justify-center gap-2"><Save className="w-5 h-5" />Guardar Configuración</button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between"><h3 className="text-lg font-semibold text-slate-800">{editItem ? 'Editar' : 'Nuevo'} {modalType}</h3><button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button></div>
            <div className="p-4 space-y-4">
              {modalType === 'producto' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Código *</label><input type="text" value={productoForm.codigo} onChange={(e) => setProductoForm({ ...productoForm, codigo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Cód. Barras</label><input type="text" value={productoForm.codigoBarras} onChange={(e) => setProductoForm({ ...productoForm, codigoBarras: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label><input type="text" value={productoForm.nombre} onChange={(e) => setProductoForm({ ...productoForm, nombre: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Categoría</label><select value={productoForm.categoriaId} onChange={(e) => setProductoForm({ ...productoForm, categoriaId: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"><option value="">Sin categoría</option>{categorias.map(c => (<option key={c.id} value={c.id}>{c.nombre}</option>))}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Precio Compra</label><input type="number" step="0.01" value={productoForm.precioCompra} onChange={(e) => setProductoForm({ ...productoForm, precioCompra: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Precio Venta *</label><input type="number" step="0.01" value={productoForm.precioVenta} onChange={(e) => setProductoForm({ ...productoForm, precioVenta: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Stock</label><input type="number" value={productoForm.stock} onChange={(e) => setProductoForm({ ...productoForm, stock: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Stock Mínimo</label><input type="number" value={productoForm.stockMinimo} onChange={(e) => setProductoForm({ ...productoForm, stockMinimo: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  </div>
                </>
              )}
              {modalType === 'categoria' && (
                <>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label><input type="text" value={categoriaForm.nombre} onChange={(e) => setCategoriaForm({ ...categoriaForm, nombre: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Color</label><input type="color" value={categoriaForm.color} onChange={(e) => setCategoriaForm({ ...categoriaForm, color: e.target.value })} className="w-full h-10 rounded-lg cursor-pointer" /></div>
                </>
              )}
              {modalType === 'cliente' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Nombre *</label><input type="text" value={clienteForm.nombre} onChange={(e) => setClienteForm({ ...clienteForm, nombre: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label><input type="text" value={clienteForm.apellido} onChange={(e) => setClienteForm({ ...clienteForm, apellido: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Documento</label><input type="text" value={clienteForm.documento} onChange={(e) => setClienteForm({ ...clienteForm, documento: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label><input type="text" value={clienteForm.telefono} onChange={(e) => setClienteForm({ ...clienteForm, telefono: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" value={clienteForm.email} onChange={(e) => setClienteForm({ ...clienteForm, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" /></div>
                </>
              )}
            </div>
            <div className="p-4 border-t border-slate-200 flex gap-3 justify-end">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancelar</button>
              <button onClick={() => { if (modalType === 'producto') guardarProducto(); else if (modalType === 'categoria') guardarCategoria(); else if (modalType === 'cliente') guardarCliente(); }} className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium">{editItem ? 'Actualizar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
