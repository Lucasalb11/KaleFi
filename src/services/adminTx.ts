import { BASE_FEE, Contract, Keypair, rpc, scValToNative, TransactionBuilder, xdr } from '@stellar/stellar-sdk'
import { KALEFI } from '@/deployments/kalefi'

/** Server-only: the demo issuer/admin key, from KALEFI_ADMIN_SECRET. */
export function adminKey(): Keypair | null {
  const secret = process.env.KALEFI_ADMIN_SECRET
  if (!secret) return null
  try {
    return Keypair.fromSecret(secret)
  } catch {
    return null
  }
}

/** Read-only contract call (simulation), sourced from the admin account. */
export async function readContract<T>(contractId: string, method: string, ...args: xdr.ScVal[]): Promise<T> {
  const server = new rpc.Server(KALEFI.rpcUrl)
  const account = await server.getAccount(KALEFI.issuer)
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: KALEFI.networkPassphrase })
    .addOperation(new Contract(contractId).call(method, ...args))
    .setTimeout(30)
    .build()
  const sim = await server.simulateTransaction(tx)
  if (rpc.Api.isSimulationError(sim)) throw new Error(sim.error)
  if (!sim.result) throw new Error('Simulation returned no result')
  return scValToNative(sim.result.retval) as T
}

/** Sign a single contract call with the admin key and wait for it to land. */
export async function adminCall(contractId: string, method: string, ...args: xdr.ScVal[]) {
  const key = adminKey()
  if (!key) throw new Error('KALEFI_ADMIN_SECRET is not configured')
  const server = new rpc.Server(KALEFI.rpcUrl)
  const account = await server.getAccount(key.publicKey())
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: KALEFI.networkPassphrase })
    .addOperation(new Contract(contractId).call(method, ...args))
    .setTimeout(60)
    .build()
  const prepared = await server.prepareTransaction(tx)
  prepared.sign(key)
  const sent = await server.sendTransaction(prepared)
  if (sent.status === 'ERROR') throw new Error('Transaction rejected by the RPC')
  for (let i = 0; i < 30; i++) {
    const res = await server.getTransaction(sent.hash)
    if (res.status === rpc.Api.GetTransactionStatus.SUCCESS) return sent.hash
    if (res.status === rpc.Api.GetTransactionStatus.FAILED) throw new Error(`Transaction failed: ${sent.hash}`)
    await new Promise((r) => setTimeout(r, 1500))
  }
  throw new Error(`Timed out waiting for ${sent.hash}`)
}
