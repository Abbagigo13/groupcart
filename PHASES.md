# GroupCart Build Phases

## Phase 1 — Foundation and visual system

Set up the route map, documentation landing page, responsive shell, project logo, design tokens, Claymorphism surfaces, editorial typography, and reusable status/progress components. The public site must explain the product to a new user without requiring login.

## Phase 2 — Seeded product experience

Build the dashboard, active order card, threshold ribbon, participant markers, order detail workspace, payment-state panel, pickup terms, and order timeline. Use idempotent demo data so a reviewer can see a complete realistic order without first creating records.

## Phase 3 — Organizer and member interactions

Add create-order, join-order, quantity changes, lifecycle controls, payment-reference submission, organizer review states, and responsive feedback. Every action must have loading, success, validation, and recoverable error states.

## Phase 4 — Persistence and API

Add Drizzle schema and migrations for communities, orders, price tiers, memberships, payments, and events. Add typed tRPC queries/mutations and server-side role checks. Connect UI state to durable records and keep seed creation idempotent.

## Phase 5 — Pi payment boundary

Integrate supported Pi authentication/payment capabilities. Keep payment states honest and non-custodial. Add server-side verification only where the supported integration provides it. Never ask for a passphrase or imply escrow.

## Phase 6 — Quality, review, and checkpoint

Run diagnostics, typecheck, tests, build, route-manifest checks, accessibility checks, and a read-only requirements review. Fix confirmed issues, commit to canonical `main`, and verify the checkpoint. Publishing remains a separate explicit decision.
