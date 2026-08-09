# Product Brief

## Outcome

A homeowner can use one free, open-source tool before and after a residential solar installation:

1. Check an agreement without uploading it to a company.
2. Turn opaque language into specific questions tied to source pages.
3. Keep a durable system passport and document box.
4. Track production, care, service, and warranty history.
5. export or erase the entire record without an account.

## Audience

Primary audience: a non-technical U.S. homeowner considering or already living with rooftop solar, with or without battery storage.

The interface should feel calm, candid, practical, and independent. It must not resemble an installer sales funnel.

## User Jobs

### Before signing

- See possible price, financing, production, warranty, transfer, and cancellation terms.
- Identify risky assumptions or obligations that deserve a written answer.
- Preserve notes from the installer, lender, attorney, tax professional, or utility.

### During installation

- Record the final equipment and approved substitutions.
- Keep permits, inspection records, permission to operate, manuals, and warranties.
- Track installer, lender, utility, and monitoring access.

### During ownership

- Maintain recurring checks without unsafe do-it-yourself instructions.
- Log monthly production and notice a sustained year-over-year decline.
- Keep a service and warranty claim trail.
- Hand the record to a future owner.

## Scope for v0.1

In:

- Searchable PDF and plain-text contract import.
- Local deterministic rule engine with page-linked excerpts.
- Open, resolved, and complete review views.
- System profile, equipment inventory, and local document storage.
- Recurring care tasks, production history, and issue log.
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

- A user can check the fictional sample and see page-linked questions.
- A missing topic is labeled "not found," never represented as definitely absent.
- A user can resolve and reopen a question and keep a note.
- A user can create and reload a system record with persisted values.
- A user can add equipment, documents, tasks, production entries, and issues.
- A user can export, validate, re-import, and erase the local record.
- The app works at desktop and phone widths without horizontal overflow.
- Unit, build, lint, and Playwright checks pass.
- The repository contains no Solar Unveiled code, data, branding, customer information, infrastructure, or private history.

## Completion Criteria for a Real Tool

v0.1 is a useful open-source product when a homeowner can finish the complete local workflow with a searchable contract and retain the result across browser restarts.

Before calling it broadly production-ready, the project still needs:

- homeowner usability interviews;
- review by a consumer-protection attorney and residential solar professional;
- a larger, permissioned and de-identified contract test corpus;
- OCR with the same local-first privacy boundary;
- tested encrypted backup options;
- localization and state-specific resource packs that clearly show their effective dates.
