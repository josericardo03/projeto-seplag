import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from './components/Loading'
import Home from './pages/Home'

// Lazy loading dos módulos Pets e Tutores
const PetsList = lazy(() => import('./pages/Pets/PetsList'))
const TutoresList = lazy(() => import('./pages/Tutores/TutoresList'))

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pets" element={<PetsList />} />
        <Route path="/tutores" element={<TutoresList />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default App
