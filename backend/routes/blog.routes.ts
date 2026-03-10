import { Router } from 'express'
import {
  createBlog,
  getAllBlogs,
  getBlogBySlug,
  getSuggestedBlogs,
  updateBlog,
  deleteBlog
} from '../controllers/blog.controller'

const router = Router()

router.post('/', createBlog)
router.get('/', getAllBlogs)
router.get('/:slug/suggestions', getSuggestedBlogs)
router.get('/:slug', getBlogBySlug)
router.put('/:id', updateBlog)
router.delete('/:id', deleteBlog)

export default router
