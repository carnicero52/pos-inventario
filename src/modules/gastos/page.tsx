'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, X } from 'lucide-react';

interface Gasto {
  id: string;
  concepto: string;
  monto: number;
  categoria?: string;
  fecha: Date;
}

export default function GastosModule() {
  const [gastos, setGastos] = useState<Gasto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pin, setPin] = useState('');
  const [form, setForm] = useState({ concepto: '', monto: '', categoria: 'OTROS' });

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try { setGastos(await (await fetch('/api/gastos')).json()); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/gastos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    if ((await res.json()).success) { setShowModal(false); setForm({ concepto: '', monto: '', categoria: 'OTROS' }); cargar(); }
  };

  const handleDelete = async () => {
    const res = await fetch(`/api/gastos?id=${deleteId}&pin=${pin}`, { method: 'DELETE' });
    if ((await res.json()).success) { setShowPinModal(false); setDeleteId(null); setPin(''); cargar(); }
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gastos</h2>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
          <Plus className="w-5 h-5" /> Nuevo Gasto
        </button>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="text-left p-4">Fecha</th>
              <th className="text-left p-4">Concepto</th>
              <th className="text-left p-4">Categoría</th>
              <th className="text-right p-4">Monto</th>
              <th className="text-right p-4">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {gastos.map(g => (
              <tr key={g.id} className="hover:bg-slate-50">
                <td className="p-4">{new Date(g.fecha).toLocaleDateString()}</td>
                <td className="p-4">{g.concepto}</td>
                <td className="p-4">{g.categoria || '-'}</td>
                <td className="p-4 text-right font-medium">Q {g.monto.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => { setDeleteId(g.id); setShowPinModal(true); }} className="p-2 text-red-500 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
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
              <h3 className="font-semibold">Nuevo Gasto</h3>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <input type="text" value={form.concepto} onChange={(e) => setForm({ ...form, concepto: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Concepto *" required />
              <input type="number" step="0.01" value={form.monto} onChange={(e) => setForm({ ...form, monto: e.target.value })} className="w-full px-3 py-2 border rounded-lg" placeholder="Monto *" required />
              <select value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full px-3 py-2 border rounded-lg">
                <option value="SERVICIOS">Servicios</option>
                <option value="ALQUILER">Alquiler</option>
                <option value="SALARIOS">Salarios</option>
                <option value="OTROS">Otros</option>
              </select>
              <div className="flex gap-3 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button>
                <button type="submit" className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Guardar</button>
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
