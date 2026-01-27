import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from './components/Loading'

const PetsList = lazy(() => import('./pages/Pets/PetsList'))
const PetDetails = lazy(() => import('./pages/Pets/PetDetails'))
const PetForm = lazy(() => import('./pages/Pets/PetForm'))
const TutoresList = lazy(() => import('./pages/Tutores/TutoresList'))

function App() {
  return (
    <div className="min-h-screen">
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<PetsList />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/pets/novo" element={<PetForm />} />
          <Route path="/pets/:id/editar" element={<PetForm />} />
          <Route path="/tutores" element={<TutoresList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
