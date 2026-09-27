import React from 'react';
import { GraduationCap, Lock, LayoutDashboard } from 'lucide-react';

export default function Navbar({ vistaActual, setVistaActual }) {
  return (
    <nav className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-8 w-8 text-emerald-400" />
          <span className="font-bold text-xl tracking-tight">Aula Virtual</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setVistaActual('alumnas')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              vistaActual === 'alumnas'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <GraduationCap className="h-4 w-4" /> Vista Alumnas
          </button>
          <button
            onClick={() => setVistaActual('admin')}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
              vistaActual === 'admin'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            <LayoutDashboard className="h-4 w-4" /> Panel Admin
          </button>
        </div>
      </div>
    </nav>
  );
}