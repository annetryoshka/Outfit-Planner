import React from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import HomePage from './pages/HomePage'
import Login from './pages/Login'
import Registro from './pages/Registro'
import WishlistPage from './pages/WishlistPage'
import AddPrenda from './pages/AddPrenda'
import Profile from './pages/Profile'
import PrendaDetail from './pages/PrendaDetail'
import WishDetail from './pages/WishDetail'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import ScrollToTop from './components/ScrollToTop'
import CalendarioPage from './pages/CalendarioPage'
import LienzoPage from './pages/LienzoPage'
import DashboardPage from './pages/DashboardPage'
import TryOnPrenda from './pages/TryOnPrenda'
import { useEffect } from 'react'

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registro'
  useEffect(() => {
  const params = new URLSearchParams(window.location.search)
  const token = params.get('token')
  const usuario = params.get('usuario')
  
  if (token && usuario) {
    localStorage.setItem('token', token)
    localStorage.setItem('usuario', usuario)
    window.history.replaceState({}, '', '/')
  }
}, [])

  return (
    <div className="min-h-screen bg-white relative overflow-x-hidden">
      <Sidebar />

      <div className={`ml-20 transition-all duration-300 ${isAuthPage ? 'blur-md pointer-events-none select-none' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/añadir-prenda" element={<AddPrenda />} />
          <Route path="/editar-prenda/:id" element={<ProtectedRoute><AddPrenda /></ProtectedRoute>} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          {/* NUEVO: ruta pública para ver el perfil de cualquier usuario */}
          <Route path="/perfil/:userId" element={<Profile />} />
          <Route path="/prenda/:id" element={<PrendaDetail />} />
          <Route path="/wishdetail/:id" element={<WishDetail />} />
          <Route path="/login" element={<HomePage />} />
          <Route path="/registro" element={<HomePage />} />
          <Route path="/calendario" element={<CalendarioPage />} />
          <Route path="/lienzo/:id" element={<LienzoPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/probar-prenda" element={<ProtectedRoute><TryOnPrenda /></ProtectedRoute>} />
        </Routes>
      </div>

      {isAuthPage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => navigate('/')}
          />
          <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
            {location.pathname === '/login' ? <Login /> : <Registro />}
          </div>
        </div>
      )}
    </div>
  )
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <AppContent />
    </Router>
  )
}

export default App