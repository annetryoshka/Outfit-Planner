const rateLimit = require('express-rate-limit')

//100 requests por 15 minutos
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Demasiadas peticiones, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
})

//auth: 5 intentos por 15 minutos
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Demasiados intentos de login, intenta en 15 minutos',
  skipSuccessfulRequests: true,
})

//límite para IA 20 por hora
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: 'Límite de consultas IA alcanzado',
})

module.exports = { generalLimiter, authLimiter, aiLimiter }