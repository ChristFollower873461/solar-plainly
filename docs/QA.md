# Release QA

This file records the checks run for the initial public release on August 9,
2026.

## Automated checks

| Check | Result |
| --- | --- |
| `npm run lint` | Passed with no findings. |
| `npm run test` | Passed: 4 files, 11 tests. |
| `npm run build` | Passed: TypeScript and the production PWA build. |
| `npm run test:e2e` | Passed: 7 Playwright tests across desktop and mobile Chromium; 1 desktop-only skip for the mobile navigation test. |
| `VITE_BASE_PATH=/solar-plainly/ npm run build` | Passed: GitHub Pages subpath build. |
| `npm audit --omit=dev --audit-level=moderate` | Passed: 0 production vulnerabilities. |

The browser suite covers the fictional sample review, in-browser extraction of
a generated searchable PDF, source-linked findings, resolving a question,
IndexedDB persistence, and the mobile navigation. It also fails on browser
console errors.

## Visual and responsive checks

- Inspected Home, Check, Record, Care, and Settings at desktop and mobile sizes.
- Audited all five screens at a 320 px viewport; no horizontal overflow was
  detected.
- Checked that the mobile navigation remains readable over long content.
- Captured reference images locally under `artifacts/qa/`; this directory is
  intentionally ignored because the product screenshot is kept at
  `docs/images/solar-plainly-home.png`.

## Privacy and security checks

- Searched `src/` for network-capable calls; the initial release contains no
  `fetch`, `XMLHttpRequest`, `WebSocket`, analytics, account, or AI endpoint.
- Searched for unsafe HTML injection and dynamic code execution; no
  `dangerouslySetInnerHTML`, `eval`, or `new Function` usage was found.
- Contract text, files, and notes remain in the browser's IndexedDB unless the
  user exports a backup.
- Import files are schema-validated and size-limited. PDF and record uploads
  are also size-limited.

## Known gaps

- PDF extraction supports text-based PDFs. Scanned documents need OCR before
  they can be checked.
- Rules were tested with fictional text, not private homeowner contracts.
- The legal, tax, and trademark material is informational and has not received
  professional legal or tax review. The product deliberately links users to
  current primary sources.
- Browser automation currently covers Chromium. Manual Safari and Firefox
  verification remains useful.
- Field testing with homeowners, installers, and consumer advocates is still
  needed before calling the question set comprehensive.
