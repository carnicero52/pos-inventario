'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Search, Download, Upload, Image, AlertTriangle } from 'lucide-react';

interface Producto {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  imagen?: string;
  costo: number;
  precio: number;
  stock: number;
  stockMinimo: number;
  categoriaId?: string;
  categoria?: { nombre: string };
  proveedorId?: string;
  proveedor?: { nombre: string };
}

interface Categoria {
  id: string;
  nombre: string;
}

export default function InventarioModule() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    descripcion: '',
    costo: '',
    precio: '',
    stock: '',
    stockMinimo: '5',
    categoriaId: ''
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch('/api/productos'),
        fetch('/api/categorias')
      ]);
      const prodData = await prodRes.json();
      const catData = await catRes.json();
      setProductos(prodData);
      setCategorias(catData);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const productosFiltrados = productos.filter(p => {
    const matchBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          p.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchCategoria = !filtroCategoria || p.categoriaId === filtroCategoria;
    return matchBusqueda && matchCategoria;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/productos';
      const method = editingProducto ? 'PUT' : 'POST';
      const body = editingProducto 
        ? { ...form, id: editingProducto.id }
        : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setEditingProducto(null);
        resetForm();
        cargarDatos();
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert('Error al guardar');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const res = await fetch(`/api/productos?id=${deleteId}&pin=${pin}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowPinModal(false);
        setDeleteId(null);
        setPin('');
        cargarDatos();
      } else {
        setPinError(data.error);
      }
    } catch (error) {
      setPinError('Error al eliminar');
    }
  };

  const resetForm = () => {
    setForm({
      codigo: '',
      nombre: '',
      descripcion: '',
      costo: '',
      precio: '',
      stock: '0',
      stockMinimo: '5',
      categoriaId: ''
    });
  };

  const openEdit = (p: Producto) => {
    setEditingProducto(p);
    setForm({
      codigo: p.codigo,
      nombre: p.nombre,
      descripcion: p.descripcion || '',
      costo: p.costo.toString(),
      precio: p.precio.toString(),
      stock: p.stock.toString(),
      stockMinimo: p.stockMinimo.toString(),
      categoriaId: p.categoriaId || ''
    });
    setShowModal(true);
  };

  const formatPrecio = (valor: number) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ'
    }).format(valor);
  };

  if (loading) {
    return <div className="text-center py-10">Cargando inventario...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Inventario</h2>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
            <Download className="w-4 h-4" />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
            <Upload className="w-4 h-4" />
            Importar
          </button>
          <button
            onClick={() => { resetForm(); setEditingProducto(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <Plus className="w-5 h-5" />
            Nuevo
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Buscar por nombre o código..."
          />
        </div>
        <select
          value={filtroCategoria}
          onChange={(e) => setFiltroCategoria(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        >
          <option value="">Todas las categorías</option>
          {categorias.map(c => (
            <option key={c.id} value={c.id}>{c.nombre}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left p-4 font-medium text-slate-600">Producto</th>
                <th className="text-left p-4 font-medium text-slate-600">Código</th>
                <th className="text-right p-4 font-medium text-slate-600">Costo</th>
                <th className="text-right p-4 font-medium text-slate-600">Precio</th>
                <th className="text-center p-4 font-medium text-slate-600">Stock</th>
                <th className="text-left p-4 font-medium text-slate-600">Categoría</th>
                <th className="text-right p-4 font-medium text-slate-600">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {productosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    No hay productos
                  </td>
                </tr>
              ) : productosFiltrados.map(p => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-slate-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {p.imagen ? (
                          <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                        ) : (
                          <Image className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{p.nombre}</p>
                        {p.descripcion && (
                          <p className="text-sm text-slate-500 truncate max-w-xs">{p.descripcion}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-sm">{p.codigo}</td>
                  <td className="p-4 text-right">{formatPrecio(p.costo)}</td>
                  <td className="p-4 text-right font-medium">{formatPrecio(p.precio)}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded font-medium ${
                      p.stock <= 0 ? 'bg-red-100 text-red-700' :
                      p.stock <= p.stockMinimo ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {p.stock}
                    </span>
                    {p.stock <= p.stockMinimo && (
                      <AlertTriangle className="w-4 h-4 text-yellow-500 inline ml-1" />
                    )}
                  </td>
                  <td className="p-4">{p.categoria?.nombre || '-'}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(p)}
                        className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setDeleteId(p.id); setShowPinModal(true); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Producto */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingProducto ? 'Editar Producto' : 'Nuevo Producto'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Código</label>
                  <input
                    type="text"
                    value={form.codigo}
                    onChange={(e) => setForm({ ...form, codigo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="AUTO-GENERADO"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Categoría</label>
                  <select
                    value={form.categoriaId}
                    onChange={(e) => setForm({ ...form, categoriaId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="">Sin categoría</option>
                    {categorias.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nombre *</label>
                <input
                  type="text"
                  value={form.nombre}
                  onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descripción</label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Costo *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.costo}
                    onChange={(e) => setForm({ ...form, costo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Precio *</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Stock</label>
                  <input
                    type="number"
                    value={form.stock}
                    onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    value={form.stockMinimo}
                    onChange={(e) => setForm({ ...form, stockMinimo: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingProducto ? 'Actualizar' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de PIN */}
      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold mb-4">PIN de Seguridad</h3>
            <p className="text-slate-600 mb-4">Ingresa el PIN para eliminar este producto.</p>
            <input
              type="password"
              value={pin}
              onChange={(e) => { setPin(e.target.value); setPinError(''); }}
              className="w-full px-4 py-2 border rounded-lg mb-2 text-center text-2xl tracking-widest"
              placeholder="****"
              maxLength={4}
            />
            {pinError && <p className="text-red-500 text-sm mb-2">{pinError}</p>}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setShowPinModal(false); setPin(''); setDeleteId(null); }}
                className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
