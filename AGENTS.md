# GroupCart Agent Instructions

## Read first

Before changing the project, read `README.md`, `plan.md`, `DESIGN_SYSTEM.md`, `ARCHITECTURE.md`, `DATABASE.md`, `SECURITY.md`, `CODE_STYLE.md`, and `TESTING.md`. Preserve the product scope and safety boundaries defined there.

## Product scope

Build the first pilot for one existing community, one supplier, one non-perishable product, and one pickup location. Do not expand into a global marketplace, delivery service, escrow wallet, or broad dispute system without an explicit product decision.

## Design scope

Use Claymorphism combined with editorial-fintech clarity. Soft clay depth is for hero/order cards and primary controls. Keep dense data, API reference, and status tables flatter and easier to scan. Design mobile first and test the smallest layout before desktop.

## Safety scope

Never ask for passphrases or private keys. Never claim that GroupCart holds funds, provides escrow, guarantees refunds, or verifies physical fulfillment unless the capability is truly implemented and reviewed. Keep payment states precise.

## Implementation workflow

1. Inspect existing files and preserve user/concurrent changes.
2. Update `TODO.md` with outcome-based criteria before implementation.
3. Make focused changes in the existing React/Express/tRPC/Drizzle structure.
4. Keep route manifests, schemas, migrations, and docs synchronized.
5. Run diagnostics after edits, then `pnpm check`, `pnpm test`, and `pnpm build`.
6. Review changed files for secrets, unsafe copy, accessibility regressions, and scope drift.
7. Commit and push only the intended work to canonical `main` for a checkpoint. Do not publish without explicit instruction.

## Do not

- Do not invent Pi API capabilities or expose private configuration to the browser.
- Do not use client-only authorization.
- Do not overwrite unrelated user work.
- Do not reset or destructively migrate the shared managed database.
- Do not replace real login with a fake development user.
- Do not introduce a second UI framework or a parallel auth/payment system without an explicit decision.
