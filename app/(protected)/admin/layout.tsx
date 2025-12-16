// app/admin/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Role } from '@/lib/types';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, isAuthenticated, isLoading, logout, initFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || usuario?.rol !== 'ADMIN') {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, usuario, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-yellow-50">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          <span className="text-red-600 font-medium">Cargando...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || usuario?.rol !== Role.ADMIN) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-red-50">
      {/* HEADER MEJORADO */}
      <header className="bg-white shadow-lg border-b-2 border-red-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            
            {/* Logo y navegación */}
            <div className="flex items-center">
              <div className="flex items-center gap-4">
                {/* Logo mejorado */}
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center text-white text-xl font-bold shadow-lg">
                    🎓
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white"></div>
                </div>
                
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Unidad Educativa Cinco de Junio 
                  </h1>
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-red-100 to-red-200 text-red-800 text-xs font-semibold px-3 py-1 rounded-full border border-red-300">
                      Panel de Administración
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Usuario y logout mejorado */}
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center text-white font-bold">
                  👤
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">Administrador</p>
                  <p className="text-xs text-gray-500">{usuario?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="group flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-2.5 rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5 cursor-pointer"
              >
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* CONTENIDO */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}