'use client';

import { useState, useEffect } from 'react';
import { Save, Building2 } from 'lucide-react';

interface Empresa {
  nombre: string;
  nit?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  moneda: string;
  simboloMoneda: string;
  serieFactura: string;
}

export default function ConfigModule() {
  const [empresa, setEmpresa] = useState<Empresa>({
    nombre: '',
    nit: '',
    direccion: '',
    telefono: '',
    email: '',
    moneda: 'Q',
    simboloMoneda: 'Q',
    serieFactura: 'A'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => { cargar(); }, []);

  const cargar = async () => {
    try {
      const data = await (await fetch('/api/config/empresa')).json();
      setEmpresa(data);
    } finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/config/empresa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(empresa)
      });
      if ((await res.json()).success) alert('Configuración guardada');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="text-center py-10">Cargando...</div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Configuración</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5" /> Datos de la Empresa
        </h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nombre</label>
              <input type="text" value={empresa.nombre} onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">NIT</label>
              <input type="text" value={empresa.nit || ''} onChange={(e) => setEmpresa({ ...empresa, nit: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Dirección</label>
            <input type="text" value={empresa.direccion || ''} onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Teléfono</label>
              <input type="text" value={empresa.telefono || ''} onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={empresa.email || ''} onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Moneda</label>
              <input type="text" value={empresa.moneda} onChange={(e) => setEmpresa({ ...empresa, moneda: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Símbolo</label>
              <input type="text" value={empresa.simboloMoneda} onChange={(e) => setEmpresa({ ...empresa, simboloMoneda: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Serie Factura</label>
              <input type="text" value={empresa.serieFactura} onChange={(e) => setEmpresa({ ...empresa, serieFactura: e.target.value })} className="w-full px-3 py-2 border rounded-lg" />
            </div>
          </div>

          <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50">
            <Save className="w-4 h-4" /> {saving ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold mb-4">Base de Datos</h3>
        <div className="flex gap-4">
          <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">Exportar Backup</button>
          <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">Limpiar Datos</button>
        </div>
      </div>
    </div>
  );
}
