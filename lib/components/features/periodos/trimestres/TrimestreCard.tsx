// app/lib/components/admin/TrimestreCard.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Label } from '@/lib/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/lib/components/ui/select';
import { Badge } from '@/lib/components/ui/badge';
import { Edit2, Save, X, Calendar } from 'lucide-react';
import { trimestresService } from '@/lib/services/periodos';
import { NombreTrimestre, Trimestre, TrimestreEstado }  from '@/lib/types/periodo.types';
import ConfirmUpdateTrimestreDialog from './ConfirmUpdateTrimestreDialog';
import { toast } from 'sonner';

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

  const getEstadoBadge = (estado: TrimestreEstado) => {
    switch (estado) {
      case TrimestreEstado.ACTIVO:
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">🟢 Activo</Badge>;
      case TrimestreEstado.FINALIZADO:
        return <Badge variant="secondary">✅ Finalizado</Badge>;
      case TrimestreEstado.PENDIENTE:
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">⏳ Pendiente</Badge>;
      default:
        return <Badge variant="outline">❓ Desconocido</Badge>;
    }
  };

  const getTrimestreIcon = (nombre: NombreTrimestre) => {
    switch (nombre) {
      case NombreTrimestre.PRIMER_TRIMESTRE: return '1️⃣';
      case NombreTrimestre.SEGUNDO_TRIMESTRE: return '2️⃣';
      case NombreTrimestre.TERCER_TRIMESTRE: return '3️⃣';
      default: return '📅';
    }
  };

  // ✅ Preparar cambios para el modal
  const getChanges = () => {
    const changes: any = {};
    if (editData.fechaInicio !== trimestre.fechaInicio) changes.fechaInicio = editData.fechaInicio;
    if (editData.fechaFin !== trimestre.fechaFin) changes.fechaFin = editData.fechaFin;
    if (editData.estado !== trimestre.estado) changes.estado = editData.estado;
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
      await trimestresService.update(trimestre.id, changes);
      
      toast.success('Trimestre actualizado exitosamente');
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

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-base">
            <div className="flex items-center gap-2">
              <span className="text-lg">{getTrimestreIcon(trimestre.nombre)}</span>
              <span>{trimestre.nombre}</span>
            </div>
            
            <div className="flex items-center gap-2">
              {getEstadoBadge(isEditing ? editData.estado : trimestre.estado)}
              {!isEditing && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsEditing(true)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Fechas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de Inicio
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formatDateForInput(editData.fechaInicio)}
                  onChange={(e) => setEditData({...editData, fechaInicio: e.target.value})}
                />
              ) : (
                <p className="text-sm font-medium">{formatDateForDisplay(trimestre.fechaInicio)}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Fecha de Fin
              </Label>
              {isEditing ? (
                <Input
                  type="date"
                  value={formatDateForInput(editData.fechaFin)}
                  onChange={(e) => setEditData({...editData, fechaFin: e.target.value})}
                />
              ) : (
                <p className="text-sm font-medium">{formatDateForDisplay(trimestre.fechaFin)}</p>
              )}
            </div>
          </div>

          {/* Estado */}
          {isEditing && (
            <div className="space-y-2">
              <Label className="text-sm">Estado del Trimestre</Label>
              <Select 
                value={editData.estado} 
                onValueChange={(value) => setEditData({...editData, estado: value as TrimestreEstado})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={TrimestreEstado.PENDIENTE}>⏳ Pendiente</SelectItem>
                  <SelectItem value={TrimestreEstado.ACTIVO}>🟢 Activo</SelectItem>
                  <SelectItem value={TrimestreEstado.FINALIZADO}>✅ Finalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Botones */}
          {isEditing && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" onClick={handleCancel} className="flex-1">
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button onClick={handleSave} className="flex-1">
                <Save className="mr-2 h-4 w-4" />
                Guardar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación */}
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