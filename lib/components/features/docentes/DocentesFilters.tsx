"use client";

import {
  Search,
  Filter,
  BookOpen,
  GraduationCap,
  Globe2,
  UserCheck,
  UserX,
  Users,
  Trash2,
} from "lucide-react";

import { NivelAsignado } from "@/lib/types/docente.types";
import { Role } from "@/lib/types/usuario.types";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/lib/components/ui/select";

interface Props {
  searchTerm: string;
  setSearchTerm: (v: string) => void;

  nivelFilter: "TODOS" | NivelAsignado;
  setNivelFilter: (v: "TODOS" | NivelAsignado) => void;

  estadoFilter: "TODOS" | "ACTIVO" | "INACTIVO";
  setEstadoFilter: (v: "TODOS" | "ACTIVO" | "INACTIVO") => void;

  rolFilter: "TODOS" | Role;
  setRolFilter: (v: "TODOS" | Role) => void;

  onClearFilters: () => void;
}

export default function DocentesFilters({
  searchTerm,
  setSearchTerm,
  nivelFilter,
  setNivelFilter,
  estadoFilter,
  setEstadoFilter,
  rolFilter,
  setRolFilter,
  onClearFilters,
}: Props) {
  const hasFilters =
    nivelFilter !== "TODOS" ||
    estadoFilter !== "TODOS" ||
    rolFilter !== "TODOS";

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-900 flex items-center justify-center">
            <Filter className="text-white w-5 h-5" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 text-lg">Filtros</h2>
            <p className="text-sm text-gray-500">
              {hasFilters ? "Mostrando resultados filtrados" : "Todos los docentes"}
            </p>
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-2 text-gray-700 bg-gray-100 hover:bg-gray-200
                       px-4 py-2.5 rounded-xl text-sm font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
            Limpiar
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          value={searchTerm}
          placeholder="Buscar por nombre, email o cédula..."
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300
                     text-gray-900 placeholder-gray-400 text-base
                     focus:ring-2 focus:ring-gray-900 focus:border-gray-900 transition"
        />
      </div>

      {/* Select filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Nivel */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Nivel
          </label>
          <Select value={nivelFilter} onValueChange={setNivelFilter}>
            <SelectTrigger className="h-11 rounded-xl border-gray-300 text-base">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS" className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <Users className="w-4 h-4" /> Todos
                </div>
              </SelectItem>
              <SelectItem value={NivelAsignado.BASICA} className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <BookOpen className="w-4 h-4" /> Educación Básica
                </div>
              </SelectItem>
              <SelectItem value={NivelAsignado.BACHILLERATO} className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <GraduationCap className="w-4 h-4" /> Bachillerato
                </div>
              </SelectItem>
              <SelectItem value={NivelAsignado.GLOBAL} className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <Globe2 className="w-4 h-4" /> Global
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Estado */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Estado
          </label>
          <Select value={estadoFilter} onValueChange={setEstadoFilter}>
            <SelectTrigger className="h-11 rounded-xl border-gray-300 text-base">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS" className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <Users className="w-4 h-4" /> Todos
                </div>
              </SelectItem>
              <SelectItem value="ACTIVO" className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <UserCheck className="w-4 h-4" /> Activos
                </div>
              </SelectItem>
              <SelectItem value="INACTIVO" className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <UserX className="w-4 h-4" /> Inactivos
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Rol */}
        <div>
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Rol
          </label>
          <Select value={rolFilter} onValueChange={setRolFilter}>
            <SelectTrigger className="h-11 rounded-xl border-gray-300 text-base">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS" className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <Users className="w-4 h-4" /> Todos
                </div>
              </SelectItem>
              <SelectItem value={Role.DOCENTE} className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <GraduationCap className="w-4 h-4" /> Docentes
                </div>
              </SelectItem>
              <SelectItem value={Role.SECRETARIA} className="text-base">
                <div className="flex items-center gap-2 py-2">
                  <Users className="w-4 h-4" /> Secretaria
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

      </div>
    </div>
  );
}
