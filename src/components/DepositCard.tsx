import React, { useState } from 'react';

interface DepositCardProps {
  onDeposit: (amount: number) => void;
  depositedAmount: number;
  kalePrice: number;
}

const DepositCard: React.FC<DepositCardProps> = ({ onDeposit, depositedAmount, kalePrice }) => {
  const [amount, setAmount] = useState('');

  const handleDeposit = () => {
    const depositAmount = parseFloat(amount);
    if (depositAmount > 0 && !isNaN(depositAmount)) {
      onDeposit(depositAmount);
      setAmount('');
    }
  };

  const totalValue = depositedAmount * kalePrice;

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 shadow-xl">
      <h2 className="text-2xl font-bold mb-6">Deposit KALE</h2>
      
      <div className="space-y-4">
        <div className="bg-dark-bg rounded-lg p-4">
          <p className="text-sm text-gray-400 mb-1">Deposited Amount</p>
          <p className="text-2xl font-bold">{depositedAmount.toFixed(2)} KALE</p>
          <p className="text-sm text-gray-500">${totalValue.toFixed(2)} USD</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-300">
            Amount to Deposit
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="flex-1 bg-dark-bg border border-dark-border rounded-lg px-4 py-3 focus:outline-none focus:border-green-500 transition-colors"
            />
            <button
              onClick={handleDeposit}
              disabled={!amount || parseFloat(amount) <= 0}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Deposit
            </button>
          </div>
        </div>

        <div className="mt-4 p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
          <p className="text-sm text-green-400">
            💡 Depositing KALE allows you to borrow USDC against your collateral
          </p>
        </div>
      </div>
    </div>
  );
};

export default DepositCard;