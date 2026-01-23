import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Loading from './components/Loading'
import Home from './pages/Home'

// Lazy loading dos módulos Pets e Tutores
const PetsList = lazy(() => {
  console.log('📦 Carregando módulo PetsList...')
  return import('./pages/Pets/PetsList').then((module) => {
    console.log('✅ Módulo PetsList carregado com sucesso', module)
    return { default: module.default }
  }).catch((error) => {
    console.error('❌ Erro ao carregar módulo PetsList:', error)
    // Retornar um componente de erro em vez de lançar
    return {
      default: () => (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <h1 style={{ color: 'red' }}>Erro ao carregar PetsList</h1>
          <p>{error?.message || 'Erro desconhecido'}</p>
          <button onClick={() => window.location.reload()}>Recarregar</button>
        </div>
      )
    }
  })
})
const PetDetails = lazy(() => import('./pages/Pets/PetDetails'))
const TutoresList = lazy(() => import('./pages/Tutores/TutoresList'))

function App() {
  console.log('📱 App component renderizado')
  console.log('📍 URL atual:', window.location.pathname)
  
  return (
    <div style={{ minHeight: '100vh' }}>
      <Suspense fallback={
        <div style={{ 
          minHeight: '100vh', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: '#faf9f6'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ 
              width: '64px', 
              height: '64px', 
              border: '4px solid #f3f4f6', 
              borderTop: '4px solid #f97316', 
              borderRadius: '50%', 
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }}></div>
            <p style={{ color: '#374151' }}>Carregando...</p>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      }>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pets" element={<PetsList />} />
          <Route path="/pets/:id" element={<PetDetails />} />
          <Route path="/tutores" element={<TutoresList />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default App
