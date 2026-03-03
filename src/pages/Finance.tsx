import React from 'react'
import CategorySection from '../components/CategorySection'
import { calculators } from '../config/calculatorConfig'

export default function Finance(){
  const grouped = calculators.reduce<Record<string, any[]>>((acc, c) => {
    acc[c.category] = acc[c.category] || []
    acc[c.category].push(c)
    return acc
  }, {})

  return (
    <div className="container mx-auto px-6 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold text-heading font-figtree">Financial Calculators</h1>
      </header>

      {Object.keys(grouped).map(cat => (
        <CategorySection key={cat} title={cat} items={grouped[cat]} />
      ))}
    </div>
  )
}
