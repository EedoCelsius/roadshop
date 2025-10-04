# Stripe payment backend (Node.js)

This directory contains a lightweight Express server that issues Stripe Payment Intents for the card payment experience.

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy the example key file and provide your Stripe credentials:

   ```bash
   cp stripe-keys.example.json stripe-keys.json
   ```

   Update `stripe-keys.json` with your publishable (`public_key`) and secret (`secret_key`) keys.

3. Start the server:

   ```bash
   npm run dev
   ```

   The server listens on `http://localhost:5174` by default and exposes:

   - `GET /healthz` – health check endpoint.
   - `POST /api/payment-intents` – creates a Payment Intent using `automatic_payment_methods` and returns the `clientSecret` together with the publishable key.

## GitHub Pages fallback

Because GitHub Pages cannot run the Node.js server, a mocked response is available at `../backend/response/test-payment-intent.json`. The frontend automatically falls back to this file when it cannot reach the live backend.
