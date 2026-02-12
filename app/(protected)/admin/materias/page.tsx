'use client';

import { useState, useEffect } from 'react';
import { useMaterias } from '@/lib/hooks/useMaterias';
import { EstadoMateria, Materia } from '@/lib/types/materia.types';
import MateriaCard from '@/lib/components/features/materias/MateriaCard';
import CrearMateriaDialog from '@/lib/components/features/materias/CrearMateriaDialog';
import { Button } from '@/lib/components/ui/button';
import { Input } from '@/lib/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/lib/components/ui/card';
import { Plus, Search, BookOpen, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

export default function MateriasPage() {
    const { fetchMaterias, cambiarEstadoMateria, loading } = useMaterias();
    const [materias, setMaterias] = useState<Materia[]>([]);
    const [filtradas, setFiltradas] = useState<Materia[]>([]);
    const [busqueda, setBusqueda] = useState('');
    const [dialogOpen, setDialogOpen] = useState(false);
    const [materiaEditar, setMateriaEditar] = useState<Materia | null>(null);

    const cargarMaterias = async () => {
        const data = await fetchMaterias();
        setMaterias(data);
        setFiltradas(data);
    };

    useEffect(() => {
        cargarMaterias();
    }, []);

    useEffect(() => {
        if (busqueda.trim() === '') {
            setFiltradas(materias);
        } else {
            const resultado = materias.filter((m) =>
                m.nombre.toLowerCase().includes(busqueda.toLowerCase())
            );
            setFiltradas(resultado);
        }
    }, [busqueda, materias]);

    const handleCrear = () => {
        setMateriaEditar(null);
        setDialogOpen(true);
    };

    const handleEditar = (materia: Materia) => {
        setMateriaEditar(materia);
        setDialogOpen(true);
    };

    const handleToggleEstado = async (materia: Materia) => {
        try {
            await cambiarEstadoMateria(materia.id);
            toast.success(
                `Materia ${materia.estado === EstadoMateria.ACTIVO ? 'desactivada' : 'activada'} exitosamente`
            );
            cargarMaterias();
        } catch (error) {
            toast.error('Error al cambiar estado');
        }
    };

    if (loading && materias.length === 0) {
        return (
            <div className="flex justify-center items-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Link
                                href="/admin"
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <ArrowLeft className="w-6 h-6 text-gray-600" />
                            </Link>

                            <BookOpen className="w-8 h-8 text-blue-600" />

                            <div>
                                <CardTitle className="text-3xl">Gestión de Materias</CardTitle>
                                <CardDescription>
                                    Administra el catálogo de materias del sistema
                                </CardDescription>
                            </div>
                        </div>

                        <Button onClick={handleCrear} className="flex items-center gap-2">
                            <Plus className="w-4 h-4" />
                            Nueva Materia
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="md:col-span-3">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <Input
                                placeholder="Buscar materias por nombre..."
                                value={busqueda}
                                onChange={(e) => setBusqueda(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 text-center">
                        <p className="text-3xl font-bold text-blue-600">{filtradas.length}</p>
                        <p className="text-sm text-gray-500">
                            {filtradas.length === 1 ? 'Materia' : 'Materias'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {filtradas.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <BookOpen className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">
                            {busqueda ? 'No se encontraron materias' : 'No hay materias registradas'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {filtradas.map((materia) => (
                        <MateriaCard
                            key={materia.id}
                            materia={materia}
                            onEdit={handleEditar}
                            onToggleEstado={handleToggleEstado}
                        />
                    ))}
                </div>
            )}

            <CrearMateriaDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                materia={materiaEditar}
                onSuccess={cargarMaterias}
            />
        </div>
    );
}