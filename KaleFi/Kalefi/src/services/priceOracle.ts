// Price Oracle Service for KaleFi
// This service provides real-time price data for KALE and USDC tokens
// In production, this would integrate with Chainlink, Pyth Network, or other price oracles

export interface TokenPrice {
  symbol: string
  price: number
  timestamp: number
  change24h: number
  volume24h: number
}

export interface PriceData {
  KALE: TokenPrice
  USDC: TokenPrice
}

// Mock price data - replace with real oracle integration
const MOCK_PRICES: PriceData = {
  KALE: {
    symbol: 'KALE',
    price: 0.85,
    timestamp: Date.now(),
    change24h: 2.5,
    volume24h: 1250000,
  },
  USDC: {
    symbol: 'USDC',
    price: 1.0,
    timestamp: Date.now(),
    change24h: 0.0,
    volume24h: 50000000,
  },
}

class PriceOracleService {
  private prices: PriceData = MOCK_PRICES
  private subscribers: Set<(prices: PriceData) => void> = new Set<
    (prices: PriceData) => void
  >()
  private updateInterval: NodeJS.Timeout | null = null

  constructor() {
    this.startPriceUpdates()
  }

  // Start real-time price updates
  private startPriceUpdates() {
    this.updateInterval = setInterval(() => {
      this.updatePrices()
    }, 5000) // Update every 5 seconds
  }

  // Simulate price updates with realistic volatility
  private updatePrices() {
    const volatility = 0.02 // 2% volatility
    const newKalePrice =
      this.prices.KALE.price * (1 + (Math.random() - 0.5) * volatility * 2)

    this.prices = {
      KALE: {
        ...this.prices.KALE,
        price: parseFloat(newKalePrice.toFixed(4)),
        timestamp: Date.now(),
        change24h: this.prices.KALE.change24h + (Math.random() - 0.5) * 0.5,
      },
      USDC: {
        ...this.prices.USDC,
        timestamp: Date.now(),
      },
    }

    // Notify subscribers
    this.subscribers.forEach((callback) => callback(this.prices))
  }

  // Subscribe to price updates
  subscribe(callback: (prices: PriceData) => void): () => void {
    this.subscribers.add(callback)

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback)
    }
  }

  // Get current prices
  getCurrentPrices(): PriceData {
    return { ...this.prices }
  }

  // Get price for specific token
  getTokenPrice(symbol: string): TokenPrice | null {
    return this.prices[symbol as keyof PriceData] || null
  }

  // Calculate price impact for large trades
  calculatePriceImpact(symbol: string, amount: number, isBuy: boolean): number {
    const token = this.getTokenPrice(symbol)
    if (!token) return 0

    // Simple price impact model - in production, use order book depth
    const impact = (amount / token.volume24h) * 0.1
    return isBuy ? impact : -impact
  }

  // Get historical price data (mock implementation)
  getHistoricalPrices(
    symbol: string,
    days: number
  ): Promise<{ timestamp: number; price: number }[]> {
    const token = this.getTokenPrice(symbol)
    if (!token) return Promise.resolve([])

    const data = []
    const now = Date.now()
    const dayMs = 24 * 60 * 60 * 1000

    for (let i = days; i >= 0; i--) {
      const timestamp = now - i * dayMs
      const volatility = 0.03
      const price = token.price * (1 + (Math.random() - 0.5) * volatility)

      data.push({
        timestamp,
        price: parseFloat(price.toFixed(4)),
      })
    }

    return Promise.resolve(data)
  }

  // Stop price updates
  stop() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
      this.updateInterval = null
    }
  }
}

// Export singleton instance
export const priceOracle = new PriceOracleService()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    priceOracle.stop()
  })
}
