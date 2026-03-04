/** @jest-environment jsdom */

import { detectAdblock } from '../utils/adblockDetect'

describe('detectAdblock()', () => {
  const originalFetch = global.fetch
  const originalAppendChild = document.head.appendChild.bind(document.head)
  const originalOffsetParent = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetParent')
  const originalOffsetHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetHeight')
  const originalOffsetWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth')

  beforeEach(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetParent', {
      configurable: true,
      get: () => document.body
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get: () => 10
    })
    Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
      configurable: true,
      get: () => 10
    })

    ;(global as typeof globalThis).fetch = jest.fn().mockResolvedValue({ ok: true, type: 'basic' } as Response)
    ;(window as Window & { canRunAds?: boolean; isAdBlockActive?: boolean }).canRunAds = undefined
    ;(window as Window & { canRunAds?: boolean; isAdBlockActive?: boolean }).isAdBlockActive = undefined

    jest.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
      const script = node as HTMLScriptElement
      if (script.tagName === 'SCRIPT') {
        setTimeout(() => script.onload?.(new Event('load')), 0)
      }
      return originalAppendChild(node)
    })
  })

  afterEach(() => {
    if (originalOffsetParent) {
      Object.defineProperty(HTMLElement.prototype, 'offsetParent', originalOffsetParent)
    }
    if (originalOffsetHeight) {
      Object.defineProperty(HTMLElement.prototype, 'offsetHeight', originalOffsetHeight)
    }
    if (originalOffsetWidth) {
      Object.defineProperty(HTMLElement.prototype, 'offsetWidth', originalOffsetWidth)
    }

    jest.restoreAllMocks()
    global.fetch = originalFetch
  })

  it('returns false when strong heuristics are clean', async () => {
    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.detected).toBe(false)
    expect(result.details.positiveStrongSignals).toBeLessThanOrEqual(1)
  })

  it('returns true when two strong checks are positive', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('blocked'))

    jest.spyOn(document.head, 'appendChild').mockImplementation((node: Node) => {
      const script = node as HTMLScriptElement
      if (script.tagName === 'SCRIPT') {
        setTimeout(() => script.onerror?.(new Event('error')), 0)
      }
      return originalAppendChild(node)
    })

    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.detected).toBe(true)
    expect(result.details.fetchBait.positive).toBe(true)
    expect(result.details.scriptLoad.positive).toBe(true)
  })

  it('returns true for one strong + weak positive', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('blocked'))
    ;(window as Window & { canRunAds?: boolean }).canRunAds = false

    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.details.fetchBait.positive).toBe(true)
    expect(result.details.weakWindow.value).toBe(true)
    expect(result.detected).toBe(true)
  })

  it('returns false for one strong without weak support', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('blocked'))

    const result = await detectAdblock({ baitUrl: '/ads-bait-a9f3d1.js' })

    expect(result.details.fetchBait.positive).toBe(true)
    expect(result.details.weakWindow.value).not.toBe(true)
    expect(result.detected).toBe(false)
  })
})
