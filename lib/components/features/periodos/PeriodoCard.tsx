'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Badge } from '@/lib/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/lib/components/ui/accordion';
import { Separator } from '@/lib/components/ui/separator';
import { Skeleton } from '@/lib/components/ui/skeleton';
import {
    Calendar,
    Edit,
    Edit2,
    Save,
    X,
    FileText,
    BookOpen,
    GraduationCap,
    CalendarCheck,
    CalendarX,
    ChevronDown,
    Clock,
    Power,
    CheckCircle2,
    AlertCircle,
    Percent
} from 'lucide-react';
import { PeriodoLectivo, EstadoPeriodo, Trimestre, TrimestreEstado } from '@/lib/types/periodo.types';
import { TipoEvaluacion } from '@/lib/types/tipos-evaluacion.types';
import { trimestresService } from '@/lib/services/periodos';
import { tiposEvaluacionService } from '@/lib/services/tipos-evaluacion';
import { toast } from 'sonner';
import TrimestreCard from './trimestres/TrimestreCard';
import ConfirmUpdatePeriodoDialog from './ConfirmUpdatePeriodoDialog';
import ConfirmCambiarEstadoDialog from './ConfirmCambiarEstadoDialog';
import EditPorcentajesDialog from './EditPorcentajesDialog';

interface PeriodoCardProps {
    periodo: PeriodoLectivo;
    onUpdate: (id: string, data: any) => void;
    onUpdateTrimestre: (trimestreId: string, data: any) => void;
    onCambiarEstado: (id: string) => void;
}

export default function PeriodoCard({
    periodo,
    onUpdate,
    onUpdateTrimestre,
    onCambiarEstado
}: PeriodoCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCambiarEstadoDialog, setShowCambiarEstadoDialog] = useState(false);
    const [showEditPorcentajesDialog, setShowEditPorcentajesDialog] = useState(false);
    const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
    const [tiposEvaluacion, setTiposEvaluacion] = useState<TipoEvaluacion[]>([]);
    const [loadingTrimestres, setLoadingTrimestres] = useState(false);
    const [loadingTipos, setLoadingTipos] = useState(false);
    const [accordionValue, setAccordionValue] = useState<string>('');
    const [editData, setEditData] = useState({
        nombre: periodo.nombre,
        fechaInicio: periodo.fechaInicio,
        fechaFin: periodo.fechaFin,
    });

    const formatDateForInput = (dateString: string) => {
        const date = new Date(dateString);
        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatDateForDisplay = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        });
    };

    const getDuration = () => {
        const inicio = new Date(periodo.fechaInicio);
        const fin = new Date(periodo.fechaFin);
        const diffTime = Math.abs(fin.getTime() - inicio.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const months = Math.round(diffDays / 30);
        return `${months} meses (${diffDays} días)`;
    };

    const getProgressPercentage = () => {
        if (trimestres.length === 0) return 0;

        const trimestresFinalizados = trimestres.filter(
            (t) => t.estado === TrimestreEstado.FINALIZADO
        ).length;

        return Math.round((trimestresFinalizados / trimestres.length) * 100);
    };

    const loadTrimestres = async () => {
        setLoadingTrimestres(true);
        try {
            const data = await trimestresService.getTrimestresByPeriodo(periodo.id);
            setTrimestres(data);
        } catch (error) {
            console.error('Error loading trimestres:', error);
            toast.error('Error al cargar los trimestres');
        } finally {
            setLoadingTrimestres(false);
        }
    };

    const loadTiposEvaluacion = async () => {
        setLoadingTipos(true);
        try {
            const data = await tiposEvaluacionService.getByPeriodo(periodo.id);
            setTiposEvaluacion(data);
        } catch (error) {
            console.error('Error loading tipos evaluacion:', error);
            toast.error('Error al cargar los tipos de evaluación');
        } finally {
            setLoadingTipos(false);
        }
    };

    const handleAccordionChange = (value: string) => {
        setAccordionValue(value);
        if (value === 'trimestres' && trimestres.length === 0) {
            loadTrimestres();
        } else if (value === 'evaluacion' && tiposEvaluacion.length === 0) {
            loadTiposEvaluacion();
        }
    };

    // Cargar trimestres al montar el componente para calcular el progreso correcto
    useEffect(() => {
        loadTrimestres();
    }, [periodo.id]);

    useEffect(() => {
        setEditData({
            nombre: periodo.nombre,
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin,
        });
    }, [periodo]);

    const getChanges = () => {
        const changes: any = {};
        if (editData.nombre !== periodo.nombre) changes.nombre = editData.nombre;
        if (editData.fechaInicio !== periodo.fechaInicio) changes.fechaInicio = editData.fechaInicio;
        if (editData.fechaFin !== periodo.fechaFin) changes.fechaFin = editData.fechaFin;
        return changes;
    };

    const handleSave = () => {
        if (new Date(editData.fechaFin) <= new Date(editData.fechaInicio)) {
            toast.error('La fecha de fin debe ser posterior a la fecha de inicio');
            return;
        }

        const changes = getChanges();
        if (Object.keys(changes).length === 0) {
            toast.info('No se han detectado cambios');
            setIsEditing(false);
            return;
        }

        setShowConfirmDialog(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const changes = getChanges();
            await onUpdate(periodo.id, changes);

            setShowConfirmDialog(false);
            setIsEditing(false);

            if (accordionValue === 'trimestres') {
                setTimeout(() => loadTrimestres(), 500);
            }
        } catch (error: any) {
            console.error('Error updating periodo:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar el período');
            setShowConfirmDialog(false);
        }
    };

    const handleCambiarEstado = () => {
        setShowCambiarEstadoDialog(true);
    };

    const handleConfirmCambiarEstado = async () => {
        try {
            await onCambiarEstado(periodo.id);
            setShowCambiarEstadoDialog(false);

            setTimeout(() => loadTrimestres(), 500);
        } catch (error: any) {
            console.error('Error changing estado:', error);
            toast.error(error.response?.data?.message || 'Error al cambiar estado');
            setShowCambiarEstadoDialog(false);
        }
    };

    const handleCancel = () => {
        setEditData({
            nombre: periodo.nombre,
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin,
        });
        setIsEditing(false);
    };

    const isActive = periodo.estado === EstadoPeriodo.ACTIVO;
    const progressValue = getProgressPercentage();

    const getEvaluacionIcon = (nombre: string) => {
        if (nombre.includes('INSUMO')) return FileText;
        if (nombre.includes('PROYECTO')) return BookOpen;
        if (nombre.includes('EXAMEN')) return GraduationCap;
        return Percent;
    };

    return (
        <>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
                {/* Header con gradiente mejorado */}
                <CardHeader className={`pb-4 ${isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-500 to-slate-500'}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <CalendarCheck className="h-6 w-6 text-white" />
                                {!isEditing ? (
                                    <CardTitle className="text-white text-2xl font-bold">
                                        {periodo.nombre}
                                    </CardTitle>
                                ) : (
                                    <Input
                                        value={editData.nombre}
                                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                                        className="flex-1 bg-white text-gray-900 font-bold text-xl border-2 border-white/50"
                                        placeholder="Nombre del período"
                                    />
                                )}
                            </div>

                            <div className="flex items-center gap-4 text-white/90 text-sm">
                                {!isEditing ? (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            <span className="font-medium">
                                                {formatDateForDisplay(periodo.fechaInicio)} - {formatDateForDisplay(periodo.fechaFin)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4" />
                                            <span>{getDuration()}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="grid grid-cols-2 gap-4 flex-1">
                                        <div>
                                            <Label className="text-white/80 text-xs mb-1">Fecha Inicio</Label>
                                            <Input
                                                type="date"
                                                value={formatDateForInput(editData.fechaInicio)}
                                                onChange={(e) => setEditData({ ...editData, fechaInicio: e.target.value })}
                                                className="bg-white border-2 border-white/50"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-white/80 text-xs mb-1">Fecha Fin</Label>
                                            <Input
                                                type="date"
                                                value={formatDateForInput(editData.fechaFin)}
                                                onChange={(e) => setEditData({ ...editData, fechaFin: e.target.value })}
                                                className="bg-white border-2 border-white/50"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {!isEditing ? (
                                <>
                                    <Badge className={`${isActive ? 'bg-white text-green-700 border-white' : 'bg-white text-gray-700 border-white'} border-2 px-3 py-1`}>
                                        {isActive ? (
                                            <><CheckCircle2 className="h-3 w-3 mr-1" /> Activo</>
                                        ) : (
                                            <><CalendarX className="h-3 w-3 mr-1" /> Finalizado</>
                                        )}
                                    </Badge>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => setIsEditing(true)}
                                        className="text-white hover:bg-white/20 h-9 w-9 p-0"
                                    >
                                        <Edit2 className="h-4 w-4" />
                                    </Button>
                                </>
                            ) : null}
                        </div>
                    </div>

                    {/* Barra de progreso mejorada */}
                    {!isEditing && (
                        <div className="mt-4">
                            <div className="flex items-center justify-between text-white/90 text-sm mb-2">
                                <span className="font-medium">Progreso de Trimestres</span>
                                <span className="font-bold">{progressValue}%</span>
                            </div>
                            <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                                <div
                                    className="bg-white h-full transition-all duration-500 rounded-full shadow-lg"
                                    style={{ width: `${progressValue}%` }}
                                />
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-white/80 text-xs">
                                <CheckCircle2 className="h-3 w-3" />
                                <span>
                                    {trimestres.filter(t => t.estado === TrimestreEstado.FINALIZADO).length} de {trimestres.length} trimestres finalizados
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Botones de acción en modo edición */}
                    {isEditing && (
                        <div className="mt-6 space-y-3">
                            {/* Botones principales de edición */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="flex-1 bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 hover:border-white/50"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="flex-1 bg-white text-gray-900 hover:bg-white/90 font-semibold border-2 border-white shadow-lg"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar
                                </Button>
                            </div>

                            {/* Solo mostrar opción de finalizar si está ACTIVO */}
                            {isActive && (
                                <>
                                    <Separator className="bg-white/20" />
                                    <Button
                                        onClick={handleCambiarEstado}
                                        variant="destructive"
                                        className="w-full bg-red-600 hover:bg-red-700 border-2 border-red-400 text-white font-semibold shadow-lg"
                                    >
                                        <Power className="mr-2 h-4 w-4" />
                                        Finalizar Período Lectivo
                                    </Button>
                                    <p className="text-white/70 text-xs text-center -mt-2">
                                        Esta acción es irreversible. Se finalizarán matrículas y actualizarán estados.
                                    </p>
                                </>
                            )}
                        </div>
                    )}

                </CardHeader>

                {/* Contenido - Solo visible si NO está editando */}
                {!isEditing && (
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible value={accordionValue} onValueChange={handleAccordionChange}>
                            {/* Trimestres */}
                            <AccordionItem value="trimestres" className="border-none">
                                <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <CalendarCheck className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div className="text-left">
                                            <p className="font-semibold text-gray-900">Trimestres</p>
                                            <p className="text-sm text-gray-500">
                                                {trimestres.length > 0
                                                    ? `${trimestres.filter(t => t.estado === TrimestreEstado.FINALIZADO).length}/${trimestres.length} finalizados`
                                                    : 'Gestiona los trimestres del período'}
                                            </p>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-6 py-4 bg-gray-50/50">
                                    {loadingTrimestres ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-48 w-full" />
                                            ))}
                                        </div>
                                    ) : trimestres.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {trimestres.map((trimestre) => (
                                                <TrimestreCard
                                                    key={trimestre.id}
                                                    trimestre={trimestre}
                                                    onUpdate={onUpdateTrimestre}
                                                    onReload={loadTrimestres}
                                                />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                            <p>No hay trimestres disponibles</p>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>

                            <Separator />

                            {/* Tipos de Evaluación */}


                            <AccordionItem value="evaluacion" className="border-none">
                                {/* Wrapper personalizado para el header con botón */}
                                <div className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors border-b">
                                    <AccordionTrigger className="flex-1 py-0 hover:no-underline">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <Percent className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900">Porcentajes de Evaluación</p>
                                                <p className="text-sm text-gray-500">
                                                    {tiposEvaluacion.length > 0
                                                        ? 'Configuración de ponderación'
                                                        : 'Ver distribución de calificaciones'}
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>

                                    {/* Botón de editar FUERA del AccordionTrigger */}
                                    {tiposEvaluacion.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowEditPorcentajesDialog(true);
                                            }}
                                            className="hover:bg-purple-100 text-purple-600 ml-2"
                                        >
                                            <Edit className="h-4 w-4 mr-1" />
                                            Editar
                                        </Button>
                                    )}
                                </div>

                                <AccordionContent className="px-6 py-4 bg-gray-50/50">
                                    {loadingTipos ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {[1, 2, 3].map((i) => (
                                                <Skeleton key={i} className="h-24 w-full" />
                                            ))}
                                        </div>
                                    ) : tiposEvaluacion.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            {tiposEvaluacion.map((tipo) => {
                                                const Icon = getEvaluacionIcon(tipo.nombre);
                                                const colorClass = tipo.nombre.includes('INSUMO')
                                                    ? 'from-red-500 to-red-600'
                                                    : tipo.nombre.includes('PROYECTO')
                                                        ? 'from-yellow-500 to-yellow-600'
                                                        : 'from-gray-700 to-gray-800';

                                                return (
                                                    <Card key={tipo.id} className="border-2 hover:shadow-md transition-shadow">
                                                        <CardContent className="p-4">
                                                            <div className="flex items-center gap-3 mb-3">
                                                                <div className={`p-2 bg-gradient-to-br ${colorClass} rounded-lg`}>
                                                                    <Icon className="h-5 w-5 text-white" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-700">
                                                                        {tipo.nombre.replace('_', ' ')}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="text-center py-3 bg-gray-50 rounded-lg border-2 border-gray-200">
                                                                <p className="text-3xl font-bold text-gray-900">
                                                                    {tipo.porcentaje}%
                                                                </p>
                                                            </div>
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-gray-500">
                                            <AlertCircle className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                                            <p>No hay tipos de evaluación configurados</p>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    </CardContent>
                )}
            </Card>

            <ConfirmUpdatePeriodoDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmUpdate}
                periodo={periodo}
                changes={getChanges()}
                originalData={periodo}
            />

            <ConfirmCambiarEstadoDialog
                isOpen={showCambiarEstadoDialog}
                onClose={() => setShowCambiarEstadoDialog(false)}
                onConfirm={handleConfirmCambiarEstado}
                periodo={periodo}
                trimestres={trimestres}
            />

            <EditPorcentajesDialog
                isOpen={showEditPorcentajesDialog}
                onClose={() => setShowEditPorcentajesDialog(false)}
                periodoId={periodo.id}
                tiposEvaluacion={tiposEvaluacion}
                onSuccess={() => {
                    loadTiposEvaluacion();
                }}
            />
        </>
    );
}