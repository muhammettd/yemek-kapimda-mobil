import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthProvider'
import AppWithCart from './components/AppWithCard'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppWithCart />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)