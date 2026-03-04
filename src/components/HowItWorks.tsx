import React from 'react'

const imgGroup = 'https://www.figma.com/api/mcp/asset/834b781c-6ccd-462c-a393-d629ddd06eb7'
const imgGroup1 = 'https://www.figma.com/api/mcp/asset/ffa2635d-f60f-47ce-a31e-c1e6d50b4560'
const imgGroup2 = 'https://www.figma.com/api/mcp/asset/2d766cae-83cf-496e-85e9-24f77101497b'

function StepCard({
  index,
  image,
  title,
  body,
  paddingClass = 'p-[20px]',
  indexLeft = 'left-[310px]'
}: {
  index: string
  image: string
  title: string
  body: string
  paddingClass?: string
  indexLeft?: string
}){
  return (
    <div className={`relative bg-alt border border-cardBorder rounded-[10px] ${paddingClass} w-full h-full overflow-hidden`}> 
      <div className={`-translate-y-1/2 absolute flex flex-col font-['Figtree:Black',sans-serif] font-black justify-center leading-[0] top-[121px] text-[#e5e7eb] text-[100px] whitespace-nowrap ${indexLeft}`}>
        <p className="leading-[normal]">{index}</p>
      </div>

      <div className="flex items-start gap-4 z-10">
        <img src={image} alt="icon" className="w-[42px] h-[42px]" />
        <div>
          <h3 className="text-[23px] text-heading font-medium font-figtree">{title}</h3>
          <p className="text-[16px] text-body leading-[25.6px] mt-2 max-w-lg">{body}</p>
        </div>
      </div>
    </div>
  )
}

export default function HowItWorks(){
  return (
    <section className="bg-alt py-10">
      <div className="container mx-auto px-6 text-center">
        <h2 className="text-[40px] text-heading font-semibold font-figtree">How It Work’s</h2>
        <p className="text-[16px] text-sub leading-[25.6px] mt-3 max-w-2xl mx-auto">Follow three simple steps to quickly calculate loans, investments, savings, and other financial estimates with accurate results.</p>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
          <StepCard
            index="01"
            image={imgGroup}
            title="Choose a Calculator"
            body="Select the financial calculator you need, such as loan, investment, tax, or savings calculators."
            paddingClass="p-[20px]"
            indexLeft="left-[310px]"
          />

          <StepCard
            index="02"
            image={imgGroup1}
            title="Enter Financial Details"
            body="Fill in values like amount, interest rate, or time period to process accurate calculations."
            paddingClass="px-[42px] py-[30px]"
            indexLeft="left-[293px]"
          />

          <StepCard
            index="03"
            image={imgGroup2}
            title="View Results Instantly"
            body="Get clear payment breakdowns and projections to make smarter financial decisions instantly."
            paddingClass="px-[42px] py-[30px]"
            indexLeft="left-[296px]"
          />
        </div>
      </div>
    </section>
  )
}
