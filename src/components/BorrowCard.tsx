import React, { useState } from 'react';
import HealthFactorDisplay from './HealthFactorDisplay';

interface BorrowCardProps {
  onBorrow: (amount: number) => void;
  borrowedAmount: number;
  healthFactor: number;
  ltv: number;
  maxBorrowable: number;
}

const BorrowCard: React.FC<BorrowCardProps> = ({ 
  onBorrow, 
  borrowedAmount, 
  healthFactor, 
  ltv,
  maxBorrowable 
}) => {
  const [amount, setAmount] = useState('');

  const handleBorrow = () => {
    const borrowAmount = parseFloat(amount);
    if (borrowAmount > 0 && !isNaN(borrowAmount)) {
      onBorrow(borrowAmount);
      setAmount('');
    }
  };

  const availableToBorrow = Math.max(0, maxBorrowable - borrowedAmount);

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Borrow USDC</h2>
      
      <div className="space-y-4">
        <HealthFactorDisplay healthFactor={healthFactor} />

        <div className="bg-dark-bg rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Borrowed Amount</p>
          <p className="text-2xl font-bold">{borrowedAmount.toFixed(2)} USDC</p>
          <p className="text-sm text-gray-500">LTV: {ltv.toFixed(1)}%</p>
        </div>

        <div className="bg-dark-bg rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Available to Borrow</p>
          <p className="text-xl font-semibold text-green-400">
            {availableToBorrow.toFixed(2)} USDC
          </p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Amount to Borrow
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors"
            />
            <button
              onClick={handleBorrow}
              disabled={!amount || parseFloat(amount) <= 0 || parseFloat(amount) > availableToBorrow}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Borrow
            </button>
          </div>
          {amount && parseFloat(amount) > availableToBorrow && (
            <p className="text-sm text-red-400">
              Amount exceeds available borrowing capacity
            </p>
          )}
        </div>

        <div className="mt-4 p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
          <p className="text-sm text-blue-400">
            💡 Maximum LTV is 75%. Keep your Health Factor above 1.0 to avoid liquidation
          </p>
        </div>
      </div>
    </div>
  );
};

export default BorrowCard;