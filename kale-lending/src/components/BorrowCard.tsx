import React, { useState } from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background: ${props => props.theme.cardBackground};
  border-radius: 16px;
  padding: 2rem;
  box-shadow: ${props => props.theme.shadow};
  border: 1px solid ${props => props.theme.border};
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px -5px rgba(0, 0, 0, 0.4);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  color: ${props => props.theme.text};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Icon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
`;

const PriceInfo = styled.div`
  text-align: right;
`;

const PriceLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme.textSecondary};
`;

const Price = styled.div`
  font-size: 1.125rem;
  font-weight: 600;
  color: ${props => props.theme.primary};
`;

const HealthFactorSection = styled.div<{ healthFactor: number }>`
  background: ${props => props.theme.background};
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border: 2px solid ${props => {
    if (props.healthFactor >= 150) return props.theme.success;
    if (props.healthFactor >= 125) return props.theme.warning;
    if (props.healthFactor >= 110) return '#f97316'; // Orange
    return props.theme.danger;
  }};
  transition: all 0.3s ease;
`;

const HealthHeader = styled.div`
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
`;

const HealthTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const HealthValue = styled.div<{ healthFactor: number }>`
  font-size: 1.5rem;
  font-weight: 700;
  color: ${props => {
    if (props.healthFactor >= 150) return props.theme.success;
    if (props.healthFactor >= 125) return props.theme.warning;
    if (props.healthFactor >= 110) return '#f97316'; // Orange
    return props.theme.danger;
  }};
`;

const HealthBar = styled.div`
  width: 100%;
  height: 8px;
  background: ${props => props.theme.border};
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const HealthFill = styled.div<{ healthFactor: number }>`
  height: 100%;
  width: ${props => Math.min(props.healthFactor, 100)}%;
  background: ${props => {
    if (props.healthFactor >= 150) return props.theme.success;
    if (props.healthFactor >= 125) return props.theme.warning;
    if (props.healthFactor >= 110) return '#f97316'; // Orange
    return props.theme.danger;
  }};
  transition: all 0.3s ease;
`;

const RiskIndicator = styled.div<{ healthFactor: number }>`
  font-size: 0.875rem;
  font-weight: 600;
  text-align: center;
  color: ${props => {
    if (props.healthFactor >= 150) return props.theme.success;
    if (props.healthFactor >= 125) return props.theme.warning;
    if (props.healthFactor >= 110) return '#f97316'; // Orange
    return props.theme.danger;
  }};
`;

const InputSection = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${props => props.theme.textSecondary};
  margin-bottom: 0.5rem;
`;

const InputContainer = styled.div`
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 4rem 1rem 1rem;
  background: ${props => props.theme.background};
  border: 2px solid ${props => props.theme.border};
  border-radius: 12px;
  color: ${props => props.theme.text};
  font-size: 1.125rem;
  font-weight: 500;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.primary};
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  &::placeholder {
    color: ${props => props.theme.textSecondary};
  }
`;

const TokenSymbol = styled.div`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  font-weight: 600;
  color: ${props => props.theme.textSecondary};
`;

const MaxButton = styled.button`
  position: absolute;
  right: 4.5rem;
  top: 50%;
  transform: translateY(-50%);
  background: ${props => props.theme.primary};
  color: white;
  border: none;
  border-radius: 6px;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #2563eb;
  }
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const InfoItem = styled.div`
  background: ${props => props.theme.background};
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.border};
`;

const InfoLabel = styled.div`
  font-size: 0.75rem;
  color: ${props => props.theme.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.25rem;
`;

const InfoValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.theme.text};
`;

const ActionButton = styled.button<{ healthFactor: number; disabled: boolean }>`
  width: 100%;
  padding: 1rem;
  background: ${props => {
    if (props.disabled) return props.theme.border;
    if (props.healthFactor < 110) return props.theme.danger;
    return `linear-gradient(135deg, ${props.theme.primary} 0%, #1d4ed8 100%)`;
  }};
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
    box-shadow: ${props => props.disabled ? 'none' : `0 4px 12px rgba(59, 130, 246, 0.4)`};
  }
`;

interface BorrowCardProps {
  usdcPrice: number;
  borrowedAmount: number;
  healthFactor: number;
  ltv: number;
  maxBorrowable: number;
  onBorrowChange: (amount: number) => void;
}

const BorrowCard: React.FC<BorrowCardProps> = ({
  usdcPrice,
  borrowedAmount,
  healthFactor,
  ltv,
  maxBorrowable,
  onBorrowChange,
}) => {
  const [inputValue, setInputValue] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseFloat(value) || 0;
    onBorrowChange(numValue);
  };

  const handleMaxClick = () => {
    const maxAmount = maxBorrowable / usdcPrice;
    setInputValue(maxAmount.toFixed(2));
    onBorrowChange(maxAmount);
  };

  const getRiskLabel = (hf: number): string => {
    if (hf >= 150) return 'SAFE';
    if (hf >= 125) return 'MODERATE';
    if (hf >= 110) return 'HIGH RISK';
    return 'CRITICAL';
  };

  const isDisabled = !inputValue || parseFloat(inputValue) <= 0 || parseFloat(inputValue) > (maxBorrowable / usdcPrice);

  return (
    <Card>
      <CardHeader>
        <Title>
          <Icon>$</Icon>
          Borrow USDC
        </Title>
        <PriceInfo>
          <PriceLabel>USDC Price</PriceLabel>
          <Price>${usdcPrice.toFixed(2)}</Price>
        </PriceInfo>
      </CardHeader>

      <HealthFactorSection healthFactor={healthFactor}>
        <HealthHeader>
          <HealthTitle>Health Factor</HealthTitle>
          <HealthValue healthFactor={healthFactor}>
            {healthFactor.toFixed(0)}%
          </HealthValue>
        </HealthHeader>
        <HealthBar>
          <HealthFill healthFactor={healthFactor} />
        </HealthBar>
        <RiskIndicator healthFactor={healthFactor}>
          {getRiskLabel(healthFactor)} • LTV: {ltv.toFixed(1)}%
        </RiskIndicator>
      </HealthFactorSection>

      <InputSection>
        <Label>Amount to Borrow</Label>
        <InputContainer>
          <Input
            type="number"
            placeholder="0.00"
            value={inputValue}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            max={(maxBorrowable / usdcPrice).toFixed(2)}
          />
          <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
          <TokenSymbol>USDC</TokenSymbol>
        </InputContainer>
      </InputSection>

      <InfoGrid>
        <InfoItem>
          <InfoLabel>Max Borrowable</InfoLabel>
          <InfoValue>${maxBorrowable.toFixed(2)}</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>Current LTV</InfoLabel>
          <InfoValue>{ltv.toFixed(1)}%</InfoValue>
        </InfoItem>
      </InfoGrid>

      <ActionButton 
        healthFactor={healthFactor} 
        disabled={isDisabled}
      >
        {!inputValue || parseFloat(inputValue) <= 0
          ? 'Enter Amount'
          : parseFloat(inputValue) > (maxBorrowable / usdcPrice)
          ? 'Amount Exceeds Limit'
          : healthFactor < 110
          ? `⚠️ High Risk - Borrow $${parseFloat(inputValue).toLocaleString()}`
          : `Borrow $${parseFloat(inputValue).toLocaleString()} USDC`
        }
      </ActionButton>
    </Card>
  );
};

export default BorrowCard;