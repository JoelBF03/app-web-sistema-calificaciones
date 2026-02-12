'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store/auth-store';
import { Role } from '@/lib/types';
import { 
  LogOut, 
  User, 
  Settings, 
  LayoutDashboard,
  GraduationCap
} from 'lucide-react';

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
      if (!isAuthenticated || usuario?.rol !== Role.ADMIN) {
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
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!isAuthenticated || usuario?.rol !== Role.ADMIN) return null;

  return (
    <div className="min-h-screen bg-[#F4F7FE]">
      <header className="bg-[#0F172A] text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            
            <div className="flex items-center gap-4">
              <div className="bg-blue-600 p-2 rounded-xl shadow-lg shadow-blue-900/20">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-bold tracking-tight leading-none">
                  Unidad Educativa Cinco de Junio
                </h1>
                <span className="text-[11px] text-blue-400 font-bold uppercase tracking-widest mt-1">
                  Sistema de Gestión Académica
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:gap-6">
              <div className="hidden md:flex items-center gap-3 border-r border-slate-700 pr-6">
                <div className="flex flex-col text-right">
                  <span className="text-xs font-bold text-white uppercase">Administrador</span>
                  <span className="text-[10px] text-slate-400 font-medium">{usuario?.email}</span>
                </div>
                <div className="h-9 w-9 bg-slate-800 rounded-full flex items-center justify-center border border-slate-700">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-[#E11D48] hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all font-bold text-sm shadow-lg shadow-red-900/20 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>

          </div>
        </div>
      </header>

      <div className="bg-white border-b border-slate-200 py-3 mb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
            <LayoutDashboard className="w-4 h-4 text-blue-600" />
            <span className="uppercase tracking-wider">Panel de Control</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="animate-in fade-in slide-in-from-top-4 duration-700">
          {children}
        </div>
      </main>
    </div>
  );
}