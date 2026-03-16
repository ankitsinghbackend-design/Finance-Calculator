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
import RentVsBuyCalculatorPage from './RentVsBuyCalculatorPage'
import AutoLeaseCalculatorPage from './AutoLeaseCalculatorPage'
import APRCalculatorPage from './APRCalculatorPage'
import SalesTaxCalculatorPage from './SalesTaxCalculatorPage'
import DebtToIncomeCalculatorPage from './DebtToIncomeCalculatorPage'
import FHALoanPage from './FHALoanPage'
import VAMortgagePage from './VAMortgagePage'
import RefinancePage from './RefinancePage'
import RentalPropertyPage from './RentalPropertyPage'
import DownPaymentPage from './DownPaymentPage'
import CashBackComparisonPage from './CashBackComparisonPage'
import AnnuityPage from './AnnuityPage'
import RothIraPage from './RothIraPage'
import RMDPage from './RMDPage'
import BondPage from './BondPage'
import MutualFundPage from './MutualFundPage'
import DepreciationCalculatorPage from './DepreciationCalculatorPage'
import BusinessLoanCalculatorPage from './BusinessLoanCalculatorPage'
import NotFoundPage from './NotFoundPage'

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

	if (calculatorId === 'rent-vs-buy') {
		return <RentVsBuyCalculatorPage />
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

	if (calculatorId === 'fha-loan') {
		return <FHALoanPage />
	}

	if (calculatorId === 'va-mortgage') {
		return <VAMortgagePage />
	}

	if (calculatorId === 'refinance') {
		return <RefinancePage />
	}

	if (calculatorId === 'rental-property') {
		return <RentalPropertyPage />
	}

	if (calculatorId === 'down-payment') {
		return <DownPaymentPage />
	}

	if (calculatorId === 'cash-back-or-low-interest' || calculatorId === 'cashback-vs-low-interest') {
		return <CashBackComparisonPage />
	}

	if (calculatorId === 'annuity') {
		return <AnnuityPage />
	}

	if (calculatorId === 'roth-ira') {
		return <RothIraPage />
	}

	if (calculatorId === 'rmd') {
		return <RMDPage />
	}

	if (calculatorId === 'bond' || calculatorId === 'bond-pricing') {
		return <BondPage />
	}

	if (calculatorId === 'mutual-fund') {
		return <MutualFundPage />
	}

	if (calculatorId === 'depreciation') {
		return <DepreciationCalculatorPage />
	}

	if (calculatorId === 'business-loan') {
		return <BusinessLoanCalculatorPage />
	}

	return <NotFoundPage />
}
