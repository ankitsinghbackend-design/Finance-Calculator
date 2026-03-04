import { AdblockLogModel } from '../models/AdblockLog'

export interface AdblockLogPayload {
  location: string
  url: string
  userAgent: string
  detected: boolean
  details: Record<string, unknown>
  ts: Date
}

const toBucketDate = (ts: Date): Date => {
  const d = new Date(ts)
  d.setUTCHours(0, 0, 0, 0)
  return d
}

export const logAdblock = async (payload: AdblockLogPayload): Promise<void> => {
  const now = payload.ts ?? new Date()
  const bucketDate = toBucketDate(now)

  await AdblockLogModel.updateOne(
    {
      bucketDate,
      url: payload.url,
      location: payload.location,
      detected: payload.detected
    },
    {
      $setOnInsert: {
        location: payload.location,
        url: payload.url,
        detected: payload.detected,
        bucketDate,
        firstSeenAt: now,
        // count: 0 will be incremented to 1 on insert this was conflciting with $inc part
      },
      $set: {
        ts: now,
        lastSeenAt: now,
        userAgent: payload.userAgent,
        details: payload.details
      },
      $inc: {
        count: 1
      }
    },
    { upsert: true }
  )
}

export const getDailyAdblockRateAggregation = () => {
  return [
    {
      $group: {
        _id: {
          day: { $dateToString: { format: '%Y-%m-%d', date: '$bucketDate' } },
          url: '$url'
        },
        totalEvents: { $sum: '$count' },
        detectedEvents: {
          $sum: {
            $cond: [{ $eq: ['$detected', true] }, '$count', 0]
          }
        }
      }
    },
    {
      $addFields: {
        adblockRate: {
          $cond: [
            { $eq: ['$totalEvents', 0] },
            0,
            { $divide: ['$detectedEvents', '$totalEvents'] }
          ]
        }
      }
    }
  ]
}
