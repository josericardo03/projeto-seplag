import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from './components/Loading'
import { ProtectedRoute } from './components/ProtectedRoute'
import { SkipLink } from './components/SkipLink'

const PetsList = lazy(() => import('./pages/Pets/PetsList'))
const PetDetails = lazy(() => import('./pages/Pets/PetDetails'))
const PetForm = lazy(() => import('./pages/Pets/PetForm'))
const TutoresList = lazy(() => import('./pages/Tutores/TutoresList'))
const TutorForm = lazy(() => import('./pages/Tutores/TutorForm'))
const Login = lazy(() => import('./pages/Auth/Login'))
const Lobby = lazy(() => import('./pages/Lobby/Lobby'))

function App() {
  return (
    <div className="min-h-screen">
      <SkipLink />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <PetsList />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<Login />} />
          <Route
            path="/lobby"
            element={
              <ProtectedRoute>
                <Lobby />
              </ProtectedRoute>
            }
          />
          <Route path="/pets" element={<Navigate to="/" replace />} />
          <Route
            path="/pets/:id"
            element={
              <ProtectedRoute>
                <PetDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/novo"
            element={
              <ProtectedRoute>
                <PetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pets/:id/editar"
            element={
              <ProtectedRoute>
                <PetForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutores"
            element={
              <ProtectedRoute>
                <TutoresList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutores/novo"
            element={
              <ProtectedRoute>
                <TutorForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tutores/:id/editar"
            element={
              <ProtectedRoute>
                <TutorForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
