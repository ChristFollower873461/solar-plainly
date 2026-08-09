# Agent Rules

## Product Invariants

- This is independent homeowner software, not an installer sales tool.
- No Solar Unveiled code, data, branding, customer information, infrastructure, or private history enters this repository.
- Documents remain local by default.
- Findings are questions with provenance, never contract verdicts or safety scores.
- "Not found" never means "absent."
- Date-sensitive legal, tax, and incentive guidance must link to a current primary source and show its effective date where practical.

## Engineering Rules

- Keep the static local-first architecture unless a ticket explicitly changes the privacy model.
- Validate imported structured data.
- Escape all user-controlled text; never render extracted HTML.
- Add positive and false-positive tests for contract-rule changes.
- Keep schema changes backward-compatible and versioned.
- Run `npm run check` and `npm run test:e2e` before completion.
- Record commands, results, and gaps in `docs/QA.md`.
