# GroupCart TODO

## Outcome 1 — Public documentation landing page — complete

- The `/` route explains what GroupCart is, who it serves, the coordination problem, and the narrow single-community solution.
- The page includes Overview, How It Works, Features, Architecture, Documentation, API Reference, Getting Started, and FAQ sections.
- The page uses the approved Claymorphism plus editorial-fintech visual direction and works responsively from mobile through desktop.
- The page uses precise copy about Pi and does not claim escrow, custody, automated refunds, or physical fulfillment verification.

## Outcome 2 — Responsive application shell and seeded dashboard — complete

- The `/app` route presents a mobile-first dashboard with a compact top bar, active order card, threshold progress, member participation, payment state, pickup terms, and timeline.
- Desktop layouts add a navigation rail and a secondary information rail without squeezing the mobile layout.
- Loading, empty, error, and success states are represented through reusable UI components.
- The seeded order demonstrates one community, one supplier, one non-perishable product, threshold pricing, members, and payment states.

## Outcome 3 — Order detail and member interaction — prototype complete

- The `/app/order/:id` route shows product and supplier details, committed quantity, current/projected price, deadline, pickup terms, payment status, and order events.
- A member can select a quantity and submit a join action with validation and success feedback.
- Payment copy distinguishes not started, pending, submitted, verified, and needs review.
- The experience does not ask for wallet passphrases or imply platform-held escrow.

## Outcome 4 — Organizer flow — prototype complete

- The `/app/create` route supports one supplier, one non-perishable product, quantity thresholds, deadline, pickup location, and pickup window.
- Organizer controls are role-aware and lifecycle transitions are explicit.
- The participant ledger exposes committed quantity and payment status without leaking unrelated private profile data.

## Outcome 5 — Persistent data and typed API — complete

- Drizzle schema includes communities, orders, price tiers, order memberships, payment records, and order events.
- tRPC procedures validate inputs, enforce role permissions, and return typed data for active orders, order details, joins, lifecycle changes, and payment references.
- The pilot seed path is idempotent and does not overwrite real user changes.

## Outcome 6 — Pi payment integration boundary — complete for code and server integration; Pi Browser E2E pending

- The official Pi SDK is loaded and initialized with explicit Testnet/Sandbox or Mainnet configuration; Pi authentication requests `username` and `payments` scopes and sends the access token to server-side `/v2/me` verification.
- User-to-App payments use the official approval → blockchain → completion lifecycle, including incomplete-payment recovery, metadata/order/member validation, idempotent records, real `paymentId`/`txid` forwarding, and verified-only payment status.
- The Pi Server API Key is configured as a server-only project secret for Testnet; it is not exposed in client code.
- A submitted transaction reference remains submitted until a supported verification step confirms it.
- The app never collects passphrases, private keys, or seed phrases and never claims to hold funds or provide escrow.

- Remaining external step: open GroupCart in the Pi Testnet/Sandbox, authenticate, join the seeded order, and complete one Test-Pi payment end to end.

## Outcome 7 — Quality and checkpoint — partial

- `public/manus-routes.json` matches the implemented page routes.
- TypeScript diagnostics, `pnpm check`, `pnpm test`, and `pnpm build` pass.
- Critical mobile flows, accessibility states, and safety copy are reviewed.
- The intended changes are committed and pushed to canonical `main` for a checkpoint; publication remains separate and is not enabled automatically.
