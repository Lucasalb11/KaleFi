import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import DepositCard from './components/DepositCard';
import BorrowCard from './components/BorrowCard';
import { ReflectorService } from './services/ReflectorService';

const darkTheme = {
  background: '#1a1a1a',
  cardBackground: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#b0b0b0',
  border: '#404040',
  success: '#4ade80',
  danger: '#ef4444',
  warning: '#f59e0b',
  primary: '#3b82f6',
  shadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
};

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
      sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.background};
    color: ${props => props.theme.text};
    min-height: 100vh;
  }

  #root {
    min-height: 100vh;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
`;

const Header = styled.header`
  text-align: center;
  margin-bottom: 3rem;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  color: ${props => props.theme.textSecondary};
  font-size: 1.1rem;
`;

const CardsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  max-width: 1200px;
  margin: 0 auto;
`;

interface AppState {
  kalePrice: number;
  usdcPrice: number;
  depositedKale: number;
  borrowedUsdc: number;
  healthFactor: number;
  ltv: number;
}

function App() {
  const [state, setState] = useState<AppState>({
    kalePrice: 0,
    usdcPrice: 1,
    depositedKale: 0,
    borrowedUsdc: 0,
    healthFactor: 100,
    ltv: 0,
  });

  const reflectorService = new ReflectorService();

  useEffect(() => {
    // Initialize price fetching
    const fetchPrices = async () => {
      try {
        const prices = await reflectorService.getPrices();
        setState(prev => ({
          ...prev,
          kalePrice: prices.kale,
          usdcPrice: prices.usdc,
        }));
      } catch (error) {
        console.error('Error fetching prices:', error);
        // Use mock prices for development
        setState(prev => ({
          ...prev,
          kalePrice: 0.25, // Mock KALE price
          usdcPrice: 1.00, // USDC is stable
        }));
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const calculateHealthMetrics = (depositKale: number, borrowUsdc: number) => {
    const collateralValue = depositKale * state.kalePrice;
    const debtValue = borrowUsdc * state.usdcPrice;
    
    if (collateralValue === 0) {
      return { healthFactor: 100, ltv: 0 };
    }

    const ltv = (debtValue / collateralValue) * 100;
    const maxLtv = 75; // 75% max LTV
    const healthFactor = maxLtv / (ltv || 0.01) * 100;

    return {
      healthFactor: Math.min(healthFactor, 100),
      ltv,
    };
  };

  const handleDepositChange = (amount: number) => {
    const metrics = calculateHealthMetrics(amount, state.borrowedUsdc);
    setState(prev => ({
      ...prev,
      depositedKale: amount,
      healthFactor: metrics.healthFactor,
      ltv: metrics.ltv,
    }));
  };

  const handleBorrowChange = (amount: number) => {
    const metrics = calculateHealthMetrics(state.depositedKale, amount);
    setState(prev => ({
      ...prev,
      borrowedUsdc: amount,
      healthFactor: metrics.healthFactor,
      ltv: metrics.ltv,
    }));
  };

  return (
    <ThemeProvider theme={darkTheme}>
      <GlobalStyle />
      <Container>
        <Header>
          <Title>KALE Lending</Title>
          <Subtitle>Deposit KALE • Borrow USDC • Real-time Health Monitoring</Subtitle>
        </Header>
        
        <CardsContainer>
          <DepositCard
            kalePrice={state.kalePrice}
            depositedAmount={state.depositedKale}
            onDepositChange={handleDepositChange}
          />
          <BorrowCard
            usdcPrice={state.usdcPrice}
            borrowedAmount={state.borrowedUsdc}
            healthFactor={state.healthFactor}
            ltv={state.ltv}
            onBorrowChange={handleBorrowChange}
            maxBorrowable={state.depositedKale * state.kalePrice * 0.75}
          />
        </CardsContainer>
      </Container>
    </ThemeProvider>
  );
}

export default App;