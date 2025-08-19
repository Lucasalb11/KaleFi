import React, { useState, useEffect } from 'react';
import DepositCard from './components/DepositCard';
import BorrowCard from './components/BorrowCard';
import { ReflectorService } from './services/reflectorService';
import { calculateHealthFactor, calculateLTV } from './utils/calculations';

export interface LendingState {
  depositedKALE: number;
  borrowedUSDC: number;
  kalePrice: number;
  healthFactor: number;
  ltv: number;
}

function App() {
  const [lendingState, setLendingState] = useState<LendingState>({
    depositedKALE: 0,
    borrowedUSDC: 0,
    kalePrice: 0,
    healthFactor: 0,
    ltv: 0,
  });

  const [loading, setLoading] = useState(true);
  const reflectorService = new ReflectorService();

  // Fetch initial price and set up price updates
  useEffect(() => {
    const fetchPrice = async () => {
      try {
        const price = await reflectorService.getKALEPrice();
        setLendingState(prev => ({ ...prev, kalePrice: price }));
        setLoading(false);
      } catch (error) {
        console.error('Error fetching KALE price:', error);
        // Use a default price for demo purposes
        setLendingState(prev => ({ ...prev, kalePrice: 0.5 }));
        setLoading(false);
      }
    };

    fetchPrice();

    // Set up price update interval (every 10 seconds)
    const interval = setInterval(fetchPrice, 10000);

    return () => clearInterval(interval);
  }, []);

  // Recalculate health factor and LTV when values change
  useEffect(() => {
    const collateralValue = lendingState.depositedKALE * lendingState.kalePrice;
    const ltv = calculateLTV(collateralValue, lendingState.borrowedUSDC);
    const healthFactor = calculateHealthFactor(collateralValue, lendingState.borrowedUSDC);

    setLendingState(prev => ({
      ...prev,
      ltv,
      healthFactor,
    }));
  }, [lendingState.depositedKALE, lendingState.borrowedUSDC, lendingState.kalePrice]);

  const handleDeposit = (amount: number) => {
    setLendingState(prev => ({
      ...prev,
      depositedKALE: prev.depositedKALE + amount,
    }));
  };

  const handleBorrow = (amount: number) => {
    setLendingState(prev => ({
      ...prev,
      borrowedUSDC: prev.borrowedUSDC + amount,
    }));
  };

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center p-4">
      <div className="max-w-6xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
          KALE Lending Protocol
        </h1>
        
        {loading ? (
          <div className="text-center text-gray-400">Loading price data...</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            <DepositCard 
              onDeposit={handleDeposit}
              depositedAmount={lendingState.depositedKALE}
              kalePrice={lendingState.kalePrice}
            />
            <BorrowCard 
              onBorrow={handleBorrow}
              borrowedAmount={lendingState.borrowedUSDC}
              healthFactor={lendingState.healthFactor}
              ltv={lendingState.ltv}
              maxBorrowable={lendingState.depositedKALE * lendingState.kalePrice * 0.75} // 75% LTV max
            />
          </div>
        )}

        <div className="mt-8 text-center text-sm text-gray-500">
          KALE Price: ${lendingState.kalePrice.toFixed(4)} • Updated every 10 seconds
        </div>
      </div>
    </div>
  );
}

export default App;