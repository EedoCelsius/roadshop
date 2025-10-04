import fs from 'node:fs/promises'
import process from 'node:process'

import cors from 'cors'
import express from 'express'
import Stripe from 'stripe'

const app = express()
app.use(cors())
app.use(express.json())

const readStripeKeys = async () => {
  try {
    const filePath = process.env.STRIPE_KEYS_PATH
      ? new URL(process.env.STRIPE_KEYS_PATH, `file://${process.cwd()}/`)
      : new URL('./stripe-keys.json', import.meta.url)

    const raw = await fs.readFile(filePath, 'utf8')
    return JSON.parse(raw)
  } catch (error) {
    if ((error ?? null) && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      console.warn('[stripe] stripe-keys.json not found; falling back to environment variables.')
    } else {
      console.warn('[stripe] Failed to read stripe-keys.json:', error)
    }

    return null
  }
}

const keyFile = await readStripeKeys()

const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY ?? keyFile?.public_key ?? ''
const secretKey = process.env.STRIPE_SECRET_KEY ?? keyFile?.secret_key ?? ''

let stripe = null

if (secretKey) {
  stripe = new Stripe(secretKey, {
    apiVersion: '2024-11-20',
  })
} else {
  console.warn('[stripe] STRIPE_SECRET_KEY is not configured. Payment intent creation will be disabled.')
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' })
})

app.post('/api/payments/create-intent', async (req, res) => {
  if (!stripe) {
    res.status(500).json({ error: 'Stripe secret key is not configured.' })
    return
  }

  const { amount, currency, customerEmail, metadata } = req.body ?? {}

  if (typeof amount !== 'number' || !Number.isFinite(amount) || amount <= 0) {
    res.status(400).json({ error: 'The "amount" field must be a positive number.' })
    return
  }

  if (!currency || typeof currency !== 'string') {
    res.status(400).json({ error: 'The "currency" field is required.' })
    return
  }

  try {
    const intent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency.toLowerCase(),
      receipt_email: typeof customerEmail === 'string' && customerEmail.length ? customerEmail : undefined,
      metadata: typeof metadata === 'object' && metadata !== null ? metadata : undefined,
      automatic_payment_methods: {
        enabled: true,
      },
    })

    res.json({
      clientSecret: intent.client_secret,
      publishableKey,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Stripe error'
    console.error('[stripe] Failed to create payment intent:', message)
    res.status(500).json({ error: message })
  }
})

const port = Number.parseInt(process.env.PORT ?? '8787', 10)

app.listen(port, () => {
  console.log(`Stripe backend listening on http://localhost:${port}`)
})
