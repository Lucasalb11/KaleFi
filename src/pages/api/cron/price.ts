import type { NextApiRequest, NextApiResponse } from 'next'
import { timingSafeEqual } from 'node:crypto'
import { nativeToScVal } from '@stellar/stellar-sdk'
import { KALEFI } from '@/deployments/kalefi'
import { adminCall } from '@/services/adminTx'

/** Demo KALE price: 0.50 USDC. The contract rejects prices older than an hour. */
const DEMO_PRICE = BigInt(5_000_000)

/**
 * Refreshes the price timestamp. Called every 30 minutes by
 * .github/workflows/refresh-price.yml with `Authorization: Bearer $CRON_SECRET`.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })
  const secret = process.env.CRON_SECRET
  const given = Buffer.from(req.headers.authorization ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)
  if (!secret || given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const hash = await adminCall(KALEFI.market, 'set_price', nativeToScVal(DEMO_PRICE, { type: 'i128' }))
    return res.status(200).json({ hash })
  } catch (e) {
    console.error('[cron/price] set_price failed', e)
    return res.status(502).json({ error: 'set_price failed' })
  }
}
