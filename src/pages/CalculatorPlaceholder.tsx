import React from 'react'
import { useParams } from 'react-router-dom'
import MortgageCalculatorPage from './MortgageCalculatorPage'
import MortgagePayoffPage from './MortgagePayoffPage'
import K401CalculatorPage from './K401CalculatorPage'

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

	return <div className="min-h-[60vh]" />
}
