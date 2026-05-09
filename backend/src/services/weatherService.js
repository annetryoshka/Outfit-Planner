const fetch = require('node-fetch')

const clasificarClima = (temp) => {
  if (temp <= 10) return 'muy_frio'
  if (temp <= 16) return 'frio'
  if (temp <= 22) return 'templado'
  if (temp <= 28) return 'calido'
  return 'caliente'
}

const getClima = async (ciudad) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=es`
  const response = await fetch(url)
  const data = await response.json()
  if (data.cod !== 200) throw new Error('Ciudad no encontrada')
  const temp = data.main.temp
  return {
    ciudad,
    temperatura: Math.round(temp),
    descripcion: data.weather[0].description,
    clasificacion: clasificarClima(temp)
  }
}

const getClimaPorCoordenadas = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=es`
  const response = await fetch(url)
  const data = await response.json()
  if (data.cod !== 200) throw new Error('No se pudo obtener el clima')
  const temp = data.main.temp
  return {
    ciudad: data.name,
    temperatura: Math.round(temp),
    descripcion: data.weather[0].description,
    clasificacion: clasificarClima(temp)
  }
}

module.exports = { getClima, getClimaPorCoordenadas }