'use client';

import { useState, useRef, useEffect } from 'react';
import { usePeriodos } from '@/lib/hooks/usePeriodos';
import { useMatriculas } from '@/lib/hooks/useMatriculas';
import type {
  ResumenImportacionDto,
  RegistroImportacionDto,
  ResultadoImportacionDto,
} from '@/lib/types/matricula.types';

interface ModalImportarExcelProps {
  onClose: () => void;
  onSuccess: () => void;
}

type Paso = 'seleccionar' | 'vista-previa' | 'procesando' | 'resultado';

export function ModalImportarExcel({ onClose, onSuccess }: ModalImportarExcelProps) {
  const { periodos, fetchPeriodos } = usePeriodos();
  const {
    descargarPlantilla,
    procesarImportacion,
    confirmarImportacion
  } = useMatriculas(); // ✅ USAR HOOK

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [paso, setPaso] = useState<Paso>('seleccionar');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState('');
  const [archivo, setArchivo] = useState<File | null>(null);
  const [resumen, setResumen] = useState<ResumenImportacionDto | null>(null);
  const [resultado, setResultado] = useState<ResultadoImportacionDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ✅ Cargar períodos al montar
  useEffect(() => {
    fetchPeriodos();
  }, [fetchPeriodos]);

  // ✅ FUNCIÓN PARA DESCARGAR PLANTILLA
  const handleDescargarPlantilla = async () => {
    try {
      await descargarPlantilla();
    } catch (err: any) {
      setError('Error al descargar la plantilla');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar extensión
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!['xls', 'xlsx'].includes(extension || '')) {
      setError('Solo se permiten archivos Excel (.xls, .xlsx)');
      return;
    }

    // Validar tamaño (máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('El archivo no debe superar los 5MB');
      return;
    }

    setArchivo(file);
    setError('');
  };

  const handleProcesarArchivo = async () => {
    if (!archivo || !periodoSeleccionado) {
      setError('Debe seleccionar un archivo y un período lectivo');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // ✅ USAR HOOK EN VEZ DE SERVICE DIRECTO
      const resumenData = await procesarImportacion(archivo, periodoSeleccionado);

      setResumen(resumenData);
      setPaso('vista-previa');
    } catch (err: any) {
      setError(err.message || 'Error al procesar el archivo');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmarImportacion = async () => {
    if (!resumen || !periodoSeleccionado) return;

    // ✅ PERMITIR IMPORTAR AUNQUE HAYA INVÁLIDOS
    const registrosParaImportar = resumen.registros.filter(r => r.valido);

    if (!resumen.preview_id) {
      setError('No se encontró el ID de previsualización');
      return;
    }

    setPaso('procesando');
    setLoading(true);

    try {
      // ✅ SOLO ENVIAR REGISTROS VÁLIDOS
      const resultadoData = await confirmarImportacion(
        resumen.preview_id,
        periodoSeleccionado
      );

      setResultado(resultadoData);
      setPaso('resultado');

      // Si hubo importaciones exitosas, notificar al padre
      if (resultadoData.exitosas > 0) {
        setTimeout(() => {
          onSuccess();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message || 'Error al confirmar la importación');
      setPaso('vista-previa');
    } finally {
      setLoading(false);
    }
  };

  const handleReiniciar = () => {
    setPaso('seleccionar');
    setArchivo(null);
    setResumen(null);
    setResultado(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2">
                <i className="fas fa-file-excel"></i>
                Importación Masiva desde Excel
              </h3>
              <p className="text-purple-100 text-sm mt-1">
                {paso === 'seleccionar' && 'Paso 1: Seleccione el archivo Excel'}
                {paso === 'vista-previa' && 'Paso 2: Revise los registros a importar'}
                {paso === 'procesando' && 'Procesando importación...'}
                {paso === 'resultado' && 'Importación completada'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/20 transition-colors"
              disabled={loading}
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Stepper */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso === 'seleccionar'
                    ? 'bg-white text-purple-600'
                    : 'bg-purple-400 text-white'
                  }`}
              >
                1
              </div>
              <span className="text-sm font-medium">Seleccionar</span>
            </div>

            <div className="w-12 h-0.5 bg-purple-400"></div>

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso === 'vista-previa' || paso === 'procesando' || paso === 'resultado'
                    ? paso === 'vista-previa'
                      ? 'bg-white text-purple-600'
                      : 'bg-purple-400 text-white'
                    : 'bg-purple-700 text-purple-300'
                  }`}
              >
                2
              </div>
              <span className="text-sm font-medium">Vista Previa</span>
            </div>

            <div className="w-12 h-0.5 bg-purple-400"></div>

            <div className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${paso === 'resultado'
                    ? 'bg-white text-purple-600'
                    : paso === 'procesando'
                      ? 'bg-yellow-400 text-yellow-900'
                      : 'bg-purple-700 text-purple-300'
                  }`}
              >
                {paso === 'procesando' ? <i className="fas fa-spinner fa-spin"></i> : '3'}
              </div>
              <span className="text-sm font-medium">Resultado</span>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* PASO 1: SELECCIONAR ARCHIVO */}
          {paso === 'seleccionar' && (
            <div className="space-y-6">
              {/* Instrucciones + Descarga de plantilla */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                      <i className="fas fa-info-circle"></i>
                      Formato del archivo Excel
                    </h4>
                    <ul className="text-sm text-blue-800 space-y-1 ml-6 list-disc">
                      <li>Columna A: Número (opcional)</li>
                      <li>Columna B: Año/Nivel (ej: 8vo, OCTAVO, 8)</li>
                      <li>Columna C: Paralelo (ej: A, B, C)</li>
                      <li>Columna D: Especialidad (ej: BÁSICA, CONTABILIDAD)</li>
                      <li>Columna E: Cédula del estudiante (10 dígitos)</li>
                      <li>Columna F: Nombres completos</li>
                      <li>Columna G: Correo institucional (opcional)</li>
                    </ul>
                  </div>
                  {/* ✅ BOTÓN DE DESCARGA */}
                  <button
                    onClick={handleDescargarPlantilla}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 whitespace-nowrap"
                  >
                    <i className="fas fa-download"></i>
                    Descargar Plantilla
                  </button>
                </div>
              </div>

              {/* Selector de período */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Período Lectivo <span className="text-red-500">*</span>
                </label>
                <select
                  value={periodoSeleccionado}
                  onChange={(e) => setPeriodoSeleccionado(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="">Seleccione un período</option>
                  {periodos
                    .filter((p) => p.estado === 'ACTIVO')
                    .map((periodo) => (
                      <option key={periodo.id} value={periodo.id}>
                        {periodo.nombre}
                      </option>
                    ))}
                </select>
              </div>

              {/* Selector de archivo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Archivo Excel <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-purple-500 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xls,.xlsx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <i className="fas fa-cloud-upload-alt text-6xl text-gray-400 mb-4"></i>
                    <span className="text-lg font-medium text-gray-700 mb-2">
                      Click para seleccionar archivo
                    </span>
                    <span className="text-sm text-gray-500">
                      o arrastra y suelta aquí
                    </span>
                    <span className="text-xs text-gray-400 mt-2">
                      Formatos: .xls, .xlsx (máx. 10MB)
                    </span>
                  </label>
                </div>

                {archivo && (
                  <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <i className="fas fa-file-excel text-2xl text-green-600"></i>
                      <div>
                        <p className="font-medium text-green-900">{archivo.name}</p>
                        <p className="text-sm text-green-700">
                          {(archivo.size / 1024).toFixed(2)} KB
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setArchivo(null);
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <i className="fas fa-exclamation-circle text-red-600 mt-0.5"></i>
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}

          {/* PASO 2: VISTA PREVIA */}
          {paso === 'vista-previa' && resumen && (
            <VistaPrevia resumen={resumen} />
          )}

          {/* PASO 3: PROCESANDO */}
          {paso === 'procesando' && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="relative">
                <div className="w-24 h-24 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                <i className="fas fa-file-excel absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-3xl text-purple-600"></i>
              </div>
              <h4 className="text-xl font-bold text-gray-900 mt-6">
                Procesando importación...
              </h4>
              <p className="text-gray-600 mt-2">
                Por favor espere, esto puede tardar unos momentos
              </p>
            </div>
          )}

          {/* PASO 4: RESULTADO */}
          {paso === 'resultado' && resultado && (
            <Resultado resultado={resultado} />
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t">
          {paso === 'seleccionar' && (
            <>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={loading}
              >
                Cancelar
              </button>
              <button
                onClick={handleProcesarArchivo}
                disabled={!archivo || !periodoSeleccionado || loading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Procesando...
                  </>
                ) : (
                  <>
                    Procesar Archivo
                    <i className="fas fa-arrow-right"></i>
                  </>
                )}
              </button>
            </>
          )}

          {paso === 'vista-previa' && resumen && (
            <>
              <button
                onClick={handleReiniciar}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <i className="fas fa-arrow-left mr-2"></i>
                Volver
              </button>
              <div className="flex items-center gap-4">
                {/* ✅ MOSTRAR ADVERTENCIA SI HAY INVÁLIDOS */}
                {resumen.invalidos > 0 && (
                  <p className="text-sm text-yellow-700">
                    <i className="fas fa-exclamation-triangle mr-1"></i>
                    Se importarán solo {resumen.validos} registros válidos
                  </p>
                )}
                <button
                  onClick={handleConfirmarImportacion}
                  disabled={resumen.validos === 0 || loading}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      Importando...
                    </>
                  ) : (
                    <>
                      Confirmar Importación ({resumen.validos})
                      <i className="fas fa-check"></i>
                    </>
                  )}
                </button>
              </div>
            </>
          )}

          {paso === 'resultado' && (
            <>
              <button
                onClick={handleReiniciar}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <i className="fas fa-plus mr-2"></i>
                Nueva Importación
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cerrar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}




// 🔧 COMPONENTE: Vista Previa
function VistaPrevia({ resumen }: { resumen: ResumenImportacionDto }) {
  const [filtro, setFiltro] = useState<'todos' | 'validos' | 'invalidos' | 'existentes'>('todos');

  const registrosFiltrados = resumen.registros.filter((r) => {
    if (filtro === 'validos') return r.valido && !r.ya_matriculado;
    if (filtro === 'invalidos') return !r.valido && !r.ya_matriculado;
    if (filtro === 'existentes') return r.ya_matriculado;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Estadísticas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-900">{resumen.total_registros}</p>
            </div>
            <i className="fas fa-file-alt text-4xl text-blue-300"></i>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Válidos</p>
              <p className="text-3xl font-bold text-green-900">{resumen.validos}</p>
            </div>
            <i className="fas fa-check-circle text-4xl text-green-300"></i>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Inválidos</p>
              <p className="text-3xl font-bold text-red-900">{resumen.invalidos}</p>
            </div>
            <i className="fas fa-times-circle text-4xl text-red-300"></i>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <p className="text-xs text-yellow-600 font-medium">Ya Matriculados</p>
          <p className="text-2xl font-bold text-yellow-700">{resumen.existentes}</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2">
        <button
          onClick={() => setFiltro('todos')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            filtro === 'todos'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Todos ({resumen.total_registros})
        </button>
        <button
          onClick={() => setFiltro('validos')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            filtro === 'validos'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Válidos ({resumen.validos})
        </button>
        <button
          onClick={() => setFiltro('invalidos')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            filtro === 'invalidos'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Inválidos ({resumen.invalidos})
        </button>
        <button
          onClick={() => setFiltro('existentes')}
          className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            filtro === 'existentes'
              ? 'bg-yellow-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Ya Matriculados ({resumen.existentes})
        </button>
      </div>

      {/* Tabla */}
      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto max-h-96">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Fila</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Cédula</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Nombres</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Curso</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {registrosFiltrados.map((registro, idx) => (
                <tr
                  key={idx}
                  className={`${registro.valido ? 'bg-white' : 'bg-red-50'
                    } hover:bg-gray-50`}
                >
                  <td className="px-4 py-2 text-sm">{registro.fila}</td>
                  <td className="px-4 py-2 text-sm font-medium">{registro.cedula}</td>
                  <td className="px-4 py-2 text-sm">{registro.nombres_completos}</td>
                  <td className="px-4 py-2 text-sm">
                    {registro.curso_parseado || (
                      <span className="text-red-600">Sin curso</span>
                    )}
                  </td>
                  <td className="px-4 py-2">
                    {registro.valido ? (
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        ✓ Válido
                      </span>
                    ) : (
                      <div>
                        <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                          ✗ Inválido
                        </span>
                        <div className="text-xs text-red-600 mt-1">
                          {registro.errores.join(', ')}
                        </div>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 🔧 COMPONENTE: Resultado
function Resultado({ resultado }: { resultado: ResultadoImportacionDto }) {
  return (
    <div className="space-y-6">
      {/* Resumen final */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
          <p className="text-sm text-green-600 font-medium mb-1">Exitosas</p>
          <p className="text-3xl font-bold text-green-700">{resultado.exitosas}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
          <p className="text-sm text-red-600 font-medium mb-1">Fallidas</p>
          <p className="text-3xl font-bold text-red-700">{resultado.fallidas}</p>
        </div>
        {/* ✅ NUEVO: Card de Duplicados */}
        <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
          <p className="text-sm text-yellow-600 font-medium mb-1">Duplicados</p>
          <p className="text-3xl font-bold text-yellow-700">{resultado.duplicados}</p>
        </div>
      </div>

      {/* Detalle */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <h4 className="font-semibold text-gray-700 mb-3">Resumen Detallado</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Registros recibidos:</span>
            <span className="font-medium">{resultado.resumen.registros_recibidos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Registros válidos:</span>
            <span className="font-medium text-green-600">{resultado.resumen.registros_validos}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Registros inválidos:</span>
            <span className="font-medium text-red-600">{resultado.resumen.registros_invalidos}</span>
          </div>
          {/* ✅ NUEVO: Mostrar existentes */}
          <div className="flex justify-between">
            <span className="text-gray-600">Ya matriculados:</span>
            <span className="font-medium text-yellow-600">{resultado.resumen.registros_existentes}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Importados:</span>
            <span className="font-medium text-green-600">{resultado.resumen.registros_importados}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Fallidos:</span>
            <span className="font-medium text-red-600">{resultado.resumen.registros_fallidos}</span>
          </div>
        </div>
      </div>

      {/* Tabla de detalles */}
      <div className="max-h-96 overflow-y-auto border rounded-lg">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left">Cédula</th>
              <th className="px-3 py-2 text-left">Nombre</th>
              <th className="px-3 py-2 text-left">Curso</th>
              <th className="px-3 py-2 text-left">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {resultado.detalles.map((detalle, idx) => (
              <tr key={idx}>
                <td className="px-3 py-2 font-mono text-xs">{detalle.cedula}</td>
                <td className="px-3 py-2">{detalle.nombre}</td>
                <td className="px-3 py-2">{detalle.curso}</td>
                <td className="px-3 py-2">
                  {detalle.estado === 'EXITOSO' && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                      Exitoso
                    </span>
                  )}
                  {detalle.estado === 'FALLIDO' && (
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
                        Fallido
                      </span>
                      {detalle.error && (
                        <span className="text-xs text-red-600">{detalle.error}</span>
                      )}
                    </div>
                  )}
                  {/* ✅ NUEVO: Badge de duplicado */}
                  {detalle.estado === 'DUPLICADO' && (
                    <div className="flex flex-col gap-1">
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
                        Duplicado
                      </span>
                      {detalle.error && (
                        <span className="text-xs text-yellow-600">{detalle.error}</span>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}