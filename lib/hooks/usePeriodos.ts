import { useState, useCallback } from 'react';
import { periodosService, trimestresService } from '../services/periodos';
import { EstadoPeriodo, type PeriodoLectivo, type Trimestre } from '../types/periodo.types';
import { toast } from 'sonner';

export function usePeriodos() {
    const [periodos, setPeriodos] = useState<PeriodoLectivo[]>([]);
    const [periodoActivo, setPeriodoActivo] = useState<PeriodoLectivo | null>(null);
    const [trimestres, setTrimestres] = useState<Trimestre[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // 📋 PERÍODOS LECTIVOS
    const fetchPeriodos = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await periodosService.getAll();
            setPeriodos(data);
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al cargar períodos';
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, []);

    const obtenerPeriodo = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const periodo = await periodosService.getById(id);
            return periodo;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al obtener período';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const obtenerPeriodoActivo = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const periodo = await periodosService.getPeriodoActivo();
            return periodo;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al obtener período activo';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const loadPeriodoActivo = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const periodo = await periodosService.getPeriodoActivo();
            setPeriodoActivo(periodo);
            return periodo;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al obtener período activo';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const crearPeriodo = useCallback(async (data: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await periodosService.create(data);
            const nuevoPeriodo = { ...response.periodo, trimestres: response.trimestres };
            
            setPeriodos(prev => [...prev, nuevoPeriodo]);
            toast.success(`${response.message} - Se crearon ${response.trimestres.length} trimestres`);
            return response;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al crear período';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const actualizarPeriodo = useCallback(async (id: string, data: any) => {
        setLoading(true);
        setError(null);
        try {
            const response = await periodosService.update(id, data);
            const periodoActualizado = response.periodo;
            
            setPeriodos(prev =>
                prev.map(p => p.id === id ? { ...periodoActualizado, trimestres: p.trimestres } : p)
            );
            
            toast.success(response.message);
            return periodoActualizado;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al actualizar período';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    const cambiarEstadoPeriodo = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await periodosService.cambiarEstado(id);
            
            setPeriodos(prev =>
                prev.map(p =>
                    p.id === id ? { ...p, estado: response.periodo.estado_nuevo } : p
                )
            );
            
            toast.success(response.message);
            return response;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al cambiar estado';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    // 📅 TRIMESTRES
    const obtenerTrimestres = useCallback(async (periodoId: string) => {
        setLoading(true);
        setError(null);
        try {
            const data = await periodosService.getTrimestres(periodoId);
            setTrimestres(data);
            return data;
        } catch (err: any) {
            const errorMsg = err.response?.data?.message || err.message || 'Error al cargar trimestres';
            setError(errorMsg);
            toast.error(errorMsg);
            throw err;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        periodos,
        trimestres,
        loading,
        error,
        periodoActivo,
        // Períodos
        fetchPeriodos,
        obtenerPeriodo,
        obtenerPeriodoActivo,
        loadPeriodoActivo,
        crearPeriodo,
        actualizarPeriodo,
        cambiarEstadoPeriodo,
        // Trimestres
        obtenerTrimestres
    };
}