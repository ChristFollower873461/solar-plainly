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
