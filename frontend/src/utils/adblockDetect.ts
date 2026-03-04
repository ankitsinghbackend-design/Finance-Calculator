export interface AdblockDetectionOptions {
  baitUrl?: string
}

export interface HeuristicResult {
  positive: boolean
  reason: string
  meta?: Record<string, unknown>
}

export interface AdblockDetectionDetails {
  domBait: HeuristicResult
  fetchBait: HeuristicResult
  scriptLoad: HeuristicResult
  weakWindow: {
    value: boolean | null
    reason: string
  }
  positiveStrongSignals: number
}

export interface AdblockDetectionResult {
  detected: boolean
  details: AdblockDetectionDetails
}

declare global {
  interface Window {
    canRunAds?: boolean
    isAdBlockActive?: boolean
    __AD_PREBID_BAIT__?: string
  }
}

const createDomBaitCheck = (): HeuristicResult => {
  const bait = document.createElement('div')
  bait.className = 'ads adsbox ad-banner ad-bait pub_300x250 text-ad sponsored-links'
  bait.setAttribute('aria-hidden', 'true')
  bait.style.position = 'absolute'
  bait.style.left = '-9999px'
  bait.style.width = '10px'
  bait.style.height = '10px'
  bait.style.pointerEvents = 'none'

  document.body.appendChild(bait)

  const style = window.getComputedStyle(bait)
  const opacity = style.opacity
  const opacityHidden = opacity === '0' || opacity === '0.0'
  const hiddenByStyle =
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    opacityHidden

  const collapsed = bait.offsetParent === null || bait.offsetHeight === 0 || bait.offsetWidth === 0
  const removed = !document.body.contains(bait)
  const positive = hiddenByStyle || collapsed || removed

  bait.remove()

  return {
    positive,
    reason: positive ? 'bait_hidden_or_collapsed' : 'bait_visible',
    meta: {
      hiddenByStyle,
      collapsed,
      removed
    }
  }
}

const runFetchCheck = async (baitUrl: string): Promise<HeuristicResult> => {
  try {
    const response = await fetch(`${baitUrl}?_=${Date.now()}`, {
      cache: 'no-store',
      mode: 'no-cors'
    })

    const blocked = typeof response?.ok === 'boolean' ? !response.ok : false

    return {
      positive: blocked,
      reason: blocked ? 'fetch_not_ok_or_opaque_blocked' : 'fetch_success',
      meta: {
        ok: (response as Response).ok,
        type: (response as Response).type
      }
    }
  } catch (error) {
    return {
      positive: true,
      reason: 'fetch_failed',
      meta: {
        message: error instanceof Error ? error.message : 'unknown_error'
      }
    }
  }
}

const runScriptLoadCheck = async (scriptUrl: string): Promise<HeuristicResult> => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `${scriptUrl}?_=${Date.now()}`
    script.async = true

    let settled = false
    const cleanup = () => {
      script.remove()
    }

    const settle = (result: HeuristicResult) => {
      if (settled) {
        return
      }

      settled = true
      window.clearTimeout(timeout)
      cleanup()
      resolve(result)
    }

    const timeout = window.setTimeout(() => {
      settle({
        positive: true,
        reason: 'script_timeout'
      })
    }, 1200)

    script.onerror = () => {
      settle({
        positive: true,
        reason: 'script_error'
      })
    }

    script.onload = () => {
      settle({
        positive: false,
        reason: 'script_loaded'
      })
    }

    document.head.appendChild(script)
  })
}

const runWeakWindowChecks = (): { value: boolean | null; reason: string } => {
  if (window.isAdBlockActive === true || window.canRunAds === false) {
    return { value: true, reason: 'explicit_window_signal' }
  }

  if (window.isAdBlockActive === false || window.canRunAds === true) {
    return { value: false, reason: 'window_signal_clean' }
  }

  return { value: null, reason: 'window_signal_unavailable' }
}

const toScriptProbePath = (baitUrl: string): string => {
  if (baitUrl.includes('ads-bait-')) {
    return baitUrl.replace('ads-bait-', 'ads-prebid-')
  }

  if (baitUrl.endsWith('.js')) {
    return baitUrl.replace('.js', '-prebid.js')
  }

  return '/ads-prebid.js'
}

export const detectAdblock = async ({ baitUrl = '/ads-bait-a9f3d1.js' }: AdblockDetectionOptions = {}): Promise<AdblockDetectionResult> => {
  const domBait = createDomBaitCheck()
  const [fetchBait, scriptLoad] = await Promise.all([
    runFetchCheck(baitUrl),
    runScriptLoadCheck(toScriptProbePath(baitUrl))
  ])
  const weakWindow = runWeakWindowChecks()

  const positiveStrongSignals = [domBait, fetchBait, scriptLoad].filter((h) => h.positive).length

  const hasMultipleStrongSignals = positiveStrongSignals >= 2
const hasOneStrongAndWeak = positiveStrongSignals === 1 && weakWindow.value === true

const detected = hasMultipleStrongSignals || hasOneStrongAndWeak

  return {
    detected,
    details: {
      domBait,
      fetchBait,
      scriptLoad,
      weakWindow,
      positiveStrongSignals
    }
  }
}
