import { useState, useEffect } from 'react'
import { priceOracle, type PriceData, type TokenPrice } from '@/services/priceOracle'

export const usePriceOracle = () => {
  const [prices, setPrices] = useState<PriceData>(priceOracle.getCurrentPrices())
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

  const calculatePriceImpact = (symbol: string, amount: number, isBuy: boolean): number => {
    return priceOracle.calculatePriceImpact(symbol, amount, isBuy)
  }

  const getHistoricalPrices = async (symbol: string, days: number) => {
    setIsLoading(true)
    try {
      const data = await priceOracle.getHistoricalPrices(symbol, days)
      return data
    } finally {
      setIsLoading(false)
    }
  }

  return {
    prices,
    isLoading,
    getTokenPrice,
    calculatePriceImpact,
    getHistoricalPrices
  }
}
