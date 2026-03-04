import { Schema, model, models } from 'mongoose'

export interface CalculatorLogLocation {
  country: string
  region: string
  city: string
}

export interface CalculatorLogRecord {
  calculatorId: string
  location: CalculatorLogLocation
  inputs: Record<string, unknown>
  results: Record<string, unknown>
  createdAt: Date
}

const CalculatorLogSchema = new Schema<CalculatorLogRecord>(
  {
    calculatorId: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120
    },
    location: {
      country: { type: String, trim: true, default: 'Unknown' },
      region: { type: String, trim: true, default: 'Unknown' },
      city: { type: String, trim: true, default: 'Unknown' }
    },
    inputs: {
      type: Schema.Types.Mixed,
      required: true
    },
    results: {
      type: Schema.Types.Mixed,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    collection: 'calculator_logs',
    versionKey: false,
    minimize: false
  }
)

CalculatorLogSchema.index({ calculatorId: 1 })
CalculatorLogSchema.index({ 'location.country': 1 })
CalculatorLogSchema.index({ createdAt: -1 })

export const CalculatorLogModel =
  models.CalculatorLog || model<CalculatorLogRecord>('CalculatorLog', CalculatorLogSchema)
