import { useCallback, useEffect, useState } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import { toast } from 'react-hot-toast'
import { KALEFI_CONTRACTS, getCurrentNetwork } from '@/deployments/kalefi'
import * as chain from '@/services/kalefiChain'

export interface KalefiState {
  collateral: number
  debt: number
  /** Borrowing limit / debt. Below 1 the position can be liquidated. */
  healthFactor: number
  /** Current debt as a % of collateral value. */
  ltv: number
  /** Max LTV the contract allows, in %. */
  ltvLimit: number
  kalePrice: number
  priceUpdatedAt: number
  kaleBalance: number
  usdcBalance: number
  needsTrustlines: boolean
  isLoading: boolean
}

const EMPTY: KalefiState = {
  collateral: 0,
  debt: 0,
  healthFactor: Infinity,
  ltv: 0,
  ltvLimit: 50,
  kalePrice: 0,
  priceUpdatedAt: 0,
  kaleBalance: 0,
  usdcBalance: 0,
  needsTrustlines: false,
  isLoading: false,
}

export const useKalefi = () => {
  const { address } = useSorobanReact()
  const [state, setState] = useState<KalefiState>(EMPTY)
  const contracts = KALEFI_CONTRACTS[getCurrentNetwork()]

  const fetchUserPosition = useCallback(async () => {
    if (!address) return
    setState((prev) => ({ ...prev, isLoading: true }))
    try {
      const [s, missing] = await Promise.all([chain.readState(address), chain.missingTrustlines(address)])
      const collateralValue = s.collateral * s.kalePrice
      setState({
        ...s,
        ltv: collateralValue > 0 ? (s.debt / collateralValue) * 100 : 0,
        needsTrustlines: missing.length > 0,
        isLoading: false,
      })
    } catch (error) {
      console.error('Error reading position:', error)
      toast.error(chain.explain(error))
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }, [address])

  /** Runs a signed contract call, then re-reads everything from the chain. */
  const run = useCallback(
    async (label: string, fn: () => Promise<unknown>) => {
      if (!address) {
        toast.error('Connect Freighter first')
        return
      }
      setState((prev) => ({ ...prev, isLoading: true }))
      try {
        await fn()
        toast.success(label)
      } catch (error) {
        console.error(error)
        toast.error(chain.explain(error))
        throw error
      } finally {
        await fetchUserPosition()
      }
    },
    [address, fetchUserPosition]
  )

  const deposit = (amount: number) => run(`Deposited ${amount} KALE`, () => chain.deposit(address!, amount))
  const borrow = (amount: number) => run(`Borrowed ${amount} USDC`, () => chain.borrow(address!, amount))
  const withdraw = (amount: number) => run(`Withdrew ${amount} KALE`, () => chain.withdraw(address!, amount))
  const repay = (amount: number) => run(`Repaid ${amount} USDC`, () => chain.repay(address!, amount))

  const setupTrustlines = () =>
    run('Trustlines added', async () => {
      const missing = await chain.missingTrustlines(address!)
      if (missing.length) await chain.addTrustlines(address!, missing)
    })

  const requestTokens = () =>
    run('Demo KALE sent', async () => {
      const res = await fetch('/api/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address }),
      })
      const body = (await res.json()) as { error?: string }
      if (!res.ok) throw new Error(body.error ?? 'Faucet request failed')
    })

  useEffect(() => {
    void fetchUserPosition()
  }, [fetchUserPosition])

  return {
    ...state,
    contracts,
    deposit,
    borrow,
    withdraw,
    repay,
    setupTrustlines,
    requestTokens,
    fetchUserPosition,
  }
}
