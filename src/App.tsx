import React from 'react'
import { Routes, Route } from 'react-router-dom'
import AutoLoanPage from './components/calculators/AutoLoanPage'
import Home from './pages/Home'
import Finance from './pages/Finance'
import DisableAdblockHelp from './pages/DisableAdblockHelp'
import CalculatorPlaceholder from './pages/CalculatorPlaceholder'
import Amortization from './pages/Amortization'
import CollegeCostCalculatorPage from './pages/CollegeCostCalculatorPage'
import CompoundInterestCalculatorPage from './pages/CompoundInterestCalculatorPage'
import HouseAffordabilityPage from './pages/HouseAffordabilityPage'
import RepaymentCalculatorPage from './pages/RepaymentCalculatorPage'
import StudentLoanCalculatorPage from './pages/StudentLoanCalculatorPage'
import IncomeTaxCalculatorPage from './pages/IncomeTaxCalculatorPage'
import PensionCalculatorPage from './pages/PensionCalculatorPage'
import SocialSecurityCalculatorPage from './pages/SocialSecurityCalculatorPage'
import InvestmentCalculatorPage from './pages/InvestmentCalculatorPage'
import InterestRateCalculatorPage from './pages/InterestRateCalculatorPage'
import EstateTaxCalculatorPage from './pages/EstateTaxCalculatorPage'
import LoanCalculatorPage from './pages/LoanCalculatorPage'
import HelocCalculatorPage from './pages/HelocCalculatorPage'
import RentVsBuyCalculatorPage from './pages/RentVsBuyCalculatorPage'
import AutoLeaseCalculatorPage from './pages/AutoLeaseCalculatorPage'
import APRCalculatorPage from './pages/APRCalculatorPage'
import SalesTaxCalculatorPage from './pages/SalesTaxCalculatorPage'
import DebtToIncomeCalculatorPage from './pages/DebtToIncomeCalculatorPage'
import FHALoanPage from './pages/FHALoanPage'
import VAMortgagePage from './pages/VAMortgagePage'
import RefinancePage from './pages/RefinancePage'
import RentalPropertyPage from './pages/RentalPropertyPage'
import DownPaymentPage from './pages/DownPaymentPage'
import CashBackComparisonPage from './pages/CashBackComparisonPage'
import AnnuityPage from './pages/AnnuityPage'
import RothIraPage from './pages/RothIraPage'
import RMDPage from './pages/RMDPage'
import BondPage from './pages/BondPage'
import MutualFundPage from './pages/MutualFundPage'
import Header from './components/Header'
import Footer from './components/Footer'
import CalculatorLayout from './layouts/CalculatorLayout'
import BlogListPage from './pages/BlogListPage'
import BlogDetailPage from './pages/BlogDetailPage'
import BlogEditorPage from './pages/BlogEditorPage'

export default function App(){
  return (
    <CalculatorLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/finance" element={<Finance/>} />
            <Route path="/finance/amortization" element={<Amortization/>} />
            <Route path="/calculators/amortization" element={<Amortization/>} />
            <Route path="/calculators/auto-loan" element={<AutoLoanPage/>} />
            <Route path="/calculators/house-affordability" element={<HouseAffordabilityPage/>} />
            <Route path="/calculators/repayment" element={<RepaymentCalculatorPage/>} />
            <Route path="/calculators/college-cost" element={<CollegeCostCalculatorPage/>} />
            <Route path="/calculators/compound-interest" element={<CompoundInterestCalculatorPage/>} />
            <Route path="/calculators/student-loan" element={<StudentLoanCalculatorPage/>} />
            <Route path="/calculators/income-tax" element={<IncomeTaxCalculatorPage/>} />
            <Route path="/calculators/pension" element={<PensionCalculatorPage/>} />
            <Route path="/calculators/social-security" element={<SocialSecurityCalculatorPage/>} />
            <Route path="/calculators/investment" element={<InvestmentCalculatorPage/>} />
            <Route path="/calculators/interest-rate" element={<InterestRateCalculatorPage/>} />
            <Route path="/calculators/estate-tax" element={<EstateTaxCalculatorPage/>} />
            <Route path="/calculators/loan" element={<LoanCalculatorPage/>} />
            <Route path="/calculators/heloc" element={<HelocCalculatorPage/>} />
            <Route path="/calculators/rent-vs-buy" element={<RentVsBuyCalculatorPage/>} />
            <Route path="/calculators/auto-lease" element={<AutoLeaseCalculatorPage/>} />
            <Route path="/calculators/apr" element={<APRCalculatorPage/>} />
            <Route path="/calculators/sales-tax" element={<SalesTaxCalculatorPage/>} />
            <Route path="/calculators/dti-ratio" element={<DebtToIncomeCalculatorPage/>} />
            <Route path="/calculators/fha-loan" element={<FHALoanPage/>} />
            <Route path="/calculators/va-mortgage" element={<VAMortgagePage/>} />
            <Route path="/calculators/refinance" element={<RefinancePage/>} />
            <Route path="/calculators/rental-property" element={<RentalPropertyPage/>} />
            <Route path="/calculators/down-payment" element={<DownPaymentPage/>} />
            <Route path="/calculators/cash-back-or-low-interest" element={<CashBackComparisonPage/>} />
            <Route path="/calculators/annuity" element={<AnnuityPage/>} />
            <Route path="/calculators/roth-ira" element={<RothIraPage/>} />
            <Route path="/calculators/rmd" element={<RMDPage/>} />
            <Route path="/calculators/bond" element={<BondPage/>} />
            <Route path="/calculators/mutual-fund" element={<MutualFundPage/>} />
            <Route path="/calculators/:calculatorId" element={<CalculatorPlaceholder/>} />
            <Route path="/help/disable-adblock" element={<DisableAdblockHelp/>} />
            <Route path="/blogs" element={<BlogListPage/>} />
            <Route path="/blogs/:slug" element={<BlogDetailPage/>} />
            <Route path="/admin/blog-editor" element={<BlogEditorPage/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CalculatorLayout>
  )
}
