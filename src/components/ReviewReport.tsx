import { deriveDealMetrics, formatCurrency, missingDealTerms, packetDefinitions, parseNumber } from '../lib/deal'
import type { ContractReview, DealTerms } from '../types'

interface ReviewReportProps {
  review: ContractReview
}

const valueOrDash = (value: string, prefix = '', suffix = '') =>
  value ? `${prefix}${value}${suffix}` : 'Not captured'

const sourceText = (documentName: string | undefined, page: number) =>
  `${documentName ? `${documentName}, ` : ''}page ${page}`

const dealSourceLabels: Partial<Record<keyof DealTerms, string>> = {
  cashPrice: 'cash price',
  financedAmount: 'amount financed',
  aprPercent: 'APR',
  termYears: 'term',
  monthlyPayment: 'starting payment',
  laterMonthlyPayment: 'later payment',
  expectedPrepayment: 'expected prepayment',
  ppaRate: 'PPA rate',
  annualEscalatorPercent: 'escalator',
  systemSizeKw: 'system size',
  annualProductionKwh: 'production',
}

export function ReviewReport({ review }: ReviewReportProps) {
  const metrics = deriveDealMetrics(review.deal)
  const missing = missingDealTerms(review.deal)
  const unresolved = review.findings.filter((finding) => finding.status === 'open')
  const packetGaps = review.packet.filter((item) => item.status === 'missing' || item.status === 'unknown')
  const groupedDealSources = new Map<string, string[]>()
  for (const key of Object.keys(dealSourceLabels) as Array<keyof DealTerms>) {
    const source = review.dealSources[key]
    const label = dealSourceLabels[key]
    if (!source || !label) continue
    const sourceName = sourceText(source.documentName, source.page)
    groupedDealSources.set(sourceName, [...(groupedDealSources.get(sourceName) ?? []), label])
  }
  const arithmeticCards = review.deal.ownership === 'ppa'
    ? [
        {
          label: 'Starting PPA rate',
          value: parseNumber(review.deal.ppaRate) === undefined ? 'Not available' : `$${parseNumber(review.deal.ppaRate)?.toFixed(4)}/kWh`,
          note: 'entered contract energy rate',
        },
        {
          label: 'Year 10 PPA rate',
          value: metrics.yearTenPpaRate === undefined ? 'Not available' : `$${metrics.yearTenPpaRate.toFixed(4)}/kWh`,
          note: 'entered annual escalator',
        },
        {
          label: 'Year 1 solar payment',
          value: metrics.yearOneSolarMonthly === undefined ? 'Not available' : `${formatCurrency(metrics.yearOneSolarMonthly, 2)}/month`,
          note: 'entered rate and production',
        },
        {
          label: 'Nominal PPA energy payments',
          value: metrics.nominalEscalatingPayments === undefined ? 'Not available' : formatCurrency(metrics.nominalEscalatingPayments),
          note: 'no discounting or degradation',
        },
      ]
    : review.deal.ownership === 'lease'
      ? [
          {
            label: 'Starting lease payment',
            value: parseNumber(review.deal.monthlyPayment) === undefined ? 'Not available' : `${formatCurrency(parseNumber(review.deal.monthlyPayment) ?? 0, 2)}/month`,
            note: 'entered contract payment',
          },
          {
            label: 'Year 10 lease payment',
            value: metrics.yearTenSolarMonthly === undefined ? 'Not available' : `${formatCurrency(metrics.yearTenSolarMonthly, 2)}/month`,
            note: 'entered annual escalator',
          },
          {
            label: 'Cash alternative per watt',
            value: metrics.cashCostPerWatt === undefined ? 'Not available' : `$${metrics.cashCostPerWatt.toFixed(2)}`,
            note: 'cash price / system watts',
          },
          {
            label: 'Nominal lease payments',
            value: metrics.nominalEscalatingPayments === undefined ? 'Not available' : formatCurrency(metrics.nominalEscalatingPayments),
            note: 'no discounting',
          },
        ]
      : [
          {
            label: 'Financing difference',
            value: metrics.financingPremium === undefined ? 'Not available' : formatCurrency(metrics.financingPremium),
            note: metrics.financingPremiumPercent === undefined ? 'Needs cash and financed prices' : `${metrics.financingPremiumPercent}% over cash`,
          },
          {
            label: review.deal.ownership === 'cash' ? 'Cash cost per watt' : 'Financed cost per watt',
            value: review.deal.ownership === 'cash'
              ? metrics.cashCostPerWatt === undefined ? 'Not available' : `$${metrics.cashCostPerWatt.toFixed(2)}`
              : metrics.financedCostPerWatt === undefined ? 'Not available' : `$${metrics.financedCostPerWatt.toFixed(2)}`,
            note: review.deal.ownership === 'cash' ? 'cash price / system watts' : 'amount financed / system watts',
          },
          {
            label: 'Standard amortized payment',
            value: metrics.standardLoanPayment === undefined ? 'Not available' : `${formatCurrency(metrics.standardLoanPayment, 2)}/month`,
            note: 'mathematical reference',
          },
          {
            label: 'Schedule without expected prepayment',
            value: metrics.noPrepaymentScheduledOutlay === undefined ? 'Not available' : formatCurrency(metrics.noPrepaymentScheduledOutlay),
            note: 'using entered payment steps',
          },
        ]

  return (
    <article className="review-report print-only">
      <header>
        <div>
          <p>Solar Plainly homeowner review</p>
          <h1>{review.name}</h1>
          <span>Prepared {new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(new Date())}</span>
        </div>
        <div className="report-status">
          <strong>{missing.length}</strong>
          <span>deal numbers missing</span>
        </div>
      </header>

      <section className="report-keep-together">
        <h2>Deal snapshot</h2>
        <table>
          <tbody>
            <tr><th>Ownership type</th><td>{review.deal.ownership}</td><th>System size</th><td>{valueOrDash(review.deal.systemSizeKw, '', ' kW DC')}</td></tr>
            <tr><th>Cash price</th><td>{valueOrDash(review.deal.cashPrice, '$')}</td><th>Amount financed</th><td>{valueOrDash(review.deal.financedAmount, '$')}</td></tr>
            <tr><th>APR / term</th><td>{valueOrDash(review.deal.aprPercent, '', '%')} / {valueOrDash(review.deal.termYears, '', ' years')}</td><th>First-year production</th><td>{valueOrDash(review.deal.annualProductionKwh, '', ' kWh')}</td></tr>
            <tr><th>Starting payment</th><td>{valueOrDash(review.deal.monthlyPayment, '$', '/month')}</td><th>Later payment</th><td>{valueOrDash(review.deal.laterMonthlyPayment, '$', '/month')}</td></tr>
            <tr><th>Expected prepayment</th><td>{valueOrDash(review.deal.expectedPrepayment, '$')}</td><th>Payment change</th><td>{valueOrDash(review.deal.paymentChangeMonth, 'Month ')}</td></tr>
            {(review.deal.ownership === 'lease' || review.deal.ownership === 'ppa') && (
              <tr><th>Annual escalator</th><td>{valueOrDash(review.deal.annualEscalatorPercent, '', '%')}</td><th>Starting PPA rate</th><td>{review.deal.ownership === 'ppa' ? valueOrDash(review.deal.ppaRate, '$', '/kWh') : 'Not applicable'}</td></tr>
            )}
          </tbody>
        </table>
        {groupedDealSources.size > 0 && (
          <div className="report-deal-sources">
            <strong>Term sources</strong>
            {[...groupedDealSources.entries()].map(([source, labels]) => <span key={source}>{source}: {labels.join(', ')}</span>)}
          </div>
        )}
      </section>

      <section className="report-keep-together">
        <h2>Arithmetic checks</h2>
        <div className="report-metrics">
          {arithmeticCards.map((card) => <div key={card.label}><span>{card.label}</span><strong>{card.value}</strong><small>{card.note}</small></div>)}
        </div>
        <p className="report-footnote">{metrics.financingPremium !== undefined ? 'A financing difference is not proof of a dealer fee. ' : ''}Arithmetic checks are not savings forecasts or legal, tax, financial, or engineering advice.</p>
      </section>

      <section className="report-keep-together">
        <h2>Missing before comparison</h2>
        {missing.length ? <ul>{missing.map((item) => <li key={item}>{item}</li>)}</ul> : <p>Core comparison numbers are captured. This is not a recommendation to sign.</p>}
      </section>

      <section className="report-questions-section">
        <h2>Open questions</h2>
        {unresolved.length ? unresolved.map((finding) => (
          <div className="report-question" key={finding.id}>
            <span>{finding.category} / {finding.severity === 'important' ? 'Needs an answer' : 'Worth confirming'}</span>
            <h3>{finding.title}</h3>
            <p><strong>Ask:</strong> {finding.question}</p>
            {finding.source && <p><strong>Source:</strong> {sourceText(finding.source.documentName, finding.source.page)}: "{finding.source.excerpt}"</p>}
            {finding.note && <p><strong>Your note:</strong> {finding.note}</p>}
          </div>
        )) : <p>No open questions remain in this review.</p>}
      </section>

      <section className="report-keep-together">
        <h2>Packet gaps</h2>
        {packetGaps.length ? (
          <table>
            <tbody>
              {packetGaps.map((item) => {
                const definition = packetDefinitions.find((entry) => entry.key === item.key)
                return <tr key={item.key}><th>{definition?.label}</th><td>{item.status === 'missing' ? 'Missing' : 'Not confirmed'}{item.note ? ` - ${item.note}` : ''}</td></tr>
              })}
            </tbody>
          </table>
        ) : <p>No packet gaps are currently marked.</p>}
      </section>

      <footer>
        Solar Plainly uses local text extraction and deterministic rules. It can miss terms, attachments, scans, or context. Verify the complete agreement and seek qualified independent advice where appropriate.
      </footer>
    </article>
  )
}
