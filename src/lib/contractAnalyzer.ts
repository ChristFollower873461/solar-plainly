import type {
  ContractFact,
  ContractFinding,
  ContractPage,
  CoverageItem,
  FindingSeverity,
} from '../types'

interface FindingRule {
  id: string
  category: string
  title: string
  explanation: string
  question: string
  severity: FindingSeverity
  pattern: RegExp
}

interface CoverageRule {
  id: string
  label: string
  guidance: string
  pattern: RegExp
}

const findingRules: FindingRule[] = [
  {
    id: 'tax-credit-assumption',
    category: 'Financing',
    title: 'Tax credit language affects the payment story',
    explanation:
      'Tax rules and individual eligibility can change. A quoted credit is not the same as cash you are guaranteed to receive, and some loans expect a large early payment.',
    question:
      'Show me the payment schedule with no tax-credit prepayment, and identify every assumption used in the quoted payment.',
    severity: 'important',
    pattern: /tax\s+(?:credit|incentive)|investment\s+tax\s+credit|\bITC\b/i,
  },
  {
    id: 'payment-reset',
    category: 'Financing',
    title: 'The payment may change after an introductory period',
    explanation:
      'Some solar loans re-amortize or increase the required payment if a voluntary prepayment is not made. Confirm both payment paths before signing.',
    question:
      'What is my exact monthly payment before and after any re-amortization, with and without the expected prepayment?',
    severity: 'important',
    pattern: /re[- ]?amorti[sz]|payment\s+(?:will|may)\s+increase|voluntary\s+prepayment|step[- ]?up\s+payment/i,
  },
  {
    id: 'annual-escalator',
    category: 'Payments',
    title: 'The price may rise every year',
    explanation:
      'Lease and PPA escalators compound. A modest annual percentage can materially change the payment or energy rate later in the term.',
    question:
      'Show me the payment or energy rate in years 1, 10, 15, and the final year, including every escalator.',
    severity: 'important',
    pattern: /annual\s+escalator|(?:increase|escalat).{0,35}(?:each|every|per)\s+year|[\d.]+%\s+(?:annual|yearly)\s+increase/i,
  },
  {
    id: 'payment-before-operation',
    category: 'Payments',
    title: 'Payments may start before the system is operating',
    explanation:
      'Loan or lease payments can begin before utility permission to operate, leaving the homeowner with both the payment and a normal utility bill.',
    question:
      'What event starts payments, and what happens if inspection, interconnection, or permission to operate is delayed?',
    severity: 'important',
    pattern: /(?:payment|loan).{0,45}(?:begin|commence|due).{0,45}(?:before|regardless\s+of).{0,35}(?:permission\s+to\s+operate|\bPTO\b|interconnection|operation)/i,
  },
  {
    id: 'balloon-payment',
    category: 'Financing',
    title: 'A balloon payment may be due',
    explanation:
      'A balloon or maturity payment can leave a large balance due after the regular payment schedule.',
    question:
      'What exact amount is expected at maturity, and show me the balance by year under the stated payment schedule.',
    severity: 'important',
    pattern: /balloon\s+payment|maturity\s+payment|remaining\s+balance.{0,35}(?:due|payable)\s+(?:at|upon)\s+maturity/i,
  },
  {
    id: 'prepayment-penalty',
    category: 'Financing',
    title: 'Early payoff may carry a charge',
    explanation:
      'A prepayment penalty or make-whole charge changes the economics of refinancing, moving, or paying the obligation off early.',
    question:
      'Is there any prepayment, early termination, make-whole, or payoff charge in any year of the agreement?',
    severity: 'important',
    pattern: /prepayment\s+penalt|early\s+(?:termination|payoff).{0,35}(?:fee|charge|penalt)|make[- ]whole/i,
  },
  {
    id: 'security-interest',
    category: 'Home sale',
    title: 'The financing may create a filing or security interest',
    explanation:
      'A UCC filing or other security interest can matter during a refinance or home sale even when it is not a lien on the house itself.',
    question:
      'What filing will be made, what property does it cover, and who pays to terminate or subordinate it for a refinance or sale?',
    severity: 'important',
    pattern: /UCC[- ]?1|fixture\s+filing|security\s+interest|mechanic(?:'s)?\s+lien|lien\s+on/i,
  },
  {
    id: 'arbitration',
    category: 'Disputes',
    title: 'Disputes may be limited to individual arbitration',
    explanation:
      'Binding arbitration and class-action waivers change where and how a dispute can be handled.',
    question:
      'Which disputes must go to arbitration, who chooses and pays the arbitrator, and can I opt out in writing?',
    severity: 'review',
    pattern: /binding\s+arbitration|class\s+action\s+waiver|waive.{0,30}(?:jury|class action)/i,
  },
  {
    id: 'equipment-substitution',
    category: 'Equipment',
    title: 'Equipment substitutions may be allowed',
    explanation:
      'A broad substitution clause can change the panel, inverter, battery, warranty, or expected output after you sign.',
    question:
      'Which exact models are guaranteed, and do I approve any substitution in writing before installation?',
    severity: 'review',
    pattern: /substitut(?:e|ion)|comparable\s+(?:equipment|product)|equivalent\s+(?:equipment|product)/i,
  },
  {
    id: 'change-orders',
    category: 'Price',
    title: 'Extra work may change the final price',
    explanation:
      'Roof, electrical, trenching, permitting, and structural discoveries can become add-ons. The process should require a clear written price and approval.',
    question:
      'List likely adders now and confirm that no change order is valid without my written approval and price.',
    severity: 'review',
    pattern: /change\s+order|additional\s+(?:cost|charge)|unforeseen\s+(?:condition|work)|price\s+adjustment/i,
  },
  {
    id: 'home-transfer',
    category: 'Home sale',
    title: 'A future home sale may require approval or payoff',
    explanation:
      'Loans, leases, and PPAs can have different transfer rules. A buyer may need to qualify, or the balance may need to be paid.',
    question:
      'Walk me through a home sale in year 3, year 10, and year 20, including fees, approval, payoff, and removal options.',
    severity: 'important',
    pattern: /sale\s+of\s+(?:the\s+)?home|sell\s+(?:the\s+)?(?:home|property)|transfer\s+(?:of\s+)?(?:this\s+)?agreement|buyer\s+credit\s+approval/i,
  },
  {
    id: 'contract-assignment',
    category: 'Who performs',
    title: 'The provider may assign the agreement',
    explanation:
      'Assignment can move servicing, payment collection, warranties, or performance duties to another company without changing the homeowner obligation.',
    question:
      'Which duties may be assigned, must I receive notice, and who remains responsible for installation and warranty work?',
    severity: 'review',
    pattern: /assign(?:ment|ed)?.{0,45}(?:agreement|contract|rights|obligations)|successors?\s+and\s+assigns/i,
  },
  {
    id: 'savings-disclaimer',
    category: 'Production',
    title: 'Savings or production may be an estimate, not a promise',
    explanation:
      'A proposal can show modeled production while the contract disclaims savings. Compare the sales promise with the binding guarantee, if any.',
    question:
      'Which production number is contractually guaranteed, how is underperformance measured, and what is the remedy?',
    severity: 'review',
    pattern: /production.{0,40}(?:estimate|not\s+(?:a\s+)?guarantee)|savings.{0,40}(?:estimate|not\s+(?:a\s+)?guarantee)|no\s+guarantee.{0,40}(?:production|savings)/i,
  },
  {
    id: 'warranty-exclusions',
    category: 'Warranties',
    title: 'Warranty costs may not all be covered',
    explanation:
      'Long equipment warranties can exclude diagnosis, labor, shipping, removal, reinstallation, or roof work.',
    question:
      'For each warranty, who pays diagnosis, labor, shipping, removal, reinstallation, and roof access?',
    severity: 'review',
    pattern: /(?:labor|shipping|removal|reinstallation|service\s+call).{0,40}(?:excluded|not\s+covered|customer\s+responsib)/i,
  },
  {
    id: 'roof-removal-cost',
    category: 'Roof',
    title: 'Future roof work may require paid removal and reinstallation',
    explanation:
      'A roof repair or replacement can require the array to be removed and reinstalled, and that work may sit outside both roof and equipment warranties.',
    question:
      'Who performs and pays for panel removal, storage, and reinstallation if the roof needs work during the contract term?',
    severity: 'review',
    pattern: /remove\s+and\s+reinstall|removal.{0,35}reinstallation|roof.{0,55}(?:customer\s+responsib|additional\s+(?:fee|cost|charge))/i,
  },
  {
    id: 'access-rights',
    category: 'Property access',
    title: 'The agreement may grant ongoing property access',
    explanation:
      'Installation and service agreements can grant the provider access rights. Understand notice, duration, and restoration obligations.',
    question:
      'When may you enter my property, how much notice is required, and who restores damage caused during access?',
    severity: 'review',
    pattern: /right\s+(?:of\s+)?access|access\s+to\s+(?:the\s+)?property|easement|enter\s+(?:the\s+)?premises/i,
  },
  {
    id: 'monitoring-dependency',
    category: 'Operations',
    title: 'Monitoring depends on connectivity or account access',
    explanation:
      'Monitoring can stop when internet service, a gateway, or account ownership changes. That may delay awareness of a fault.',
    question:
      'Who owns the monitoring account, how is it transferred, and what happens if internet service or the installer disappears?',
    severity: 'review',
    pattern: /monitoring.{0,60}(?:internet|wi-?fi|connectivity|account)|internet.{0,40}monitoring/i,
  },
]

const coverageRules: CoverageRule[] = [
  {
    id: 'price',
    label: 'Cash price and total financed amount',
    guidance: 'Ask for both numbers in writing so financing costs are visible.',
    pattern: /cash\s+price|total\s+(?:financed|contract)\s+amount|purchase\s+price/i,
  },
  {
    id: 'financing',
    label: 'APR, term, and complete payment schedule',
    guidance: 'Confirm every payment change, fee, and prepayment assumption.',
    pattern: /\bAPR\b|annual\s+percentage\s+rate|loan\s+term|payment\s+schedule/i,
  },
  {
    id: 'credit-total',
    label: 'Finance charge and total of payments',
    guidance: 'Ask for the all-in dollars paid under the complete schedule, not only the interest rate.',
    pattern: /finance\s+charge|total\s+of\s+payments|amount\s+financed/i,
  },
  {
    id: 'payment-change',
    label: 'Payment changes, prepayments, and escalators',
    guidance: 'Write down every event or annual percentage that changes the payment or energy rate.',
    pattern: /re[- ]?amorti[sz]|pre[- ]?payment|annual\s+escalator|payment.{0,30}(?:increase|change)/i,
  },
  {
    id: 'parties',
    label: 'Installer, contractor license, lender, and servicer',
    guidance: 'Identify which company owns each promise and who receives payments or service requests.',
    pattern: /contractor\s+license|license\s+(?:number|no\.)|lender|loan\s+servicer|solar\s+provider/i,
  },
  {
    id: 'ownership',
    label: 'Who owns the system and incentives',
    guidance: 'Ownership determines incentives, transfer steps, and many service obligations.',
    pattern: /customer\s+(?:purchases|owns)|system\s+owner|lease|power\s+purchase\s+agreement|\bPPA\b/i,
  },
  {
    id: 'equipment',
    label: 'Exact equipment models and quantities',
    guidance: 'Record panels, inverters, batteries, optimizers, and approved substitutions.',
    pattern: /modules?|panels?|inverters?|batter(?:y|ies)|optimizers?|racking/i,
  },
  {
    id: 'production',
    label: 'Expected production and any guarantee',
    guidance: 'Separate a modeled estimate from a binding production guarantee and remedy.',
    pattern: /kWh|production\s+(?:estimate|guarantee)|energy\s+production/i,
  },
  {
    id: 'warranty',
    label: 'Product, performance, labor, and roof warranties',
    guidance: 'A 25-year headline may cover only one component or type of failure.',
    pattern: /warrant(?:y|ies)|workmanship|roof\s+penetration/i,
  },
  {
    id: 'service',
    label: 'Service response and warranty claim process',
    guidance: 'Confirm who diagnoses problems, response times, claim steps, and uncovered labor costs.',
    pattern: /service\s+(?:request|response|department)|warranty\s+claim|repair\s+request|diagnostic/i,
  },
  {
    id: 'cancel',
    label: 'Cancellation instructions and deadline',
    guidance: 'Confirm the applicable deadline, delivery method, and address for cancellation.',
    pattern: /notice\s+of\s+cancellation|right\s+to\s+cancel|cancel(?:lation)?\s+period/i,
  },
  {
    id: 'transfer',
    label: 'Home sale, transfer, payoff, and removal',
    guidance: 'Ask for the actual process and fees, not only a statement that transfer is possible.',
    pattern: /sale\s+of\s+(?:the\s+)?home|transfer|payoff|remove\s+(?:the\s+)?system/i,
  },
  {
    id: 'roof',
    label: 'Roof work, leaks, removal, and reinstallation',
    guidance: 'Confirm responsibility before future roof replacement or leak repairs.',
    pattern: /roof|penetration|remove\s+and\s+reinstall|re-?roof/i,
  },
  {
    id: 'schedule',
    label: 'Installation, inspection, and utility milestones',
    guidance: 'Identify what happens when permitting or permission to operate is delayed.',
    pattern: /installation\s+(?:date|schedule)|permission\s+to\s+operate|\bPTO\b|interconnection|inspection/i,
  },
  {
    id: 'disputes',
    label: 'Complaint and dispute process',
    guidance: 'Know notice requirements, arbitration terms, venue, fees, and opt-out rights.',
    pattern: /dispute|arbitration|governing\s+law|venue/i,
  },
]

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim()

const excerptAround = (text: string, index: number, length: number) => {
  const flat = normalize(text)
  const start = Math.max(0, index - 90)
  const end = Math.min(flat.length, index + length + 140)
  return `${start > 0 ? '...' : ''}${flat.slice(start, end)}${end < flat.length ? '...' : ''}`
}

const sourceFor = (pages: ContractPage[], pattern: RegExp) => {
  for (const page of pages) {
    const flat = normalize(page.text)
    const match = flat.match(pattern)
    if (match?.index !== undefined) {
      return {
        page: page.number,
        excerpt: excerptAround(flat, match.index, match[0].length),
        documentName: page.documentName,
      }
    }
  }
  return undefined
}

interface FactRule {
  id: string
  label: string
  pattern: RegExp
  value: (match: RegExpMatchArray) => string
}

const factRules: FactRule[] = [
  {
    id: 'cash-price',
    label: 'Possible cash price',
    pattern: /cash\s+price(?:\s+is|\s+of|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => `$${match[1]}`,
  },
  {
    id: 'financed-amount',
    label: 'Possible financed amount',
    pattern: /(?:total\s+)?financed\s+amount(?:\s+is|\s+of|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => `$${match[1]}`,
  },
  {
    id: 'finance-charge',
    label: 'Possible finance charge',
    pattern: /finance\s+charge(?:\s+is|\s+of|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => `$${match[1]}`,
  },
  {
    id: 'total-of-payments',
    label: 'Possible total of payments',
    pattern: /total\s+of\s+payments(?:\s+is|\s+of|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => `$${match[1]}`,
  },
  {
    id: 'down-payment',
    label: 'Possible down payment',
    pattern: /no\s+down\s+payment|down\s+payment(?:\s+is|\s+of|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => match[1] ? `$${match[1]}` : '$0',
  },
  {
    id: 'apr',
    label: 'Possible APR',
    pattern: /(?:at\s+)?([\d.]+)%\s*(?:APR|annual\s+percentage\s+rate)|(?:APR|annual\s+percentage\s+rate)(?:\s+is|:)?\s*([\d.]+)%/i,
    value: (match) => `${match[1] ?? match[2]}%`,
  },
  {
    id: 'term',
    label: 'Possible financing term',
    pattern: /(?:loan\s+)?term(?:\s+is|\s+of|:)?\s*(\d{1,2})\s*years?|(?:loan|financing).{0,30}(\d{1,2})[- ]year/i,
    value: (match) => `${match[1] ?? match[2]} years`,
  },
  {
    id: 'monthly-payment',
    label: 'Possible starting payment',
    pattern: /(?:starting|initial|first).{0,24}monthly\s+payment(?:\s+is|\s+of|:)?\s*\$?([\d,]+(?:\.\d{2})?)|monthly\s+payment(?:\s+is|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => `$${match[1] ?? match[2]}`,
  },
  {
    id: 'later-monthly-payment',
    label: 'Possible later payment',
    pattern: /monthly\s+payment.{0,28}increase(?:s|d)?\s+to\s+\$?([\d,]+(?:\.\d{2})?)|payment.{0,28}(?:changes?|resets?)\s+to\s+\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => `$${match[1] ?? match[2]}`,
  },
  {
    id: 'payment-change-month',
    label: 'Possible payment-change month',
    pattern: /(?:beginning|starting)\s+(?:in\s+)?month\s+(\d{1,3})|(?:after|within)\s+(\d{1,3})\s+months?/i,
    value: (match) => `Month ${match[1] ?? Number(match[2]) + 1}`,
  },
  {
    id: 'expected-prepayment',
    label: 'Possible expected prepayment',
    pattern: /(?:voluntary\s+|expected\s+|anticipated\s+)?pre[- ]?payment(?:\s+of|\s+is|:)?\s*\$?([\d,]+(?:\.\d{2})?)/i,
    value: (match) => `$${match[1]}`,
  },
  {
    id: 'ppa-rate',
    label: 'Possible starting energy rate',
    pattern: /\$?([\d.]+)\s*(?:per|\/)\s*kWh|(?:energy|ppa)\s+rate(?:\s+is|:)?\s*\$?([\d.]+)/i,
    value: (match) => `$${match[1] ?? match[2]}/kWh`,
  },
  {
    id: 'escalator',
    label: 'Possible annual escalator',
    pattern: /([\d.]+)%\s+(?:annual|yearly).{0,24}(?:escalator|increase)|(?:annual\s+)?escalator.{0,24}([\d.]+)%/i,
    value: (match) => `${match[1] ?? match[2]}%`,
  },
  {
    id: 'system-size',
    label: 'Possible system size',
    pattern: /([\d.]+)\s*kW(?:dc|ac)?\b/i,
    value: (match) => `${match[1]} kW`,
  },
  {
    id: 'annual-production',
    label: 'Possible annual production',
    pattern: /(?:annual|first[- ]year|year\s+1).{0,40}?([\d,]+)\s*kWh|([\d,]+)\s*kWh.{0,30}(?:annual|first[- ]year|year\s+1)/i,
    value: (match) => `${match[1] ?? match[2]} kWh`,
  },
]

const extractFacts = (pages: ContractPage[]): ContractFact[] => {
  const facts: ContractFact[] = []
  for (const rule of factRules) {
    for (const page of pages) {
      const flat = normalize(page.text)
      const match = flat.match(rule.pattern)
      if (match?.index !== undefined) {
        facts.push({
          id: rule.id,
          label: rule.label,
          value: rule.value(match),
          source: {
            page: page.number,
            excerpt: excerptAround(flat, match.index, match[0].length),
            documentName: page.documentName,
          },
        })
        break
      }
    }
  }
  return facts
}

export interface ContractAnalysis {
  findings: ContractFinding[]
  facts: ContractFact[]
  coverage: CoverageItem[]
}

export const analyzeContractPages = (pages: ContractPage[]): ContractAnalysis => {
  const findings: ContractFinding[] = findingRules.flatMap((rule) => {
    const source = sourceFor(pages, rule.pattern)
    if (!source) return []
    return [
      {
        id: rule.id,
        category: rule.category,
        title: rule.title,
        explanation: rule.explanation,
        question: rule.question,
        severity: rule.severity,
        status: 'open' as const,
        source,
      },
    ]
  })

  const coverage = coverageRules.map((rule) => ({
    id: rule.id,
    label: rule.label,
    found: Boolean(sourceFor(pages, rule.pattern)),
    guidance: rule.guidance,
  }))

  const missingCritical = coverage.filter(
    (item) => !item.found && ['price', 'financing', 'warranty', 'cancel', 'transfer'].includes(item.id),
  )

  for (const item of missingCritical) {
    findings.push({
      id: `missing-${item.id}`,
      category: 'Could not find',
      title: `We could not find: ${item.label}`,
      explanation:
        'This does not prove the term is absent. It may be worded differently, contained in an attachment, or missed by text extraction.',
      question: item.guidance,
      severity: 'important',
      status: 'open',
    })
  }

  return {
    findings,
    facts: extractFacts(pages),
    coverage,
  }
}
