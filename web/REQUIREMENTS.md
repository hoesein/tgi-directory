# Product Requirements — Taunggyi Directory MVP v1

## Release baseline

- **Product:** Taunggyi Directory PWA
- **Release designation:** MVP v1
- **Code baseline:** `01e2416` (`add more contact info and dimmed the sign-in button`)
- **Application package version:** `1.0.0`
- **Deployment target:** GitHub Pages at `https://hoesein.github.io/tgi-directory/`
- **Client architecture:** React, TypeScript, Vite, React Router, TanStack Query, static JSON, and a generated service worker
- **Backend status:** Not required for the current directory/calendar flows. Legacy API and authentication scaffolding is not a supported MVP feature.

This document records what the baseline currently does, what it does not do, and the requirements to use when planning later versions. It is not a claim that every listed MVP behavior has been tested on all devices.

## Product goal

Help Taunggyi residents and visitors browse local services and places, see relevant Myanmar calendar and market-day information, and contribute corrections or missing data through developer contact links.

## Implemented MVP behavior

### Navigation and home

- The Home page provides category shortcuts, a food-place recommendation strip, an event ticker, and links to the directory, events, places, and profile areas.
- The bottom tab navigation appears on Home, Events, Places, and Profile; other pages have their own back navigation.
- Selecting a nearest-place card opens that listing's detail route.
- The home search field is visual only and does not perform a search.
- The notification/bell control currently navigates to Places to Visit; it is not a notification system.

### Directory browsing

- Categories and listing data are read from the `hoesein/city-data` submodule as static JSON.
- Users can browse all categories, open category listings, filter by listing type, search names and addresses within a category, and open a listing detail page.
- Listing details display the available image, category, address, rating, and phone numbers. Phone actions use `tel:`; map actions search the address in Google Maps.
- A listing's stable detail route uses the category filename and record index (`dir--<file>--<index>`). Preserve record order when updating a category JSON file unless IDs are migrated.
- Some missing listing images use a generic remote Unsplash fallback.

### Events and Myanmar calendar

- Market-day, Myanmar lunar-date, and official holiday calculations use `hoesein/shan_market_day`.
- The Home ticker displays today's Myanmar date, market day, and available holiday/special-day labels and links to Events.
- Events defaults to a selected-day view with a five-day strip, previous/next day controls, Today navigation, Myanmar date labels, and market-day details.
- Full/new moon dates are represented with Burmese labels. Tazaungdaing events and participant details are read from `tazaungdaing.json`.
- The month calendar implementation and month/day selector are currently not exposed as a usable toggle; the visible Events experience is day view.

### Profile, install, and offline

- Profile keeps sign-in/register visually disabled as “Coming soon,” and offers Telegram, Facebook, and tap-to-call developer contacts for corrections and contributions.
- Mobile browser users see an add-to-home-screen instruction guide once per browser tab session unless the app is already running in standalone/installed mode. This is an instructional guide, not a forced native browser install prompt.
- The PWA manifest, icons, standalone display, service worker, offline app shell, and precached build/data assets are configured.
- Offline behavior depends on a successful deployment/install or prior cache population; it does not make uncached remote content available offline.

## Routes

| Route | Current behavior |
| --- | --- |
| `/` | Home page |
| `/categories` | All categories |
| `/category/:categoryId` | Category listing with type filter and local search |
| `/category-detail/:listingId` | Directory listing details |
| `/events` | Selected-day calendar, market-day, and event information |
| `/events/tazaungdaing/:eventDate/:participantIndex` | Tazaungdaing participant details |
| `/notifications` | Static sample Places to Visit page (not notifications) |
| `/profile` | Developer contacts and disabled sign-in/register entry |
| `/login`, `/register` | Legacy scaffolding; not production authentication |

## Explicitly incomplete or not in MVP

These behaviors must not be represented as working MVP features:

1. **Authentication/account creation:** Login and registration routes currently accept form input and store a hard-coded dummy token. There is no real account API, password handling, or account security. Keep account access disabled from Profile until a real backend/authentication design is implemented; also remove or secure the directly accessible legacy routes before public launch if they remain.
2. **Global search:** The Home search form does not search or navigate.
3. **Curated destinations:** Places to Visit uses hard-coded sample places/images, not the city-data source or maintained authoritative data.
4. **Notifications:** No notification delivery, subscriptions, or alerts exist.
5. **User contributions in-app:** Suggestions are collected externally through contact links; users cannot edit or submit a listing through the app.
6. **Analytics:** No product analytics is configured. Sentry error reporting is optional and inactive without `VITE_SENTRY_DSN`.
7. **Automated tests:** No unit, integration, or end-to-end test suite is configured. Current verification is typecheck/build and lint.
8. **Quality validation:** Cross-browser/device accessibility, data correctness, content/image rights, and comprehensive offline scenarios still require manual/automated validation.

## Data contract and editorial requirements

- `categories.json` defines category filename, display name, description, count, sort order, and supported type codes.
- Each listing's `type` must be an object with `code` and `name`. Keep the other record data unchanged when a task specifically requests a type-schema migration.
- Listing detail routes currently depend on array indices. Avoid reordering records or inserting/deleting records without considering saved/deep links and any index-based references.
- `tazaungdaing.json` provides event dates and participants used by Events and participant detail pages.
- Data is built into a static public website. Anything shipped in the JSON or app bundle is publicly accessible; do not place secrets or non-public personal data in it.
- Treat third-party social/online information and photos as unverified until checked. Track sources and permissions where possible, provide appropriate attribution, and honor correction/removal requests through developer contact.
- Display a clear data accuracy/update disclaimer and a simple correction/removal contact wherever directory information is presented or promoted.

## Deployment and operational requirements

- Deploy from `.github/workflows/deploy-pages.yml` to GitHub Pages using the `web/` production build.
- The private data submodule requires workflow read access, normally through Actions secret `CITY_DATA_TOKEN`; never expose this credential in client environment variables or build output.
- The workflow currently runs `git submodule update --init --recursive --remote`, meaning it deploys branch-tip submodule content rather than strictly using the gitlink revisions recorded in the application commit. **Before calling deployments reproducible/release-ready, change deployment to use pinned recorded submodule revisions or explicitly make branch-tip data updates a reviewed release process.**
- Preserve support for project-site base paths in Vite, React Router, PWA manifest, data requests, icons, and service-worker navigation fallback.
- Retain `404.html` SPA fallback and `.nojekyll` in the Pages artifact.
- Configure GitHub Pages source as **GitHub Actions**. The deployed data files themselves are public even when the source submodule is private.

## MVP acceptance checklist

- [x] User can navigate between home, categories, listings, listing details, events, participant details, places, and profile.
- [x] Static directory data and market-calendar source are checked out as submodules.
- [x] Category type filter and in-category name/address search work.
- [x] Listing detail offers available phone/map actions.
- [x] Events display selected-day Myanmar date/market-day and available event data.
- [x] PWA install metadata, install instructions, and offline caching are configured.
- [x] Profile includes correction/contribution contact links.
- [ ] Home search performs a real search or is removed until implemented.
- [ ] Places to Visit is sourced from reviewed, maintained data instead of sample placeholders.
- [ ] Legacy dummy login/register flows are removed or replaced by actual authentication.
- [ ] Deployment is deterministic with reviewed/pinned submodule versions.
- [ ] Add automated tests for routing, data loading, search/filtering, event date rendering, and listing actions.
- [ ] Validate accessibility, responsive behavior, real iOS/Android browsers, and offline behavior.
- [ ] Publish a source/attribution and accuracy/removal notice appropriate to the data and photos used.

## Suggested next-version priorities

1. Remove/deactivate dummy authentication routes and confirm profile account behavior remains intentionally unavailable.
2. Make submodule revisions reproducible in deployment.
3. Replace destination samples with reviewed data and add global search over local directory records.
4. Add a focused test suite for core browsing and calendar behavior; then perform accessibility/device validation.
5. Establish data-source/attribution, verification, freshness, and correction/removal processes.
6. Decide whether future search, analytics, and notification features need a backend or remain static/client-side.

## Change-control note

When implementing a requirement, update this file to move it from incomplete to implemented only after verifying the behavior in code. Keep the README aligned with current behavior and setup. The baseline commit above identifies the source-code state designated MVP v1; a Git release tag is a separate repository operation.
