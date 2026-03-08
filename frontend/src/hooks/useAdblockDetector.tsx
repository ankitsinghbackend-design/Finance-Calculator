import { useCallback, useEffect, useState } from 'react'
import { AdblockDetectionDetails, detectAdblock } from '../utils/adblockDetect'

export interface UseAdblockDetectorConfig {
  baitPath?: string
  logEndpoint?: string
  location?: string
}

export interface UseAdblockDetectorState {
  detected: boolean
  loading: boolean
  details: AdblockDetectionDetails | null
  retry: () => Promise<boolean>
  suppressTemporarily: (minutes: number) => void
}

const sendLog = (endpoint: string, payload: Record<string, unknown>) => {
  const body = JSON.stringify(payload)

  if (navigator.sendBeacon) {
    const blob = new Blob([body], { type: 'application/json' })
    navigator.sendBeacon(endpoint, blob)
    return
  }

  void fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  })
}

const nowIso = () => new Date().toISOString()

export const useAdblockDetector = (config: UseAdblockDetectorConfig = {}): UseAdblockDetectorState => {
  const env = ((import.meta as unknown as { env?: Record<string, string> }).env ?? {})
  const baitPath = config.baitPath ?? env.VITE_AD_BAIT_PATH ?? '/ads-bait-a9f3d1.js'
  const logEndpoint = config.logEndpoint ?? env.VITE_ADBLOCK_LOG_ENDPOINT ?? '/api/log/adblock'

  const locationKey = config.location ?? 'calculator'

  const [detected, setDetected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [details, setDetails] = useState<AdblockDetectionDetails | null>(null)
  const [suppressedUntil, setSuppressedUntil] = useState<number | null>(null)

  const isSuppressed = suppressedUntil ? Date.now() < suppressedUntil : false

  const executeDetection = useCallback(async (): Promise<boolean> => {
    setLoading(true)

    const result = await detectAdblock({ baitUrl: baitPath })

    setDetails(result.details)

    const shouldShow = !isSuppressed && result.detected
    console.log('[adblock-hook] setting detected =', shouldShow)
    setDetected(shouldShow)
    setLoading(false)

    sendLog(logEndpoint, {
      location: locationKey,
      url: window.location.href,
      userAgent: navigator.userAgent,
      detected: result.detected,
      details: result.details,
      ts: nowIso()
    })

    return result.detected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baitPath, logEndpoint, locationKey])

  // Run detection on mount. The empty dep array [] ensures it runs exactly
  // once even with StrictMode (cleanup is a no-op, remount re-runs).
  useEffect(() => {
    void executeDetection()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const retry = useCallback(async () => {
    const isDetected = await executeDetection()
    return isDetected
  }, [executeDetection])

  const suppressTemporarily = useCallback((minutes: number) => {
    const ms = Math.max(1, minutes) * 60 * 1000
    setSuppressedUntil(Date.now() + ms)
    setDetected(false)
  }, [])

  return {
    detected,
    loading,
    details,
    retry,
    suppressTemporarily
  }
}
