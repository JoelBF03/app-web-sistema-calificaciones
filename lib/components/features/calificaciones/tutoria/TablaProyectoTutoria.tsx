'use client';

import { useEffect, useState } from 'react';
import { Loader2, Save, Eye, Target } from 'lucide-react';
import { useCalificacionProyecto } from '@/lib/hooks/useCalificacionProyecto';
import { ModalDetalleProyecto } from '@/lib/components/features/calificaciones/ModalDetalleProyecto';
import { ModalEditarDatosPersonales } from './ModalEditarDatosPersonales';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/lib/components/ui/table';
import { toast } from 'sonner';
import { calcularCualitativo, getColorCualitativo } from '@/lib/utils/calificaciones.utils';
import { Role, TrimestreEstado } from '@/lib/types';

interface TablaProyectoTutoriaProps {
    curso_id: string;
    trimestre_id: string;
    estudiantes: Array<{
        id: string;
        nombres_completos: string;
        estudiante: any;
    }>;
    porcentaje: number;
    trimestreEstado?: TrimestreEstado;
}

export function TablaProyectoTutoria({
    curso_id,
    trimestre_id,
    estudiantes,
    porcentaje,
    trimestreEstado
}: TablaProyectoTutoriaProps) {
    const {
        calificaciones,
        isLoading,
        guardarCalificaciones,
        updateCalificacion,
        isSaving,
        isUpdating,
        refetch
    } = useCalificacionProyecto(curso_id, trimestre_id, true);

    const estadoFinalizado = trimestreEstado === TrimestreEstado.FINALIZADO;
    const [notasTemp, setNotasTemp] = useState<Record<string, string>>({});
    const [modalDetalle, setModalDetalle] = useState<{
        open: boolean;
        calificacion_id: string;
        estudiante_nombre: string;
        trimestreEstado?: TrimestreEstado;
    } | null>(null);

    // ✅ Estado para modal de edición de datos
    const [modalEdicion, setModalEdicion] = useState<{
        open: boolean;
        estudiante: any;
    } | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const user = localStorage.getItem('usuario');
        if (user) {
            const parsedUser = JSON.parse(user);
            setIsAdmin(parsedUser.rol === Role.ADMIN);
        }
    }, []);

    const handleGuardar = async () => {
        const estudiantesParaCrear: any[] = [];
        const estudiantesParaActualizar: any[] = [];

        estudiantes.forEach(est => {
            const notaStr = notasTemp[est.id];
            if (!notaStr || notaStr.trim() === '') return;

            const nota = parseFloat(notaStr);
            if (isNaN(nota) || nota < 0 || nota > 10) return;

            const calExistente = calificaciones.find((c: any) => c.estudiante_id === est.id);

            if (calExistente) {
                // ✅ CONVERTIR A NÚMERO ANTES DE COMPARAR
                const notaExistente = Number(calExistente.calificacion_proyecto);
                if (Math.abs(notaExistente - nota) > 0.001) {
                    estudiantesParaActualizar.push({
                        id: calExistente.id,
                        estudiante_id: est.id,
                        calificacion_proyecto: nota
                    });
                }
            } else {
                estudiantesParaCrear.push({
                    estudiante_id: est.id,
                    calificacion_proyecto: nota
                });
            }
        });

        if (estudiantesParaCrear.length === 0 && estudiantesParaActualizar.length === 0) {
            toast.error('No hay calificaciones nuevas o modificadas');
            return;
        }

        if (estudiantesParaCrear.length > 0) {
            guardarCalificaciones({
                curso_id,
                trimestre_id,
                calificaciones: estudiantesParaCrear
            });
        }

        for (const update of estudiantesParaActualizar) {
            updateCalificacion({
                id: update.id,
                data: { calificacion_proyecto: update.calificacion_proyecto }
            });
        }

        setNotasTemp({});
    };

    const handleNotaChange = (estudianteId: string, value: string) => {
        if (value === '') {
            setNotasTemp(prev => ({ ...prev, [estudianteId]: '' }));
            return;
        }

        if (!/^\d*\.?\d{0,2}$/.test(value)) return;

        const numero = parseFloat(value);
        if (!isNaN(numero) && (numero < 0 || numero > 10)) return;

        setNotasTemp(prev => ({ ...prev, [estudianteId]: value }));
    };

    const calcularPonderado = (nota: number) => {
        return (nota * (porcentaje / 100)).toFixed(2);
    };

    if (isLoading) {
        return (
            <div className="flex justify-center p-12">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
            </div>
        );
    }

    const hayDatos = estudiantes.some(est =>
        notasTemp[est.id] || calificaciones.find((c: any) => c.estudiante_id === est.id)
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border-2 border-blue-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500 rounded-full p-2">
                            <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900">Proyecto Integrador</h3>
                            <p className="text-sm text-gray-600">
                                Pondera el <span className="font-bold text-yellow-600">{porcentaje}%</span> del promedio trimestral
                            </p>
                        </div>
                    </div>
                    {!estadoFinalizado && hayDatos && !isAdmin && (
                        <Button
                            onClick={handleGuardar}
                            disabled={isSaving || isUpdating}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold shadow-md hover:shadow-lg cursor-pointer"
                        >
                            {isSaving || isUpdating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Guardando...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Guardar Cambios
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="overflow-x-auto rounded-lg border-2 border-gray-400 bg-card">
                <Table className="border-collapse">
                    <TableHeader>
                        <TableRow className="bg-gray-100 border-b-2 border-gray-400">
                            <TableHead className="text-center w-[60px] min-w-[60px] font-semibold text-gray-900 px-3 border-r-2 border-gray-400">
                                #
                            </TableHead>
                            <TableHead className="w-[400px] min-w-[400px] max-w-[400px] font-semibold text-gray-900 px-4 border-r-2 border-gray-400">
                                Estudiante
                            </TableHead>
                            <TableHead className="border-x-2 border-gray-400 text-center w-[150px] min-w-[150px] font-semibold text-gray-900">
                                Nota /10
                            </TableHead>
                            <TableHead className="border-x-2 border-gray-400 text-center w-[150px] min-w-[150px] font-semibold text-gray-900">
                                Ponderado ({porcentaje}%)
                            </TableHead>
                            <TableHead className="border-x-2 border-gray-400 text-center w-[150px] min-w-[150px] font-semibold text-gray-900">
                                Cualitativo
                            </TableHead>
                            <TableHead className="border-l-2 border-gray-400 text-center w-[120px] min-w-[120px] font-semibold text-gray-900">
                                Detalle
                            </TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {estudiantes.map((estudiante, index) => {
                            const calExistente = calificaciones.find((c: any) => c.estudiante_id === estudiante.id);
                            const notaGuardada = calExistente?.calificacion_proyecto;

                            // ✅ CONVERTIR A NÚMERO PARA CÁLCULOS
                            const notaGuardadaNum = notaGuardada ? Number(notaGuardada) : undefined;

                            const notaActual = notasTemp[estudiante.id] !== undefined
                                ? parseFloat(notasTemp[estudiante.id])
                                : notaGuardadaNum;

                            const notaValida = notaActual !== undefined && !isNaN(notaActual);
                            const ponderado = notaValida ? calcularPonderado(notaActual) : '-';
                            const cualitativo = notaValida ? calcularCualitativo(notaActual) : '-';
                            const colorCualitativo = notaValida ? getColorCualitativo(cualitativo) : 'bg-gray-100 text-gray-400';

                            return (
                                <TableRow key={estudiante.id} className="border-b border-gray-300 hover:bg-yellow-50">
                                    {/* Número */}
                                    <TableCell className="text-center text-gray-500 font-medium px-3 border-r-2 border-gray-400">
                                        {index + 1}
                                    </TableCell>

                                    {/* Nombre del estudiante con hover para editar */}
                                    <TableCell className="font-medium px-4 border-r-2 border-gray-400">
                                        <div
                                            className="flex items-center gap-3 cursor-pointer hover:text-yellow-600 transition-colors group"
                                            onClick={() => setModalEdicion({ open: true, estudiante: estudiante.estudiante })}
                                            title="Click para editar datos personales"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center font-bold text-white text-sm group-hover:scale-110 transition-transform">
                                                {estudiante.nombres_completos.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm group-hover:underline">
                                                {estudiante.nombres_completos}
                                            </span>
                                        </div>
                                    </TableCell>

                                    {/* Nota */}
                                    <TableCell className="border-x border-gray-300 text-center px-2 py-2">
                                        {calExistente ? (
                                            // ✅ SI YA ESTÁ CALIFICADO: MOSTRAR NOTA (NO INPUT)
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`font-semibold text-lg ${Number(notaGuardadaNum) >= 7 ? 'text-green-700' :
                                                    Number(notaGuardadaNum) >= 4 ? 'text-yellow-700' :
                                                        'text-red-700'
                                                    }`}>
                                                    {notaGuardadaNum?.toFixed(2)}
                                                </span>
                                                {cualitativo !== '-' && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border font-semibold ${colorCualitativo}`}>
                                                        {cualitativo}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            // ✅ SI NO ESTÁ CALIFICADO: MOSTRAR INPUT (solo si no está finalizado)
                                            estadoFinalizado ? (
                                                <span className="text-muted-foreground text-sm">Sin calificación</span>
                                            ) : (
                                                <Input
                                                    type="text"
                                                    value={notasTemp[estudiante.id] ?? ''}
                                                    onChange={(e) => handleNotaChange(estudiante.id, e.target.value)}
                                                    placeholder="0.00"
                                                    disabled={estadoFinalizado || isAdmin}
                                                    className="w-full max-w-[100px] mx-auto text-center border-2 border-gray-300 focus:border-yellow-500 rounded-lg"
                                                />
                                            )
                                        )}
                                    </TableCell>

                                    {/* Ponderado */}
                                    <TableCell className="border-x border-gray-300 text-center font-bold text-blue-600 px-2">
                                        {ponderado}
                                    </TableCell>

                                    {/* Cualitativo */}
                                    <TableCell className="border-x border-gray-300 text-center px-2">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${colorCualitativo}`}>
                                            {cualitativo}
                                        </span>
                                    </TableCell>

                                    {/* Detalle */}
                                    <TableCell className="border-l-2 border-gray-400 text-center px-2">
                                        {calExistente ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setModalDetalle({
                                                    open: true,
                                                    calificacion_id: calExistente.id,
                                                    estudiante_nombre: estudiante.nombres_completos,
                                                    trimestreEstado
                                                })}
                                                className="border-blue-600 text-blue-600 hover:bg-blue-50 cursor-pointer"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                Ver
                                            </Button>
                                        ) : (
                                            <span className="text-xs text-gray-400 italic">Sin calificación</span>
                                        )}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            {/* Modal Detalle Proyecto */}
            {modalDetalle && (
                <ModalDetalleProyecto
                    calificacion_id={modalDetalle.calificacion_id}
                    estudiante_nombre={modalDetalle.estudiante_nombre}
                    isTutor={true}
                    open={modalDetalle.open}
                    onClose={() => setModalDetalle(null)}
                    onSuccess={() => {
                        refetch?.();
                    }}  // ✅ VACÍO - El hook maneja el refetch automáticamente
                    trimestreEstado={modalDetalle.trimestreEstado}
                />
            )}

            {/* Modal Editar Datos Personales */}
            {modalEdicion && (
                <ModalEditarDatosPersonales
                    estudiante={modalEdicion.estudiante}
                    onClose={() => setModalEdicion(null)}
                    onSuccess={() => refetch?.()}
                />
            )}
        </div>
    );
}