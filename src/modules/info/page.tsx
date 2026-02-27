'use client';

export default function InfoModule() {
  return (
    <div className="space-y-6 max-w-2xl">
      <h2 className="text-2xl font-bold">Información del Sistema</h2>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Sistema POS - Punto de Venta Integral</h3>
        
        <div className="space-y-3 text-slate-600">
          <p><strong>Versión:</strong> 1.0.0</p>
          <p><strong>Framework:</strong> Next.js 16</p>
          <p><strong>Base de datos:</strong> SQLite (local)</p>
          <p><strong>Modo:</strong> Sin conexión (offline)</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Módulos Disponibles</h3>
        <div className="grid grid-cols-2 gap-2">
          {['Ventas', 'Inventario', 'Clientes', 'Proveedores', 'Compras', 'Reportes', 'Gastos', 'Configuración', 'Usuarios', 'Información'].map(m => (
            <div key={m} className="p-2 bg-slate-50 rounded text-sm">{m}</div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="font-semibold text-lg mb-4">Soporte Técnico</h3>
        <p className="text-slate-600">Para asistencia técnica o reportar problemas:</p>
        <p className="text-blue-500 mt-2">soporte@sistemapos.com</p>
      </div>
    </div>
  );
}
