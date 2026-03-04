import { PropsWithChildren } from 'react'
import AdblockModal from '../components/AdblockModal'
import { useAdblockDetector } from '../hooks/useAdblockDetector'

export default function CalculatorLayout({ children }: PropsWithChildren) {
  const env = ((import.meta as unknown as { env?: Record<string, string> }).env ?? {})

  const { detected, loading, retry } = useAdblockDetector({
    baitPath: env.VITE_AD_BAIT_PATH ?? '/ads-bait-a9f3d1.js',
    logEndpoint: env.VITE_ADBLOCK_LOG_ENDPOINT ?? '/api/log/adblock',
    location: 'finance-calculators'
  })

  return (
    <>
      {children}
      <AdblockModal open={detected} loading={loading} onRetry={retry} />
    </>
  )
}
