import path from 'node:path'
import fs from 'node:fs'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') })

import mongoose from 'mongoose'
import { createApp } from './app'
import uploadRoutes from "./routes/imageUpload"
import blogRoutes from "./routes/blog.routes"
import feedbackRoutes from './routes/feedback.routes'
import authRoutes from './routes/auth.routes'
import { ensureAdminUser } from './services/auth.service'
import { env } from './config/env'

const app = createApp()
app.use('/api/auth', authRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/blogs', blogRoutes)
app.use('/api/feedback', feedbackRoutes)

app.get('/api/health', (_req, res) => {
  res.status(200).json({
    ok: true,
    service: 'finance-calculator-backend',
    dbState: mongoose.connection.readyState
  })
})

app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.status(404).json({ error: 'Not found' })
    return
  }

  // Path to the built index.html
  const indexPath = path.resolve(process.cwd(), 'dist/index.html')

  if (fs.existsSync(indexPath)) {
    let html = fs.readFileSync(indexPath, 'utf8')
    
    // Determine the current full URL for the canonical tag
    const canonicalUrl = `${env.siteUrl}${req.path}`
    
    // Inject the canonical tag into the head
    const canonicalTag = `<link rel="canonical" href="${canonicalUrl}" />`
    html = html.replace('</head>', `  ${canonicalTag}\n  </head>`)

    res.status(200).send(html)
    return
  }

  res.status(404).send('Page Not Found')
})

async function startServer() {
  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected')
  })

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message)
  })

  mongoose.connection.on('disconnected', () => {
    console.warn('MongoDB disconnected')
  })

  await mongoose.connect(env.mongoUri)

  if (env.shouldSeedAdminOnStart) {
    await ensureAdminUser()
  }

  app.listen(env.port, () => {
    console.log(`Backend server running at http://localhost:${env.port}`)
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
