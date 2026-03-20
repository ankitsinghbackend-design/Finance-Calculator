import path from 'node:path'
import express from 'express'
import cors from 'cors'
import adblockRoutes from './routes/adblock.routes'
import calculatorRoutes from './routes/calculator.routes'
import translationRoutes from './routes/translation.routes'
import sitemapRoutes from './routes/sitemap.routes'
import { configureI18n } from './config/i18n'

export const createApp = () => {
  const app = express()
  configureI18n(app)

  app.disable('x-powered-by')
  app.use(cors({ origin: true }))
  app.use(express.json({ limit: '50kb' }))
  app.use(express.static(path.resolve(process.cwd(), 'dist')))
  app.use(express.static(path.resolve(process.cwd(), 'public')))
  app.use(express.static(path.resolve(process.cwd(), 'backend/public')))
  app.use(express.static(path.resolve(process.cwd(), '../public')))
  app.use(sitemapRoutes)
  app.use(adblockRoutes)
  app.use(calculatorRoutes)
  app.use('/api/i18n', translationRoutes)

  return app
}

export default createApp
