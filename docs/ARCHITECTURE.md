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
PDF or TXT file
      |
      v
Browser-only PDF text extraction
      |
      v
Deterministic pattern rules
      |
      +--> possible terms
      +--> page-linked questions
      +--> topic coverage
      |
      v
React state --> IndexedDB --> JSON backup
```

There is no application server, account system, database service, analytics endpoint, LLM call, or background queue.

## Modules

### Contract ingestion

`src/lib/pdf.ts` accepts PDF or plain text, enforces size and page limits, and extracts one text record per page. It rejects PDFs with too little searchable text instead of pretending a scanned document was analyzed.

### Contract review

`src/lib/contractAnalyzer.ts` contains explicit rules. A positive rule returns:

- stable rule ID;
- category and severity;
- homeowner-facing explanation;
- question to ask;
- page number and nearby excerpt.

Coverage rules separately state whether familiar language was located. Missing coverage never proves absence.

### State and persistence

`src/hooks/useSolarData.ts` owns the in-memory record and saves changes to IndexedDB after a short debounce. `src/lib/storage.ts` contains the only persistent browser-store access.

The application schema is versioned with `schemaVersion: 1`.

### Backup and local documents

`src/lib/backup.ts` validates imported JSON with Zod before replacing state. Saved documents are represented as local data URLs in IndexedDB and included in backups.

Limits:

- contract analysis: 15 MB, 150 pages;
- saved document: 10 MB;
- imported backup: 60 MB.

### Production history

`src/lib/production.ts` compares the latest 12 entries with the previous 12 only after 24 entries exist. It performs arithmetic, not weather normalization or equipment diagnosis.

### Offline behavior

`vite-plugin-pwa` generates a service worker and precaches production assets. New deployments use auto-update registration. User records remain in IndexedDB and are not bundled into the cache.

## Security and Privacy Boundaries

Trusted:

- source code shipped by this repository;
- browser same-origin storage;
- user-selected local files after type and size checks.

Untrusted:

- PDF contents;
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
