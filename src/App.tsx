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
import StudentLoanCalculatorPage from './pages/StudentLoanCalculatorPage'
import IncomeTaxCalculatorPage from './pages/IncomeTaxCalculatorPage'
import PensionCalculatorPage from './pages/PensionCalculatorPage'
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
            <Route path="/calculators/college-cost" element={<CollegeCostCalculatorPage/>} />
            <Route path="/calculators/compound-interest" element={<CompoundInterestCalculatorPage/>} />
            <Route path="/calculators/student-loan" element={<StudentLoanCalculatorPage/>} />
            <Route path="/calculators/income-tax" element={<IncomeTaxCalculatorPage/>} />
            <Route path="/calculators/pension" element={<PensionCalculatorPage/>} />
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
