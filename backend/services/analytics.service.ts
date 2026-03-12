import axios from 'axios'
import { CalculatorLogLocation, CalculatorLogModel } from '../models/calculatorLog.model'

export interface LogCalculatorUsageData {
  calculatorId: string
  user: {
    name: string
    email: string
  }
  location: CalculatorLogLocation
  inputs: Record<string, unknown>
  results: Record<string, unknown>
}

const UNKNOWN_LOCATION: CalculatorLogLocation = {
  country: 'Unknown',
  region: 'Unknown',
  city: 'Unknown'
}

const isPublicIp = (ip: string): boolean => {
  const normalized = ip.trim().toLowerCase()

  if (!normalized) return false
  if (normalized === '::1' || normalized === '127.0.0.1') return false
  if (normalized.startsWith('10.')) return false
  if (normalized.startsWith('192.168.')) return false
  if (normalized.startsWith('169.254.')) return false
  if (normalized.startsWith('172.')) {
    const secondOctet = Number(normalized.split('.')[1])
    if (secondOctet >= 16 && secondOctet <= 31) return false
  }
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return false

  return true
}

export const getLocationFromIp = async (ip?: string): Promise<CalculatorLogLocation> => {
  try {
    // If the IP is public, look it up directly; otherwise call without an IP
    // so ipapi resolves location from the server's outgoing public IP.
    const url =
      ip && isPublicIp(ip)
        ? `https://ipapi.co/${encodeURIComponent(ip)}/json/`
        : 'https://ipapi.co/json/'

    const response = await axios.get(url, { timeout: 3000 })

    const data = response.data as {
      country_name?: string
      region?: string
      city?: string
    }

    return {
      country: data.country_name?.trim() || UNKNOWN_LOCATION.country,
      region: data.region?.trim() || UNKNOWN_LOCATION.region,
      city: data.city?.trim() || UNKNOWN_LOCATION.city
    }
  } catch {
    return UNKNOWN_LOCATION
  }
}

export const logCalculatorUsage = async (data: LogCalculatorUsageData): Promise<void> => {
  await CalculatorLogModel.create({
    calculatorId: data.calculatorId,
    name: data.user.name,
    email: data.user.email,
    location: data.location,
    inputs: data.inputs,
    results: data.results
  })
}
