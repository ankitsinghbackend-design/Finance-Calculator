import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export default function Header(){
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const isFinance = location.pathname === '/finance'
  const isBlog = location.pathname.startsWith('/blogs')
  const isAdmin = location.pathname.startsWith('/admin')

  const navLink = (to: string, label: string, active: boolean) =>
    `text-base ${active ? 'text-heading font-semibold' : 'text-body hover:text-heading transition-colors'}`

  const closeMobileMenu = () => setIsMobileMenuOpen(false)

  return (
    <header className="bg-alt border-b border-cardBorder">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
        <Link to="/" className="text-primary font-bold text-2xl font-figtree">Finovo</Link>
        <nav className="hidden md:flex gap-8 items-center text-gray-800 font-figtree">
          <Link to="/" className={navLink('/', 'Home', location.pathname === '/')}>Home</Link>
          <Link to="/finance" className={navLink('/finance', 'Features', isFinance)}>Features</Link>
          <Link to="/blogs" className={navLink('/blogs', 'Blog', isBlog)}>Blog</Link>
          <a href="#" className="text-body text-base">Pricing</a>
          <a href="#faqs" className="text-body text-base">FAQs</a>
          <Link to="/admin/blog-editor" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isAdmin ? 'bg-heading text-white' : 'bg-gray-100 text-sub hover:bg-gray-200'}`}>✍️ Write</Link>
        </nav>
        <div className="md:hidden"> 
          <button
            type="button"
            aria-label="menu"
            aria-expanded={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen((previous) => !previous)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-cardBorder bg-white text-xl text-heading"
          >
            {isMobileMenuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {isMobileMenuOpen ? (
        <div className="border-t border-cardBorder bg-alt md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-4 sm:px-6">
            <Link to="/" onClick={closeMobileMenu} className={`${navLink('/', 'Home', location.pathname === '/')} rounded-lg px-3 py-2`}>Home</Link>
            <Link to="/finance" onClick={closeMobileMenu} className={`${navLink('/finance', 'Features', isFinance)} rounded-lg px-3 py-2`}>Features</Link>
            <Link to="/blogs" onClick={closeMobileMenu} className={`${navLink('/blogs', 'Blog', isBlog)} rounded-lg px-3 py-2`}>Blog</Link>
            <a href="#" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-body text-base hover:text-heading transition-colors">Pricing</a>
            <a href="#faqs" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-body text-base hover:text-heading transition-colors">FAQs</a>
            <Link
              to="/admin/blog-editor"
              onClick={closeMobileMenu}
              className={`mt-2 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors ${isAdmin ? 'bg-heading text-white' : 'bg-gray-100 text-sub hover:bg-gray-200'}`}
            >
              ✍️ Write
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
