import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Layout/Sidebar'
import HomePage from './pages/HomePage'
import AddPrenda from './pages/AddPrenda'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-base">
        {/* Sidebar fijo a la izquierda */}
        <Sidebar />
        
        {/* Contenido principal a la derecha con margen para el sidebar */}
        <div className="ml-20">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/añadir-prenda" element={<AddPrenda />} />
          </Routes>
        </div>
      </div>
    </Router>
  )
}

export default App
