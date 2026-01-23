import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found')
}

const root = createRoot(rootElement)

console.log('🚀 Aplicação iniciando...')
console.log('📍 Root element encontrado:', !!rootElement)

try {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StrictMode>
  )
  console.log('✅ Aplicação renderizada com sucesso')
} catch (error) {
  console.error('❌ Erro ao renderizar aplicação:', error)
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial;">
      <h1 style="color: red;">Erro ao carregar aplicação</h1>
      <p>${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
      <button onclick="window.location.reload()" style="padding: 10px 20px; margin-top: 20px; background: orange; color: white; border: none; border-radius: 5px; cursor: pointer;">
        Recarregar
      </button>
    </div>
  `
}
