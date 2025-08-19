# KALE Lending Protocol UI

A simple dark mode lending protocol UI for depositing KALE tokens and borrowing USDC with real-time health factor monitoring.

## Features

- **Dark Mode UI**: Modern, clean interface with dark theme
- **Deposit KALE**: Simple card interface for depositing KALE tokens
- **Borrow USDC**: Borrow against your KALE collateral with real-time health factor display
- **Real-time Price Updates**: Integrated with Reflector oracle (simulated) for live price feeds
- **Visual Health Factor**: Color-coded health factor with visual indicators:
  - 🟢 Green (≥2.0): Very Safe
  - 🟢 Light Green (≥1.5): Safe
  - 🟡 Yellow (≥1.2): Moderate
  - 🟠 Orange (≥1.0): At Risk
  - 🔴 Red (<1.0): High Risk / Liquidation Risk
- **LTV Calculations**: Real-time Loan-to-Value ratio calculations
- **Responsive Design**: Works on desktop and mobile devices

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open your browser at `http://localhost:5173`

## How it Works

1. **Deposit KALE**: Enter the amount of KALE tokens you want to deposit as collateral
2. **Monitor Collateral Value**: See your deposited KALE value in USD based on real-time prices
3. **Borrow USDC**: Borrow up to 75% of your collateral value in USDC
4. **Watch Health Factor**: Monitor your health factor to avoid liquidation:
   - Health Factor = (Collateral Value × 80%) / Borrowed Amount
   - Keep it above 1.0 to avoid liquidation
   - Ideally maintain above 1.5 for safety

## Technical Details

- Built with React + TypeScript + Vite
- Styled with Tailwind CSS
- Reflector Oracle integration for real-time price feeds (currently simulated)
- Maximum LTV: 75%
- Liquidation Threshold: 80%

## Notes

- The Reflector integration currently uses simulated prices for demo purposes
- In production, replace the simulated API calls in `src/services/reflectorService.ts` with actual Reflector API endpoints
- Prices update every 10 seconds automatically