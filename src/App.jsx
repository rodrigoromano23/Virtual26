import React, { useState } from 'react';
import Home from './pages/Home';
import AdminForm from './components/AdminForm';
import { GraduationCap, ArrowLeft, KeyRound, Check } from 'lucide-react';

export default function App() {
  const [vistaActual, setVistaActual] = useState('home'); // 'home' | 'admin'
  const [mostrarInputPassword, setMostrarInputPassword] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [errorAuth, setErrorAuth] = useState(false);

  const ADMIN_PASSWORD = '2026';

  const handleToggleAdmin = () => {
    if (vistaActual === 'admin') return;
    setMostrarInputPassword(!mostrarInputPassword);
    setErrorAuth(false);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (passwordInput === ADMIN_PASSWORD) {
      setVistaActual('admin');
      setMostrarInputPassword(false);
      setPasswordInput('');
      setErrorAuth(false);
    } else {
      setErrorAuth(true);
    }
  };

  const handleSalirAdmin = () => {
    setVistaActual('home');
    setMostrarInputPassword(false);
    setPasswordInput('');
    setErrorAuth(false);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans pb-12">
      
      {/* SECCIÓN PORTADA HERO CON IMAGEN DE FONDO */}
      <div className="relative h-64 sm:h-80 w-full overflow-hidden shadow-lg bg-slate-900">
        
        {/* Imagen de fondo con overlay oscuro */}
        <img
          src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1600&auto=format&fit=crop"
          alt="Portada Aula Virtual"
          className="w-full h-full object-cover object-center opacity-50"
        />

        {/* Gradiente para suavizar la lectura visual */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-black/30" />

        {/* BARRA FLOTANTE DE NAVEGACIÓN Y OPCIONES (POR ENCIMA DE LA PORTADA) */}
        <header className="absolute top-4 left-0 right-0 z-20 max-w-5xl mx-auto px-4">
          <div className="bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-2xl p-3 sm:px-6 sm:py-3.5 flex items-center justify-between shadow-2xl">
            
            <div className="flex items-center gap-3">
              {/* BOTÓN ICONO AULA VIRTUAL */}
              <button
                type="button"
                onClick={handleToggleAdmin}
                disabled={vistaActual === 'admin'}
                className={`p-2.5 rounded-xl text-white transition-all duration-300 border flex items-center justify-center shrink-0 ${
                  vistaActual === 'admin'
                    ? 'bg-blue-600/20 border-blue-500/30 opacity-80 cursor-default'
                    : mostrarInputPassword
                    ? 'bg-blue-600/40 border-blue-500/50 shadow-inner'
                    : 'bg-white/5 hover:bg-blue-600/30 hover:border-blue-500/40 border-white/10 cursor-pointer'
                }`}
                title={vistaActual === 'admin' ? 'Modo Administración Activo' : 'Acceso Admin'}
              >
                <GraduationCap className="h-7 w-7 text-white" />
              </button>

              {/* CAMPO DE CONTRASEÑA DESPLAZABLE */}
              <div
                className={`flex items-center overflow-hidden transition-all duration-300 ease-out ${
                  mostrarInputPassword && vistaActual === 'home'
                    ? 'max-w-xs opacity-100 ml-1 mr-2'
                    : 'max-w-0 opacity-0 ml-0 mr-0'
                }`}
              >
                <form onSubmit={handlePasswordSubmit} className="flex items-center gap-2 py-1">
                  <div className="relative flex items-center">
                    <KeyRound className="h-4 w-4 absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                      type="password"
                      placeholder="Clave Admin..."
                      value={passwordInput}
                      onChange={(e) => {
                        setPasswordInput(e.target.value);
                        setErrorAuth(false);
                      }}
                      autoFocus={mostrarInputPassword}
                      className={`pl-9 pr-3 py-1.5 bg-slate-950/80 border text-white text-sm rounded-lg focus:outline-none transition-all w-36 ${
                        errorAuth 
                          ? 'border-red-500 ring-1 ring-red-500' 
                          : 'border-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center shrink-0 shadow-sm"
                    title="Confirmar Clave (Enter)"
                  >
                    <Check className="h-4 w-4" />
                  </button>

                  {errorAuth && (
                    <span className="text-red-400 text-xs font-medium animate-pulse whitespace-nowrap">
                      Incorrecta
                    </span>
                  )}
                </form>
              </div>

              {/* TÍTULO DE LA SECCIÓN */}
              <div className="transition-all duration-300 ease-out">
                <h1 className="text-xl sm:text-2xl font-extrabold text-white leading-tight whitespace-nowrap tracking-wide drop-shadow-sm">
                  {vistaActual === 'admin' ? 'Panel de Administración' : 'Aula Virtual'}
                </h1>
              </div>
            </div>

            {/* BOTÓN SALIR DEL ADMIN */}
            {vistaActual === 'admin' && (
              <button
                onClick={handleSalirAdmin}
                className="flex items-center gap-2 bg-slate-800/80 hover:bg-slate-700/90 text-slate-200 px-4 py-2 rounded-xl text-sm font-medium border border-slate-600/50 transition-colors shadow-sm cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Volver al Aula</span>
              </button>
            )}

          </div>
        </header>

        {/* TÍTULO/MENSAJE DENTRO DE LA PORTADA */}
        <div className="absolute bottom-6 left-0 right-0 max-w-5xl mx-auto px-6 text-white z-10">
          <p className="text-emerald-400 text-xs font-bold uppercase tracking-widest mb-1">
            Plataforma Educativa
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-md">
            {vistaActual === 'admin'
              ? 'Gestión y Carga de Contenidos'
              : 'Bienvenido a tus Clases'}
          </h2>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL ABAJO DE LA PORTADA */}
      <main className="max-w-5xl mx-auto px-4 mt-6">
        {vistaActual === 'admin' ? (
          <AdminForm 
            isAdmin={true} 
            onLogout={handleSalirAdmin}
            onClaseCreada={() => {}} 
          />
        ) : (
          <Home />
        )}
      </main>
    </div>
  );
}
