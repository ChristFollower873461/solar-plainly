# Security Policy

## Supported Versions

Security fixes are applied to the latest release on `main`.

## Reporting a Vulnerability

Do not post a vulnerability that could expose homeowner data as a public issue.

Use GitHub's private vulnerability reporting for this repository. Include:

- affected commit or release;
- reproduction steps;
- data or capability exposed;
- browser and operating system;
- any proposed mitigation.

If private reporting is unavailable, open a public issue containing no exploit details and ask a maintainer to establish a private channel.

## Security Model

Solar Plainly is a static local-first application. It intentionally has no account backend, API, analytics service, ad network, cloud file store, or LLM endpoint.

Sensitive inputs include contracts, financing details, locations, serial numbers, warranties, and service records. They are stored in browser IndexedDB and can be exported to a local JSON backup.

Users remain responsible for device security, browser-profile access, downloaded backups, and any files they choose to open through external software.

## Invariants

- Extracted contract text is rendered only as escaped React text.
- Imported backups are schema-validated before replacing local data.
- No user record is sent over the network by first-party application code.
- Adding a network endpoint, telemetry, external AI call, or sync service requires an explicit privacy and threat-model review.
- Contract analysis must not fabricate source pages or treat a missing pattern as proof of absence.

## Dependency Updates

Dependabot checks npm and GitHub Actions dependencies weekly. CI must pass before merging updates.
