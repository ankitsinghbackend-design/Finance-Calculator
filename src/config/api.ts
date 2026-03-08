const env = import.meta.env as ImportMetaEnv

export const API_BASE_URL = (env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

export const apiUrl = (path: string): string => {
  if (API_BASE_URL) {
    return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`
  }

  if (import.meta.env.DEV) {
    return `http://localhost:5001${path.startsWith('/') ? path : `/${path}`}`
  }

  return path
}
