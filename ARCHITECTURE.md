# GroupCart Architecture

## System overview

GroupCart is a React frontend served by an Express application. tRPC provides typed application procedures between the client and server. Drizzle ORM maps the business schema to the managed MySQL-compatible database. Platform authentication remains behind the starter's validated session flow. Pi authentication and payments are treated as an integration boundary with explicit transaction states.

```text
Pi Browser / Mobile Web
        |
        v
React + Wouter + Tailwind + Radix UI
        |
        v
TanStack Query + tRPC client
        |
        v
Express + tRPC routers + authorization
        |
        +--> Pi integration boundary
        |
        v
Drizzle ORM -> Managed MySQL
```

## Frontend boundaries

`client/src/pages` owns route-level composition. `client/src/components/groupcart` owns product-specific components. `client/src/components/ui` remains the reusable primitive layer. `client/src/lib` owns typed API hooks, formatting, demo helpers, and shared client utilities. Page components should not contain database assumptions or payment-provider implementation details.

The public homepage is a documentation-style long-form route. The application routes use a responsive shell: compact top bar and bottom navigation on mobile, slim left rail and wider content columns on desktop.

## Backend boundaries

`server/routers.ts` owns the public typed procedure surface and authorization checks. `server/db.ts` owns query helpers and transaction-oriented persistence functions. `drizzle/schema.ts` owns the canonical application schema. Payment integration code should live in a dedicated server module and expose safe operations such as creating a payment intent, recording a transaction reference, and verifying a supported transaction.

Do not put Pi secrets, payment verification logic, or database credentials in client code. Do not make the UI infer a verified payment from a submitted transaction reference.

## Application roles

- **Member:** view the current community order, join with a quantity, submit payment status, and view their own order state.
- **Organizer:** create and manage the active order, inspect the participant ledger, review payment records, and move the order through permitted lifecycle states.
- **Admin:** reserved for project-level moderation or support operations. Do not expose admin controls in the member UI.

Authorization must be enforced in tRPC procedures, not only by hiding buttons in the client.

## Order lifecycle

`draft -> open -> threshold_met -> payment_window -> finalized -> ready_for_pickup -> closed`

Some transitions can move back to `open` when a threshold is no longer met. The server should validate all transitions and write an `orderEvents` record for meaningful changes.

## API conventions

Procedures should use zod input validation, return typed data, and throw safe `TRPCError` codes. Mutations should be idempotent where a user might tap twice or retry after a slow network response. Errors should distinguish unauthenticated, forbidden, invalid input, missing record, conflict, and dependency failure.

## Deployment

Development uses `pnpm dev` and port 3000. Production uses the checked-in Dockerfile and `/api/health`. The route manifest at `public/manus-routes.json` must match the client routes. Before checkpointing, the project root should contain valid logo metadata in `app.config.ts`.
