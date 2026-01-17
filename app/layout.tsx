// nextjs-frontend/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scholar System',
  description: 'Sistema de Gestión Educativa',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
        
        <footer className="bg-white text-gray-800 py-12 px-6 shadow-inner">
          <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">

            {/* Misión */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-blue-900 mb-3">Misión</h2>
              <p className="text-base leading-relaxed">
                Formar estudiantes íntegros con valores, conocimientos y competencias
                que contribuyan al desarrollo de la sociedad, fomentando la excelencia
                académica y el compromiso social.
              </p>
            </div>

            {/* Visión */}
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-red-700 mb-3">Visión</h2>
              <p className="text-base leading-relaxed">
                Ser una institución educativa reconocida por la excelencia académica,
                la formación integral y el liderazgo de sus estudiantes en el ámbito
                local y nacional.
              </p>
            </div>

          </div>

          {/* Línea inferior */}
          <div className="mt-12 border-t border-gray-300 pt-4 text-xs text-gray-500 text-center">
            © {new Date().getFullYear()} Unidad Educativa 5 de Junio. Todos los derechos reservados.
          </div>
        </footer>
        <Toaster position="top-right" />

      </body>
    </html>
  )
}