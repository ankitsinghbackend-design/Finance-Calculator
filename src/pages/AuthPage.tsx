import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type AuthMode = 'login' | 'signup'

type LoginFormState = {
  email: string
  password: string
}

type SignupFormState = {
  name: string
  email: string
  password: string
}

type FieldErrors = Partial<Record<'name' | 'email' | 'password', string>>

const loginInitialState: LoginFormState = {
  email: '',
  password: ''
}

const signupInitialState: SignupFormState = {
  name: '',
  email: '',
  password: ''
}

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()
  const { login, signup, user, isInitializing } = useAuth()

  const requestedMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const [mode, setMode] = useState<AuthMode>(requestedMode)
  const [loginForm, setLoginForm] = useState<LoginFormState>(loginInitialState)
  const [signupForm, setSignupForm] = useState<SignupFormState>(signupInitialState)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const fromPath = useMemo(() => {
    const state = location.state as { from?: string } | null
    return state?.from || '/'
  }, [location.state])

  useEffect(() => {
    setMode(requestedMode)
  }, [requestedMode])

  useEffect(() => {
    if (!isInitializing && user) {
      navigate(fromPath, { replace: true })
    }
  }, [fromPath, isInitializing, navigate, user])

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode)
    setFieldErrors({})
    setSubmitError('')
    setSearchParams(nextMode === 'signup' ? { mode: 'signup' } : {})
  }

  const handleLoginSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setSubmitError('')

    try {
      await login(loginForm)
      navigate(fromPath, { replace: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setFieldErrors((error.response?.data?.fieldErrors as FieldErrors | undefined) ?? {})
        setSubmitError(error.response?.data?.error ?? 'Unable to login right now.')
      } else {
        setSubmitError('Unable to login right now.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignupSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setFieldErrors({})
    setSubmitError('')

    try {
      await signup(signupForm)
      navigate(fromPath, { replace: true })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setFieldErrors((error.response?.data?.fieldErrors as FieldErrors | undefined) ?? {})
        setSubmitError(error.response?.data?.error ?? 'Unable to create your account right now.')
      } else {
        setSubmitError('Unable to create your account right now.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="bg-[#f5f7fa] min-h-[calc(100vh-82px)] py-16 px-6">
      <div className="mx-auto max-w-[1080px] grid grid-cols-1 gap-10 lg:grid-cols-[1.1fr_480px] lg:items-center">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Welcome to Finovo</p>
          <h1 className="mt-4 text-[46px] leading-[1.1] font-semibold text-heading">Login or create your account to access calculators and feedback.</h1>
          <p className="mt-4 max-w-[620px] text-[18px] leading-[30px] text-body">
            Sign up with your name, email, and password to unlock every calculator, save authenticated usage logs, and continue to protected areas of the platform.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 text-sm text-sub">
            <span className="rounded-full bg-white px-4 py-2 shadow-card">Secure login</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-card">Protected calculators</span>
            <span className="rounded-full bg-white px-4 py-2 shadow-card">Role-based admin access</span>
          </div>
        </div>

        <div className="rounded-[32px] border border-cardBorder bg-white p-8 shadow-card">
          <div className="grid grid-cols-2 rounded-xl bg-alt p-1">
            <button
              type="button"
              onClick={() => switchMode('login')}
              className={['rounded-lg px-4 py-3 text-sm font-semibold transition', mode === 'login' ? 'bg-primary text-white' : 'text-sub hover:text-heading'].join(' ')}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => switchMode('signup')}
              className={['rounded-lg px-4 py-3 text-sm font-semibold transition', mode === 'signup' ? 'bg-primary text-white' : 'text-sub hover:text-heading'].join(' ')}
            >
              Sign Up
            </button>
          </div>

          {mode === 'login' ? (
            <form className="mt-8 space-y-5" onSubmit={handleLoginSubmit}>
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-heading">Email</label>
                <input
                  id="login-email"
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((previous) => ({ ...previous, email: event.target.value }))}
                  className="h-[46px] w-full rounded-lg border border-cardBorder px-3 text-heading"
                  placeholder="you@example.com"
                />
                {fieldErrors.email ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p> : null}
              </div>
              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-heading">Password</label>
                <input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((previous) => ({ ...previous, password: event.target.value }))}
                  className="h-[46px] w-full rounded-lg border border-cardBorder px-3 text-heading"
                  placeholder="Enter your password"
                />
                {fieldErrors.password ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p> : null}
              </div>
              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="h-[48px] w-full rounded-lg bg-primary text-[16px] font-medium text-white transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? 'Logging in...' : 'Login'}
              </button>
            </form>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSignupSubmit}>
              <div>
                <label htmlFor="signup-name" className="mb-1.5 block text-sm font-medium text-heading">Name</label>
                <input
                  id="signup-name"
                  type="text"
                  value={signupForm.name}
                  onChange={(event) => setSignupForm((previous) => ({ ...previous, name: event.target.value }))}
                  className="h-[46px] w-full rounded-lg border border-cardBorder px-3 text-heading"
                  placeholder="Your name"
                />
                {fieldErrors.name ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.name}</p> : null}
              </div>
              <div>
                <label htmlFor="signup-email" className="mb-1.5 block text-sm font-medium text-heading">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={signupForm.email}
                  onChange={(event) => setSignupForm((previous) => ({ ...previous, email: event.target.value }))}
                  className="h-[46px] w-full rounded-lg border border-cardBorder px-3 text-heading"
                  placeholder="you@example.com"
                />
                {fieldErrors.email ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.email}</p> : null}
              </div>
              <div>
                <label htmlFor="signup-password" className="mb-1.5 block text-sm font-medium text-heading">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={signupForm.password}
                  onChange={(event) => setSignupForm((previous) => ({ ...previous, password: event.target.value }))}
                  className="h-[46px] w-full rounded-lg border border-cardBorder px-3 text-heading"
                  placeholder="Create a strong password"
                />
                {fieldErrors.password ? <p className="mt-1.5 text-sm text-red-600">{fieldErrors.password}</p> : null}
                <p className="mt-2 text-xs leading-5 text-sub">Use at least 8 characters including uppercase, lowercase, number, and special character.</p>
              </div>
              {submitError ? <p className="text-sm text-red-600">{submitError}</p> : null}
              <button
                type="submit"
                disabled={submitting}
                className="h-[48px] w-full rounded-lg bg-primary text-[16px] font-medium text-white transition hover:bg-primaryDark disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {submitting ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-sub">
            Return to <Link to="/" className="font-medium text-primary hover:underline">home</Link>
          </p>
        </div>
      </div>
    </section>
  )
}
