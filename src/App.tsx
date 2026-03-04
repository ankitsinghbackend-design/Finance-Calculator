import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Finance from './pages/Finance'
import DisableAdblockHelp from './pages/DisableAdblockHelp'
import Header from './components/Header'
import Footer from './components/Footer'
import CalculatorLayout from './layouts/CalculatorLayout'

export default function App(){
  return (
    <CalculatorLayout>
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home/>} />
            <Route path="/finance" element={<Finance/>} />
            <Route path="/help/disable-adblock" element={<DisableAdblockHelp/>} />
          </Routes>
        </main>
        <Footer />
      </div>
    </CalculatorLayout>
  )
}
