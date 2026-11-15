# GroupCart Database

## Database contract

The project uses the managed MySQL-compatible database through Drizzle ORM. Development and published environments share the project database, so schema changes and seed writes must be intentional, additive, and reversible where possible.

## Core entities

### communities

Stores the existing group that is coordinating the purchase. A community has a name, slug, description, organizer user, and timestamps.

### orders

Stores the single group order. Important fields include community, organizer, supplier, product, unit label, order status, quantity targets, current committed quantity, deadline, pickup location, pickup window, and timestamps.

### priceTiers

Stores threshold pricing for an order. Each tier has a minimum quantity, Pi price per unit, and a human-readable label. Tiers should be ordered by minimum quantity before calculating the active price.

### orderMembers

Connects a user to an order. It stores committed quantity, payment status, optional transaction reference, join time, and update time. A user should have at most one active membership row per order; joining again updates quantity rather than duplicating a participant.

### paymentRecords

Stores payment provider, amount, transaction reference, status, submitted time, verified time, and notes. The record is an audit trail, not a wallet balance or escrow account.

### orderEvents

Stores a readable timeline of important actions, including order opened, member joined, quantity changed, payment submitted, payment verified, threshold reached, pickup ready, and order closed. Metadata should be JSON only when a structured value is necessary.

## Invariants

- An order belongs to exactly one community and one organizer.
- An order has one known supplier and one product in the first release.
- Committed quantities cannot be negative or exceed the configured maximum without an explicit organizer rule.
- Price calculations use the highest threshold whose minimum quantity is less than or equal to the committed quantity.
- A closed order cannot accept new joins or quantity changes.
- Payment records cannot be marked verified solely because a user supplied a reference.
- Lifecycle transitions are validated server-side and recorded in `orderEvents`.
- Seed data must be idempotent and must not overwrite real user changes.

## Migrations and seed data

Schema changes are committed as additive Drizzle migrations. Use `pnpm db:push` only after inspecting the generated migration. Use `pnpm db:migrate` to apply committed migrations. Seed data should use a stable community/order identifier or a versioned seed marker and should only create missing demo records.

Because development and production share the database, do not delete tables or reset the database during normal development. Destructive schema changes require explicit approval and a documented loss assessment.

## Query patterns

Keep database access in `server/db.ts` or focused query modules. Use transactions for join-plus-event, payment-status-plus-event, and lifecycle-transition-plus-event operations. Return only the fields required by the current procedure. Avoid leaking private user fields to member-facing order responses.
