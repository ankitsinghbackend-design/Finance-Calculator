import React, { FormEvent, useMemo, useState } from 'react'
import axios from 'axios'
import { apiUrl } from '../config/api'
import CalculatorMarketingSections from '../components/CalculatorMarketingSections'
import EllipseBackground from '../components/EllipseBackground'

type ExchangeApiResponse = {
  result: string
  time_last_update_utc: string
  base_code: string
  rates: Record<string, number>
  provider?: string
}

type CurrencyApiResults = {
  amount: number
  fromCurrency: string
  toCurrency: string
  exchangeRate: number
  convertedAmount: number
  timeLastUpdateUtc?: string
  provider?: string
}

const RATES_API_URL = 'https://open.er-api.com/v6/latest/USD'

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const currencyNameDisplay =
  typeof Intl !== 'undefined' && 'DisplayNames' in Intl
    ? new Intl.DisplayNames(['en'], { type: 'currency' })
    : null

const getCurrencyName = (code: string): string => {
  if (!currencyNameDisplay) return code
  return currencyNameDisplay.of(code) ?? code
}

const formatByCurrency = (value: number, currencyCode: string): string => {
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode,
      maximumFractionDigits: 2
    }).format(value)
  } catch {
    return `${value.toFixed(2)} ${currencyCode}`
  }
}

export default function CurrencyCalculatorPage() {
  const [amount, setAmount] = useState<string>('1')
  const [toCurrency, setToCurrency] = useState<string>('EUR')
  const [rates, setRates] = useState<Record<string, number>>({})
  const [rate, setRate] = useState<number | null>(null)
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const currencyOptions = useMemo(() => {
    const entries = Object.keys(rates).length
      ? Object.keys(rates)
      : ['EUR', 'GBP', 'JPY', 'INR', 'AUD', 'CAD', 'SGD', 'CHF', 'AED']

    return entries
      .filter((code) => code !== 'USD')
      .sort((a, b) => a.localeCompare(b))
      .map((code) => ({
        code,
        label: `${code} (${getCurrencyName(code)})`
      }))
  }, [rates])

  const handleCalculate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const parsedAmount = Number(amount)
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      setError('Please enter a valid amount.')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(RATES_API_URL)

      if (!response.ok) {
        throw new Error('Failed to fetch exchange rates')
      }

      const data = (await response.json()) as ExchangeApiResponse

      if (data.result !== 'success' || !data.rates || typeof data.rates[toCurrency] !== 'number') {
        throw new Error('Unexpected exchange rate response')
      }

      const targetRate = data.rates[toCurrency]

      const payload = {
        amount: parsedAmount,
        fromCurrency: 'USD',
        toCurrency,
        exchangeRate: targetRate,
        timeLastUpdateUtc: data.time_last_update_utc,
        provider: data.provider
      }

      let apiResults: CurrencyApiResults | null = null

      try {
        const backendResponse = await axios.post<{ results: CurrencyApiResults }>(
          apiUrl('/api/calculators/currency'),
          { inputs: payload }
        )
        apiResults = backendResponse.data.results
      } catch {
        // Fallback keeps calculator usable if backend is temporarily unavailable.
      }

      setRates(data.rates)
      setRate(targetRate)
      setLastUpdated(data.time_last_update_utc)
      setConvertedAmount(apiResults?.convertedAmount ?? parsedAmount * targetRate)
    } catch {
      setError('Unable to fetch latest exchange rates. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleClear = () => {
    setAmount('1')
    setToCurrency('EUR')
    setRate(null)
    setConvertedAmount(null)
    setLastUpdated('')
    setError(null)
  }

  return (
    <>
    <section className="bg-[#f5f7fa] py-12 min-h-[calc(100vh-82px)] overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 xl:px-10 relative isolate">
        <EllipseBackground 
          style={{
            top: '29.89px',
            left: '684.89px',
            right: '68.39px',
            transform: 'scaleX(-1) rotate(-90.569deg)',
            width: 'calc(100% - 684.89px - 68.39px)',
            height: 'auto'
          }}
        />

        <div className="relative z-10">
        <p className="text-[19px] text-sub font-semibold">Home / Finance / Currency Calculator</p>

        <h1 className="text-[48px] leading-none font-semibold text-heading mt-3">Currency Calculator</h1>
        <p className="text-[16px] leading-[25.6px] text-body mt-3 max-w-[586px]">
          Convert from USD to global currencies using live exchange rates. Select a target currency, enter your amount, and get instant conversion results powered by real-time exchange data.
        </p>

        <div className="mt-8 grid grid-cols-1 xl:grid-cols-[565px_516px] justify-between gap-8 items-start">
          <form onSubmit={handleCalculate} className="bg-[#f9fafb] border border-cardBorder rounded-[28px] p-5 backdrop-blur-[10.5px]">
            <p className="text-[19px] font-semibold text-primary">With Live Exchange Rate</p>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <label className="text-[16px] text-sub font-medium block">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
                  placeholder="$"
                />
              </div>

              <div>
                <label className="text-[16px] text-sub font-medium block">From</label>
                <input
                  type="text"
                  readOnly
                  value="USD (United States Dollar)"
                  className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-[#9ca3af] font-medium"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="text-[16px] text-sub font-medium block">To</label>
              <select
                value={toCurrency}
                onChange={(e) => setToCurrency(e.target.value)}
                className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
              >
                {currencyOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-[15px]">
              <button
                type="submit"
                disabled={isLoading}
                className="h-[37px] rounded-lg bg-primary text-white text-[16px] font-medium shadow-card disabled:opacity-60"
              >
                {isLoading ? 'Calculating...' : 'Calculate'}
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="h-[37px] rounded-lg bg-white border border-[#e1e6ef] text-[#1d2433] text-[16px] font-medium shadow-card"
              >
                Clear
              </button>
            </div>

            {error ? (
              <p className="mt-3 text-sm text-red-600" role="status" aria-live="polite">
                {error}
              </p>
            ) : null}
          </form>

          <div className="xl:-mt-[89px] relative z-20">
            <div className="bg-white border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)] overflow-hidden">
            <div className="text-center">
              <p className="text-[16px] font-medium text-sub">Converted Amount</p>
              <p className="text-[40px] leading-none font-semibold text-heading mt-3">
                {convertedAmount === null ? '$0.00' : formatByCurrency(convertedAmount, toCurrency)}
              </p>
            </div>

            <div className="h-px bg-[#a7f3d0] my-10" />

            <p className="text-[19px] text-heading font-semibold text-center">Conversion Summary</p>

            <div className="mt-8 space-y-4 text-[19px]">
              <div className="flex items-center justify-between gap-4">
                <span className="text-body font-medium">Amount (USD)</span>
                <span className="text-heading font-semibold whitespace-nowrap">{usdFormatter.format(Number(amount) || 0)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body font-medium">Exchange Rate</span>
                <span className="text-heading font-semibold whitespace-nowrap">
                  {rate === null ? '-' : `1 USD = ${rate.toFixed(6)} ${toCurrency}`}
                </span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body font-medium">Currency</span>
                <span className="text-heading font-semibold whitespace-nowrap">{getCurrencyName(toCurrency)}</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-body font-medium">Last Updated</span>
                <span className="text-heading font-semibold text-right">{lastUpdated || '-'}</span>
              </div>
            </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>

    <CalculatorMarketingSections loginRedirectPath="/calculators/currency" />
    </>
  )
}
