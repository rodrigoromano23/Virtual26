import React, { useState } from 'react';
import { Lock, Calendar, Clock, Video, FileText, Image as ImageIcon, ChevronDown, ChevronUp } from 'lucide-react';

export default function ClaseCard({ clase }) {
  // Estado para desplegar / cerrar el contenido
  const [abierto, setAbierto] = useState(false);

  const fechaObj = new Date(clase.fechaHabilitacion);
  const fechaFormateada = fechaObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const horaFormateada = fechaObj.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Extraer ID de YouTube de cualquier URL o ID directo
  const getYoutubeEmbedUrl = (urlOrId) => {
    if (!urlOrId) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOrId.match(regExp);
    const id = (match && match[2].length === 11) ? match[2] : urlOrId;
    return `https://www.youtube.com/embed/${id}`;
  };

  const toggleDesplegar = () => {
    if (clase.disponible) {
      setAbierto(!abierto);
    }
  };

  // ESTADO BLOQUEADO (FECHA NO CUMPLIDA)
  if (!clase.disponible) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden opacity-90 transition-all hover:shadow-md">
        <div className="bg-slate-100 p-6 border-b border-slate-200 flex flex-col items-center justify-center text-center py-8">
          <div className="bg-slate-200 p-3 rounded-full mb-3 text-slate-500">
            <Lock className="h-6 w-6" />
          </div>
          <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full mb-2">
            Clase Próximamente
          </span>
          <h3 className="text-xl font-bold text-slate-800 mb-2">{clase.titulo}</h3>
          <p className="text-sm text-slate-600 max-w-md line-clamp-2">{clase.descripcion}</p>
        </div>
        <div className="bg-slate-50 p-4 flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Se habilita el: <strong>{fechaFormateada}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-emerald-600" />
            <span>A las: <strong>{horaFormateada} hs</strong></span>
          </div>
        </div>
      </div>
    );
  }

  // ESTADO DISPONIBLE (ACORDEÓN DESPLEGABLE)
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden transition-all hover:shadow-lg">
      {/* BARRA / BOTÓN SUPERIOR PARA ABRIR Y CERRAR */}
      <div
        onClick={toggleDesplegar}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-50 transition-colors border-b border-slate-100"
      >
        <div className="pr-4">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Video className="h-4 w-4" /> Clase Disponible
          </div>
          <h3 className="text-xl font-bold text-slate-900">{clase.titulo}</h3>
        </div>

        {/* BOTÓN INTERACTIVO DE DESPLIEGUE */}
        <button
          type="button"
          className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-lg text-xs font-bold transition-colors"
        >
          <span>{abierto ? 'Cerrar Clase' : 'Ver Clase'}</span>
          {abierto ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      {/* CONTENIDO DE LA CLASE (SOLO VISIBLE SI ESTÁ ABIERTO) */}
      {abierto && (
        <div className="animate-fadeIn">
          {/* Descripción */}
          <div className="p-6 border-b border-slate-100 bg-white">
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">{clase.descripcion}</p>
          </div>

          {/* Reproductor de Video YouTube */}
          {clase.youtubeId && (
            <div className="p-6 bg-slate-900">
              <div className="relative aspect-video w-full rounded-lg overflow-hidden shadow-inner">
                <iframe
                  src={getYoutubeEmbedUrl(clase.youtubeId)}
                  title={clase.titulo}
                  className="absolute top-0 left-0 w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {/* Galería de Imágenes (Cloudinary) */}
          {clase.imagenesCloudinary && clase.imagenesCloudinary.length > 0 && (
            <div className="p-6 border-b border-slate-100 bg-white">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                <ImageIcon className="h-4 w-4 text-emerald-600" /> Material Visual
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {clase.imagenesCloudinary.map((imgUrl, index) => (
                  <a key={index} href={imgUrl} target="_blank" rel="noreferrer" className="group">
                    <img
                      src={imgUrl}
                      alt={`Material ${index + 1}`}
                      className="rounded-lg object-cover h-36 w-full border border-slate-200 transition-transform group-hover:scale-105"
                    />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Actividades */}
          {clase.actividades && clase.actividades.length > 0 && (
            <div className="p-6 bg-slate-50">
              <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                <FileText className="h-4 w-4 text-emerald-600" /> Actividades
              </h4>
              <div className="space-y-3">
                {clase.actividades.map((act, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-slate-200 shadow-sm">
                    <h5 className="font-bold text-slate-800 text-sm">{act.titulo}</h5>
                    {act.descripcion && <p className="text-xs text-slate-600 mt-1">{act.descripcion}</p>}
                    {act.archivoUrl && (
                      <a
                        href={act.archivoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline"
                      >
                        Descargar Recurso Adjunto
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}