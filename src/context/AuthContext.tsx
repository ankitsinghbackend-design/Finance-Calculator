import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import { setAxiosAuthToken, setupAxiosAuthInterceptor } from '../utils/axiosAuth'

export type AuthRole = 'user' | 'admin'

export type AuthUser = {
  id: string
  name: string
  email: string
  role: AuthRole
}

type LoginPayload = {
  email: string
  password: string
}

type SignupPayload = {
  name: string
  email: string
  password: string
}

type AuthResponse = {
  token: string
  user: AuthUser
}

type AuthContextValue = {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (payload: LoginPayload) => Promise<void>
  signup: (payload: SignupPayload) => Promise<void>
  logout: () => void
}

const AUTH_STORAGE_KEY = 'finovo-auth'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const persistAuth = (token: string, user: AuthUser) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }))
  setAxiosAuthToken(token)
}

const clearPersistedAuth = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY)
  setAxiosAuthToken(null)
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)

  useEffect(() => {
    setupAxiosAuthInterceptor()

    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (!storedAuth) {
      setIsInitializing(false)
      return
    }

    const restoreSession = async () => {
      try {
        const parsed = JSON.parse(storedAuth) as AuthResponse
        if (!parsed.token || !parsed.user) {
          clearPersistedAuth()
          return
        }

        setToken(parsed.token)
        setUser(parsed.user)
        setAxiosAuthToken(parsed.token)

        const { data } = await axios.get<{ user: AuthUser }>(apiUrl('/api/auth/me'))
        setUser(data.user)
        persistAuth(parsed.token, data.user)
      } catch {
        setUser(null)
        setToken(null)
        clearPersistedAuth()
      } finally {
        setIsInitializing(false)
      }
    }

    void restoreSession()
  }, [])

  const handleAuthSuccess = (data: AuthResponse) => {
    setToken(data.token)
    setUser(data.user)
    persistAuth(data.token, data.user)
  }

  const login = async (payload: LoginPayload) => {
    const { data } = await axios.post<AuthResponse>(apiUrl('/api/auth/login'), payload)
    handleAuthSuccess(data)
  }

  const signup = async (payload: SignupPayload) => {
    const { data } = await axios.post<AuthResponse>(apiUrl('/api/auth/signup'), payload)
    handleAuthSuccess(data)
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    clearPersistedAuth()
  }

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(user && token),
      isInitializing,
      login,
      signup,
      logout
    }),
    [user, token, isInitializing]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  return context
}
