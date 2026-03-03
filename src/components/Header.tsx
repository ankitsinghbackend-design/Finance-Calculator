import React from 'react'
import { Link } from 'react-router-dom'

export default function Header(){
  return (
    <header className="bg-alt border-b border-cardBorder">
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
        <Link to="/" className="text-primary font-bold text-2xl font-figtree">Finovo</Link>
        <nav className="hidden md:flex gap-8 items-center text-gray-800 font-figtree">
          <Link to="/" className="text-heading text-base">Home</Link>
          <Link to="/finance" className="text-body text-base">Features</Link>
          <a href="#" className="text-body text-base">Pricing</a>
          <a href="#faqs" className="text-body text-base">FAQs</a>
        </nav>
        <div className="md:hidden"> 
          <button aria-label="menu">☰</button>
        </div>
      </div>
    </header>
  )
}
