import { Schema, model, type Document } from 'mongoose'

export interface IFeedback extends Document {
  name: string
  email: string
  message: string
  rating: number
  createdAt: Date
  updatedAt: Date
}

const FeedbackSchema = new Schema<IFeedback>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 120
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      maxlength: 320
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 1000
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5
    }
  },
  {
    timestamps: true
  }
)

FeedbackSchema.index({ createdAt: -1 })
FeedbackSchema.index({ email: 1 })

const Feedback = model<IFeedback>('Feedback', FeedbackSchema)

export default Feedback
