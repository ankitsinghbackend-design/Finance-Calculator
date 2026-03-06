import React from 'react'
import { useParams } from 'react-router-dom'
import MortgageCalculatorPage from './MortgageCalculatorPage'
import MortgagePayoffPage from './MortgagePayoffPage'

export default function CalculatorPlaceholder() {
	const { calculatorId } = useParams()

	if (calculatorId === 'mortgage') {
		return <MortgageCalculatorPage />
	}

	if (calculatorId === 'mortgage-payoff') {
		return <MortgagePayoffPage />
	}

	return <div className="min-h-[60vh]" />
}
