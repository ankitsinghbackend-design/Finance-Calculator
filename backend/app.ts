import path from 'node:path'
import express from 'express'
import cors from 'cors'
import adblockRoutes from './routes/adblock.routes'
import calculatorRoutes from './routes/calculator.routes'

export const createApp = () => {
  const app = express()

  app.disable('x-powered-by')
  app.use(cors({ origin: true }))
  app.use(express.json({ limit: '50kb' }))
  app.use(express.static(path.resolve(process.cwd(), 'backend/public')))
  app.use(adblockRoutes)
  app.use(calculatorRoutes)

  return app
}

export default createApp
