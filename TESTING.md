# GroupCart Testing

## Quality goals

Tests should protect the order lifecycle, quantity and threshold calculations, role boundaries, payment-state semantics, and the mobile-first UI's critical actions. A polished visual surface is not enough if the server can accept invalid joins or imply a verified payment incorrectly.

## Unit tests

Cover pure helpers for:

- Selecting the active price tier.
- Calculating committed quantity and remaining target quantity.
- Validating legal order lifecycle transitions.
- Mapping payment states to labels, icons, and safe copy.
- Formatting Pi amounts, dates, pickup windows, and quantities.

## Server and procedure tests

Test organizer-only create/update procedures, member join behavior, idempotent repeat joins, closed-order rejection, deadline rejection, invalid quantities, payment-reference recording, and the rule that a submitted reference does not become verified automatically.

Test that unauthorized users cannot read private participant/payment fields or mutate another organizer's order.

## Component and flow checks

Exercise the main seeded flow:

1. Open the public overview.
2. Enter the app dashboard.
3. Open the active order.
4. Change quantity and see threshold progress update.
5. Submit a payment reference and see Submitted, not Verified.
6. Review pickup terms.
7. Move the seeded order through organizer lifecycle controls.

Check mobile widths first, then tablet and desktop. Verify fixed bottom actions do not cover content and that dialogs remain usable with a keyboard.

## Accessibility checks

Verify heading hierarchy, form labels, keyboard navigation, visible focus, sufficient contrast, status text for non-color users, reduced-motion behavior, and touch targets of at least 44px where practical.

## Build checks

Before checkpointing, run:

```bash
pnpm check
pnpm test
pnpm build
```

Also verify that `/manus-routes.json` returns valid JSON with the complete route set and that `/api/health` returns a successful response when the server is running.

## Database caution

The managed database is shared across development and published environments. Avoid destructive test fixtures. Seed records must be idempotent, and tests that mutate persistent data should use isolated identifiers or reversible state transitions.
