import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { calculate, schema, type AutoLoanResults } from '../../backend/calculations/autoLoan'
import { landingCalculatorColumns } from '../config/calculatorConfig'
import { apiUrl } from '../config/api'
import heroGraphicSvg from '../assets/hero-graphic.svg'
import faqQuoteIconSvg from '../assets/Vector.svg'
import expectBgImg from '../assets/expect-bg.png'
import financeVisualImg from '../assets/finance-visual.png'
// How It Works icons (SVG)
import iconSearch from '../assets/icon-search.svg'
import iconEdit from '../assets/icon-edit.svg'
import iconChartPie from '../assets/icon-chart-pie.svg'

// Why Choose Us icons (SVG)
import iconBarcode from '../assets/icon-barcode.svg'
import iconTarget from '../assets/icon-target.svg'
import iconShieldBlue from '../assets/icon-shield-blue.svg'
import iconLaptop from '../assets/icon-laptop.svg'

// Benefits icons (SVG)
import iconAnalytics from '../assets/icon-analytics.svg'
import iconTimer from '../assets/icon-timer.svg'
import iconChartBar from '../assets/icon-chart-bar.svg'
import iconSearch2 from '../assets/icon-search-2.svg'
import iconShieldRed from '../assets/icon-shield-red.svg'
import iconUserComment from '../assets/icon-user-comment.svg'
import shieldCheckIcon from '../assets/shield-check.svg'

// Additional section icons (SVG)
import iconChartPie2 from '../assets/icon-chart-pie-2.svg'
import iconArrowsSplit from '../assets/icon-arrows-split.svg'
import iconGlobe from '../assets/icon-globe.svg'

type AutoLoanFormState = {
  price: string
  termMonths: string
  annualRatePct: string
  downPayment: string
  tradeInValue: string
  amountOwedOnTradeIn: string
  cashIncentives: string
  salesTaxPct: string
  titlesFees: string
  otherFees: string
}

const toNumber = (value: string): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD'
})

const formatCurrency = (value: number): string => currencyFormatter.format(value)

export default function Home(){
  const heroGraphic = heroGraphicSvg
  const faqQuote = faqQuoteIconSvg
  const expectBg = expectBgImg

  const howItWorks = [
    {
      no: '01',
      title: 'Choose a Calculator',
      body: 'Select the financial calculator you need, such as loan, investment, tax, or savings calculators.',
      icon: iconSearch
    },
    {
      no: '02',
      title: 'Enter Financial Details',
      body: 'Fill in values like amount, interest rate, or time period to process accurate calculations.',
      icon: iconEdit
    },
    {
      no: '03',
      title: 'View Results Instantly',
      body: 'Get clear payment breakdowns and projections to make smarter financial decisions instantly.',
      icon: iconChartPie
    }
  ]

  const featureList = [
    {
      title: 'Accurate Financial Calculations',
      body: 'Our calculators are built using industry-standard financial formulas to provide dependable and consistent results. Each tool is carefully designed to help users estimate payments, returns, and savings with clarity. Regular updates ensure calculations follow current financial practices. Results are generated instantly for quick decision making. Whether planning loans or investments, accuracy remains our priority. Helping users make confident financial decisions is our core goal.'
    },
    {
      title: 'Wide Range of Tools',
      body: 'Our calculators are built using industry-standard financial formulas to provide dependable and consistent results. Each tool is carefully designed to help users estimate payments, returns, and savings with clarity. Regular updates ensure calculations follow current financial practices. Results are generated instantly for quick decision making. Whether planning loans or investments, accuracy remains our priority. Helping users make confident financial decisions is our core goal.'
    },
    {
      title: 'Fast & Easy to Use',
      body: 'Our platform focuses on simplicity so users can calculate results without confusion or technical knowledge. Interfaces are designed to guide users step by step through inputs and results. Calculations are processed instantly for smooth user experience. Clear result displays help users understand outcomes quickly. Minimal input steps reduce effort while improving accuracy. Anyone can use the platform easily, regardless of financial expertise.'
    },
    {
      title: 'No Signup Required',
      body: 'Users can start calculating instantly without creating accounts or sharing personal information. This makes the platform accessible and convenient for quick financial planning needs. No login barriers mean faster access to tools when needed. We prioritize privacy and simplicity over unnecessary registration processes. Users remain in full control of their data and calculations. Immediate access helps users solve financial questions faster.'
    },
    {
      title: 'Mobile Friendly Design',
      body: 'Our calculators work smoothly across desktops, tablets, and mobile devices. Responsive layouts ensure accurate calculations regardless of screen size. Users can plan finances anytime and anywhere conveniently. Interfaces automatically adapt for smaller screens without losing functionality. Fast performance ensures tools run smoothly on mobile networks as well. Financial planning remains accessible on every device.'
    }
  ]

  const benefits = [
    {
      title: 'Make Smarter Financial Decisions',
      body: 'Understand loan payments, savings growth, and investment returns clearly before making commitments. Our calculators help users compare options and choose financially better solutions. By visualizing financial outcomes in advance, users avoid costly mistakes and plan responsibly. Better decisions today lead to stronger financial security tomorrow.',
      icon: iconAnalytics
    },
    {
      title: 'Save Valuable Time Planning',
      body: 'Instead of manually calculating numbers or searching multiple sources, get instant financial estimates in seconds. Automated tools reduce calculation errors and provide quick results. Users spend less time figuring out finances and more time focusing on goals that matter. Efficient tools simplify complex financial planning.',
      icon: iconTimer
    },
    {
      title: 'Plan Future Finances Confidently',
      body: 'Whether saving for retirement, buying a home, or planning investments, our calculators provide clear future projections. Users can see how small financial changes impact long-term goals. This clarity builds confidence in planning major life decisions. Financial future planning becomes easier and less stressful.',
      icon: iconChartBar
    },
    {
      title: 'Compare Financial Options Easily',
      body: 'Compare loans, savings, or investment scenarios instantly to find the best financial path. Users can adjust inputs and immediately see outcome differences. This helps select affordable loans, smarter investments, and better savings strategies. Better comparisons lead to better financial choices.',
      icon: iconSearch2
    },
    {
      title: 'Avoid Unexpected Financial Surprises',
      body: 'Know future payments, interest costs, and savings growth before making commitments. Financial awareness prevents unexpected burdens later. Calculators help users prepare budgets realistically. Planning ahead protects users from risky financial decisions.',
      icon: iconShieldRed
    },
    {
      title: 'Financial Tools Accessible Everyone',
      body: 'Whether students, professionals, families, or business owners, anyone can use our tools easily. No financial expertise is required to understand results. Simple interfaces ensure accessibility for all users. Everyone deserves access to clear financial planning tools.',
      icon: iconUserComment
    }
  ]

  const additional = [
    {
      title: 'Smart Financial Insights',
      body: 'Get clearer understanding of loan payments, savings growth, and investment returns through easy-to-read breakdowns and projections. Our tools help users analyze numbers quickly and plan finances with better clarity and confidence.',
      icon: iconChartPie2
    },
    {
      title: 'Compare Multiple Scenarios',
      body: 'Adjust financial inputs and instantly compare multiple calculation scenarios to choose the best financial option. Users can explore different possibilities before making real financial commitments.',
      icon: iconArrowsSplit
    },
    {
      title: 'Works Anytime, Anywhere',
      body: 'Access calculators from any device at any time without installation or downloads. Whether on mobile or desktop, users can plan finances wherever convenient.',
      icon: iconGlobe
    }
  ]

  const compareRows = [
    {
      left: 'Completely Free Financial Tools',
      finovo: 'All essential calculators available free without hidden costs.',
      other: 'Limited free tools or paid access required.',
      otherBad: false
    },
    {
      left: 'Completely Free Financial Tools',
      finovo: 'Clean interface designed for quick and easy calculations.',
      other: 'Often complex or cluttered calculator interfaces.',
      otherBad: false
    },
    {
      left: 'Completely Free Financial Tools',
      finovo: 'Instant access without signup or personal data submission.',
      other: 'Many tools require account creation or login.',
      otherBad: true
    },
    {
      left: 'Completely Free Financial Tools',
      finovo: 'Instant results using trusted financial formulas.',
      other: 'Slower tools or outdated calculations.',
      otherBad: true
    }
  ]

  const [autoLoanInputs, setAutoLoanInputs] = useState<AutoLoanFormState>({
    price: '50000',
    termMonths: '60',
    annualRatePct: '7.2',
    downPayment: '5000',
    tradeInValue: '7000',
    amountOwedOnTradeIn: '2000',
    cashIncentives: '1000',
    salesTaxPct: '3',
    titlesFees: '300',
    otherFees: '500'
  })
  const [autoLoanResults, setAutoLoanResults] = useState<AutoLoanResults | null>(null)
  const [calculateError, setCalculateError] = useState<string | null>(null)
  const [isCalculatingAutoLoan, setIsCalculatingAutoLoan] = useState(false)

  const upfrontPayment =
    toNumber(autoLoanInputs.downPayment) +
    toNumber(autoLoanInputs.tradeInValue) +
    toNumber(autoLoanInputs.cashIncentives)

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setAutoLoanInputs((previous) => ({
      ...previous,
      [name]: value
    }))
  }

  const handleAutoLoanSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setCalculateError(null)

    const raw = {
      price: toNumber(autoLoanInputs.price),
      termMonths: toNumber(autoLoanInputs.termMonths),
      annualRatePct: toNumber(autoLoanInputs.annualRatePct),
      downPayment: toNumber(autoLoanInputs.downPayment),
      tradeInValue: toNumber(autoLoanInputs.tradeInValue),
      amountOwedOnTradeIn: toNumber(autoLoanInputs.amountOwedOnTradeIn),
      cashIncentives: toNumber(autoLoanInputs.cashIncentives),
      salesTaxPct: toNumber(autoLoanInputs.salesTaxPct),
      titlesFees: toNumber(autoLoanInputs.titlesFees),
      otherFees: toNumber(autoLoanInputs.otherFees)
    }

    const parsed = schema.safeParse(raw)
    if (!parsed.success) {
      setCalculateError('Invalid inputs. Please check your values.')
      return
    }

    try {
      setIsCalculatingAutoLoan(true)
      const response = await axios.post<{ results: AutoLoanResults }>(apiUrl('/api/calculators/auto-loan'), {
        inputs: parsed.data
      })
      setAutoLoanResults(response.data.results)
    } catch {
      const results = calculate(parsed.data)
      setAutoLoanResults(results)
      setCalculateError('Unable to reach server. Showing local calculation results.')
    } finally {
      setIsCalculatingAutoLoan(false)
    }
  }

  useEffect(() => {
    const revealNodes = document.querySelectorAll<HTMLElement>('.reveal-stagger')

    if (!revealNodes.length) return

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active')
            obs.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -10% 0px'
      }
    )

    revealNodes.forEach((node) => observer.observe(node))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="bg-alt">
      <section className="relative overflow-hidden">
        <img
          src={heroGraphic}
          alt=""
          aria-hidden
          className="hidden xl:block absolute right-0 top-[42px] w-[868px] h-[883px] object-contain pointer-events-none select-none"
        />

        <div className="max-w-[1360px] mx-auto px-6 xl:px-10 pt-20 pb-10 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-[586px_1fr] gap-8 items-start">
            <div>
              <h1 className="text-[48px] leading-[1.12] font-semibold text-heading">
                Smart Financial Calculations Made <span className="text-primary">Simple</span>
              </h1>
              <p className="text-[16px] leading-[1.6] text-body mt-3">
                Plan loans, investments, taxes, savings, and retirement in seconds using our powerful and free financial calculators.
              </p>

              <form
                className="mt-5 border border-cardBorder rounded-[28px] p-5 bg-alt w-full max-w-[516px]"
                onSubmit={handleAutoLoanSubmit}
              >
                <h3 className="text-[19px] leading-none font-semibold text-heading">Auto Loan Calculator</h3>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-[10px] gap-y-5">
                  {[
                    { label: 'Auto Price', name: 'price', placeholder: '50000' },
                    { label: 'Loan Term (Months)', name: 'termMonths', placeholder: '60' },
                    { label: 'Interest Rate (%)', name: 'annualRatePct', placeholder: '7.2' },
                    { label: 'Cash Incentives', name: 'cashIncentives', placeholder: '1000' },
                    { label: 'Down Payment', name: 'downPayment', placeholder: '5000' },
                    { label: 'Trade-in Value', name: 'tradeInValue', placeholder: '7000' },
                    { label: 'Amount Owed on Trade-in', name: 'amountOwedOnTradeIn', placeholder: '2000' },
                    { label: 'Sales Tax (%)', name: 'salesTaxPct', placeholder: '3' },
                    { label: 'Titles / Registration', name: 'titlesFees', placeholder: '300' },
                    { label: 'Other Fees', name: 'otherFees', placeholder: '500' }
                  ].map((field) => (
                    <div key={field.name}>
                      <p className="text-[16px] text-sub font-medium">{field.label}</p>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        name={field.name}
                        value={autoLoanInputs[field.name as keyof AutoLoanFormState]}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        className="h-[42px] mt-1.5 w-full rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-sub font-medium"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={isCalculatingAutoLoan}
                  className="mt-7 w-full h-[46px] rounded-lg bg-primary text-white text-[30px] font-medium shadow-card"
                >
                  {isCalculatingAutoLoan ? 'Calculating...' : 'Calculate'}
                </button>
                {calculateError ? (
                  <p className="mt-3 text-sm text-red-600" role="status" aria-live="polite">
                    {calculateError}
                  </p>
                ) : null}
              </form>
            </div>

            <div className="pt-14 xl:pt-[147px]">
              <div className="max-w-[516px] ml-auto">
                <div className="bg-alt border border-cardBorder rounded-[16px] px-6 py-12 shadow-[0px_2px_6px_0px_rgba(205,205,205,0.72)]">
                <div className="text-center">
                  <p className="text-[16px] font-medium text-sub">Total Monthly Payment</p>
                  <p className="text-[40px] leading-none font-semibold text-heading mt-3">
                    <span className="text-sub">$</span>
                    {' '}{(autoLoanResults?.monthlyPayment ?? 0).toFixed(2)}
                  </p>
                </div>
                <div className="h-px bg-[#a7f3d0] my-10" />
                <div className="space-y-4 text-[19px]">
                  {[
                    ['Total Loan Amount', formatCurrency(autoLoanResults?.loanAmount ?? 0)],
                    ['Sale Tax', formatCurrency(autoLoanResults?.saleTax ?? 0)],
                    ['Upfront Payment', formatCurrency(upfrontPayment)]
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between">
                      <span className="text-body font-medium">{k}</span>
                      <span className="text-heading font-semibold">{v}</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 text-[19px] mt-10">
                  {[
                    [`Total of ${toNumber(autoLoanInputs.termMonths)} Loan Payments`, formatCurrency(autoLoanResults?.totalPayments ?? 0)],
                    ['Total Loan Interest', formatCurrency(autoLoanResults?.totalInterest ?? 0)],
                    ['Total Cost (Price, Interest, Tax, Fees)', formatCurrency(autoLoanResults?.totalCost ?? 0)]
                  ].map(([k, v]) => (
                    <div key={k} className="flex items-center justify-between gap-4">
                      <span className="text-body font-medium">{k}</span>
                      <span className="text-heading font-semibold whitespace-nowrap">{v}</span>
                    </div>
                  ))}
                </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-8 grid grid-cols-1 xl:grid-cols-[1fr_321px] gap-10 items-start">
        <div>
          <h3 className="text-[28px] font-medium text-black">Financial Calculators</h3>
          <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-x-8 gap-y-4 text-[19px] text-body font-semibold underline">
            {landingCalculatorColumns.map((col, idx) => (
              <div key={idx} className="space-y-3">
                {col.map((item) => (
                  <p key={item.calculatorId}>
                    <Link to={item.calculatorId === 'amortization' ? '/finance/amortization' : `/calculators/${item.calculatorId}`}>
                      {item.label}
                    </Link>
                  </p>
                ))}
              </div>
            ))}
          </div>
          <p className="text-[23px] text-primaryDark underline mt-2 text-right">View All</p>
        </div>
        <div className="h-[316px] rounded-2xl border border-cardBorder bg-white flex items-center justify-center text-[28px] text-sub">AD.</div>
      </section>

      <section className="bg-alt py-10">
        <div className="max-w-[1440px] mx-auto px-6 xl:px-10">
          <div className="text-center max-w-[652px] mx-auto">
            <h2 className="text-[40px] font-semibold text-heading">How It Work’s</h2>
            <p className="mt-3 text-[16px] leading-[25.6px] text-sub">Follow three simple steps to quickly calculate loans, investments, savings, and other financial estimates with accurate results.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
            {howItWorks.map((item) => (
              <article
                key={item.no}
                className="relative border border-cardBorder bg-alt rounded-[10px] min-h-[254px] overflow-hidden px-[42px] py-[30px]"
              >
                <p className="absolute right-5 top-[56px] text-[100px] leading-none font-black text-cardBorder">{item.no}</p>
                <img src={item.icon} alt="icon" className="w-[42px] h-[42px] relative z-10" />
                <h3 className="mt-4 text-[23px] leading-normal font-medium text-heading relative z-10">{item.title}</h3>
                <p className="mt-3 text-[16px] leading-[25.6px] text-body relative z-10">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-14">
        <div className="grid grid-cols-1 xl:grid-cols-[720px_586px] gap-12 items-center">
          <div className="h-[378px] rounded-2xl overflow-hidden">
            <img src={financeVisualImg} alt="finance calculator visual" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-[40px] leading-tight font-semibold text-heading">Your Complete Financial Calculator Platform</h2>
            <p className="text-[19px] font-semibold text-sub mt-3">Make smarter financial decisions with fast, accurate, and easy-to-use calculation tools.</p>
            <p className="text-[16px] leading-[25.6px] text-body mt-3">Access a wide range of calculators to plan loans, investments, savings, and retirement with confidence. Our tools simplify complex financial numbers into clear and easy results anyone can understand. No complicated setup or account is required just enter your values and calculate instantly.</p>
            <p className="text-[16px] leading-[25.6px] text-body mt-4">Whether for personal or professional use, our platform helps you stay financially informed.</p>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-2" id="features">
        <div className="grid grid-cols-1 xl:grid-cols-[652px_605px] justify-between gap-10">
          <div>
            <h2 className="text-[40px] leading-tight font-semibold text-heading max-w-[528px]">Powerful Features Built for Smart Financial Planning</h2>
            <p className="text-[16px] leading-[25.6px] text-sub mt-3 max-w-[652px]">Everything you need to calculate, compare, and plan finances with accuracy and confidence.</p>
          </div>
          <div className="flex gap-[7px]">
            <div className="w-[12px] flex flex-col items-center shrink-0">
              {featureList.map((_, i) => (
                <React.Fragment key={i}>
                  <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                  {i < featureList.length - 1 && <div className="w-[6px] flex-1 bg-primary rounded-full" />}
                </React.Fragment>
              ))}
            </div>
            <div className="space-y-5 w-[586px]">
              {featureList.map((item, index) => (
                <div
                  key={item.title}
                  className="reveal-stagger"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <h3 className="text-[19px] font-semibold text-heading">{item.title}</h3>
                  <p className="text-[16px] leading-[25.6px] text-body mt-2">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-16">
        <div className="text-center max-w-[652px] mx-auto">
          <h2 className="text-[40px] font-semibold text-heading">Why Choose Our Platform?</h2>
          <p className="text-[16px] leading-[25.6px] text-sub mt-3">We provide fast, accurate, and easy-to-use financial calculators designed to help everyone make smarter financial decisions with confidence.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {[
            ['Accurate Financial', 'Select the financial calculator you need, such as loan, investment, tax, or savings calculators.', iconBarcode],
            ['Easy to Use', 'Select the financial calculator you need, such as loan, investment, tax, or savings calculators.', iconTarget],
            ['Secure & Private Usage', 'Fill in values like amount, interest rate, or time period to process accurate calculations.', iconShieldBlue],
            ['Free & Always Accessible', 'Get clear payment breakdowns and projections to make smarter financial decisions instantly.', iconLaptop]
          ].map(([title, body, icon]) => (
            <article key={title} className="bg-alt border border-cardBorder rounded-[10px] p-5 min-h-[254px]">
              <img src={icon} alt="icon" className="w-[42px] h-[42px]" />
              <h3 className="text-[23px] leading-tight font-medium text-heading mt-6">{title}</h3>
              <p className="text-[16px] leading-[25.6px] text-body mt-4">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-8">
        <div className="text-center max-w-[652px] mx-auto">
          <h2 className="text-[40px] font-semibold text-heading">Benefits of Financial Calculators</h2>
          <p className="text-[16px] leading-[25.6px] text-sub mt-3">Make smarter financial decisions with clarity, confidence, and better planning tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-10">
          {benefits.map((item) => (
            <article key={item.title} className="rounded-[10px] border border-cardBorder p-5 bg-alt">
              <img src={item.icon} alt="" className="w-[42px] h-[42px]" />
              <h3 className="text-[23px] leading-tight font-medium text-heading mt-6">{item.title}</h3>
              <p className="text-[16px] leading-[25.6px] mt-3 text-body">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-alt py-12 mt-10">
        <div className="max-w-[1440px] mx-auto px-6 xl:px-10">
          <div className="text-center max-w-[652px] mx-auto">
            <h2 className="text-[40px] font-semibold text-heading">How We Compare to Others</h2>
            <p className="text-[16px] leading-[25.6px] text-sub mt-3">See why users prefer our platform for faster, simpler, and more reliable financial calculations.</p>
          </div>

          <div className="mt-10 border-t border-cardBorder">
            <div className="grid grid-cols-1 md:grid-cols-[220px_1fr_1fr] xl:grid-cols-[274px_374px_374px] xl:justify-between text-center py-5 border-b border-cardBorder gap-4 xl:gap-0">
              <div />
              <div className="text-primary text-[28px] font-bold">Finovo</div>
              <div className="text-sub text-[19px] font-semibold">Other Competitors</div>
            </div>

            {compareRows.map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[220px_1fr_1fr] xl:grid-cols-[274px_374px_374px] xl:justify-between py-4 border-b border-cardBorder gap-4 xl:gap-0">
                <p className="text-[19px] text-sub font-semibold">{row.left}</p>
                <div className="flex items-start gap-2 text-body text-[16px] leading-[25.6px] max-w-[374px]">
                  <span className="text-primary">✓</span>
                  <p>{row.finovo}</p>
                </div>
                <div className="flex items-start gap-2 text-body text-[16px] leading-[25.6px] max-w-[374px]">
                  <span className={row.otherBad ? 'text-sub' : 'text-primary'}>{row.otherBad ? '✕' : '✓'}</span>
                  <p>{row.other}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-16">
        <div className="max-w-[528px]">
          <h2 className="text-[40px] leading-tight font-semibold text-heading">Additional Reasons to Use Our Platforms.</h2>
          <p className="text-[16px] leading-[25.6px] text-sub mt-3">Discover additional advantages that make our platform smarter and more convenient for everyday financial planning.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {additional.map((item) => (
            <article key={item.title} className="bg-alt border border-cardBorder rounded-[10px] p-5 min-h-[254px]">
              <img src={item.icon} alt="" className="w-[42px] h-[42px]" />
              <h3 className="text-[23px] leading-tight font-medium text-heading mt-4">{item.title}</h3>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-6 pb-14">
        <div className="text-center max-w-[652px] mx-auto">
          <h2 className="text-[40px] font-semibold text-heading">Your Privacy & Data Security Matter</h2>
          <p className="text-[16px] leading-[25.6px] text-sub mt-3">We prioritize user privacy and ensure all financial calculations remain secure and confidential.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-10">
          <article className="bg-primary rounded-2xl border border-cardBorder p-5 md:p-6 text-white">
            <h3 className="text-[19px] leading-tight font-semibold">SSL & TLS</h3>
            <p className="text-[19px] font-semibold mt-2.5">Included across all calculators</p>
            <p className="text-[16px] leading-[25.6px] mt-5 text-[#f9fafb]">All calculations are processed through secure encrypted connections to ensure financial inputs remain protected at all times. We do not expose or transmit sensitive information beyond the calculation process, keeping every session secure and private. This encryption technology safeguards data while users calculate loans, investments, or savings, providing peace of mind during financial planning. Our goal is to maintain a safe environment where users can perform calculations confidently without worrying about data misuse or security risks.</p>
            <button className="mt-6 bg-white text-[#1d2433] border border-[#e1e6ef] rounded-lg px-4 py-2 font-medium">Learn More ↗</button>
          </article>

          <article className="bg-alt rounded-2xl border border-cardBorder p-5 md:p-6 relative overflow-hidden">
            <h3 className="text-[19px] leading-tight font-semibold text-heading">No PII Stored</h3>
            <p className="text-[19px] font-semibold text-sub mt-2.5">No signup required</p>
            <p className="text-[16px] leading-[25.6px] mt-5 text-body">Our platform does not collect or store personally identifiable information when users perform financial calculations. All calculations are processed instantly within the session without requiring account creation, personal details, or financial records to be submitted or saved. Users maintain full control over their privacy, allowing them to explore loan options, investment scenarios, savings plans, and other financial estimates securely and confidently. By avoiding unnecessary data collection, we ensure users can access tools freely without concerns about misuse of information or unwanted tracking.</p>
            <button className="mt-6 bg-white text-[#1d2433] border border-[#e1e6ef] rounded-lg px-4 py-2 font-medium">Privacy Policy ↗</button>
            <img
              src={shieldCheckIcon}
              alt=""
              aria-hidden
              className="absolute right-[11px] top-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none select-none"
            />
          </article>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-4">
        <div className="grid grid-cols-1 xl:grid-cols-[670px_448px] justify-between gap-8 items-center">
          <div>
            <h3 className="text-[33px] font-semibold text-heading">Disclaimer</h3>
            <p className="text-[16px] leading-[25.6px] text-body mt-3">All calculations are processed through secure encrypted connections to ensure financial inputs remain protected at all times. We do not expose or transmit sensitive information beyond the calculation process, keeping every session secure and private. This encryption technology safeguards data while users calculate loans, investments, or savings, providing peace of mind during financial planning. Our goal is to maintain a safe environment where users can perform calculations confidently without worrying about data misuse or security risks.</p>
            <p className="text-[16px] leading-[25.6px] text-body mt-3">Users are encouraged to consult qualified financial advisors or professionals before making financial decisions based on calculator results. Actual loan terms, investment returns, taxes, or financial outcomes may vary depending on individual circumstances and market conditions.</p>
            <p className="text-[16px] leading-[25.6px] text-body mt-3">Our platform does not guarantee financial results, and users remain responsible for verifying calculations and decisions before committing to financial agreements or investments.</p>
            <p className="text-[16px] leading-[25.6px] text-body mt-3">By using this platform, users acknowledge that calculations are estimates only and agree to use the information at their own discretion and risk.</p>
          </div>
          <div className="h-[343px] rounded-lg bg-cardBorder flex items-center justify-center text-[23px] font-medium text-black">AD.</div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-16">
        <div className="grid grid-cols-1 xl:grid-cols-[513px_670px] justify-between gap-10">
          <div className="flex flex-col justify-center gap-14">
            <div className="flex flex-col items-start gap-5">
              <div className="flex items-start gap-[6px]" aria-hidden>
                <img src={faqQuote} alt="" className="w-[29px] h-[53px]" />
                <img src={faqQuote} alt="" className="w-[29px] h-[53px]" />
              </div>
              <h2 className="text-[40px] font-semibold text-heading leading-none">Frequently Asked Questions</h2>
            </div>
            <div className="bg-[rgba(167,243,208,0.2)] border border-cardBorder rounded-2xl p-5 w-full max-w-[360px]">
              <p className="text-[19px] font-semibold text-heading">Still have questions?</p>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">Can&apos;t find the answer you’re looking for? Contact us and our team will assist you as soon as possible.</p>
              <button className="mt-5 bg-white border border-[#e1e6ef] rounded-lg px-4 py-2 text-[#1d2433] font-medium shadow-card">Send Mail ✉</button>
            </div>
          </div>

          <div className="space-y-5">
            <article className="border border-cardBorder rounded-2xl p-4">
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[19px] font-semibold text-heading">Accurate Financial Calculations</h3>
                <span className="text-primary">▴</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-body mt-2">Our calculators are built using industry-standard financial formulas to provide dependable and consistent results. Each tool is carefully designed to help users estimate payments, returns, and savings with clarity. Regular updates ensure calculations follow current financial practices. Results are generated instantly for quick decision making. Whether planning loans or investments, accuracy remains our priority. Helping users make confident financial decisions is our core goal.</p>
            </article>

            {[
              'Do I need to create an account to use calculators?',
              'How accurate are the calculation results?',
              'Is my financial information stored or shared?',
              'Can I use calculators on mobile devices?'
            ].map((q) => (
              <article key={q} className="border border-cardBorder rounded-2xl p-4 flex items-center justify-between gap-4">
                <h3 className="text-[19px] font-semibold text-heading">{q}</h3>
                <span className="text-primary">▾</span>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-20">
          <div className="text-center max-w-[652px] mx-auto">
            <h2 className="text-[40px] font-semibold text-heading">What You Can Expect From Us</h2>
            <p className="text-[16px] leading-[25.6px] text-body mt-3">Our platform does not guarantee financial results, and users remain responsible for verifying calculations and decisions before committing to financial agreements or investments.</p>
          </div>

          <div className="mt-10 relative hidden xl:block h-[731px] max-w-[1268px] mx-auto">
            <img src={expectBg} alt="" aria-hidden className="absolute left-0 top-0 w-[401px] opacity-80" />

            <article className="absolute left-[73px] top-[68px] w-[500px] h-[215px] bg-cardBorder border border-cardBorder rounded-[20px] p-5 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">❔</span>
                <span className="bg-[#a7f3d0] text-[#1d2433] text-[16px] font-medium px-3 py-1 rounded-lg">Challenges</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-black mt-3">Users often need quick financial answers without navigating complicated tools or understanding complex financial formulas. Many platforms make calculations difficult or hide useful tools behind signups or paid access, creating frustration when planning finances.</p>
            </article>

            <article className="absolute left-[762px] top-[206px] w-[500px] h-[215px] bg-alt border border-cardBorder rounded-[20px] p-5 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">💡</span>
                <span className="bg-primary text-[#f9fafb] text-[16px] font-medium px-3 py-1 rounded-lg">Solutions</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">Users often need quick financial answers without navigating complicated tools or understanding complex financial formulas. Many platforms make calculations difficult or hide useful tools behind signups or paid access, creating frustration when planning finances.</p>
            </article>

            <article className="absolute left-[73px] top-[404px] w-[500px] h-[190px] bg-cardBorder border border-cardBorder rounded-[20px] p-5 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">❔</span>
                <span className="bg-[#a7f3d0] text-[#1d2433] text-[16px] font-medium px-3 py-1 rounded-lg">Challenges</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-black mt-3">People want financial tools that help compare options clearly before making important financial decisions, whether for loans, investments, or savings. Confusing results or limited comparison features often lead to poor financial choices.</p>
            </article>

            <article className="absolute left-[768px] top-[541px] w-[500px] h-[190px] bg-alt border border-cardBorder rounded-[20px] p-5 z-10">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">💡</span>
                <span className="bg-primary text-[#f9fafb] text-[16px] font-medium px-3 py-1 rounded-lg">Solutions</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">We continuously enhance calculators to provide clearer breakdowns, better comparisons, and improved insights so users can confidently evaluate financial scenarios and choose the best options for their needs.</p>
            </article>

            {/* Arrow 1 — Challenge 1 → Solution 1 */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute z-20"
              style={{ left: 567, top: 169 }}
              width="201"
              height="150"
              viewBox="0 0 201 150"
              fill="none"
            >
              <path
                d="M 6,6 C 100,6 101,144 195,144"
                stroke="#22C55E"
                strokeWidth="2"
                strokeDasharray="6 4"
                fill="none"
              />
              <circle cx="6" cy="6" r="5" fill="white" stroke="#22C55E" strokeWidth="2" />
              <circle cx="195" cy="144" r="5" fill="white" stroke="#22C55E" strokeWidth="2" />
            </svg>

            {/* Arrow 2 — Challenge 2 → Solution 2 */}
            <svg
              aria-hidden="true"
              className="pointer-events-none absolute z-20"
              style={{ left: 567, top: 493 }}
              width="207"
              height="149"
              viewBox="0 0 207 149"
              fill="none"
            >
              <path
                d="M 6,6 C 103,6 104,143 201,143"
                stroke="#22C55E"
                strokeWidth="2"
                strokeDasharray="6 4"
                fill="none"
              />
              <circle cx="6" cy="6" r="5" fill="white" stroke="#22C55E" strokeWidth="2" />
              <circle cx="201" cy="143" r="5" fill="white" stroke="#22C55E" strokeWidth="2" />
            </svg>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-y-8 xl:hidden">
            <article className="bg-cardBorder border border-cardBorder rounded-[20px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">❔</span>
                <span className="bg-[#a7f3d0] text-[#1d2433] text-[16px] font-medium px-3 py-1 rounded-lg">Challenges</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-black mt-3">Users often need quick financial answers without navigating complicated tools or understanding complex financial formulas. Many platforms make calculations difficult or hide useful tools behind signups or paid access, creating frustration when planning finances.</p>
            </article>

            <article className="bg-alt border border-cardBorder rounded-[20px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">💡</span>
                <span className="bg-primary text-[#f9fafb] text-[16px] font-medium px-3 py-1 rounded-lg">Solutions</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">Users often need quick financial answers without navigating complicated tools or understanding complex financial formulas. Many platforms make calculations difficult or hide useful tools behind signups or paid access, creating frustration when planning finances.</p>
            </article>

            <article className="bg-cardBorder border border-cardBorder rounded-[20px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">❔</span>
                <span className="bg-[#a7f3d0] text-[#1d2433] text-[16px] font-medium px-3 py-1 rounded-lg">Challenges</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-black mt-3">People want financial tools that help compare options clearly before making important financial decisions, whether for loans, investments, or savings. Confusing results or limited comparison features often lead to poor financial choices.</p>
            </article>

            <article className="bg-alt border border-cardBorder rounded-[20px] p-5">
              <div className="flex items-center justify-between">
                <span className="text-[20px]">💡</span>
                <span className="bg-primary text-[#f9fafb] text-[16px] font-medium px-3 py-1 rounded-lg">Solutions</span>
              </div>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">We continuously enhance calculators to provide clearer breakdowns, better comparisons, and improved insights so users can confidently evaluate financial scenarios and choose the best options for their needs.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="bg-alt py-10">
        <div className="max-w-[1440px] mx-auto px-6 xl:px-10">
          <div className="text-center max-w-[563px] mx-auto">
            <h2 className="text-[40px] font-semibold text-heading">Share Your Experience With Us</h2>
            <p className="text-[16px] leading-[25.6px] text-sub mt-3">Your feedback helps us improve our financial tools and deliver a better experience for everyone. Share your thoughts, suggestions, or experience using our calculators so we can continue improving our services.</p>
          </div>

          <div className="mt-10 max-w-[1080px] mx-auto bg-cardBorder rounded-[20px] p-6 md:p-10">
            <h3 className="text-[33px] font-semibold text-heading text-center">Leave a Review</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-10">
              <div>
                <label className="block text-[16px] font-medium text-sub mb-1.5">Your Name*</label>
                <input className="w-full h-[37px] rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-[#9ca3af]" placeholder="Jonny" />
              </div>
              <div>
                <label className="block text-[16px] font-medium text-sub mb-1.5">Your Email*</label>
                <input className="w-full h-[37px] rounded-md border border-cardBorder bg-alt px-2 text-[16px] text-[#9ca3af]" placeholder="jonny@example.com" />
              </div>
            </div>

            <div className="mt-5">
              <label className="block text-[16px] text-sub mb-2">Your message</label>
              <textarea className="w-full h-[160px] rounded-md border border-[#cbd5e1] bg-[#f5f7fa] px-3 py-2 text-[14px] leading-5 text-[#94a3b8]" placeholder="Type your message here" />
            </div>

            <div className="mt-6">
              <p className="text-[16px] font-medium text-sub">Your Rating*</p>
              <div className="flex items-center gap-1.5 mt-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    aria-hidden="true"
                    className="inline-flex items-center justify-center text-[26px] leading-none text-[#d1d5db]"
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <button className="w-full h-[43px] rounded-lg bg-primary text-white text-[16px] font-medium mt-8">Post Your Reviews</button>
          </div>
        </div>
      </section>

      <div className="max-w-[1440px] mx-auto px-6 xl:px-10 pb-8">
        <div className="flex gap-4">
          <Link to="/finance" className="bg-primary hover:bg-primaryDark text-white px-6 py-3 rounded-md">Explore Calculators</Link>
          <a href="#features" className="text-sub px-6 py-3">How it works</a>
        </div>
      </div>
    </div>
  )
}
