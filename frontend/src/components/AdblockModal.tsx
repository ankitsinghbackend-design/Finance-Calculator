import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export interface AdblockModalProps {
  open: boolean
  loading?: boolean
  onRetry: () => void | Promise<void>
}

const FOCUS_SELECTOR =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

/**
 * IMPORTANT – every class name, ID, and visible string in this component
 * is intentionally kept generic.  Ad-blockers ship cosmetic-filter lists
 * that hide elements whose attributes or text content match patterns like
 * "adblock", "ad-blocker", "anti-adblock", "ad blocker detected", etc.
 *
 * We therefore:
 *  1. Use only inline styles (no Tailwind classes the filter can match).
 *  2. Avoid the words "ad block" in IDs, classes, and visible copy.
 *  3. Use the maximum z-index so no other layer can obscure the overlay.
 */
export default function AdblockModal({ open, loading = false, onRetry }: AdblockModalProps) {
  const navigate = useNavigate()
  const panelRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!open || !panelRef.current) return

    const panel = panelRef.current
    const focusable = Array.from(panel.querySelectorAll<HTMLElement>(FOCUS_SELECTOR))
    focusable[0]?.focus()

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); return }
      if (e.key !== 'Tab') return

      const els = Array.from(panel.querySelectorAll<HTMLElement>(FOCUS_SELECTOR))
      if (!els.length) return
      const first = els[0], last = els[els.length - 1]
      const active = document.activeElement as HTMLElement | null

      if (!e.shiftKey && active === last)  { e.preventDefault(); first.focus() }
      if (e.shiftKey  && active === first) { e.preventDefault(); last.focus()  }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  if (!open) return null

  return (
    <div
      data-fc-overlay=""
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2147483647,
        backgroundColor: 'rgba(0,0,0,0.72)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="fc-notice-title"
        aria-describedby="fc-notice-desc"
        style={{
          width: '100%',
          maxWidth: '540px',
          borderRadius: '12px',
          backgroundColor: '#fff',
          padding: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        <h2
          id="fc-notice-title"
          style={{ margin: 0, fontSize: '1.375rem', fontWeight: 600, color: '#111827' }}
        >
          Please support this free tool
        </h2>

        <p
          id="fc-notice-desc"
          style={{ marginTop: '12px', fontSize: '0.875rem', lineHeight: '1.6', color: '#374151' }}
        >
          It looks like a browser extension is preventing some resources
          from loading. To keep these financial calculators free for everyone,
          please whitelist this site and then click <strong>Retry</strong>.
        </p>

        <ol style={{ marginTop: '14px', paddingLeft: '20px', fontSize: '0.875rem', color: '#374151', lineHeight: '1.8' }}>
          <li>Open your browser extension settings.</li>
          <li>Choose &ldquo;Pause on this site&rdquo; or &ldquo;Allow&rdquo;.</li>
          <li>Click <strong>Retry</strong> below.</li>
        </ol>

        <div style={{ marginTop: '20px', display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => void onRetry()}
            disabled={loading}
            style={{
              borderRadius: '6px',
              backgroundColor: '#16a34a',
              padding: '8px 18px',
              color: '#fff',
              fontWeight: 500,
              fontSize: '0.875rem',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.55 : 1,
            }}
          >
            {loading ? 'Checking\u2026' : 'Retry'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/help/disable-adblock')}
            style={{
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              backgroundColor: '#fff',
              padding: '8px 18px',
              color: '#1f2937',
              fontWeight: 500,
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Help
          </button>
        </div>
      </div>
    </div>
  )
}
