# 💰 FinCalCo — Finance Calculator & Blog

A professional-grade financial calculator platform and blogging system built with a high-performance, modern tech stack. Designed for the web with advanced SEO, analytics, and security features.

**Live at:** [fincalco.com](https://fincalco.com)

---

## 🚀 Features

### 📊 40+ Financial Calculators
- **Loans & Mortgages:** Amortization, Auto Loan, Mortgage Payoff, FHA Loan, VA Mortgage, Refinance, HELOC.
- **Investment & Retirement:** 401k, Compound Interest, Pension, Social Security, Roth IRA, RMD, Mutual Funds, Bonds.
- **Personal Finance:** Salary, Currency Converter, Income Tax, Sales Tax, Debt-To-Income (DTI) Ratio, House Affordability.
- **Business Finance:** Depreciation, Business Loan, Payback Period.

### ✍️ Content Management
- **Full Blogging System:** Admin dashboard for creating, editing, and managing financial articles.
- **Image Integration:** Automated image uploads and hosting via Cloudinary.
- **Rich Text Editing:** Advanced content formatting for engaging articles.

### 🔍 SEO & Analytics
- **Dynamic Sitemap:** Auto-generated `sitemap.xml` including all calculators and blog posts.
- **Google Tag Manager:** Integrated GTM for advanced tracking.
- **Verification:** Built-in support for Google Search Console and Monetag verification.
- **Robots.txt:** Optimized crawler configurations.

### 🛡️ Core Infrastructure
- **AdBlock Detection:** Multi-heuristic detection with backend logging.
- **I18n Translation:** Multi-language support infrastructure.
- **Secure Auth:** Admin authentication for managing content.

---

## 🛠 Tech Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, Tiptap (Rich Text).
- **Backend:** Node.js, Express, TypeScript, Mongoose.
- **Database:** MongoDB Atlas (NoSQL).
- **Hosting:** MilesWeb (cPanel Node.js Setup + Phusion Passenger).
- **Storage:** Cloudinary (Images).

---

## ⚙️ Configuration (.env)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db_name

# Server
PORT=5001
SITE_URL=https://fincalco.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=name
CLOUDINARY_API_KEY=key
CLOUDINARY_API_SECRET=secret
CLOUDINARY_URL=cloudinary://key:secret@name

# AdBlock (Optional/Security)
AD_BAIT_PATH=/ads-bait.js
ADBLOCK_LOG_ENDPOINT=/api/log/adblock
```

---

## 💻 Local Development

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Dev Server:**
   ```bash
   npm run dev      # Starts Vite (Frontend)
   npm run backend:dev # Starts Backend (tsx watch)
   ```

3. **Build Project:**
   ```bash
   npm run build         # Compiles Frontend to /dist
   npm run backend:build # Compiles Backend to /dist/backend
   ```

---

## 🚢 Deployment (MilesWeb cPanel)

### 1. Preparation
Run `npm run build` and `npm run backend:build` on your local machine. This generates the `dist/` folder containing pure JavaScript, as MilesWeb cannot run TypeScript directly.

### 2. Files to Upload
Zip and upload the following structure to your app root (e.g., `Finance/`):
- `app.js` (The Passenger entry point)
- `package.json` & `package-lock.json`
- `dist/` (Containing both frontend and backend JS)
- `backend/.env` (Your production config)
- `backend/public/` (Static assets)

### 3. cPanel Node.js Setup
- **Application Root:** `Finance`
- **Startup File:** `app.js`
- **Application Mode:** `Production`
- **Node.js Version:** `18.x` or higher.

### 4. Finalizing
Click **"Run NPM Install"** in cPanel and then **RESTART** the application.

---

## 🧪 Testing
```bash
npm test
```
Includes unit tests for logic and integration tests for API endpoints.
