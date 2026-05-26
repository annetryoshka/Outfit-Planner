import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Chart from 'react-apexcharts'
import {
  Shirt, Heart, Calendar, TrendingUp,
  Palette, LayoutGrid, Sparkles, AlertCircle,
  CheckCircle2, Info, Star, ShoppingBag, 
  Layers, 
  Cloud, 
  Footprints, 
  Gem, 
  Sun, 
  Briefcase, 
  PartyPopper, 
  Building2, 
  Activity, 
  Palmtree,
  HelpCircle,
  Search
} from 'lucide-react'
import api from '../services/api'
import logo6 from '../assets/logo6.png'

const colorHex = (c = '') => ({
  negro: '#2d2d2d', blanco: '#d8afaf', beige: '#C8AA8F',
  azul: '#4A72A0', gris: '#7A7A7A', rojo: '#611515',
  verde: '#1d5743', rosado: '#CC1878', morado: '#9442bd',
  amarillo: '#C8A010', naranja: '#C85820', café: '#7A5030',
})[c.toLowerCase()] ?? '#6a77b3'

const tipoIcon = (t) => ({
  top: Shirt,
  bottom: Layers,        // Estilizado para capas inferiores (pantalones/faldas)
  outerwear: Cloud,      // Para abrigos y ropa de exterior
  shoes: Footprints,     // Pisadas limpias para calzado
  dress: Sparkles,       // Toque glamuroso para vestidos
  accessory: Gem         // Joyas y complementos
})[t?.toLowerCase()] ?? HelpCircle

const tipoLabel = (t) => ({
  top: 'Superior', 
  bottom: 'Inferior', 
  outerwear: 'Abrigo', 
  shoes: 'Calzado', 
  dress: 'Vestido', 
  accessory: 'Accesorio'
})[t?.toLowerCase()] ?? t

const ocasionLabel = (o) => ({
  casual: 'Casual', 
  formal: 'Formal', 
  fiesta: 'Fiesta / Noche',
  trabajo: 'Trabajo', 
  deporte: 'Deporte', 
  playa: 'Playa',
})[o?.toLowerCase()] ?? o ?? '—'

const ocasionIcon = (o) => ({
  casual: Sun,
  formal: Briefcase,
  fiesta: PartyPopper,
  trabajo: Building2,
  deporte: Activity,
  playa: Palmtree
})[o?.toLowerCase()] ?? HelpCircle

function DSSPanel({ stats }) {
  const pct = (n) => stats.totalPrendas > 0 ? Math.round((n / stats.totalPrendas) * 100) : 0
  const topColorEntry = stats.topColores[0]
  const diversidad = stats.allTipos.length
  const equilibrio = stats.allTipos.length > 0
    ? Math.round(100 - ((stats.allTipos[0][1] / stats.totalPrendas) * 100))
    : 0

  const insights = [
    {
      level: stats.totalPrendas < 5 ? 'warn' : 'ok',
      icon: stats.totalPrendas < 5 ? AlertCircle : CheckCircle2,
      text: stats.totalPrendas < 5
        ? `Tu clóset tiene pocas prendas (${stats.totalPrendas}). Añade más para mejores sugerencias.`
        : `Clóset activo con ${stats.totalPrendas} prendas en ${diversidad} categoría${diversidad !== 1 ? 's' : ''}.`,
    },
    topColorEntry && {
      level: 'info',
      icon: Palette,
      text: `Tu color predominante es ${topColorEntry[0]} (${pct(topColorEntry[1])}% del guardarropa).`,
    },
    {
      level: stats.totalOutfits === 0 ? 'warn' : 'ok',
      icon: stats.totalOutfits === 0 ? AlertCircle : Star,
      text: stats.totalOutfits === 0
        ? 'Aún no has armado ningún outfit. ¡Crea el primero!'
        : `Has combinado ${stats.totalOutfits} outfit${stats.totalOutfits !== 1 ? 's' : ''}. Tu ocasión favorita: ${ocasionLabel(stats.topOcasion)}.`,
    },
    {
      level: equilibrio < 30 ? 'warn' : 'ok',
      icon: equilibrio < 30 ? Info : CheckCircle2,
      text: equilibrio < 30
        ? `Tu clóset está muy concentrado en "${tipoLabel(stats.topTipo)}". Considera diversificar.`
        : `Guardarropa equilibrado: ${tipoLabel(stats.topTipo)} es el core, con buen mix de ${diversidad} tipos.`,
    },
    stats.totalWishlist > 0 && {
      level: 'info',
      icon: ShoppingBag,
      text: `Tienes ${stats.totalWishlist} prenda${stats.totalWishlist !== 1 ? 's' : ''} en wishlist pendiente de añadir al clóset.`,
    },
  ].filter(Boolean)

  const colorMap = {
    ok:   { bg: 'bg-emerald-50', border: 'border-emerald-200', icon: 'text-emerald-500', text: 'text-emerald-800' },
    warn: { bg: 'bg-amber-50',   border: 'border-amber-200',   icon: 'text-amber-500',   text: 'text-amber-800'   },
    info: { bg: 'bg-violet-50',  border: 'border-violet-200',  icon: 'text-violet-500',  text: 'text-violet-800'  },
  }

  const TipoIconCore = tipoIcon(stats.topTipo)

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f6ccfa] mb-6">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={16} className="text-[#9f8aef]" />
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">
          Análisis de tu guardarropa
        </h2>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Prendas totales',  value: stats.totalPrendas,                                 sub: 'en clóset' },
          { label: 'Outfits armados',  value: stats.totalOutfits,                                 sub: 'combinaciones' },
          { label: 'Color principal',  value: topColorEntry ? topColorEntry[0] : '—',                  sub: topColorEntry ? `${pct(topColorEntry[1])}% del clóset` : 'sin datos' },
          { 
            label: 'Tipo core',        
            value: tipoLabel(stats.topTipo),                                 
            sub: (
              <span className="flex items-center justify-center sm:justify-start gap-1">
                Prenda común <TipoIconCore size={12} className="text-gray-400" />
              </span>
            ) 
          },
        ].map((k, i) => (
          <div key={i} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
            <p className="text-[11px] text-gray-400 uppercase tracking-wider">{k.label}</p>
            <p className="text-xl font-bold text-gray-800 capitalize leading-tight">{k.value}</p>
            <div className="text-[11px] text-gray-400">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Insight list */}
      <div className="flex flex-col gap-2">
        {insights.map((ins, i) => {
          const c = colorMap[ins.level]
          const Icon = ins.icon
          return (
            <div key={i} className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${c.bg} ${c.border}`}>
              <Icon size={15} className={`mt-0.5 flex-shrink-0 ${c.icon}`} />
              <p className={`text-sm leading-snug ${c.text}`}>{ins.text}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

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
      const topColores = Object.entries(colores).sort((a, b) => b[1] - a[1]).slice(0, 5)

      const ocasiones = {}
      o.forEach(ou => { if (ou.ocasion) ocasiones[ou.ocasion] = (ocasiones[ou.ocasion] || 0) + 1 })
      const topOcasion = Object.entries(ocasiones).sort((a, b) => b[1] - a[1])[0]

      const tipos = {}
      p.forEach(pr => { if (pr.tipo) tipos[pr.tipo] = (tipos[pr.tipo] || 0) + 1 })
      const allTipos = Object.entries(tipos).sort((a, b) => b[1] - a[1])
      const topTipo = allTipos[0]

      setStats({
        totalPrendas: p.length,
        totalOutfits: o.length,
        totalWishlist: w.length,
        topColores,
        topOcasion: topOcasion?.[0] || 'ninguna',
        allOcasiones: Object.entries(ocasiones).sort((a, b) => b[1] - a[1]),
        topTipo: topTipo?.[0] || 'ninguno',
        allTipos,
      })
    }).catch(() => {
      setStats({
        totalPrendas: 0, totalOutfits: 0, totalWishlist: 0,
        topColores: [], topOcasion: 'ninguna', allOcasiones: [],
        topTipo: 'ninguno', allTipos: [],
      })
    }).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-[#9f8aef]">Cargando tu dashboard...</p>
    </div>
  )
  if (!stats) return null

  const pct = (n) => stats.totalPrendas > 0 ? Math.round((n / stats.totalPrendas) * 100) : 0

  // ── Donut: distribución de colores ──────────────────────────────────────
  const donutSeries = stats.topColores.map(([, c]) => c)
  const donutLabels = stats.topColores.map(([color, count]) =>
    `${color.charAt(0).toUpperCase() + color.slice(1)} (${pct(count)}%)`
  )
  const donutColors = stats.topColores.map(([color]) => colorHex(color))

  const donutOptions = {
    chart: { type: 'donut', background: 'transparent', toolbar: { show: false } },
    labels: donutLabels,
    colors: donutColors,
    dataLabels: {
      enabled: true,
      formatter: (val) => `${Math.round(val)}%`,
      style: { fontSize: '11px', fontFamily: 'inherit', fontWeight: 700, colors: ['#fff'] },
      dropShadow: { enabled: true, blur: 3, opacity: 0.4 },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '62%',
          labels: {
            show: true,
            total: {
              show: true,
              label: 'Prendas',
              fontSize: '12px',
              fontFamily: 'inherit',
              color: '#abaf9c',
              formatter: () => `${stats.totalPrendas}`,
            },
            value: {
              fontSize: '22px',
              fontFamily: 'inherit',
              fontWeight: 700,
              color: '#c462bb',
              formatter: (val) => val,
            },
            name: { fontSize: '11px', fontFamily: 'inherit', color: '#6158e4', offsetY: 4 },
          },
        },
      },
    },
    legend: {
      position: 'bottom',
      fontFamily: 'inherit',
      fontSize: '12px',
      labels: { colors: '#859cca' },
      markers: { width: 10, height: 10, radius: 3 },
      itemMargin: { horizontal: 8, vertical: 4 },
    },
    stroke: { width: 2, colors: ['#fff'] },
    tooltip: {
      y: {
        formatter: (val) => {
          const p = stats.totalPrendas > 0 ? Math.round((val / stats.totalPrendas) * 100) : 0
          return `${val} prendas (${p}%)`
        },
      },
      style: { fontFamily: 'inherit', fontSize: '12px' },
    },
  }

  // ── Bar horizontal: tipos de prenda (Sin Emojis) ─────────────────────────
  const barPastel = ['#c4b5fd', '#86efac', '#f9a8d4', '#93c5fd', '#fcd34d', '#6ee7b7']
  const barCategories = stats.allTipos.map(([tipo]) => tipoLabel(tipo))
  const barData = stats.allTipos.map(([, count]) => count)
  const barColors = stats.allTipos.map((_, i) => barPastel[i % barPastel.length])
  const barHeight = Math.max(180, stats.allTipos.length * 52 + 60)

  const barOptions = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: true,
        borderRadius: 7,
        borderRadiusApplication: 'end',
        barHeight: '58%',
        distributed: true,
      },
    },
    colors: barColors,
    dataLabels: {
      enabled: true,
      formatter: (val) => {
        const p = stats.totalPrendas > 0 ? Math.round((val / stats.totalPrendas) * 100) : 0
        return `${val}  (${p}%)`
      },
      style: { fontSize: '11px', fontFamily: 'inherit', fontWeight: 700, colors: ['#374151'] },
      offsetX: 8,
    },
    xaxis: {
      categories: barCategories,
      labels: {
        style: { fontSize: '11px', fontFamily: 'inherit', colors: '#9ca3af' },
        formatter: (val) => Number.isInteger(Number(val)) ? val : '',
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: '12px', fontFamily: 'inherit', colors: '#6b7280' } },
    },
    grid: {
      borderColor: '#f3e8ff',
      strokeDashArray: 4,
      xaxis: { lines: { show: true } },
      yaxis: { lines: { show: false } },
    },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val) => {
          const p = stats.totalPrendas > 0 ? Math.round((val / stats.totalPrendas) * 100) : 0
          return `${val} prenda${val !== 1 ? 's' : ''} · ${p}% del clóset`
        },
      },
      style: { fontFamily: 'inherit', fontSize: '12px' },
    },
  }

  // ── Barras verticales: ocasiones (Sin Emojis) ─────────────────────────────
  const ocColors = ['#9f8aef', '#79d063', '#f6a5c0', '#60b4f5', '#f0c060', '#5ecfb0']
  const ocCategories = stats.allOcasiones.map(([oc]) => ocasionLabel(oc))
  const ocData = stats.allOcasiones.map(([, c]) => c)
  const ocBarColors = stats.allOcasiones.map((_, i) => ocColors[i % ocColors.length])
  const ocHeight = Math.max(180, stats.allOcasiones.length * 48 + 60)

  const ocOptions = {
    chart: { type: 'bar', background: 'transparent', toolbar: { show: false } },
    plotOptions: {
      bar: {
        horizontal: false,
        borderRadius: 8,
        borderRadiusApplication: 'end',
        columnWidth: '52%',
        distributed: true,
      },
    },
    colors: ocBarColors,
    dataLabels: {
      enabled: true,
      formatter: (val) => val,
      style: { fontSize: '11px', fontFamily: 'inherit', fontWeight: 700, colors: ['#374151'] },
      offsetY: -5,
    },
    xaxis: {
      categories: ocCategories,
      labels: { style: { fontSize: '11px', fontFamily: 'inherit', colors: '#6b7280' } },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: { fontSize: '11px', fontFamily: 'inherit', colors: '#9ca3af' },
        formatter: (val) => Number.isInteger(Number(val)) ? val : '',
      },
    },
    grid: { borderColor: '#f3e8ff', strokeDashArray: 4 },
    legend: { show: false },
    tooltip: {
      y: { formatter: (val) => `${val} outfit${val !== 1 ? 's' : ''}` },
      style: { fontFamily: 'inherit', fontSize: '12px' },
    },
  }

  const OcasionIconTop = ocasionIcon(stats.topOcasion)

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fafbad] from-5% via-white via-50% to-[#fafbad] to-95% bg-fixed">
      {/* ── Navbar — fixed, transparente ── */}
      <div className="fixed top-0 left-0 w-full z-50 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div className="max-w-[1400px] mx-auto px-4 flex items-center">
          <button onClick={() => navigate('/')} className="h-10 w-auto cursor-pointer ml-8 mr-6 hover:opacity-90 transition-all">
            <img src={logo6} alt="PinWand" className="h-full w-auto object-contain" />
          </button>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar prendas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-gray-200 text-gray-700 transition-all font-medium"
            />
          </div>
        </div>
      </div>

      {/* ── Contenedor Principal con max-width ── */}
      <div className="max-w-[1260px] mx-auto px-4 pt-24 pb-10">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-[#9f8aef]">Cargando tu dashboard...</p>
          </div>
        ) : !stats ? null : (
          <>
            {/* ── Panel DSS ── */}
            <DSSPanel stats={stats} />

            {/* ── Gráficos fila 1: paleta de color + tipos ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f6ccfa]">
                <div className="flex items-center gap-2 mb-1">
                  <Palette size={15} className="text-[#9f8aef]" />
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Paleta de color</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Distribución de colores sobre el total de prendas</p>
                {donutSeries.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-sm text-gray-400">Aún no hay prendas registradas</div>
                ) : (
                  <Chart type="donut" series={donutSeries} options={donutOptions} height={270} />
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f6ccfa]">
                <div className="flex items-center gap-2 mb-1">
                  <LayoutGrid size={15} className="text-[#79d063]" />
                  <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Core del guardarropa</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">Qué tipo de prenda predomina y su porcentaje del total</p>
                {barData.length === 0 ? (
                  <div className="flex items-center justify-center h-48 text-sm text-gray-400">Aún no hay prendas registradas</div>
                ) : (
                  <Chart type="bar" series={[{ name: 'Prendas', data: barData }]} options={barOptions} height={barHeight} />
                )}
              </div>
            </div>

            {/* ── Gráfico fila 2: ocasiones ── */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-[#f6ccfa] mb-6">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp size={15} className="text-[#60b4f5]" />
                <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-widest">Estilo de vida · Ocasiones</h2>
              </div>
              <p className="text-xs text-gray-400 mb-4">Para qué tipo de eventos te vistes más según tus outfits registrados</p>
              {ocData.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-sm text-gray-400">
                  Aún no hay outfits con ocasión registrada
                </div>
              ) : (
                <Chart type="bar" series={[{ name: 'Outfits', data: ocData }]} options={ocOptions} height={ocHeight} />
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}