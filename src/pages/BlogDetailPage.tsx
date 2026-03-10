import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import DOMPurify from 'dompurify'
import { apiUrl } from '../config/api'

interface Blog {
  _id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  tags: string[]
  keywords: string[]
  author: string
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

interface SuggestedBlog {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  tags: string[]
  keywords: string[]
  author: string
  createdAt: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  })
}

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const [blog, setBlog] = useState<Blog | null>(null)
  const [suggestedBlogs, setSuggestedBlogs] = useState<SuggestedBlog[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function fetchBlog() {
      if (!slug) return

      setLoading(true)
      setError('')

      try {
        const [{ data: blogData }, { data: suggestionsData }] = await Promise.all([
          axios.get<Blog>(apiUrl(`/api/blogs/${slug}`)),
          axios.get<SuggestedBlog[]>(apiUrl(`/api/blogs/${slug}/suggestions`))
        ])

        setBlog(blogData)
        setSuggestedBlogs(suggestionsData)
      } catch {
        setBlog(null)
        setSuggestedBlogs([])
        setError('Blog post not found')
      } finally {
        setLoading(false)
      }
    }
    fetchBlog()
  }, [slug])

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-heading border-r-transparent" />
        <p className="mt-4 text-sub">Loading...</p>
      </div>
    )
  }

  if (error || !blog) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-heading mb-4">Blog Not Found</h1>
        <p className="text-sub mb-6">{error || 'The blog post you are looking for does not exist.'}</p>
        <Link to="/blogs" className="text-primary font-medium hover:underline">
          ← Back to all blogs
        </Link>
      </div>
    )
  }

  return (
    <article className="container mx-auto px-6 py-10 max-w-4xl">
      {/* Back Link */}
      <Link to="/blogs" className="inline-flex items-center text-sub hover:text-heading transition-colors mb-8 text-sm">
        ← Back to all blogs
      </Link>

      {/* Tags */}
      {blog.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map(tag => (
            <span
              key={tag}
              className="bg-[#ebf2fe] text-heading text-xs font-semibold uppercase px-3 py-1.5 rounded-md tracking-wide"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-heading text-3xl md:text-4xl font-bold font-figtree leading-tight mb-4">
        {blog.title}
      </h1>

      {/* Meta */}
      <div className="flex items-center gap-4 text-sub text-sm mb-4">
        <span>By {blog.author}</span>
        <span>•</span>
        <time dateTime={blog.createdAt}>{formatDate(blog.createdAt)}</time>
      </div>

      {/* Edit / Delete Actions */}
      <div className="flex items-center gap-3 mb-8">
        <Link
          to={`/admin/blog-editor/${blog._id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          ✏️ Edit Post
        </Link>
        <button
          onClick={async () => {
            if (!window.confirm('Are you sure you want to delete this blog post? This action cannot be undone.')) return
            setDeleting(true)
            try {
              await axios.delete(apiUrl(`/api/blogs/${blog._id}`))
              navigate('/blogs')
            } catch {
              setError('Failed to delete blog post')
              setDeleting(false)
            }
          }}
          disabled={deleting}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          🗑️ {deleting ? 'Deleting...' : 'Delete Post'}
        </button>
      </div>

      {/* Cover Image */}
      {blog.coverImage && (
        <div className="w-full rounded-xl overflow-hidden mb-10">
          <img
            src={blog.coverImage}
            alt={blog.title}
            className="w-full max-h-[450px] object-cover"
          />
        </div>
      )}

      {/* Blog Content */}
      <div
        className="blog-content max-w-none"
        dangerouslySetInnerHTML={{
          __html: DOMPurify.sanitize(blog.content)
        }}
      />

      {/* Suggested reading */}
      {suggestedBlogs.length > 0 && (
        <section className="mt-16 pt-10 border-t border-cardBorder">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sub mb-3">
              Continue reading
            </p>
            <h2 className="text-2xl md:text-3xl font-bold font-figtree text-heading">
              Suggested articles
            </h2>
            <p className="mt-2 text-sub max-w-2xl">
              More stories picked from similar keywords and the latest posts on Finovo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestedBlogs.map((suggestedBlog) => (
              <Link
                key={suggestedBlog._id}
                to={`/blogs/${suggestedBlog.slug}`}
                className="group rounded-2xl border border-cardBorder bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="h-44 bg-alt overflow-hidden">
                  {suggestedBlog.coverImage ? (
                    <img
                      src={suggestedBlog.coverImage}
                      alt={suggestedBlog.title}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sub text-sm">
                      No image available
                    </div>
                  )}
                </div>

                <div className="p-5">
                  <div className="flex flex-wrap items-center gap-2 mb-3 text-xs text-sub uppercase tracking-wide">
                    <span>{formatDate(suggestedBlog.createdAt)}</span>
                    {suggestedBlog.tags[0] ? (
                      <>
                        <span>•</span>
                        <span className="text-heading font-semibold">{suggestedBlog.tags[0]}</span>
                      </>
                    ) : null}
                  </div>

                  <h3 className="text-lg font-semibold font-figtree text-heading leading-snug group-hover:text-primary transition-colors">
                    {suggestedBlog.title}
                  </h3>

                  <p className="mt-3 text-sm text-sub leading-6 line-clamp-3">
                    {suggestedBlog.excerpt}
                  </p>

                  <div className="mt-5 text-sm font-medium text-heading group-hover:text-primary transition-colors">
                    Read article →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Keywords (for SEO visibility) */}
      {blog.keywords.length > 0 && (
        <div className="mt-12 pt-8 border-t border-cardBorder">
          <p className="text-xs text-sub">
            <span className="font-medium">Keywords:</span>{' '}
            {blog.keywords.join(', ')}
          </p>
        </div>
      )}

      {/* Back Link Bottom */}
      <div className="mt-12 pt-8 border-t border-cardBorder">
        <Link
          to="/blogs"
          className="inline-block bg-heading text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
        >
          ← Back to All Blogs
        </Link>
      </div>
    </article>
  )
}
