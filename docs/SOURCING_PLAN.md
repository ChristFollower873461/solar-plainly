# Evidence and Validation Sourcing Plan

Research date: 2026-08-09

This plan turns Solar Plainly's research gaps into an acquisition and validation
program. It is a product research plan, not legal advice, a license opinion, or
an assertion that any outside organization will participate.

## Executive Decision

Solar Plainly should not look for one large downloadable solar-contract
dataset. A credible evidence base has three layers with different permissions:

1. Current government and model documents establish the expected packet,
   terminology, and required disclosures.
2. Complaints, enforcement actions, and public cases establish real failure
   modes, but do not automatically grant redistribution rights.
3. Consented and de-identified homeowner packets establish whether extraction
   and explanations work on the documents people actually receive.

The raw research corpus should remain private and access-controlled. The public
repository should contain its schema, provenance manifest, aggregate results,
synthetic fixtures, and only those excerpts that have an explicit redistribution
license or a separate participant grant.

## 1. Contract And Evidence Corpus

### Layer A: official and model source pack

Target: 40 to 60 documents, refreshed at least quarterly and whenever a source
publishes a new effective date.

Start with these source directories:

- [CESA's directory of solar consumer education resources](https://www.cesa.org/resource-library/resource/a-directory-of-solar-consumer-education-resources/)
  is the best national index. It was updated July 27, 2026 and links to current
  federal and state resources, consumer protections, and state programs.
- [New York DER regulation and oversight](https://dps.ny.gov/distributed-energy-resource-der-regulation-and-oversight)
  publishes the Uniform Business Practices for DER Suppliers, on-site
  generation disclosure forms, community distributed generation forms, and
  filing instructions. The linked [DPS document search](https://documents.dps.ny.gov/search/Home/DocumentSearch2/Find/Solar)
  also contains provider-filed agreement templates.
- [Illinois Shines disclosure forms](https://illinoisshines.com/disclosure-forms/)
  provide separate examples for purchases, leases, PPAs, and community solar.
  They also provide Spanish examples for some transaction types.
- [California's Solar Consumer Protection Guide](https://www.cpuc.ca.gov/industries-and-topics/electrical-energy/demand-side-management/customer-generation/california-solar-consumer-protection-guide)
  provides the current guide, disclosure expectations, cancellation guidance,
  and multiple official translations.
- [Massachusetts SMART program materials](https://www.mass.gov/info-details/smart-30-program-details)
  provide customer disclosure forms for direct ownership, third-party
  ownership, and community shared solar.
- [NLR/SAPC example standard contracts](https://www.nlr.gov/analysis/standard-contracts-tos)
  provide residential lease language and a commercial PPA example. They have
  their own terms of use and disclaimers, so they should be tracked as a
  separately licensed source rather than assumed to be generic open data.

For every document, record:

```text
source_id
publisher
source_url
download_url
jurisdiction
transaction_type
document_type
language
published_date
effective_date
retrieved_at
license_or_terms_url
redistribution_status
sha256
page_count
born_digital_or_scan
supersedes_source_id
review_notes
```

Use these documents to define packet completeness and terminology. Do not use a
state disclosure form as proof that the same rule applies nationally.

### Layer B: failure-mode source pack

Target: 20 to 30 cases or complaint clusters. This layer builds the finding
taxonomy and adversarial tests; it is not a substitute for contract ground
truth.

- The [CFPB solar financing issue spotlight](https://www.consumerfinance.gov/data-research/research-reports/issue-spotlight-solar-financing/)
  documents hidden dealer fees, tax-credit assumptions, month-19 payment
  resets, misleading savings claims, and risks to older and limited-English
  consumers.
- The [CFPB Consumer Complaint Database](https://www.consumerfinance.gov/data-research/consumer-complaints/)
  offers downloadable complaint data and published narratives. Narratives can
  identify vocabulary and failure patterns but usually do not contain the
  underlying contract.
- The [NCLC rooftop-solar issue brief](https://www.nclc.org/wp-content/uploads/2024/02/202407_Issue-Brief_Rooftop-Solar_-Consumer-Protection-Recommendations-1.pdf)
  provides a compact issue taxonomy grounded in consumer advocacy.
- State attorney general complaints and public court exhibits can provide hard
  cases involving specific lenders, installers, sales processes, and contract
  terms. Store links and case metadata first. Copy an exhibit into the private
  corpus only after checking the docket's access rules, copyright status, and
  personal information.

The failure taxonomy should cover at least:

- cash price versus amount financed;
- dealer, platform, origination, or program fees;
- tax-credit assumptions and prepayment-driven payment resets;
- APR, term, amortization, and total nominal outlay;
- fixed payments versus lease or PPA escalators;
- production estimates versus guarantees;
- utility-bill and savings assumptions;
- warranties, exclusions, labor, roof work, and equipment replacement;
- liens, security interests, UCC filings, default, and collections;
- assignment, home sale, transfer, payoff, removal, and installer failure;
- cancellation language, arbitration, venue, and electronic signing;
- language-access mismatch and missing packet documents.

### Layer C: consented homeowner packets

Initial credible-beta target: 60 complete packets. Stronger release target: 100
packets and at least 400 individual documents.

Recruit through two channels in parallel:

1. Community partners. [Solar United Neighbors](https://solarunitedneighbors.org/help-desk/)
   already assists people who are exploring solar, comparing proposals, and
   maintaining installed systems. Its [partnership page](https://solarunitedneighbors.org/about-us/partner-with-us/)
   provides a route for organizational outreach. Its co-op program reports more
   than 11,000 participating families. The [Solar Rights Alliance](https://solarrights.org/)
   reports a California network of 150,000 solar users and supporters. Ask each
   organization to circulate an opt-in study invitation, not to hand over member
   data or documents.
2. Paid recruiting. Use User Interviews or Respondent for moderated sessions and
   Prolific for larger unmoderated comprehension studies. Paid panels should
   supplement partner recruitment because rare states, financing types, and
   distressed-system owners may not appear in a general panel naturally.

The live screener, direct-consumer channel rules, outreach copy, geographic
targeting method, campaign log, and first-wave budget are maintained in the
[consumer recruitment playbook](CONSUMER_RECRUITMENT.md).

Minimum quotas for the 60-packet credible-beta corpus:

| Dimension | Minimum target |
| --- | ---: |
| Cash purchase | 10 |
| Solar-specific loan | 24 |
| Lease | 10 |
| Rooftop PPA | 10 |
| Community solar | 6 |
| Home sale, transfer, or installer failure | 10 |
| California | 12 |
| New York | 8 |
| Illinois | 8 |
| Massachusetts or another Northeast state | 6 |
| Southeast | 10 |
| Southwest | 6 |
| Other Midwest or West | 10 |
| Spanish-first household | 10 |
| Scan, phone photo, or mixed-quality packet | 20 |

Categories may overlap. Cap any single provider or lender family at 10 percent
of the corpus. Include current packets and a separately tagged historical set;
do not mix obsolete tax or program rules into current-rule evaluation.

### Permission and privacy protocol

Public access is not an open-source license. For example, the NLR model language
has specific terms, and Illinois Shines marks its site content as all rights
reserved. Section 105 of the [U.S. Copyright Act](https://www.copyright.gov/title17/92chap1.html#105)
generally excludes works of the United States Government from copyright, but it
does not make privately authored provider contracts, state material, or
homeowner packets automatically free to redistribute.

Use separate, affirmative choices for:

1. participating in product research;
2. allowing the packet to be used for internal testing and annotation;
3. retaining a de-identified derivative after the study;
4. optionally publishing specified de-identified excerpts or test fixtures.

The default must be no public release. Never place raw signed agreements in Git.
Before storage, remove names, addresses, signatures, emails, phone numbers,
account and loan numbers, QR codes, barcodes, salesperson identifiers, document
metadata, and any unique combination that could re-identify a household.

Follow the FTC's principle to [collect only what is needed, protect it, and
dispose of it securely](https://www.ftc.gov/business-guidance/privacy-security).
Use [NIST SP 800-188](https://csrc.nist.gov/pubs/sp/800/188/final) to distinguish
masking from genuine de-identification and to choose between publication,
synthetic data, and a protected enclave. A reasonable starting policy is:

- encrypted storage with named-user access and an access log;
- raw packet deletion after 90 days unless the participant selected longer
  internal retention;
- immediate deletion on withdrawal where technically and legally possible;
- no document text in analytics, crash reports, logs, or issue trackers;
- a second-person privacy check before any excerpt enters the public fixtures.

### Annotation and evaluation split

Use self-hosted [doccano](https://github.com/doccano/doccano), which is MIT
licensed, for clause spans and text labels. Keep the page image, bounding boxes,
and provenance manifest in a separate local evaluation harness.

Each gold packet should be independently reviewed by two annotators. Adjudicate
disagreements and record the final reason. Freeze 20 percent as a holdout before
tuning rules. Keep provider families separated where practical so near-duplicate
templates do not leak from development into the holdout.

Gold labels must include:

- document type and packet-presence labels;
- exact value, unit, page, and source span for every extracted deal term;
- clause present, clause not found, and unreadable/indeterminate as distinct
  states;
- whether a finding is supported, unsupported, or ambiguous;
- every critical numeric token: currency, percentage, rate, date, duration,
  payment, kW, kWh, and annual production.

## 2. Local OCR Acquisition And Bake-Off

Do not select OCR from a generic leaderboard. Run a domain bake-off on the solar
holdout pages.

### Candidates

- [PaddleOCR.js](https://www.paddleocr.ai/latest/en/version3.x/inference_deployment/cross_platform/browser.html)
  is the leading candidate. It runs detection and recognition client-side,
  supports a dedicated worker, returns text boxes and confidence scores, and is
  part of an Apache-2.0 project. The browser SDK is relatively new, so Safari,
  model-loading, and memory behavior must be proven.
- [Tesseract.js](https://github.com/naptha/tesseract.js) is the mature
  Apache-2.0 baseline. It runs in browsers through WebAssembly, but it does not
  accept PDFs directly. Solar Plainly must render each page with PDF.js before
  recognition.
- [Scribe.js](https://github.com/scribeocr/scribe.js/) can extract born-digital
  PDFs and OCR image PDFs, but it is AGPL-3.0. Do not add it to this MIT project
  without a deliberate license review and distribution decision.

### Benchmark set

Use 100 pages, held out from rule development:

- 20 born-digital pages to verify text extraction bypasses OCR;
- 25 clean 300-dpi scans;
- 25 phone photos with rotation, perspective, shadow, or compression;
- 30 dense finance tables and small print.

At least 10 of the 100 pages should be Spanish and distributed across the
difficult image-quality categories.

Render scanned PDF pages at two resolutions and record the accuracy, latency,
memory, and file-size tradeoff. Test cold first-run model download separately
from a warm offline run.

### Required metrics

- character error rate;
- exact match for every critical numeric token;
- recall and precision for each contract-finding class;
- page and source-span preservation;
- explicit unreadable-page detection;
- first-load payload and initialization time;
- p50 and p95 seconds per page after warm-up;
- peak memory and recovery after processing a maximum-size packet;
- behavior offline and after a failed or interrupted model download.

Proposed release gates, to be adjusted only with a written reason after the
first benchmark:

- at least 99.5 percent exact critical numeric tokens on born-digital and clean
  scans;
- at least 98 percent exact critical numeric tokens on the full scanned set;
- at least 95 percent recall for supported finding classes on scanned pages;
- 100 percent of findings retain the correct document and page;
- zero silent blank-page successes; unreadable pages must stop or be visibly
  marked for manual review;
- a ten-page warm packet completes within 90 seconds on the supported laptop
  baseline and four minutes on the supported phone baseline;
- the maximum packet does not crash or leave the UI unresponsive.

Accuracy is more important than speed. A slow page can show progress; a wrong
interest rate or payment amount can materially mislead a homeowner.

## 3. Professional Reviewers

Hire separate reviewers for separate claims. No single person should be treated
as approving the whole product.

### Consumer attorney

Source candidates from the [National Association of Consumer Advocates attorney
directory](https://www.consumeradvocates.org/attorney-directory/), filtering for
"Solar and Door-to-Door Fraud" and relevant states. NACA's current education
program includes solar-fraud training, which confirms a specialized practitioner
community exists.

Required experience:

- residential solar or home-improvement sales disputes;
- consumer credit and electronic-signature practices;
- arbitration, transfer, security-interest, cancellation, and language-access
  issues;
- no current representation of a reviewed installer or lender without a
  disclosed and accepted conflict.

Deliverables:

- review the product boundary, disclaimers, and every legal-sounding phrase;
- review the national finding taxonomy and five representative packets;
- identify statements that need a jurisdiction, effective date, primary source,
  or removal;
- produce an issue log with severity, evidence, and proposed wording;
- define what requires state-specific counsel before a state pack ships.

### Independent solar professionals

Use the [NABCEP Professional Directory](https://directories.nabcep.org/) and
verify an unexpired credential. Recruit two roles:

- a PV Technical Sales (PVTS) professional for proposals, production
  assumptions, financing presentation, and sales terminology;
- a PV System Inspector (PVSI), PV Commissioning and Maintenance Specialist
  (PVCMS), or PV Installation Professional (PVIP) for equipment, warranties,
  production records, commissioning, safety boundaries, and maintenance.

Prefer reviewers who are independent of the providers represented in the
corpus. Require a written conflict statement. NABCEP is a professional
certification, not a state engineering license; verify a professional engineer
through the appropriate state board if Solar Plainly ever makes engineering or
system-design claims.

Deliverables:

- review the system passport, warranty distinctions, production signals, and
  maintenance language;
- label 10 to 15 representative packets independently;
- identify technically important documents and fields the packet checklist
  misses;
- produce an issue log and an agreed glossary in homeowner language.

### Review exit rule

Every issue must be fixed, converted into a dated source-backed limitation, or
explicitly accepted as residual risk. "Reviewed by an attorney" or "NABCEP
reviewed" must never be used as a broad endorsement claim.

## 4. Browser, Device, Storage, And Accessibility Evidence

### Automated matrix

[Playwright](https://playwright.dev/docs/browsers) supports Chromium, Firefox,
and WebKit plus mobile emulation. Add all three engines to pull-request CI.
Playwright states that its WebKit build is not branded Safari, so it is an early
warning signal rather than the final Safari gate.

Run on every pull request:

- Chromium desktop and mobile viewport;
- Firefox desktop;
- WebKit desktop and iPhone viewport;
- keyboard-only smoke flow;
- automated accessibility checks on the import, review, source, system, and
  privacy screens.

Run before each release:

- current macOS Safari through Apple's bundled `safaridriver`;
- real iPhone Safari and a real Android Chrome device;
- installed PWA, offline relaunch, interrupted update, and browser-storage
  recovery;
- screen-reader flows with VoiceOver on iPhone and macOS;
- 200 percent zoom, reflow, large text, reduced motion, and print/PDF output.

Apply to the [BrowserStack Open Source program](https://www.browserstack.com/open-source).
It currently offers qualifying open-source projects unlimited desktop and
mobile testing, lifetime project access, five users, and five parallel tests.

Safari persistence is a product risk, not a minor compatibility check. WebKit
documents that IndexedDB and related origin data can be evicted under storage
pressure or inactivity and that default storage is best-effort. Test
`StorageManager.estimate()`, `persist()`, quota failures, backup warnings, and a
complete encrypted export/import recovery flow. See [WebKit's storage policy](https://webkit.org/blog/14403/updates-to-storage-policy/).

Use [WCAG 2.2](https://www.w3.org/TR/WCAG22/) Level AA as the conformance target,
but do not call automated checks an accessibility audit. Include at least four
screen-reader users in field testing before making an accessibility claim.

Critical release flows are:

1. import the maximum allowed packet;
2. extract or OCR every page and surface failures;
3. inspect a finding and recover its exact source;
4. edit a term and see derived values update;
5. print or save the homeowner brief;
6. close, relaunch, and recover local state;
7. export, erase, and restore the encrypted backup;
8. import production CSV data and preserve the existing system history.

## 5. Homeowner Field Testing

### Recruitment segments

Recruit for situations, not a generic "homeowner" label:

1. shopping now with a solar-specific loan;
2. shopping now with a lease or PPA;
3. recent cash purchaser;
4. established owner tracking warranty or production;
5. selling or buying a solar home;
6. installer closure, dispute, or underperforming system;
7. Spanish-first or limited-English household;
8. screen-reader or low-vision user.

Do not request a contract in the screener. After selection, use the separate
consent process and offer a synthetic packet for anyone who does not want to
share a real one.

### Three research waves

Wave 1: 12 moderated sessions, 45 to 60 minutes.

- Two participants in each of six high-priority situations.
- Use synthetic or thoroughly redacted packets first.
- Observe comprehension, source recovery, navigation, and privacy expectations.

Wave 2: 36 unmoderated comprehension tests.

- Use a fixed packet and scored questions.
- Measure whether participants can identify cash price, amount financed,
  payment reset, escalator, transfer obligation, warranty owner, and document
  gaps.
- Compare the Solar Plainly workflow with the original packet alone.

Wave 3: 12 real-packet longitudinal pilots.

- Use the participant's own consented packet.
- Test import through expert-question preparation, then follow up after the
  participant speaks with an installer, lender, attorney, or service provider.
- For installed owners, test production CSV import and one maintenance record.

Add four to six accessibility sessions across the waves. Do not count the same
participant twice when reporting segment totals.

### Success measures

- at least 90 percent can reopen the exact page supporting a displayed term;
- at least 85 percent correctly distinguish cash price, amount financed, and a
  conditional payment reset after using the product;
- at least 85 percent correctly explain that "not found" is not "not present";
- at least 80 percent complete import, review, brief, and backup without help;
- no participant reports that the product told them a contract was safe, fair,
  approved, or guaranteed;
- all privacy confusion and every critical comprehension error is logged and
  resolved or accepted before release.

### Paid recruiting economics

Current public pricing supports a modest first wave:

- [Prolific](https://www.prolific.com/pricing) recommends at least $12 per hour,
  allows custom screening, and currently adds a 42.8 percent corporate platform
  fee. Thirty-six 20-minute participants at that recommended rate are about
  $144 in rewards and $206 total before paid screen-outs.
- [User Interviews](https://www.userinterviews.com/pricing) currently lists $49
  per completed consumer session plus the participant incentive. Twelve
  sessions cost $588 in recruitment fees before incentives.
- [Respondent](https://www.respondent.io/pricing) currently lists $40
  pay-as-you-go consumer recruitment per completed moderated session, with
  incentives separate. Twelve sessions cost $480 in recruitment fees before
  incentives.

Use partner recruitment first for authenticity and paid panels to fill missing
quotas. A $60 to $100 incentive is a reasonable planning allowance for a
45-to-60-minute niche homeowner interview, but obtain actual quotes and test
response rates before treating that range as market fact.

## 6. Budget And Timeline

These are internal planning allowances, not vendor quotes.

| Workstream | Lean credible beta | Stronger validation |
| --- | ---: | ---: |
| Packet contributors and recruitment | $2,000 | $5,000 |
| Moderated and unmoderated field testing | $2,000 | $4,500 |
| Consumer attorney review | $3,000 | $7,500 |
| Two solar professional reviews | $2,000 | $5,000 |
| Accessibility participants or specialist | $1,000 | $3,000 |
| Browser/device service | $0 if OSS accepted | $1,000 contingency |
| Total, excluding engineering | $10,000 | $26,000 |

The lower number assumes partner recruiting, tightly fixed reviewer scopes, and
60 packets. The stronger number supports 100 packets, deeper state review,
accessibility work, and recruitment contingencies.

An eight-week program is realistic:

1. Week 1: approve consent, retention, provenance, annotation, and reviewer
   briefs; apply for BrowserStack OSS.
2. Week 2: collect and hash the official source pack; freeze the first 100-page
   OCR benchmark; begin reviewer outreach.
3. Weeks 3-4: run the OCR bake-off and Wave 1; recruit the first 30 real packets.
4. Weeks 4-6: reach 60 packets, double-annotate the gold set, and run Wave 2.
5. Weeks 6-7: complete attorney, PVTS, and technical reviews; implement findings;
   run actual Safari and accessibility sessions.
6. Week 8: run Wave 3, freeze the holdout, publish aggregate evidence, and make
   a release decision against the gates below.

## 7. Completion Criteria For A Real Beta

Solar Plainly is ready to describe as a tested public beta only when all of the
following are true:

- The source manifest contains at least 40 current official/model documents and
  records effective dates, hashes, and redistribution status.
- The private corpus contains at least 60 consented packets across the stated
  financing, geography, language, provider, and image-quality quotas.
- A frozen 20 percent holdout exists and was not used to tune extraction rules.
- OCR meets the numeric, finding-recall, provenance, failure, device, and
  maximum-packet gates.
- Every finding links to a document, page, excerpt, and rule explanation.
- Every negative result remains explicitly indeterminate rather than claiming
  absence.
- A consumer attorney, a PVTS reviewer, and a PVSI/PVCMS/PVIP reviewer have
  completed their scoped issue logs, with no unresolved critical issue.
- Critical flows pass in Chromium, Firefox, Playwright WebKit, actual macOS
  Safari, real iPhone Safari, and real Android Chrome.
- Export, erase, restore, quota failure, offline relaunch, and storage-eviction
  recovery are proven.
- Field studies meet the comprehension and task-completion measures without a
  false assurance signal.
- No raw homeowner packet, direct identifier, contract text, or private excerpt
  appears in the repository, analytics, logs, screenshots, or issue tracker.
- The public evidence report names sample sizes, dates, supported document
  types, supported languages, known gaps, and failures without marketing the
  work as legal review or a contract verdict.

Anything short of these gates can still be useful software, but it should be
called an experimental or early beta tool and should state the unsupported
surfaces plainly.
