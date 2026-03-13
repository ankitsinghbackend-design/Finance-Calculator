import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const pagesDir = '/Users/ankit/Desktop/Finance-Calculator/src/pages'
const STANDARD_CLASS = 'hidden xl:block absolute right-0 top-[42px] w-[868px] h-[883px] object-contain pointer-events-none select-none'
const IMPORT_STMT = "import heroGraphicSvg from '../assets/hero-graphic.svg'"

const pages = [
  { file: 'RMDPage.tsx', varName: 'rmdGraphic' },
  { file: 'HelocCalculatorPage.tsx', varName: 'helocGraphic' },
  { file: 'BusinessLoanCalculatorPage.tsx', varName: 'businessLoanGraphic' },
  { file: 'RothIraPage.tsx', varName: 'rothIraGraphic' },
  { file: 'BondPage.tsx', varName: 'bondGraphic' },
  { file: 'AutoLeaseCalculatorPage.tsx', varName: 'autoLeaseGraphic' },
  { file: 'SocialSecurityCalculatorPage.tsx', varName: 'socialSecurityGraphic' },
  { file: 'RefinancePage.tsx', varName: 'refinanceGraphic' },
  { file: 'AnnuityPage.tsx', varName: 'annuityGraphic' },
  { file: 'VAMortgagePage.tsx', varName: 'vaGraphic' },
  { file: 'FHALoanPage.tsx', varName: 'fhaGraphic' },
  { file: 'MutualFundPage.tsx', varName: 'mutualFundGraphic' },
  { file: 'DepreciationCalculatorPage.tsx', varName: 'depreciationGraphic' },
  { file: 'RentVsBuyCalculatorPage.tsx', varName: 'rentVsBuyGraphic' },
  { file: 'RentalPropertyPage.tsx', varName: 'rentalPropertyGraphic' },
  { file: 'CashBackComparisonPage.tsx', varName: 'cashBackGraphic' },
  { file: 'EstateTaxCalculatorPage.tsx', varName: 'estateTaxGraphic' },
  { file: 'DownPaymentPage.tsx', varName: 'downPaymentGraphic' },
  { file: 'LoanCalculatorPage.tsx', varName: 'loanGraphic' },
  { file: 'Amortization.tsx', varName: 'heroGraphic' },
  { file: 'CompoundInterestCalculatorPage.tsx', varName: 'heroGraphic' },
  { file: 'CurrencyCalculatorPage.tsx', varName: 'heroGraphic' },
  { file: 'SalesTaxCalculatorPage.tsx', varName: 'salesTaxGraphic' },
  { file: 'MortgagePayoffPage.tsx', varName: 'heroGraphic' },
  { file: 'SalaryCalculatorPage.tsx', varName: 'figmaSalaryGraphic' },
  { file: 'CollegeCostCalculatorPage.tsx', varName: 'heroGraphic' },
]

let changed = 0
let noChange = 0

for (const { file, varName } of pages) {
  const filePath = join(pagesDir, file)
  let content = readFileSync(filePath, 'utf8')
  const original = content

  // 1. Remove the remote Figma URL const line
  const constPattern = new RegExp(
    `(const|let) ${varName} = ['"]https://www\\.figma\\.com/api/mcp/asset/[^'"]+['"]\n?`,
    'g'
  )
  content = content.replace(constPattern, '')

  // 2. Add heroGraphicSvg import if not already present
  if (!content.includes("from '../assets/hero-graphic.svg'")) {
    // Insert after the block of import statements at the top
    content = content.replace(/(^import .+\n)+/m, (match) => match + IMPORT_STMT + '\n')
  }

  // 3. Replace src={varName} with src={heroGraphicSvg}
  content = content.replace(new RegExp(`src=\\{${varName}\\}`, 'g'), 'src={heroGraphicSvg}')

  // 4. Normalise the className on the hero graphic <img> element.
  //    Matches the className attribute string containing w-[868px] and h-[883px].
  content = content.replace(
    /className="(pointer-events-none absolute [^"]*(?:w-\[868px\]|h-\[883px\])[^"]*|hidden xl:block absolute [^"]*(?:w-\[868px\]|h-\[883px\])[^"]*)"/g,
    `className="${STANDARD_CLASS}"`
  )

  if (content !== original) {
    writeFileSync(filePath, content, 'utf8')
    console.log(`✓ Fixed: ${file}`)
    changed++
  } else {
    console.log(`⚠  Unchanged: ${file}`)
    noChange++
  }
}

console.log(`\nResult: ${changed} fixed, ${noChange} unchanged`)
