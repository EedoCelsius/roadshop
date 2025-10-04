import fs from 'node:fs/promises'
import path from 'node:path'
import url from 'node:url'

import cors from 'cors'
import express from 'express'
import Stripe from 'stripe'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))
const CONFIG_PATH = path.resolve(__dirname, '..', 'stripe-keys.json')

const DEFAULT_PORT = Number.parseInt(process.env.PORT ?? '5174', 10)

const DEFAULT_AMOUNT_BY_CURRENCY = {
  KRW: 130000,
  USD: 12000,
  EUR: 11000,
  CNY: 85000,
  JPY: 150000,
}

const loadStripeKeys = async () => {
  try {
    const data = await fs.readFile(CONFIG_PATH, 'utf8')
    const parsed = JSON.parse(data)

    if (!parsed.public_key || !parsed.secret_key) {
      throw new Error('Missing public_key or secret_key in stripe-keys.json')
    }

    return {
      publicKey: parsed.public_key,
      secretKey: parsed.secret_key,
    }
  } catch (error) {
    const baseError =
      error instanceof Error ? error.message : 'Unable to read Stripe configuration.'
    throw new Error(`${baseError} Please create backend/stripe-keys.json based on stripe-keys.example.json.`)
  }
}

const resolveAmount = (currency, requestedAmount) => {
  if (typeof requestedAmount === 'number' && Number.isFinite(requestedAmount) && requestedAmount > 0) {
    return Math.round(requestedAmount)
  }

  const normalized = currency?.toUpperCase()
  const fallback = DEFAULT_AMOUNT_BY_CURRENCY[normalized] ?? 12000
  return fallback
}

const buildApp = async () => {
  const { publicKey, secretKey } = await loadStripeKeys()
  const stripe = new Stripe(secretKey)

  const app = express()
  app.use(cors())
  app.use(express.json())

  app.get('/healthz', (_req, res) => {
    res.json({ status: 'ok' })
  })

  app.post('/api/payment-intents', async (req, res) => {
    const { currency, amount } = req.body ?? {}

    if (!currency || typeof currency !== 'string') {
      res.status(400).json({ message: 'currency is required' })
      return
    }

    try {
      const intent = await stripe.paymentIntents.create({
        amount: resolveAmount(currency, amount),
        currency: currency.toLowerCase(),
        automatic_payment_methods: {
          enabled: true,
        },
      })

      res.json({
        clientSecret: intent.client_secret,
        publishableKey: publicKey,
      })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create Stripe payment intent.'
      res.status(500).json({ message })
    }
  })

  return app
}

const start = async () => {
  try {
    const app = await buildApp()
    const port = DEFAULT_PORT

    app.listen(port, () => {
      console.log(`Stripe backend listening on http://localhost:${port}`)
    })
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
  await start()
}

export { buildApp }
