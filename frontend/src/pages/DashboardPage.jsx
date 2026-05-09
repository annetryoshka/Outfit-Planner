import { useState, useEffect } from 'react'
import { Shirt, Heart, Calendar, TrendingUp } from 'lucide-react'
import api from '../services/api'

const colorHex = (c = '') => ({
  negro: '#1a1a1a', blanco: '#f5f5f5', beige: '#D4C4B0',
  azul: '#5B7FA6', gris: '#9E9E9E', rojo: '#C0392B',
  verde: '#27AE60', rosado: '#E91E8C', morado: '#8E44AD',
})[c.toLowerCase()] ?? '#ccc'

export default function DashboardPage() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get('/prendas').catch(() => ({ data: [] })),
      api.get('/outfits').catch(() => ({ data: [] })),
      api.get('/wishlist').catch(() => ({ data: [] }))
    ]).then(([prendas, outfits, wishlist]) => {
      const p = prendas.data
      const o = outfits.data
      const wBody = wishlist.data
      const w = Array.isArray(wBody?.data) ? wBody.data : (Array.isArray(wBody) ? wBody : [])

      const colores = {}
      p.forEach(pr => { if (pr.color) colores[pr.color] = (colores[pr.color] || 0) + 1 })
      const topColores = Object.entries(colores).sort((a, b) => b[1] - a[1]).slice(0, 4)

      const ocasiones = {}
      o.forEach(ou => { if (ou.ocasion) ocasiones[ou.ocasion] = (ocasiones[ou.ocasion] || 0) + 1 })
      const topOcasion = Object.entries(ocasiones).sort((a, b) => b[1] - a[1])[0]

      const tipos = {}
      p.forEach(pr => { if (pr.tipo) tipos[pr.tipo] = (tipos[pr.tipo] || 0) + 1 })
      const topTipo = Object.entries(tipos).sort((a, b) => b[1] - a[1])[0]

      setStats({
        totalPrendas: p.length,
        totalOutfits: o.length,
        totalWishlist: w.length,
        topColores,
        topOcasion: topOcasion?.[0] || 'ninguna',
        topTipo: topTipo?.[0] || 'ninguno',
      })
    }).catch(() => {
      setStats({
        totalPrendas: 0, totalOutfits: 0, totalWishlist: 0,
        topColores: [], topOcasion: 'ninguna', topTipo: 'ninguno',
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#9f8aef]">Cargando tu dashboard...</p>
    </div>
  )

  if (!stats) return null

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad]/40 to-white p-8">
      <h1 className="text-2xl font-bold text-[#9f8aef] mb-2">
        Hola, {usuario.nombre || 'fashionista'} 🌸
      </h1>
      <p className="text-gray-400 text-sm mb-8">Aquí está el resumen de tu closet virtual</p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Prendas', value: stats.totalPrendas, icon: Shirt, color: '#9f8aef' },
          { label: 'Outfits', value: stats.totalOutfits, icon: Calendar, color: '#79d063' },
          { label: 'Wishlist', value: stats.totalWishlist, icon: Heart, color: '#f6ccfa' },
          { label: 'Ocasión top', value: stats.topOcasion, icon: TrendingUp, color: '#c2e1f9' },
        ].map((s, i) => {
          const Icon = s.icon
          return (
            <div key={i} className="bg-white rounded-2xl p-5 shadow-sm border border-[#f6ccfa] flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: s.color + '30' }}>
                <Icon size={22} style={{ color: s.color }} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400">{s.label}</p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f6ccfa]">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-widest"> Colores más usados</h2>
          {stats.topColores.length === 0 ? (
            <p className="text-sm text-gray-400">Aún no tienes prendas</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.topColores.map(([color, count]) => (
                <div key={color} className="flex items-center gap-3">
                  <span className="w-5 h-5 rounded-full flex-shrink-0 border border-gray-200"
                    style={{ background: colorHex(color) }} />
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600 capitalize">{color}</span>
                      <span className="text-xs text-gray-400">{count} prendas</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all"
                        style={{ width: `${(count / stats.totalPrendas) * 100}%`, background: colorHex(color) }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f6ccfa]">
          <h2 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-widest"> Tu prenda favorita</h2>
          <div className="flex items-center justify-center h-32">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-[#f6ccfa]/50 flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl">
                  {stats.topTipo === 'top' ? '👕' :
                   stats.topTipo === 'bottom' ? '👖' :
                   stats.topTipo === 'outerwear' ? '🧥' :
                   stats.topTipo === 'shoes' ? '👟' : '👗'}
                </span>
              </div>
              <p className="text-lg font-bold text-[#9f8aef] capitalize">{stats.topTipo}</p>
              <p className="text-xs text-gray-400">tipo más en tu closet</p>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 bg-gradient-to-r from-[#9f8aef] to-[#c2e1f9] rounded-2xl p-6 text-white">
          <h2 className="text-sm font-semibold mb-2 uppercase tracking-widest opacity-80">✨ Tip del día</h2>
          <p className="text-lg font-medium">
            {stats.totalPrendas < 5
              ? 'Empieza añadiendo más prendas a tu armario para obtener mejores sugerencias!'
              : stats.totalOutfits === 0
              ? 'Ya tienes prendas, es hora de crear tu primer outfit en el calendario!'
              : `Tienes ${stats.totalPrendas} prendas y ${stats.totalOutfits} outfits. ¡Tu closet está tomando forma!`
            }
          </p>
        </div>
      </div>
    </div>
  )
}