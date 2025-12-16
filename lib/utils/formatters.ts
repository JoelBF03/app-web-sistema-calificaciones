export function formatearFecha(fecha: string | Date): string {
  if (!fecha) return '-';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleDateString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

export function formatearFechaHora(fecha: string | Date): string {
  if (!fecha) return '-';
  
  const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
  
  if (isNaN(date.getTime())) return '-';
  
  return date.toLocaleString('es-EC', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}