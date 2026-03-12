import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { apiUrl } from '../config/api'
import { useAuth } from '../context/AuthContext'

interface BlogSummary {
  _id: string
  title: string
  slug: string
  excerpt: string
  coverImage: string
  tags: string[]
  author: string
  createdAt: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  }).toUpperCase()
}

export default function BlogListPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [blogs, setBlogs] = useState<BlogSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const isAdmin = user?.role === 'admin'

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const { data } = await axios.get<BlogSummary[]>(apiUrl('/api/blogs'))
        setBlogs(data)
      } catch {
        setError('Failed to load blogs')
      } finally {
        setLoading(false)
      }
    }
    fetchBlogs()
  }, [])

  const handleDelete = async (e: React.MouseEvent, blogId: string, title: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) return

    try {
      await axios.delete(apiUrl(`/api/blogs/${blogId}`))
      setBlogs(prev => prev.filter(b => b._id !== blogId))
    } catch {
      setError('Failed to delete blog post')
    }
  }

  const handleEdit = (e: React.MouseEvent, blogId: string) => {
    e.preventDefault()
    e.stopPropagation()
    navigate(`/admin/blog-editor/${blogId}`)
  }

  // Group blogs by first tag
  const grouped = blogs.reduce<Record<string, BlogSummary[]>>((acc, blog) => {
    const category = blog.tags[0] ?? 'General'
    if (!acc[category]) acc[category] = []
    acc[category].push(blog)
    return acc
  }, {})

  if (loading) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-heading border-r-transparent" />
        <p className="mt-4 text-sub">Loading blogs...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-6 py-20 text-center">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Banner */}
      <div className="relative w-full h-[340px] rounded-xl overflow-hidden mx-auto max-w-6xl mt-6">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-600 rounded-xl" />
        <div className="absolute inset-0 bg-black/20 rounded-xl" />
        <div className="relative z-10 flex items-end h-full px-10 pb-10">
          <h1 className="text-white text-4xl md:text-5xl font-semibold font-figtree leading-tight max-w-3xl">
            Insights about personal finance, investments, and everything in between
          </h1>
        </div>
      </div>

      {/* Blog Posts by Category */}
      <div className="max-w-6xl mx-auto px-6 py-16 space-y-20">
        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-20 space-y-6">
            <div className="text-6xl">📝</div>
            <p className="text-heading text-xl font-semibold font-figtree">No blog posts yet</p>
            <p className="text-sub text-base max-w-md mx-auto">
              {isAdmin
                ? 'Get started by creating your first blog post using the editor.'
                : 'Check back soon for fresh finance articles from the Finovo team.'}
            </p>
            {isAdmin ? (
              <Link
                to="/admin/blog-editor"
                className="inline-block bg-heading text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
              >
                ✍️ Create Your First Post
              </Link>
            ) : null}
          </div>
        )}

        {Object.entries(grouped).map(([category, posts]) => (
          <section key={category} className="space-y-8">
            {/* Category Heading */}
            <h2 className="text-heading text-3xl font-bold font-figtree">
              {category}
            </h2>

            {/* Blog Cards */}
            <div className="space-y-0">
              {posts.map((blog, idx) => (
                <div key={blog._id}>
                  {idx > 0 && <div className="h-px bg-[#ebf2fe] my-0" />}
                  <Link
                    to={`/blogs/${blog.slug}`}
                    className="flex flex-col md:flex-row gap-8 md:gap-14 items-center py-8 group"
                  >
                    {/* Left Content */}
                    <div className="flex-1 space-y-3">
                      {/* Tags & Date */}
                      <div className="flex items-center">
                        <span className="bg-[#ebf2fe] text-heading text-xs font-semibold uppercase px-3 py-2 rounded-l-md tracking-wide">
                          {blog.tags[0] ?? 'General'}
                        </span>
                        <span className="bg-white border border-[#ebf2fe] text-heading text-xs font-medium uppercase px-3 py-2 rounded-r-md tracking-wide">
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>

                      {/* Title */}
                      <h3 className="text-heading text-2xl font-semibold font-figtree leading-snug group-hover:text-primary transition-colors">
                        {blog.title}
                      </h3>

                      {/* Excerpt */}
                      <p className="text-sub text-base leading-relaxed line-clamp-2">
                        {blog.excerpt}
                      </p>

                      {/* Edit / Delete Actions */}
                      {isAdmin ? (
                        <div className="flex items-center gap-3 pt-1">
                          <button
                            onClick={(e) => handleEdit(e, blog._id)}
                            className="text-xs font-medium text-primary hover:text-blue-700 transition-colors"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={(e) => handleDelete(e, blog._id, blog.title)}
                            className="text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      ) : null}
                    </div>

                    {/* Thumbnail */}
                    {blog.coverImage && (
                      <div className="w-full md:w-[380px] h-[180px] shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <img
                          src={blog.coverImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                  </Link>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <div className="bg-alt rounded-xl px-10 py-16 space-y-6">
          <h2 className="text-heading text-4xl font-semibold font-figtree">
            Start Calculating Your Financial Goals Today
          </h2>
          <p className="text-sub text-lg max-w-xl leading-relaxed">
            Finovo helps you plan your finances, investments, and savings with accurate calculations in seconds.
          </p>
          <Link
            to="/"
            className="inline-block bg-heading text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors"
          >
            Use Calculators →
          </Link>
        </div>
      </div>
    </div>
  )
}
