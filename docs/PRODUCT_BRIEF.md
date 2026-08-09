# Product Brief

## Outcome

A homeowner can use one free, open-source tool before and after a residential solar installation:

1. Assemble the contract packet without uploading it to a company.
2. Compare exact deal economics with visible arithmetic and source-linked inputs.
3. Turn opaque obligations into specific questions tied to document pages.
4. Print a decision brief and carry signed terms into a durable system record.
5. Import production history and track care, service, and warranty work.
6. Export or erase the entire record without an account.

## Audience

Primary audience: a non-technical U.S. homeowner considering or already living with rooftop solar, with or without battery storage.

The interface should feel calm, candid, practical, and independent. It must not resemble an installer sales funnel.

## User Jobs

### Before signing

- See cash price, amount financed, cost per watt, payment changes, expected prepayments, and ownership-specific terms together.
- Know which core comparison numbers and packet documents are still missing.
- Identify risky assumptions or obligations that deserve a written answer.
- Preserve sources and notes from the installer, lender, attorney, tax professional, or utility.
- Print or copy a concise brief for the next conversation.

### During installation

- Record the final equipment and approved substitutions.
- Keep permits, inspection records, permission to operate, manuals, and warranties.
- Track installer, lender, utility, and monitoring access.

### During ownership

- Maintain recurring checks without unsafe do-it-yourself instructions.
- Import or log monthly production and notice a sustained year-over-year decline.
- Keep a service and warranty claim trail.
- Hand the record to a future owner.

## Scope for v0.2

In:

- Multi-document searchable PDF and plain-text packet import.
- Local deterministic rule engine with document- and page-linked excerpts.
- Editable, source-linked deal terms for cash, loan, lease, and PPA structures.
- Transparent cash-versus-financed, cost-per-watt, amortization, payment-change, and utility-plus-solar arithmetic.
- Ownership-specific missing-term checks and an eight-part packet checklist.
- Open and resolved question views, notes, copyable questions, and a printable homeowner brief.
- Contract-to-system-record handoff.
- System profile, equipment inventory, and local document storage.
- Recurring care tasks, manual and CSV-imported production history, and issue log.
- IndexedDB persistence, validated backup import/export, and complete erase.
- Responsive installable PWA.

Out:

- Legal conclusions or contract safety scores.
- Tax eligibility calculations.
- Installer ranking, quote marketplace, lead generation, CRM, or sales features.
- Cloud accounts, sync, analytics, or remote document processing.
- Direct inverter or utility APIs.
- OCR for scanned documents.
- Weather-normalized production diagnostics.

## Risk Surfaces

- Privacy: contracts can contain names, addresses, signatures, loan details, and account information.
- Accuracy: deterministic patterns can miss or misread contract language.
- Legal and financial reliance: copy must avoid verdicts and date-sensitive promises.
- Local data loss: browser storage can be cleared.
- File handling: uploads require size and type limits; imported backups require schema validation.
- Safety: maintenance guidance must not encourage roof access or electrical work.

## Acceptance Criteria

- A user can import several packet documents and retain document/page provenance.
- A user can inspect and edit the core deal terms, see the source for extracted values, and reproduce each calculation from visible inputs.
- The app distinguishes an arithmetic financing difference from proof of a dealer fee.
- A user can see ownership-specific missing terms and mark each packet item present, missing, not applicable, or unknown.
- A missing topic is labeled "not found," never represented as definitely absent.
- A user can resolve and reopen a question and keep a note.
- A user can print a readable homeowner brief containing the deal snapshot, calculations, open questions, sources, notes, and packet gaps.
- A user can carry reviewed system terms into the long-term record.
- A user can create and reload a system record with persisted values.
- A user can add equipment, documents, tasks, production entries, and issues, and import common monitoring CSV exports.
- A user can export, validate, re-import, and erase the local record.
- Version 1 local records and backups migrate without data loss.
- The app works at desktop and phone widths down to 320 px without horizontal overflow.
- Unit, build, lint, and Playwright checks pass.
- The repository contains no Solar Unveiled code, data, branding, customer information, infrastructure, or private history.

## Completion Criteria for a Real Tool

v0.2 meets the useful local-product bar when a homeowner can move from a real searchable packet to a sourced comparison brief, preserve the signed system facts, and maintain a vendor-neutral production and service history across browser restarts. Failures must be explicit: scans, malformed data, partial packet imports, save problems, and unrecognized CSVs cannot silently produce reassurance.

That bar means the software is a credible public beta, not that its rule set has been clinically or legally validated. Before calling it broadly production-ready, the project still needs:

- homeowner usability interviews;
- review by a consumer-protection attorney and residential solar professional;
- a larger, permissioned and de-identified contract test corpus;
- OCR with the same local-first privacy boundary;
- tested encrypted backup options;
- localization and state-specific resource packs that clearly show their effective dates.
