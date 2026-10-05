import type { NextApiRequest, NextApiResponse } from 'next'
import { nativeToScVal } from '@stellar/stellar-sdk'
import { KALEFI } from '@/deployments/kalefi'
import { adminCall, adminKey, readContract } from '@/services/adminTx'

/** Demo KALE price: 0.50 USDC. */
const DEMO_PRICE = BigInt(5_000_000)
/** The contract refuses prices older than an hour; refresh well before that. */
const REFRESH_AFTER_SECONDS = 30 * 60

let inFlight: Promise<string> | null = null

/**
 * Keeps the demo price fresh on demand: the app calls this before price-sensitive actions.
 * It's public on purpose. It can only re-post the fixed demo price, and only once the stored
 * one is 30 minutes old, so the worst a caller can do is cost one admin fee per half hour.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })
  if (!adminKey()) return res.status(503).json({ error: 'Price refresh isn’t configured on this deployment.' })

  try {
    const price = await readContract<{ value: bigint; updated_at: bigint }>(KALEFI.market, 'get_price')
    const age = Math.floor(Date.now() / 1000) - Number(price.updated_at)
    if (age < REFRESH_AFTER_SECONDS) {
      return res.status(200).json({ refreshed: false, updatedAt: Number(price.updated_at) })
    }
    inFlight ??= adminCall(KALEFI.market, 'set_price', nativeToScVal(DEMO_PRICE, { type: 'i128' })).finally(() => {
      inFlight = null
    })
    const hash = await inFlight
    return res.status(200).json({ refreshed: true, hash })
  } catch (e) {
    console.error('[price/refresh]', e)
    return res.status(502).json({ error: 'Couldn’t refresh the demo price.' })
  }
}
