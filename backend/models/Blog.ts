import { Schema, model, type Document } from 'mongoose'

export interface IBlog extends Document {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  tags: string[]
  keywords: string[]
  author: string
  isPublished: boolean
  createdAt: Date
  updatedAt: Date
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const BlogSchema = new Schema<IBlog>(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 300
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
      lowercase: true
    },
    excerpt: {
      type: String,
      required: [true, 'Excerpt is required'],
      trim: true,
      maxlength: 500
    },
    content: {
      type: String,
      required: [true, 'Content is required']
    },
    coverImage: {
      type: String,
      default: ''
    },
    tags: {
      type: [String],
      default: []
    },
    keywords: {
      type: [String],
      default: []
    },
    author: {
      type: String,
      default: 'Admin',
      trim: true
    },
    isPublished: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

BlogSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = generateSlug(this.title)
  }
  next()
})

BlogSchema.index({ isPublished: 1, createdAt: -1 })
BlogSchema.index({ tags: 1 })

const Blog = model<IBlog>('Blog', BlogSchema)

export default Blog
