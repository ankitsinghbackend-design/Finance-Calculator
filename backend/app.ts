import path from 'node:path'
import express from 'express'
import adblockRoutes from './routes/adblock.routes'

export const createApp = () => {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json({ limit: '50kb' }))
  app.use(express.static(path.resolve(process.cwd(), 'backend/public')))
  app.use(adblockRoutes)

  return app
}

export default createApp
