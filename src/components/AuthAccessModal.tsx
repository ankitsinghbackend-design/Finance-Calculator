import React from 'react'

type AuthAccessModalProps = {
  title: string
  description: string
  primaryLabel: string
  onPrimary: () => void
  secondaryLabel?: string
  onSecondary?: () => void
}

export default function AuthAccessModal({
  title,
  description,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary
}: AuthAccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4">
      <div className="w-full max-w-[430px] rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15 text-[34px]">
          🔐
        </div>
        <h2 className="mt-6 text-[30px] font-semibold text-heading">{title}</h2>
        <p className="mt-3 text-[16px] leading-[25.6px] text-body">{description}</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onPrimary}
            className="inline-flex h-[46px] items-center justify-center rounded-lg bg-primary px-6 text-[16px] font-medium text-white transition hover:bg-primaryDark"
          >
            {primaryLabel}
          </button>
          {secondaryLabel && onSecondary ? (
            <button
              type="button"
              onClick={onSecondary}
              className="inline-flex h-[46px] items-center justify-center rounded-lg border border-cardBorder px-6 text-[16px] font-medium text-heading transition hover:bg-slate-50"
            >
              {secondaryLabel}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
