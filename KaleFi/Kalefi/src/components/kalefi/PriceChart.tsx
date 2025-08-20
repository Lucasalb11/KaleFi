import React, { useState, useEffect } from 'react'
import { usePriceOracle } from '@/hooks/usePriceOracle'
import tw from 'twin.macro'
import { FaChartLine } from 'react-icons/fa'

interface ChartDataPoint {
  timestamp: number
  price: number
}

export const PriceChart: React.FC = () => {
  const { getHistoricalPrices } = usePriceOracle()
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])
  const [timeframe, setTimeframe] = useState<number>(7) // days
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    void loadChartData()
  }, [timeframe])

  const loadChartData = async () => {
    setIsLoading(true)
    try {
      const data = await getHistoricalPrices('KALE', timeframe)
      setChartData(data)
    } catch (error) {
      console.error('Failed to load chart data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    })
  }

  const getPriceChange = () => {
    if (chartData.length < 2) return 0
    const firstPrice = chartData[0].price
    const lastPrice = chartData[chartData.length - 1].price
    return ((lastPrice - firstPrice) / firstPrice) * 100
  }

  const priceChange = getPriceChange()
  const isPositive = priceChange >= 0

  return (
    <div tw="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div tw="flex items-center justify-between mb-4">
        <div tw="flex items-center gap-2">
          <FaChartLine className="text-blue-400" />
          <h3 tw="text-lg font-semibold text-white">KALE Price Chart</h3>
        </div>
        <div tw="gap-2">
          {[1, 7, 30].map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                timeframe === days
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {days === 1 ? '1D' : days === 7 ? '7D' : '30D'}
            </button>
          ))}
        </div>
      </div>

      {/* Price Change Summary */}
      <div tw="mb-4 p-3 bg-gray-700 rounded-lg">
        <div tw="flex items-center justify-between">
          <span tw="text-gray-400">Price Change ({timeframe}D):</span>
          <span className={isPositive ? 'text-green-400' : 'text-red-400'} tw="font-semibold">
            {isPositive ? '+' : ''}{priceChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Chart Visualization */}
      <div tw="h-48 bg-gray-700 rounded-lg p-4 relative">
        {isLoading ? (
          <div tw="flex items-center justify-center h-full">
            <div tw="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : chartData.length > 0 ? (
          <div tw="relative h-full">
            {/* Simple line chart using CSS */}
            <svg tw="w-full h-full" viewBox={`0 0 ${chartData.length * 20} 100`}>
              <polyline
                fill="none"
                stroke={isPositive ? '#10B981' : '#EF4444'}
                strokeWidth="2"
                points={chartData
                  .map((point, index) => {
                    const x = index * 20
                    const y = 100 - (point.price / Math.max(...chartData.map(p => p.price))) * 80
                    return `${x},${y}`
                  })
                  .join(' ')}
              />
            </svg>
            
            {/* Price labels */}
            <div tw="absolute top-0 left-0 text-xs text-gray-400">
              ${Math.max(...chartData.map(p => p.price)).toFixed(4)}
            </div>
            <div tw="absolute bottom-0 left-0 text-xs text-gray-400">
              ${Math.min(...chartData.map(p => p.price)).toFixed(4)}
            </div>
          </div>
        ) : (
          <div tw="flex items-center justify-center h-full text-gray-400">
            No data available
          </div>
        )}
      </div>

      {/* Data Points */}
      <div tw="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        {chartData.slice(-4).map((point, index) => (
          <div key={index} tw="bg-gray-700 rounded p-2 text-center">
            <div tw="text-gray-400">{formatDate(point.timestamp)}</div>
            <div tw="text-white font-medium">${point.price.toFixed(4)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
