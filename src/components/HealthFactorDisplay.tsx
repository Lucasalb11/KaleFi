import React from 'react';

interface HealthFactorDisplayProps {
  healthFactor: number;
}

const HealthFactorDisplay: React.FC<HealthFactorDisplayProps> = ({ healthFactor }) => {
  const getHealthFactorColor = () => {
    if (healthFactor === 0 || !isFinite(healthFactor)) return 'text-gray-400';
    if (healthFactor >= 2) return 'text-green-400';
    if (healthFactor >= 1.5) return 'text-green-500';
    if (healthFactor >= 1.2) return 'text-yellow-400';
    if (healthFactor >= 1) return 'text-orange-400';
    return 'text-red-500';
  };

  const getHealthFactorBgColor = () => {
    if (healthFactor === 0 || !isFinite(healthFactor)) return 'bg-gray-800/50';
    if (healthFactor >= 2) return 'bg-green-900/30 border-green-800/50';
    if (healthFactor >= 1.5) return 'bg-green-900/20 border-green-800/30';
    if (healthFactor >= 1.2) return 'bg-yellow-900/20 border-yellow-800/30';
    if (healthFactor >= 1) return 'bg-orange-900/20 border-orange-800/30';
    return 'bg-red-900/30 border-red-800/50';
  };

  const getHealthStatus = () => {
    if (healthFactor === 0 || !isFinite(healthFactor)) return 'No Position';
    if (healthFactor >= 2) return 'Very Safe';
    if (healthFactor >= 1.5) return 'Safe';
    if (healthFactor >= 1.2) return 'Moderate';
    if (healthFactor >= 1) return 'At Risk';
    return 'High Risk';
  };

  const displayValue = healthFactor === 0 || !isFinite(healthFactor) ? '∞' : healthFactor.toFixed(2);

  return (
    <div className={`rounded-lg p-4 border ${getHealthFactorBgColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-300">Health Factor</p>
        <span className={`text-xs font-medium px-2 py-1 rounded ${
          healthFactor >= 1 || healthFactor === 0 || !isFinite(healthFactor)
            ? 'bg-green-900/50 text-green-400' 
            : 'bg-red-900/50 text-red-400'
        }`}>
          {getHealthStatus()}
        </span>
      </div>
      <p className={`text-3xl font-bold ${getHealthFactorColor()}`}>
        {displayValue}
      </p>
      
      {/* Visual indicator bar */}
      <div className="mt-3 h-2 bg-dark-bg rounded-full overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${
            healthFactor === 0 || !isFinite(healthFactor) ? 'bg-gray-600' :
            healthFactor >= 2 ? 'bg-green-400' :
            healthFactor >= 1.5 ? 'bg-green-500' :
            healthFactor >= 1.2 ? 'bg-yellow-400' :
            healthFactor >= 1 ? 'bg-orange-400' :
            'bg-red-500'
          }`}
          style={{ 
            width: healthFactor === 0 || !isFinite(healthFactor) 
              ? '100%' 
              : `${Math.min(100, (healthFactor / 3) * 100)}%` 
          }}
        />
      </div>
      
      <div className="mt-2 text-xs text-gray-500">
        {healthFactor < 1 && healthFactor > 0 && (
          <p className="text-red-400 font-medium">⚠️ Risk of liquidation!</p>
        )}
        {healthFactor >= 1 && healthFactor < 1.2 && (
          <p className="text-orange-400">Monitor position closely</p>
        )}
      </div>
    </div>
  );
};

export default HealthFactorDisplay;