'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, User } from 'lucide-react';

interface Cliente {
  id: string;
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
}

export default function ClientesModule() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editing, setEditing] = useState<Cliente | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [busqueda, setBusqueda] = useState('');

  const [form, setForm] = useState({ nombre: '', nit: '', direccion: '', telefono: '', email: '' });

  useEffect(() => { cargarClientes(); }, []);

  const cargarClientes = async () => {
    try {
      const res = await fetch('/api/clientes');
      setClientes(await res.json());
    } finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = '/api/clientes';
    const method = editing ? 'PUT' : 'POST';
    const body = editing ? { ...form, id: editing.id } : form;

    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    if (data.success) { setShowModal(false); setEditing(null); setForm({ nombre: '', nit: '', direccion: '', telefono: '', email: '' }); cargarClientes(); }
    else alert(data.error);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/clientes?id=${deleteId}&pin=${pin}`, { method: 'DELETE' });
    const data = await res.json();
    if (data.success) { setShowPinModal(false); setDeleteId(null); setPin(''); cargarClientes(); }
    else alert(data.error);
  };

  const clientesFiltrados = clientes.filter(c => c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.nit?.includes(busqueda));

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clientes</h2>
        <button onClick={() => { setForm({ nombre: '', nit: '', direccion: '', telefono: '', email: '' }); setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-5 h-5" /> Nuevo
        </button>
      </div>

      <input type="text" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} className="w-full px-4 py-2 border rounded-lg" placeholder="Buscar por nombre o NIT..." />

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Nombre</th>
              <th className="text-left p-4">NIT</th>
              <th className="text-left p-4">Teléfono</th>
              <th className="text-left p-4">Email</th>
              <th className="text-right p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clientesFiltrados.map(c => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{c.nombre}</td>
                <td className="p-4">{c.nit || '-'}</td>
                <td className="p-4">{c.telefono || '-'}</td>
                <td className="p-4">{c.email || '-'}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditing(c); setForm({ nombre: c.nombre, nit: c.nit || '', direccion: c.direccion || '', telefono: c.telefono || '', email: c.email || '' }); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { setDeleteId(c.id); setShowPinModal(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">{editing ? 'Editar' : 'Nuevo'} Cliente</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Nombre *" required />
              <input type="text" value={form.nit} onChange={(e) => setForm({ ...form, nit: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="NIT" />
              <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Teléfono" />
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Email" />
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">{editing ? 'Actualizar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm">
            <h3 className="font-semibold mb-4">PIN de Seguridad</h3>
            <input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full px-4 py-2 border rounded-lg text-center text-2xl" placeholder="****" maxLength={4} />
            <div className="flex gap-3 mt-4">
              <button onClick={() => { setShowPinModal(false); setPin(''); setDeleteId(null); }} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
