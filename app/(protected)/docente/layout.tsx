// nextjs-frontend/app/(protected)/docente/layout.tsx

'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { GraduationCap, LogOut, User, ShieldCheck, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Role } from '@/lib/types/usuario.types';

export default function DocenteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { usuario, isAuthenticated, isLoading, logout, initFromStorage } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (!isLoading) {
      // ✅ PERMITIR acceso a DOCENTE O ADMIN
      if (!isAuthenticated || (usuario?.rol !== Role.DOCENTE && usuario?.rol !== Role.ADMIN)) {
        router.replace('/login');
      }
    }
  }, [isLoading, isAuthenticated, usuario, router]);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  // Determinar la ruta activa
  const isCoursesActive = pathname === '/docente';
  const isProfileActive = pathname === '/docente/perfil';

  if (isLoading) {
    return null;
  }

  // ✅ PERMITIR acceso a DOCENTE O ADMIN
  if (!isAuthenticated || (usuario?.rol !== Role.DOCENTE && usuario?.rol !== Role.ADMIN)) {
    return null;
  }

  const esAdmin = usuario?.rol === Role.ADMIN;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER DE DOCENTE (o Admin viendo como docente) */}
      <header className="bg-gray-800 text-white px-8 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
        {/* Header Left */}
        <div className="flex items-center gap-8">
          {/* ✅ Si es admin, mostrar botón de volver */}
          {esAdmin ? (
            <button
              onClick={() => router.push('/admin')}
              className="flex items-center gap-2 hover:bg-gray-700 px-3 py-2 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Volver al Panel Admin</span>
            </button>
          ) : (
            <>
              <Link href="/docente" className="flex items-center">
                <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                  <GraduationCap className="w-6 h-6 text-gray-800" />
                </div>
              </Link>
              <nav>
                <ul className="flex gap-6">
                  <li>
                    <Link 
                      href="/docente" 
                      className={`font-medium pb-1 transition-colors ${
                        isCoursesActive 
                          ? 'text-yellow-400 border-b-2 border-yellow-400' 
                          : 'text-white hover:text-yellow-400'
                      }`}
                    >
                      Mis cursos
                    </Link>
                  </li>
                  <li>
                    <Link 
                      href="/docente/perfil" 
                      className={`font-medium pb-1 transition-colors ${
                        isProfileActive 
                          ? 'text-yellow-400 border-b-2 border-yellow-400' 
                          : 'text-white hover:text-yellow-400'
                      }`}
                    >
                      Mi perfil
                    </Link>
                  </li>
                </ul>
              </nav>
            </>
          )}
        </div>

        {/* Header Right */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-3">
            {/* ✅ Badge especial para admin */}
            {esAdmin && (
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-400 rounded-lg px-3 py-1.5">
                <ShieldCheck className="w-4 h-4 text-red-300" />
                <span className="text-xs font-semibold text-red-200">Modo Vista Admin</span>
              </div>
            )}
            <span className="font-medium text-sm">
              {esAdmin ? 'Admin' : 'Prof.'} {usuario?.email?.split('@')[0] || 'Usuario'}
            </span>
            <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${
              esAdmin ? 'bg-red-400 border-red-400' : 'bg-yellow-400 border-yellow-400'
            }`}>
              <User className="w-5 h-5 text-gray-800" />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </header>

      {/* CONTENIDO */}
      <main>
        {children}
      </main>
    </div>
  );
}