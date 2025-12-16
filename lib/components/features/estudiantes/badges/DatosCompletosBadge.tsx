interface DatosCompletosBadgeProps {
  completos: boolean;
}

export function DatosCompletosBadge({ completos }: DatosCompletosBadgeProps) {
  if (completos) {
    return (
      <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800 border border-green-300">
        ✓ Completos
      </span>
    );
  }

  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300">
      ⚠ Incompletos
    </span>
  );
}