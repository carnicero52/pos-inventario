'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, Edit, Trash2, X, Shield, Check } from 'lucide-react';

interface Usuario {
  id: string;
  username: string;
  nombre: string;
  rol: string;
  activo: boolean;
  permVentas: boolean;
  permInventario: boolean;
  permClientes: boolean;
  permProveedores: boolean;
  permCompras: boolean;
  permReportes: boolean;
  permGastos: boolean;
  permConfig: boolean;
  permUsuarios: boolean;
}

export default function UsuariosModule() {
  const { usuario, validarPin } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState<Usuario | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');

  const [form, setForm] = useState({
    username: '',
    password: '',
    nombre: '',
    rol: 'VENDEDOR',
    permVentas: true,
    permInventario: false,
    permClientes: false,
    permProveedores: false,
    permCompras: false,
    permReportes: false,
    permGastos: false,
    permConfig: false,
    permUsuarios: false,
  });

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const res = await fetch('/api/usuarios');
      const data = await res.json();
      setUsuarios(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = '/api/usuarios';
      const method = editingUsuario ? 'PUT' : 'POST';
      const body = editingUsuario 
        ? { ...form, id: editingUsuario.id }
        : form;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (data.success) {
        setShowModal(false);
        setEditingUsuario(null);
        resetForm();
        cargarUsuarios();
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
      const res = await fetch(`/api/usuarios?id=${deleteId}&pin=${pin}`, {
        method: 'DELETE'
      });
      
      const data = await res.json();
      
      if (data.success) {
        setShowPinModal(false);
        setDeleteId(null);
        setPin('');
        cargarUsuarios();
      } else {
        setPinError(data.error);
      }
    } catch (error) {
      setPinError('Error al eliminar');
    }
  };

  const resetForm = () => {
    setForm({
      username: '',
      password: '',
      nombre: '',
      rol: 'VENDEDOR',
      permVentas: true,
      permInventario: false,
      permClientes: false,
      permProveedores: false,
      permCompras: false,
      permReportes: false,
      permGastos: false,
      permConfig: false,
      permUsuarios: false,
    });
  };

  const openEdit = (u: Usuario) => {
    setEditingUsuario(u);
    setForm({
      username: u.username,
      password: '',
      nombre: u.nombre,
      rol: u.rol,
      permVentas: u.permVentas,
      permInventario: u.permInventario,
      permClientes: u.permClientes,
      permProveedores: u.permProveedores,
      permCompras: u.permCompras,
      permReportes: u.permReportes,
      permGastos: u.permGastos,
      permConfig: u.permConfig,
      permUsuarios: u.permUsuarios,
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Gestión de Usuarios</h2>
        <button
          onClick={() => { resetForm(); setEditingUsuario(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          <UserPlus className="w-5 h-5" />
          Nuevo Usuario
        </button>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4 font-medium text-slate-600">Usuario</th>
              <th className="text-left p-4 font-medium text-slate-600">Nombre</th>
              <th className="text-left p-4 font-medium text-slate-600">Rol</th>
              <th className="text-left p-4 font-medium text-slate-600">Estado</th>
              <th className="text-right p-4 font-medium text-slate-600">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {usuarios.map(u => (
              <tr key={u.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{u.username}</td>
                <td className="p-4">{u.nombre}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.rol === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                    u.rol === 'SUPERVISOR' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {u.rol}
                  </span>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    u.activo ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {u.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openEdit(u)}
                      className="p-2 text-blue-500 hover:bg-blue-50 rounded"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {u.username !== 'admin' && (
                      <button
                        onClick={() => { setDeleteId(u.id); setShowPinModal(true); }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de Usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold">
                {editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Usuario</label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Contraseña {editingUsuario && '(dejar vacío para no cambiar)'}
                  </label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required={!editingUsuario}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nombre completo</label>
                  <input
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Rol</label>
                  <select
                    value={form.rol}
                    onChange={(e) => setForm({ ...form, rol: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="VENDEDOR">Vendedor</option>
                    <option value="SUPERVISOR">Supervisor</option>
                    <option value="ADMIN">Administrador</option>
                  </select>
                </div>
              </div>

              {/* Permisos */}
              <div>
                <label className="block text-sm font-medium mb-2">Permisos de módulos</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'permVentas', label: 'Ventas' },
                    { key: 'permInventario', label: 'Inventario' },
                    { key: 'permClientes', label: 'Clientes' },
                    { key: 'permProveedores', label: 'Proveedores' },
                    { key: 'permCompras', label: 'Compras' },
                    { key: 'permReportes', label: 'Reportes' },
                    { key: 'permGastos', label: 'Gastos' },
                    { key: 'permConfig', label: 'Configuración' },
                    { key: 'permUsuarios', label: 'Usuarios' },
                  ].map(perm => (
                    <label key={perm.key} className="flex items-center gap-2 p-2 bg-slate-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form[perm.key as keyof typeof form] as boolean}
                        onChange={(e) => setForm({ ...form, [perm.key]: e.target.checked })}
                        className="rounded"
                      />
                      <span className="text-sm">{perm.label}</span>
                    </label>
                  ))}
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
                  {editingUsuario ? 'Actualizar' : 'Crear'}
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
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-red-500" />
              <h3 className="text-lg font-semibold">PIN de Seguridad</h3>
            </div>
            <p className="text-slate-600 mb-4">Ingresa el PIN de seguridad para eliminar este registro.</p>
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
