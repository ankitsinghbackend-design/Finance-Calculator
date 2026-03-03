import React from 'react'
import CalculatorCard from './CalculatorCard'

type Calc = { id: string; title: string; description?: string }

export default function CategorySection({ title, items }: { title: string; items: Calc[] }){
  return (
    <section className="my-8">
      <h2 className="text-2xl font-medium text-heading font-figtree mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {items.map(i => (
          <CalculatorCard key={i.id} id={i.id} title={i.title} description={i.description} />
        ))}
      </div>
    </section>
  )
}
