'use client';

import Link from 'next/link';

export default function SecretariaPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">
          Dashboard Secretaría
        </h1>
        <p className="text-gray-600">
          Bienvenida al panel de administración de secretaría
        </p>
      </div>

      {/* Módulos disponibles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/secretaria/matriculas"
          className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:scale-105"
        >
          <div className="text-5xl mb-4">📝</div>
          <h3 className="text-2xl font-bold mb-2">Matrículas</h3>
          <p className="text-blue-100">
            Gestionar matrículas de estudiantes
          </p>
        </Link>
      </div>
    </div>
  );
}