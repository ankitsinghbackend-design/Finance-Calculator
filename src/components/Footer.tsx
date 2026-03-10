import React from 'react'
import { Link } from 'react-router-dom'
import socialInstagram from '../assets/footer-instagram.svg'
import socialTwitter from '../assets/footer-twitter.svg'
import socialLinkedin from '../assets/footer-linkedin.svg'
import socialFacebook from '../assets/footer-facebook.svg'
import mapPinIcon from '../assets/map-pin.svg'
import mailIcon from '../assets/mail.svg'
import phoneIcon from '../assets/footer-phone.svg'

const social = {
  instagram: socialInstagram,
  twitter: socialTwitter,
  linkedin: socialLinkedin,
  facebook: socialFacebook
}

export default function Footer(){
  return (
    <footer className="bg-alt mt-12 font-figtree">
      <div className="container mx-auto px-6 py-10 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-[290px_121px_223px_174px] justify-between gap-8 md:gap-10">
          <div>
            <h3 className="text-primary font-bold text-[28px] leading-none">Finovo</h3>
            <p className="text-body mt-4 text-base leading-[1.6]">Helping users make smarter financial decisions through simple, accurate, and accessible calculation tools for everyday planning.</p>
            <div className="flex gap-[10px] mt-3 items-center">
              <img src={social.instagram} alt="Instagram" className="w-4 h-4" />
              <img src={social.twitter} alt="Twitter" className="w-4 h-[13px]" />
              <img src={social.linkedin} alt="LinkedIn" className="w-4 h-4" />
              <img src={social.facebook} alt="Facebook" className="w-4 h-4" />
            </div>
          </div>

          <div>
            <h4 className="text-heading text-[23px] font-medium leading-none">Quick Links</h4>
            <ul className="mt-[10px] space-y-2 text-sub text-base leading-none font-medium">
              <li><Link to="/" className="hover:text-heading transition-colors">Home</Link></li>
              <li><Link to="/finance" className="hover:text-heading transition-colors">Financial Calculators</Link></li>
              <li><Link to="/blogs" className="hover:text-heading transition-colors">Blogs</Link></li>
              <li><a href="#" className="hover:text-heading transition-colors">About Us</a></li>
              <li><a href="#" className="hover:text-heading transition-colors">Contact Us</a></li>
              <li><a href="#faqs" className="hover:text-heading transition-colors">FAQs</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-heading text-[23px] font-medium leading-none">Calculator Categories</h4>
            <ul className="mt-[10px] space-y-2 text-sub text-base leading-none font-medium">
              <li>Loan Calculators</li>
              <li>Investment Calculators</li>
              <li>Retirement Calculators</li>
              <li>Tax Calculators</li>
              <li>Savings Calculators</li>
              <li>EMI Calculators</li>
            </ul>
          </div>

          <div>
            <h4 className="text-heading text-[23px] font-medium leading-none">Contact / Support</h4>
            <ul className="mt-[10px] space-y-2 text-sub text-base leading-none font-medium">
              <li className="flex items-start gap-[10px]">
                <img src={mapPinIcon} alt="Location" className="w-4 h-4 mt-0.5 shrink-0" />
                <span>123 Business Avenue Street Road Bangalore</span>
              </li>
              <li className="flex items-center gap-[10px]">
                <img src={mailIcon} alt="Email" className="w-4 h-4 shrink-0" />
                <span>info@finovo.com</span>
              </li>
              <li className="flex items-center gap-[10px]">
                <img src={phoneIcon} alt="Phone" className="w-4 h-4 shrink-0" />
                <span>+123456987</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div>
        <div className="container mx-auto px-6 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between text-[#212121] font-satoshi">
          <div className="text-[13px] leading-none">© 2025 logoipsum. All Rights Reserved.</div>
          <div className="flex gap-6 text-base font-medium leading-none">
            <a href="#">Privacy Policy</a>
            <a href="#">Term &amp; Condition</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
