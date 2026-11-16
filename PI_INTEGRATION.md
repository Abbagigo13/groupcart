# Pi Network Integration

GroupCart uses the official Pi Browser SDK and Pi Platform API. The browser starts authentication and User-to-App payments; the server is the source of truth for identity verification, payment approval, and payment completion.

## Environment configuration

Set these variables in the project environment. Never expose `PI_API_KEY` as a `VITE_` variable.

```env
PI_API_KEY=your-server-api-key-from-the-pi-developer-portal
PI_SANDBOX=true
PI_API_BASE=https://api.minepi.com/v2
VITE_PI_SANDBOX=true
```

Use `true` for Pi Testnet/Sandbox during development. Use `false` for Mainnet only after the production HTTPS domain is registered and validated in the Pi Developer Portal. The browser and server flags must point to the same network.

## Authentication

The client loads `https://sdk.minepi.com/pi-sdk.js`, calls `Pi.init({ version: "2.0", sandbox })`, then calls `Pi.authenticate(["username", "payments"], onIncompletePaymentFound)`. The returned access token is sent to `POST /api/pi/verify`. GroupCart verifies it with Pi's `GET /v2/me` endpoint and stores only the verified Pi UID and username mapping. Access tokens are kept in session storage for the current browser session and are never persisted in the database.

## Payment lifecycle

1. The member joins the GroupCart order.
2. `Pi.createPayment` opens the official Pi payment dialog with the order ID in metadata.
3. `onReadyForServerApproval(paymentId)` calls `/api/pi/payments/approve`.
4. The server retrieves the payment from Pi, confirms the authenticated Pi UID, order metadata, order state, and membership, stores the Pi payment ID, and calls `POST /v2/payments/{paymentId}/approve` with the server-only API key.
5. The Pioneer confirms and signs the transaction in Pi Wallet.
6. `onReadyForServerCompletion(paymentId, txid)` calls `/api/pi/payments/complete`.
7. The server calls `POST /v2/payments/{paymentId}/complete` with the real transaction ID. GroupCart marks the record `verified` only when Pi returns a successful developer-completed and transaction-verified response.

The completion route is idempotent because Pi retries approval and completion callbacks. Incomplete payments are passed to the same completion route through `onIncompletePaymentFound`.

## Safety boundary

GroupCart never asks for wallet passphrases, private keys, or seed phrases. It does not custody Pi, operate escrow, promise refunds, or mark a payment verified when a user merely pastes a transaction reference. Manual references remain a separate organizer-review path.

## Official references

- [Pi Authentication](https://developers.minepi.com/docs/authenticate-user/Authentication)
- [Pi Client SDK Reference](https://developers.minepi.com/docs/api-reference/SdkReference)
- [Pi Payments](https://developers.minepi.com/docs/accept-payment/Payments)
- [Pi Developer Payment Flow](https://developers.minepi.com/docs/accept-payment/DevPayFlow)
- [Pi Mainnet vs Testnet](https://developers.minepi.com/docs/concepts/MainVsTest)
- [Pi Production App Access](https://developers.minepi.com/docs/build-first-app/Production)
