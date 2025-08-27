import Fastify from 'fastify'
import dotenv from 'dotenv'
dotenv.config()

const fastify = Fastify({ logger: true })

fastify.get('/', async () => {
  return { message: 'Healing Simulator API ready 🌙' }
})

const start = async () => {
  try {
    await fastify.listen({ port: 4000 })
    console.log('Server running on http://localhost:4000')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
