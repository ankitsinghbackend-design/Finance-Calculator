import { Request, Response } from 'express'
import Blog from '../models/Blog'

type BlogSummary = {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  tags: string[]
  keywords: string[]
  author: string
  createdAt: Date
}

const normalizeTerms = (values: string[] = []): string[] =>
  values
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean)

const countMatches = (source: string[], candidates: string[]): number => {
  const sourceSet = new Set(normalizeTerms(source))

  return normalizeTerms(candidates).reduce((count, item) => {
    return sourceSet.has(item) ? count + 1 : count
  }, 0)
}

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
    const blog = await Blog.findOne({ slug }).lean<{ isPublished: boolean } & Record<string, unknown> | null>()

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }

    if (!blog.isPublished) {
      res.status(410).json({ error: 'Content removed' })
      return
    }

    res.json(blog)
  } catch (error) {
    console.error('Error fetching blog:', error)
    res.status(500).json({ error: 'Failed to fetch blog' })
  }
}

/**
 * GET /api/blogs/id/:id
 * Get a single blog post by its MongoDB _id
 */
export async function getBlogById(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params
    const blog = await Blog.findById(id).lean()

    if (!blog) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }

    res.json(blog)
  } catch (error) {
    console.error('Error fetching blog by id:', error)
    res.status(500).json({ error: 'Failed to fetch blog' })
  }
}

/**
 * GET /api/blogs/:slug/suggestions
 * Return up to 3 suggested published articles.
 * Priority order:
 * 1. Shared keywords / tags with the current article
 * 2. Latest published articles as fallback
 */
export async function getSuggestedBlogs(req: Request, res: Response): Promise<void> {
  try {
    const { slug } = req.params

    const currentBlog = await Blog.findOne({ slug, isPublished: true })
      .select('slug tags keywords')
      .lean<{ slug: string; tags: string[]; keywords: string[] } | null>()

    if (!currentBlog) {
      res.status(404).json({ error: 'Blog not found' })
      return
    }

    const relatedCandidates = await Blog.find({
      isPublished: true,
      slug: { $ne: slug },
      $or: [
        { keywords: { $in: currentBlog.keywords ?? [] } },
        { tags: { $in: currentBlog.tags ?? [] } }
      ]
    })
      .sort({ createdAt: -1 })
      .select('title slug excerpt coverImage tags keywords author createdAt')
      .lean<BlogSummary[]>()

    const scoredRelated = relatedCandidates
      .map((candidate) => ({
        ...candidate,
        score:
          countMatches(currentBlog.keywords ?? [], candidate.keywords ?? []) * 3 +
          countMatches(currentBlog.tags ?? [], candidate.tags ?? [])
      }))
      .sort((left, right) => {
        if (right.score !== left.score) {
          return right.score - left.score
        }

        return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      })

    const selected = scoredRelated.slice(0, 3)
    const selectedIds = new Set(selected.map((blog) => String(blog._id)))

    if (selected.length < 3) {
      const latestFallback = await Blog.find({
        isPublished: true,
        slug: { $ne: slug }
      })
        .sort({ createdAt: -1 })
        .select('title slug excerpt coverImage tags keywords author createdAt')
        .lean<BlogSummary[]>()

      for (const blog of latestFallback) {
        if (selected.length >= 3) {
          break
        }

        const blogId = String(blog._id)
        if (selectedIds.has(blogId)) {
          continue
        }

        selected.push({ ...blog, score: 0 })
        selectedIds.add(blogId)
      }
    }

    res.json(
      selected.map(({ score: _score, ...blog }) => blog)
    )
  } catch (error) {
    console.error('Error fetching suggested blogs:', error)
    res.status(500).json({ error: 'Failed to fetch suggested blogs' })
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
