# GroupCart — Product, Design, and Implementation Plan

## Product definition

GroupCart is a Pi Browser web app for one existing community to coordinate one group purchase from one known supplier. An organizer creates an order for one non-perishable product. Members join with a committed quantity, see quantity-threshold progress and projected per-person pricing, and complete or record a Pi payment where the supported environment allows it. The organizer manages the participant ledger, payment status, pickup terms, and final order state.

The first release is deliberately narrow: one community, one supplier, one product, one pickup location, organizer-managed fulfillment, and no delivery marketplace, platform-held escrow, broad dispute workflow, multi-vendor discovery, or claims of automated custody. The public site explains the product and technical integration; the authenticated dashboard demonstrates the end-to-end seeded flow.

## Goals and required outcomes

- Make the group-buying problem understandable within the first viewport.
- Let an organizer create and manage a single active group order.
- Let a member join, commit a quantity, view threshold progress, and see current/projected price per unit.
- Use Pi authentication/payment integration where the available environment supports it, without asking for passphrases or claiming custody/escrow.
- Show a credible seeded demo from draft/open through threshold updates, payment tracking, pickup, and closed/finalized state.
- Persist communities, orders, thresholds, members, commitments, pickup terms, and payment records in the managed database.
- Provide loading, skeleton, empty, validation, error, and success states throughout the app.
- Deliver a mobile-first UI designed for Pi Browser, with desktop layouts as an enhancement rather than the source layout.
- Include a public documentation-style landing page with Overview, How It Works, Features, Architecture, Documentation, API Reference, Getting Started, and FAQ sections.

## Information architecture and routes

- `/` — public product overview with the GroupCart story, live-looking order preview, how it works, feature highlights, architecture explainer, documentation links, API examples, getting started steps, and FAQ.
- `/app` — authenticated member/organizer dashboard. On mobile, this is the primary task surface with a bottom navigation bar; on desktop, it gains a slim left rail.
- `/app/order/:id` — order detail and participation view. Members see commitment, threshold progress, payment status, pickup terms, and order timeline. Organizers see participant and payment controls.
- `/app/create` — organizer order creation form for one supplier, one non-perishable product, thresholds, timing, and pickup terms.
- `/app/settings` — profile, community role, payment safety notes, and logout.
- `/404` — existing not-found route, preserved and used for unknown routes or confirmed missing records.
- `/manus-routes.json` — static route manifest kept in sync with the route set.

## Primary user flows

### Organizer flow

1. Authenticate through the existing platform session integration; never collect a passphrase.
2. Open the dashboard and select `Create order`.
3. Enter product name, product image or emoji fallback, supplier name, unit label, order deadline, pickup location, pickup window, and threshold pricing tiers.
4. Review the order summary and open it to the community.
5. Monitor committed quantity, threshold progress, participant list, payment states, and pickup terms.
6. Finalize the order after the deadline or when the community reaches the required threshold.
7. Mark pickup readiness and close the order after the community receives the product.

### Member flow

1. Open the active order from the dashboard or a shared order card.
2. Review supplier, product, price tiers, deadline, pickup terms, and remaining quantity.
3. Choose a quantity and join the order.
4. See the progress update immediately, including current price and next threshold.
5. Use the Pi payment action where supported, or record a payment reference through an honest non-custodial status flow.
6. Track payment verification, pickup readiness, and final order state.

## Data and backend architecture

Use the initialized React/Express/tRPC/Drizzle stack and managed MySQL database.

### Tables

- `communities`: id, name, slug, description, organizerUserId, createdAt, updatedAt.
- `orders`: id, communityId, organizerUserId, supplierName, productName, productDescription, productImageUrl, unitLabel, status (`draft`, `open`, `threshold_met`, `payment_window`, `finalized`, `ready_for_pickup`, `closed`), minimumQuantity, targetQuantity, committedQuantity, orderDeadline, pickupLocation, pickupWindow, createdAt, updatedAt.
- `priceTiers`: id, orderId, minimumQuantity, pricePerUnitPi, label, createdAt.
- `orderMembers`: id, orderId, userId, committedQuantity, paymentStatus (`not_started`, `pending`, `submitted`, `verified`, `needs_review`), paymentReference, joinedAt, updatedAt.
- `paymentRecords`: id, orderId, orderMemberId, amountPi, status, transactionReference, provider (`pi`), submittedAt, verifiedAt, notes.
- `orderEvents`: id, orderId, actorUserId, type, message, metadataJson, createdAt.

For a first functional pass, seeded data should be created idempotently for one demo community, one active order, realistic members, and a complete lifecycle timeline. The schema and query helpers should remain ready for real records.

### API surface

Use tRPC for application data and mutations:

- `auth.me`, `auth.logout` — preserve starter behavior.
- `community.getCurrent` — current community and current user's role.
- `order.listActive` — active order cards for the current community.
- `order.getById` — order details with tiers, member commitment, payment state, and events.
- `order.create` — organizer-only order creation with validation.
- `order.join` — member quantity commitment and idempotent membership behavior.
- `order.updateStatus` — organizer-only lifecycle transitions.
- `order.submitPayment` — record a Pi transaction reference or supported payment state without custody claims.
- `order.verifyPayment` — organizer/admin action for the MVP's review flow; later it can call the official Pi server verification path.
- `order.listMembers` — organizer-only participant ledger.

Return safe error messages for unauthenticated, unauthorized, invalid quantity, closed order, expired deadline, and missing order states. Keep payment state explicit so the UI never implies that a transaction is verified when it is only submitted.

## Design exploration

Three candidate styles:

1. **Warm civic utility** — paper-like surfaces, ink typography, citrus accent, and community noticeboard cues; probability 0.06.
2. **Quiet fintech editorial** — restrained off-white canvas, deep indigo, chartreuse action color, serif display headlines, and precise data cards; probability 0.03.
3. **Field guide commerce** — dark evergreen shell, mineral panels, signal-orange accents, tactile stamps, and modular dashboard blocks; probability 0.08.

### Chosen direction: Claymorphism with editorial-fintech clarity

#### Design movement

A blend of friendly Claymorphism and modern editorial fintech: soft, tactile, and community-oriented on the surface, with sharp typography and explicit state language for Pi amounts, thresholds, payments, and pickup. The supplied Claymorphism reference is the direction for the visual softness, but GroupCart will avoid generic finance-dashboard styling and will not use clay depth on every dense data surface.

#### Core principles

- **Show the transaction state:** quantity, threshold, payment, and pickup status should be visible before decorative content.
- **Make group progress tangible:** use threshold bars, participant marks, and timeline events as the primary visual language.
- **Earn trust through restraint:** no hype language, fake scarcity, or unexplained blockchain claims; soft visuals never hide payment truth.
- **Respect the thumb:** controls are large, reachable, and ordered around the one task a user needs to complete now.

#### Color philosophy

Use a soft lavender-white canvas and white clay surfaces to create approachability, then use deep ink for readable text. The signature brand color becomes **GroupCart Purple**, while mint marks community progress and verified success and coral marks attention or pending states. Keep gradients rare. Use clay shadows and subtle highlight edges for hero/order cards and primary controls, but keep tables, code blocks, and API examples flatter for scanning.

- Canvas: `#F7F5FC`
- Surface: `#FFFFFF`
- Lavender: `#F0ECFF`
- Mint: `#DDF6EA`
- GroupCart Purple: `#8B78E6`
- Deep Purple: `#5F4BC2`
- Coral: `#F39A79`
- Ink: `#242238`
- Muted: `#77738C`
- Line: `#E7E3F2`

#### Layout paradigm

Use a documentation-style split: a sticky public navigation rail on larger screens, a compact top bar on mobile, and a dashboard that follows a vertical “order story” rather than a centered marketing grid. The active order is the visual spine. On desktop, use a broad main column for progress and activity with a narrow right rail for payment/pickup actions. On mobile, collapse into stacked cards with a fixed bottom action bar.

#### Signature elements

- A **threshold ribbon**: an orange progress line with circular quantity stops and a small “next price” marker.
- **Receipt tabs**: small uppercase labels and clipped-corner metadata blocks for supplier, deadline, pickup, and payment.
- **Community dots**: small overlapping participant markers that turn into initials on hover/tap and communicate group momentum without becoming a social feed.

#### Interaction philosophy

Interactions should confirm rather than entertain. Joining an order updates the threshold ribbon and current price with a short, eased number transition. Payment status changes use a concise success toast and a timeline event. Buttons have a tactile 1px press treatment. Forms validate inline with clear recovery copy. Avoid long modal flows; use a bottom sheet on mobile for quantity commitment and payment confirmation.

#### Animation

Use `framer-motion` for short, purposeful transitions: 180–240ms ease-out for cards entering, 300ms for progress changes, and a one-time 500ms success pulse after a join/payment action. Clay surfaces may lift slightly on pointer hover and compress on tap. Respect `prefers-reduced-motion`. Skeletons use a soft opacity shimmer, never a fast flashing gradient. Avoid parallax and continuous decorative motion.

#### Typography system

Use a friendly editorial display face for public headlines and a neutral sans for data. Prefer `Fraunces` or `DM Serif Display` for large public headlines and `DM Sans` or `Inter` for UI/data if the runtime can load them; fall back to Georgia and system sans without breaking. Headlines should be compact and sentence case. UI labels use 11–12px uppercase with tracked lettering. Body copy uses 15–16px with generous line height. Numbers in thresholds and Pi amounts use tabular numerals.

#### Brand essence

**GroupCart helps one community turn a messy group order into a clear, Pi-powered commitment.** Personality: grounded, generous, precise.

#### Brand voice

Headlines speak plainly: “Buy together. Know where the order stands.” CTAs are direct and calm: “Join this order” and “Create a group order.” Microcopy names what is true: “Payment submitted — waiting for organizer verification,” never “Payment complete” unless the record is actually verified.

#### Wordmark and logo

A compact wordmark with a squared cart-basket mark made from three stacked quantity bars, with the bottom bar extending into a short handle. The mark can be rendered as a simple CSS/SVG shape so it remains sharp in the Pi Browser and does not depend on an external image.

#### Signature brand color

GroupCart Purple `#8B78E6` is the ownable brand color. It appears in the wordmark accent, focused controls, threshold progress, and primary CTA. Mint is reserved for verified success; coral is reserved for attention.

## Component system

Create reusable components for:

- `BrandMark`, `PublicNav`, `MobileBottomNav`, `SectionHeading`.
- `OrderHeroCard`, `ThresholdRibbon`, `OrderMetaTabs`, `MemberStack`, `StatusPill`, `OrderTimeline`.
- `MetricCard`, `ParticipantTable`, `PaymentStatusRow`, `PriceTierTable`, `ProgressChart`.
- `CreateOrderForm`, `QuantityStepper`, `PaymentSheet`, `ConfirmDialog`, `ToastFeedback`.
- `SkeletonCard`, `EmptyState`, `InlineError`, `ErrorPanel`, `SuccessBanner`.

Prefer CSS and existing Radix primitives over one-off styling. Make focus states visible, use semantic headings, label form fields, and ensure buttons remain usable at mobile widths.

## Documentation page sections

The public homepage should be a single long-form page with anchored navigation:

- **Overview:** the pain, the narrow pilot, the product promise, and a live-looking active-order preview.
- **How It Works:** five steps from organizer setup to pickup closure.
- **Features:** threshold pricing, member commitments, Pi payment status, pickup terms, and organizer ledger.
- **Architecture:** browser, React/tRPC server, Pi integration boundary, and managed database diagram.
- **Documentation:** concise implementation notes and safety principles.
- **API Reference:** endpoint/procedure cards with request/response examples and payment-state semantics.
- **Getting Started:** organizer setup, member flow, and local development commands.
- **FAQ:** Pi payments, refunds/escrow boundaries, joining after thresholds, data collection, and demo-mode behavior.

## Project structure

- `client/src/App.tsx` — route map and providers.
- `client/src/pages/Home.tsx` — public documentation-style landing page.
- `client/src/pages/Dashboard.tsx` — authenticated app dashboard.
- `client/src/pages/OrderDetail.tsx` — member/organizer order workspace.
- `client/src/pages/CreateOrder.tsx` — organizer form.
- `client/src/pages/Settings.tsx` — account and safety settings.
- `client/src/components/groupcart/` — GroupCart-specific visual and interaction components.
- `client/src/lib/` — tRPC hooks, formatting, and demo helpers.
- `client/src/index.css` — design tokens, responsive styles, motion primitives, and typography.
- `server/routers.ts` — tRPC procedures and authorization checks.
- `server/db.ts` — typed queries and seed helpers.
- `drizzle/schema.ts` — persistent data model.
- `drizzle/` — additive migrations.
- `public/manus-routes.json` — route manifest.
- `app.config.ts` — project logo metadata before checkpointing.

## Delivery stages

1. Foundation and Claymorphism/editorial visual system.
2. Seeded dashboard and order detail flow with clear UI states.
3. Create-order form and organizer/member interactions.
4. Persistent schema, queries, and protected tRPC procedures.
5. Pi payment boundary/status semantics and safety copy.
6. Diagnostics, typecheck, build, accessibility, and read-only acceptance review.
7. Commit and push the finished change to canonical `main` for a checkpoint; do not publish unless explicitly requested.
