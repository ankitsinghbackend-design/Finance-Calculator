import React from 'react'
import { Link } from 'react-router-dom'
import { financeMenuColumns, type FinanceMenuItem } from '../config/calculatorConfig'

function FinanceMenuLink({ item }: { item: FinanceMenuItem }) {
  if (!item.calculatorId) {
    return <span>{item.label}</span>
  }

  return (
    <Link to={`/calculators/${item.calculatorId}`} className="underline underline-offset-2 hover:text-heading transition-colors">
      {item.label}
    </Link>
  )
}

export default function Finance(){
  return (
    <section className="bg-[#f3f4f6] min-h-[calc(100vh-82px)] px-7 pb-5">
      <div className="mx-auto max-w-[1384px] rounded-[32px] border border-cardBorder bg-[#f3f4f6] px-3 py-3 md:px-4 md:py-4">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {financeMenuColumns.map((column) => (
            <div key={column.title} className="min-w-0">
              {!column.sections ? (
                <>
                  <h2 className="text-[23px] font-medium leading-tight text-heading">{column.title}</h2>
                  <ul className="mt-3 space-y-2 text-[16px] font-normal leading-tight text-body">
                    {column.items?.map((item) => (
                      <li key={item.label}><FinanceMenuLink item={item} /></li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="space-y-8">
                  {column.sections.map((section) => (
                    <div key={section.title}>
                      <h2 className="text-[23px] font-medium leading-tight text-heading">{section.title}</h2>
                      <ul className="mt-3 space-y-2 text-[16px] font-normal leading-tight text-body">
                        {section.items.map((item) => (
                          <li key={item.label}><FinanceMenuLink item={item} /></li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
