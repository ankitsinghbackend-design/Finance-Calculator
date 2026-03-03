import React from 'react'
import { Link } from 'react-router-dom'

export default function Home(){
  return (
    <div className="container mx-auto px-6 py-12">
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-5xl font-semibold text-heading leading-tight font-figtree">Smart Financial Calculations Made <span className="text-primary">Simple</span></h1>
          <p className="text-body mt-6 max-w-xl">Plan loans, investments, taxes, savings, and retirement in seconds using our powerful and free financial calculators.</p>
          <div className="mt-8 flex gap-4">
            <Link to="/finance" className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md">Explore Calculators</Link>
            <a href="#features" className="text-sub px-6 py-3">How it works</a>
          </div>
        </div>
        <div aria-hidden className="bg-alt rounded-xl h-72"></div>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-medium text-heading mb-4">Financial Calculators</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-sub underline">Mortgage</div>
          <div className="text-sub underline">Currency</div>
          <div className="text-sub underline">Interest Rate</div>
          <div className="text-sub underline">Interest</div>
        </div>
      </section>
    </div>
  )
}
