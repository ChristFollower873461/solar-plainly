import {
  AlertTriangle,
  Calculator,
  CircleDollarSign,
  ClipboardCheck,
  FileSearch,
  Gauge,
  Landmark,
} from 'lucide-react'
import { deriveDealMetrics, formatCurrency, missingDealTerms, parseNumber } from '../lib/deal'
import type { ContractReview, DealTerms, UpdateSolarData } from '../types'

interface DealWorkspaceProps {
  onCarryToRecord: () => void
  review: ContractReview
  update: UpdateSolarData
}

interface DealField {
  key: keyof DealTerms
  label: string
  placeholder: string
  suffix?: string
}

const priceFields: DealField[] = [
  { key: 'cashPrice', label: 'Cash price', placeholder: '31500', suffix: '$' },
  { key: 'financedAmount', label: 'Amount financed', placeholder: '42900', suffix: '$' },
  { key: 'financeCharge', label: 'Disclosed finance charge', placeholder: '26400', suffix: '$' },
  { key: 'totalOfPayments', label: 'Disclosed total of payments', placeholder: '69300', suffix: '$' },
  { key: 'downPayment', label: 'Down payment', placeholder: '0', suffix: '$' },
  { key: 'aprPercent', label: 'APR', placeholder: '3.99', suffix: '%' },
  { key: 'termYears', label: 'Term', placeholder: '25', suffix: 'years' },
]

const paymentFields: DealField[] = [
  { key: 'monthlyPayment', label: 'Starting monthly payment', placeholder: '159', suffix: '$' },
  { key: 'laterMonthlyPayment', label: 'Later monthly payment', placeholder: '231', suffix: '$' },
  { key: 'paymentChangeMonth', label: 'Payment changes in month', placeholder: '19' },
  { key: 'expectedPrepayment', label: 'Expected lump-sum prepayment', placeholder: '12870', suffix: '$' },
  { key: 'ppaRate', label: 'Starting PPA energy rate', placeholder: '0.18', suffix: '$/kWh' },
  { key: 'annualEscalatorPercent', label: 'Annual solar escalator', placeholder: '2.9', suffix: '%' },
]

const systemFields: DealField[] = [
  { key: 'systemSizeKw', label: 'System size', placeholder: '9.6', suffix: 'kW DC' },
  { key: 'annualProductionKwh', label: 'First-year production', placeholder: '13800', suffix: 'kWh' },
  { key: 'currentUtilityBill', label: 'Current average utility bill', placeholder: '240', suffix: '$/month' },
  { key: 'remainingUtilityBill', label: 'Expected utility bill after solar', placeholder: '45', suffix: '$/month' },
  { key: 'utilityEscalatorPercent', label: 'Utility-rate change assumption', placeholder: '3', suffix: '%/year' },
]

const sourceLabel = (review: ContractReview, key: keyof DealTerms) => {
  const source = review.dealSources[key]
  if (!source) return 'Entered by you'
  return `${source.documentName ? `${source.documentName}, ` : ''}page ${source.page}`
}

const displayMoney = (value?: number, digits = 0) =>
  value === undefined ? '-' : formatCurrency(value, digits)

const displayEnteredMoney = (value: string) => {
  const parsed = parseNumber(value)
  return parsed === undefined ? '-' : formatCurrency(parsed)
}

export function DealWorkspace({ onCarryToRecord, review, update }: DealWorkspaceProps) {
  const metrics = deriveDealMetrics(review.deal)
  const missing = missingDealTerms(review.deal)

  const updateDeal = (key: keyof DealTerms, value: string) => {
    update((draft) => {
      const target = draft.reviews.find((item) => item.id === review.id)
      if (!target) return
      target.deal[key] = value as never
      if (key === 'ownership' && value === 'cash') {
        const financing = target.packet.find((item) => item.key === 'financing-agreement')
        if (financing && financing.status === 'unknown') financing.status = 'not-applicable'
      }
      if (key === 'ownership' && value !== 'cash') {
        const financing = target.packet.find((item) => item.key === 'financing-agreement')
        if (financing?.status === 'not-applicable') financing.status = 'unknown'
      }
    })
  }

  const renderFields = (fields: DealField[]) => (
    <div className="deal-field-grid">
      {fields.map((field) => (
        <label className="deal-field" key={field.key}>
          <span>{field.label}</span>
          <div className="unit-input">
            {field.suffix === '$' && <em>$</em>}
            <input
              aria-label={field.label}
              inputMode="decimal"
              onChange={(event) => updateDeal(field.key, event.target.value)}
              placeholder={field.placeholder}
              value={review.deal[field.key]}
            />
            {field.suffix && field.suffix !== '$' && <em>{field.suffix}</em>}
          </div>
          <small className={review.dealSources[field.key] ? 'extracted-source' : ''}>
            {sourceLabel(review, field.key)}
          </small>
        </label>
      ))}
    </div>
  )

  const hasMath = Object.values(metrics).some((value) => value !== undefined)

  return (
    <div className="deal-workspace">
      <section className={`deal-status-band ${missing.length ? 'incomplete' : 'complete'}`}>
        <div>
          <p className="eyebrow">Comparison status</p>
          <h3>{missing.length ? `${missing.length} deal numbers still missing` : 'Core deal numbers captured'}</h3>
          <p>
            {missing.length
              ? `Add ${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ', and the remaining fields' : ''} before comparing this offer with another.`
              : 'The economics can now be compared. This does not mean the agreement is ready to sign.'}
          </p>
        </div>
        <div className="deal-status-actions">
          <button className="secondary-button" onClick={onCarryToRecord} type="button"><ClipboardCheck size={17} /> Carry into system record</button>
          <div className={missing.length ? 'status-count incomplete' : 'status-count complete'}>
            <strong>{missing.length}</strong>
            <span>missing</span>
          </div>
        </div>
      </section>

      <section className="deal-snapshot" aria-labelledby="deal-snapshot-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">The offer in dollars</p>
            <h3 id="deal-snapshot-title">Deal snapshot</h3>
          </div>
        </div>
        <div className="deal-metric-row">
          <div><span>Cash price</span><strong>{displayEnteredMoney(review.deal.cashPrice)}</strong></div>
          <div><span>Amount financed</span><strong>{displayEnteredMoney(review.deal.financedAmount)}</strong></div>
          <div className={metrics.financingPremium && metrics.financingPremium > 0 ? 'attention' : ''}>
            <span>Financing difference</span>
            <strong>{displayMoney(metrics.financingPremium)}</strong>
            <small>{metrics.financingPremiumPercent === undefined ? 'Needs both prices' : `${metrics.financingPremiumPercent}% over cash`}</small>
          </div>
          <div><span>Financed cost per watt</span><strong>{metrics.financedCostPerWatt === undefined ? '-' : `$${metrics.financedCostPerWatt.toFixed(2)}`}</strong></div>
        </div>
        {metrics.financingPremium !== undefined && metrics.financingPremium > 0 && (
          <p className="math-caveat">
            The difference between financed and cash price may include financing markup, project changes, or other charges. It is not proof of a dealer fee; ask for an itemized reconciliation.
          </p>
        )}
      </section>

      <section className="deal-input-section" aria-labelledby="deal-terms-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Editable and source-linked</p>
            <h3 id="deal-terms-title">Terms that drive the deal</h3>
          </div>
          <span className="source-legend"><FileSearch size={15} /> Blue labels link to packet sources</span>
        </div>

        <div className="deal-identity-row">
          <label className="deal-field">
            <span>Ownership and payment type</span>
            <select
              aria-label="Ownership and payment type"
              onChange={(event) => updateDeal('ownership', event.target.value)}
              value={review.deal.ownership}
            >
              <option value="unknown">Choose one</option>
              <option value="cash">Cash purchase</option>
              <option value="loan">Loan</option>
              <option value="lease">Lease</option>
              <option value="ppa">Power purchase agreement</option>
            </select>
            <small>{sourceLabel(review, 'ownership')}</small>
          </label>
          <label className="deal-field">
            <span>Installer</span>
            <input aria-label="Installer on contract" onChange={(event) => updateDeal('installer', event.target.value)} placeholder="Company on the installation contract" value={review.deal.installer} />
            <small>{sourceLabel(review, 'installer')}</small>
          </label>
          <label className="deal-field">
            <span>Lender or contract owner</span>
            <input aria-label="Lender or contract owner" onChange={(event) => updateDeal('lender', event.target.value)} placeholder="Company receiving payments" value={review.deal.lender} />
            <small>{sourceLabel(review, 'lender')}</small>
          </label>
        </div>

        <details className="deal-field-group" open>
          <summary><CircleDollarSign size={18} /> Price and financing</summary>
          {renderFields(priceFields)}
        </details>
        <details className="deal-field-group" open>
          <summary><Landmark size={18} /> Payment changes</summary>
          {renderFields(paymentFields)}
        </details>
        <details className="deal-field-group">
          <summary><Gauge size={18} /> System and utility assumptions</summary>
          {renderFields(systemFields)}
        </details>
      </section>

      <section className="deal-math-section" aria-labelledby="deal-math-title">
        <div className="section-heading compact">
          <div>
            <p className="eyebrow">Transparent arithmetic</p>
            <h3 id="deal-math-title">What the entered numbers imply</h3>
          </div>
          <Calculator size={24} />
        </div>

        {!hasMath ? (
          <div className="empty-message compact-empty">
            <Calculator size={22} />
            <h3>Add the deal numbers above</h3>
            <p>The calculations appear only when their required inputs are present.</p>
          </div>
        ) : (
          <div className="math-ledger">
            {metrics.cashCostPerWatt !== undefined && (
              <div><span>Cash cost per watt</span><strong>${metrics.cashCostPerWatt.toFixed(2)}</strong><small>cash price / system watts</small></div>
            )}
            {metrics.standardLoanPayment !== undefined && (
              <div><span>Standard amortized payment</span><strong>{displayMoney(metrics.standardLoanPayment, 2)}/mo</strong><small>amount financed, APR, and full term</small></div>
            )}
            {metrics.standardLoanTotal !== undefined && (
              <div><span>Standard amortized total</span><strong>{displayMoney(metrics.standardLoanTotal)}</strong><small>mathematical reference, not the contract disclosure</small></div>
            )}
            {metrics.paymentJump !== undefined && (
              <div className="attention"><span>Stated payment increase</span><strong>+{displayMoney(metrics.paymentJump, 2)}/mo</strong><small>{metrics.paymentJumpPercent}% increase</small></div>
            )}
            {metrics.noPrepaymentScheduledOutlay !== undefined && (
              <div><span>Stated schedule without lump-sum payment</span><strong>{displayMoney(metrics.noPrepaymentScheduledOutlay)}</strong><small>starting payment, later payment, change month, and term</small></div>
            )}
            {metrics.yearTenPpaRate !== undefined && (
              <div><span>Year 10 PPA energy rate</span><strong>${metrics.yearTenPpaRate.toFixed(4)}/kWh</strong><small>starting rate compounded by the entered escalator</small></div>
            )}
            {metrics.yearTenSolarMonthly !== undefined && (review.deal.ownership === 'lease' || review.deal.ownership === 'ppa') && (
              <div><span>Year 10 estimated solar payment</span><strong>{displayMoney(metrics.yearTenSolarMonthly, 2)}/mo</strong><small>{review.deal.ownership === 'ppa' ? 'entered production held constant' : 'starting payment plus annual escalator'}</small></div>
            )}
            {metrics.nominalEscalatingPayments !== undefined && (
              <div><span>Nominal {review.deal.ownership === 'ppa' ? 'PPA energy' : 'lease'} payments</span><strong>{displayMoney(metrics.nominalEscalatingPayments)}</strong><small>entered term and escalator; no discounting or degradation</small></div>
            )}
          </div>
        )}

        {parseNumber(review.deal.expectedPrepayment) !== undefined && (
          <div className="inline-alert warning">
            <AlertTriangle size={18} />
            <span>
              <strong>The payment story expects a {formatCurrency(parseNumber(review.deal.expectedPrepayment) ?? 0)} lump sum.</strong>
              Verify the complete schedule without that payment and confirm current eligibility directly with the IRS or a qualified tax professional. A credit is not guaranteed cash.
            </span>
          </div>
        )}

        {metrics.yearOneCombinedMonthly !== undefined && (
          <div className="monthly-reality">
            <div><span>Current utility bill</span><strong>{review.deal.currentUtilityBill ? `$${review.deal.currentUtilityBill}` : '-'}</strong></div>
            <div><span>Year 1 solar + utility</span><strong>{displayMoney(metrics.yearOneCombinedMonthly)}</strong></div>
            <div><span>Year 10 stated path + utility</span><strong>{displayMoney(metrics.yearTenCombinedMonthly)}</strong></div>
          </div>
        )}

        <p className="math-caveat">
          These are arithmetic checks, not savings forecasts. They do not model taxes, weather, degradation, rate design, maintenance, insurance, roof work, or the time value of money.
        </p>
      </section>
    </div>
  )
}
