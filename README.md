# GroupCart

GroupCart is a mobile-first Pi Browser web app that helps one existing community coordinate one group purchase without messy chat threads, payment screenshots, or spreadsheet reconciliation.

## What we are building

An organizer creates one group order for one known supplier and one non-perishable product. Community members join the order, choose a quantity, see the current price tier and threshold progress, and submit or verify a Pi payment where the supported environment allows it. The organizer sees the participant ledger, payment states, pickup terms, and order lifecycle from open to closed.

The first release is intentionally narrow. GroupCart is not a global marketplace, delivery service, escrow wallet, or broad dispute-resolution platform. It is a focused coordination and payment-status tool for a community that already exists.

## Who it is for

GroupCart is for community organizers who currently coordinate bulk purchases through WhatsApp, Telegram, spreadsheets, or handwritten lists. It is also for members who want to know how many people have joined, what price they will pay, whether their payment was recorded, and where and when to collect the order.

The first pilot should target one reachable group of roughly 20–100 people, one trusted organizer, one supplier, and one non-perishable product. A real pilot is more valuable than a large set of simulated marketplace listings.

## The problem

Group purchases are often coordinated through fragmented messages. Members ask for the latest price, send payment screenshots, change quantities, and miss pickup instructions. Organizers manually add quantities, calculate thresholds, chase unpaid members, and reconcile the final order. The process is slow, opaque, and easy to get wrong.

## The solution

GroupCart gives the community one shared order record. Everyone sees the same product, supplier, deadline, quantity progress, price tier, pickup terms, and payment status. The organizer keeps operational control while the app makes the state visible and easy to update.

Pi is used as the native community payment rail where supported. GroupCart never asks for a passphrase and does not claim to hold funds or provide escrow. The interface clearly distinguishes payment submitted from payment verified.

## Product principles

- Make group progress visible.
- Keep payment language honest.
- Start with a real community, not an empty marketplace.
- Design for the thumb first.
- Reduce coordination work before adding features.

## Build phases

1. **Foundation and visual system:** establish the Claymorphism-plus-editorial-fintech direction, design tokens, route structure, logo, responsive shell, and documentation landing page.
2. **Seeded product experience:** build the active-order dashboard, threshold ribbon, order detail page, lifecycle timeline, participant states, and seeded demo data.
3. **Organizer and member actions:** add create-order form, quantity commitment, join flow, status transitions, pickup terms, and clear loading/error/success states.
4. **Persistence and API:** add Drizzle schema, migrations, typed database queries, tRPC procedures, authorization checks, and idempotent seed data.
5. **Pi payment boundary:** connect supported Pi authentication/payment capabilities, record transaction states safely, and keep non-custodial messaging explicit.
6. **Quality and checkpoint:** run diagnostics, typecheck, tests, build, requirements review, and commit the finished change to the canonical `main` branch. Publishing is separate and requires an explicit request.

## Local development

```bash
pnpm dev
pnpm check
pnpm test
pnpm build
pnpm db:push
```

The development server uses port 3000 by default and honors `PORT`. The project uses React, Express, tRPC, Drizzle, MySQL-compatible managed database resources, Tailwind CSS, Radix UI primitives, Lucide icons, and Framer Motion.

## Main routes

- `/` — public product and technical documentation.
- `/app` — member and organizer dashboard.
- `/app/order/:id` — active order workspace.
- `/app/create` — organizer order creation.
- `/app/settings` — profile, role, payment safety, and logout.

## Safety boundary

No feature may ask a Pioneer to enter a wallet passphrase. No feature may imply that GroupCart holds Pi, guarantees a refund, verifies physical fulfillment, or provides escrow unless that capability is explicitly implemented and reviewed. Payment states must be precise: not started, pending, submitted, verified, or needs review.

## Project documentation

- [Design system](DESIGN_SYSTEM.md)
- [Architecture](ARCHITECTURE.md)
- [Database](DATABASE.md)
- [Security](SECURITY.md)
- [Code style](CODE_STYLE.md)
- [Testing](TESTING.md)
- [Agent instructions](AGENTS.md)
- [Build phases](PHASES.md)
