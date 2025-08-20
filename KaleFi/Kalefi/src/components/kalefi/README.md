# KaleFi Lending Interface Components

This directory contains the UI components for the KaleFi lending protocol on Stellar.

## Components

### KaleFiLendingInterface
The main lending interface component that provides:
- **Deposit KALE**: Users can deposit KALE tokens as collateral
- **Borrow USDC**: Users can borrow USDC against their KALE collateral
- **Real-time Price Display**: Shows current KALE and USDC prices with 24h changes
- **Health Factor Monitoring**: Visual indicators for loan health and risk
- **Loan-to-Value (LTV) Calculation**: Real-time LTV based on current prices

### PriceChart
A simple price chart component that displays:
- Historical KALE price data over 1D, 7D, and 30D timeframes
- Price change percentages
- Visual price trend indicators
- Recent price data points

## Features

### Real-time Price Integration
- **Price Oracle Service**: Simulates real-time price updates every 5 seconds
- **Price Volatility**: Realistic price movements with configurable volatility
- **24h Price Changes**: Shows price performance over the last 24 hours
- **Volume Data**: Displays trading volume for market context

### Risk Management
- **Health Factor**: Calculated as (Collateral × Liquidation Threshold) / Borrowed Value
- **Visual Risk Indicators**: 
  - 🟢 Green: Safe (Health Factor ≥ 1.5)
  - 🟡 Yellow: Warning (Health Factor 1.1-1.5)
  - 🔴 Red: Danger (Health Factor < 1.1)
- **LTV Monitoring**: Real-time loan-to-value ratio with color coding
- **Borrow Limits**: Prevents borrowing when health factor is too low

### User Experience
- **Dark Mode Design**: Modern, professional dark theme
- **Responsive Layout**: Works on desktop and mobile devices
- **Real-time Updates**: Live price and health factor updates
- **Interactive Elements**: Hover effects and smooth transitions
- **Loading States**: Visual feedback during operations

## Technical Implementation

### Price Oracle Service
```typescript
// Located in src/services/priceOracle.ts
class PriceOracleService {
  // Real-time price updates every 5 seconds
  // Configurable volatility settings
  // Subscriber pattern for price updates
  // Historical price data generation
}
```

### Custom Hooks
```typescript
// Located in src/hooks/usePriceOracle.ts
export const usePriceOracle = () => {
  // Real-time price subscription
  // Price impact calculations
  // Historical data fetching
}
```

### State Management
- Local state for deposit/borrow amounts
- Real-time price data from oracle service
- Collateral and borrowed value tracking
- Loading states for better UX

## Future Enhancements

### Smart Contract Integration
- Replace mock deposit/borrow logic with actual Soroban contract calls
- Integrate with KaleFi lending protocol smart contracts
- Real-time balance updates from blockchain

### Advanced Price Feeds
- Integration with Pyth Network for Stellar
- Chainlink price oracle support
- Multiple price source aggregation

### Enhanced Risk Management
- Liquidation threshold configuration
- Collateral type diversification
- Advanced risk scoring algorithms

### Analytics & Reporting
- Transaction history
- Interest rate calculations
- Portfolio performance metrics
- Risk assessment reports

## Usage

The components are automatically integrated into the main page at `src/pages/index.tsx`. Users can:

1. **Connect Wallet**: Use Freighter or other Stellar wallets
2. **View Prices**: See real-time KALE and USDC prices
3. **Deposit Collateral**: Add KALE tokens to their position
4. **Borrow USDC**: Take out loans against their collateral
5. **Monitor Risk**: Track health factor and LTV in real-time
6. **Analyze Trends**: View price charts and historical data

## Styling

The components use:
- **Twin.macro**: For CSS-in-JS with Tailwind utilities
- **Dark Theme**: Professional dark mode design
- **Responsive Grid**: CSS Grid for flexible layouts
- **Color Coding**: Semantic colors for risk indicators
- **Smooth Transitions**: CSS transitions for interactions

