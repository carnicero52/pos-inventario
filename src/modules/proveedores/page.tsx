'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X, Truck } from 'lucide-react';

interface Proveedor {
  id: string;
  nombre: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  nit?: string;
}

export default function ProveedoresModule() {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editing, setEditing] = useState<Proveedor | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pin, setPin] = useState('');

  const [form, setForm] = useState({ nombre: '', contacto: '', telefono: '', email: '', nit: '' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setProveedores(await (await fetch('/api/proveedores')).json()); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/proveedores', { method: editing ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(editing ? { ...form, id: editing.id } : form) });
    const data = await res.json();
    if (data.success) { setShowModal(false); setEditing(null); setForm({ nombre: '', contacto: '', telefono: '', email: '', nit: '' }); cargar(); }
    else alert(data.error);
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/proveedores?id=${deleteId}&pin=${pin}`, { method: 'DELETE' });
    if ((await res.json()).success) { setShowPinModal(false); setDeleteId(null); setPin(''); cargar(); }
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Proveedores</h2>
        <button onClick={() => { setForm({ nombre: '', contacto: '', telefono: '', email: '', nit: '' }); setEditing(null); setShowModal(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          <Plus className="w-5 h-5" /> Nuevo
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Nombre</th>
              <th className="text-left p-4">Contacto</th>
              <th className="text-left p-4">Teléfono</th>
              <th className="text-left p-4">Email</th>
              <th className="text-right p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {proveedores.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-medium">{p.nombre}</td>
                <td className="p-4">{p.contacto || '-'}</td>
                <td className="p-4">{p.telefono || '-'}</td>
                <td className="p-4">{p.email || '-'}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setEditing(p); setForm({ nombre: p.nombre, contacto: p.contacto || '', telefono: p.telefono || '', email: p.email || '', nit: p.nit || '' }); setShowModal(true); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => { setDeleteId(p.id); setShowPinModal(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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
            <div className="p-4 border-b flex justify-between">
              <h3 className="font-semibold">{editing ? 'Editar' : 'Nuevo'} Proveedor</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Nombre *" required />
              <input type="text" value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Contacto" />
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
