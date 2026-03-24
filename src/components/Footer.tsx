import React from 'react'
import { Link } from 'react-router-dom'
import instagramIcon from '../assets/footer-instagram.svg'
import twitterIcon from '../assets/footer-twitter.svg'
import linkedinIcon from '../assets/footer-linkedin.svg'
import facebookIcon from '../assets/footer-facebook.svg'
import mapPinIcon from '../assets/map-pin.svg'
import mailIcon from '../assets/mail.svg'
import phoneIcon from '../assets/footer-phone.svg'

const social = {
  instagram: instagramIcon,
  twitter: twitterIcon,
  linkedin: linkedinIcon,
  facebook: facebookIcon
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
            <li><Link to="/finance">Mortgage &amp; Real Estate</Link></li>
            <li><Link to="/finance">Auto</Link></li>
            <li><Link to="/finance">Tax &amp; Salary</Link></li>
            <li><Link to="/finance">Investment</Link></li>
            <li><Link to="/finance">Retirement</Link></li>
            <li><Link to="/finance">Others</Link></li>
          </ul>
        </div>
        {/* <div>
          <h4 className="text-heading text-lg font-medium">Contact / Support</h4>
          <ul className="mt-3 text-sub space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <img src={mapPinIcon} alt="location" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>123 Business Avenue Street Road Bangalore</span>
            </li>
            <li className="flex items-center gap-2">
              <img src={mailIcon} alt="mail" className="h-4 w-4 shrink-0" />
              <span>info@finovo.com</span>
            </li>
            <li className="flex items-center gap-2">
              <img src={phoneIcon} alt="phone" className="h-4 w-4 shrink-0" />
              <span>+123456987</span>
            </li>
          </ul>
        </div> */}
      </div>
      <div className="border-t border-cardBorder">
        <div className="container mx-auto px-4 py-4 sm:px-6 flex flex-col gap-3 text-center sm:text-left sm:flex-row sm:items-center sm:justify-between text-sm text-[#212121]">
          <div>© 2026 logoipsum. All Rights Reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-end sm:gap-6">
            <a href="#">Privacy Policy</a>
            <a href="#">Term &amp; Condition</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
