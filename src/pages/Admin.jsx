import React from 'react';
import AdminForm from '../components/AdminForm';

export default function Admin() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-600 text-sm">
          Carga nuevos temas, adjunta enlaces de YouTube, imágenes a Cloudinary y establece la fecha exacta de apertura para tus estudiantes.
        </p>
      </div>

      <AdminForm />
    </div>
  );
}