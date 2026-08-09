# Runbook

## Deploy

Production is a static GitHub Pages deployment from `main`.

1. Merge or push a verified commit to `main`.
2. The CI workflow runs tests, lint, and build.
3. The Pages workflow builds with `VITE_BASE_PATH=/solar-plainly/`.
4. GitHub Pages deploys the `dist` artifact.
5. Open the deployed app and run the smoke checks below.

## Smoke Checks

- Home screen loads with no console error.
- Check > Load the sample produces page-linked questions.
- Record fields survive one reload.
- Settings > Export downloads a JSON file.
- Browser devtools Network shows no first-party record upload.
- Desktop and phone layouts have no horizontal overflow.

## Rollback

Target: under two minutes, no rebuild required.

1. Open the repository's Pages deployment history.
2. Select the last known-good deployment and redeploy it.
3. Confirm the smoke checks.

Alternative: revert the breaking commit on `main`. This rebuilds and is slower.

Application rollback does not alter browser IndexedDB. Schema changes must remain backward-compatible or include a tested migration.

## Incident: Contract Data Appears to Leave the Device

1. Disable GitHub Pages immediately.
2. Preserve the affected commit and browser network evidence privately.
3. Determine the destination, data fields, trigger, and affected versions.
4. Remove the network path and add a regression test.
5. Rotate any exposed third-party credentials.
6. Publish a clear incident note after impact is understood.

## Incident: Bad Review Rule

1. Identify the rule ID and triggering text.
2. Disable or narrow the rule in `src/lib/contractAnalyzer.ts`.
3. Add a fixture for the false positive or false negative.
4. Explain that rule results are prompts, not prior legal conclusions.

## Data Recovery

There is no server-side backup. Recovery options are:

- import a user-exported JSON backup;
- restore the browser profile using the user's device backup system.

Do not promise recovery when neither exists.
