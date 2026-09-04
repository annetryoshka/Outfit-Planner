const rateLimit = require('express-rate-limit')

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10000,
  message: 'Demasiadas peticiones, intenta más tarde',
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false }
})

//50 intentos por minuto
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: 'Demasiados intentos de login, intenta en 1 minuto',
  skipSuccessfulRequests: true,
  validate: { xForwardedForHeader: false }
})

// IA: 100 por hora para la demo
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100,
  message: 'Límite de consultas IA alcanzado',
  validate: { xForwardedForHeader: false }
})

module.exports = { generalLimiter, authLimiter, aiLimiter }