# GroupCart Code Style

## General

Use TypeScript for application code. Prefer small, named functions with explicit inputs and return types where inference does not communicate intent. Use the existing formatter and project conventions rather than introducing a second formatting system.

Run `pnpm format` on intended files before a checkpoint and `pnpm check` before delivery. Avoid unrelated formatting churn.

## React

Use functional components and hooks. Keep route-level composition in page files and reusable product UI in `client/src/components/groupcart`. Keep components accessible: semantic HTML, labels, keyboard support, focus states, and meaningful button text.

Do not put database calls directly in presentational components. Use typed tRPC hooks or a focused data hook. Keep loading, empty, error, and success states adjacent to the data they describe.

## TypeScript and data

Prefer discriminated unions for order and payment statuses. Avoid `any`; use `unknown` at unsafe boundaries and narrow it. Share status labels and formatting helpers rather than duplicating string literals across pages.

Validate mutation inputs on the server. Client validation improves feedback but is not a security boundary.

## Styling

Use Tailwind utilities and the GroupCart design tokens. Claymorphism should be controlled: use soft depth for key surfaces, not every row or table cell. Keep typography and spacing consistent with `DESIGN_SYSTEM.md`. Prefer existing Radix primitives for dialogs, tabs, tooltips, and accessible overlays.

Use Lucide icons with labels or accessible text. Do not use emoji as the only icon for a critical action.

## Naming

Use PascalCase for React components, camelCase for functions and variables, and descriptive names for tRPC procedures. Name order and payment states according to the domain vocabulary in `DATABASE.md`.

## Comments

Comment the reason behind a non-obvious decision, especially payment safety, lifecycle transitions, idempotency, or data privacy. Do not write comments that merely restate the code.

## Git and changes

Keep commits cohesive and descriptive. Do not force-push or rewrite main history. Before a checkpoint, fetch and integrate the canonical `origin/main`, run checks, and push the intended commit. Do not enable publication automatically.
