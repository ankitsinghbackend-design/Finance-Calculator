import { Schema, model, models } from 'mongoose'

export interface AdblockLogRecord {
  location: string
  url: string
  userAgent: string
  detected: boolean
  details: Record<string, unknown>
  ts: Date
  bucketDate: Date
  firstSeenAt: Date
  lastSeenAt: Date
  count: number
}

const ttlDays = Number(process.env.ADBLOCK_LOG_TTL_DAYS ?? 60)

const AdblockLogSchema = new Schema<AdblockLogRecord>(
  {
    location: { type: String, required: true, trim: true, maxlength: 120 },
    url: { type: String, required: true, trim: true, maxlength: 2048 },
    userAgent: { type: String, required: true, trim: true, maxlength: 512 },
    detected: { type: Boolean, required: true },
    details: { type: Schema.Types.Mixed, default: {} },
    ts: { type: Date, required: true },
    bucketDate: { type: Date, required: true },
    firstSeenAt: { type: Date, required: true },
    lastSeenAt: { type: Date, required: true },
    count: { type: Number, required: true, default: 1, min: 1 }
  },
  {
    versionKey: false,
    minimize: true
  }
)

AdblockLogSchema.index({ url: 1, detected: 1, ts: -1 })
AdblockLogSchema.index({ bucketDate: 1, url: 1, location: 1, detected: 1 }, { unique: true })
AdblockLogSchema.index(
  { ts: 1 },
  {
    expireAfterSeconds: ttlDays * 24 * 60 * 60,
    name: 'adblock_logs_ttl'
  }
)

export const AdblockLogModel = models.AdblockLog || model<AdblockLogRecord>('AdblockLog', AdblockLogSchema)
