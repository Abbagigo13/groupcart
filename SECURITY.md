# GroupCart Security

## Security posture

GroupCart handles community membership, order commitments, payment references, and pickup information. The app must be transparent about what it verifies and must not pretend that a UI status is a financial guarantee.

## Authentication and authorization

Use the starter's validated application session and preserve the `webdev_app_session` contract. Never create a parallel email/password system. Resolve the authenticated user server-side and enforce role checks in every protected tRPC procedure.

Members may access public order information and their own membership/payment records. Organizers may manage only communities and orders they own or are explicitly assigned to. Do not rely on client-side route guards or hidden buttons for authorization.

## Pi safety

- Never ask for a wallet passphrase, private key, seed phrase, or secret recovery phrase.
- Use only the official Pi integration boundary available to the project.
- Keep payment state explicit: not started, pending, submitted, verified, or needs review.
- Do not hold Pi, implement escrow, promise automatic refunds, or imply custody in the MVP.
- Treat a transaction reference supplied by a user as unverified until the supported server-side verification step succeeds.
- Do not log sensitive payment payloads or private credentials.

## Input and output safety

Validate all tRPC inputs with zod and validate again at the server boundary. Enforce length limits on product names, descriptions, supplier names, pickup terms, transaction references, and event messages. Escape or safely render user-provided text. Do not inject unsanitized HTML into the public documentation page.

## Cookies and sessions

Preserve the starter session validation and use `SameSite=None; Secure` for the application session cookie in public HTTPS Preview because Preview is embedded cross-site. Do not infer cookie security settings from the internal HTTP request scheme.

## Data minimization

Collect only what is needed for the core flow: community membership, order commitments, payment status/reference, and pickup terms. Do not collect passphrases, unnecessary identity documents, financial account credentials, or unrelated profile information. Avoid exposing email addresses or private user fields in participant lists.

## Abuse and operational risks

Provide report/block or organizer moderation controls where user-submitted content is introduced. Keep the first pilot invite-based or manually moderated. The UI should state that supplier fulfillment, product quality, pickup, refunds, and disputes remain organizer-managed in the MVP.

## Secrets and deployment

Private environment variables remain server-side. Browser configuration must expose only explicitly named public values. Review logs before checkpointing and remove debug output containing tokens, cookies, payment payloads, or personal data.
