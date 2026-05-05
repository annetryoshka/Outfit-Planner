import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import ScrollToTop from './components/ScrollToTop'
import ProtectedRoute from './components/Layout/ProtectedRoute'
import HomePage from './pages/HomePage'
import WishlistPage from './pages/WishlistPage'
import AddPrenda from './pages/AddPrenda'
import PrendaDetail from './pages/PrendaDetail'
import Login from './pages/Login'
import Profile from './pages/Profile'
import Registro from './pages/Registro'

function AppContent() {
  const location = useLocation()
  const navigate = useNavigate()
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registro'

  return (
    <div className="min-h-screen bg-base relative overflow-x-hidden">
      <Sidebar />

      <div className={`ml-20 ${isAuthPage ? 'blur-md pointer-events-none' : ''}`}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/añadir-prenda" element={<AddPrenda />} />
          <Route path="/prenda/:id" element={<PrendaDetail />} />
          <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          {/* Rutas de Login y Registro dentro del switch principal para que funcionen si se accede directamente */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
        </Routes>
      </div>

      {isAuthPage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-[2px]"
          onClick={() => navigate('/')}
        >
          <div className="w-full max-w-md" onClick={e => e.stopPropagation()}>
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