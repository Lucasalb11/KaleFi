import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { KaleFiLendingInterface } from './KaleFiLendingInterface'
import { useSorobanReact } from '@soroban-react/core'
import { usePriceOracle } from '@/hooks/usePriceOracle'
import { useKalefi } from '@/hooks/useKalefi'

// Mock the hooks
jest.mock('@soroban-react/core')
jest.mock('@/hooks/usePriceOracle')
jest.mock('@/hooks/useKalefi')

const mockUseSorobanReact = useSorobanReact as jest.MockedFunction<typeof useSorobanReact>
const mockUsePriceOracle = usePriceOracle as jest.MockedFunction<typeof usePriceOracle>
const mockUseKalefi = useKalefi as jest.MockedFunction<typeof useKalefi>

describe('KaleFiLendingInterface', () => {
  const mockAddress = 'GABC123456789'
  
  const mockPrices = {
    KALE: { price: 0.5, change24h: 2.5, volume24h: 1000000 },
    USDC: { price: 1.0, change24h: 0.0, volume24h: 5000000 }
  }

  const mockKalefiState = {
    collateral: 0,
    debt: 0,
    healthFactor: 999,
    ltv: 0,
    kalePrice: 0.5,
    isLoading: false
  }

  const mockKalefiActions = {
    deposit: jest.fn(),
    borrow: jest.fn(),
    withdraw: jest.fn(),
    repay: jest.fn(),
    fetchUserPosition: jest.fn()
  }

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks()
    
    // Setup default mock implementations
    mockUseSorobanReact.mockReturnValue({
      address: mockAddress,
      activeChain: { network: 'testnet' },
      connect: jest.fn(),
      disconnect: jest.fn(),
      setActiveChain: jest.fn(),
      chains: [],
      isConnecting: false,
      isConnected: true
    } as any)

    mockUsePriceOracle.mockReturnValue({
      prices: mockPrices,
      isLoading: false
    })

    mockUseKalefi.mockReturnValue({
      ...mockKalefiState,
      ...mockKalefiActions
    })
  })

  it('renders the interface correctly', () => {
    render(<KaleFiLendingInterface />)
    
    expect(screen.getByText('KaleFi Lending Protocol')).toBeInTheDocument()
    expect(screen.getByText('Your Supplies')).toBeInTheDocument()
    expect(screen.getByText('Your Borrows')).toBeInTheDocument()
    expect(screen.getByText('Assets to Supply')).toBeInTheDocument()
    expect(screen.getByText('Assets to Borrow')).toBeInTheDocument()
  })

  it('shows empty state when no collateral or debt', () => {
    render(<KaleFiLendingInterface />)
    
    expect(screen.getByText('Nothing supplied yet')).toBeInTheDocument()
    expect(screen.getByText('Nothing borrowed yet')).toBeInTheDocument()
  })

  it('allows depositing KALE', async () => {
    mockKalefiActions.deposit.mockResolvedValue(undefined)
    
    render(<KaleFiLendingInterface />)
    
    const depositInput = screen.getByPlaceholderText('0.0')
    const supplyButton = screen.getByText('Supply')
    
    fireEvent.change(depositInput, { target: { value: '100' } })
    fireEvent.click(supplyButton)
    
    await waitFor(() => {
      expect(mockKalefiActions.deposit).toHaveBeenCalledWith(100)
    })
  })

  it('allows borrowing USDC when collateral exists', async () => {
    mockKalefiActions.borrow.mockResolvedValue(undefined)
    
    // Mock state with collateral
    mockUseKalefi.mockReturnValue({
      ...mockKalefiState,
      collateral: 1000,
      healthFactor: 2.0,
      ...mockKalefiActions
    })
    
    render(<KaleFiLendingInterface />)
    
    const borrowInput = screen.getByPlaceholderText('0.0')
    const borrowButton = screen.getByText('Borrow')
    
    fireEvent.change(borrowInput, { target: { value: '50' } })
    fireEvent.click(borrowButton)
    
    await waitFor(() => {
      expect(mockKalefiActions.borrow).toHaveBeenCalledWith(50)
    })
  })

  it('prevents borrowing when no collateral', () => {
    render(<KaleFiLendingInterface />)
    
    const borrowButton = screen.getByText('Borrow')
    expect(borrowButton).toBeDisabled()
  })

  it('prevents borrowing when health factor is low', () => {
    // Mock state with low health factor
    mockUseKalefi.mockReturnValue({
      ...mockKalefiState,
      collateral: 1000,
      healthFactor: 1.0,
      ...mockKalefiActions
    })
    
    render(<KaleFiLendingInterface />)
    
    const borrowButton = screen.getByText('Borrow')
    expect(borrowButton).toBeDisabled()
  })

  it('shows position status when connected', () => {
    render(<KaleFiLendingInterface />)
    
    expect(screen.getByText('Your Position Status')).toBeInTheDocument()
    expect(screen.getByText('Total Supplied')).toBeInTheDocument()
    expect(screen.getByText('Total Borrowed')).toBeInTheDocument()
    expect(screen.getByText('Health Factor')).toBeInTheDocument()
  })

  it('displays real-time prices', () => {
    render(<KaleFiLendingInterface />)
    
    expect(screen.getByText('$0.50')).toBeInTheDocument() // KALE price
    expect(screen.getByText('$1.00')).toBeInTheDocument() // USDC price
  })

  it('shows loading state during operations', () => {
    // Mock loading state
    mockUseKalefi.mockReturnValue({
      ...mockKalefiState,
      isLoading: true,
      ...mockKalefiActions
    })
    
    render(<KaleFiLendingInterface />)
    
    const supplyButton = screen.getByText('...')
    expect(supplyButton).toBeInTheDocument()
  })
})
