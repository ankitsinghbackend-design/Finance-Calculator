export type AmortizationInputs = {
  loanAmount: number
  interestRate: number
  loanTermYears: number
  loanTermMonths?: number
  extraMonthlyPayment?: number
}

export type AmortizationRow = {
  month: number
  payment: number
  principal: number
  interest: number
  balance: number
}

export type AmortizationResult = {
  monthlyPayment: number
  totalPayments: number
  totalInterest: number
  payoffMonths: number
  schedule: AmortizationRow[]
}

export function calculateAmortization(inputs: AmortizationInputs): AmortizationResult {
  const {
    loanAmount,
    interestRate,
    loanTermYears,
    loanTermMonths = 0,
    extraMonthlyPayment = 0
  } = inputs

  const round2 = (v: number) => Math.round((v + Number.EPSILON) * 100) / 100

  const totalMonths = loanTermYears * 12 + loanTermMonths
  const monthlyRate = interestRate / 100 / 12

  let monthlyPayment: number

  if (monthlyRate === 0) {
    monthlyPayment = loanAmount / totalMonths
  } else {
    monthlyPayment =
      (loanAmount * monthlyRate) /
      (1 - Math.pow(1 + monthlyRate, -totalMonths))
  }

  let balance = loanAmount
  let totalInterest = 0
  let months = 0

  const schedule: AmortizationRow[] = []

  while (balance > 0 && months < totalMonths + 1) {
    const interest = balance * monthlyRate

    let principal = monthlyPayment - interest
    let payment = monthlyPayment

    if (extraMonthlyPayment > 0) {
      payment += extraMonthlyPayment
      principal += extraMonthlyPayment
    }

    if (principal > balance) {
      principal = balance
      payment = principal + interest
    }

    balance -= principal
    totalInterest += interest
    months++

    schedule.push({
      month: months,
      payment: round2(payment),
      principal: round2(principal),
      interest: round2(interest),
      balance: round2(balance)
    })

    if (balance <= 0) break
  }

  const totalPayments = monthlyPayment * months

  return {
    monthlyPayment: round2(monthlyPayment),
    totalPayments: round2(totalPayments),
    totalInterest: round2(totalInterest),
    payoffMonths: months,
    schedule
  }
}
