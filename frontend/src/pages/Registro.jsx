import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/authService'
import logo1 from '../assets/logo1.png'

function Registro() {
  const [form, setForm] = useState({ 
    nombre: '', 
    apellido: '',
    email: '', 
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (form.password !== form.confirmPassword) {
      return setError('Las contraseñas no coinciden')
    }

    setLoading(true)
    setError('')
    try {
      // Enviamos solo los campos que espera el backend (nombre, email, password)
      const { confirmPassword, ...userData } = form
      await authService.register(userData)
      alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.')
      navigate('/login')
    } catch (err) {
      setError(err.message || 'Error al crear la cuenta. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center py-4 px-4">
      <div className="bg-blanco rounded-2xl shadow-xl p-10 w-full max-w-md border border-celeste/30">
        
        <div className="flex justify-center mb-6">
          <img 
            src={logo1} 
            alt="PinWand Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        <p className="text-center text-gray-400 text-sm mb-8">
          Crea tu cuenta y organiza tu estilo
        </p>

        {error && (
          <div className="bg-rosado/30 text-morado text-sm rounded-lg p-3 mb-4 text-center border border-rosado">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-verde mb-1">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={form.nombre}
                onChange={handleChange}
                placeholder="Tu nombre"
                className="w-full border border-celeste rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-morado/50 bg-celeste/5"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-verde mb-1">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={form.apellido}
                onChange={handleChange}
                placeholder="Tu apellido"
                className="w-full border border-celeste rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-morado/50 bg-celeste/5"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-verde mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full border border-celeste rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-morado/50 bg-celeste/5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-verde mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Ingresa una contraseña"
              className="w-full border border-celeste rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-morado/50 bg-celeste/5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-verde mb-1">Confirmar Contraseña</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Reingresa la contraseña"
              className="w-full border border-celeste rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-morado/50 bg-celeste/5"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-morado text-blanco rounded-xl py-3 text-sm font-medium hover:bg-celeste/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 mt-4"
          >
            {loading ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-celeste font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Registro
