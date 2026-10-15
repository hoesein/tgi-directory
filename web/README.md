# Taunggyi Directory

Taunggyi Directory is a mobile-first, installable Progressive Web App (PWA) for finding local businesses and services, with a Myanmar calendar and market-day information. The current product baseline is **MVP v1**. Its scope, implemented behavior, known limitations, and forward-looking requirements are documented in [`REQUIREMENTS.md`](REQUIREMENTS.md).

## Current MVP

- Browse directory categories and their listings, search/filter within a category, and open listing details with phone and map actions.
- See selected food listings on Home, an event ticker, and a Myanmar calendar with market-day, full-moon/new-moon, official holiday, and Tazaungdaing participant information.
- Use the installable PWA, including a mobile-browser install guide, offline app shell, and cached static data.
- Contact the developer from Profile to suggest corrections or contribute missing information.

The Home search input is not connected to search yet; Places to Visit currently contains sample content; and authentication is not implemented. The sign-in/register card is disabled, but legacy login/register routes still exist and currently issue a dummy token if submitted. Do not treat them as real accounts. See the known gaps and planned requirements in [`REQUIREMENTS.md`](REQUIREMENTS.md).

## Requirements and product decisions

[`REQUIREMENTS.md`](REQUIREMENTS.md) is the source of truth for the MVP baseline, implemented behavior, non-goals, outstanding requirements, and data/privacy expectations. Update it when product scope or behavior changes so future contributors can distinguish working features from placeholders.

## Development

Requirements: Bun and Git. Clone with submodules initialized so both the private directory data and market calendar are available:

```powershell
git clone --recurse-submodules https://github.com/hoesein/tgi-directory.git
cd tgi-directory
cd web
bun install --frozen-lockfile
bun run dev
```

For an existing clone:

```powershell
git submodule update --init --recursive
```

Useful commands from `web/`:

```powershell
bun run dev
bun run typecheck
bun run lint
bun run build
bun run preview
```

There is no automated test suite configured yet. Build runs TypeScript checking followed by Vite production bundling.

## Data sources

- `web/public/data` is the `hoesein/city-data` Git submodule. It contains `categories.json`, listing JSON files, and `tazaungdaing.json`. Vite serves those JSON files at `/data/` (for example, `https://hoesein.github.io/tgi-directory/data/categories.json`); `public/` is not part of the URL.
- `web/vendor/shan-market-day` is the `hoesein/shan_market_day` Git submodule. Calendar calculations, market schedules, and official holiday records are bundled into the app.
- The app's source code and bundled data are publicly downloadable from GitHub Pages. Never put credentials, private personal data, or other secrets in either submodule; GitHub Actions secrets are only for build-time checkout and must not be exposed through `VITE_*` variables.
- `VITE_DATA_URL` optionally overrides the default data base URL. It must be a public URL whose `/data/<file>` paths provide the same JSON schema. Leave it empty to use the bundled submodule data.

To update a submodule to its configured branch tip and record the selected revision in this repository:

```powershell
git submodule update --remote web/public/data
git add web/public/data
```

```powershell
git submodule update --remote web/vendor/shan-market-day
git add web/vendor/shan-market-day
```

The production workflow currently updates submodules to their remote branch tips during deployment. This can make a deployment use newer data than the submodule revisions recorded in the application commit; see the deployment requirement in [`REQUIREMENTS.md`](REQUIREMENTS.md).

## Configuration

Copy `.env.example` to `.env` when local overrides are needed. Supported variables:

| Variable | Purpose |
| --- | --- |
| `VITE_API_URL` | Legacy backend API base URL. The default `/api` is proxied to a local Next.js server, but the current MVP directory flows use static submodule JSON instead. |
| `VITE_DATA_URL` | Optional public static-data mirror base URL; the app appends `/data/<file>`. |
| `VITE_SENTRY_DSN` | Optional Sentry browser error-reporting DSN. Unset means Sentry is not initialized. |

All `VITE_*` values are embedded in public client code. Never put tokens or other secrets in them.

## GitHub Pages deployment

The workflow at `../.github/workflows/deploy-pages.yml` builds from `web/` and deploys on pushes to `main` or manual dispatch. It creates `404.html` for SPA routes and `.nojekyll` for static assets.

Repository setup:

1. Set **Settings → Pages → Build and deployment → Source** to **GitHub Actions**.
2. The workflow needs read access to the private `hoesein/city-data` submodule. Configure repository Actions secret `CITY_DATA_TOKEN` with a fine-grained personal access token scoped to that repository and **Contents: Read-only**. The workflow can fall back to `github.token` if repository permissions allow access.
3. Keep the repository and data private-access assumptions in mind: the final deployed JSON is publicly served as part of this static site regardless of submodule privacy.

The Vite base path is derived from `GITHUB_REPOSITORY` in GitHub Actions, so the project site uses `/tgi-directory/` and `*.github.io` user/organization sites use `/`. The router, icons, data requests, manifest, and service-worker fallback use that base path.

## Ownership and contribution

Use the Profile page's Telegram, Facebook, or phone links to suggest corrections, request data removal, or provide missing directory/event details. Before adding user-supplied or externally sourced text/images, verify accuracy, permission to publish, and appropriate attribution. The app should clearly explain that listings and images can be outdated and offer a correction/removal contact.
