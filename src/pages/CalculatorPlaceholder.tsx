import React from 'react'
import { useParams } from 'react-router-dom'
import MortgageCalculatorPage from './MortgageCalculatorPage'
import MortgagePayoffPage from './MortgagePayoffPage'
import K401CalculatorPage from './K401CalculatorPage'
import SalaryCalculatorPage from './SalaryCalculatorPage'
import CurrencyCalculatorPage from './CurrencyCalculatorPage'
import CompoundInterestCalculatorPage from './CompoundInterestCalculatorPage'
import CollegeCostCalculatorPage from './CollegeCostCalculatorPage'

export default function CalculatorPlaceholder() {
	const { calculatorId } = useParams()

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

	if (calculatorId === 'college-cost') {
		return <CollegeCostCalculatorPage />
	}

	return <div className="min-h-[60vh]" />
}
