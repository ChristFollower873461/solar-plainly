# Contributing

Thank you for helping homeowners understand and maintain their solar systems.

## Before You Start

Read:

- [Product brief](docs/PRODUCT_BRIEF.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Research](docs/RESEARCH.md)
- [Security policy](SECURITY.md)

Solar Plainly is independent educational software. Do not contribute private contracts, customer data, proprietary source, confidential evaluation material, or code copied from another product.

## Development

```bash
npm install
npx playwright install chromium
npm run dev
```

Before opening a pull request:

```bash
npm run check
npm run test:e2e
```

## Contract Rule Standard

A new or changed rule must include:

- a stable descriptive ID;
- the consumer question it supports;
- plain-language explanation without a legal verdict;
- source-page and excerpt behavior;
- a positive fixture;
- at least one important non-match or false-positive fixture;
- a primary source explaining why the topic matters.

Do not add:

- installer blacklists or unverified company claims;
- green/red contract scores;
- date-sensitive tax percentages without an effective date and update plan;
- state-law conclusions presented as universal;
- remote AI or analytics calls without an approved privacy design.

## Pull Requests

Keep changes focused. Explain:

- homeowner outcome;
- accuracy, privacy, and data risks;
- checks run;
- screenshots for interface changes;
- known gaps.

## Accessibility

- Use semantic controls and labels.
- Keep keyboard focus visible.
- Maintain touch targets around 40 pixels or larger.
- Do not rely on color alone.
- Test at desktop and phone widths.
- Keep source excerpts and warnings readable at 200% zoom.
