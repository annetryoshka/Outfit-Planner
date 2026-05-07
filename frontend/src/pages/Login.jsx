import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import authService from '../services/authService'
import logo1 from '../assets/logo1.png'

function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    console.log('Intentando login con:', form.email)
    try {
      const response = await authService.login(form)
      console.log('Login exitoso:', response)
      navigate('/')
    } catch (err) {
      console.error('Error en login:', err)
      setError(err.message || 'Email o contraseña incorrectos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center p-4">
      <div className="bg-blanco rounded-2xl shadow-xl p-10 w-full max-w-md border border-celeste/30">
        
        <div className="flex justify-center mb-6">
          <img 
            src={logo1} 
            alt="PinWand Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>
        <p className="text-center text-gray-400 text-sm mb-8">
          Inicia sesión en tu closet virtual!
        </p>

        {error && (
          <div className="bg-rosado/30 text-morado text-sm rounded-lg p-3 mb-4 border border-rosado">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-morado mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="tu@email.com"
              className="w-full border border-rosado rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-morado/50 bg-celeste/5"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-morado mb-1">Contraseña</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder=" "
              className="w-full border border-rosado rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-morado/50 bg-celeste/5"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-verde text-blanco rounded-xl py-3 text-sm font-medium hover:bg-verde/90 transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-400 mt-6">
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className="text-celeste font-medium hover:underline">
            Regístrate
          </Link>
        </p>

      </div>
    </div>
  )
}

export default Login