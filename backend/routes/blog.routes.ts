import { Router } from 'express'
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  getBlogById,
  getSuggestedBlogs,
  updateBlog,
  deleteBlog
} from '../controllers/blog.controller'
import { requireAuth, requireRole } from '../middleware/auth'

const router = Router()

router.post('/', requireAuth, requireRole('admin'), createBlog)
router.get('/', getAllBlogs)
router.get('/id/:id', requireAuth, requireRole('admin'), getBlogById)
router.get('/:slug/suggestions', getSuggestedBlogs)
router.get('/:slug', getBlogBySlug)
router.put('/:id', requireAuth, requireRole('admin'), updateBlog)
router.delete('/:id', requireAuth, requireRole('admin'), deleteBlog)

export default router
