import React, { useState, useCallback } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import TipTapEditor from '../components/TipTapEditor'

interface BlogFormState {
  title: string
  excerpt: string
  content: string
  coverImage: string
  tags: string
  keywords: string
  author: string
  isPublished: boolean
}

const initialState: BlogFormState = {
  title: '',
  excerpt: '',
  content: '',
  coverImage: '',
  tags: '',
  keywords: '',
  author: 'Admin',
  isPublished: true
}

export default function BlogEditorPage() {
  const [form, setForm] = useState<BlogFormState>(initialState)
  const [coverUploading, setCoverUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleToggle = () => {
    setForm(prev => ({ ...prev, isPublished: !prev.isPublished }))
  }

  const handleContentChange = useCallback((html: string) => {
    setForm(prev => ({ ...prev, content: html }))
  }, [])

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setCoverUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('image', file)

    try {
      const { data } = await axios.post<{ url: string }>(apiUrl('/api/upload/image'), formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setForm(prev => ({ ...prev, coverImage: data.url }))
    } catch {
      setError('Failed to upload cover image')
    } finally {
      setCoverUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    setSuccess('')

    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      setError('Title, excerpt, and content are required')
      setSubmitting(false)
      return
    }

    try {
      const payload = {
        title: form.title,
        excerpt: form.excerpt,
        content: form.content,
        coverImage: form.coverImage,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        author: form.author,
        isPublished: form.isPublished
      }

      await axios.post(apiUrl('/api/blogs'), payload)
      setSuccess(payload.isPublished ? 'Blog published successfully!' : 'Blog saved as draft!')
      setForm(initialState)
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response?.data?.error) {
        setError(err.response.data.error as string)
      } else {
        setError('Failed to create blog post')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-6 py-10 max-w-4xl">
      <h1 className="text-3xl font-bold text-heading mb-8 font-figtree">Create Blog Post</h1>

      {success && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg">
          {success}
        </div>
      )}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-heading mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            placeholder="Enter blog title..."
            className="w-full px-4 py-3 border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-heading bg-white"
          />
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            Cover Image
          </label>
          <div className="flex items-center gap-4">
            <label className="cursor-pointer inline-flex items-center px-4 py-2 bg-alt border border-cardBorder rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-sub">
              {coverUploading ? 'Uploading...' : 'Upload Image'}
              <input
                type="file"
                accept="image/*"
                onChange={handleCoverImageUpload}
                className="hidden"
                disabled={coverUploading}
              />
            </label>
            {form.coverImage && (
              <span className="text-sm text-green-600">✓ Image uploaded</span>
            )}
          </div>
          {form.coverImage && (
            <div className="mt-3">
              <img
                src={form.coverImage}
                alt="Cover preview"
                className="w-full max-h-64 object-cover rounded-lg border border-cardBorder"
              />
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-heading mb-2">
            Excerpt <span className="text-red-500">*</span>
          </label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={form.excerpt}
            onChange={handleChange}
            rows={3}
            placeholder="Brief summary of the blog post..."
            className="w-full px-4 py-3 border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-heading bg-white resize-none"
          />
        </div>

        {/* Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-heading mb-2">
              Tags <span className="text-sub text-xs">(comma separated)</span>
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags}
              onChange={handleChange}
              placeholder="finance, mortgage, investment"
              className="w-full px-4 py-3 border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-heading bg-white"
            />
          </div>
          <div>
            <label htmlFor="keywords" className="block text-sm font-medium text-heading mb-2">
              Keywords <span className="text-sub text-xs">(comma separated)</span>
            </label>
            <input
              id="keywords"
              name="keywords"
              type="text"
              value={form.keywords}
              onChange={handleChange}
              placeholder="SEO keywords..."
              className="w-full px-4 py-3 border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-heading bg-white"
            />
          </div>
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-heading mb-2">
            Author
          </label>
          <input
            id="author"
            name="author"
            type="text"
            value={form.author}
            onChange={handleChange}
            placeholder="Author name"
            className="w-full px-4 py-3 border border-cardBorder rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary text-heading bg-white"
          />
        </div>

        {/* TipTap Editor */}
        <div>
          <label className="block text-sm font-medium text-heading mb-2">
            Content <span className="text-red-500">*</span>
          </label>
          <TipTapEditor content={form.content} onChange={handleContentChange} />
        </div>

        {/* Publish Toggle */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              form.isPublished ? 'bg-primary' : 'bg-gray-300'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                form.isPublished ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="text-sm font-medium text-heading">
            {form.isPublished ? 'Published' : 'Draft'}
          </span>
        </div>

        {/* Submit */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="px-8 py-3 bg-heading text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Publishing...' : 'Publish Blog'}
          </button>
        </div>
      </form>
    </div>
  )
}
