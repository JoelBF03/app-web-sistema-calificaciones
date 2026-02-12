'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../lib/store/auth-store';
import { Role } from '@/lib/types';

export default function Home() {
  const { usuario, isAuthenticated, isLoading, initFromStorage } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    initFromStorage();
  }, [initFromStorage]);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login');
      } else if (usuario?.rol === Role.ADMIN) {
        router.replace('/admin');
      } else if (usuario?.rol === Role.DOCENTE) {
        router.replace('/docente');
      }
    }
  }, [isLoading, isAuthenticated, usuario, router]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm z-50">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-200 text-center max-w-sm">

          <div className="relative w-12 h-12 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"></div>
            <div className="absolute inset-0 rounded-full border-4 border-red-600 border-r-transparent animate-spin [animation-duration:1.5s]"></div>
            <div className="absolute inset-0 rounded-full border-4 border-blue-900 border-b-transparent animate-spin [animation-duration:2s]"></div>
          </div>

          <h2 className="text-xl font-bold text-blue-900 mb-2">
            Verificando sesión...
          </h2>
          <p className="text-sm text-gray-600">
            Por favor espera un momento
          </p>
        </div>
      </div>
    );
  }

  return null;
}