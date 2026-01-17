// nextjs-frontend/lib/components/features/periodos/trimestres/TrimestreCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Badge } from '@/lib/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/lib/components/ui/select';
import { 
  Calendar, 
  Edit2, 
  Save, 
  X, 
  Activity, 
  PlayCircle, 
  Clock, 
  CheckCircle2 
} from 'lucide-react';
import { Trimestre, TrimestreEstado, NombreTrimestre } from '@/lib/types/periodo.types';
import { toast } from 'sonner';
import ConfirmUpdateTrimestreDialog from './ConfirmUpdateTrimestreDialog';

interface TrimestreCardProps {
  trimestre: Trimestre;
  onUpdate: (trimestreId: string, data: any) => void;
  onReload?: () => void;
}

export default function TrimestreCard({ trimestre, onUpdate, onReload }: TrimestreCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [editData, setEditData] = useState({
    fechaInicio: trimestre.fechaInicio,
    fechaFin: trimestre.fechaFin,
    estado: trimestre.estado
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

  const getEstadoBadge = (estado: TrimestreEstado) => {
    switch (estado) {
      case TrimestreEstado.ACTIVO:
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-300 flex items-center gap-1">
            <PlayCircle className="h-3 w-3" />
            Activo
          </Badge>
        );
      case TrimestreEstado.FINALIZADO:
        return (
          <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-300 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Finalizado
          </Badge>
        );
      case TrimestreEstado.PENDIENTE:
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-300 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Pendiente
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  const getTrimestreNumber = (nombre: NombreTrimestre) => {
    switch (nombre) {
      case NombreTrimestre.PRIMER_TRIMESTRE: return '1';
      case NombreTrimestre.SEGUNDO_TRIMESTRE: return '2';
      case NombreTrimestre.TERCER_TRIMESTRE: return '3';
      default: return '?';
    }
  };

  const getCardStyles = (estado: TrimestreEstado) => {
    switch (estado) {
      case TrimestreEstado.ACTIVO:
        return {
          border: 'border-green-300 bg-gradient-to-br from-green-50 to-emerald-50/30',
          iconBg: 'bg-green-500',
        };
      case TrimestreEstado.FINALIZADO:
        return {
          border: 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50/30',
          iconBg: 'bg-gray-500',
        };
      case TrimestreEstado.PENDIENTE:
        return {
          border: 'border-yellow-300 bg-gradient-to-br from-yellow-50 to-amber-50/30',
          iconBg: 'bg-yellow-500',
        };
      default:
        return {
          border: 'border-gray-200',
          iconBg: 'bg-gray-400',
        };
    }
  };

  const getChanges = () => {
    const changes: any = {};
    if (editData.fechaInicio !== trimestre.fechaInicio) changes.fechaInicio = editData.fechaInicio;
    if (editData.fechaFin !== trimestre.fechaFin) changes.fechaFin = editData.fechaFin;
    if (editData.estado !== trimestre.estado) changes.estado = editData.estado;
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
      await onUpdate(trimestre.id, changes);
      
      setShowConfirmDialog(false);
      setIsEditing(false);
      
      if (onReload) {
        setTimeout(() => onReload(), 500);
      }
    } catch (error: any) {
      console.error('Error updating trimestre:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar el trimestre');
      setShowConfirmDialog(false);
    }
  };

  const handleCancel = () => {
    setEditData({
      fechaInicio: trimestre.fechaInicio,
      fechaFin: trimestre.fechaFin,
      estado: trimestre.estado
    });
    setIsEditing(false);
  };

  const styles = getCardStyles(isEditing ? editData.estado : trimestre.estado);
  const trimestreNum = getTrimestreNumber(trimestre.nombre);

  return (
    <>
      <Card className={`hover:shadow-lg transition-all duration-300 border-2 ${styles.border}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full ${styles.iconBg} flex items-center justify-center shadow-md`}>
                <span className="text-white font-bold text-lg">{trimestreNum}</span>
              </div>
              <div>
                <p className="font-bold text-gray-900">{trimestre.nombre}</p>
                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  {formatDateForDisplay(trimestre.fechaInicio)}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {getEstadoBadge(isEditing ? editData.estado : trimestre.estado)}
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0 hover:bg-gray-100 rounded-full"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Fechas */}
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1 text-gray-600 font-semibold">
                <Calendar className="h-3 w-3" />
                Fecha de Inicio
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formatDateForInput(editData.fechaInicio)}
                  onChange={(e) => setEditData({...editData, fechaInicio: e.target.value})}
                  className="border-2"
                />
              ) : (
                <p className="text-sm font-medium bg-white px-3 py-2 rounded-md border-2 border-gray-200">
                  {formatDateForDisplay(trimestre.fechaInicio)}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1 text-gray-600 font-semibold">
                <Calendar className="h-3 w-3" />
                Fecha de Fin
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formatDateForInput(editData.fechaFin)}
                  onChange={(e) => setEditData({...editData, fechaFin: e.target.value})}
                  className="border-2"
                />
              ) : (
                <p className="text-sm font-medium bg-white px-3 py-2 rounded-md border-2 border-gray-200">
                  {formatDateForDisplay(trimestre.fechaFin)}
                </p>
              )}
            </div>
          </div>

          {/* Estado */}
          {isEditing && (
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-1 text-gray-600 font-semibold">
                <Activity className="h-3 w-3" />
                Estado del Trimestre
              </Label>
              <Select 
                value={editData.estado} 
                onValueChange={(value) => setEditData({...editData, estado: value as TrimestreEstado})}
              >
                <SelectTrigger className="border-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TrimestreEstado.PENDIENTE}>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-yellow-600" />
                      Pendiente
                    </div>
                  </SelectItem>
                  <SelectItem value={TrimestreEstado.ACTIVO}>
                    <div className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4 text-green-600" />
                      Activo
                    </div>
                  </SelectItem>
                  <SelectItem value={TrimestreEstado.FINALIZADO}>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gray-600" />
                      Finalizado
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botones */}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1 border-2 hover:bg-gray-50">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1 bg-blue-600 hover:bg-blue-700 shadow-md">
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <ConfirmUpdateTrimestreDialog
        isOpen={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={handleConfirmUpdate}
        trimestre={trimestre}
        changes={getChanges()}
        originalData={trimestre}
      />
    </>
  );
}