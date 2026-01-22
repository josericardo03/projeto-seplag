import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Sistema de Registro de Pets
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Gerencie pets e tutores de forma simples e eficiente
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            to="/pets"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ver Pets
          </Link>
          <Link
            to="/tutores"
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Ver Tutores
          </Link>
        </div>
      </div>
    </div>
  )
}
