import React from 'react'
import { Link } from 'react-router-dom'

const social = {
  instagram: 'https://www.figma.com/api/mcp/asset/6be54d3d-d03c-41f8-a48c-42ed71007e1e',
  twitter: 'https://www.figma.com/api/mcp/asset/94d3e9a9-fdc9-4260-873d-03141e279659',
  linkedin: 'https://www.figma.com/api/mcp/asset/ea64f333-383c-46d1-906c-42610041b9f3',
  facebook: 'https://www.figma.com/api/mcp/asset/4b1e0a07-14c9-4207-a7c6-cb1de2677fec'
}

export default function Footer(){
  return (
    <footer className="bg-alt border-t border-cardBorder mt-12">
      <div className="container mx-auto px-4 py-10 sm:px-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8">
        <div>
          <h3 className="text-primary font-bold text-2xl">Finovo</h3>
          <p className="text-body mt-3 max-w-[320px]">Helping users make smarter financial decisions through simple, accurate, and accessible calculation tools for everyday planning.</p>
          <div className="flex gap-3 mt-4">
            <img src={social.instagram} alt="ig" className="w-4 h-4" />
            <img src={social.twitter} alt="tw" className="w-4 h-4" />
            <img src={social.linkedin} alt="li" className="w-4 h-4" />
            <img src={social.facebook} alt="fb" className="w-4 h-4" />
          </div>
        </div>
        <div>
          <h4 className="text-heading text-lg font-medium">Quick Links</h4>
          <ul className="mt-3 text-sub space-y-1 text-sm">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/finance">Financial Calculators</Link></li>
            <li><Link to="/blogs">Blogs</Link></li>
            <li><a href="#">About Us</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-heading text-lg font-medium">Calculator Categories</h4>
          <ul className="mt-3 text-sub space-y-1 text-sm">
            <li>Loan Calculators</li>
            <li>Investment Calculators</li>
            <li>Retirement Calculators</li>
            <li>Tax Calculators</li>
          </ul>
        </div>
        <div>
          <h4 className="text-heading text-lg font-medium">Contact / Support</h4>
          <ul className="mt-3 text-sub space-y-2 text-sm">
            <li>123 Business Avenue Street Road Bangalore</li>
            <li>info@finovo.com</li>
            <li>+123456987</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cardBorder">
        <div className="container mx-auto px-4 py-4 sm:px-6 flex flex-col gap-3 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between text-sm text-[#212121]">
          <div>© 2025 logoipsum. All Rights Reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-6">
            <a href="#">Privacy Policy</a>
            <a href="#">Term &amp; Condition</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
