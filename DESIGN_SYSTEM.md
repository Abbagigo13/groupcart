# GroupCart Design System

## Direction

GroupCart combines **Claymorphism** with a restrained editorial-fintech interface. Claymorphism provides warmth, friendliness, soft depth, and approachability. Editorial fintech keeps the product legible and credible when users are looking at Pi amounts, threshold pricing, payment states, and pickup instructions.

The reference direction is soft white surfaces, lavender and mint clay forms, rounded panels, gentle shadows, and playful dimensional accents. GroupCart should borrow that softness without copying the reference's generic finance dashboard language.

## Design principles

1. **Soft shell, sharp truth.** Surfaces can be rounded and tactile, but payment and order-state labels must be precise.
2. **One visible order story.** The active order, threshold, payment status, and pickup terms should feel like one continuous narrative.
3. **Friendly depth, not decoration everywhere.** Use clay depth for primary cards and controls; keep tables, timelines, and API examples flatter for scanning.
4. **Mobile first.** The smallest layout is the source of truth. Desktop adds breathing room and a secondary rail rather than shrinking a desktop grid.

## Color tokens

- `--gc-canvas`: `#F7F5FC`, soft lavender-white page canvas.
- `--gc-surface`: `#FFFFFF`, readable card face.
- `--gc-surface-soft`: `#F0ECFF`, lavender clay surface.
- `--gc-mint`: `#DDF6EA`, positive community/progress surface.
- `--gc-lavender`: `#8B78E6`, primary brand accent.
- `--gc-purple`: `#5F4BC2`, focused/active accent.
- `--gc-coral`: `#F39A79`, attention and pending state.
- `--gc-ink`: `#242238`, primary text.
- `--gc-muted`: `#77738C`, secondary text.
- `--gc-line`: `#E7E3F2`, borders and dividers.
- `--gc-success`: `#2D8A67`, verified payment and completed order.
- `--gc-danger`: `#B9565E`, destructive and failed state.

Purple is the signature GroupCart color. Mint signals community progress and verified success. Coral is reserved for “needs attention” states. Never use color alone to communicate payment status; pair it with text and an icon.

## Clay surfaces

Clay cards use a light face, a soft outer shadow, and a small inset highlight rather than a heavy border. Avoid extreme neumorphism that lowers contrast or makes controls look disabled.

Recommended pattern:

```css
background: var(--gc-surface);
box-shadow: 0 18px 40px rgba(91, 75, 194, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.9);
border: 1px solid rgba(139, 120, 230, 0.10);
border-radius: 24px;
```

Use smaller radii for data tables, code blocks, and dense administrative rows.

## Typography

Use a friendly display face for public headlines and a neutral sans for UI/data. Preferred pairing: `Fraunces` or `DM Serif Display` for large headlines, with `DM Sans` or `Inter` for controls and body copy. If external font loading is unavailable, fall back to Georgia for display and system sans for UI.

Headlines are sentence case. UI labels are compact and readable. Pi amounts and quantities use tabular numerals. Body copy is 15–16px with generous line height.

## Components

- **Clay hero card:** soft lavender or mint surface with one clear headline, one primary action, and a small group-progress visual.
- **Threshold ribbon:** a high-contrast progress line with circular quantity stops and a “next price” marker.
- **Receipt tab:** compact metadata block for supplier, deadline, pickup, and payment state.
- **Community dots:** overlapping initials or avatars that show participation without creating a social feed.
- **Status pill:** icon plus text; use Verified, Submitted, Pending, Needs review, and Closed rather than ambiguous colors.
- **Bottom action bar:** on mobile, keep the next action fixed and reachable when it is essential to the current flow.
- **Data table:** flatter white surface with subtle row separators; do not claymorph every row.

## Interaction and motion

Use 180–240ms transitions for surface and navigation changes. Use approximately 300ms for threshold progress and quantity number changes. Use a single 500ms success pulse after join or payment submission. Support `prefers-reduced-motion` by removing non-essential movement.

Buttons have a small press scale or 1px translation. Cards lift only on hover for pointer devices. On touch, use tap feedback instead of hover-dependent information.

## States

Every async action needs a loading state, a success state, and a recoverable error state. Skeletons use a quiet opacity shimmer. Empty states explain what the user can do next. Error copy must say what happened and how to retry. Payment language must distinguish submitted from verified.

## Accessibility

Maintain WCAG-minded contrast for text and controls. Provide visible focus rings, semantic headings, labels, keyboard access, 44px minimum touch targets, reduced-motion support, and text alternatives for icons. Never communicate a critical payment or order state through color alone.
