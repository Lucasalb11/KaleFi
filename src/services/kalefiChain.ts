import {
  Address,
  Asset,
  BASE_FEE,
  Contract,
  Horizon,
  nativeToScVal,
  Operation,
  scValToNative,
  rpc,
  TransactionBuilder,
  xdr,
} from '@stellar/stellar-sdk'
import { signTransaction } from '@stellar/freighter-api'
import { KALEFI } from '@/deployments/kalefi'

const server = new rpc.Server(KALEFI.rpcUrl)
const horizon = new Horizon.Server(KALEFI.horizonUrl)
const market = new Contract(KALEFI.market)
const SCALE = 10 ** KALEFI.decimals

export const toUnits = (amount: number) => BigInt(Math.round(amount * SCALE))
export const fromUnits = (units: bigint | number) => Number(units) / SCALE

/** Contract error codes, matching `Error` in contracts/kalefi/src/lib.rs. */
const ERRORS: Record<number, string> = {
  1: 'The market is already initialized.',
  2: 'The market isn’t initialized.',
  3: 'Amount must be greater than zero.',
  4: 'Invalid LTV.',
  5: 'The KALE price is stale; try again after the next price update.',
  6: 'Invalid price.',
  7: 'That would put your position below the 50% LTV limit.',
  8: 'You don’t have that much collateral.',
  9: 'That’s more than you owe.',
  10: 'This position is healthy and can’t be liquidated.',
  11: 'Liquidations can repay at most half the debt at once.',
  12: 'Arithmetic overflow.',
}

export function explain(e: unknown): string {
  const text = e instanceof Error ? e.message : String(e)
  const code = text.match(/Error\(Contract, #(\d+)\)/)?.[1]
  if (code && ERRORS[Number(code)]) return ERRORS[Number(code)]
  if (/trustline|op_no_trust/i.test(text)) return 'Add the KALE and USDC trustlines first.'
  return text.slice(0, 180)
}

const addr = (a: string) => new Address(a).toScVal()
const i128 = (v: bigint) => nativeToScVal(v, { type: 'i128' })

async function simulate<T>(source: string, op: xdr.Operation): Promise<T> {
  const account = await server.getAccount(source).catch(() => server.getAccount(KALEFI.issuer))
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: KALEFI.networkPassphrase })
    .addOperation(op)
    .setTimeout(30)
    .build()
  const sim = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error)
  if (!sim.result) throw new Error('Simulation returned no result')
  return scValToNative(sim.result.retval) as T
}

async function signAndSend(source: string, op: xdr.Operation) {
  const account = await server.getAccount(source)
  const built = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: KALEFI.networkPassphrase })
    .addOperation(op)
    .setTimeout(60)
    .build()
  const prepared = await server.prepareTransaction(built)
  const signedXdr = await signTransaction(prepared.toXDR(), { networkPassphrase: KALEFI.networkPassphrase })
  const signed = TransactionBuilder.fromXDR(signedXdr, KALEFI.networkPassphrase)
  const sent = await server.sendTransaction(signed)
  if (sent.status === 'ERROR') throw new Error(JSON.stringify(sent.errorResult))
  for (let i = 0; i < 30; i++) {
    const res = await server.getTransaction(sent.hash)
    if (res.status === rpc.Api.GetTransactionStatus.SUCCESS) return sent.hash
    if (res.status === rpc.Api.GetTransactionStatus.FAILED) throw new Error(`Transaction failed: ${sent.hash}`)
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error(`Timed out waiting for ${sent.hash}`)
}

export type MarketState = {
  collateral: number
  debt: number
  healthFactor: number
  kalePrice: number
  priceUpdatedAt: number
  ltvLimit: number
  kaleBalance: number
  usdcBalance: number
}

export async function readState(user: string): Promise<MarketState> {
  const [position, price, config, kale, usdc] = await Promise.all([
    simulate<{ collateral: bigint; debt: bigint }>(user, market.call('get_position', addr(user))),
    simulate<{ value: bigint; updated_at: bigint }>(user, market.call('get_price')),
    simulate<{ ltv_bps: number }>(user, market.call('get_config')),
    simulate<bigint>(user, new Contract(KALEFI.kaleToken).call('balance', addr(user))).catch(() => BigInt(0)),
    simulate<bigint>(user, new Contract(KALEFI.usdcToken).call('balance', addr(user))).catch(() => BigInt(0)),
  ])
  const collateral = fromUnits(position.collateral)
  const debt = fromUnits(position.debt)
  const kalePrice = fromUnits(price.value)
  const ltvLimit = Number(config.ltv_bps) / 100
  const healthFactor = debt === 0 ? Infinity : (collateral * kalePrice * (ltvLimit / 100)) / debt
  return {
    collateral,
    debt,
    healthFactor,
    kalePrice,
    priceUpdatedAt: Number(price.updated_at),
    ltvLimit,
    kaleBalance: fromUnits(kale),
    usdcBalance: fromUnits(usdc),
  }
}

export const deposit = (user: string, amount: number) => signAndSend(user, market.call('deposit', addr(user), i128(toUnits(amount))))
export const borrow = (user: string, amount: number) => signAndSend(user, market.call('borrow', addr(user), i128(toUnits(amount))))
export const repay = (user: string, amount: number) => signAndSend(user, market.call('repay', addr(user), i128(toUnits(amount))))
export const withdraw = (user: string, amount: number) => signAndSend(user, market.call('withdraw', addr(user), i128(toUnits(amount))))

const ASSETS = [new Asset('KALE', KALEFI.issuer), new Asset('USDC', KALEFI.issuer)]

/** Which of the demo assets the account can't hold yet. */
export async function missingTrustlines(user: string): Promise<Asset[]> {
  const account = await horizon.loadAccount(user)
  return ASSETS.filter(
    (asset) => !account.balances.some((b) => 'asset_code' in b && b.asset_code === asset.code && b.asset_issuer === asset.issuer)
  )
}

/** One classic transaction adding every missing trustline, signed in Freighter. */
export async function addTrustlines(user: string, assets: Asset[]) {
  const account = await horizon.loadAccount(user)
  const builder = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: KALEFI.networkPassphrase })
  assets.forEach((asset) => builder.addOperation(Operation.changeTrust({ asset })))
  const tx = builder.setTimeout(60).build()
  const signedXdr = await signTransaction(tx.toXDR(), { networkPassphrase: KALEFI.networkPassphrase })
  return horizon.submitTransaction(TransactionBuilder.fromXDR(signedXdr, KALEFI.networkPassphrase))
}
