import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTranslation } from '../context/TranslationContext'

export default function Header(){
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isTranslateMenuOpen, setIsTranslateMenuOpen] = useState(false)
  const isFinance = location.pathname === '/finance'
  const isBlog = location.pathname.startsWith('/blogs')
  const isAdminPage = location.pathname.startsWith('/admin')
  const { isAuthenticated, logout, user } = useAuth()
  const { currentLanguage, supportedLanguages, setLanguage, isReady, isTranslating } = useTranslation()
  const isAdminUser = user?.role === 'admin'

  const selectedLanguageLabel = useMemo(() => {
    return supportedLanguages.find((language) => language.code === currentLanguage)?.label ?? 'English'
  }, [currentLanguage, supportedLanguages])

  const navLink = (to: string, label: string, active: boolean) =>
    `text-base ${active ? 'text-heading font-semibold' : 'text-body hover:text-heading transition-colors'}`

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
    setIsTranslateMenuOpen(false)
  }

  return (
    <header className="bg-alt border-b border-cardBorder">
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between gap-4">
        <Link to="/" className="text-primary font-bold text-2xl font-figtree">Finovo</Link>
        <nav className="hidden md:flex gap-8 items-center text-gray-800 font-figtree">
          <Link to="/" className={navLink('/', 'Home', location.pathname === '/')}>Home</Link>
          <Link to="/finance" className={navLink('/finance', 'Features', isFinance)}>Features</Link>
          <Link to="/blogs" className={navLink('/blogs', 'Blog', isBlog)}>Blog</Link>
          <a href="#faqs" className="text-body text-base">FAQs</a>
          <div className="relative notranslate" translate="no">
            <button
              type="button"
              disabled={!isReady || isTranslating}
              onClick={() => setIsTranslateMenuOpen((previous) => !previous)}
              className="inline-flex items-center gap-2 rounded-lg border border-cardBorder px-3 py-2 text-sm font-medium text-heading transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              <span>{isTranslating ? 'Translating...' : 'Translate'}</span>
              <span className="text-xs text-sub">{selectedLanguageLabel}</span>
            </button>
            {isTranslateMenuOpen ? (
              <div className="absolute right-0 top-[calc(100%+8px)] z-30 w-[240px] rounded-xl border border-cardBorder bg-white p-2 shadow-card">
                <p className="px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-sub">Select language</p>
                <div className="max-h-[320px] overflow-y-auto">
                  {supportedLanguages.map((language) => (
                    <button
                      key={language.code}
                      type="button"
                      disabled={!isReady}
                      onClick={() => {
                        void setLanguage(language.code)
                        setIsTranslateMenuOpen(false)
                      }}
                      className={[
                        'flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-alt',
                        currentLanguage === language.code ? 'bg-alt text-heading font-medium' : 'text-sub'
                      ].join(' ')}
                    >
                      <span className="flex items-center gap-2">
                        <span>{language.label}</span>
                        <span className="text-xs text-sub">{language.nativeLabel}</span>
                      </span>
                      <span className="text-xs">{currentLanguage === language.code ? 'Selected' : ''}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
          {isAdminUser ? (
            <Link to="/admin/blog-editor" className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${isAdminPage ? 'bg-heading text-white' : 'bg-gray-100 text-sub hover:bg-gray-200'}`}>✍️ Write</Link>
          ) : null}
          {isAuthenticated && user ? <span className="text-sm font-medium text-sub">Hi, {user.name}</span> : null}
          {isAuthenticated ? (
            <button
              type="button"
              onClick={logout}
              className="rounded-lg border border-cardBorder px-4 py-2 text-sm font-medium text-heading transition hover:bg-white"
            >
              Logout
            </button>
          ) : (
            <Link to="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white transition hover:bg-primaryDark">Login</Link>
          )}
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
            <Link to="/blogs" onClick={closeMobileMenu} className={`${navLink('/blogs', 'Blog', isBlog)} rounded-lg px-3 py-2`}>Blogs</Link>
            <a href="#faqs" onClick={closeMobileMenu} className="rounded-lg px-3 py-2 text-body text-base hover:text-heading transition-colors">FAQs</a>
            <div className="notranslate mt-2 rounded-lg border border-cardBorder p-3" translate="no">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sub">Translate</p>
              {isTranslating ? <p className="mt-2 text-xs text-sub">Translating current page...</p> : null}
              <div className="mt-3 grid grid-cols-1 gap-2">
                {supportedLanguages.map((language) => (
                  <button
                    key={language.code}
                    type="button"
                    disabled={!isReady || isTranslating}
                    onClick={() => {
                      void setLanguage(language.code)
                      closeMobileMenu()
                    }}
                    className={[
                      'flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition hover:bg-white',
                      currentLanguage === language.code ? 'bg-white text-heading font-medium' : 'text-sub'
                    ].join(' ')}
                  >
                    <span className="flex items-center gap-2">
                      <span>{language.label}</span>
                      <span className="text-xs text-sub">{language.nativeLabel}</span>
                    </span>
                    <span className="text-xs">{currentLanguage === language.code ? 'Selected' : ''}</span>
                  </button>
                ))}
              </div>
            </div>
            {isAdminUser ? (
              <Link
                to="/admin/blog-editor"
                onClick={closeMobileMenu}
                className={`mt-2 inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm transition-colors ${isAdminPage ? 'bg-heading text-white' : 'bg-gray-100 text-sub hover:bg-gray-200'}`}
              >
                ✍️ Write
              </Link>
            ) : null}
            {isAuthenticated ? (
              <button
                type="button"
                onClick={() => {
                  logout()
                  closeMobileMenu()
                }}
                className="mt-2 inline-flex items-center justify-center rounded-lg border border-cardBorder px-3 py-2 text-sm font-medium text-heading transition-colors hover:bg-white"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMobileMenu}
                className="mt-2 inline-flex items-center justify-center rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primaryDark"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      ) : null}
    </header>
  )
}
