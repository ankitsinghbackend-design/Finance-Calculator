import { Router } from 'express'
import { supportedLanguages } from '../config/i18n'

const router = Router()

router.get('/locales', (_req, res) => {
  res.status(200).json({
    defaultLocale: 'en',
    languages: supportedLanguages
  })
})

export default router
