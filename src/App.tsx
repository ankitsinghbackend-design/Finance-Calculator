import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Finance from './pages/Finance'
import Header from './components/Header'
import Footer from './components/Footer'

export default function App(){
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/finance" element={<Finance/>} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
