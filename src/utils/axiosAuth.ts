import axios from 'axios'

let authToken: string | null = null
let interceptorRegistered = false

export const setAxiosAuthToken = (token: string | null) => {
  authToken = token
}

export const setupAxiosAuthInterceptor = () => {
  if (interceptorRegistered) {
    return
  }

  axios.interceptors.request.use((config) => {
    if (authToken) {
      config.headers = config.headers ?? {}
      config.headers.Authorization = `Bearer ${authToken}`
    }

    return config
  })

  interceptorRegistered = true
}
