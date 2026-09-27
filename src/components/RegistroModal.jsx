import React, { useState } from 'react';
import api from '../api/axiosInstance';
import { UserCheck, Sparkles } from 'lucide-react';

export default function RegistroModal({ onRegistroExitoso }) {
  const [nombre, setNombre] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;

    setLoading(true);
    try {
      const res = await api.post('/alumnos', { nombre });
      // Guardar en el navegador para mantener la sesión abierta
      localStorage.setItem('alumnoNombre', res.data.nombre);
      onRegistroExitoso(res.data.nombre);
    } catch (error) {
      console.error('Error al registrarse:', error);
      alert('Hubo un problema al registrar tu nombre. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 sm:p-8 max-w-md w-full text-center space-y-4">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
          <Sparkles className="h-7 w-7" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido al Taller!</h2>
          <p className="text-sm text-slate-500 mt-1">
            Ingresa tu nombre para desbloquear el material y las clases programadas.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Tu Nombre Completo
            </label>
            <input
              type="text"
              required
              placeholder="Ej: María González"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            <UserCheck className="h-5 w-5" />
            {loading ? 'Ingresando...' : 'Comenzar Taller'}
          </button>
        </form>
      </div>
    </div>
  );
}