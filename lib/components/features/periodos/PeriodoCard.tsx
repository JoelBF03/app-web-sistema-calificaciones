// app/lib/components/admin/PeriodoCard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/lib/components/ui/accordion';
import { Edit2, Save, X, Calendar, Clock } from 'lucide-react';
import { PeriodoLectivo, EstadoPeriodo, Trimestre, TrimestreEstado } from '@/lib/types/periodo.types';
import { periodosService, trimestresService } from '@/lib/services/periodos';
import TrimestreCard from './trimestres/TrimestreCard';
import ConfirmUpdatePeriodoDialog from './ConfirmUpdatePeriodoDialog';
import { toast } from 'sonner';

interface PeriodoCardProps {
    periodo: PeriodoLectivo;
    onUpdate: (id: string, data: any) => void;
    onUpdateTrimestre: (trimestreId: string, data: any) => void;
}

export default function PeriodoCard({ periodo, onUpdate, onUpdateTrimestre }: PeriodoCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
    const [loadingTrimestres, setLoadingTrimestres] = useState(false);
    const [accordionValue, setAccordionValue] = useState<string>('');
    const [editData, setEditData] = useState({
        nombre: periodo.nombre,
        fechaInicio: periodo.fechaInicio,
        fechaFin: periodo.fechaFin,
        estado: periodo.estado
    });

    // ✅ Función para formatear fecha correctamente
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
            month: '2-digit',
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
        return `${months} meses`;
    };

    // ✅ NUEVA LÓGICA: Progreso basado en trimestres finalizados
    const getProgressPercentage = () => {
        const totalTrimestres = trimestres?.length ?? 0;

        if (totalTrimestres === 0) {
            // Si no hay trimestres cargados, usar lógica de fecha como fallback
            if (periodo.estado === EstadoPeriodo.FINALIZADO) return 100;

            const now = new Date().getTime();
            const start = new Date(periodo.fechaInicio).getTime();
            const end = new Date(periodo.fechaFin).getTime();

            if (isNaN(start) || isNaN(end) || start >= end) return 0;

            return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
        }

        // Lógica principal: basado en los trimestres finalizados
        const trimestresFinalizados = trimestres.filter(
            (t) => t.estado === TrimestreEstado.FINALIZADO
        ).length;

        return Math.round((trimestresFinalizados / totalTrimestres) * 100);
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

    const handleAccordionChange = (value: string) => {
        setAccordionValue(value);
        if (value === 'trimestres') {
            loadTrimestres();
        }
    };

    // ✅ Preparar cambios para el modal
    const getChanges = () => {
        const changes: any = {};
        if (editData.nombre !== periodo.nombre) changes.nombre = editData.nombre;
        if (editData.fechaInicio !== periodo.fechaInicio) changes.fechaInicio = editData.fechaInicio;
        if (editData.fechaFin !== periodo.fechaFin) changes.fechaFin = editData.fechaFin;
        if (editData.estado !== periodo.estado) changes.estado = editData.estado;
        return changes;
    };

    const handleSave = () => {
        // Validaciones básicas
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

        // ✅ Mostrar modal de confirmación
        setShowConfirmDialog(true);
    };

    const handleConfirmUpdate = async () => {
        try {
            const changes = getChanges();
            await periodosService.update(periodo.id, changes);

            toast.success('Período lectivo actualizado exitosamente');
            setShowConfirmDialog(false);
            setIsEditing(false);

            // Recargar trimestres si están visibles
            if (accordionValue === 'trimestres') {
                setTimeout(() => loadTrimestres(), 500);
            }

        } catch (error: any) {
            console.error('Error updating periodo:', error);
            toast.error(error.response?.data?.message || 'Error al actualizar el período');
            setShowConfirmDialog(false);
        }
    };

    const handleCancel = () => {
        setEditData({
            nombre: periodo.nombre,
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin,
            estado: periodo.estado
        });
        setIsEditing(false);
    };

    // ✅ Actualizar editData cuando cambie el período
    useEffect(() => {
        setEditData({
            nombre: periodo.nombre,
            fechaInicio: periodo.fechaInicio,
            fechaFin: periodo.fechaFin,
            estado: periodo.estado
        });
    }, [periodo]);

    useEffect(() => {
    if (periodo.trimestres && periodo.trimestres.length > 0) {
        setTrimestres(periodo.trimestres);
    }
}, [periodo.trimestres]);

    const isActive = periodo.estado === EstadoPeriodo.ACTIVO;

    return (
        <>
            <Card className="overflow-hidden hover:shadow-lg transition-all duration-300">
                {/* Header con gradiente */}
                <CardHeader
                    className={`transition-all duration-500 py-4 ${isEditing
                        ? 'bg-white border-b border-muted shadow-sm'
                        : isActive
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                            : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                        }`}
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-full ${isEditing
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'bg-white/20 text-white'
                                    }`}
                            >
                                <span className="text-xl">{isActive ? '📅' : '📋'}</span>
                            </div>

                            <div>
                                {isEditing ? (
                                    <div className="flex items-center gap-2">
                                        <Input
                                            value={editData.nombre}
                                            onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                                            className="w-56 text-base font-semibold"
                                            placeholder="Nombre del período"
                                        />
                                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                            ✏️ Editando
                                        </Badge>
                                    </div>
                                ) : (
                                    <h3 className="text-xl font-bold">{periodo.nombre}</h3>
                                )}

                                <p
                                    className={`text-sm flex items-center gap-1 ${isEditing ? 'text-muted-foreground' : 'opacity-90'
                                        }`}
                                >
                                    <Clock className="h-3 w-3" />
                                    {getDuration()}
                                </p>
                            </div>
                        </div>

                        {/* DERECHA: Estado + Botón de editar */}
                        <div className="flex items-center gap-3">
                            {isEditing ? (
                                <Select
                                    value={editData.estado}
                                    onValueChange={(value) => setEditData({ ...editData, estado: value as EstadoPeriodo })}
                                >
                                    <SelectTrigger className="w-36 border-green-300 focus:ring-green-500">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={EstadoPeriodo.ACTIVO}>✅ Activo</SelectItem>
                                        <SelectItem value={EstadoPeriodo.FINALIZADO}>⏹️ Finalizado</SelectItem>
                                    </SelectContent>
                                </Select>
                            ) : (
                                <Badge
                                    className={`${isActive
                                        ? 'bg-green-100 text-green-800 hover:bg-green-100'
                                        : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                                        }`}
                                >
                                    {isActive ? '✅ Activo' : '⏹️ Finalizado'}
                                </Badge>
                            )}

                            {!isEditing && (
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
                </CardHeader>


                <CardContent className="p-6">
                    {/* Información del Período */}
                    <div className="space-y-4 mb-6">
                        {/* Fechas */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Fecha de Inicio
                                </Label>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={formatDateForInput(editData.fechaInicio)}
                                        onChange={(e) => setEditData({ ...editData, fechaInicio: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium">{formatDateForDisplay(periodo.fechaInicio)}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm flex items-center gap-1 text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    Fecha de Fin
                                </Label>
                                {isEditing ? (
                                    <Input
                                        type="date"
                                        value={formatDateForInput(editData.fechaFin)}
                                        onChange={(e) => setEditData({ ...editData, fechaFin: e.target.value })}
                                    />
                                ) : (
                                    <p className="font-medium">{formatDateForDisplay(periodo.fechaFin)}</p>
                                )}
                            </div>
                        </div>

                        {/* Progreso visual del período */}
                        {!isEditing && (
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm text-muted-foreground">
                                    <span>Progreso del período</span>
                                    <span>{getProgressPercentage()}% ({trimestres.filter(t => t.estado === TrimestreEstado.FINALIZADO).length}/{trimestres.length} trimestres finalizados)</span>
                                </div>
                                <div className="w-full bg-secondary rounded-full h-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-500 ${getProgressPercentage() === 100 ? 'bg-gray-400' : 'bg-green-500'
                                            }`}
                                        style={{ width: `${getProgressPercentage()}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Botones de edición */}
                        {isEditing && (
                            <div className="flex gap-2 pt-2">
                                <Button variant="outline" onClick={handleCancel} className="flex-1">
                                    <X className="mr-2 h-4 w-4" />
                                    Cancelar
                                </Button>
                                <Button onClick={handleSave} className="flex-1 bg-green-600 hover:bg-green-700">
                                    <Save className="mr-2 h-4 w-4" />
                                    Guardar Período
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Accordion para Trimestres */}
                    {!isEditing && (
                        <Accordion
                            type="single"
                            collapsible
                            value={accordionValue}
                            onValueChange={handleAccordionChange}
                            className="border rounded-lg"
                        >
                            <AccordionItem value="trimestres" className="border-none">
                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                                    <div className="flex items-center gap-2">
                                        <span className="text-lg">📊</span>
                                        <span className="font-semibold">Trimestres del Período</span>
                                        {trimestres.length > 0 && (
                                            <Badge variant="secondary" className="ml-2">
                                                {trimestres.length} trimestres
                                            </Badge>
                                        )}
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4">
                                    {loadingTrimestres ? (
                                        <div className="flex items-center justify-center py-8">
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
                                                <span className="text-sm text-muted-foreground">Cargando trimestres...</span>
                                            </div>
                                        </div>
                                    ) : trimestres.length > 0 ? (
                                        <div className="grid gap-4 mt-4">
                                            {trimestres
                                                .sort((a, b) => {
                                                    const order = {
                                                        'PRIMER TRIMESTRE': 1,
                                                        'SEGUNDO TRIMESTRE': 2,
                                                        'TERCER TRIMESTRE': 3
                                                    };
                                                    return order[a.nombre] - order[b.nombre];
                                                })
                                                .map((trimestre) => (
                                                    <TrimestreCard
                                                        key={trimestre.id}
                                                        trimestre={trimestre}
                                                        onUpdate={onUpdateTrimestre}
                                                        onReload={loadTrimestres}
                                                    />
                                                ))
                                            }
                                        </div>
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground">
                                            <span className="text-4xl mb-2 block">📅</span>
                                            <p>No se encontraron trimestres para este período</p>
                                        </div>
                                    )}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}
                </CardContent>
            </Card>

            {/* Modal de confirmación */}
            <ConfirmUpdatePeriodoDialog
                isOpen={showConfirmDialog}
                onClose={() => setShowConfirmDialog(false)}
                onConfirm={handleConfirmUpdate}
                periodo={periodo}
                changes={getChanges()}
                originalData={periodo}
            />
        </>
    );
}