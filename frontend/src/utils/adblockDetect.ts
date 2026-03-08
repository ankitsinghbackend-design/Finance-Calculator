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
  adNetworkFetch: HeuristicResult
  imgBait: HeuristicResult
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

/* ------------------------------------------------------------------ */
/*  1. DOM bait – inject multiple ad-like elements, check survival    */
/* ------------------------------------------------------------------ */
const createDomBaitCheck = async (): Promise<HeuristicResult> => {
  // Create several bait elements with different ad-related patterns
  const baits: HTMLElement[] = []

  // Bait 1 – classic adsbox / banner-ad
  const b1 = document.createElement('div')
  b1.className = 'adsbox ad-banner banner_ad pub_300x250'
  b1.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;overflow:hidden;pointer-events:none;'
  baits.push(b1)

  // Bait 2 – Google AdSense-like element
  const b2 = document.createElement('ins')
  b2.className = 'adsbygoogle'
  b2.setAttribute('data-ad-client', 'ca-pub-0000000000000000')
  b2.setAttribute('data-ad-slot', '0000000000')
  b2.style.cssText = 'display:inline-block;width:1px;height:1px;position:absolute;top:0;left:0;'
  baits.push(b2)

  // Bait 3 – id-based bait (many filter lists target ad IDs)
  const b3 = document.createElement('div')
  b3.id = 'ad-container'
  b3.className = 'ad-wrapper textAd sponsored-link'
  b3.style.cssText = 'position:absolute;top:0;left:0;width:1px;height:1px;overflow:hidden;pointer-events:none;'
  b3.innerHTML = '<span class="ad-text">sponsored</span>'
  baits.push(b3)

  // Bait 4 – common ad-slot div
  const b4 = document.createElement('div')
  b4.id = 'google_ads_frame'
  b4.className = 'ad-slot ad-leaderboard'
  b4.style.cssText = 'position:absolute;top:0;left:0;width:728px;height:90px;overflow:hidden;pointer-events:none;'
  baits.push(b4)

  for (const el of baits) document.body.appendChild(el)

  // Give cosmetic filters time to apply (some are async)
  await new Promise((r) => setTimeout(r, 200))

  let blockedCount = 0
  const meta: Record<string, unknown> = {}

  for (let i = 0; i < baits.length; i++) {
    const el = baits[i]
    const removed = !document.body.contains(el)
    let hidden = false
    let collapsed = false

    if (!removed) {
      const style = window.getComputedStyle(el)
      hidden =
        style.display === 'none' ||
        style.visibility === 'hidden' ||
        parseFloat(style.opacity) === 0
      collapsed = el.offsetHeight === 0 && el.offsetWidth === 0
    }

    const blocked = removed || hidden || collapsed
    if (blocked) blockedCount++
    meta[`bait${i}`] = { removed, hidden, collapsed, blocked }
    try { el.remove() } catch { /* already gone */ }
  }

  const positive = blockedCount > 0
  return {
    positive,
    reason: positive ? `${blockedCount}/${baits.length}_baits_blocked` : 'all_baits_visible',
    meta
  }
}

/* ------------------------------------------------------------------ */
/*  2. Fetch bait – try fetching a first-party ad-like JS file        */
/* ------------------------------------------------------------------ */
const runFetchCheck = async (baitUrl: string): Promise<HeuristicResult> => {
  try {
    const response = await fetch(`${baitUrl}?_=${Date.now()}`, {
      cache: 'no-store'
    })
    const blocked = !response.ok
    return {
      positive: blocked,
      reason: blocked ? 'fetch_blocked' : 'fetch_success',
      meta: { ok: response.ok, status: response.status }
    }
  } catch {
    return { positive: true, reason: 'fetch_failed' }
  }
}

/* ------------------------------------------------------------------ */
/*  3. Script-tag load – inject a <script> with an ad-like URL        */
/* ------------------------------------------------------------------ */
const runScriptLoadCheck = async (scriptUrl: string): Promise<HeuristicResult> => {
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = `${scriptUrl}?_=${Date.now()}`
    script.async = true

    let settled = false
    const settle = (result: HeuristicResult) => {
      if (settled) return
      settled = true
      window.clearTimeout(timeout)
      try { script.remove() } catch { /* ok */ }
      resolve(result)
    }

    const timeout = window.setTimeout(() => {
      settle({ positive: true, reason: 'script_timeout' })
    }, 2000)

    script.onerror = () => settle({ positive: true, reason: 'script_error' })
    script.onload = () => settle({ positive: false, reason: 'script_loaded' })

    document.head.appendChild(script)
  })
}

/* ------------------------------------------------------------------ */
/*  4. Ad-network fetch – try multiple known ad domains               */
/*     Any real adblocker will block at least one of these            */
/* ------------------------------------------------------------------ */
const AD_NETWORK_URLS = [
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js',
  'https://c.amazon-adsystem.com/aax2/apstag.js',
  'https://static.ads-twitter.com/uwt.js',
  'https://connect.facebook.net/signals/config/000000000000000',
  'https://securepubads.g.doubleclick.net/tag/js/gpt.js',
]

const runAdNetworkFetchCheck = async (): Promise<HeuristicResult> => {
  const results = await Promise.allSettled(
    AD_NETWORK_URLS.map((url) =>
      fetch(url, { mode: 'no-cors', cache: 'no-store' })
    )
  )

  let blockedCount = 0
  const meta: Record<string, string> = {}

  results.forEach((r, i) => {
    const domain = new URL(AD_NETWORK_URLS[i]).hostname
    if (r.status === 'rejected') {
      blockedCount++
      meta[domain] = 'blocked'
    } else {
      meta[domain] = 'accessible'
    }
  })

  const positive = blockedCount > 0
  return {
    positive,
    reason: positive ? `${blockedCount}/${AD_NETWORK_URLS.length}_ad_domains_blocked` : 'all_ad_domains_accessible',
    meta
  }
}

/* ------------------------------------------------------------------ */
/*  5. Image bait – use <img> pointing to known ad tracking pixels    */
/*     Adblockers often block ad-related image requests               */
/* ------------------------------------------------------------------ */
const AD_PIXEL_URLS = [
  'https://www.googleadservices.com/pagead/conversion/1/?label=test',
  'https://ad.doubleclick.net/ddm/trackimp/N1/ci.gif',
  'https://pixel.adsafeprotected.com/rfw/st/0/img.gif',
]

const testImageLoad = (url: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image()
    img.style.display = 'none'
    const timer = setTimeout(() => resolve(true), 2000)

    img.onload = () => { clearTimeout(timer); resolve(false) }
    img.onerror = () => { clearTimeout(timer); resolve(true) }
    img.src = `${url}&_=${Date.now()}`
  })
}

const runImgBaitCheck = async (): Promise<HeuristicResult> => {
  const results = await Promise.all(AD_PIXEL_URLS.map(testImageLoad))
  const blockedCount = results.filter(Boolean).length

  const positive = blockedCount > 0
  return {
    positive,
    reason: positive ? `${blockedCount}/${AD_PIXEL_URLS.length}_ad_pixels_blocked` : 'all_ad_pixels_loaded',
    meta: Object.fromEntries(AD_PIXEL_URLS.map((u, i) => [new URL(u).hostname, results[i] ? 'blocked' : 'loaded']))
  }
}

/* ------------------------------------------------------------------ */
/*  6. Window-variable check (weak signal)                            */
/* ------------------------------------------------------------------ */
const runWeakWindowChecks = (): { value: boolean | null; reason: string } => {
  if (window.isAdBlockActive === true) {
    return { value: true, reason: 'explicit_adblock_active' }
  }
  if (window.canRunAds === false) {
    return { value: true, reason: 'canRunAds_false' }
  }
  if (window.__AD_PREBID_BAIT__ === undefined) {
    return { value: true, reason: 'prebid_not_loaded' }
  }
  if (window.canRunAds === true || window.__AD_PREBID_BAIT__ === 'loaded') {
    return { value: false, reason: 'window_signal_clean' }
  }
  return { value: null, reason: 'window_signal_unavailable' }
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                           */
/* ------------------------------------------------------------------ */
const toScriptProbePath = (baitUrl: string): string => {
  if (baitUrl.includes('ads-bait-')) return baitUrl.replace('ads-bait-', 'ads-prebid-')
  if (baitUrl.endsWith('.js')) return baitUrl.replace('.js', '-prebid.js')
  return '/ads-prebid.js'
}

/* ------------------------------------------------------------------ */
/*  Main detection entry point                                        */
/* ------------------------------------------------------------------ */
export const detectAdblock = async (
  { baitUrl = '/ads-bait-a9f3d1.js' }: AdblockDetectionOptions = {}
): Promise<AdblockDetectionResult> => {
  const [domBait, fetchBait, scriptLoad, adNetworkFetch, imgBait] = await Promise.all([
    createDomBaitCheck(),
    runFetchCheck(baitUrl),
    runScriptLoadCheck(toScriptProbePath(baitUrl)),
    runAdNetworkFetchCheck(),
    runImgBaitCheck()
  ])

  const weakWindow = runWeakWindowChecks()

  const strongSignals = [domBait, fetchBait, scriptLoad, adNetworkFetch, imgBait]
  const positiveStrongSignals = strongSignals.filter((h) => h.positive).length

  const detected = positiveStrongSignals >= 1 || weakWindow.value === true

  // Debug log — remove later if needed
  console.log('[adblock-detect]', {
    detected,
    positiveStrongSignals,
    domBait: domBait.reason,
    fetchBait: fetchBait.reason,
    scriptLoad: scriptLoad.reason,
    adNetworkFetch: adNetworkFetch.reason,
    imgBait: imgBait.reason,
    weakWindow: weakWindow.reason
  })

  return {
    detected,
    details: {
      domBait,
      fetchBait,
      scriptLoad,
      adNetworkFetch,
      imgBait,
      weakWindow,
      positiveStrongSignals
    }
  }
}
