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
    Clock,
    Power,
    CheckCircle2,
    AlertCircle,
    Percent,
    BookCheck,
    Lock,
    RotateCcw,
    AlertTriangle
} from 'lucide-react';
import { PeriodoLectivo, EstadoPeriodo, Trimestre, TrimestreEstado, EstadoSupletorio } from '@/lib/types/periodo.types';
import { TipoEvaluacion } from '@/lib/types/tipos-evaluacion.types';
import { periodosService, trimestresService } from '@/lib/services/periodos';
import { tiposEvaluacionService } from '@/lib/services/tipos-evaluacion';
import { toast } from 'sonner';
import TrimestreCard from './trimestres/TrimestreCard';
import ConfirmUpdatePeriodoDialog from './ConfirmUpdatePeriodoDialog';
import ConfirmCambiarEstadoDialog from './ConfirmCambiarEstadoDialog';
import EditPorcentajesDialog from './EditPorcentajesDialog';
import ConfirmUpdateSupletoriosDialog from './ConfirmUpdateSupletoriosDialog';

interface PeriodoCardProps {
    periodo: PeriodoLectivo;
    onUpdate: (id: string, data: any) => void;
    onUpdateTrimestre: (trimestreId: string, data: any) => Promise<void>;
    onCambiarEstado: (id: string) => void;
    onActivarSupletorios?: (id: string) => void;
    onCerrarSupletorios?: (id: string) => void;
    onReabrirSupletorios?: (id: string) => void;
}

export default function PeriodoCard({
    periodo,
    onUpdate,
    onUpdateTrimestre,
    onCambiarEstado,
    onActivarSupletorios,
    onCerrarSupletorios,
    onReabrirSupletorios
}: PeriodoCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [showCambiarEstadoDialog, setShowCambiarEstadoDialog] = useState(false);
    const [showEditPorcentajesDialog, setShowEditPorcentajesDialog] = useState(false);
    const [showConfirmSupletoriosDialog, setShowConfirmSupletoriosDialog] = useState(false);
    const [nuevoEstadoSupletorio, setNuevoEstadoSupletorio] = useState<EstadoSupletorio | null>(null);
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
            toast.error(error.response?.data?.message || 'Error al actualizar el período');
            setShowConfirmDialog(false);
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

    const handleSolicitarCambioSupletorio = (nuevoEstado: EstadoSupletorio) => {
        setNuevoEstadoSupletorio(nuevoEstado);
        setShowConfirmSupletoriosDialog(true);
    };

    const handleConfirmCambioSupletorio = async () => {
        if (!nuevoEstadoSupletorio) return;

        try {
            switch (nuevoEstadoSupletorio) {
                case EstadoSupletorio.ACTIVADO:
                    if (periodo.estado_supletorio === EstadoSupletorio.PENDIENTE && onActivarSupletorios) {
                        await onActivarSupletorios(periodo.id);
                    } else if (periodo.estado_supletorio === EstadoSupletorio.CERRADO && onReabrirSupletorios) {
                        await onReabrirSupletorios(periodo.id);
                    }
                    break;
                case EstadoSupletorio.CERRADO:
                    if (onCerrarSupletorios) {
                        await onCerrarSupletorios(periodo.id);
                    }
                    break;
                case EstadoSupletorio.PENDIENTE:
                    if (periodo.estado_supletorio === EstadoSupletorio.ACTIVADO) {
                        // Llamar al nuevo endpoint que elimina datos
                        await periodosService.regresarSupletoriosPendiente(periodo.id);
                        toast.success('Supletorios regresados a PENDIENTE. Se eliminaron las calificaciones registradas.');
                    }
                    break;
            }

            setShowConfirmSupletoriosDialog(false);
            setNuevoEstadoSupletorio(null);
            window.location.reload();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al cambiar el estado de supletorios');
        }
    };

    const isActive = periodo.estado === EstadoPeriodo.ACTIVO;
    const finalizado = periodo.estado === EstadoPeriodo.FINALIZADO;

    const supletoriosPendientes = periodo.estado_supletorio === EstadoSupletorio.PENDIENTE;
    const supletoriosActivos = periodo.estado_supletorio === EstadoSupletorio.ACTIVADO;
    const supletoriosCerrados = periodo.estado_supletorio === EstadoSupletorio.CERRADO;

    const progressValue = getProgressPercentage();
    const todosTrimestresFinalizados = trimestres.length === 3 &&
        trimestres.every(t => t.estado === TrimestreEstado.FINALIZADO);

    const getEvaluacionIcon = (nombre: string) => {
        if (nombre.includes('INSUMO')) return FileText;
        if (nombre.includes('PROYECTO')) return BookOpen;
        if (nombre.includes('EXAMEN')) return GraduationCap;
        return Percent;
    };

    const getHeaderColor = () => {
        if (finalizado) return 'from-gray-500 to-slate-500';
        if (supletoriosActivos) return 'from-orange-500 to-amber-500';
        if (supletoriosCerrados) return 'from-amber-600 to-yellow-600';
        return 'from-green-500 to-emerald-500';
    };

    return (
        <>
            <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2">
                <CardHeader className={`pb-4 bg-gradient-to-r ${getHeaderColor()}`}>
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                                <CalendarCheck className="h-6 w-6 text-white" />
                                <CardTitle className="text-white text-2xl font-bold">
                                    {periodo.nombre}
                                </CardTitle>
                            </div>

                            <div className="flex items-center gap-4 text-white/90 text-sm">
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
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Badge className={`${finalizado ? 'bg-white text-gray-700' :
                                supletoriosActivos ? 'bg-white text-orange-700' :
                                    supletoriosCerrados ? 'bg-white text-amber-700' :
                                        'bg-white text-green-700'
                                } border-2 border-white px-3 py-1`}>
                                {finalizado && <><CalendarX className="h-3 w-3 mr-1" /> Finalizado</>}
                                {!finalizado && supletoriosActivos && <><BookCheck className="h-3 w-3 mr-1" /> Supletorios Activos</>}
                                {!finalizado && supletoriosCerrados && <><Lock className="h-3 w-3 mr-1" /> Supletorios Cerrados</>}
                                {!finalizado && supletoriosPendientes && <><CheckCircle2 className="h-3 w-3 mr-1" /> Activo</>}
                            </Badge>
                            {!finalizado && !isEditing && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                    className="text-white hover:bg-white/20 h-9 w-9 p-0"
                                >
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>

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
                </CardHeader>

                {isEditing && (
                    <CardContent className="p-6 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <Edit className="h-5 w-5 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900">Datos del Período</h3>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <Label className="text-gray-700 font-medium">Nombre del Período</Label>
                                    <Input
                                        value={editData.nombre}
                                        onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                                        className="mt-1 border-2 border-gray-300 focus:border-blue-500"
                                        placeholder="Ej: 2025-2026"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-gray-700 font-medium">Fecha de Inicio</Label>
                                        <Input
                                            type="date"
                                            value={formatDateForInput(editData.fechaInicio)}
                                            onChange={(e) => setEditData({ ...editData, fechaInicio: e.target.value })}
                                            className="mt-1 border-2 border-gray-300 focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-gray-700 font-medium">Fecha de Fin</Label>
                                        <Input
                                            type="date"
                                            value={formatDateForInput(editData.fechaFin)}
                                            onChange={(e) => setEditData({ ...editData, fechaFin: e.target.value })}
                                            className="mt-1 border-2 border-gray-300 focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <Button
                                    variant="outline"
                                    onClick={handleCancel}
                                    className="border-2 border-gray-300 hover:bg-gray-50"
                                >
                                    <X className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Cambios
                                </Button>
                            </div>
                        </div>

                        <Separator />

                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <Power className="h-5 w-5 text-purple-600" />
                                </div>
                                <h3 className="font-semibold text-lg text-gray-900">Gestión de Estado del Período</h3>
                            </div>

                            {isActive && supletoriosPendientes && (
                                <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
                                    <div className="flex items-start gap-3 mb-4">
                                        <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-green-900 mb-1">Período Activo</h4>
                                            <p className="text-sm text-green-700">
                                                El período lectivo está activo. Los docentes pueden calificar a los estudiantes.
                                            </p>
                                        </div>
                                    </div>

                                    {todosTrimestresFinalizados ? (
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-sm text-green-800 bg-green-100 p-3 rounded border border-green-300">
                                                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                                <span className="font-medium">Los 3 trimestres están finalizados</span>
                                            </div>

                                            <p className="text-sm text-gray-700 font-medium">Opciones disponibles:</p>

                                            <div className="grid grid-cols-2 gap-3">
                                                {onActivarSupletorios && (
                                                    <Button
                                                        onClick={() => handleSolicitarCambioSupletorio(EstadoSupletorio.ACTIVADO)}
                                                        className="bg-orange-500 hover:bg-orange-600 text-white"
                                                    >
                                                        <BookCheck className="mr-2 h-4 w-4" />
                                                        Activar Supletorios
                                                    </Button>
                                                )}
                                                <Button
                                                    onClick={() => setShowCambiarEstadoDialog(true)}
                                                    variant="destructive"
                                                >
                                                    <Power className="mr-2 h-4 w-4" />
                                                    Finalizar Período
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded border border-amber-300">
                                            <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                            <span>
                                                Debes finalizar los 3 trimestres antes de activar supletorios o finalizar el período.
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {isActive && supletoriosActivos && (
                                <div className="border-2 border-orange-200 rounded-lg p-4 bg-orange-50">
                                    <div className="flex items-start gap-3 mb-4">
                                        <BookCheck className="h-5 w-5 text-orange-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-orange-900 mb-1">Supletorios Activos</h4>
                                            <p className="text-sm text-orange-700">
                                                Los docentes pueden calificar a los estudiantes que necesitan rendir exámenes supletorios.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            onClick={() => handleSolicitarCambioSupletorio(EstadoSupletorio.PENDIENTE)}
                                            variant="outline"
                                            className="border-2 border-red-500 text-red-700 hover:bg-red-50"
                                        >
                                            <RotateCcw className="mr-2 h-4 w-4" />
                                            Regresar a Pendiente
                                        </Button>
                                        {onCerrarSupletorios && (
                                            <Button
                                                onClick={() => handleSolicitarCambioSupletorio(EstadoSupletorio.CERRADO)}
                                                className="bg-amber-600 hover:bg-amber-700 text-white"
                                            >
                                                <Lock className="mr-2 h-4 w-4" />
                                                Cerrar Supletorios
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {isActive && supletoriosCerrados && (
                                <div className="border-2 border-amber-200 rounded-lg p-4 bg-amber-50">
                                    <div className="flex items-start gap-3 mb-4">
                                        <Lock className="h-5 w-5 text-amber-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-amber-900 mb-1">Supletorios Cerrados</h4>
                                            <p className="text-sm text-amber-700">
                                                El período de supletorios ha finalizado. Puedes finalizar el período o reabrirlos si es necesario.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {onReabrirSupletorios && (
                                            <Button
                                                onClick={() => handleSolicitarCambioSupletorio(EstadoSupletorio.ACTIVADO)}
                                                variant="outline"
                                                className="border-2 border-blue-500 text-blue-700 hover:bg-blue-50"
                                            >
                                                <RotateCcw className="mr-2 h-4 w-4" />
                                                Reabrir Supletorios
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => setShowCambiarEstadoDialog(true)}
                                            variant="destructive"
                                        >
                                            <Power className="mr-2 h-4 w-4" />
                                            Finalizar Período
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {finalizado && (
                                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50">
                                    <div className="flex items-start gap-3">
                                        <CalendarX className="h-5 w-5 text-gray-600 mt-0.5" />
                                        <div className="flex-1">
                                            <h4 className="font-semibold text-gray-900 mb-1">Período Finalizado</h4>
                                            <p className="text-sm text-gray-700">
                                                Este período ha sido finalizado y está archivado. No se pueden realizar modificaciones.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </CardContent>
                )}

                {!isEditing && (
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible value={accordionValue} onValueChange={handleAccordionChange}>
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
                                                    isPeriodoFinalizado={EstadoPeriodo.FINALIZADO === periodo.estado}
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

                            <AccordionItem value="evaluacion" className="border-none">
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

                                    {tiposEvaluacion.length > 0 && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowEditPorcentajesDialog(true);
                                            }}
                                            className="hover:bg-purple-100 text-purple-600 ml-2"
                                            hidden={finalizado}
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
                onConfirm={async () => {
                    await onCambiarEstado(periodo.id);
                    setShowCambiarEstadoDialog(false);
                }}
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

            {showConfirmSupletoriosDialog && nuevoEstadoSupletorio && (
                <ConfirmUpdateSupletoriosDialog
                    isOpen={showConfirmSupletoriosDialog}
                    onClose={() => {
                        setShowConfirmSupletoriosDialog(false);
                        setNuevoEstadoSupletorio(null);
                    }}
                    onConfirm={handleConfirmCambioSupletorio}
                    periodo={periodo}
                    nuevoEstado={nuevoEstadoSupletorio}
                />
            )}
        </>
    );
}