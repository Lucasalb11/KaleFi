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
  FaTimes,
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
    repay,
  } = useKalefi()

  // Visual feedback colors
  const getHealthColor = (health: number) => {
    if (health >= 1.5) return 'text-green-400'
    if (health >= 1.1) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getHealthIcon = (health: number) => {
    if (health >= 1.5) return <FaCheckCircle className="text-green-400" />
    if (health >= 1.1)
      return <FaExclamationTriangle className="text-yellow-400" />
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
      toast.success(
        `Successfully deposited ${amount} KALE! Check "Your Supplies" section.`
      )
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

    if (collateral <= 0) {
      toast.error('You need to supply collateral first before borrowing')
      return
    }

    // Calculate maximum borrow amount based on collateral and LTV limit
    const collateralValue = collateral * kalePrice
    const maxBorrowAmount = collateralValue * 0.8 // 80% LTV limit
    const requestedAmount = parseFloat(borrowAmount)

    if (requestedAmount > maxBorrowAmount) {
      toast.error(
        `Cannot borrow more than ${maxBorrowAmount.toFixed(2)} USDC (80% of collateral value)`
      )
      return
    }

    // Check if new debt would exceed LTV limit
    const newDebt = debt + requestedAmount
    const newLTV = (newDebt / collateralValue) * 100

    if (newLTV > 80) {
      toast.error(
        `Borrowing ${requestedAmount} USDC would exceed the 80% LTV limit`
      )
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
      toast.success(
        `Successfully borrowed ${amount} USDC! Check "Your Borrows" section.`
      )
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

    if (parseFloat(withdrawAmount) > collateral) {
      toast.error('Cannot withdraw more than your supplied collateral')
      return
    }

    try {
      const amount = parseFloat(withdrawAmount)
      await withdraw(amount)
      setWithdrawAmount('')
      toast.success(`Successfully withdrew ${amount} KALE!`)
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

    if (parseFloat(repayAmount) > debt) {
      toast.error('Cannot repay more than your current debt')
      return
    }

    try {
      const amount = parseFloat(repayAmount)
      await repay(amount)
      setRepayAmount('')
      toast.success(`Successfully repaid ${amount} USDC!`)
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
    <div tw="mx-auto w-full max-w-7xl p-6">
      {/* Header */}
      <div tw="mb-8 text-center">
        <h1 tw="mb-4 font-bold text-4xl text-white">KaleFi Lending Protocol</h1>
        <p tw="text-gray-400 text-lg">Collateralized Lending on Stellar</p>
      </div>

      {/* Contract Status Indicator */}
      <div tw="mb-6 rounded-lg border border-blue-700 bg-blue-900/20 p-4">
        <div tw="flex items-center gap-3">
          <div tw="h-3 w-3 animate-pulse rounded-full bg-blue-400"></div>
          <div>
            <h3 tw="font-semibold text-blue-400">🚀 KaleFi Demo Mode</h3>
            <p tw="text-blue-300 text-sm">
              Interface conectada com dados simulados. Contratos deployados na
              testnet:
              <code tw="rounded bg-blue-800 px-2 py-1 text-xs">
                CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6
              </code>
            </p>
          </div>
        </div>
      </div>

      {/* User Position Status */}
      {address && (
        <div tw="mb-6 rounded-lg border border-gray-700 bg-gray-800 p-4">
          <div tw="mb-4 text-center">
            <h3 tw="font-semibold text-lg text-white">Your Position Status</h3>
          </div>
          <div tw="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div tw="rounded-lg border border-gray-600 bg-gray-700 p-3">
              <div tw="text-center">
                <p tw="text-gray-400 text-sm">Total Supplied</p>
                <p tw="font-bold text-white text-lg">
                  {collateral.toFixed(4)} KALE
                </p>
                <p tw="text-gray-400 text-xs">
                  ${(collateral * kalePrice).toFixed(2)}
                </p>
              </div>
            </div>
            <div tw="rounded-lg border border-gray-600 bg-gray-700 p-3">
              <div tw="text-center">
                <p tw="text-gray-400 text-sm">Total Borrowed</p>
                <p tw="font-bold text-white text-lg">{debt.toFixed(2)} USDC</p>
                <p tw="text-gray-400 text-xs">${debt.toFixed(2)}</p>
              </div>
            </div>
            <div tw="rounded-lg border border-gray-600 bg-gray-700 p-3">
              <div tw="text-center">
                <p tw="text-gray-400 text-sm">Health Factor</p>
                <p
                  className={getHealthColor(healthFactor)}
                  tw="font-bold text-lg"
                >
                  {healthFactor >= 999 ? '∞' : healthFactor.toFixed(2)}
                </p>
                <p tw="text-gray-400 text-xs">
                  {healthFactor >= 999
                    ? 'Safe (No Debt)'
                    : healthFactor >= 1.5
                      ? 'Safe'
                      : healthFactor >= 1.1
                        ? 'Warning'
                        : 'Danger'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Price Display */}
      <div tw="mb-6 rounded-lg bg-gray-800 p-4">
        <div tw="mb-4 text-center">
          <h3 tw="font-semibold text-lg text-white">Real-Time Prices</h3>
        </div>
        <div tw="grid grid-cols-1 gap-6 md:grid-cols-2">
          {/* KALE Price Card */}
          <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
            <div tw="mb-2 flex items-center justify-between">
              <div tw="flex items-center gap-2">
                <FaChartLine className="text-blue-400" />
                <span tw="font-medium text-gray-300">KALE</span>
              </div>
              <div tw="flex items-center gap-2">
                {getPriceChangeIcon(prices.KALE.change24h)}
                <span
                  className={getPriceChangeColor(prices.KALE.change24h)}
                  tw="text-sm"
                >
                  {prices.KALE.change24h > 0 ? '+' : ''}
                  {prices.KALE.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div tw="font-bold text-2xl text-white">${prices.KALE.price}</div>
            <div tw="mt-1 text-xs text-gray-400">
              Volume: ${(prices.KALE.volume24h / 1000000).toFixed(1)}M
            </div>
          </div>

          {/* USDC Price Card */}
          <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
            <div tw="mb-2 flex items-center justify-between">
              <div tw="flex items-center gap-2">
                <FaChartLine className="text-green-400" />
                <span tw="font-medium text-gray-300">USDC</span>
              </div>
              <div tw="flex items-center gap-2">
                {getPriceChangeIcon(prices.USDC.change24h)}
                <span
                  className={getPriceChangeColor(prices.USDC.change24h)}
                  tw="text-sm"
                >
                  {prices.USDC.change24h > 0 ? '+' : ''}
                  {prices.USDC.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
            <div tw="font-bold text-2xl text-white">${prices.USDC.price}</div>
            <div tw="mt-1 text-xs text-gray-400">
              Volume: ${(prices.USDC.volume24h / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>
      </div>

      {/* Main Interface - Aave Style */}
      <div tw="grid grid-cols-1 gap-8 xl:grid-cols-2">
        {/* Left Side - Supply/Withdraw */}
        <div tw="space-y-6">
          {/* Your Supplies */}
          <div tw="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div tw="mb-4 flex items-center justify-between">
              <h2 tw="font-bold text-xl text-white">Your Supplies</h2>
              <div tw="flex items-center gap-2">
                <FaShieldAlt className="text-blue-400" />
                <span tw="text-blue-400 text-sm">Collateral</span>
              </div>
            </div>

            {collateral > 0 ? (
              <div tw="space-y-4">
                {/* KALE Supply */}
                <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
                  <div tw="mb-3 flex items-center justify-between">
                    <div tw="flex items-center gap-3">
                      <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                        <FaCoins className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 tw="font-semibold text-white">KALE</h3>
                        <p tw="text-gray-400 text-sm">Collateral Asset</p>
                      </div>
                    </div>
                    <div tw="text-right">
                      <p tw="font-bold text-white">
                        {collateral.toFixed(4)} KALE
                      </p>
                      <p tw="text-gray-400 text-sm">
                        ${(collateral * kalePrice).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Supply Info */}
                  <div tw="mb-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p tw="text-gray-400">APY</p>
                      <p tw="font-semibold text-white">3.42%</p>
                    </div>
                    <div>
                      <p tw="text-gray-400">LTV</p>
                      <p tw="font-semibold text-white">80%</p>
                    </div>
                    <div>
                      <p tw="text-gray-400">Risk</p>
                      <p tw="font-semibold text-green-400">Low</p>
                    </div>
                  </div>

                  {/* Withdraw Section */}
                  <div tw="border-gray-600 border-t pt-3">
                    <div tw="mb-2 flex items-center gap-2">
                      <FaUndo className="text-orange-400" />
                      <span tw="font-medium text-orange-400">Withdraw</span>
                    </div>
                    <div tw="flex gap-2">
                      <input
                        type="number"
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        placeholder="0.0"
                        max={collateral}
                        step="0.0001"
                        tw="flex-1 rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:(border-orange-500 outline-none)"
                      />
                      <button
                        onClick={handleWithdraw}
                        disabled={
                          isLoading ||
                          !address ||
                          collateral <= 0 ||
                          !withdrawAmount ||
                          parseFloat(withdrawAmount) <= 0 ||
                          parseFloat(withdrawAmount) > collateral
                        }
                        tw="rounded-lg bg-orange-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-orange-700 disabled:(cursor-not-allowed bg-gray-600)"
                      >
                        {isLoading ? '...' : 'Withdraw'}
                      </button>
                    </div>
                    {withdrawAmount &&
                      parseFloat(withdrawAmount) > collateral && (
                        <p tw="mt-1 text-red-400 text-xs">
                          Cannot withdraw more than your collateral
                        </p>
                      )}
                  </div>
                </div>
              </div>
            ) : (
              <div tw="py-8 text-center">
                <FaWallet className="text-gray-500 text-4xl mx-auto mb-3" />
                <p tw="text-gray-400">Nothing supplied yet</p>
                <p tw="text-gray-500 text-sm">Supply assets to start earning</p>
              </div>
            )}
          </div>

          {/* Assets to Supply */}
          <div tw="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div tw="mb-4 flex items-center justify-between">
              <h2 tw="font-bold text-xl text-white">Assets to Supply</h2>
              <button tw="text-gray-400 text-sm hover:text-white">Hide</button>
            </div>

            <div tw="mb-4 rounded-lg border border-blue-700 bg-blue-900/20 p-3">
              <p tw="text-blue-300 text-sm">
                Supply assets to use as collateral and start earning
              </p>
            </div>

            {/* KALE Asset */}
            <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
              <div tw="mb-3 flex items-center justify-between">
                <div tw="flex items-center gap-3">
                  <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                    <FaCoins className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 tw="font-semibold text-white">KALE</h3>
                    <p tw="text-gray-400 text-sm">KaleFi Token</p>
                  </div>
                </div>
                <div tw="text-right">
                  <p tw="text-gray-400 text-sm">Wallet: 0.00</p>
                  <p tw="text-green-400 text-sm">✓ Can be collateral</p>
                </div>
              </div>

              <div tw="mb-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p tw="text-gray-400">APY</p>
                  <p tw="font-semibold text-white">3.42%</p>
                </div>
                <div>
                  <p tw="text-gray-400">LTV</p>
                  <p tw="font-semibold text-white">80%</p>
                </div>
                <div>
                  <p tw="text-gray-400">Risk</p>
                  <p tw="font-semibold text-green-400">Low</p>
                </div>
              </div>

              {/* Supply Section */}
              <div tw="border-gray-600 border-t pt-3">
                <div tw="mb-2 flex items-center gap-2">
                  <FaCoins className="text-blue-400" />
                  <span tw="font-medium text-blue-400">Supply</span>
                </div>
                <div tw="flex gap-2">
                  <input
                    type="number"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    step="0.0001"
                    tw="flex-1 rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:(border-blue-500 outline-none)"
                  />
                  <button
                    onClick={handleDeposit}
                    disabled={
                      isLoading ||
                      !address ||
                      pricesLoading ||
                      !depositAmount ||
                      parseFloat(depositAmount) <= 0
                    }
                    tw="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-blue-700 disabled:(cursor-not-allowed bg-gray-600)"
                  >
                    {isLoading ? '...' : 'Supply'}
                  </button>
                </div>
                {depositAmount && parseFloat(depositAmount) <= 0 && (
                  <p tw="mt-1 text-red-400 text-xs">
                    Please enter a valid amount
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Borrow/Repay */}
        <div tw="space-y-6">
          {/* Your Borrows */}
          <div tw="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div tw="mb-4 flex items-center justify-between">
              <h2 tw="font-bold text-xl text-white">Your Borrows</h2>
              <div tw="flex items-center gap-2">
                <FaPercentage className="text-red-400" />
                <span tw="text-red-400 text-sm">Debt</span>
              </div>
            </div>

            {debt > 0 ? (
              <div tw="space-y-4">
                {/* USDC Borrow */}
                <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
                  <div tw="mb-3 flex items-center justify-between">
                    <div tw="flex items-center gap-3">
                      <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                        <FaDollarSign className="text-white text-lg" />
                      </div>
                      <div>
                        <h3 tw="font-semibold text-white">USDC</h3>
                        <p tw="text-red-400 text-sm">Borrowed Asset</p>
                      </div>
                    </div>
                    <div tw="text-right">
                      <p tw="font-bold text-white">{debt.toFixed(2)} USDC</p>
                      <p tw="text-gray-400 text-sm">${debt.toFixed(2)}</p>
                    </div>
                  </div>

                  {/* Borrow Info */}
                  <div tw="mb-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p tw="text-gray-400">APY</p>
                      <p tw="font-semibold text-white">5.33%</p>
                    </div>
                    <div>
                      <p tw="text-gray-400">Max LTV</p>
                      <p tw="font-semibold text-white">80%</p>
                    </div>
                    <div>
                      <p tw="text-gray-400">Risk</p>
                      <p tw="font-semibold text-green-400">Low</p>
                    </div>
                  </div>

                  {/* Repay Section */}
                  <div tw="border-gray-600 border-t pt-3">
                    <div tw="mb-2 flex items-center gap-2">
                      <FaCreditCard className="text-purple-400" />
                      <span tw="font-medium text-purple-400">Repay</span>
                    </div>
                    <div tw="flex gap-2">
                      <input
                        type="number"
                        value={repayAmount}
                        onChange={(e) => setRepayAmount(e.target.value)}
                        placeholder="0.0"
                        max={debt}
                        step="0.01"
                        tw="flex-1 rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:(border-purple-500 outline-none)"
                      />
                      <button
                        onClick={handleRepay}
                        disabled={
                          isLoading ||
                          !address ||
                          debt <= 0 ||
                          !repayAmount ||
                          parseFloat(repayAmount) <= 0 ||
                          parseFloat(repayAmount) > debt
                        }
                        tw="rounded-lg bg-purple-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-purple-700 disabled:(cursor-not-allowed bg-gray-600)"
                      >
                        {isLoading ? '...' : 'Repay'}
                      </button>
                    </div>
                    {repayAmount && parseFloat(repayAmount) > debt && (
                      <p tw="mt-1 text-red-400 text-xs">
                        Cannot repay more than your debt
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div tw="py-8 text-center">
                <FaCreditCard className="text-gray-500 text-4xl mx-auto mb-3" />
                <p tw="text-gray-400">Nothing borrowed yet</p>
                <p tw="text-gray-500 text-sm">
                  Supply collateral to start borrowing
                </p>
              </div>
            )}
          </div>

          {/* Assets to Borrow */}
          <div tw="rounded-xl border border-gray-700 bg-gray-800 p-6">
            <div tw="mb-4 flex items-center justify-between">
              <h2 tw="font-bold text-xl text-white">Assets to Borrow</h2>
              <button tw="text-gray-400 text-sm hover:text-white">Hide</button>
            </div>

            <div tw="mb-4 rounded-lg border border-green-700 bg-green-900/20 p-3">
              <p tw="text-green-300 text-sm">
                To borrow you need to supply any asset to be used as collateral
              </p>
            </div>

            {/* USDC Asset */}
            <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
              <div tw="mb-3 flex items-center justify-between">
                <div tw="flex items-center gap-3">
                  <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                    <FaDollarSign className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 tw="font-semibold text-white">USDC</h3>
                    <p tw="text-gray-400 text-sm">USD Coin</p>
                  </div>
                </div>
                <div tw="text-right">
                  <p tw="text-gray-400 text-sm">Available: 0.00</p>
                  <p tw="text-green-400 text-sm">✓ Stable</p>
                </div>
              </div>

              <div tw="mb-3 grid grid-cols-3 gap-2 text-sm">
                <div>
                  <p tw="text-gray-400">APY</p>
                  <p tw="font-semibold text-white">5.33%</p>
                </div>
                <div>
                  <p tw="text-gray-400">Max LTV</p>
                  <p tw="font-semibold text-white">80%</p>
                </div>
                <div>
                  <p tw="text-gray-400">Risk</p>
                  <p tw="font-semibold text-green-400">Low</p>
                </div>
              </div>

              {/* Borrow Section */}
              <div tw="border-gray-600 border-t pt-3">
                <div tw="mb-2 flex items-center gap-2">
                  <FaDollarSign className="text-green-400" />
                  <span tw="font-medium text-green-400">Borrow</span>
                </div>
                <div tw="flex gap-2">
                  <input
                    type="number"
                    value={borrowAmount}
                    onChange={(e) => setBorrowAmount(e.target.value)}
                    placeholder="0.0"
                    min="0"
                    max={
                      collateral > 0
                        ? (collateral * kalePrice * 0.8).toFixed(2)
                        : '0'
                    }
                    step="0.01"
                    tw="flex-1 rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:(border-green-500 outline-none)"
                  />
                  <button
                    onClick={handleBorrow}
                    disabled={
                      isLoading ||
                      !address ||
                      healthFactor < 1.1 ||
                      pricesLoading ||
                      !borrowAmount ||
                      parseFloat(borrowAmount) <= 0 ||
                      collateral <= 0 ||
                      parseFloat(borrowAmount) > collateral * kalePrice * 0.8
                    }
                    tw="rounded-lg bg-green-600 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-700 disabled:(cursor-not-allowed bg-gray-600)"
                  >
                    {isLoading ? '...' : 'Borrow'}
                  </button>
                </div>

                {/* Borrow limit info */}
                {collateral > 0 && (
                  <div tw="mb-2 rounded-lg border border-blue-700 bg-blue-900/20 p-2">
                    <p tw="text-blue-300 text-xs">
                      Max borrow: ${(collateral * kalePrice * 0.8).toFixed(2)}{' '}
                      USDC (80% of ${(collateral * kalePrice).toFixed(2)}{' '}
                      collateral)
                    </p>
                  </div>
                )}

                {borrowAmount && parseFloat(borrowAmount) <= 0 && (
                  <p tw="mt-1 text-red-400 text-xs">
                    Please enter a valid amount
                  </p>
                )}
                {borrowAmount &&
                  collateral > 0 &&
                  parseFloat(borrowAmount) > collateral * kalePrice * 0.8 && (
                    <p tw="mt-1 text-red-400 text-xs">
                      Amount exceeds 80% LTV limit
                    </p>
                  )}
                {collateral <= 0 && (
                  <p tw="mt-1 text-yellow-400 text-xs">
                    Supply collateral first to borrow
                  </p>
                )}
                {healthFactor < 1.1 && collateral > 0 && (
                  <p tw="mt-1 text-red-400 text-xs">
                    Health factor too low to borrow
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Health Factor and Risk Indicators */}
      <div tw="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div tw="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <div tw="mb-2 flex items-center gap-2">
            <div
              className={
                healthFactor >= 1.5
                  ? 'bg-green-400'
                  : healthFactor >= 1.1
                    ? 'bg-yellow-400'
                    : 'bg-red-400'
              }
              tw="h-3 w-3 rounded-full"
            />
            <span tw="text-gray-300">Health Factor</span>
          </div>
          <p tw="font-semibold text-white">
            {healthFactor >= 999
              ? '∞ (Safe)'
              : healthFactor >= 1.5
                ? 'Safe'
                : healthFactor >= 1.1
                  ? 'Warning'
                  : 'Danger'}
          </p>
          <p tw="text-gray-400 text-sm">
            {healthFactor >= 999 ? 'No debt' : healthFactor.toFixed(2)}
          </p>
        </div>

        <div tw="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <div tw="mb-2 flex items-center gap-2">
            <div className={getLTVColor(ltv)} tw="h-3 w-3 rounded-full" />
            <span tw="text-gray-300">Loan-to-Value</span>
          </div>
          <p tw="font-semibold text-white">{ltv.toFixed(1)}%</p>
          <p tw="text-gray-400 text-sm">Max: 80%</p>
        </div>

        <div tw="rounded-lg border border-gray-700 bg-gray-800 p-4">
          <div tw="mb-2 flex items-center gap-2">
            <div tw="h-3 w-3 rounded-full bg-blue-400" />
            <span tw="text-gray-300">Total Collateral</span>
          </div>
          <p tw="font-semibold text-white">
            ${(collateral * kalePrice).toFixed(2)}
          </p>
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
          <div tw="rounded-lg border border-yellow-700 bg-yellow-900/20 p-4">
            <p tw="text-yellow-400">
              Please connect your wallet to interact with KaleFi
            </p>
          </div>
        </div>
      )}

      {/* Price Update Indicator */}
      {pricesLoading && (
        <div tw="mt-6 text-center">
          <div tw="inline-flex items-center gap-2 rounded-lg border border-blue-700 bg-blue-900/20 px-4 py-2">
            <div tw="h-4 w-4 animate-spin rounded-full border-2 border-blue-400 border-t-transparent"></div>
            <span tw="text-blue-400 text-sm">Updating prices...</span>
          </div>
        </div>
      )}

      {/* Floating Swap Button */}
      <div tw="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setShowSwapModal(true)}
          tw="transform rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-4 text-white shadow-2xl transition-all duration-300 hover:(scale-110 from-blue-700 to-purple-700 shadow-blue-500/50)"
        >
          <FaExchangeAlt tw="text-2xl" />
        </button>
      </div>

      {/* Swap Modal */}
      {showSwapModal && (
        <div tw="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div tw="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-800 p-6">
            {/* Modal Header */}
            <div tw="mb-6 flex items-center justify-between">
              <h2 tw="font-bold text-xl text-white">Swap Tokens</h2>
              <button
                onClick={() => setShowSwapModal(false)}
                tw="text-gray-400 transition-colors hover:text-white"
              >
                <FaTimes tw="text-xl" />
              </button>
            </div>

            {/* Swap Form */}
            <div tw="space-y-4">
              {/* From Token */}
              <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
                <div tw="mb-2 flex items-center justify-between">
                  <span tw="text-gray-400 text-sm">From</span>
                  <span tw="text-gray-400 text-sm">Balance: 0.00</span>
                </div>
                <div tw="flex items-center gap-3">
                  <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500">
                    <FaCoins className="text-white text-lg" />
                  </div>
                  <select
                    value={swapFromToken}
                    onChange={(e) => setSwapFromToken(e.target.value)}
                    tw="rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white focus:(border-blue-500 outline-none)"
                  >
                    <option value="KALE">KALE</option>
                    <option value="USDC">USDC</option>
                  </select>
                  <input
                    type="number"
                    value={swapAmount}
                    onChange={(e) => setSwapAmount(e.target.value)}
                    placeholder="0.0"
                    tw="flex-1 rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white placeholder-gray-400 focus:(border-blue-500 outline-none)"
                  />
                </div>
              </div>

              {/* Swap Arrow */}
              <div tw="flex justify-center">
                <button
                  onClick={toggleTokens}
                  tw="rounded-full bg-gray-700 p-2 transition-colors hover:bg-gray-600"
                >
                  <FaExchangeAlt className="text-gray-400" />
                </button>
              </div>

              {/* To Token */}
              <div tw="rounded-lg border border-gray-600 bg-gray-700 p-4">
                <div tw="mb-2 flex items-center justify-between">
                  <span tw="text-gray-400 text-sm">To</span>
                  <span tw="text-gray-400 text-sm">Rate: 1 KALE = $0.50</span>
                </div>
                <div tw="flex items-center gap-3">
                  <div tw="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                    <FaDollarSign className="text-white text-lg" />
                  </div>
                  <select
                    value={swapToToken}
                    onChange={(e) => setSwapToToken(e.target.value)}
                    tw="rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white focus:(border-blue-500 outline-none)"
                  >
                    <option value="USDC">USDC</option>
                    <option value="KALE">KALE</option>
                  </select>
                  <div tw="flex-1 rounded-lg border border-gray-500 bg-gray-600 px-3 py-2 text-white">
                    {swapAmount &&
                    swapFromToken === 'KALE' &&
                    swapToToken === 'USDC'
                      ? (parseFloat(swapAmount) * 0.5).toFixed(2)
                      : swapAmount &&
                          swapFromToken === 'USDC' &&
                          swapToToken === 'KALE'
                        ? (parseFloat(swapAmount) / 0.5).toFixed(4)
                        : '0.00'}
                  </div>
                </div>
              </div>

              {/* Swap Button */}
              <button
                onClick={handleSwap}
                disabled={
                  !swapAmount || parseFloat(swapAmount) <= 0 || !address
                }
                tw="w-full rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 py-3 px-4 font-semibold text-white transition-all duration-300 hover:(from-blue-700 to-purple-700) disabled:(cursor-not-allowed from-gray-600 to-gray-600)"
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
