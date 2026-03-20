import { Router, type Request, type Response } from 'express'
import Blog from '../models/Blog'

const router = Router()

const siteUrl = (
  process.env.SITE_URL ||
  process.env.FRONTEND_URL ||
  'https://fincalco.com'
).replace(/\/$/, '')

const calculatorSlugs = [
  'amortization',
  'auto-loan',
  'mortgage',
  'mortgage-payoff',
  '401k',
  'salary',
  'currency',
  'compound-interest',
  'student-loan',
  'income-tax',
  'pension',
  'social-security',
  'investment',
  'interest-rate',
  'estate-tax',
  'loan',
  'heloc',
  'rent-vs-buy',
  'auto-lease',
  'apr',
  'sales-tax',
  'dti-ratio',
  'fha-loan',
  'va-mortgage',
  'refinance',
  'rental-property',
  'down-payment',
  'cash-back-or-low-interest',
  'annuity',
  'roth-ira',
  'rmd',
  'bond',
  'mutual-fund',
  'college-cost',
  'house-affordability',
  'repayment',
  'depreciation',
  'business-loan',
  'payback-period'
]

type SitemapUrl = {
  loc: string
  lastmod: string
  priority: string
}

const toIsoDate = (value: Date): string => value.toISOString().split('T')[0]

const xmlEscape = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')

const buildSitemapXml = (entries: SitemapUrl[]): string => {
  const urls = entries
    .map(
      ({ loc, lastmod, priority }) => `  <url>\n    <loc>${xmlEscape(loc)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n  </url>`
    )
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
}

router.get('/sitemap.xml', async (_req: Request, res: Response) => {
  try {
    const today = toIsoDate(new Date())

    const staticEntries: SitemapUrl[] = [
      {
        loc: `${siteUrl}/`,
        lastmod: today,
        priority: '1.0'
      },
      {
        loc: `${siteUrl}/finance`,
        lastmod: today,
        priority: '0.9'
      },
      {
        loc: `${siteUrl}/tools`,
        lastmod: today,
        priority: '0.9'
      },
      {
        loc: `${siteUrl}/blogs`,
        lastmod: today,
        priority: '0.8'
      }
    ]

    const calculatorEntries: SitemapUrl[] = calculatorSlugs.map((slug) => ({
      loc: `${siteUrl}/calculators/${slug}`,
      lastmod: today,
      priority: '0.9'
    }))

    const blogs = await Blog.find({ isPublished: true })
      .sort({ updatedAt: -1 })
      .select('slug updatedAt')
      .lean<Array<{ slug: string; updatedAt?: Date }>>()

    const blogEntries: SitemapUrl[] = blogs.map((blog) => ({
      loc: `${siteUrl}/blogs/${blog.slug}`,
      lastmod: blog.updatedAt instanceof Date ? toIsoDate(blog.updatedAt) : today,
      priority: '0.8'
    }))

    const xml = buildSitemapXml([...staticEntries, ...calculatorEntries, ...blogEntries])

    res.header('Content-Type', 'application/xml')
    res.status(200).send(xml)
  } catch (error) {
    console.error('Failed generating sitemap.xml:', error)
    res.status(500).json({ error: 'Failed to generate sitemap.xml' })
  }
})

export default router
