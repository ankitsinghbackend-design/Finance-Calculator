import React from 'react'
import { useParams } from 'react-router-dom'
import AutoLoanPage from '../components/calculators/AutoLoanPage'
import HouseAffordabilityPage from './HouseAffordabilityPage'
import RepaymentCalculatorPage from './RepaymentCalculatorPage'
import MortgageCalculatorPage from './MortgageCalculatorPage'
import MortgagePayoffPage from './MortgagePayoffPage'
import K401CalculatorPage from './K401CalculatorPage'
import SalaryCalculatorPage from './SalaryCalculatorPage'
import CurrencyCalculatorPage from './CurrencyCalculatorPage'
import CompoundInterestCalculatorPage from './CompoundInterestCalculatorPage'
import StudentLoanCalculatorPage from './StudentLoanCalculatorPage'
import IncomeTaxCalculatorPage from './IncomeTaxCalculatorPage'
import PensionCalculatorPage from './PensionCalculatorPage'
import SocialSecurityCalculatorPage from './SocialSecurityCalculatorPage'
import InvestmentCalculatorPage from './InvestmentCalculatorPage'
import InterestRateCalculatorPage from './InterestRateCalculatorPage'
import EstateTaxCalculatorPage from './EstateTaxCalculatorPage'
import LoanCalculatorPage from './LoanCalculatorPage'
import HelocCalculatorPage from './HelocCalculatorPage'
import AutoLeaseCalculatorPage from './AutoLeaseCalculatorPage'
import APRCalculatorPage from './APRCalculatorPage'
import SalesTaxCalculatorPage from './SalesTaxCalculatorPage'
import DebtToIncomeCalculatorPage from './DebtToIncomeCalculatorPage'

export default function CalculatorPlaceholder() {
	const { calculatorId } = useParams()

	if (calculatorId === 'auto-loan') {
		return <AutoLoanPage />
	}

	if (calculatorId === 'house-affordability') {
		return <HouseAffordabilityPage />
	}

	if (calculatorId === 'repayment') {
		return <RepaymentCalculatorPage />
	}

	if (calculatorId === 'mortgage') {
		return <MortgageCalculatorPage />
	}

	if (calculatorId === 'mortgage-payoff') {
		return <MortgagePayoffPage />
	}

	if (calculatorId === '401k') {
		return <K401CalculatorPage />
	}

	if (calculatorId === 'salary') {
		return <SalaryCalculatorPage />
	}

	if (calculatorId === 'currency') {
		return <CurrencyCalculatorPage />
	}

	if (calculatorId === 'compound-interest') {
		return <CompoundInterestCalculatorPage />
	}

	if (calculatorId === 'student-loan') {
		return <StudentLoanCalculatorPage />
	}

	if (calculatorId === 'income-tax') {
		return <IncomeTaxCalculatorPage />
	}

	if (calculatorId === 'pension') {
		return <PensionCalculatorPage />
	}

	if (calculatorId === 'social-security') {
		return <SocialSecurityCalculatorPage />
	}

	if (calculatorId === 'investment') {
		return <InvestmentCalculatorPage />
	}

	if (calculatorId === 'interest-rate') {
		return <InterestRateCalculatorPage />
	}

	if (calculatorId === 'estate-tax') {
		return <EstateTaxCalculatorPage />
	}

	if (calculatorId === 'loan') {
		return <LoanCalculatorPage />
	}

	if (calculatorId === 'heloc') {
		return <HelocCalculatorPage />
	}

	if (calculatorId === 'auto-lease') {
		return <AutoLeaseCalculatorPage />
	}

	if (calculatorId === 'apr') {
		return <APRCalculatorPage />
	}

	if (calculatorId === 'sales-tax') {
		return <SalesTaxCalculatorPage />
	}

	if (calculatorId === 'dti-ratio') {
		return <DebtToIncomeCalculatorPage />
	}

	return <div className="min-h-[60vh]" />
}
