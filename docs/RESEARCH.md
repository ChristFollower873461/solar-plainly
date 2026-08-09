# Research Record

Research date: 2026-08-09

This is product research, not legal trademark clearance or professional advice.

## Naming

### Rejected: SoOpenSolar

OpenSolar is an active solar design, proposal, and sales platform. A name containing the complete word "OpenSolar" would imply affiliation, create search confusion, and make an independent homeowner product harder to distinguish.

### Rejected: HonestSolar

The concept fits the mission but the name is already crowded by active solar businesses, including:

- [Honest Solar](https://honest.solar/Home)
- [Honest Solar in Texas](https://www.myhonestsolar.com/)
- [Honest Solar in the United Kingdom](https://honestsolar.com/)

### Selected working name: Solar Plainly

Point-in-time checks found:

- no exact-name GitHub repository in public search;
- no exact-name npm package;
- no exact-name U.S. App Store result;
- no RDAP registration record for `solarplainly.com`, `solarplainly.org`, or `solarplainly.app` at the time checked;
- no obvious exact phrase result in general web or indexed federal trademark searches.

These are preliminary knockout checks only. The [USPTO recommends searching exact wording, similar wording, spelling, pronunciation, and related goods and services](https://www.uspto.gov/trademarks/search/federal-trademark-searching). Counsel should complete clearance before material brand investment.

## Consumer Problem Evidence

### Financing complexity

The [Consumer Financial Protection Bureau's 2024 issue spotlight](https://www.consumerfinance.gov/data-research/research-reports/issue-spotlight-solar-financing/) identified solar-specific loan risks including hidden dealer fees, tax-credit assumptions, payment increases tied to voluntary prepayments, and misleading savings claims. The report says some hidden markups increased principal by 30% or more over cash price.

Product response:

- separate possible cash price from financed amount;
- flag tax-credit and payment-reset language;
- flag transfer, payoff, and security-interest language;
- calculate the difference, cost per watt, payment jump, and reference amortization with visible formulas;
- never calculate whether financing is "good."

### Contract pressure and incomplete disclosure

The [FTC advises solar shoppers](https://consumer.ftc.gov/consumer-alerts/2024/09/solar-energy-rising-popularity-so-are-scams) to slow down, see the complete agreement, and inspect warranties, cancellation policies, payment schedules, and hidden fees. The [FTC Cooling-Off Rule](https://www.ftc.gov/legal-library/browse/rules/cooling-period-sales-made-home-or-other-locations) covers qualifying door-to-door sales and requires cancellation disclosures, but applicability depends on the transaction.

Product response:

- create questions rather than legal deadlines or conclusions;
- check for cancellation instructions but tell the user to verify applicability;
- avoid a green safety score that could encourage signing.

### A contract is a packet, not one PDF

The [California Public Utilities Commission's 2026 Solar Consumer Protection Guide](https://www.cpuc.ca.gov/-/media/cpuc-website/divisions/energy-division/documents/solar-guide/2025-versions/2025-updates/solarguide26_040626_textboxes.pdf) distinguishes the consumer guide, installation contract, financing agreement, disclosure documents, equipment and warranty information, and utility interconnection paperwork. It also surfaces total and monthly costs, financing terms, escalators, transfer obligations, and cancellation rights. California requirements are not universal law, but this is strong evidence that a one-file keyword scan is not a sufficient homeowner workflow.

Product response:

- accept a multi-document packet while preserving document and page provenance;
- show a document checklist separately from contract-language coverage;
- keep extracted terms editable and source-linked;
- produce a brief that can be discussed with the installer, lender, utility, attorney, or tax professional.

### Tax guidance changes

The product must not preserve old tax marketing as current truth. As of this research date, the [IRS says the Residential Clean Energy Credit is not available for property placed in service after December 31, 2025](https://www.irs.gov/credits-deductions/residential-clean-energy-credit), following 2025 legislation summarized by the [IRS Working Families Tax Cuts page](https://www.irs.gov/newsroom/working-families-tax-cuts).

Product response:

- flag contract tax assumptions;
- link to current IRS guidance;
- do not hard-code a credit percentage or promise eligibility.

### Long-term ownership record

The [Department of Energy's guide for buying a home with solar](https://www.energy.gov/cmei/systems/consumers-guide-buying-house-solar-panels) recommends checking warranties, obtaining historical production and monitoring access, and understanding transfer obligations. DOE notes that a year-over-year production drop above 10% can indicate a maintenance issue, while other causes remain possible.

Product response:

- system passport for equipment, warranties, production, and monitoring;
- user-initiated monitoring CSV import with monthly aggregation and replacement preview;
- issue and service history for future owners;
- 10% decline signal only after 24 monthly entries, with explicit alternative explanations;
- no roof-climbing or electrical repair instructions.

## Competitive Landscape

### Quote comparison

[EnergySage](https://www.energysage.com/market-process/) standardizes quotes from its installer marketplace and supports pre-purchase comparison. Solar Plainly is installer-independent, accepts an agreement the homeowner already has, does not sell leads, and continues after installation.

### Installer design and proposal software

[OpenSolar](https://www.opensolar.com/) supports solar professionals with design, proposals, and sales workflows. That is a different customer and incentive structure from a local homeowner record.

### Vendor monitoring

[mySolarEdge](https://www.solaredge.com/us/products/software-tools/mysolaredge) and the [Enphase App](https://enphase.com/homeowners/enphase-app) provide production and device monitoring for their own ecosystems. Solar Plainly does not replace telemetry; it provides a vendor-neutral history and document layer that survives installer or equipment changes.

### Product gap

The opportunity is the connection between two moments that existing tools often split:

1. Understand the binding agreement before signing.
2. Preserve the final system record for the life of the home.

## Interface Research

Refero research covered more than 70 real screens across document upload, personal finance dashboards, source-linked analysis, equipment details, maintenance schedules, privacy controls, and onboarding.

Patterns adopted:

- a small number of durable navigation destinations;
- a clear next action instead of a marketing dashboard;
- document upload with file type and size boundaries visible before selection;
- findings as a review queue with source excerpts, notes, and resolution state;
- structured details in compact rows, not decorative nested cards;
- explicit local-data status and destructive erase confirmation;
- mobile bottom navigation for repeated tasks.

Visual reference lock:

- Primary foundation: N26-like high-contrast ledger structure, white surfaces, thin dividers, restrained radius, and one green action color.
- Borrowed detail: Fruitful's calm green trust signal and gentle tinted surfaces.
- Borrowed detail: Open Collective's small humanizing illustration role, applied here as a custom document-and-sun icon.
- Rejected: purple AI gradients, oversized marketing heroes, dark command-center styling, floating card sections, and generic sustainability leaves.

## Safety and Product Decisions

- Local deterministic analysis is the default because it is inspectable, inexpensive, and private.
- Findings use "needs an answer" and "worth confirming," not danger scores.
- Every positive match keeps page and excerpt provenance.
- Every negative match says "could not find" and explains extraction limitations.
- Imported backup data is schema-validated before replacement.
- Contract files, complete packets, monitoring CSVs, saved files, and backups have separate size limits.
- The PWA has no public API, authentication, billing, or tenant data.
- Optional AI analysis belongs in a future plugin boundary, never as a hidden default.

## Research Gaps

- Formal U.S. and international trademark clearance.
- State-by-state disclosure and cancellation requirements.
- Contract-language recall and precision across a representative corpus.
- Accessibility testing with screen-reader users.
- Homeowner comprehension testing across literacy and language levels.
- Installer-failure and home-transfer journey interviews.
