import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export interface AdblockModalProps {
  open: boolean
  loading?: boolean
  onRetry: () => void | Promise<void>
}

const FOCUS_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export default function AdblockModal({ open, loading = false, onRetry }: AdblockModalProps) {
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open || !containerRef.current) {
      return
    }

    const container = containerRef.current
    const focusable = Array.from(container.querySelectorAll<HTMLElement>(FOCUS_SELECTOR))
    focusable[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        return
      }

      if (event.key !== 'Tab') {
        return
      }

      const elements = Array.from(container.querySelectorAll<HTMLElement>(FOCUS_SELECTOR))
      if (elements.length === 0) {
        return
      }

      const first = elements[0]
      const last = elements[elements.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      }

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center px-4" aria-hidden={false}>
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="adblock-modal-title"
        aria-describedby="adblock-modal-desc"
        className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl outline-none"
      >
        <h2 id="adblock-modal-title" className="text-2xl font-semibold text-gray-900">
          Ad blocker detected
        </h2>
        <p id="adblock-modal-desc" className="mt-3 text-sm leading-6 text-gray-700">
          To keep these financial tools free, please whitelist this site in your ad blocker and then retry.
        </p>

        <ol className="mt-4 list-decimal pl-5 text-sm text-gray-700 space-y-1">
          <li>Open your ad blocker extension.</li>
          <li>Choose “Pause on this site” or “Allow ads on this site”.</li>
          <li>Refresh permissions and click Retry.</li>
        </ol>

        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void onRetry()}
            disabled={loading}
            className="rounded-md bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {loading ? 'Checking…' : 'Retry'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/help/disable-adblock')}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-800 hover:bg-gray-50"
          >
            Help
          </button>
          <a href="/subscribe" className="text-sm text-emerald-700 underline underline-offset-2 self-center">
            Prefer ad-free? View subscription options.
          </a>
        </div>
      </div>
    </div>
  )
}
