import type { SolarData } from '../types'

const isoDate = (date: Date) => date.toISOString().slice(0, 10)

const monthsFromNow = (months: number) => {
  const date = new Date()
  date.setMonth(date.getMonth() + months)
  return isoDate(date)
}

export const createInitialData = (): SolarData => ({
  schemaVersion: 2,
  updatedAt: new Date().toISOString(),
  profile: {
    nickname: '',
    location: '',
    ownership: 'unknown',
    systemSizeKw: '',
    expectedAnnualKwh: '',
    installer: '',
    utility: '',
    permissionToOperateDate: '',
    monitoringUrl: '',
    notes: '',
  },
  reviews: [],
  equipment: [],
  documents: [],
  tasks: [
    {
      id: crypto.randomUUID(),
      title: 'Check the monitoring app for alerts',
      dueDate: monthsFromNow(1),
      frequency: 'monthly',
      completedAt: null,
      notes: 'Compare current output with the same season last year when possible.',
    },
    {
      id: crypto.randomUUID(),
      title: 'Visually inspect panels from the ground',
      dueDate: monthsFromNow(6),
      frequency: 'twice-yearly',
      completedAt: null,
      notes: 'Look for obvious damage, debris, new shade, or loose visible components. Do not climb onto the roof.',
    },
    {
      id: crypto.randomUUID(),
      title: 'Review warranties and installer contact details',
      dueDate: monthsFromNow(12),
      frequency: 'yearly',
      completedAt: null,
      notes: 'Confirm you still know who to call and where the claim instructions are stored.',
    },
  ],
  production: [],
  issues: [],
})

export const sampleContractPages = [
  {
    number: 1,
    documentName: 'Sunfield purchase agreement.pdf',
    text: `SUNFIELD HOME ENERGY AGREEMENT - SAMPLE ONLY
Customer purchases a 9.6 kW DC photovoltaic system. The estimated cash price is $31,500. Estimated first-year production is 13,800 kWh. This sample is fictional and is provided for product demonstration only.`,
  },
  {
    number: 2,
    documentName: 'Sunfield purchase agreement.pdf',
    text: `SYSTEM AND INSTALLATION
The system includes 24 HelioPeak 400W modules and one CurrentPath CP-10 inverter. Equipment may be substituted with comparable products if supply is unavailable. Unforeseen roof or electrical work may require a written change order. Installation is expected within 180 days after site approval, subject to permitting and utility delays.`,
  },
  {
    number: 3,
    documentName: 'Sunfield purchase agreement.pdf',
    text: `WARRANTIES
Modules include a 25-year manufacturer performance warranty. The inverter includes a 12-year manufacturer product warranty. Installer workmanship and roof penetrations are covered for 10 years. Labor, shipping, removal, and reinstallation are excluded from manufacturer warranties unless expressly stated by the manufacturer.`,
  },
  {
    number: 1,
    documentName: 'Sunfield solar loan agreement.pdf',
    text: `LOAN DISCLOSURE - SAMPLE ONLY
The total financed amount is $42,900 with no down payment. The loan term is 25 years at 3.99% APR. The starting monthly payment is $159.00. The payment calculation assumes a voluntary prepayment of $12,870 by month 18.`,
  },
  {
    number: 2,
    documentName: 'Sunfield solar loan agreement.pdf',
    text: `PAYMENTS AND TAX ASSUMPTIONS
If the expected prepayment is not made, the monthly payment increases to $231.00 beginning in month 19. Tax incentives are not guaranteed and depend on individual eligibility. Customer should consult a qualified tax professional.`,
  },
  {
    number: 3,
    documentName: 'Sunfield solar loan agreement.pdf',
    text: `SALE, SECURITY INTEREST, AND DISPUTES
Lender may file a UCC-1 fixture filing covering the solar equipment. Customer must notify lender before sale of the home. Transfer is subject to buyer credit approval or payoff. Any dispute will be resolved by binding arbitration, and both parties waive participation in a class action.`,
  },
  {
    number: 1,
    documentName: 'Sunfield disclosure and cancellation.pdf',
    text: `CANCELLATION AND OPERATIONS
Customer may cancel as described in the attached Notice of Cancellation. Installer will submit interconnection documents, but utility permission to operate is not guaranteed by a specific date. Monitoring requires home internet service. Production values are estimates and are not a guarantee of utility-bill savings.`,
  },
]
