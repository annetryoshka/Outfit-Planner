import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import ScrollToTop from './components/ScrollToTop'
import HomePage from './pages/HomePage'
import WishlistPage from './pages/WishlistPage'
import AddPrenda from './pages/AddPrenda'
import PrendaDetail from './pages/PrendaDetail'

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-base">
        {/* Sidebar fijo a la izquierda */}
        <Sidebar />
        
        {/* Contenido principal a la derecha con margen para el sidebar */}
        <div className="ml-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/añadir-prenda" element={<AddPrenda />} />
            <Route path="/prenda/:id" element={<PrendaDetail />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
