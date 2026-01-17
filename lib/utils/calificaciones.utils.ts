export function calcularCualitativo(nota: number): string {
  if (nota >= 9.00) return 'DA';
  if (nota >= 7.00) return 'AA';
  if (nota >= 4.01) return 'PA';
  return 'NA';
}

export function getColorCualitativo(cualitativo: string): string {
  switch (cualitativo) {
    case 'DA': return 'bg-green-100 text-green-800 border-green-300';
    case 'AA': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'PA': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'NA': return 'bg-red-100 text-red-800 border-red-300';
    default: return 'bg-gray-100 text-gray-800 border-gray-300';
  }
}