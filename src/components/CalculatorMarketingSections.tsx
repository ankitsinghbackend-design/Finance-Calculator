import { ChangeEvent, FormEvent, useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { apiUrl } from '../config/api'
import { useAuth } from '../context/AuthContext'
import AuthAccessModal from './AuthAccessModal'
import faqQuoteIconSvg from '../assets/Vector.svg'
import expectBgImg from '../assets/expect-bg.png'
import financeVisualImg from '../assets/finance-visual.png'
import iconSearch from '../assets/icon-search.svg'
import iconEdit from '../assets/icon-edit.svg'
import iconChartPie from '../assets/icon-chart-pie.svg'
import iconBarcode from '../assets/icon-barcode.svg'
import iconTarget from '../assets/icon-target.svg'
import iconShieldBlue from '../assets/icon-shield-blue.svg'
import iconLaptop from '../assets/icon-laptop.svg'
import iconAnalytics from '../assets/icon-analytics.svg'
import iconTimer from '../assets/icon-timer.svg'
import iconChartBar from '../assets/icon-chart-bar.svg'
import iconSearch2 from '../assets/icon-search-2.svg'
import iconShieldRed from '../assets/icon-shield-red.svg'
import iconUserComment from '../assets/icon-user-comment.svg'
import shieldCheckIcon from '../assets/shield-check.svg'
import iconChartPie2 from '../assets/icon-chart-pie-2.svg'
import iconArrowsSplit from '../assets/icon-arrows-split.svg'
import iconGlobe from '../assets/icon-globe.svg'
import './CalculatorMarketingSections.android.css'

type ReviewFormState = {
  name: string
  email: string
  message: string
  rating: number
}

type ReviewFieldErrors = Partial<Record<'name' | 'email' | 'message' | 'rating', string>>

type CalculatorMarketingSectionsProps = {
  loginRedirectPath: string
}

const initialReviewFormState: ReviewFormState = {
  name: '',
  email: '',
  message: '',
  rating: 0
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validateReviewForm = (values: ReviewFormState): ReviewFieldErrors => {
  const errors: ReviewFieldErrors = {}

  if (!values.name.trim()) {
    errors.name = 'Name is required.'
  }

  if (!values.email.trim()) {
    errors.email = 'Email is required.'
  } else if (!emailPattern.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }

  if (!values.message.trim()) {
    errors.message = 'Message is required.'
  }

  if (values.rating < 1 || values.rating > 5) {
    errors.rating = 'Please select a rating.'
  }

  return errors
}

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

const salaryFeatureList = [
  {
    title: 'Instant Salary Breakdowns',
    body: 'Quickly convert annual salary into monthly, weekly, daily, and hourly figures so you can plan pay and budgets immediately.'
  },
  {
    title: 'Adjust for Time Off',
    body: 'Account for holidays and vacation days to see adjusted pay that reflects actual working time and take-home planning.'
  },
  {
    title: 'Compare Pay Frequencies',
    body: 'Easily compare biweekly, semi-monthly, and monthly pay schedules to understand differences in take-home amounts and timing.'
  },
  {
    title: 'Budget & Planning Friendly',
    body: 'Use adjusted monthly and weekly figures to build realistic budgets, savings plans, and cashflow forecasts.'
  },
  {
    title: 'Private & Mobile Ready',
    body: 'No signup required and responsive layouts make it simple to calculate pay on any device while keeping your data private.'
  }
]

const mortgageFeatureList = [
  { title: 'Accurate Mortgage Payments', body: 'Calculate monthly mortgage payments, amortization schedules, and principal vs interest breakdowns for better home-buying decisions.' },
  { title: 'Compare Rates & Terms', body: 'Quickly analyze different interest rates, loan terms, and down payments to choose the most affordable mortgage option.' },
  { title: 'Amortization Schedules', body: 'View month-by-month amortization to understand how payments reduce principal over time.' },
  { title: 'Estimate Total Costs', body: 'Estimate total interest paid, required down payment, and monthly obligations to plan your budget.' },
  { title: 'Refinance Impact', body: 'See how refinancing or rate changes affect monthly payments and long-term interest.' }
]

const autoLoanFeatureList = [
  { title: 'Auto Loan Payments', body: 'Calculate monthly payments given loan amount, term, and interest so you can compare car financing options.' },
  { title: 'Upfront Fees & Taxes', body: 'Include taxes and fees in your analysis to see realistic out-of-pocket costs and financed totals.' },
  { title: 'Trade-offs by Term', body: 'Compare shorter vs longer loan terms to balance monthly affordability and total interest.' },
  { title: 'Extra Payments', body: 'Estimate savings from extra principal payments and accelerated payoff schedules.' },
  { title: 'APR vs Interest Rate', body: 'Understand APR implications when fees are financed into the loan.' }
]

const repaymentFeatureList = [
  { title: 'Flexible Repayment Plans', body: 'Explore repayment amounts and timelines for different payment schedules and lump-sum contributions.' },
  { title: 'Interest vs Principal', body: 'See how payments are split and how additional payments shorten the loan term.' },
  { title: 'Payment Strategies', body: 'Compare strategies like snowball or avalanche to prioritize debt efficiently.' },
  { title: 'Payoff Dates', body: 'Project payoff dates based on your current payment and additional contributions.' },
  { title: 'Total Interest Saved', body: 'Estimate interest savings from accelerated repayment plans.' }
]

const amortizationFeatureList = [
  { title: 'Full Amortization Tables', body: 'Generate detailed amortization schedules showing principal, interest, and remaining balance each period.' },
  { title: 'Custom Frequencies', body: 'Support monthly, biweekly, and other payment frequencies for accurate schedules.' },
  { title: 'Partial Periods', body: 'Handle partial-period first payments and prorated interest calculations.' },
  { title: 'Exportable Schedules', body: 'Use amortization data for financial planning, spreadsheets, and reporting.' },
  { title: 'Visualize Paydown', body: 'Understand how much principal is paid over time versus interest.' }
]

const dtiFeatureList = [
  { title: 'Debt-to-Income Ratio', body: 'Calculate your DTI to assess loan eligibility and affordability for mortgages and other credit.' },
  { title: 'Include All Obligations', body: 'Account for loans, credit cards, and recurring payments to get an accurate DTI.' },
  { title: 'Lender-Friendly Metrics', body: 'See typical DTI thresholds lenders use for mortgage and loan approvals.' },
  { title: 'Improve Affordability', body: 'Identify which debts to pay down to improve your DTI and borrowing power.' },
  { title: 'Scenario Planning', body: 'Model how changes to income or debts affect your eligibility.' }
]

const refinanceFeatureList = [
  { title: 'Refinance Analysis', body: 'Compare current and new loan terms to estimate monthly savings and break-even points.' },
  { title: 'Cost vs Savings', body: 'Include closing costs and fees to compute net savings and payback periods.' },
  { title: 'APR & Rate Comparison', body: 'Understand effective APR changes and their impact on long-term interest.' },
  { title: 'Term Conversion', body: 'See how switching loan terms affects monthly obligations and total interest.' },
  { title: 'Refinance Timing', body: 'Estimate ideal timing to refinance based on interest rate trends and costs.' }
]

const rentalPropertyFeatureList = [
  { title: 'Rental ROI Estimates', body: 'Project rental income, operating expenses, and returns to evaluate investment viability.' },
  { title: 'Cashflow Analysis', body: 'See monthly cashflow after mortgage, taxes, insurance, and vacancy adjustments.' },
  { title: 'Cap Rate & Cash-on-Cash', body: 'Calculate key investment metrics used by real estate investors.' },
  { title: 'Financing Scenarios', body: 'Model different mortgage terms and down payments to find optimal financing.' },
  { title: 'Expense Tracking', body: 'Account for maintenance, management fees, and other recurring costs in projections.' }
]

const currencyFeatureList = [
  { title: 'Real-Time Conversions', body: 'Convert amounts between currencies quickly using up-to-date exchange formats and clear formatting.' },
  { title: 'Multiple Currencies', body: 'Support for major global currencies and easy switching between base and target currencies.' },
  { title: 'Clear Formatting', body: 'Formatted outputs with currency symbols and localized number formats for readability.' },
  { title: 'Quick Rate Lookup', body: 'See which currencies give the best conversion for budgeting and international payments.' },
  { title: 'No Signup Required', body: 'Instant conversions without account setup so you can get answers fast.' }
]

const houseAffordFeatureList = [
  { title: 'Affordability Estimates', body: 'Calculate the home price and mortgage amount you can afford based on income, debts, and down payment.' },
  { title: 'DTI Integration', body: 'Includes debt-to-income considerations to estimate realistic borrowing capacity.' },
  { title: 'Monthly Cost Breakdown', body: 'Estimate mortgage principal, interest, taxes, and insurance for monthly budgeting.' },
  { title: 'Down Payment Scenarios', body: 'Compare different down payment amounts to see their effect on monthly payments and loan size.' },
  { title: 'Quick What-Ifs', body: 'Run scenario changes quickly to evaluate different interest rates and terms.' }
]

const incomeTaxFeatureList = [
  { title: 'Estimate Take-Home Pay', body: 'Calculate estimated federal (and basic state) income tax to understand net pay.' },
  { title: 'Standard & Itemized', body: 'Support for common deductions and filing options to provide realistic tax estimates.' },
  { title: 'Yearly & Paycheck Views', body: 'See tax impact on both annual and per-paycheck basis for budgeting.' },
  { title: 'Quick Scenarios', body: 'Model filing status, dependents, and deductions to explore tax outcomes.' },
  { title: 'No CPA Needed', body: 'Simple, approachable estimates for planning — not a replacement for professional advice.' }
]

const aprFeatureList = [
  { title: 'APR vs Interest Rate', body: 'Understand the difference between nominal interest rates and APR including fees.' },
  { title: 'Fee Impact', body: 'Include origination and other fees to see their effect on the true borrowing cost.' },
  { title: 'Compare Offers', body: 'Compare multiple loan offers on an APR basis to find the best overall deal.' },
  { title: 'Annualized View', body: 'APR calculations are annualized to align with lender disclosures and comparison standards.' },
  { title: 'Transparent Calculations', body: 'See the inputs and formulas used so you can verify how APR was determined.' }
]

const fhaFeatureList = [
  { title: 'FHA Payment Estimates', body: 'Calculate monthly payments for FHA loans including mortgage insurance premiums.' },
  { title: 'Down Payment Guidance', body: 'Estimate required minimum down payment and private mortgage insurance impacts.' },
  { title: 'Eligibility Pointers', body: 'Highlight key FHA program considerations such as loan limits and credit factors.' },
  { title: 'Compare to Conventional', body: 'See side-by-side comparisons of FHA vs conventional financing to inform decisions.' },
  { title: 'Cost Breakdown', body: 'Estimate upfront and ongoing costs unique to FHA loans, including MIP.' }
]

const vaFeatureList = [
  { title: 'VA Loan Estimates', body: 'Estimate payments and financing terms for VA-backed mortgages with favorable rates.' },
  { title: 'No Down Payment Scenarios', body: 'Model scenarios with reduced or no down payment when eligible for VA benefits.' },
  { title: 'Funding Fee Impact', body: 'Include VA funding fee in calculations to understand financed total and monthly impact.' },
  { title: 'Eligibility Notes', body: 'Summarize common VA eligibility considerations for veterans and service members.' },
  { title: 'Compare Options', body: 'Compare VA loan scenarios to conventional and FHA to choose the best fit.' }
]

const interestRateFeatureList = [
  { title: 'Precise Rate Calculations', body: 'Calculate effective and nominal interest rates with clear formulas. Compare periodic and annualized rates to understand true cost. Use the tool to convert between compounding conventions for accurate financial modeling.' },
  { title: 'Conversion Tools', body: 'Easily convert APR to periodic rates and vice versa. Adjust compounding frequency to see how it affects payments. Helpful when comparing loans and investment returns.' },
  { title: 'Transparent Math', body: 'See the formulas and steps used for rate conversions and calculations. This helps validate results and aids learning. Use outputs for reporting and decision making.' }
]

const collegeCostFeatureList = [
  { title: 'Estimate Total College Costs', body: 'Project tuition, fees, room, and board over time with inflation assumptions. Combine yearly costs to get multi-year program estimates. Useful for planning savings and financial aid needs.' },
  { title: 'Aid & Scholarship Scenarios', body: 'Model scholarships, grants, and expected aid to reduce out-of-pocket cost. Compare multiple scenarios to see net price differences. Helpful for choosing between schools.' },
  { title: 'Savings Planning', body: 'Determine how much to save monthly or annually to meet projected costs. Include investment growth assumptions for 529 or other savings. Helps families set realistic contribution goals.' }
]

const studentLoanFeatureList = [
  { title: 'Repayment Estimates', body: 'Compute monthly payments based on loan amount, rate, and term. Support standard, graduated, and income-driven approximations. Helps borrowers plan budgets and compare strategies.' },
  { title: 'Interest Accrual Insight', body: 'See how interest accumulates over deferment and repayment periods. Understand capitalized interest and long-term costs. Useful for choosing repayment timing.' },
  { title: 'Payoff Strategies', body: 'Model extra payments and accelerated payoff to estimate interest savings. Compare term shortening effects and required additional contributions. Helps prioritize high-cost debt.' }
]

const loanFeatureList = [
  { title: 'Loan Payment Calculations', body: 'Calculate monthly payments, interest, and total costs for standard amortizing loans. Support different terms and compounding frequencies. Great for personal and small business loan planning.' },
  { title: 'Fee & APR Considerations', body: 'Include origination fees and other charges to see their impact on APR and financed amount. Compare quoted rates on an apples-to-apples basis. Helps identify hidden costs.' },
  { title: 'Extra Payment Effects', body: 'Model additional principal payments and one-time lumps to see payoff impact. Estimate interest savings and new payoff dates. Useful for aggressive repayment planning.' }
]

const businessLoanFeatureList = [
  { title: 'Business Loan Modeling', body: 'Estimate periodic payments for term loans, including variable compounding and payment frequencies. Account for origination fees and financed charges. Useful for cashflow planning and loan comparisons.' },
  { title: 'Net Funding & APR', body: 'Compute net funds after fees and derive APR to show true borrowing cost. Compare offers with different fee structures. This clarifies which loan is genuinely cheaper.' },
  { title: 'Scenario Analysis', body: 'Vary term, rate, and fees to test multiple financing scenarios. Understand monthly obligations and total interest under each case. Helps choose the best structure for business cashflow.' }
]

const bondFeatureList = [
  { title: 'Yield & Price Calculations', body: 'Calculate present value, yield to maturity, and current yield for coupon bonds. Compare price vs yield trade-offs and sensitivity to rate changes. Useful for bond investment evaluation.' },
  { title: 'Coupon & Maturity Effects', body: 'See how coupon frequency and maturity date affect income and price. Model reinvestment of coupons for total return projections. Helps with duration and risk assessment.' },
  { title: 'Scenario & Price Sensitivity', body: 'Stress-test bond prices against rate shifts to see potential losses or gains. Compare callable vs non-callable effects on expected returns. Useful for portfolio risk analysis.' }
]

const mutualFundFeatureList = [
  { title: 'Return Projections', body: 'Estimate future values using contribution schedules and expected returns. Include expense ratios and fees to show net return. Useful for long-term investment planning.' },
  { title: 'Cost & Fee Impact', body: 'Understand how management fees and expense ratios reduce compounded returns over time. Compare funds on net-return basis rather than gross returns. Helps pick cost-effective investments.' },
  { title: 'Scenario Comparison', body: 'Model different return assumptions and contribution patterns to see a range of outcomes. Use results for retirement and goal planning. Provides clarity for allocation choices.' }
]

const socialSecurityFeatureList = [
  { title: 'Benefit Estimates', body: 'Estimate future Social Security benefits based on earnings and claiming age. Compare claiming ages to see impact on monthly benefit. Helpful for retirement income planning.' },
  { title: 'Spousal & Survivor Effects', body: 'Model spousal and survivor benefit scenarios to understand household income outcomes. See how combined claiming strategies affect total household benefits. Useful for couple retirement planning.' },
  { title: 'Replacement Rate Insights', body: 'Compare expected benefits to pre-retirement income to evaluate replacement ratios. Use results to plan supplemental savings and income sources. Helps set retirement funding targets.' }
]

const helocFeatureList = [
  { title: 'HELOC Payment Estimates', body: 'Estimate minimum and interest-only payments based on outstanding balance and variable rates. Model draw and repayment phases for accurate cashflow planning. Useful for homeowners considering credit lines.' },
  { title: 'Variable Rate Effects', body: 'See how rate adjustments affect monthly payments and total interest. Understand amortization if principal repayments begin. Helps assess refinancing or paydown decisions.' },
  { title: 'Use Case Scenarios', body: 'Model using HELOC for renovations, debt consolidation, or emergency funds. Compare costs vs fixed-rate alternatives. Supports informed borrowing choices.' }
]

const downPaymentFeatureList = [
  { title: 'Down Payment Planning', body: 'Calculate required down payment amounts for desired loan-to-value ratios. See how higher down payments reduce monthly payments and interest. Useful for home purchase budgeting.' },
  { title: 'Savings Targets', body: 'Determine monthly savings needed to reach your down payment goal by a target date. Include expected interest/growth from savings to refine targets. Helps prioritize saving strategies.' },
  { title: 'Impact on Mortgage Costs', body: 'Compare monthly payment and total interest across different down payment levels. Understand trade-offs between liquidity and lower financing costs. Useful for planning optimal upfront contributions.' }
]

const estateTaxFeatureList = [
  {
    title: 'Estimate Estate Tax Liability',
    body: 'Project potential federal estate tax owed after exemptions, deductions, and lifetime gifts using current thresholds. The calculator factors in common deductions and basic valuation adjustments to give a realistic tax estimate. Use this to see the potential tax burden and plan distribution strategies.'
  },
  {
    title: 'Exemption & Threshold Planning',
    body: 'Model how changes in estate value and exemption thresholds affect taxable amounts and owed tax. Quickly compare current-law exemptions to hypothetical changes and understand sensitivity to legislative shifts.'
  },
  {
    title: 'Deductions & Valuation Adjustments',
    body: 'Account for charitable gifts, debts, administration costs, and valuation discounts to refine the taxable estate estimate. These adjustments can materially change the tax outcome and are essential for realistic planning.'
  },
  {
    title: 'Gifting & Trust Strategies',
    body: 'Simulate lifetime gifting, trusts, and other transfer strategies to see how they reduce the taxable estate and impact beneficiaries. Use the tool to evaluate trade-offs and timing implications.'
  },
  {
    title: 'Scenario Stress Testing',
    body: 'Run multiple scenarios with varying asset values, exemptions, and deductions to assess downside and best-case tax outcomes. This helps prioritize planning actions and estimate potential tax savings.'
  }
]

const pensionFeatureList = [
  {
    title: 'Lump Sum vs Monthly Comparison',
    body: 'Compare a one-time lump-sum payout against lifetime monthly pension payments by converting future cash flows into present value equivalents. This helps determine which option offers better financial security given expected lifespan and discount rates.'
  },
  {
    title: 'Present Value & Discounting',
    body: 'Calculate the present value of future pension streams using your chosen discount rate to directly compare with other assets or investment alternatives. Adjust assumptions to reflect conservative or optimistic market expectations.'
  },
  {
    title: 'Survivor & Inflation Options',
    body: 'Model survivor benefits, joint-and-survivor options, and simple inflation adjustments to understand the effect on long-term purchasing power and household income risks.'
  },
  {
    title: 'Tax Treatment Impact',
    body: 'Estimate tax implications of pension payments versus lump-sum distributions including potential tax-deferral and withholding effects. Use this to plan tax-efficient retirement income.'
  },
  {
    title: 'Payout Timing Strategies',
    body: 'Evaluate how delaying or accelerating pension start dates affects lifetime income and present value. This can be critical when coordinating pensions with Social Security or other retirement income sources.'
  }
]

const investmentFeatureList = [
  {
    title: 'Project Investment Growth',
    body: 'Estimate future balances using starting amounts, periodic contributions, expected returns, and compounding frequency. The tool provides clear year-by-year projections to support goal planning for retirement, education, or large purchases.'
  },
  {
    title: 'Contribution Scheduling & Targets',
    body: 'Compare lump-sum investments versus recurring contributions to identify efficient saving paths and monthly targets needed to reach goals by a specific date. Helps prioritize contributions across multiple goals.'
  },
  {
    title: 'Fees & Expense Impact',
    body: 'Factor in management fees, expense ratios, and transaction costs to show net returns after fees. Even small fee differences compound over time and significantly influence long-term outcomes.'
  },
  {
    title: 'Asset Allocation Scenarios',
    body: 'Test conservative, balanced, and aggressive return assumptions to see how allocation choices affect expected outcomes and risk exposure. Use multiple scenarios to prepare for market variability.'
  },
  {
    title: 'Tax-Aware Projections',
    body: 'Run projections that account for tax treatment of accounts (taxable, tax-deferred, or tax-free) to estimate after-tax outcomes and optimize where to hold assets.'
  }
]

const depreciationFeatureList = [
  {
    title: 'Multiple Depreciation Methods',
    body: 'Support straight-line, double-declining, and MACRS methods so you can compute annual depreciation under different accounting and tax rules. Choose the method that matches your reporting or tax strategy.'
  },
  {
    title: 'Tax vs Book Comparison',
    body: 'Compare tax depreciation schedules with book (financial reporting) depreciation to see timing differences in expense recognition and their impact on reported profits and taxable income.'
  },
  {
    title: 'Schedule Export & Yearly Tables',
    body: 'Generate year-by-year depreciation tables that can be exported for accounting, tax filing, or internal analysis. Clear schedules help with budgeting and tax preparation.'
  },
  {
    title: 'Disposals & Gain/Loss Effects',
    body: 'Model asset disposal or sale events to calculate recognized gains or losses, remaining basis, and tax consequences after depreciation recapture where applicable.'
  },
  {
    title: 'Useful for Tax Planning',
    body: 'Use depreciation projections to plan capital expenditures and tax timing, helping to optimize deductions and cash flow for business or investment assets.'
  }
]

const rothIraFeatureList = [
  {
    title: 'Roth IRA Growth Projections',
    body: 'Project tax-free accumulation using annual contributions, expected returns, and compounding assumptions. The calculator shows how tax-free withdrawals can improve retirement cash flow.'
  },
  {
    title: 'Contribution Limits & Timing',
    body: 'Account for annual contribution limits, catch-up contributions, and income phase-outs to determine eligibility and optimal contribution paths for each year.'
  },
  {
    title: 'Roth vs Traditional Comparison',
    body: 'Compare after-tax outcomes between Roth and Traditional accounts by modeling current tax rates versus expected retirement tax rates to decide which provides better lifetime income.'
  },
  {
    title: 'Withdrawal Rules & Ordering',
    body: 'Understand qualified withdrawal rules, ordering of contributions vs earnings, and potential penalties to plan tax-free retirement distributions correctly.'
  },
  {
    title: 'Tax-Free Income Planning',
    body: 'Use Roth projections to estimate how much tax-free retirement income a Roth IRA can provide and how it complements other retirement sources for tax-efficient withdrawal sequencing.'
  }
]

const rentVsBuyFeatureList = [
  {
    title: 'Comprehensive Cost Comparison',
    body: 'Compare the total cost of renting versus owning over your chosen horizon, including mortgage payments, taxes, insurance, maintenance, and expected rent escalation to produce a realistic net cost picture.'
  },
  {
    title: 'Break-Even Analysis',
    body: 'Estimate the break-even horizon where buying becomes more economical than renting given your assumptions for appreciation, transaction costs, and holding period. Helps determine which option suits medium-term plans.'
  },
  {
    title: 'Cash Flow & Opportunity Cost',
    body: 'Include opportunity cost of down payment and other upfront costs by modeling alternative investments to see net economic impact versus renting.'
  },
  {
    title: 'Maintenance & Transaction Costs',
    body: 'Account for recurring maintenance, HOA fees, and major one-time expenses, plus buying/selling transaction costs, to avoid underestimating ownership costs.'
  },
  {
    title: 'Equity, Appreciation & Mobility',
    body: 'Model home equity accumulation and expected appreciation while considering mobility needs and the potential costs of selling early to ensure the decision matches lifestyle plans.'
  }
]

const cashBackFeatureList = [
  {
    title: 'Dealer Cash vs Low-Interest Comparison',
    body: 'Compare the immediate benefit of dealer cash incentives against the long-term savings from reduced interest rates by modeling their effect on financed amount and monthly payments.'
  },
  {
    title: 'Total Cost & Net Savings',
    body: 'Include rebates, fees, taxes, and financed add-ons to calculate net costs over the loan term so you can see which option saves more in total dollars.'
  },
  {
    title: 'APR & Payment Impact',
    body: 'Understand how different APRs change monthly payments and total interest; see whether a lower rate or a cash rebate produces a lower effective APR when fees are considered.'
  },
  {
    title: 'Tax & Rebate Treatment',
    body: 'Clarify how rebates and incentives are treated for tax purposes and whether incentives affect trade-in values or documentation differently, impacting net benefit.'
  },
  {
    title: 'Decision Summary & Recommendation',
    body: 'Get a clear summary that shows which choice is financially preferable under your inputs, helping you make a confident, data-driven decision when purchasing a vehicle.'
  }
]

const mortgagePayoffFeatureList = [
  {
    title: 'Accelerated Payoff Planning',
    body: 'Model extra principal contributions, biweekly payments, and one-time lumps to see how quickly you can eliminate your mortgage. Understand the timeline and required contributions to reach payoff targets while tracking interest savings over time.'
  },
  {
    title: 'Interest Savings Estimates',
    body: 'Calculate total interest saved from different payoff strategies and refinancing options. The tool breaks down savings by period and highlights how small additional payments compound into large interest reductions.'
  },
  {
    title: 'Refinance vs Extra Payments',
    body: 'Compare the impact of refinancing to a lower rate versus making extra principal payments to determine which approach yields larger long-term savings net of fees.'
  },
  {
    title: 'Amortization Adjustment',
    body: 'See updated amortization schedules after each extra payment or rate change so you can visualize principal reduction and remaining balance over time.'
  },
  {
    title: 'Payment Affordability Analysis',
    body: 'Estimate how different payoff plans affect monthly cash flow and budget, helping you choose a sustainable strategy that balances savings with other financial goals.'
  }
]

const compoundInterestFeatureList = [
  {
    title: 'Growth Projections with Compounding',
    body: 'Project how investments grow under different compounding frequencies (daily, monthly, annually) and contribution schedules to understand the real impact of compound interest over time.'
  },
  {
    title: 'Compare Contribution Strategies',
    body: 'Test lump-sum, periodic, and escalating contribution plans to see which approach reaches your target fastest and most efficiently given expected returns.'
  },
  {
    title: 'Effective Annual Rate',
    body: 'Convert nominal rates and compounding frequencies into effective annual rates so you can compare yields across different instruments on an apples-to-apples basis.'
  },
  {
    title: 'Inflation-Adjusted Projections',
    body: 'Include inflation assumptions to view real (inflation-adjusted) growth so you can plan for purchasing power rather than nominal balances.'
  },
  {
    title: 'Goal-Based Savings Targets',
    body: 'Calculate required contributions and timelines to reach defined savings goals considering compound returns and fees.'
  }
]

const four01kFeatureList = [
  {
    title: '401(k) Growth Projections',
    body: 'Project retirement account growth using employer match, contribution percentages, and expected returns to estimate potential retirement balances under realistic assumptions.'
  },
  {
    title: 'Employer Match Optimization',
    body: 'Model employer matching schedules to determine the optimal employee contribution needed to maximize free employer contributions and long-term account growth.'
  },
  {
    title: 'Tax-Deferred Benefits',
    body: 'See how tax-deferred growth accelerates account accumulation compared to taxable accounts, and model after-tax withdrawal scenarios to plan retirement income.'
  },
  {
    title: 'Contribution Limits & Catch-up',
    body: 'Incorporate annual contribution limits, catch-up contributions for eligible ages, and phased adjustments to ensure compliance and maximize savings potential.'
  },
  {
    title: 'Withdrawal & Rollover Scenarios',
    body: 'Simulate withdrawal strategies, early withdrawal penalties, and rollover options to plan tax-efficient distribution strategies in retirement or job changes.'
  }
]

const salesTaxFeatureList = [
  {
    title: 'Accurate Tax Calculations',
    body: 'Compute sales tax forward and reverse (solve for pre-tax or post-tax price) across different jurisdictions and rates to ensure precise pricing and checkout totals.'
  },
  {
    title: 'Multiple Rate Support',
    body: 'Handle combined tax rates including state, county, and local additions as well as special district taxes for accurate final pricing.'
  },
  {
    title: 'Itemized Tax Breakdown',
    body: 'See how taxes apply to individual line-items, exemptions, and tax-exempt products to prepare accurate invoices and receipts.'
  },
  {
    title: 'International & VAT Considerations',
    body: 'Adjust calculations for VAT-style taxes or international VAT/GST rules where applicable, including display options for tax-inclusive or tax-exclusive pricing.'
  },
  {
    title: 'Rounding & Display Options',
    body: 'Control rounding rules and display formats to match accounting systems and point-of-sale requirements for consistent receipts.'
  }
]

const annuityFeatureList = [
  {
    title: 'Annuity Growth & Payout Projections',
    body: 'Model how annuity balances grow and how different payout options (lifetime, fixed period, or lump sum) translate into periodic income streams.'
  },
  {
    title: 'Immediate vs Deferred Options',
    body: 'Compare immediate annuities that start payments now versus deferred annuities that begin later, showing present value and lifetime income trade-offs.'
  },
  {
    title: 'Fee & Surrender Impact',
    body: 'Include fees, surrender charges, and riders to see their effect on net returns and available income, helping evaluate real net benefits.'
  },
  {
    title: 'Variable vs Fixed Annuities',
    body: 'Compare variable annuities with market-linked returns to fixed annuities with guaranteed rates, assessing risk and guaranteed income trade-offs.'
  },
  {
    title: 'Taxation of Payouts',
    body: 'Understand tax treatment of annuity payments and how tax deferral versus immediate taxable distributions affect net income.'
  }
]

const rmdFeatureList = [
  {
    title: 'Required Minimum Distribution Estimates',
    body: 'Calculate RMD amounts using IRS life expectancy tables and account balances to ensure compliance and avoid penalties.'
  },
  {
    title: 'Year-by-Year Projections',
    body: 'Generate future-year RMD projections based on expected account growth and changing life expectancy factors for long-term planning.'
  },
  {
    title: 'Penalty Awareness',
    body: 'Highlight potential IRS penalties for missed or insufficient distributions and show how small shortfalls can create large tax costs.'
  },
  {
    title: 'Tax-Efficient Distribution Planning',
    body: 'Model strategies such as Roth conversions, qualified charitable distributions, or partial Roth rollovers to manage tax impact while meeting RMD rules.'
  },
  {
    title: 'Multiple Account Coordination',
    body: 'Coordinate RMDs across multiple retirement accounts to understand total taxable distribution and optimize tax planning.'
  }
]

const autoLeaseFeatureList = [
  {
    title: 'Lease Payment Calculations',
    body: 'Compute monthly lease payments using capitalized cost, residual value, money factor, and term to give an accurate expected payment schedule.'
  },
  {
    title: 'Depreciation & Residuals',
    body: 'Understand how residual value and depreciation drive lease payments and compare lease vs financing for different terms and mileage assumptions.'
  },
  {
    title: 'Mileage & Wear Costing',
    body: 'Include excess mileage and wear-and-tear estimates to forecast potential end-of-lease charges and total lease cost.'
  },
  {
    title: 'Upfront Cash & Fees',
    body: 'Assess how down payments, acquisition fees, and security deposits affect financed amount and monthly obligations.'
  },
  {
    title: 'Lease vs Buy Comparison',
    body: 'Compare the long-term costs of leasing versus buying the same vehicle including equity accumulation, maintenance, and resale values.'
  }
]

const featureMap: Record<string, any[]> = {
  salary: salaryFeatureList,
  mortgage: mortgageFeatureList,
  'interest-rate': interestRateFeatureList,
  'college-cost': collegeCostFeatureList,
  'student-loan': studentLoanFeatureList,
  loan: loanFeatureList,
  'business-loan': businessLoanFeatureList,
  bond: bondFeatureList,
  'mutual-fund': mutualFundFeatureList,
  'social-security': socialSecurityFeatureList,
  heloc: helocFeatureList,
  'down-payment': downPaymentFeatureList,
  'house-affordability': houseAffordFeatureList,
  'auto-loan': autoLoanFeatureList,
  repayment: repaymentFeatureList,
  amortization: amortizationFeatureList,
  'debt-to-income': dtiFeatureList,
  'dti-ratio': dtiFeatureList,
  currency: currencyFeatureList,
  'income-tax': incomeTaxFeatureList,
  apr: aprFeatureList,
  'fha-loan': fhaFeatureList,
  'va-mortgage': vaFeatureList,
  refinance: refinanceFeatureList,
  'rental-property': rentalPropertyFeatureList
  ,
  'estate-tax': estateTaxFeatureList,
  pension: pensionFeatureList,
  investment: investmentFeatureList,
  depreciation: depreciationFeatureList,
  'roth-ira': rothIraFeatureList,
  'rent-vs-buy': rentVsBuyFeatureList,
  'cash-back-or-low-interest': cashBackFeatureList
  ,
  'mortgage-payoff': mortgagePayoffFeatureList,
  'compound-interest': compoundInterestFeatureList,
  '401k': four01kFeatureList,
  'sales-tax': salesTaxFeatureList,
  annuity: annuityFeatureList,
  rmd: rmdFeatureList,
  'auto-lease': autoLeaseFeatureList
}

const introMap: Record<string, { title: React.ReactNode; subtitle: string; body1: string; body2?: string }> = {
    salary: {
        title: 'Salary Calculator — Instant Pay Breakdown',
        subtitle: 'Convert annual salary into monthly, weekly, daily, and hourly rates quickly.',
        body1: 'Enter your gross salary, work hours, and time-off details to see both unadjusted and adjusted pay figures that account for holidays and vacation days.',
        body2: 'Use these calculations to budget, compare pay schedules, and plan your finances with clarity.'
    },
    mortgage: {
        title: 'Mortgage Calculator - Plan Your Home Payments',
        subtitle: 'Estimate monthly mortgage payments and view amortization schedules.',
        body1: 'Enter loan amount, interest rate, and term to get a detailed payment schedule and total interest paid.',
        body2: 'Compare down payments and terms to find a plan that fits your budget.'
    },
    'auto-loan': {
        title: 'Auto Loan Calculator - Car Financing Made Clear',
        subtitle: 'Translate loan amount, rate, and term into monthly payments and total cost.',
        body1: 'Include fees, taxes, and dealer add-ons to understand the full financed amount and monthly obligation.',
        body2: 'Compare loan terms to choose the most cost-effective financing option.'
    },
    repayment: {
        title: 'Repayment Calculator - Manage Debt Efficiently',
        subtitle: 'Explore repayment schedules and strategies to pay down debt faster.',
        body1: 'Model different payment amounts, extra contributions, and timelines to see payoff impact.',
        body2: 'Estimate total interest savings from accelerated repayment approaches.'
    },
    amortization: {
        title: (
            <>
                Amortization Calculator
                <br />
                Detailed Schedules
            </>
        ),
        subtitle: 'Generate full amortization tables and visualize principal paydown over time.',
        body1: 'Support for custom payment frequencies and partial periods gives accurate schedules.',
        body2: 'Export schedules for planning and reporting.'
    },
    'dti-ratio': {
      title: 'Debt to Income Calculator - Assess Affordability',
      subtitle: 'Calculate your DTI to evaluate loan eligibility and financial health.',
      body1: 'Include all monthly obligations and gross income to compute the ratio lenders use.',
      body2: 'Use scenario planning to see how paying down debts or increasing income changes your DTI.'
    },
    refinance: {
        title: 'Refinance Calculator - Find Savings',
        subtitle: 'Compare current and new loan terms to estimate monthly savings and break-even points.',
        body1: 'Include closing costs and fees to compute net savings and payback periods.',
        body2: 'See how changing terms affects total interest and monthly payments.'
    },
    'rental-property': {
        title: 'Rental Property Calculator - Evaluate Investments',
        subtitle: 'Estimate income, expenses, and returns to assess rental property viability.',
        body1: 'Project cashflow, cap rate, and cash-on-cash returns based on realistic expense and vacancy assumptions.',
        body2: 'Model financing scenarios to compare investment structures.'
    }
    ,
    currency: {
      title: 'Currency Converter - Quick Exchange Rates',
      subtitle: 'Convert between currencies and format results for international use.',
      body1: 'Enter amounts and choose source/target currencies to get formatted conversion results and rates.',
      body2: 'Ideal for budgeting, travel planning, and quick rate checks without signup.'
    },
    'house-affordability': {
      title: 'House Affordability Calculator',
      subtitle: 'Estimate how much home you can afford based on income and debts.',
      body1: 'Use income, debts, down payment, and interest rate assumptions to calculate an affordable home price and monthly payment.',
      body2: 'Includes DTI considerations and common monthly costs for realistic affordability planning.'
    },
    'income-tax': {
      title: 'Income Tax Estimator',
      subtitle: 'Estimate your annual and per-paycheck tax withholding and take-home pay.',
      body1: 'Model filing status, deductions, and dependents to see how taxes affect your net income.',
      body2: 'Great for budgeting and planning, but not a substitute for professional tax advice.'
    },
    apr: {
      title: 'APR Calculator - True Cost of Borrowing',
      subtitle: 'Calculate APR including fees to compare loan offers effectively.',
      body1: 'Include finance charges and origination fees to compute an annualized APR that reflects the true cost.',
      body2: 'Use APR to compare loan offers on an apples-to-apples basis.'
    },
    'fha-loan': {
      title: 'FHA Loan Calculator',
      subtitle: 'Estimate monthly payments and insurance for FHA-backed mortgages.',
      body1: 'See how mortgage insurance premiums and down payment requirements affect monthly payments and total cost.',
      body2: 'Helpful for first-time buyers comparing FHA to other loan types.'
    },
    'va-mortgage': {
      title: 'VA Mortgage Calculator',
      subtitle: 'Estimate payments and financing terms for VA-backed loans.',
      body1: 'Model scenarios with or without down payment and include funding fees to assess financed totals and monthly impacts.',
      body2: 'Useful for veterans and service members evaluating VA loan benefits.'
    }
    ,
    'interest-rate': {
      title: 'Interest Rate Calculator',
      subtitle: 'Solve for the implied interest rate from payment, principal, and term.',
      body1: 'Given a loan amount, payment, and term, compute the effective interest rate that matches those cash flows.',
      body2: 'Useful when comparing offers or reverse-engineering loan terms.'
    },
    'college-cost': {
      title: 'College Cost Calculator',
      subtitle: 'Estimate future college expenses and funding needs.',
      body1: 'Project tuition inflation, years of attendance, and expected savings to estimate total future costs.',
      body2: 'Use the results to set savings targets and compare financial aid, scholarships, and loan options.'
    },
    'student-loan': {
      title: 'Student Loan Calculator',
      subtitle: 'Plan student loan payments, interest, and payoff timelines.',
      body1: 'Calculate monthly payments, interest accrual, and projected payoff dates for federal or private student loans.',
      body2: 'Compare repayment plans, extra payments, and consolidation scenarios to reduce interest paid.'
    },
    loan: {
      title: 'Loan Calculator',
      subtitle: 'Compute payments or payoff time for fixed-rate loans.',
      body1: 'Enter loan amount, rate, and either term or desired payment to see payment schedules and total interest costs.',
      body2: 'Supports personal, auto, and other fixed-term loan scenarios for straightforward planning.'
    },
    'business-loan': {
      title: 'Business Loan Calculator',
      subtitle: 'Estimate payments and true cost of business financing.',
      body1: 'Include fees and origination costs to calculate monthly obligations and the effective APR.',
      body2: 'Helpful for comparing term loans, SBA options, and assessing cash flow impact on your business.'
    },
    bond: {
      title: 'Bond Calculator',
      subtitle: 'Price bonds and compute yield, coupon cash flows, and accrued interest.',
      body1: 'Evaluate bond price given yield, coupon, and maturity or solve for yield from price and cash flows.',
      body2: 'Includes accrued interest calculations and schedules for investment analysis.'
    },
    'mutual-fund': {
      title: 'Mutual Fund Calculator',
      subtitle: 'Estimate returns and fee impact on mutual fund investments.',
      body1: 'Project investment growth while accounting for expense ratios and management fees that reduce net returns.',
      body2: 'Compare fund choices, fees, and net returns over different time horizons.'
    },
    'social-security': {
      title: 'Social Security Calculator',
      subtitle: 'Estimate retirement benefits and claiming strategies.',
      body1: 'Model benefit estimates based on earnings history, claiming age, and spousal benefits to forecast monthly payments.',
      body2: 'Use this to plan retirement timing and expected Social Security income.'
    },
    heloc: {
      title: 'HELOC Calculator',
      subtitle: 'Estimate borrowing and repayment for a home equity line of credit.',
      body1: 'Model draws, variable interest rates, and repayment schedules to understand payment variability and interest costs.',
      body2: 'Useful for planning renovations or short-term financing using home equity.'
    },
    'down-payment': {
      title: 'Down Payment Calculator',
      subtitle: 'Plan down payment amounts and upfront home purchase costs.',
      body1: 'Calculate required down payment, loan-to-value, and how different down payments affect monthly mortgage payments.',
      body2: 'Compare trade-offs between a larger down payment and lower ongoing mortgage costs.'
    }
    ,
    'estate-tax': {
      title: 'Estate Tax Calculator',
      subtitle: 'Estimate potential federal estate tax owed on an estate.',
      body1: 'Input estate value, deductions, and lifetime gifts to project taxable estate and estimated tax liability under current rules.',
      body2: 'Use scenarios to explore gifting and planning strategies that may reduce estate tax exposure.'
    },
    pension: {
      title: 'Pension Calculator',
      subtitle: 'Compare lump-sum and periodic pension benefits to evaluate lifetime value.',
      body1: 'Model monthly pension payouts, survivor options, and present value to choose the best retirement income option.',
      body2: 'Helpful for pension planning and comparing alternative retirement income sources.'
    },
    investment: {
      title: 'Investment Calculator',
      subtitle: 'Project investment growth and compare contribution strategies.',
      body1: 'Estimate future balances using contributions, expected returns, and compounding to plan for goals like retirement or college.',
      body2: 'Compare lump-sum vs recurring contributions and test different return assumptions.'
    },
    depreciation: {
      title: 'Depreciation Calculator',
      subtitle: 'Calculate asset depreciation using common accounting methods.',
      body1: 'Support straight-line, declining balance, and MACRS schedules to compute annual depreciation for assets used in business or tax reporting.',
      body2: 'Understand tax vs book depreciation differences and the effect of disposals on asset basis.'
    },
    'roth-ira': {
      title: 'Roth IRA Calculator',
      subtitle: 'Project tax-free retirement growth and compare contribution choices.',
      body1: 'Model annual contributions, expected returns, and years to withdrawal to project tax-free retirement income from a Roth IRA.',
      body2: 'Compare Roth vs Traditional contribution scenarios to evaluate tax timing benefits.'
    },
    'rent-vs-buy': {
      title: 'Rent vs. Buy Calculator',
      subtitle: 'Compare the financial trade-offs of renting versus buying a home.',
      body1: 'Include purchase costs, ongoing ownership expenses, rent, and expected appreciation to estimate total cost over your chosen horizon.',
      body2: 'Calculate break-even points and help decide which option fits your financial goals.'
    },
    'cash-back-or-low-interest': {
      title: 'Cash Back vs Low-Interest Calculator',
      subtitle: 'Compare dealer cash incentives with low-interest financing offers.',
      body1: 'Evaluate whether upfront rebates or lower APR financing provide the better overall deal by including fees and financed amounts.',
      body2: 'Use this to decide the most cost-effective auto purchase financing strategy.'
    }
    ,
    'mortgage-payoff': {
      title: 'Mortgage Payoff Calculator',
      subtitle: 'Plan accelerated payoff strategies and see interest savings over time.',
      body1: 'Model extra principal payments, biweekly schedules, and lump-sum contributions to see how they shorten the payoff timeline and reduce interest costs.',
      body2: 'Compare refinancing and extra-payment strategies to decide the best route for reducing long-term cost.'
    },
    'compound-interest': {
      title: 'Compound Interest Calculator',
      subtitle: 'Understand how compounding frequency and contributions affect investment growth.',
      body1: 'Project growth under different compounding intervals and contribution schedules to identify efficient saving strategies and realistic timelines for goals.',
      body2: 'Include inflation and fees to see real, after-cost purchasing power over time.'
    },
    '401k': {
      title: '401(k) Calculator',
      subtitle: 'Estimate retirement savings including contributions and employer match.',
      body1: 'Model employee contributions, employer matching, and expected returns to forecast account balances at retirement and identify contribution targets.',
      body2: 'Assess tax-deferred benefits and optimal contribution levels to maximize long-term retirement savings.'
    },
    'sales-tax': {
      title: 'Sales Tax Calculator',
      subtitle: 'Accurately compute tax-inclusive and tax-exclusive prices across jurisdictions.',
      body1: 'Handle combined state, county, and local tax rates and compute pre-tax or post-tax amounts for precise billing and pricing.',
      body2: 'Support VAT/GST-style rules and display options for invoicing or receipts.'
    },
    annuity: {
      title: 'Annuity Calculator',
      subtitle: 'Model annuity accumulation and payout options for retirement income planning.',
      body1: 'Compare immediate and deferred annuities, fee structures, and payout types to evaluate expected income streams and net returns.',
      body2: 'Use tax and surrender assumptions to understand true net payouts and flexibility.'
    },
    rmd: {
      title: 'RMD Calculator',
      subtitle: 'Estimate required minimum distributions and plan tax-efficient withdrawals.',
      body1: 'Calculate RMDs using IRS tables and project future required distributions across multiple accounts to plan taxable income and strategies.',
      body2: 'Explore Roth conversions and qualified charitable distributions to reduce future RMD burdens.'
    },
    'auto-lease': {
      title: 'Auto Lease Calculator',
      subtitle: 'Estimate lease payments, residual impacts, and total lease cost.',
      body1: 'Compute payments using capitalized cost, residual value, money factor, and term while modeling mileage and fees to forecast total leasing expenses.',
      body2: 'Compare leasing and buying scenarios to choose the most cost-effective option based on usage and ownership preferences.'
    }
  }

const benefits = [
  {
    title: 'Make Smarter Financial Decisions',
    body: 'Understand loan payments, savings growth, and investment returns clearly before making commitments. Our calculators help users compare options and choose financially better solutions. By visualizing financial outcomes in advance, users avoid costly mistakes and plan responsibly. Better decisions today lead to stronger financial security tomorrow.',
    icon: iconAnalytics,
    iconWrapClassName: 'h-[31px] w-[34px]',
    iconClassName: 'h-[31px] w-auto',
    featured: false
  },
  {
    title: 'Save Valuable Time Planning',
    body: 'Instead of manually calculating numbers or searching multiple sources, get instant financial estimates in seconds. Automated tools reduce calculation errors and provide quick results. Users spend less time figuring out finances and more time focusing on goals that matter. Efficient tools simplify complex financial planning.',
    icon: iconTimer,
    iconWrapClassName: 'h-[31px] w-[39px]',
    iconClassName: 'h-[28px] w-auto',
    featured: true
  },
  {
    title: 'Plan Future Finances Confidently',
    body: 'Whether saving for retirement, buying a home, or planning investments, our calculators provide clear future projections. Users can see how small financial changes impact long-term goals. This clarity builds confidence in planning major life decisions. Financial future planning becomes easier and less stressful.',
    icon: iconChartBar,
    iconWrapClassName: 'h-[31px] w-[32px]',
    iconClassName: 'h-[29px] w-auto',
    featured: false
  },
  {
    title: 'Compare Financial Options Easily',
    body: 'Compare loans, savings, or investment scenarios instantly to find the best financial path. Users can adjust inputs and immediately see outcome differences. This helps select affordable loans, smarter investments, and better savings strategies. Better comparisons lead to better financial choices.',
    icon: iconSearch2,
    iconWrapClassName: 'h-[31px] w-[31px]',
    iconClassName: 'h-[31px] w-auto',
    featured: false
  },
  {
    title: 'Avoid Unexpected Financial Surprises',
    body: 'Know future payments, interest costs, and savings growth before making commitments. Financial awareness prevents unexpected burdens later. Calculators help users prepare budgets realistically. Planning ahead protects users from risky financial decisions.',
    icon: iconShieldRed,
    iconWrapClassName: 'h-[31px] w-[28px]',
    iconClassName: 'h-[29px] w-auto',
    featured: false
  },
  {
    title: 'Financial Tools Accessible Everyone',
    body: 'Whether students, professionals, families, or business owners, anyone can use our tools easily. No financial expertise is required to understand results. Simple interfaces ensure accessibility for all users. Everyone deserves access to clear financial planning tools.',
    icon: iconUserComment,
    iconWrapClassName: 'h-[31px] w-[31px]',
    iconClassName: 'h-[28px] w-auto',
    featured: false
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

export default function CalculatorMarketingSections({
  loginRedirectPath
}: CalculatorMarketingSectionsProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const [reviewForm, setReviewForm] = useState<ReviewFormState>(initialReviewFormState)
  const [reviewErrors, setReviewErrors] = useState<ReviewFieldErrors>({})
  const [reviewSubmitError, setReviewSubmitError] = useState<string | null>(null)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [showReviewSuccessCard, setShowReviewSuccessCard] = useState(false)
  const [showAuthPrompt, setShowAuthPrompt] = useState<null | 'feedback'>(null)

  const handleReviewInputChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target

    setReviewForm((previous) => ({
      ...previous,
      [name]: value
    }))

    setReviewErrors((previous) => {
      if (!previous[name as keyof ReviewFieldErrors]) {
        return previous
      }

      const nextErrors = { ...previous }
      delete nextErrors[name as keyof ReviewFieldErrors]
      return nextErrors
    })

    setReviewSubmitError(null)
  }

  const handleRatingSelect = (rating: number) => {
    setReviewForm((previous) => ({
      ...previous,
      rating
    }))

    setReviewErrors((previous) => {
      if (!previous.rating) {
        return previous
      }

      const nextErrors = { ...previous }
      delete nextErrors.rating
      return nextErrors
    })

    setReviewSubmitError(null)
  }

  const handleReviewSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!user) {
      setShowAuthPrompt('feedback')
      return
    }

    const trimmedValues: ReviewFormState = {
      name: reviewForm.name.trim(),
      email: reviewForm.email.trim(),
      message: reviewForm.message.trim(),
      rating: reviewForm.rating
    }

    const validationErrors = validateReviewForm(trimmedValues)
    setReviewErrors(validationErrors)
    setReviewSubmitError(null)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    try {
      setIsSubmittingReview(true)
      await axios.post(apiUrl('/api/feedback'), trimmedValues)
      setReviewForm(initialReviewFormState)
      setShowReviewSuccessCard(true)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const fieldErrors = error.response?.data?.fieldErrors as ReviewFieldErrors | undefined
        if (fieldErrors) {
          setReviewErrors((previous) => ({
            ...previous,
            ...fieldErrors
          }))
        }

        setReviewSubmitError(error.response?.data?.error ?? 'Unable to submit feedback right now. Please try again.')
      } else {
        setReviewSubmitError('Unable to submit feedback right now. Please try again.')
      }
    } finally {
      setIsSubmittingReview(false)
    }
  }

  const isReviewFormComplete =
    reviewForm.name.trim().length > 0 &&
    reviewForm.email.trim().length > 0 &&
    reviewForm.message.trim().length > 0 &&
    reviewForm.rating > 0

  useEffect(() => {
    const revealNodes = document.querySelectorAll<HTMLElement>('.calculator-marketing-sections .reveal-stagger')

    if (!revealNodes.length) {
      return
    }

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

  useEffect(() => {
    if (!user) {
      return
    }

    setReviewForm((previous) => ({
      ...previous,
      name: previous.name || user.name,
      email: previous.email || user.email
    }))
  }, [user])

  return (
    <div className="calculator-marketing-sections">
      {showAuthPrompt ? (
        <AuthAccessModal
          title="Login required"
          description="Please login or sign up before submitting feedback."
          primaryLabel="Login / Sign Up"
          onPrimary={() => navigate('/login?mode=signup', { state: { from: loginRedirectPath } })}
          secondaryLabel="Maybe later"
          onSecondary={() => setShowAuthPrompt(null)}
        />
      ) : null}

      {showReviewSuccessCard ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4">
          <div className="w-full max-w-[420px] rounded-[28px] bg-white p-8 text-center shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/15">
              <svg aria-hidden="true" viewBox="0 0 24 24" className="h-10 w-10 text-primary" fill="none">
                <path d="M6 12.5l4 4L18 8.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="mt-6 text-[30px] font-semibold text-heading">Thank you for the feedback!</h3>
            <p className="mt-3 text-[16px] leading-[25.6px] text-body">
              Your review has been received successfully. We really appreciate you taking the time to share your experience.
            </p>
            <button
              type="button"
              onClick={() => setShowReviewSuccessCard(false)}
              className="mt-8 inline-flex h-[46px] items-center justify-center rounded-lg bg-primary px-6 text-[16px] font-medium text-white transition hover:bg-primaryDark"
            >
              Close
            </button>
          </div>
        </div>
      ) : null}

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
                className="cms-how-it-works-card relative border border-cardBorder bg-alt rounded-[10px] min-h-[254px] overflow-hidden px-[42px] py-[30px]"
              >
                <p className="cms-how-it-works-number absolute right-5 top-[56px] text-[100px] leading-none font-black text-cardBorder">{item.no}</p>
                <img src={item.icon} alt="icon" className="w-[42px] h-[42px] relative z-10" />
                <h3 className="mt-4 text-[23px] leading-normal font-medium text-heading relative z-10">{item.title}</h3>
                <p className="mt-3 text-[16px] leading-[25.6px] text-body relative z-10">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-14 bg-white">
        <div className="grid grid-cols-1 xl:grid-cols-[720px_586px] gap-12 items-center">
          <div className="cms-finance-image h-[378px] rounded-2xl overflow-hidden">
            <img src={financeVisualImg} alt="finance calculator visual" className="w-full h-full object-cover" />
          </div>
          <div>
            {
              (() => {
                const keys = Object.keys(introMap)
                let match = ''
                for (const k of keys) {
                  if ((loginRedirectPath || '').includes(k) || location.pathname.includes(k)) {
                    match = k
                    break
                  }
                }

                if (match) {
                  const intro = introMap[match]
                  return (
                    <>
                      <h2 className="text-[40px] leading-tight font-semibold text-heading">{intro.title}</h2>
                      <p className="text-[19px] font-semibold text-sub mt-3">{intro.subtitle}</p>
                      <p className="text-[16px] leading-[25.6px] text-body mt-3">{intro.body1}</p>
                      {intro.body2 ? <p className="text-[16px] leading-[25.6px] text-body mt-4">{intro.body2}</p> : null}
                    </>
                  )
                }

                return (
                  <>
                    <h2 className="text-[40px] leading-tight font-semibold text-heading">Your Complete Financial Calculator Platform</h2>
                    <p className="text-[19px] font-semibold text-sub mt-3">Make smarter financial decisions with fast, accurate, and easy-to-use calculation tools.</p>
                    <p className="text-[16px] leading-[25.6px] text-body mt-3">Access a wide range of calculators to plan loans, investments, savings, and retirement with confidence. Our tools simplify complex financial numbers into clear and easy results anyone can understand. No complicated setup or account is required just enter your values and calculate instantly.</p>
                    <p className="text-[16px] leading-[25.6px] text-body mt-4">Whether for personal or professional use, our platform helps you stay financially informed.</p>
                  </>
                )
              })()
            }
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-2 bg-white" id="features">
        <div className="grid grid-cols-1 xl:grid-cols-[652px_605px] justify-between gap-10">
          <div>
            {
              (() => {
                const keys = Object.keys(featureMap)
                let match = ''
                for (const k of keys) {
                  if ((loginRedirectPath || '').includes(k) || location.pathname.includes(k)) {
                    match = k
                    break
                  }
                }

                if (match) {
                  if (match === 'salary') {
                    return (
                      <>
                        <h2 className="text-[40px] leading-tight font-semibold text-heading max-w-[528px]">What the Salary Calculator Helps You Do</h2>
                        <p className="text-[16px] leading-[25.6px] text-sub mt-3 max-w-[652px]">Quickly translate salary figures into pay periods, adjust for time-off, and plan your monthly budget with confidence.</p>
                      </>
                    )
                  }

                  return (
                    <>
                      <h2 className="text-[40px] leading-tight font-semibold text-heading max-w-[528px]">Powerful Features Built for Smart Financial Planning</h2>
                      <p className="text-[16px] leading-[25.6px] text-sub mt-3 max-w-[652px]">Everything you need to calculate, compare, and plan finances with accuracy and confidence.</p>
                    </>
                  )
                }

                return (
                  <>
                    <h2 className="text-[40px] leading-tight font-semibold text-heading max-w-[528px]">Powerful Features Built for Smart Financial Planning</h2>
                    <p className="text-[16px] leading-[25.6px] text-sub mt-3 max-w-[652px]">Everything you need to calculate, compare, and plan finances with accuracy and confidence.</p>
                  </>
                )
              })()
            }
          </div>
          <div className="flex gap-[7px]">
            <div className="w-[12px] flex flex-col items-center shrink-0">
              {(() => {
                const keys = Object.keys(featureMap)
                let match = ''
                for (const k of keys) {
                  if ((loginRedirectPath || '').includes(k) || location.pathname.includes(k)) {
                    match = k
                    break
                  }
                }

                const list = match ? featureMap[match] : featureList
                return list.map((_, i) => (
                <div key={i} className="contents">
                  <div className="w-3 h-3 rounded-full bg-primary shrink-0" />
                  {i < list.length - 1 ? <div className="w-[6px] flex-1 bg-primary rounded-full" /> : null}
                </div>
                ))
              })()}
            </div>
            <div className="cms-feature-items space-y-5 w-full xl:w-[586px]">
              {(() => {
                const keys = Object.keys(featureMap)
                let match = ''
                for (const k of keys) {
                  if ((loginRedirectPath || '').includes(k) || location.pathname.includes(k)) {
                    match = k
                    break
                  }
                }

                const list = match ? featureMap[match] : featureList
                return list.map((item, index) => (
                <div
                  key={item.title}
                  className="reveal-stagger"
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  <h3 className="text-[19px] font-semibold text-heading">{item.title}</h3>
                  <p className="text-[16px] leading-[25.6px] text-body mt-2">{item.body}</p>
                </div>
                ))
              })()}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-16 bg-white" id="faqs">
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
            <article key={title} className="cms-info-card bg-alt border border-cardBorder rounded-[10px] p-5 min-h-[254px]">
              <img src={icon} alt="icon" className="w-[42px] h-[42px]" />
              <h3 className="text-[23px] leading-tight font-medium text-heading mt-6">{title}</h3>
              <p className="text-[16px] leading-[25.6px] text-body mt-4">{body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-8 bg-white">
        <div className="text-center max-w-[652px] mx-auto">
          <h2 className="text-[40px] font-semibold text-heading">Benefits of Financial Calculators</h2>
          <p className="text-[16px] leading-[25.6px] text-sub mt-3">Make smarter financial decisions with clarity, confidence, and better planning tools.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[15px] mt-10">
          {benefits.map((item) => {
            const isFeatured = item.featured

            return (
              <article
                key={item.title}
                className={[
                  'cms-benefit-card rounded-[10px] border px-[14px] pt-[15px] pb-[14px] min-h-[223px] overflow-hidden flex flex-col',
                  isFeatured ? 'border-primary bg-primary' : 'border-cardBorder bg-alt'
                ].join(' ')}
              >
                <div className={['flex items-start justify-start overflow-visible', item.iconWrapClassName].join(' ')}>
                  <img
                    src={item.icon}
                    alt=""
                    className={['block shrink-0 self-start object-contain object-left-top', item.iconClassName].join(' ')}
                  />
                </div>
                <h3 className={['text-[18px] md:text-[23px] leading-[31px] font-medium mt-[18px]', isFeatured ? 'text-white' : 'text-heading'].join(' ')}>
                  {item.title}
                </h3>
                <p className={['text-[16px] leading-[25.6px] mt-[7px]', isFeatured ? 'text-[#F8FAFC]' : 'text-body'].join(' ')}>
                  {item.body}
                </p>
              </article>
            )
          })}
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

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-16 bg-white">
        <div className="max-w-[528px]">
          <h2 className="text-[40px] leading-tight font-semibold text-heading">Additional Reasons to Use Our Platforms.</h2>
          <p className="text-[16px] leading-[25.6px] text-sub mt-3">Discover additional advantages that make our platform smarter and more convenient for everyday financial planning.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-10">
          {additional.map((item) => (
            <article key={item.title} className="cms-info-card bg-alt border border-cardBorder rounded-[10px] p-5 min-h-[254px]">
              <img src={item.icon} alt="" className="w-[42px] h-[42px]" />
              <h3 className="text-[23px] leading-tight font-medium text-heading mt-4">{item.title}</h3>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-6 pb-14 bg-white">
        <div className="text-center max-w-[652px] mx-auto">
          <h2 className="text-[40px] font-semibold text-heading">Your Privacy & Data Security Matter</h2>
          <p className="text-[16px] leading-[25.6px] text-sub mt-3">We prioritize user privacy and ensure all financial calculations remain secure and confidential.</p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 mt-10">
          <article className="bg-primary rounded-2xl border border-cardBorder p-5 md:p-6 text-white">
            <h3 className="text-[19px] leading-tight font-semibold">SSL & TLS</h3>
            <p className="text-[19px] font-semibold mt-2.5">Included across all calculators</p>
            <p className="text-[16px] leading-[25.6px] mt-5 text-[#f9fafb]">All calculations are processed through secure encrypted connections to ensure financial inputs remain protected at all times. We do not expose or transmit sensitive information beyond the calculation process, keeping every session secure and private. This encryption technology safeguards data while users calculate loans, investments, or savings, providing peace of mind during financial planning. Our goal is to maintain a safe environment where users can perform calculations confidently without worrying about data misuse or security risks.</p>
            <button type="button" className="mt-6 bg-white text-[#1d2433] border border-[#e1e6ef] rounded-lg px-4 py-2 font-medium">Learn More ↗</button>
          </article>

          <article className="bg-alt rounded-2xl border border-cardBorder p-5 md:p-6 relative overflow-hidden">
            <h3 className="text-[19px] leading-tight font-semibold text-heading">No PII Stored</h3>
            <p className="text-[19px] font-semibold text-sub mt-2.5">No signup required</p>
            <p className="text-[16px] leading-[25.6px] mt-5 text-body">Our platform does not collect or store personally identifiable information when users perform financial calculations. All calculations are processed instantly within the session without requiring account creation, personal details, or financial records to be submitted or saved. Users maintain full control over their privacy, allowing them to explore loan options, investment scenarios, savings plans, and other financial estimates securely and confidently. By avoiding unnecessary data collection, we ensure users can access tools freely without concerns about misuse of information or unwanted tracking.</p>
            <button type="button" className="mt-6 bg-white text-[#1d2433] border border-[#e1e6ef] rounded-lg px-4 py-2 font-medium">Privacy Policy ↗</button>
            <img
              src={shieldCheckIcon}
              alt=""
              aria-hidden
              className="cms-shield-icon absolute right-[11px] top-1/2 -translate-y-1/2 w-[200px] h-[200px] pointer-events-none select-none"
            />
          </article>
        </div>
      </section>

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-4 bg-white">
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

      <section className="max-w-[1440px] mx-auto px-6 xl:px-10 py-16 bg-white">
        <div className="grid grid-cols-1 xl:grid-cols-[513px_670px] justify-between gap-10">
          <div className="flex flex-col justify-center gap-14">
            <div className="flex flex-col items-start gap-5">
              <div className="flex items-start gap-[6px]" aria-hidden>
                <img src={faqQuoteIconSvg} alt="" className="w-[29px] h-[53px]" />
                <img src={faqQuoteIconSvg} alt="" className="w-[29px] h-[53px]" />
              </div>
              <h2 className="text-[40px] font-semibold text-heading leading-none">Frequently Asked Questions</h2>
            </div>
            <div className="cms-faq-cta bg-[rgba(167,243,208,0.2)] border border-cardBorder rounded-2xl p-5 w-full max-w-[360px]">
              <p className="text-[19px] font-semibold text-heading">Still have questions?</p>
              <p className="text-[16px] leading-[25.6px] text-body mt-3">Can&apos;t find the answer you’re looking for? Contact us and our team will assist you as soon as possible.</p>
              <button type="button" className="mt-5 bg-white border border-[#e1e6ef] rounded-lg px-4 py-2 text-[#1d2433] font-medium shadow-card">Send Mail ✉</button>
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
            ].map((question) => (
              <article key={question} className="border border-cardBorder rounded-2xl p-4 flex items-center justify-between gap-4">
                <h3 className="text-[19px] font-semibold text-heading">{question}</h3>
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
            <img src={expectBgImg} alt="" aria-hidden className="absolute left-0 top-0 w-[401px] opacity-80" />

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

          <div className="cms-review-card mt-10 max-w-[1080px] mx-auto bg-cardBorder rounded-[20px] p-6 md:p-10">
            <h3 className="text-[33px] font-semibold text-heading text-center">Leave a Review</h3>

            <form className="mt-10" onSubmit={handleReviewSubmit} noValidate>
              <div className="cms-review-fields grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="review-name" className="block text-[16px] font-medium text-sub mb-1.5">Your Name*</label>
                  <input
                    id="review-name"
                    name="name"
                    value={reviewForm.name}
                    onChange={handleReviewInputChange}
                    className="w-full h-[44px] rounded-md border border-cardBorder bg-alt px-3 text-[16px] text-heading placeholder:text-[#9ca3af]"
                    placeholder="Jonny"
                    aria-invalid={Boolean(reviewErrors.name)}
                    aria-describedby={reviewErrors.name ? 'review-name-error' : undefined}
                  />
                  {reviewErrors.name ? <p id="review-name-error" className="mt-1.5 text-sm text-red-600">{reviewErrors.name}</p> : null}
                </div>
                <div>
                  <label htmlFor="review-email" className="block text-[16px] font-medium text-sub mb-1.5">Your Email*</label>
                  <input
                    id="review-email"
                    name="email"
                    type="email"
                    value={reviewForm.email}
                    onChange={handleReviewInputChange}
                    className="w-full h-[44px] rounded-md border border-cardBorder bg-alt px-3 text-[16px] text-heading placeholder:text-[#9ca3af]"
                    placeholder="jonny@example.com"
                    aria-invalid={Boolean(reviewErrors.email)}
                    aria-describedby={reviewErrors.email ? 'review-email-error' : undefined}
                  />
                  {reviewErrors.email ? <p id="review-email-error" className="mt-1.5 text-sm text-red-600">{reviewErrors.email}</p> : null}
                </div>
              </div>

              <div className="mt-5">
                <label htmlFor="review-message" className="block text-[16px] text-sub mb-2">Your message*</label>
                <textarea
                  id="review-message"
                  name="message"
                  value={reviewForm.message}
                  onChange={handleReviewInputChange}
                  className="w-full h-[160px] rounded-md border border-[#cbd5e1] bg-[#f5f7fa] px-3 py-3 text-[14px] leading-5 text-heading placeholder:text-[#94a3b8]"
                  placeholder="Type your message here"
                  aria-invalid={Boolean(reviewErrors.message)}
                  aria-describedby={reviewErrors.message ? 'review-message-error' : undefined}
                />
                {reviewErrors.message ? <p id="review-message-error" className="mt-1.5 text-sm text-red-600">{reviewErrors.message}</p> : null}
              </div>

              <div className="mt-6">
                <p className="text-[16px] font-medium text-sub">Your Rating*</p>
                <div className="cms-star-row mt-2 flex items-center gap-1.5" role="radiogroup" aria-label="Select rating">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const ratingValue = index + 1
                    const isActive = ratingValue <= reviewForm.rating

                    return (
                      <button
                        key={ratingValue}
                        type="button"
                        onClick={() => handleRatingSelect(ratingValue)}
                        className={[
                          'inline-flex items-center justify-center text-[30px] leading-none transition-transform hover:scale-110',
                          isActive ? 'text-amber-400' : 'text-[#d1d5db]'
                        ].join(' ')}
                        aria-label={`${ratingValue} star${ratingValue > 1 ? 's' : ''}`}
                        aria-pressed={reviewForm.rating === ratingValue}
                      >
                        ★
                      </button>
                    )
                  })}
                  <span className="ml-2 text-[14px] font-medium text-sub">
                    {reviewForm.rating > 0 ? `${reviewForm.rating} / 5` : 'Select a rating'}
                  </span>
                </div>
                {reviewErrors.rating ? <p className="mt-1.5 text-sm text-red-600">{reviewErrors.rating}</p> : null}
              </div>

              {reviewSubmitError ? (
                <p className="mt-4 text-sm text-red-600" role="alert">
                  {reviewSubmitError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={!isReviewFormComplete || isSubmittingReview}
                className={[
                  'cms-review-submit mt-8 w-full h-[43px] rounded-lg text-[16px] font-medium transition',
                  !isReviewFormComplete || isSubmittingReview
                    ? 'cursor-not-allowed bg-slate-300 text-slate-600'
                    : 'bg-primary text-white hover:bg-primaryDark'
                ].join(' ')}
              >
                {isSubmittingReview ? 'Submitting...' : 'Post Your Review'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}
