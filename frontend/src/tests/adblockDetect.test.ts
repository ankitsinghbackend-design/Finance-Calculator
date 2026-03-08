/** @jest-environment jsdom */

import { detectAdblock } from '../utils/adblockDetect'

describe('detectAdblock()', () => {
  const originalFetch = global.fetch
  const originalHeadAppendChild = document.head.appendChild.bind(document.head)
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')
  const originalImage = global.Image

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => 1
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => 1
    })

    // All fetches succeed by default (bait file + ad networks)
    ;(global as typeof globalThis).fetch = jest.fn().mockResolvedValue({
      ok: true,
      type: 'opaque',
      status: 200
    } as Response)

    // Image loads succeed by default
    ;(global as typeof globalThis).Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      style = { display: '' }
      set src(_: string) {
        setTimeout(() => this.onload?.(), 5)
      }
    } as unknown as typeof Image

    // Simulate clean window signals
    ;(window as Window & { canRunAds?: boolean; isAdBlockActive?: boolean }).canRunAds = undefined
    ;(window as Window & { canRunAds?: boolean; isAdBlockActive?: boolean }).isAdBlockActive = undefined
    ;(window as Window & { __AD_PREBID_BAIT__?: string }).__AD_PREBID_BAIT__ = 'loaded'

    // Script loads successfully by default
    jest.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
      const script = node as HTMLScriptElement
      if (script.tagName === 'SCRIPT') {
        setTimeout(() => script.onload?.(new Event('load')), 5)
      }
      return originalHeadAppendChild(node)
    })
  })

  afterEach(() => {
    if (originalOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
    }
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
    }

    jest.restoreAllMocks()
    global.fetch = originalFetch
    global.Image = originalImage
    ;(window as Window & { __AD_PREBID_BAIT__?: string }).__AD_PREBID_BAIT__ = undefined
  })

  it('returns false when all heuristics are clean', async () => {
    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.detected).toBe(false)
    expect(result.details.positiveStrongSignals).toBe(0)
  })

  it('returns true when ad-network fetches are blocked', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({ ok: true, status: 200 })     // bait fetch OK
      .mockRejectedValueOnce(new Error('blocked'))           // google blocked
      .mockRejectedValueOnce(new Error('blocked'))           // amazon blocked
      .mockRejectedValueOnce(new Error('blocked'))           // twitter blocked
      .mockRejectedValueOnce(new Error('blocked'))           // fb blocked
      .mockRejectedValueOnce(new Error('blocked'))           // doubleclick blocked

    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.detected).toBe(true)
    expect(result.details.adNetworkFetch.positive).toBe(true)
  })

  it('returns true when ad image pixels are blocked', async () => {
    ;(global as typeof globalThis).Image = class MockImage {
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      style = { display: '' }
      set src(_: string) {
        setTimeout(() => this.onerror?.(), 5)
      }
    } as unknown as typeof Image

    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.detected).toBe(true)
    expect(result.details.imgBait.positive).toBe(true)
  })

  it('returns true when fetch bait is blocked', async () => {
    ;(global.fetch as jest.Mock)
      .mockRejectedValueOnce(new Error('blocked'))           // bait fetch blocked
      .mockResolvedValue({ ok: true, status: 200 })          // rest OK

    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.detected).toBe(true)
    expect(result.details.fetchBait.positive).toBe(true)
  })

  it('returns true when weak window signal is positive', async () => {
    ;(window as Window & { __AD_PREBID_BAIT__?: string }).__AD_PREBID_BAIT__ = undefined

    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.details.weakWindow.value).toBe(true)
    expect(result.detected).toBe(true)
  })
})
