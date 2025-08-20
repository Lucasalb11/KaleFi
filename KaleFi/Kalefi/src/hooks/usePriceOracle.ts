import { useState, useEffect } from 'react'
import {
  priceOracle,
  type PriceData,
  type TokenPrice,
} from '@/services/priceOracle'

export const usePriceOracle = () => {
  const [prices, setPrices] = useState<PriceData>(
    priceOracle.getCurrentPrices()
  )
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Subscribe to price updates
    const unsubscribe = priceOracle.subscribe((newPrices) => {
      setPrices(newPrices)
    })

    // Cleanup subscription on unmount
    return unsubscribe
  }, [])

  const getTokenPrice = (symbol: string): TokenPrice | null => {
    return priceOracle.getTokenPrice(symbol)
  }

  const calculatePriceImpact = (
    symbol: string,
    amount: number,
    isBuy: boolean
  ): number => {
    return priceOracle.calculatePriceImpact(symbol, amount, isBuy)
  }

  const getHistoricalPrices = (symbol: string, days: number) => {
    setIsLoading(true)
    try {
      // For now, return mock data
      // TODO: Implement actual historical data fetching
      const mockData = Array.from({ length: days }, (_, i) => ({
        timestamp: Date.now() - (days - i) * 24 * 60 * 60 * 1000,
        price: 0.5 + Math.random() * 0.1, // Mock price between 0.5 and 0.6
      }))

      setIsLoading(false)
      return Promise.resolve(mockData)
    } catch (error) {
      setIsLoading(false)
      return Promise.reject(error)
    }
  }

  return {
    prices,
    isLoading,
    getTokenPrice,
    calculatePriceImpact,
    getHistoricalPrices,
  }
}
