const fetch = require('node-fetch');
const NodeCache = require('node-cache');

//caché con 15 min y borrado de dato expired a los 2min wuuu
const weatherCache = new NodeCache({ stdTTL: 900, checkperiod: 120 });

const clasificarClima = (temp) => {
  if (temp <= 10) return 'muy_frio';
  if (temp <= 16) return 'frio';
  if (temp <= 22) return 'templado';
  if (temp <= 28) return 'calido';
  return 'caliente';
};

const getClima = async (ciudad) => {
  const cacheKey = `clima_ciudad_${ciudad.toLowerCase().trim()}`;

  const cachedValue = weatherCache.get(cacheKey);
  if (cachedValue) {
    console.log(`[⚡ Cache HIT] Clima de ${ciudad} recuperado de memoria.`);
    return cachedValue;
  }

  console.log(`[Cache MISS] Consultando OpenWeather API para: ${ciudad}`);
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=es`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.cod !== 200) throw new Error('Ciudad no encontrada');
  
  const temp = data.main.temp;
  const resultado = {
    ciudad: data.name,
    temperatura: Math.round(temp),
    descripcion: data.weather[0].description,
    clasificacion: clasificarClima(temp)
  };

  //guardar en caché
  weatherCache.set(cacheKey, resultado);

  return resultado;
};

const getClimaPorCoordenadas = async (lat, lon) => {
  //agrupamos un radio de 1km con el mismo caché
  const latKey = parseFloat(lat).toFixed(2);
  const lonKey = parseFloat(lon).toFixed(2);
  const cacheKey = `clima_coord_${latKey}_${lonKey}`;

  const cachedValue = weatherCache.get(cacheKey);
  if (cachedValue) {
    console.log(`[Cache HIT] Clima por coordenadas [${latKey}, ${lonKey}] recuperado de memoria.`);
    return cachedValue;
  }

  console.log(`[Cache MISS] Consultando OpenWeather por coordenadas...`);
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}&units=metric&lang=es`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  if (data.cod !== 200) throw new Error('No se pudo obtener el clima');
  
  const temp = data.main.temp;
  const resultado = {
    ciudad: data.name,
    temperatura: Math.round(temp),
    descripcion: data.weather[0].description,
    clasificacion: clasificarClima(temp)
  };

  weatherCache.set(cacheKey, resultado);

  return resultado;
};

module.exports = { getClima, getClimaPorCoordenadas };