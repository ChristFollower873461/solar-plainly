# Release QA

This file records the checks run for the v0.2 decision-workspace release on
August 9, 2026.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run lint` | Passed with no findings. |
| `npm run test` | Passed: 6 files, 22 tests. |
| `npm run build` | Passed: TypeScript and the production PWA build. |
| `npm run test:e2e` | Passed: 19 Playwright runs across desktop and mobile Chromium; 3 intentional project-specific skips. |
| `VITE_BASE_PATH=/solar-plainly/ npm run build` | Passed: GitHub Pages subpath build. |
| `npm audit --omit=dev --audit-level=moderate` | Passed: 0 production vulnerabilities. |

The browser suite covers a three-document packet, in-browser extraction of a
generated searchable PDF, source-linked economics and questions, a PPA with an
annual escalator, exact Home-to-review navigation, question resolution,
contract-to-record handoff, monitoring CSV import, IndexedDB persistence, the
print-only brief, mobile navigation, and every core view at 320 px. It also
fails on browser console errors.

## Visual and responsive checks

- Inspected the deal, packet, and question workspaces at desktop and mobile sizes.
- Audited all five screens at a 320 px viewport; no horizontal overflow was
  detected.
- Checked that the mobile navigation remains readable over long content.
- Rendered the complete homeowner brief to a two-page Letter PDF, converted
  both pages to PNG, and visually checked typography, sources, tables, page
  transitions, and the disclaimer for clipping or overlap.
- Captured reference images locally under `artifacts/qa/`; the public product
  screenshot is `docs/images/solar-plainly-deal-review.png`.

## Privacy and security checks

- Searched `src/` for network-capable calls; the application contains no
  `fetch`, `XMLHttpRequest`, `WebSocket`, analytics, account, or AI endpoint.
- Searched for unsafe HTML injection and dynamic code execution; no
  `dangerouslySetInnerHTML`, `eval`, or `new Function` usage was found.
- Contract text, files, and notes remain in the browser's IndexedDB unless the
  user exports a backup.
- Backup imports are schema-validated and migrate version 1 records into the
  version 2 deal model. Contract packets, PDFs, monitoring CSVs, record files,
  and backups are independently size-limited.

## Known gaps

- PDF extraction supports text-based PDFs. Scanned documents need OCR before
  they can be checked.
- Rules and extraction were tested with fictional text, not a representative,
  permissioned corpus of real homeowner contracts.
- The legal, tax, and trademark material is informational and has not received
  professional legal or tax review. The product deliberately links users to
  current primary sources.
- Browser automation currently covers Chromium. Manual Safari and Firefox
  verification remains useful.
- PPA estimates hold entered annual production constant; lease/PPA nominal
  totals do not discount future payments, model degradation, or predict
  savings.
- Field testing with homeowners, installers, and consumer advocates is still
  needed before calling the question set comprehensive.

The acquisition paths, sample quotas, privacy controls, reviewer scopes, OCR
benchmark, browser matrix, field-study waves, budget, and exit gates for closing
these gaps are recorded in [the evidence and validation sourcing plan](SOURCING_PLAN.md).

## Sourcing-plan documentation check

The evidence and validation sourcing plan was added on August 9, 2026. The
documentation-only change was verified against the existing product rather than
treated as evidence that the proposed external research has already occurred.

| Check | Result |
| --- | --- |
| `git diff --check` | Passed with no whitespace errors. |
| `npm run check` | Passed: lint, 6 unit-test files with 22 tests, and production build. |
| `npm run test:e2e` | Passed: 19 Chromium runs; 3 intentional project-specific skips. |

Remaining gap: no outside organization, reviewer, participant, document owner,
or browser-testing provider has yet agreed to participate. The plan names
qualified acquisition channels and proposed gates; it does not claim those
gates are complete.

## Consumer recruitment launch check

The first consent-based homeowner recruitment path was launched on August 9,
2026. This is a recruiting milestone, not evidence that the contract corpus or
field study is complete.

| Check | Result |
| --- | --- |
| Public screener | Published under the AIssisted Consulting Workspace; the anonymous URL returned HTTP 200 and exposed the expected title and questions. |
| Screener minimization | Verified 13 questions, explicit contact consent, no exact address, account number, payment information, income, phone number, contract, or file-upload field. |
| App handoff | Verified the Settings invitation and external screener link at 1280 x 900 and 390 x 844 with no horizontal overflow. |
| Partner outreach | Sent opt-in circulation requests to Solar United Neighbors and Solar Rights Alliance; neither organization has agreed to participate yet. |
| `npm run check` | Passed: lint, 6 unit-test files with 22 tests, TypeScript, and production PWA build. |
| `npm run test:e2e` | Passed: 21 Chromium runs across desktop and mobile; 3 intentional project-specific skips. |

No participant list was purchased or scraped, no permit-owner names were used,
and no homeowner was contacted from a public record. No recruitment spend has
been authorized. Later contract sharing requires separate consent, redaction
guidance, and a private upload destination; contracts must not be sent through
the screener, email, Git, GitHub, or Slack.

The channel research, geographic proxies, screener, outreach copy, budget, data
handling rules, and launch sequence are recorded in
[the consumer recruitment playbook](CONSUMER_RECRUITMENT.md).
