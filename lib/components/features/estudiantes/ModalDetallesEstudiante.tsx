import { useState } from 'react';
import { EstadoEstudiante, Estudiante } from '@/lib/types/estudiante.types';
import { X, User, Users, UserCheck, History, Edit, UserX, Download } from 'lucide-react';
import { Button } from '@/lib/components/ui/button';
import { Card } from '@/lib/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/lib/components/ui/tabs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { EspecialidadCurso } from '@/lib/types';
import { EstadoBadge } from './badges/EstadoBadge';
import { reportesService } from '@/lib/services/reportes.services';
import { toast } from 'sonner';

interface ModalDetallesEstudianteProps {
  estudiante: Estudiante;
  onClose: () => void;
  onEditar: () => void;
  onRetirar: () => void;
}

export function ModalDetallesEstudiante({
  estudiante,
  onClose,
  onEditar,
  onRetirar,
}: ModalDetallesEstudianteProps) {
  const [activeTab, setActiveTab] = useState('datos-personales');
  const [descargando, setDescargando] = useState<string | null>(null);


  const formatearFecha = (fecha?: string) => {
    if (!fecha) return 'No registrado';
    try {
      return format(new Date(fecha), "d 'de' MMMM, yyyy", { locale: es });
    } catch {
      return fecha;
    }
  };

  const calcularEdad = (fecha?: string) => {
    if (!fecha) return null;
    const nacimiento = new Date(fecha);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
      edad--;
    }
    return edad;
  };

  const handleDescargarLibreta = async (matriculaId: string, periodoNombre: string) => {
    try {
      setDescargando(matriculaId);
      await reportesService.descargarLibretaHistorica(matriculaId);
      toast.success(`Libreta de ${periodoNombre} descargada exitosamente`);
    } catch (error) {
      console.error('Error al descargar libreta:', error);
      toast.error('Error al descargar la libreta. Intente nuevamente.');
    } finally {
      setDescargando(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <User className="w-5 h-5" />
            Información del Estudiante
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-white hover:bg-blue-800"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex-1 overflow-y-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="bg-gray-50 border-b px-6 sticky top-0 z-10">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="datos-personales" className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Datos Personales
                </TabsTrigger>
                <TabsTrigger value="padres" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Padres
                </TabsTrigger>
                <TabsTrigger value="representante" className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4" />
                  Representante
                </TabsTrigger>
                <TabsTrigger value="historial" className="flex items-center gap-2">
                  <History className="w-4 h-4" />
                  Historial
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* TAB: Datos Personales */}
              <TabsContent value="datos-personales" className="mt-0 space-y-6">
                <Card className="overflow-hidden">
                  <div className="bg-blue-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Datos Personales
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Cédula</label>
                      <p className="font-semibold text-gray-900 text-lg mt-1">{estudiante.estudiante_cedula}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Nombre Completo</label>
                      <p className="font-semibold text-gray-900 text-lg mt-1">{estudiante.nombres_completos}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Fecha de Nacimiento</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {formatearFecha(estudiante.fecha_de_nacimiento)}
                        {estudiante.fecha_de_nacimiento && (
                          <span className="text-gray-500 text-sm ml-2">
                            ({calcularEdad(estudiante.fecha_de_nacimiento)} años)
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Email</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.estudiante_email || <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 uppercase font-semibold">Dirección</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.direccion || <span className="text-gray-400">No registrada</span>}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <div className="flex items-center gap-2">
                    <EstadoBadge estado={estudiante.estado} />
                    <span className={`text-sm font-semibold ${estudiante.estado === EstadoEstudiante.ACTIVO ? 'text-green-700' :
                      estudiante.estado === EstadoEstudiante.INACTIVO_TEMPORAL ? 'text-gray-700' :
                        estudiante.estado === EstadoEstudiante.RETIRADO ? 'text-red-700' :
                          'text-gray-700'
                      }`}>
                      {estudiante.estado === EstadoEstudiante.ACTIVO && 'Activo'}
                      {estudiante.estado === EstadoEstudiante.INACTIVO_TEMPORAL && 'Inactivo Temporal'}
                      {estudiante.estado === EstadoEstudiante.SIN_MATRICULA && 'Sin Matrícula'}
                      {estudiante.estado === EstadoEstudiante.GRADUADO && 'Graduado'}
                      {estudiante.estado === EstadoEstudiante.RETIRADO && 'Retirado'}
                    </span>
                  </div>
                </div>
                {estudiante.estado === EstadoEstudiante.INACTIVO_TEMPORAL && (
                  <p className="text-xs text-gray-500 mt-2">
                    ℹ️ Este estudiante aparece en listas pero no puede ser calificado. Es excluido de validaciones de cierre de trimestre.
                  </p>
                )}
              </div>

              {/* TAB: Padres */}
              <TabsContent value="padres" className="mt-0 space-y-6">
                {/* Padre */}
                <Card className="overflow-hidden">
                  <div className="bg-green-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-green-600" />
                      Datos del Padre
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-3 gap-6">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Nombre</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.padre_nombre || <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Apellido</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.padre_apellido || <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Cédula</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.padre_cedula || <span className="text-gray-400">No registrada</span>}
                      </p>
                    </div>
                  </div>
                </Card>

                {/* Madre */}
                <Card className="overflow-hidden">
                  <div className="bg-pink-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-pink-600" />
                      Datos de la Madre
                    </h3>
                  </div>
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-3 gap-6">
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Nombre</label>
                        <p className="font-semibold text-gray-900 mt-1">
                          {estudiante.madre_nombre || <span className="text-gray-400">No registrado</span>}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Apellido</label>
                        <p className="font-semibold text-gray-900 mt-1">
                          {estudiante.madre_apellido || <span className="text-gray-400">No registrado</span>}
                        </p>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 uppercase font-semibold">Cédula</label>
                        <p className="font-semibold text-gray-900 mt-1">
                          {estudiante.madre_cedula || <span className="text-gray-400">No registrada</span>}
                        </p>
                      </div>
                    </div>
                    {estudiante.viven_juntos !== undefined && (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${estudiante.viven_juntos ? 'bg-green-500' : 'bg-gray-400'}`} />
                          <span className="font-semibold text-gray-900">
                            {estudiante.viven_juntos ? 'Los padres viven juntos' : 'Los padres no viven juntos'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* TAB: Representante */}
              <TabsContent value="representante" className="mt-0 space-y-6">
                <Card className="overflow-hidden">
                  <div className="bg-purple-50 px-4 py-3 border-b">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-purple-600" />
                      Datos del Representante
                    </h3>
                  </div>
                  <div className="p-6 grid grid-cols-2 gap-6">
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Nombre Completo</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.representante_nombre && estudiante.representante_apellido
                          ? `${estudiante.representante_nombre} ${estudiante.representante_apellido}`
                          : <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Parentesco</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.representante_parentesco || <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Teléfono Principal</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.representante_telefono || <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 uppercase font-semibold">Teléfono Auxiliar</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.representante_telefono_auxiliar || <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-gray-500 uppercase font-semibold">Correo Electrónico</label>
                      <p className="font-semibold text-gray-900 mt-1">
                        {estudiante.representante_correo || <span className="text-gray-400">No registrado</span>}
                      </p>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              {/* TAB: Historial */}
              <TabsContent value="historial" className="mt-0 space-y-6">
                {estudiante.matriculas && estudiante.matriculas.length > 0 ? (
                  <Card className="overflow-hidden">
                    <div className="bg-orange-50 px-4 py-3 border-b">
                      <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                        <History className="w-4 h-4 text-orange-600" />
                        Historial de Matrículas ({estudiante.matriculas.length})
                      </h3>
                    </div>
                    <div className="p-6 space-y-4">
                      {estudiante.matriculas.map((matricula) => (
                        <div
                          key={matricula.id}
                          className={`p-4 border rounded-lg ${matricula.estado === 'ACTIVO'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-gray-50 border-gray-200'
                            }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-2 flex-1">
                              <p className="font-bold text-gray-900 text-lg">
                                {matricula.periodo_lectivo?.nombre || 'Período no disponible'}
                              </p>
                              <p className="font-semibold text-gray-700">
                                {matricula.curso?.nivel || 'N/A'} "{matricula.curso?.paralelo || 'N/A'}"
                                {matricula.curso?.especialidad && matricula.curso.especialidad !== EspecialidadCurso.BASICA && (
                                  <span className="text-purple-600"> - {matricula.curso.especialidad}</span>
                                )}
                              </p>
                              <p className="text-sm text-gray-600">
                                Matrícula N° {matricula.numero_de_matricula}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${matricula.estado === 'ACTIVO'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                                }`}
                            >
                              {matricula.estado}
                            </span>
                            {/* 🆕 Botón de descarga */}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDescargarLibreta(
                                matricula.id,
                                matricula.periodo_lectivo?.nombre || 'Período'
                              )}
                              disabled={descargando === matricula.id}
                              className="gap-2 hover:bg-purple-50 hover:border-purple-300"
                            >
                              {descargando === matricula.id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                                  Descargando...
                                </>
                              ) : (
                                <>
                                  <Download className="w-4 h-4" />
                                  Libreta
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                ) : (
                  <div className="text-center py-12">
                    <History className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 font-semibold">Sin historial de matrículas</p>
                    <p className="text-gray-500 text-sm mt-2">
                      Este estudiante no tiene matrículas registradas
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Footer con botones */}
        <div className="bg-gray-50 px-6 py-4 border-t flex justify-end gap-3 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button
            variant="default"
            onClick={onEditar}
            className="bg-green-600 hover:bg-green-700"
          >
            <Edit className="w-4 h-4 mr-2" />
            Editar Información
          </Button>
          {estudiante.estado === 'ACTIVO' && (
            <Button variant="destructive" onClick={onRetirar}>
              <UserX className="w-4 h-4 mr-2" />
              Retirar Estudiante
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}