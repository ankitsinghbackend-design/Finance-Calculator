import React from 'react'

type Props = {
  id: string
  title: string
  description?: string
}

export default function CalculatorCard({ id, title, description }: Props){
  return (
    <article className="border border-cardBorder rounded-xl p-5 bg-white shadow-sm w-full">
      <h3 className="text-heading text-lg font-semibold font-figtree">{title}</h3>
      {description && <p className="text-body mt-2 text-sm">{description}</p>}
      <div className="mt-4">
        <a href={`/finance?calc=${id}`} className="inline-block w-full text-center bg-primary hover:bg-primaryDark text-white py-2 rounded-md shadow-card">Open</a>
      </div>
    </article>
  )
}
