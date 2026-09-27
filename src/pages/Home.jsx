import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axiosInstance';
import { 
  Calendar, 
  FileText, 
  ImageIcon, 
  UserPlus, 
  UserCheck, 
  Lock, 
  Loader2,
  LogOut,
  LogIn,
  MessageSquare,
  X,
  Send,
  Maximize2
} from 'lucide-react';

// Instancia de Socket.io conectada al servidor backend
const socket = io('https://virtual2026.onrender.com');

export default function Home({ onIrAdmin }) {
  const [clases, setClases] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);

  // Estados de Alumno y Formularios
  const [alumno, setAlumno] = useState('');
  const [loginInput, setLoginInput] = useState(''); 
  const [nombreInput, setNombreInput] = useState(''); 
  const [registrando, setRegistrando] = useState(false);
  const [mostrarModal, setMostrarModal] = useState(false);

  // Estado para imagen ampliada en pantalla
  const [imagenExpandida, setImagenExpandida] = useState(null);

  // Estados del Chat en Vivo (Estilo WhatsApp)
  const [chatActivo, setChatActivo] = useState(false);
  const [abrirChatModal, setAbrirChatModal] = useState(false);
  const [mensajes, setMensajes] = useState([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [mensajesNoLeidos, setMensajesNoLeidos] = useState(0);
  const chatScrollRef = useRef(null);

  // Cargar sesión previa y escuchar eventos de Socket.io
  useEffect(() => {
    const alumnoGuardado = localStorage.getItem('alumnoNombre');
    if (alumnoGuardado) {
      setAlumno(alumnoGuardado);
    }
    cargarClases();

    // Sockets para el chat
    socket.emit('obtener_estado_chat');

    socket.on('estado_chat', (estado) => {
      setChatActivo(estado);
      if (!estado) {
        setMensajes([]); // Limpiar mensajes si el admin apaga el chat
        setAbrirChatModal(false);
        setMensajesNoLeidos(0);
      }
    });

    socket.on('mensaje_recibido', (msg) => {
      setMensajes((prev) => [...prev, msg]);
      // Si el chat está cerrado y el mensaje no es del propio alumno, incrementar notificaciones
      setAbrirChatModal((prevAbierto) => {
        if (!prevAbierto) {
          setMensajesNoLeidos((prevCount) => prevCount + 1);
        }
        return prevAbierto;
      });
    });

    return () => {
      socket.off('estado_chat');
      socket.off('mensaje_recibido');
    };
  }, []);

  // Auto-scroll al final del chat cuando llegan mensajes
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [mensajes, abrirChatModal]);

  const cargarClases = async () => {
    try {
      setLoadingClases(true);
      const res = await api.get('/clases');
      setClases(res.data);
    } catch (error) {
      console.error('Error cargando clases:', error);
    } finally {
      setLoadingClases(false);
    }
  };

  // Función auxiliar para extraer el ID correcto de cualquier formato de URL de YouTube
  const obtenerYoutubeId = (urlOId) => {
    if (!urlOId) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = urlOId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : urlOId;
  };

  // Ingreso directo escribiendo el nombre en la barra principal
  const handleIngresoDirecto = (e) => {
    e.preventDefault();
    const nombreLimpio = loginInput.trim();
    if (!nombreLimpio) return;

    localStorage.setItem('alumnoNombre', nombreLimpio);
    setAlumno(nombreLimpio);
    setLoginInput('');
  };

  // Registro de nuevo alumno (Modal)
  const handleRegistroAlumno = async (e) => {
    e.preventDefault();
    if (!nombreInput.trim()) return;

    setRegistrando(true);
    try {
      await api.post('/alumnos', { nombre: nombreInput });
      localStorage.setItem('alumnoNombre', nombreInput);
      setAlumno(nombreInput);
      setMostrarModal(false);
      setNombreInput('');
    } catch (error) {
      console.error('Error al registrar alumno:', error);
      const mensajeError = error.response?.data?.mensaje || 'Error al registrar tu nombre.';
      alert(mensajeError);
    } finally {
      setRegistrando(false);
    }
  };

  // Cerrar sesión directa
  const handleCerrarSesion = () => {
    localStorage.removeItem('alumnoNombre');
    setAlumno('');
    setLoginInput('');
  };

  // Enviar mensaje por el chat
  const handleEnviarMensaje = (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim() || !alumno) return;

    const mensajeData = {
      remitente: alumno,
      texto: nuevoMensaje.trim(),
      hora: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    socket.emit('enviar_mensaje', mensajeData);
    setNuevoMensaje('');
  };

  // Abrir o cerrar el globo flotante del chat
  const toggleVentanaChat = () => {
    if (!chatActivo) return;
    const nuevoEstado = !abrirChatModal;
    setAbrirChatModal(nuevoEstado);
    if (nuevoEstado) {
      setMensajesNoLeidos(0); // Al abrirlo, se leen las notificaciones
    }
  };

  return (
    <div className="space-y-6 relative min-h-screen pb-20">
      <main className="max-w-4xl mx-auto py-4 px-3 sm:px-0">
        {/* CABECERA CON TÍTULO Y PANEL DE INGRESO / REGISTRO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b pb-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Clases Disponibles
          </h2>

          {alumno ? (
            /* INSIGNIA Y CERRAR SESIÓN */
            <div className="flex items-center gap-2 self-end md:self-auto">
              <div className="flex items-center gap-2 bg-emerald-100 border border-emerald-300 px-3.5 py-1.5 rounded-full text-xs text-emerald-800 font-semibold shadow-sm">
                <UserCheck className="h-4 w-4 text-emerald-600" />
                <span>{alumno}</span>
              </div>

              <button
                onClick={handleCerrarSesion}
                title="Cerrar sesión"
                className="flex items-center gap-1.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 px-3 py-1.5 rounded-full text-xs font-semibold border border-slate-200 hover:border-red-200 transition-colors shadow-sm cursor-pointer"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Salir</span>
              </button>
            </div>
          ) : (
            /* CAMPO DE INGRESO RÁPIDO + BOTÓN REGISTRARSE */
            <div className="flex flex-wrap items-center gap-2">
              <form onSubmit={handleIngresoDirecto} className="flex items-center gap-1.5 flex-1 min-w-[220px]">
                <input
                  type="text"
                  placeholder="Ingresa con tu nombre completo"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-800 shadow-sm"
                />
                <button
                  type="submit"
                  className="bg-slate-800 hover:bg-slate-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-sm transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                  title="Ingresar con mi nombre"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Entrar</span>
                </button>
              </form>

              <button
                onClick={() => setMostrarModal(true)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3.5 py-1.5 rounded-xl shadow-sm transition-all text-xs shrink-0 cursor-pointer"
              >
                <UserPlus className="h-3.5 w-3.5" />
                <span>Registrarse</span>
              </button>
            </div>
          )}
        </div>

        {/* LISTA DE CLASES */}
        {loadingClases ? (
          <div className="text-center py-12 text-slate-500 flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            <span>Cargando clases...</span>
          </div>
        ) : clases.length === 0 ? (
          <div className="bg-white p-8 text-center rounded-xl border border-slate-200 text-slate-500">
            Aún no hay clases publicadas.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {clases.map((clase) => (
              <article 
                key={clase._id} 
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden relative"
              >
                {/* Encabezado visible de la clase (Título de la clase) */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-slate-800">{clase.titulo}</h3>
                  {!alumno && (
                    <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                      <Lock className="h-3 w-3" /> Bloqueada
                    </span>
                  )}
                </div>

                {/* Contenido de la Clase */}
                <div className="p-5 space-y-5 relative">
                  
                  {/* Capa de Bloqueo / Desenfoque */}
                  {!alumno && (
                    <div className="absolute inset-0 z-10 bg-slate-900/40 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center transition-all">
                      <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center mb-3 shadow-md text-amber-600">
                        <Lock className="h-6 w-6" />
                      </div>
                      <h4 className="text-white font-extrabold text-base mb-1">
                        Contenido Bloqueado
                      </h4>
                      <p className="text-slate-200 text-xs max-w-xs mb-4">
                        Ingresa tu nombre arriba o regístrate para ver el contenido completo de esta clase.
                      </p>
                      <button
                        onClick={() => setMostrarModal(true)}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2 rounded-lg shadow-lg text-xs transition-transform transform hover:scale-105 flex items-center gap-1.5 cursor-pointer"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>Registrarse para Desbloquear</span>
                      </button>
                    </div>
                  )}

                  {/* SECCIÓN PRINCIPAL: Video a la izquierda, Imágenes a la derecha (Desktop) / Apilado (Móvil) */}
                  <div className="flex flex-col lg:flex-row gap-4 items-stretch">
                    {/* Video de YouTube */}
                    {clase.youtubeId && (
                      <div className="w-full lg:flex-1 rounded-lg overflow-hidden bg-black aspect-video shrink-0 shadow-sm">
                        <iframe
                          src={`https://www.youtube.com/embed/${obtenerYoutubeId(clase.youtubeId)}`}
                          title={clase.titulo}
                          className="w-full h-full border-0"
                          allowFullScreen
                        ></iframe>
                      </div>
                    )}

                    {/* Columna de las 3 imágenes a la derecha en Desktop / Grid responsivo en Móvil */}
                    {clase.imagenesCloudinary && clase.imagenesCloudinary.length > 0 && (
                      <div className="w-full lg:w-48 flex flex-col gap-2 shrink-0">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <ImageIcon className="h-3.5 w-3.5" /> Material ({clase.imagenesCloudinary.length})
                        </h4>
                        <div className="grid grid-cols-3 lg:grid-cols-1 gap-2 flex-1">
                          {clase.imagenesCloudinary.map((imgUrl, idx) => (
                            <div
                              key={idx}
                              onClick={() => setImagenExpandida(imgUrl)}
                              className="group relative aspect-video lg:aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-sm hover:ring-2 hover:ring-emerald-500 transition-all"
                            >
                              <img
                                src={imgUrl}
                                alt={`Adjunto ${idx + 1}`}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                                <Maximize2 className="h-4 w-4 drop-shadow" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* DESCRIPCIÓN DEL TEMA */}
                  {clase.descripcion && (
                    <div className="pt-2">
                      <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                        {clase.descripcion}
                      </p>
                    </div>
                  )}

                  {/* ACTIVIDADES */}
                  {clase.actividades && clase.actividades.length > 0 && (
                    <div className="pt-4 border-t border-slate-100">
                      <h4 className="text-sm font-bold text-slate-700 mb-2.5 flex items-center gap-1.5">
                        <FileText className="h-4 w-4 text-emerald-600" /> Actividades Requeridas
                      </h4>
                      <ul className="space-y-2">
                        {clase.actividades.map((act, idx) => (
                          <li key={idx} className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                            <p className="text-sm font-semibold text-slate-800">{act.titulo}</p>
                            {act.descripcion && (
                              <p className="text-xs text-slate-600 mt-1">{act.descripcion}</p>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* ==================================================== */}
      {/* MODAL PARA EXPANDIR IMAGEN EN PANTALLA */}
      {/* ==================================================== */}
      {imagenExpandida && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setImagenExpandida(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center p-2">
            <button
              onClick={() => setImagenExpandida(null)}
              className="absolute top-2 right-2 sm:-top-10 sm:-right-2 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer z-10"
              title="Cerrar"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={imagenExpandida}
              alt="Imagen ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl border border-white/10"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* BOTÓN FLOTANTE Y GLOBO DE DIÁLOGO (ESTILO WHATSAPP) */}
      {/* ==================================================== */}
      {alumno && (
        <div className="fixed bottom-6 right-6 z-40">
          
          {/* VENTANA / GLOBO DE CHAT DESPLEGABLE */}
          {abrirChatModal && chatActivo && (
            <div className="absolute bottom-20 right-0 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col h-[420px] animate-in fade-in slide-in-from-bottom-5 duration-200">
              
              {/* Cabecera del chat */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <div>
                    <h3 className="font-bold text-sm">Chat Grupal en Vivo</h3>
                    <p className="text-[10px] text-slate-400">Conectado como: {alumno}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setAbrirChatModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Cuerpo de mensajes */}
              <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
                {mensajes.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-xs">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p>No hay mensajes aún. ¡Comienza la conversación!</p>
                  </div>
                ) : (
                  mensajes.map((m, idx) => {
                    const esMio = m.remitente === alumno;
                    return (
                      <div key={idx} className={`flex flex-col ${esMio ? 'items-end' : 'items-start'}`}>
                        <span className="text-[10px] font-semibold text-slate-500 mb-0.5 px-1">
                          {esMio ? 'Tú' : m.remitente}
                        </span>
                        <div className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                          esMio 
                            ? 'bg-emerald-600 text-white rounded-br-none' 
                            : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none'
                        }`}>
                          <p className="break-words">{m.texto}</p>
                          <span className={`text-[9px] block text-right mt-1 ${esMio ? 'text-emerald-100' : 'text-slate-400'}`}>
                            {m.hora}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input para enviar mensaje */}
              <form onSubmit={handleEnviarMensaje} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={nuevoMensaje}
                  onChange={(e) => setNuevoMensaje(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl transition-colors cursor-pointer shrink-0 shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          )}

          {/* BOTÓN FLOTANTE CIRCULAR */}
          <button
            onClick={toggleVentanaChat}
            disabled={!chatActivo}
            title={chatActivo ? "Abrir chat grupal" : "El chat está inactivo"}
            className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-transform transform hover:scale-105 cursor-pointer ${
              chatActivo 
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white animate-bounce' 
                : 'bg-slate-900 text-slate-400 opacity-80 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="h-6 w-6" />

            {/* BADGE DE NOTIFICACIONES NO LEÍDAS (Estilo WhatsApp) */}
            {mensajesNoLeidos > 0 && !abrirChatModal && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[11px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-md">
                {mensajesNoLeidos > 9 ? '9+' : mensajesNoLeidos}
              </span>
            )}
          </button>
        </div>
      )}

      {/* MODAL DE REGISTRO PARA NUEVOS ALUMNOS */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full p-6 relative">
            <button
              onClick={() => setMostrarModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-sm font-bold"
            >
              ✕
            </button>

            <h2 className="text-2xl font-extrabold text-slate-800 text-center mb-1">
              Registro de Alumno
            </h2>
            <p className="text-xs text-slate-500 text-center mb-6">
              Ingresa tu nombre completo para darte de alta y habilitar las clases.
            </p>

            <form onSubmit={handleRegistroAlumno} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre y Apellido
                </label>
                <input
                  type="text"
                  required
                  placeholder="Escribe tu nombre Completo..."
                  value={nombreInput}
                  onChange={(e) => setNombreInput(e.target.value)}
                  className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 font-medium"
                  autoFocus
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setMostrarModal(false)}
                  className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={registrando}
                  className="w-2/3 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl disabled:bg-slate-300 flex justify-center items-center gap-2 cursor-pointer"
                >
                  {registrando ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}