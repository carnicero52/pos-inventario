'use client';

import { useState, useEffect } from 'react';

export default function ReportesModule() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Reportes</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-slate-500">Ventas Hoy</p>
          <p className="text-3xl font-bold text-green-600">Q 0.00</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-slate-500">Ventas Mes</p>
          <p className="text-3xl font-bold text-blue-600">Q 0.00</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-slate-500">Gastos Mes</p>
          <p className="text-3xl font-bold text-red-600">Q 0.00</p>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          <p className="text-slate-500">Ganancia</p>
          <p className="text-3xl font-bold text-purple-600">Q 0.00</p>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow p-8 text-center">
        <p className="text-slate-500">Dashboard de reportes en desarrollo...</p>
      </div>
    </div>
  );
}
