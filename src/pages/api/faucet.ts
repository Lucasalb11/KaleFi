import type { NextApiRequest, NextApiResponse } from 'next'
import { Address, nativeToScVal, StrKey } from '@stellar/stellar-sdk'
import { KALEFI } from '@/deployments/kalefi'
import { adminCall, adminKey, readContract } from '@/services/adminTx'

const UNIT = BigInt(10 ** KALEFI.decimals)
const AMOUNT = BigInt(1_000) * UNIT
/**
 * Total demo KALE that may ever exist. At $0.50 and 50% LTV this caps what the faucet can
 * unlock at 25k USDC, well under the market's liquidity, so free KALE can't drain the demo.
 */
const SUPPLY_CAP = 100_000

/** KALE issued so far (trustline balances plus contract balances), from Horizon. */
async function issuedKale(): Promise<number> {
  const url = `${KALEFI.horizonUrl}/assets?asset_code=KALE&asset_issuer=${KALEFI.issuer}`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Horizon ${res.status}`)
  const record = (await res.json())._embedded?.records?.[0]
  if (!record) return 0
  return Number(record.balances.authorized) + Number(record.contracts_amount)
}

/** Sends 1,000 demo KALE to a testnet account that already trusts the asset. */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST.' })
  if (!adminKey()) return res.status(503).json({ error: 'The demo faucet isn’t configured on this deployment.' })

  const body = (req.body ?? {}) as { address?: unknown }
  const address = typeof body.address === 'string' ? body.address : ''
  if (!StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'Send { "address": "G..." }.' })
  }

  // Fail closed: if the limits can't be checked, don't mint.
  try {
    const user = new Address(address).toScVal()
    const [balance, position, issued] = await Promise.all([
      readContract<bigint>(KALEFI.kaleToken, 'balance', user).catch(() => BigInt(0)),
      readContract<{ collateral: bigint }>(KALEFI.market, 'get_position', user),
      issuedKale(),
    ])
    // Count collateral too, otherwise depositing and asking again would bypass the limit.
    if (balance + position.collateral >= AMOUNT) {
      return res.status(429).json({ error: 'You already hold 1,000 demo KALE or more.' })
    }
    if (issued + 1_000 > SUPPLY_CAP) {
      return res.status(503).json({ error: 'The demo faucet is empty for now.' })
    }
  } catch (e) {
    console.error('[faucet] limit check failed', e)
    return res.status(503).json({ error: 'The faucet can’t check limits right now; try again shortly.' })
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
    console.error('[faucet] mint failed', e)
    return res.status(502).json({
      error: /trustline|#13/i.test(text) ? 'Add the KALE trustline first.' : 'Faucet transaction failed.',
    })
  }
}
