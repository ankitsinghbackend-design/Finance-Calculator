import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Finance from './pages/Finance'
import DisableAdblockHelp from './pages/DisableAdblockHelp'
import CalculatorPlaceholder from './pages/CalculatorPlaceholder'
import Amortization from './pages/Amortization'
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
