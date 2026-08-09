# Architecture

## Design Goals

- Keep sensitive homeowner records off application servers.
- Make contract findings reproducible and inspectable.
- Preserve source page and excerpt provenance.
- Work offline after the first successful load.
- Keep data portable and erasable.
- Require no paid infrastructure for the public project.

## Runtime

Solar Plainly is a static React and TypeScript PWA built with Vite.

```text
PDF or TXT packet (up to 8 documents)
             |
             v
Browser-only text extraction with document/page provenance
             |
             v
Deterministic rules and structured term extraction
             |
             +--> editable deal facts and source labels
             +--> inspectable financial arithmetic
             +--> page-linked questions and notes
             +--> packet-completeness checklist
             |
             +--> printable homeowner brief
             +--> system-record handoff
             v
React state --> IndexedDB --> versioned JSON backup
```

There is no application server, account system, database service, analytics endpoint, LLM call, or background queue.

## Modules

### Contract ingestion

`src/lib/pdf.ts` accepts PDF or plain text, enforces per-file size and page limits, and extracts one text record per page. `ContractReview` keeps the originating document name, limits a packet to eight files, 40 MB total, and 250 extracted pages, and reports partial failures. It rejects PDFs with too little searchable text instead of pretending a scanned document was analyzed.

### Contract review

`src/lib/contractAnalyzer.ts` contains explicit rules. A positive rule returns:

- stable rule ID;
- category and severity;
- homeowner-facing explanation;
- question to ask;
- page number and nearby excerpt.

Coverage rules separately state whether familiar language was located. Missing coverage never proves absence.

### Deal workspace

`src/lib/deal.ts` maps extracted facts into an editable ownership-specific term set, infers packet status from document names, and calculates transparent comparisons such as:

- financed amount minus cash price and the corresponding percentage;
- cash and financed cost per watt;
- standard amortized payment and total for a conventional fixed-rate loan;
- the stated payment jump and scheduled outlay if an expected lump-sum prepayment is not made;
- combined solar and remaining utility payments for year 1 and year 10 when the user supplies those assumptions.

Calculations preserve their inputs in the interface and do not produce a contract score, savings guarantee, tax result, or lender payoff quote. A financing difference is explicitly not labeled a dealer fee.

`src/components/PacketChecklist.tsx` tracks eight common document categories independently from rule coverage. `src/components/ReviewReport.tsx` turns the saved numbers, questions, sources, notes, and packet gaps into a print-only homeowner brief.

### State and persistence

`src/hooks/useSolarData.ts` owns the in-memory record and saves changes to IndexedDB after a short debounce. `src/lib/storage.ts` contains the only persistent browser-store access.

The application schema is versioned with `schemaVersion: 2`. Existing version 1 IndexedDB records and backups are migrated on read with empty deal and packet structures, so the release does not strand earlier local data.

### Backup and local documents

`src/lib/backup.ts` validates imported JSON with Zod before replacing state. Saved documents are represented as local data URLs in IndexedDB and included in backups.

Limits:

- individual contract file: 15 MB, 150 pages;
- complete review packet: 8 files, 40 MB, 250 extracted pages;
- saved document: 10 MB;
- imported backup: 60 MB.

### Production history

`src/lib/production.ts` compares the latest 12 entries with the previous 12 only after 24 entries exist. `src/lib/productionImport.ts` uses a CSV parser to recognize common date/month and energy columns, normalize Wh, kWh, or MWh, aggregate daily rows by month, and preview replacements before saving. CSV files are limited to 5 MB. These modules perform arithmetic, not weather normalization or equipment diagnosis.

### Offline behavior

`vite-plugin-pwa` generates a service worker and precaches production assets. New deployments use auto-update registration. User records remain in IndexedDB and are not bundled into the cache.

## Security and Privacy Boundaries

Trusted:

- source code shipped by this repository;
- browser same-origin storage;
- user-selected local files after type and size checks.

Untrusted:

- PDF contents;
- CSV contents;
- backup files;
- free-form text and URLs;
- external resource sites.

Controls:

- no HTML rendering of extracted contract text;
- React text escaping for all user-controlled strings;
- Zod validation before backup replacement;
- no dynamic code execution;
- no remote document submission;
- external links use `rel="noreferrer"`;
- destructive erase requires typed confirmation;
- CI runs tests, lint, build, and browser journeys.

## Failure Modes

### PDF has no searchable text

The app stops and asks for OCR or pasted text. It does not generate empty reassurance.

### Browser storage fails

The header shows a save error. The current tab may still contain unsaved state. The user should export while the page remains open.

### Backup is malformed or incompatible

The existing record remains unchanged and the import displays an error.

### Service worker has an older application shell

Auto-update downloads the current worker. A normal reload activates the refreshed shell.

## Future Extension Boundaries

- OCR should run locally in a Web Worker and keep page provenance.
- State-specific rules should be separately versioned, dated, sourced, and disabled when stale.
- Vendor monitoring imports should use user-initiated CSV files before OAuth integrations.
- Optional AI must be opt-in, disclose where text goes, validate structured output, preserve citations, impose cost limits, and provide deterministic fallback.
- Encrypted sync should be end-to-end encrypted and separate from the default local-only path.
