# KaleFi Lending Interface

Esta é a interface principal do protocolo de lending KaleFi, construída com React e TypeScript, integrada com a blockchain Stellar através do Soroban.

## 🚀 Funcionalidades

### Operações Principais

#### 1. **Supply (Depósito)**
- **O que é**: Depositar tokens KALE como collateral
- **Como funciona**: 
  - Digite a quantidade de KALE que deseja depositar
  - Clique em "Supply"
  - Os tokens são adicionados ao seu collateral
  - Você pode ver o total na seção "Your Supplies"

#### 2. **Borrow (Empréstimo)**
- **O que é**: Pegar emprestado tokens USDC
- **Como funciona**:
  - Primeiro você precisa ter collateral (KALE)
  - Digite a quantidade de USDC que deseja emprestar
  - Clique em "Borrow"
  - Os tokens USDC são enviados para sua carteira
  - A dívida aparece na seção "Your Borrows"

#### 3. **Withdraw (Retirada)**
- **O que é**: Retirar parte do seu collateral
- **Como funciona**:
  - Digite a quantidade de KALE que deseja retirar
  - Clique em "Withdraw"
  - Os tokens são devolvidos para sua carteira
  - O collateral é reduzido proporcionalmente

#### 4. **Repay (Pagamento)**
- **O que é**: Pagar parte da sua dívida
- **Como funciona**:
  - Digite a quantidade de USDC que deseja pagar
  - Clique em "Repay"
  - A dívida é reduzida proporcionalmente

### Indicadores de Risco

#### **Health Factor**
- **∞ (Safe)**: Sem dívida - situação segura
- **> 1.5**: Seguro - pode fazer operações
- **1.1 - 1.5**: Aviso - cuidado com novas operações
- **< 1.1**: Perigoso - não pode fazer novas operações

#### **Loan-to-Value (LTV)**
- **0%**: Sem dívida
- **< 50%**: Seguro
- **50-80%**: Aviso
- **> 80%**: Perigoso (limite máximo)

## 🔧 Como Usar

### 1. **Conectar Carteira**
- Clique em "Connect Wallet" no canto superior direito
- Use Freighter ou outra carteira compatível com Stellar

### 2. **Fazer Supply**
1. Na seção "Assets to Supply"
2. Digite a quantidade de KALE
3. Clique em "Supply"
4. Confirme a transação na sua carteira

### 3. **Fazer Borrow**
1. Primeiro faça supply de KALE como collateral
2. Na seção "Assets to Borrow"
3. Digite a quantidade de USDC
4. Clique em "Borrow"
5. Confirme a transação na sua carteira

### 4. **Monitorar Posição**
- Use a seção "Your Position Status" para ver:
  - Total de collateral
  - Total de dívida
  - Health factor atual

## 📊 Dados em Tempo Real

### Preços
- **KALE**: Preço atual em USD
- **USDC**: Sempre $1.00 (stablecoin)
- Mudanças de 24h
- Volume de negociação

### APY (Annual Percentage Yield)
- **KALE Supply**: 3.42% (ganho sobre collateral)
- **USDC Borrow**: 5.33% (custo do empréstimo)

## 🛡️ Segurança

### Validações Implementadas
- ✅ Verificação de carteira conectada
- ✅ Validação de valores positivos
- ✅ Verificação de health factor
- ✅ Verificação de collateral suficiente
- ✅ Prevenção de overdraw/overborrow

### Boas Práticas
- Mantenha seu health factor acima de 1.5
- Não retire todo seu collateral se tiver dívidas
- Monitore o preço do KALE (afeta seu health factor)
- Pague dívidas antes de retirar muito collateral

## 🔄 Estado da Interface

### Atualizações em Tempo Real
- O estado é atualizado imediatamente após operações
- Health factor e LTV são recalculados automaticamente
- Feedback visual instantâneo para todas as operações

### Dados Persistidos
- As operações são simuladas localmente para demonstração
- Em produção, os dados virão dos smart contracts
- O estado é mantido durante a sessão do usuário

## 🧪 Modo Demo

**⚠️ IMPORTANTE**: Esta é uma versão de demonstração que:
- Usa dados simulados (mock data)
- Não faz transações reais na blockchain
- Serve para testar a interface e fluxo de usuário
- Os contratos estão deployados na testnet para referência

## 🚀 Próximos Passos

### Implementações Futuras
- [ ] Integração real com smart contracts Soroban
- [ ] Transações reais na blockchain Stellar
- [ ] Histórico de transações
- [ ] Notificações push para mudanças de preço
- [ ] Integração com mais tokens
- [ ] Analytics avançados de posição

### Melhorias de UX
- [ ] Animações de transições
- [ ] Modo escuro/claro
- [ ] Responsividade mobile
- [ ] Internacionalização (i18n)
- [ ] Acessibilidade (a11y)

## 📝 Troubleshooting

### Problemas Comuns

**Q: Por que não consigo fazer borrow?**
A: Verifique se:
- Tem collateral suficiente
- Health factor > 1.1
- Carteira conectada

**Q: Por que o health factor mudou?**
A: O health factor é calculado como: `(collateral × preço) / dívida`

**Q: Posso retirar todo meu collateral?**
A: Só se não tiver dívidas. Caso contrário, mantenha suficiente para manter health factor > 1.1

## 🤝 Contribuição

Para contribuir com o desenvolvimento:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Implemente as mudanças
4. Adicione testes
5. Faça pull request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

