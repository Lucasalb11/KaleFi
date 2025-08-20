import React, { useState } from 'react'
import { useSorobanReact } from '@soroban-react/core'
import { toast } from 'react-hot-toast'
import tw from 'twin.macro'
import { 
  FaCoins, 
  FaDollarSign, 
  FaExclamationTriangle, 
  FaCheckCircle,
  FaChartLine,
  FaArrowUp,
  FaArrowDown,
  FaUndo,
  FaCreditCard,
  FaWallet,
  FaPercentage,
  FaShieldAlt,
  FaExchangeAlt,
  FaTimes
} from 'react-icons/fa'
import { usePriceOracle } from '@/hooks/usePriceOracle'
import { useKalefi } from '@/hooks/useKalefi'
import { PriceChart } from './PriceChart'

export const KaleFiLendingInterface: React.FC = () => {
  const { address, activeChain } = useSorobanReact()
  const { prices, isLoading: pricesLoading } = usePriceOracle()
  const [depositAmount, setDepositAmount] = useState<string>('')
  const [borrowAmount, setBorrowAmount] = useState<string>('')
  const [withdrawAmount, setWithdrawAmount] = useState<string>('')
  const [repayAmount, setRepayAmount] = useState<string>('')
  const [showSwapModal, setShowSwapModal] = useState(false)
  const [swapFromToken, setSwapFromToken] = useState('KALE')
  const [swapToToken, setSwapToToken] = useState('USDC')
  const [swapAmount, setSwapAmount] = useState('')
  
  const {
    collateral,
    debt,
    healthFactor,
    ltv,
    kalePrice,
    isLoading,
    deposit,
    borrow,
    withdraw,
    repay
  } = useKalefi()

  // Visual feedback colors
  const getHealthColor = (health: number) => {
    if (health >= 1.5) return 'text-green-400'
    if (health >= 1.1) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHealthIcon = (health: number) => {
    if (health >= 1.5) return <FaCheckCircle className="text-green-400" />
    if (health >= 1.1) return <FaExclamationTriangle className="text-yellow-400" />
    return <FaExclamationTriangle className="text-red-400" />
  }

  const getLTVColor = (ltv: number) => {
    if (ltv < 50) return 'text-green-400'
    if (ltv < 80) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <FaArrowUp className="text-green-400" />
    if (change < 0) return <FaArrowDown className="text-red-400" />
    return null
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-green-400'
    if (change < 0) return 'text-red-400'
    return 'text-gray-400'
  }

  const handleDeposit = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      toast.error('Please enter a valid deposit amount')
      return
    }

    try {
      const amount = parseFloat(depositAmount)
      await deposit(amount)
      setDepositAmount('')
    } catch (error) {
      toast.error('Deposit failed. Please try again.')
      console.error('Deposit error:', error)
    }
  }

  const handleBorrow = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast.error('Please enter a valid borrow amount')
      return
    }

    if (healthFactor < 1.1) {
      toast.error('Health factor too low. Cannot borrow.')
      return
    }

    try {
      const amount = parseFloat(borrowAmount)
      await borrow(amount)
      setBorrowAmount('')
    } catch (error) {
      toast.error('Borrow failed. Please try again.')
      console.error('Borrow error:', error)
    }
  }

  const handleWithdraw = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast.error('Please enter a valid withdraw amount')
      return
    }

    try {
      const amount = parseFloat(withdrawAmount)
      await withdraw(amount)
      setWithdrawAmount('')
    } catch (error) {
      toast.error('Withdraw failed. Please try again.')
      console.error('Withdraw error:', error)
    }
  }

  const handleRepay = async () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!repayAmount || parseFloat(repayAmount) <= 0) {
      toast.error('Please enter a valid repay amount')
      return
    }

    try {
      const amount = parseFloat(repayAmount)
      await repay(amount)
      setRepayAmount('')
    } catch (error) {
      toast.error('Repay failed. Please try again.')
      console.error('Repay error:', error)
    }
  }

  const handleSwap = () => {
    if (!address) {
      toast.error('Please connect your wallet first')
      return
    }
    
    if (!swapAmount || parseFloat(swapAmount) <= 0) {
      toast.error('Please enter a valid swap amount')
      return
    }

    try {
      // TODO: Implement actual swap functionality
      toast.success(`Swapping ${swapAmount} ${swapFromToken} to ${swapToToken}`)
      setSwapAmount('')
      setShowSwapModal(false)
    } catch (error) {
      toast.error('Swap failed. Please try again.')
      console.error('Swap error:', error)
    }
  }

  const toggleTokens = () => {
    const temp = swapFromToken
    setSwapFromToken(swapToToken)
    setSwapToToken(temp)
  }

  return (
    <div tw="w-full max-w-7xl mx-auto p-6">
      {/* Header */}
      <div tw="text-center mb-8">
        <h1 tw="text-4xl font-bold text-white mb-4">KaleFi Lending Protocol</h1>
        <p tw="text-gray-400 text-lg">Collateralized Lending on Stellar</p>
      </div>

      {/* Contract Status Indicator */}
      <div tw="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-6">
        <div tw="flex items-center gap-3">
          <div tw="w-3 h-3 rounded-full bg-blue-400 animate-pulse"></div>
          <div>
            <h3 tw="text-blue-400 font-semibold">🚀 KaleFi Demo Mode</h3>
            <p tw="text-blue-300 text-sm">
              Interface conectada com dados simulados. Contratos deployados na testnet: 
              <code tw="bg-blue-800 px-2 py-1 rounded text-xs">CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6</code>
            </p>
          </div>
        </div>
      </div>

      {/* Price Display */}
      <div tw="bg-gray-800 rounded-lg p-4 mb-6">
        <div tw="text-center mb-4">
          <h3 tw="text-lg font-semibold text-white">Real-Time Prices</h3>
        </div>
        <div tw="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* KALE Price Card */}
          <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div tw="flex items-center justify-between mb-2">
              <div tw="flex items-center gap-2">
                <FaChartLine className="text-blue-400" />
                <span tw="text-gray-300 font-medium">KALE</span>
              </div>
              <div tw="flex items-center gap-2">
                {getPriceChangeIcon(prices.KALE.change24h)}
                <span className={getPriceChangeColor(prices.KALE.change24h)} tw="text-sm">
                  {prices.KALE.change24h > 0 ? '+' : ''}{prices.KALE.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div tw="text-2xl font-bold text-white">${prices.KALE.price}</div>
            <div tw="text-xs text-gray-400 mt-1">
              Volume: ${(prices.KALE.volume24h / 1000000).toFixed(1)}M
            </div>
          </div>

          {/* USDC Price Card */}
          <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
            <div tw="flex items-center justify-between mb-2">
              <div tw="flex items-center gap-2">
                <FaChartLine className="text-green-400" />
                <span tw="text-gray-300 font-medium">USDC</span>
              </div>
              <div tw="flex items-center gap-2">
                {getPriceChangeIcon(prices.USDC.change24h)}
                <span className={getPriceChangeColor(prices.USDC.change24h)} tw="text-sm">
                  {prices.USDC.change24h > 0 ? '+' : ''}{prices.USDC.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div tw="text-2xl font-bold text-white">${prices.USDC.price}</div>
            <div tw="text-xs text-gray-400 mt-1">
              Volume: ${(prices.USDC.volume24h / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface - Aave Style */}
      <div tw="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Left Side - Supply/Withdraw */}
        <div tw="space-y-6">
          
          {/* Your Supplies */}
          <div tw="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div tw="flex items-center justify-between mb-4">
              <h2 tw="text-xl font-bold text-white">Your Supplies</h2>
              <div tw="flex items-center gap-2">
                <FaShieldAlt className="text-blue-400" />
                <span tw="text-blue-400 text-sm">Collateral</span>
              </div>
            </div>
            
            {collateral > 0 ? (
              <div tw="space-y-4">
                {/* KALE Supply */}
                <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div tw="flex items-center justify-between mb-3">
                    <div tw="flex items-center gap-3">
                      <div tw="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                        <FaCoins className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 tw="text-white font-semibold">KALE</h3>
                        <p tw="text-gray-400 text-sm">Collateral Asset</p>
                      </div>
                    </div>
                    <div tw="text-right">
                      <p tw="text-white font-bold">{collateral.toFixed(4)} KALE</p>
                      <p tw="text-gray-400 text-sm">${(collateral * kalePrice).toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Withdraw Section */}
                  <div tw="border-t border-gray-600 pt-3">
                    <div tw="flex items-center gap-2 mb-2">
                      <FaUndo className="text-orange-400" />
                      <span tw="text-orange-400 font-medium">Withdraw</span>
                    </div>
                    <div tw="flex gap-2">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.0"
                        tw="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
                      />
                      <button
                        onClick={handleWithdraw}
                        disabled={isLoading || !address || collateral <= 0}
                        tw="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        {isLoading ? '...' : 'Withdraw'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div tw="text-center py-8">
                <FaWallet className="text-gray-500 text-4xl mx-auto mb-3" />
                <p tw="text-gray-400">Nothing supplied yet</p>
                <p tw="text-gray-500 text-sm">Supply assets to start earning</p>
              </div>
            )}
          </div>

          {/* Assets to Supply */}
          <div tw="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div tw="flex items-center justify-between mb-4">
              <h2 tw="text-xl font-bold text-white">Assets to Supply</h2>
              <button tw="text-gray-400 hover:text-white text-sm">Hide</button>
            </div>
            
            <div tw="bg-blue-900/20 border border-blue-700 rounded-lg p-3 mb-4">
              <p tw="text-blue-300 text-sm">
                Supply assets to use as collateral and start earning
              </p>
            </div>

            {/* KALE Asset */}
            <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div tw="flex items-center justify-between mb-3">
                <div tw="flex items-center gap-3">
                  <div tw="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaCoins className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 tw="text-white font-semibold">KALE</h3>
                    <p tw="text-gray-400 text-sm">KaleFi Token</p>
                  </div>
                </div>
                <div tw="text-right">
                  <p tw="text-gray-400 text-sm">Wallet: 0.00</p>
                  <p tw="text-green-400 text-sm">✓ Can be collateral</p>
                </div>
              </div>
              
              <div tw="grid grid-cols-3 gap-2 mb-3 text-sm">
                <div>
                  <p tw="text-gray-400">APY</p>
                  <p tw="text-white font-semibold">3.42%</p>
                </div>
                <div>
                  <p tw="text-gray-400">LTV</p>
                  <p tw="text-white font-semibold">80%</p>
                </div>
                <div>
                  <p tw="text-gray-400">Risk</p>
                  <p tw="text-green-400 font-semibold">Low</p>
                </div>
              </div>
              
              {/* Supply Section */}
              <div tw="border-t border-gray-600 pt-3">
                <div tw="flex items-center gap-2 mb-2">
                  <FaCoins className="text-blue-400" />
                  <span tw="text-blue-400 font-medium">Supply</span>
                </div>
                <div tw="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                    tw="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={isLoading || !address || pricesLoading}
                    tw="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? '...' : 'Supply'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Borrow/Repay */}
        <div tw="space-y-6">
          
          {/* Your Borrows */}
          <div tw="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div tw="flex items-center justify-between mb-4">
              <h2 tw="text-xl font-bold text-white">Your Borrows</h2>
              <div tw="flex items-center gap-2">
                <FaPercentage className="text-red-400" />
                <span tw="text-red-400 text-sm">Debt</span>
              </div>
            </div>
            
            {debt > 0 ? (
              <div tw="space-y-4">
                {/* USDC Borrow */}
                <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
                  <div tw="flex items-center justify-between mb-3">
                    <div tw="flex items-center gap-3">
                      <div tw="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                        <FaDollarSign className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 tw="text-white font-semibold">USDC</h3>
                        <p tw="text-red-400 text-sm">Borrowed Asset</p>
                      </div>
                    </div>
                    <div tw="text-right">
                      <p tw="text-white font-bold">{debt.toFixed(2)} USDC</p>
                      <p tw="text-gray-400 text-sm">${debt.toFixed(2)}</p>
                    </div>
                  </div>
                  
                  {/* Repay Section */}
                  <div tw="border-t border-gray-600 pt-3">
                    <div tw="flex items-center gap-2 mb-2">
                      <FaCreditCard className="text-purple-400" />
                      <span tw="text-purple-400 font-medium">Repay</span>
                    </div>
                    <div tw="flex gap-2">
                      <input
                        type="number"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        placeholder="0.0"
                        tw="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={handleRepay}
                        disabled={isLoading || !address || debt <= 0}
                        tw="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                      >
                        {isLoading ? '...' : 'Repay'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div tw="text-center py-8">
                <FaCreditCard className="text-gray-500 text-4xl mx-auto mb-3" />
                <p tw="text-gray-400">Nothing borrowed yet</p>
                <p tw="text-gray-500 text-sm">Supply collateral to start borrowing</p>
              </div>
            )}
          </div>

          {/* Assets to Borrow */}
          <div tw="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div tw="flex items-center justify-between mb-4">
              <h2 tw="text-xl font-bold text-white">Assets to Borrow</h2>
              <button tw="text-gray-400 hover:text-white text-sm">Hide</button>
            </div>
            
            <div tw="bg-green-900/20 border border-green-700 rounded-lg p-3 mb-4">
              <p tw="text-green-300 text-sm">
                To borrow you need to supply any asset to be used as collateral
              </p>
            </div>

            {/* USDC Asset */}
            <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
              <div tw="flex items-center justify-between mb-3">
                <div tw="flex items-center gap-3">
                  <div tw="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FaDollarSign className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 tw="text-white font-semibold">USDC</h3>
                    <p tw="text-gray-400 text-sm">USD Coin</p>
                  </div>
                </div>
                <div tw="text-right">
                  <p tw="text-gray-400 text-sm">Available: 0.00</p>
                  <p tw="text-green-400 text-sm">✓ Stable</p>
                </div>
              </div>
              
              <div tw="grid grid-cols-3 gap-2 mb-3 text-sm">
                <div>
                  <p tw="text-gray-400">APY</p>
                  <p tw="text-white font-semibold">5.33%</p>
                </div>
                <div>
                  <p tw="text-gray-400">Max LTV</p>
                  <p tw="text-white font-semibold">80%</p>
                </div>
                <div>
                  <p tw="text-gray-400">Risk</p>
                  <p tw="text-green-400 font-semibold">Low</p>
                </div>
              </div>
              
              {/* Borrow Section */}
              <div tw="border-t border-gray-600 pt-3">
                <div tw="flex items-center gap-2 mb-2">
                  <FaDollarSign className="text-green-400" />
                  <span tw="text-green-400 font-medium">Borrow</span>
                </div>
                <div tw="flex gap-2">
                  <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.0"
                    tw="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                  />
                  <button
                    onClick={handleBorrow}
                    disabled={isLoading || !address || healthFactor < 1.1 || pricesLoading}
                    tw="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {isLoading ? '...' : 'Borrow'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Factor and Risk Indicators */}
      <div tw="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div tw="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div tw="flex items-center gap-2 mb-2">
            <div className={healthFactor >= 1.5 ? 'bg-green-400' : healthFactor >= 1.1 ? 'bg-yellow-400' : 'bg-red-400'} tw="w-3 h-3 rounded-full" />
            <span tw="text-gray-300">Health Factor</span>
          </div>
          <p tw="text-white font-semibold">
            {healthFactor >= 999 ? '∞ (Safe)' : healthFactor >= 1.5 ? 'Safe' : healthFactor >= 1.1 ? 'Warning' : 'Danger'}
          </p>
          <p tw="text-gray-400 text-sm">{healthFactor >= 999 ? 'No debt' : healthFactor.toFixed(2)}</p>
        </div>

        <div tw="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div tw="flex items-center gap-2 mb-2">
            <div className={getLTVColor(ltv)} tw="w-3 h-3 rounded-full" />
            <span tw="text-gray-300">Loan-to-Value</span>
          </div>
          <p tw="text-white font-semibold">{ltv.toFixed(1)}%</p>
          <p tw="text-gray-400 text-sm">Max: 80%</p>
        </div>

        <div tw="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div tw="flex items-center gap-2 mb-2">
            <div tw="w-3 h-3 rounded-full bg-blue-400" />
            <span tw="text-gray-300">Total Collateral</span>
          </div>
          <p tw="text-white font-semibold">${(collateral * kalePrice).toFixed(2)}</p>
          <p tw="text-gray-400 text-sm">{collateral.toFixed(4)} KALE</p>
        </div>
      </div>

      {/* Price Chart */}
      <div tw="mt-8">
        <PriceChart />
      </div>

      {/* Connection Status */}
      {!address && (
        <div tw="mt-8 text-center">
          <div tw="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
            <p tw="text-yellow-400">Please connect your wallet to interact with KaleFi</p>
          </div>
        </div>
      )}

      {/* Price Update Indicator */}
      {pricesLoading && (
        <div tw="mt-6 text-center">
          <div tw="inline-flex items-center gap-2 bg-blue-900/20 border border-blue-700 rounded-lg px-4 py-2">
            <div tw="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            <span tw="text-blue-400 text-sm">Updating prices...</span>
          </div>
        </div>
      )}

      {/* Floating Swap Button */}
      <div tw="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowSwapModal(true)}
          tw="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-blue-500/50"
        >
          <FaExchangeAlt tw="text-2xl" />
        </button>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <div tw="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div tw="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            {/* Modal Header */}
            <div tw="flex items-center justify-between mb-6">
              <h2 tw="text-xl font-bold text-white">Swap Tokens</h2>
              <button
                onClick={() => setShowSwapModal(false)}
                tw="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes tw="text-xl" />
              </button>
            </div>

            {/* Swap Form */}
            <div tw="space-y-4">
              {/* From Token */}
              <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div tw="flex items-center justify-between mb-2">
                  <span tw="text-gray-400 text-sm">From</span>
                  <span tw="text-gray-400 text-sm">Balance: 0.00</span>
                </div>
                <div tw="flex items-center gap-3">
                  <div tw="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <FaCoins className="text-white text-lg" />
                  </div>
                  <select
                    value={swapFromToken}
                    onChange={(e) => setSwapFromToken(e.target.value)}
                    tw="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="KALE">KALE</option>
                    <option value="USDC">USDC</option>
                  </select>
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.0"
                    tw="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Swap Arrow */}
              <div tw="flex justify-center">
                <button
                  onClick={toggleTokens}
                  tw="bg-gray-700 hover:bg-gray-600 p-2 rounded-full transition-colors"
                >
                  <FaExchangeAlt className="text-gray-400" />
                </button>
              </div>

              {/* To Token */}
              <div tw="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div tw="flex items-center justify-between mb-2">
                  <span tw="text-gray-400 text-sm">To</span>
                  <span tw="text-gray-400 text-sm">Rate: 1 KALE = $0.50</span>
                </div>
                <div tw="flex items-center gap-3">
                  <div tw="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                    <FaDollarSign className="text-white text-lg" />
                  </div>
                  <select
                    value={swapToToken}
                    onChange={(e) => setSwapToToken(e.target.value)}
                    tw="bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  >
                    <option value="USDC">USDC</option>
                    <option value="KALE">KALE</option>
                  </select>
                  <div tw="flex-1 bg-gray-600 border border-gray-500 rounded-lg px-3 py-2 text-white">
                    {swapAmount && swapFromToken === 'KALE' && swapToToken === 'USDC' 
                      ? (parseFloat(swapAmount) * 0.5).toFixed(2)
                      : swapAmount && swapFromToken === 'USDC' && swapToToken === 'KALE'
                      ? (parseFloat(swapAmount) / 0.5).toFixed(4)
                      : '0.00'
                    }
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={!swapAmount || parseFloat(swapAmount) <= 0 || !address}
                tw="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                {!address ? 'Connect Wallet' : 'Swap Tokens'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
