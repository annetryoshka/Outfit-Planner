const Groq = require('groq-sdk')

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

const asistente = async (mensaje, prendas = []) => {
  const prendasTexto = prendas.length > 0
    ? `El usuario tiene estas prendas en su inventario: ${prendas.map(p => `${p.nombre} (${p.tipo}, ${p.color})`).join(', ')}.`
    : 'El usuario no tiene prendas en su inventario aún.'

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'system',
        content: `Eres un asistente de moda personal. Ayudas a los usuarios a crear outfits y combinar ropa. 
        ${prendasTexto}
        Responde siempre en español, de forma amigable y concisa.`
      },
      {
        role: 'user',
        content: mensaje
      }
    ],
    max_tokens: 500
  })

  return response.choices[0].message.content
}

module.exports = { asistente }