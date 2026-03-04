/** @jest-environment node */

import request from 'supertest'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { createApp } from '../../../backend/app'
import { AdblockLogModel } from '../../../backend/models/AdblockLog'

describe('POST /api/log/adblock', () => {
  const app = createApp()
  let mongoServer: MongoMemoryServer

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create()
    await mongoose.connect(mongoServer.getUri())
  })

  afterEach(async () => {
    await AdblockLogModel.deleteMany({})
  })

  afterAll(async () => {
    await mongoose.disconnect()
    await mongoServer.stop()
  })

  it('accepts valid payload and stores a log row', async () => {
    const payload = {
      location: 'finance-calculators',
      url: 'https://example.com/finance',
      userAgent: 'jest-agent',
      detected: true,
      details: {
        domBait: { positive: true },
        fetchBait: { positive: true }
      },
      ts: new Date().toISOString()
    }

    const response = await request(app).post('/api/log/adblock').send(payload)

    expect(response.status).toBe(204)

    const saved = await AdblockLogModel.findOne({ url: payload.url }).lean() as any
    expect(saved).not.toBeNull()
    expect(saved?.detected).toBe(true)
    expect(saved?.count).toBe(1)
    expect(saved?.details).toHaveProperty('sourceHash')
  })

  it('rejects invalid payload', async () => {
    const response = await request(app).post('/api/log/adblock').send({ detected: true })

    expect(response.status).toBe(400)
  })
})
