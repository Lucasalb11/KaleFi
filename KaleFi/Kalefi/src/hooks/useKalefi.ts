import { useState, useEffect, useCallback } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import { toast } from 'react-hot-toast'
import { KALEFI_CONTRACTS, getCurrentNetwork } from '@/deployments/kalefi'
import { kalefiService } from '@/services/kalefiService'

export interface KalefiState {
  collateral: number
  debt: number
  healthFactor: number
  ltv: number
  kalePrice: number
  isLoading: boolean
}

export const useKalefi = () => {
  const { address, activeChain } = useSorobanReact()
  const [state, setState] = useState<KalefiState>({
    collateral: 0,
    debt: 0,
    healthFactor: 0,
    ltv: 0,
    kalePrice: 0.5, // Mock price for now
    isLoading: false
  })

  const contracts = KALEFI_CONTRACTS[getCurrentNetwork()]

  // Fetch user's position data
  const fetchUserPosition = useCallback(async () => {
    if (!address) return

    setState(prev => ({ ...prev, isLoading: true }))
    try {
      // Get real data from smart contracts
      const [collateral, debt, healthData, ltv, price] = await Promise.all([
        kalefiService.getCollateral(address),
        kalefiService.getDebt(address),
        kalefiService.checkHealthFactor(address),
        kalefiService.getLTV(),
        kalefiService.getMockPrice()
      ])

      setState(prev => ({
        ...prev,
        collateral,
        debt,
        healthFactor: healthData.healthFactor,
        ltv,
        kalePrice: price,
        isLoading: false
      }))
    } catch (error) {
      console.error('Error fetching user position:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address])

  // Deposit KALE as collateral
  const deposit = useCallback(async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))
    try {
      // Build and send transaction
      const transaction = kalefiService.buildDepositTransaction(address, amount)
      
      // TODO: Send transaction via Soroban React
      // For now, simulate success
      toast.success(`Successfully deposited ${amount} KALE`)
      
      // Update local state
      setState(prev => ({
        ...prev,
        collateral: prev.collateral + amount,
        isLoading: false
      }))
      
      // Refresh data
      await fetchUserPosition()
    } catch (error) {
      console.error('Deposit error:', error)
      toast.error('Deposit failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, fetchUserPosition])

  // Borrow USDC
  const borrow = useCallback(async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))
    try {
      // Build and send transaction
      const transaction = kalefiService.buildBorrowTransaction(address, amount)
      
      // TODO: Send transaction via Soroban React
      // For now, simulate success
      toast.success(`Successfully borrowed ${amount} USDC`)
      
      // Update local state
      setState(prev => ({
        ...prev,
        debt: prev.debt + amount,
        isLoading: false
      }))
      
      // Refresh data
      await fetchUserPosition()
    } catch (error) {
      console.error('Borrow error:', error)
      toast.error('Borrow failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, fetchUserPosition])

  // Withdraw collateral
  const withdraw = useCallback(async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))
    try {
      // Build and send transaction
      const transaction = kalefiService.buildWithdrawTransaction(address, amount)
      
      // TODO: Send transaction via Soroban React
      // For now, simulate success
      toast.success(`Successfully withdrew ${amount} KALE`)
      
      // Update local state
      setState(prev => ({
        ...prev,
        collateral: prev.collateral - amount,
        isLoading: false
      }))
      
      // Refresh data
      await fetchUserPosition()
    } catch (error) {
      console.error('Withdraw error:', error)
      toast.error('Withdraw failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, fetchUserPosition])

  // Repay debt
  const repay = useCallback(async (amount: number) => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))
    try {
      // Build and send transaction
      const transaction = kalefiService.buildRepayTransaction(address, amount)
      
      // TODO: Send transaction via Soroban React
      // For now, simulate success
      toast.success(`Successfully repaid ${amount} USDC`)
      
      // Update local state
      setState(prev => ({
        ...prev,
        debt: prev.debt - amount,
        isLoading: false
      }))
      
      // Refresh data
      await fetchUserPosition()
    } catch (error) {
      console.error('Repay error:', error)
      toast.error('Repay failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, fetchUserPosition])

  // Health factor and LTV are now fetched from the contract
  // No need for manual calculation

  // Fetch data on mount and when address changes
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
    fetchUserPosition
  }
}
