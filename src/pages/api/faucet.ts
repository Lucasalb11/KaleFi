import type { NextApiRequest, NextApiResponse } from 'next'
import { Address, nativeToScVal, StrKey } from '@stellar/stellar-sdk'
import { KALEFI } from '@/deployments/kalefi'
import { adminCall, adminKey } from '@/services/adminTx'

const AMOUNT = BigInt(1_000 * 10 ** KALEFI.decimals)

/** Sends 1,000 demo KALE to a testnet account that already trusts the asset. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })
  if (!adminKey()) return res.status(503).json({ error: 'The demo faucet isn’t configured on this deployment.' })

  const body = (req.body ?? {}) as { address?: unknown }
  const address = typeof body.address === 'string' ? body.address : ''
  if (!StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'Send { "address": "G..." }.' })
  }

  try {
    const hash = await adminCall(
      KALEFI.kaleToken,
      'mint',
      new Address(address).toScVal(),
      nativeToScVal(AMOUNT, { type: 'i128' })
    )
    return res.status(200).json({ hash, amount: AMOUNT.toString() })
  } catch (e) {
    const text = (e as Error).message
    return res.status(502).json({
      error: /trustline|#13/i.test(text) ? 'Add the KALE trustline first.' : `Faucet transaction failed: ${text}`,
    })
  }
}
