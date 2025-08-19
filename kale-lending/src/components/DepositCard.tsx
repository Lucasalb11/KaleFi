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
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
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
  color: ${props => props.theme.success};
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

const ActionButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(74, 222, 128, 0.4);
  }

  &:disabled {
    background: ${props => props.theme.border};
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

interface DepositCardProps {
  kalePrice: number;
  depositedAmount: number;
  onDepositChange: (amount: number) => void;
}

const DepositCard: React.FC<DepositCardProps> = ({
  kalePrice,
  depositedAmount,
  onDepositChange,
}) => {
  const [inputValue, setInputValue] = useState<string>('');
  const mockBalance = 1000; // Mock KALE balance

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    const numValue = parseFloat(value) || 0;
    onDepositChange(numValue);
  };

  const handleMaxClick = () => {
    setInputValue(mockBalance.toString());
    onDepositChange(mockBalance);
  };

  const usdValue = depositedAmount * kalePrice;

  return (
    <Card>
      <CardHeader>
        <Title>
          <Icon>K</Icon>
          Deposit KALE
        </Title>
        <PriceInfo>
          <PriceLabel>KALE Price</PriceLabel>
          <Price>${kalePrice.toFixed(4)}</Price>
        </PriceInfo>
      </CardHeader>

      <InputSection>
        <Label>Amount to Deposit</Label>
        <InputContainer>
          <Input
            type="number"
            placeholder="0.00"
            value={inputValue}
            onChange={handleInputChange}
            min="0"
            step="0.01"
          />
          <MaxButton onClick={handleMaxClick}>MAX</MaxButton>
          <TokenSymbol>KALE</TokenSymbol>
        </InputContainer>
      </InputSection>

      <InfoGrid>
        <InfoItem>
          <InfoLabel>Your Balance</InfoLabel>
          <InfoValue>{mockBalance.toLocaleString()} KALE</InfoValue>
        </InfoItem>
        <InfoItem>
          <InfoLabel>USD Value</InfoLabel>
          <InfoValue>${usdValue.toFixed(2)}</InfoValue>
        </InfoItem>
      </InfoGrid>

      <ActionButton disabled={!inputValue || parseFloat(inputValue) <= 0}>
        {!inputValue || parseFloat(inputValue) <= 0
          ? 'Enter Amount'
          : `Deposit ${parseFloat(inputValue).toLocaleString()} KALE`
        }
      </ActionButton>
    </Card>
  );
};

export default DepositCard;