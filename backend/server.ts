import path from 'node:path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') })

import mongoose from 'mongoose'
import { createApp } from './app'
import uploadRoutes from "./routes/imageUpload"
import blogRoutes from "./routes/blog.routes"
import feedbackRoutes from './routes/feedback.routes'

const app = createApp()
app.use('/api/upload', uploadRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/feedback', feedbackRoutes)
const port = Number(process.env.PORT || 5000)
const mongoUri = process.env.MONGODB_URI

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'finance-calculator-backend',
    dbState: mongoose.connection.readyState
  })
})

async function startServer() {
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing in backend/.env')
  }

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected')
  })

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected')
  })

  await mongoose.connect(mongoUri)

  app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`)
  })
}

startServer().catch((error) => {
  console.error('Failed to start backend:', error.message)
  process.exit(1)
})

const shutdown = async (signal: NodeJS.Signals) => {
  console.log(`Received ${signal}. Closing MongoDB connection...`)
  await mongoose.connection.close()
  process.exit(0)
}

process.on('SIGINT', () => {
  void shutdown('SIGINT')
})

process.on('SIGTERM', () => {
  void shutdown('SIGTERM')
})
