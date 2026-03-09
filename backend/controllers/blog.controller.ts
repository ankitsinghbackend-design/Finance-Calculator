import { Request, Response } from 'express'
import Blog from '../models/Blog'

/**
 * POST /api/blogs
 * Create a new blog post
 */
export async function createBlog(req: Request, res: Response): Promise<void> {
  try {
    const { title, excerpt, content, coverImage, tags, keywords, author, isPublished } = req.body as {
      title?: string
      excerpt?: string
      content?: string
      coverImage?: string
      tags?: string[]
      keywords?: string[]
      author?: string
      isPublished?: boolean
    }

    if (!title || !excerpt || !content) {
      res.status(400).json({ error: 'Title, excerpt, and content are required' })
      return
    }

    const blog = new Blog({
      title,
      excerpt,
      content,
      coverImage: coverImage ?? '',
      tags: tags ?? [],
      keywords: keywords ?? [],
      author: author ?? 'Admin',
      isPublished: isPublished ?? false
    })

    await blog.save()
    res.status(201).json(blog)
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({ error: 'A blog with this title already exists' })
      return
    }
    console.error('Error creating blog:', error)
    res.status(500).json({ error: 'Failed to create blog' })
  }
}

/**
 * GET /api/blogs
 * Get all published blogs (sorted by newest first)
 */
export async function getAllBlogs(_req: Request, res: Response): Promise<void> {
  try {
    const blogs = await Blog.find({ isPublished: true })
      .sort({ createdAt: -1 })
      .select('-content')
      .lean()

    res.json(blogs)
  } catch (error) {
    console.error('Error fetching blogs:', error)
    res.status(500).json({ error: 'Failed to fetch blogs' })
  }
}

/**
 * GET /api/blogs/:slug
 * Get a single blog post by its slug
 */
export async function getBlogBySlug(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params
    const blog = await Blog.findOne({ slug }).lean()

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }

    res.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    res.status(500).json({ error: 'Failed to fetch blog' })
  }
}

/**
 * PUT /api/blogs/:id
 * Update an existing blog post
 */
export async function updateBlog(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const { title, excerpt, content, coverImage, tags, keywords, author, isPublished } = req.body as {
      title?: string
      excerpt?: string
      content?: string
      coverImage?: string
      tags?: string[]
      keywords?: string[]
      author?: string
      isPublished?: boolean
    }

    const blog = await Blog.findById(id)

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }

    if (title !== undefined) blog.title = title
    if (excerpt !== undefined) blog.excerpt = excerpt
    if (content !== undefined) blog.content = content
    if (coverImage !== undefined) blog.coverImage = coverImage
    if (tags !== undefined) blog.tags = tags
    if (keywords !== undefined) blog.keywords = keywords
    if (author !== undefined) blog.author = author
    if (isPublished !== undefined) blog.isPublished = isPublished

    await blog.save()
    res.json(blog)
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('duplicate key')) {
      res.status(409).json({ error: 'A blog with this title already exists' })
      return
    }
    console.error('Error updating blog:', error)
    res.status(500).json({ error: 'Failed to update blog' })
  }
}

/**
 * DELETE /api/blogs/:id
 * Delete a blog post
 */
export async function deleteBlog(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const blog = await Blog.findByIdAndDelete(id)

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }

    res.json({ message: 'Blog deleted successfully' })
  } catch (error) {
    console.error('Error deleting blog:', error)
    res.status(500).json({ error: 'Failed to delete blog' })
  }
}
