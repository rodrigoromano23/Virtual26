import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import api from '../api/axiosInstance';
import { io } from 'socket.io-client';
import { Users, Plus, Trash2, Link as LinkIcon, Calendar, FileText, CheckCircle2, Lock, LogOut, BookOpen, UserCheck, AlertCircle, MessageSquare, Power, Send } from 'lucide-react';
import { FaYoutube } from 'react-icons/fa';

// Instancia de socket conectada dinámicamente según la baseURL de tu instancia axios (o fallback a localhost)
const socketURL = api.defaults.baseURL ? api.defaults.baseURL.replace('/api', '') : 'http://localhost:5000';
const socket = io(socketURL, { autoConnect: false });

export default function AdminForm({ onClaseCreada, isAdmin: isAdminProp = true, onLogout }) {
  const [isAdmin, setIsAdmin] = useState(isAdminProp);
  const [adminPassword, setAdminPassword] = useState('');
  const [errorPassword, setErrorPassword] = useState(false);

  // Estado para el Chat Grupal en vivo en el Admin
  const [chatActivo, setChatActivo] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensajeAdmin, setNuevoMensajeAdmin] = useState('');
  const chatAdminScrollRef = useRef(null);

  useEffect(() => {
    setIsAdmin(isAdminProp);
    if (isAdminProp) {
      socket.connect();
      // Consultar estado actual del chat y mensajes al montar
      socket.emit('obtener_estado_chat');
      socket.on('estado_chat', (estado) => {
        setChatActivo(estado);
      });

      socket.on('mensaje_recibido', (msg) => {
        setMensajes((prev) => [...prev, msg]);
      });
    }

    return () => {
      socket.off('estado_chat');
      socket.off('mensaje_recibido');
    };
  }, [isAdminProp]);

  // Auto-scroll al final del chat de admin
  useEffect(() => {
    if (chatAdminScrollRef.current) {
      chatAdminScrollRef.current.scrollTop = chatAdminScrollRef.current.scrollHeight;
    }
  }, [mensajes]);

  // Estados del Formulario
  const [loading, setLoading] = useState(false);
  const [mensajeExito, setMensajeExito] = useState(false);
  const [mensajeNotificacion, setMensajeNotificacion] = useState(null);
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [youtubeId, setYoutubeId] = useState('');
  const [fechaHabilitacion, setFechaHabilitacion] = useState('');
  
  // Modificado: Tres campos separados para los links de las imágenes
  const [imagenUrl1, setImagenUrl1] = useState('');
  const [imagenUrl2, setImagenUrl2] = useState('');
  const [imagenUrl3, setImagenUrl3] = useState('');

  const [actividades, setActividades] = useState([]);

  // Estados de Listas
  const [alumnos, setAlumnos] = useState([]);
  const [clases, setClases] = useState([]);
  const [loadingClases, setLoadingClases] = useState(false);
  const [loadingAlumnos, setLoadingAlumnos] = useState(false);

  // Estado para colapsar o expandir la lista de alumnos en el Admin
  const [mostrarListaAlumnos, setMostrarListaAlumnos] = useState(true);

  const mostrarAlertaTemporal = (texto) => {
    setMensajeNotificacion(texto);
    setTimeout(() => {
      setMensajeNotificacion(null);
    }, 3000);
  };

  const cargarAlumnos = async () => {
    setLoadingAlumnos(true);
    try {
      const res = await api.get('/alumnos');
      setAlumnos(res.data);
    } catch (error) {
      console.error('Error al cargar alumnos:', error);
    } finally {
      setLoadingAlumnos(false);
    }
  };

  const cargarClases = async () => {
    setLoadingClases(true);
    try {
      const response = await api.get('/clases');
      setClases(response.data);
    } catch (error) {
      console.error('Error al cargar clases:', error);
    } finally {
      setLoadingClases(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      cargarClases();
      cargarAlumnos();
    }
  }, [isAdmin]);

  // Control de Activación / Desactivación del Chat por el Admin
  const handleToggleChat = () => {
    const nuevoEstado = !chatActivo;
    setChatActivo(nuevoEstado);
    socket.emit('toggle_chat', nuevoEstado);
    if (!nuevoEstado) {
      setMensajes([]); // Limpiar mensajes si se apaga
    }
    mostrarAlertaTemporal(nuevoEstado ? 'Chat grupal activado.' : 'Chat grupal desactivado y limpiado.');
  };

  // Enviar mensaje como Administrador
  const handleEnviarMensajeAdmin = (e) => {
    e.preventDefault();
    if (!nuevoMensajeAdmin.trim() || !chatActivo) return;

    const mensajeData = {
      remitente: 'Administrador 🛡️',
      texto: nuevoMensajeAdmin.trim(),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('enviar_mensaje', mensajeData);
    setNuevoMensajeAdmin('');
  };

  const handleEliminarClase = async (id, tituloClase) => {
    try {
      await api.delete(`/clases/${id}`);
      setClases((prevClases) => prevClases.filter((c) => c._id !== id));
      if (onClaseCreada) onClaseCreada();
      mostrarAlertaTemporal(`Clase "${tituloClase}" eliminada correctamente.`);
    } catch (error) {
      console.error('Error al eliminar la clase:', error);
      alert('Ocurrió un error al intentar eliminar la clase.');
    }
  };

  const handleEliminarAlumno = async (id, nombreAlumno) => {
    try {
      await api.delete(`/alumnos/${id}`);
      setAlumnos((prevAlumnos) => prevAlumnos.filter((a) => a._id !== id));
      mostrarAlertaTemporal(`Alumno "${nombreAlumno}" eliminado correctamente.`);
    } catch (error) {
      console.error('Error al eliminar alumno:', error);
      alert('Ocurrió un error al intentar eliminar al alumno.');
    }
  };

  const handleLoginAdmin = (e) => {
    e.preventDefault();
    if (adminPassword === '2026') {
      setIsAdmin(true);
      setErrorPassword(false);
      socket.connect();
    } else {
      setErrorPassword(true);
    }
  };

  const agregarActividad = () => {
    setActividades([...actividades, { titulo: '', descripcion: '', archivoUrl: '' }]);
  };

  const eliminarActividad = (index) => {
    setActividades(actividades.filter((_, i) => i !== index));
  };

  const cambiarActividad = (index, campo, valor) => {
    const nuevasActividades = [...actividades];
    nuevasActividades[index][campo] = valor;
    setActividades(nuevasActividades);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensajeExito(false);

    try {
      // Consolidar los links ingresados en un array, filtrando los vacíos
      const imagenesUrls = [imagenUrl1, imagenUrl2, imagenUrl3].filter((url) => url.trim() !== '');

      const nuevaClasePayload = {
        titulo,
        descripcion,
        youtubeId,
        fechaHabilitacion,
        imagenesCloudinary: imagenesUrls, // Envía los links con la misma propiedad que espera tu backend (o ajústala si la guardas como imagenesUrls)
        actividades: actividades.filter((a) => a.titulo.trim() !== ''),
      };

      await api.post('/clases', nuevaClasePayload);

      setTitulo('');
      setDescripcion('');
      setYoutubeId('');
      setFechaHabilitacion('');
      setImagenUrl1('');
      setImagenUrl2('');
      setImagenUrl3('');
      setActividades([]);
      setMensajeExito(true);

      cargarClases();
      if (onClaseCreada) onClaseCreada();
    } catch (error) {
      console.error('Error al guardar la clase:', error);
      alert('Ocurrió un error al guardar la clase.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutAdmin = () => {
    socket.disconnect();
    setIsAdmin(false);
    if (onLogout) onLogout();
  };

  if (!isAdmin) {
    return (
      <div className="w-full px-4 flex justify-center items-center min-h-[60vh]">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 w-full max-w-md text-center">
          <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Acceso Administrativo</h2>
          <p className="text-sm text-slate-500 mb-6">
            Ingresa la clave de administrador para habilitar la carga de clases.
          </p>

          <form onSubmit={handleLoginAdmin} className="space-y-4">
            <div>
              <input
                type="password"
                placeholder="Clave de Admin"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none text-center text-lg font-mono tracking-widest"
                required
              />
            </div>

            {errorPassword && (
              <p className="text-xs text-red-600 font-semibold">Clave incorrecta. Inténtalo de nuevo.</p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors cursor-pointer"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 relative">
      
      {/* NOTIFICACIÓN FLOTANTE TEMPORAL */}
      {mensajeNotificacion && (
        <div className="fixed top-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <AlertCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-semibold">{mensajeNotificacion}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA: FORMULARIO Y CLASES EXISTENTES (7 COLUMNAS) */}
        <div className="lg:col-span-7 space-y-8">
          
          <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200 space-y-6">
            <div className="flex justify-between items-center border-b pb-3">
              <h2 className="text-xl font-bold text-slate-800">Cargar Nueva Clase</h2>
              <button
                type="button"
                onClick={handleLogoutAdmin}
                className="text-xs text-slate-500 hover:text-red-600 flex items-center gap-1 font-semibold cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" /> Salir
              </button>
            </div>

            {mensajeExito && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" /> ¡Clase programada y guardada con éxito!
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Título del Tema</label>
              <input
                type="text"
                required
                placeholder="Ej: Clase 1 - Introducción al Diseño"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Descripción del Tema</label>
              <textarea
                rows={4}
                required
                placeholder="Escribe aquí los temas que se abordarán..."
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <FaYoutube className="h-4 w-4 text-red-600" /> URL o ID de YouTube
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: https://www.youtube.com/watch?v=..."
                  value={youtubeId}
                  onChange={(e) => setYoutubeId(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-emerald-600" /> Fecha y Hora
                </label>
                <input
                  type="datetime-local"
                  required
                  value={fechaHabilitacion}
                  onChange={(e) => setFechaHabilitacion(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            {/* SECCIÓN DE TRES CAMPOS PARA LINKS DE IMÁGENES */}
            <div className="space-y-3">
              <label className="block text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <LinkIcon className="h-4 w-4 text-emerald-600" /> Links de Imágenes (Hasta 3)
              </label>
              
              <input
                type="url"
                placeholder="Link de imagen 1 (Ej: https://...)"
                value={imagenUrl1}
                onChange={(e) => setImagenUrl1(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <input
                type="url"
                placeholder="Link de imagen 2 (Opcional)"
                value={imagenUrl2}
                onChange={(e) => setImagenUrl2(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              <input
                type="url"
                placeholder="Link de imagen 3 (Opcional)"
                value={imagenUrl3}
                onChange={(e) => setImagenUrl3(e.target.value)}
                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div className="pt-2">
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-emerald-600" /> Actividades
                </label>
                <button
                  type="button"
                  onClick={agregarActividad}
                  className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Agregar Actividad
                </button>
              </div>

              <div className="space-y-3">
                {actividades.map((act, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg border border-slate-200 relative space-y-2">
                    <button
                      type="button"
                      onClick={() => eliminarActividad(index)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <input
                      type="text"
                      placeholder="Título de la actividad"
                      value={act.titulo}
                      onChange={(e) => cambiarActividad(index, 'titulo', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Instrucciones breves (opcional)"
                      value={act.descripcion}
                      onChange={(e) => cambiarActividad(index, 'descripcion', e.target.value)}
                      className="w-full px-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors flex items-center justify-center gap-2 disabled:bg-slate-400 cursor-pointer"
            >
              {loading ? 'Guardando clase...' : 'Guardar y Programar Clase'}
            </button>
          </form>

          {/* CLASES EXISTENTES */}
          <section className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-emerald-600" />
                Clases Existentes ({clases.length})
              </h2>
            </div>

            {loadingClases ? (
              <p className="text-slate-500 text-sm py-4 text-center">Cargando lista de clases...</p>
            ) : clases.length === 0 ? (
              <p className="text-slate-500 text-sm py-4 text-center">No hay clases registradas aún.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {clases.map((clase) => (
                  <div
                    key={clase._id}
                    className="group py-3 px-4 rounded-xl flex items-center justify-between hover:bg-slate-50 transition-all duration-200"
                  >
                    <div className="flex items-center gap-3 pr-4">
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{clase.titulo}</p>
                        <p className="text-xs text-slate-500">
                          Habilitación: {new Date(clase.fechaHabilitacion).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleEliminarClase(clase._id, clase.titulo)}
                      title="Borrar clase"
                      className="opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center gap-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200 hover:border-red-600 shadow-sm cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span>Borrar</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* COLUMNA DERECHA (5 COLUMNAS): ALUMNOS + TARJETA DE CHAT ESTILO WHATSAPP */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-6">
          
          {/* TARJETA DE ALUMNOS REGISTRADOS */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative z-20">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Alumnos Registrados
              </h2>

              <div className="flex items-center gap-2">
                {/* Contador de alumnos */}
                <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                  {alumnos.length} / 20
                </span>

                {/* Botón redondo verde pastel para desplegar / guardar */}
                <button
                  type="button"
                  onClick={() => setMostrarListaAlumnos(!mostrarListaAlumnos)}
                  title={mostrarListaAlumnos ? "Guardar lista" : "Desplegar lista"}
                  className="w-7 h-7 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-full flex items-center justify-center transition-transform transform active:scale-95 cursor-pointer shadow-xs border border-emerald-300"
                >
                  {mostrarListaAlumnos ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* CONTENEDOR FLOTANTE QUE SE DESPLIEGA POR ENCIMA */}
            {mostrarListaAlumnos && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white p-4 shadow-2xl rounded-2xl border border-slate-200 z-30 animate-in fade-in slide-in-from-top-2 duration-150">
                {loadingAlumnos ? (
                  <p className="text-slate-500 text-sm py-4 text-center">Cargando alumnos...</p>
                ) : alumnos.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <UserCheck className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm font-medium">Aún no hay alumnos inscriptos.</p>
                  </div>
                ) : (
                  <div className="max-h-[280px] overflow-y-auto pr-1 space-y-2.5 custom-scroll">
                    {alumnos.map((a, index) => (
                      <div 
                        key={a._id || index} 
                        className="group p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/80 flex items-center justify-between transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0 pr-2">
                          <div className="w-8 h-8 bg-emerald-600/10 text-emerald-700 font-bold rounded-full flex items-center justify-center text-xs shrink-0">
                            {index + 1}
                          </div>
                          <span className="font-semibold text-slate-800 text-sm leading-tight truncate">
                            {a.nombre}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[11px] font-medium text-slate-400 bg-white px-2 py-1 rounded-md border border-slate-200/60">
                            {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : 'Inscripto'}
                          </span>

                          {/* BOTÓN ELIMINAR ALUMNO */}
                          <button
                            type="button"
                            onClick={() => handleEliminarAlumno(a._id, a.nombre)}
                            title={`Eliminar a ${a.nombre}`}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </section>

          {/* TARJETA DE CHAT GRUPAL EN VIVO (CON INTERFAZ WHATSAPP) */}
          <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-[480px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b shrink-0">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                Chat en Vivo
              </h2>

              {/* BOTÓN VERDE PASTEL PARA ACTIVAR / DESACTIVAR */}
              <button
                type="button"
                onClick={handleToggleChat}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
                  chatActivo 
                    ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border-emerald-300' 
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border-slate-200'
                }`}
              >
                <Power className={`h-3 w-3 ${chatActivo ? 'text-emerald-600' : 'text-slate-500'}`} />
                <span>{chatActivo ? 'Activo' : 'Inactivo'}</span>
              </button>
            </div>

            {/* CONTENEDOR DE MENSAJES (ESTILO WHATSAPP) */}
            <div ref={chatAdminScrollRef} className="flex-1 bg-slate-50 rounded-xl p-3 overflow-y-auto space-y-3 border border-slate-200/60 mb-3">
              {!chatActivo ? (
                <div className="text-center py-20 text-slate-400 text-xs px-4">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="font-medium">El chat está inactivo.</p>
                  <p className="text-[11px] text-slate-400 mt-1">Haz clic en el botón "Inactivo" arriba para abrir la sala y ver los mensajes de los alumnos.</p>
                </div>
              ) : mensajes.length === 0 ? (
                <div className="text-center py-20 text-slate-400 text-xs">
                  <p>Sala abierta. Esperando mensajes de los alumnos...</p>
                </div>
              ) : (
                mensajes.map((m, idx) => {
                  const esAdmin = m.remitente.includes('Administrador');
                  return (
                    <div key={idx} className={`flex flex-col ${esAdmin ? 'items-end' : 'items-start'}`}>
                      <span className="text-[10px] font-bold text-slate-500 mb-0.5 px-1">
                        {m.remitente}
                      </span>
                      <div className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                        esAdmin 
                          ? 'bg-emerald-600 text-white rounded-br-none' 
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                      }`}>
                        <p className="break-words">{m.texto}</p>
                        <span className={`text-[9px] block text-right mt-1 ${esAdmin ? 'text-emerald-100' : 'text-slate-400'}`}>
                          {m.hora}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* INPUT PARA ESCRIBIR DESDE EL ADMIN */}
            <form onSubmit={handleEnviarMensajeAdmin} className="flex items-center gap-2 shrink-0">
              <input
                type="text"
                disabled={!chatActivo}
                placeholder={chatActivo ? "Escribe como Administrador..." : "Activa el chat para escribir"}
                value={nuevoMensajeAdmin}
                onChange={(e) => setNuevoMensajeAdmin(e.target.value)}
                className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!chatActivo}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </section>

        </div>

      </div>
    </div>
  );
}