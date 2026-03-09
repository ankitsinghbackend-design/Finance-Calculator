import React from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'

export default function Header(){
  const location = useLocation()
  const isFinance = location.pathname === '/finance'
  const isBlog = location.pathname.startsWith('/blogs')
  const isAdmin = location.pathname.startsWith('/admin')

  const navLink = (to: string, label: string, active: boolean) =>
    `text-base ${active ? 'text-heading font-semibold' : 'text-body hover:text-heading transition-colors'}`

  return (
    <header className="bg-alt border-b border-cardBorder">
      <div className="container mx-auto px-6 py-6 flex items-center justify-between">
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
          <button aria-label="menu">☰</button>
        </div>
      </div>
    </header>
  )
}
