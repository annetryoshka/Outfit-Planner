const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const pool = require('./database')

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK_URL
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const email = profile.emails[0].value
    const nombre = profile.displayName

    // Buscar si ya existe
    const existe = await pool.query(
      'SELECT * FROM users WHERE email = $1', [email]
    )

    if (existe.rows.length > 0) {
      return done(null, existe.rows[0])
    }

    // Crear usuario nuevo
    const nuevo = await pool.query(
      `INSERT INTO users (nombre, email, password, foto_perfil)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [nombre, email, 'google-oauth', profile.photos[0]?.value || null]
    )

    return done(null, nuevo.rows[0])
  } catch (error) {
    return done(error, null)
  }
}))

passport.serializeUser((user, done) => done(null, user.id))
passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id])
    done(null, result.rows[0])
  } catch (err) {
    done(err, null)
  }
})

module.exports = passport