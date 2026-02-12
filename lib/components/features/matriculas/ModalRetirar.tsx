'use client';

import { useState } from 'react';
import type { Matricula } from '@/lib/types/matricula.types';

interface ModalRetirarProps {
  matricula: Matricula;
  onClose: () => void;
  onConfirm: (id: string, motivo: string) => Promise<void>;
}

export function ModalRetirar({ matricula, onClose, onConfirm }: ModalRetirarProps) {
  const [motivo, setMotivo] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (motivo.trim().length < 10) {
      setError('El motivo debe tener al menos 10 caracteres');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      await onConfirm(matricula.id, motivo);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al retirar estudiante');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <i className="fas fa-user-times"></i>
              Retirar Estudiante
            </h3>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex gap-2 mb-2">
              <i className="fas fa-exclamation-triangle text-red-600 mt-1"></i>
              <div>
                <strong className="text-red-800 text-sm">CONSECUENCIAS:</strong>
                <ul className="text-sm text-red-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Matrícula: ACTIVA → RETIRADA</li>
                  <li>Estudiante: ACTIVO → RETIRADO</li>
                  <li>Ya no aparecerá en listas activas</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estudiante:
            </label>
            <input
              type="text"
              value={matricula.nombres_completos}
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Curso:
            </label>
            <input
              type="text"
              value={
                matricula.curso
                  ? `${matricula.curso.nivel} ${matricula.curso.paralelo} - ${matricula.curso.especialidad}`
                  : '-'
              }
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900"
              readOnly
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo del retiro *
            </label>
            <textarea
              value={motivo}
              onChange={(e) => {
                setMotivo(e.target.value);
                setError('');
              }}
              rows={4}
              placeholder="Describa la razón del retiro (mínimo 10 caracteres)..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              required
            />
            {error && (
              <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                <i className="fas fa-exclamation-circle"></i>
                {error}
              </p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              {motivo.length}/10 caracteres mínimos
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || motivo.trim().length < 10}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Procesando...
                </>
              ) : (
                <>
                  <i className="fas fa-check mr-2"></i>
                  Confirmar Retiro
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}