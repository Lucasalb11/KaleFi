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
    healthFactor: 999, // Start with safe health factor
    ltv: 0,
    kalePrice: 0.5, // Mock price for now
    isLoading: false
  })

  const contracts = KALEFI_CONTRACTS[getCurrentNetwork()]

  // Calculate health factor based on current state
  const calculateHealthFactor = useCallback((collateral: number, debt: number, price: number) => {
    if (debt === 0) return 999 // Safe when no debt
    
    const collateralValue = collateral * price
    const debtValue = debt // USDC is 1:1 with USD
    
    if (debtValue === 0) return 999
    
    // Health factor = collateral value / debt value
    // We want it to be > 1.1 for safety
    return collateralValue / debtValue
  }, [])

  // Calculate LTV based on current state
  const calculateLTV = useCallback((collateral: number, debt: number, price: number) => {
    if (collateral === 0) return 0
    
    const collateralValue = collateral * price
    const debtValue = debt
    
    if (collateralValue === 0) return 0
    
    // LTV = debt value / collateral value * 100
    return (debtValue / collateralValue) * 100
  }, [])

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

      const healthFactor = calculateHealthFactor(collateral, debt, price)
      const calculatedLTV = calculateLTV(collateral, debt, price)

      setState(prev => ({
        ...prev,
        collateral,
        debt,
        healthFactor,
        ltv: calculatedLTV,
        kalePrice: price,
        isLoading: false
      }))
    } catch (error) {
      console.error('Error fetching user position:', error)
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, calculateHealthFactor, calculateLTV])

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
      
      // Update local state immediately for better UX
      setState(prev => {
        const newCollateral = prev.collateral + amount
        const newHealthFactor = calculateHealthFactor(newCollateral, prev.debt, prev.kalePrice)
        const newLTV = calculateLTV(newCollateral, prev.debt, prev.kalePrice)
        
        return {
          ...prev,
          collateral: newCollateral,
          healthFactor: newHealthFactor,
          ltv: newLTV,
          isLoading: false
        }
      })
      
      // Refresh data from contract (optional, for verification)
      // await fetchUserPosition()
    } catch (error) {
      console.error('Deposit error:', error)
      toast.error('Deposit failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, calculateHealthFactor, calculateLTV])

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
      
      // Update local state immediately for better UX
      setState(prev => {
        const newDebt = prev.debt + amount
        const newHealthFactor = calculateHealthFactor(prev.collateral, newDebt, prev.kalePrice)
        const newLTV = calculateLTV(prev.collateral, newDebt, prev.kalePrice)
        
        return {
          ...prev,
          debt: newDebt,
          healthFactor: newHealthFactor,
          ltv: newLTV,
          isLoading: false
        }
      })
      
      // Refresh data from contract (optional, for verification)
      // await fetchUserPosition()
    } catch (error) {
      console.error('Borrow error:', error)
      toast.error('Borrow failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, calculateHealthFactor, calculateLTV])

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
      
      // Update local state immediately for better UX
      setState(prev => {
        const newCollateral = Math.max(0, prev.collateral - amount)
        const newHealthFactor = calculateHealthFactor(newCollateral, prev.debt, prev.kalePrice)
        const newLTV = calculateLTV(newCollateral, prev.debt, prev.kalePrice)
        
        return {
          ...prev,
          collateral: newCollateral,
          healthFactor: newHealthFactor,
          ltv: newLTV,
          isLoading: false
        }
      })
      
      // Refresh data from contract (optional, for verification)
      // await fetchUserPosition()
    } catch (error) {
      console.error('Withdraw error:', error)
      toast.error('Withdraw failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, calculateHealthFactor, calculateLTV])

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
      
      // Update local state immediately for better UX
      setState(prev => {
        const newDebt = Math.max(0, prev.debt - amount)
        const newHealthFactor = calculateHealthFactor(prev.collateral, newDebt, prev.kalePrice)
        const newLTV = calculateLTV(prev.collateral, newDebt, prev.kalePrice)
        
        return {
          ...prev,
          debt: newDebt,
          healthFactor: newHealthFactor,
          ltv: newLTV,
          isLoading: false
        }
      })
      
      // Refresh data from contract (optional, for verification)
      // await fetchUserPosition()
    } catch (error) {
      console.error('Repay error:', error)
      toast.error('Repay failed. Please try again.')
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [address, calculateHealthFactor, calculateLTV])

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
