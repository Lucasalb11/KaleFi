# 🌿 KaleFi - Protocolo DeFi no Stellar

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Rust](https://img.shields.io/badge/Rust-1.70+-blue.svg)](https://www.rust-lang.org/)
[![Soroban](https://img.shields.io/badge/Soroban-20.0+-purple.svg)](https://soroban.stellar.org/)
[![Next.js](https://img.shields.io/badge/Next.js-15.4+-black.svg)](https://nextjs.org/)

KaleFi é um protocolo DeFi inovador construído na blockchain Stellar usando contratos inteligentes Soroban. O protocolo permite aos usuários depositar tokens KALE como colateral e tomar empréstimos em USDC, implementando um sistema de empréstimos com garantias (lending protocol).

## 🚀 Características Principais

- **Sistema de Colaterais**: Deposite tokens KALE como garantia
- **Empréstimos em USDC**: Tome empréstimos baseados no valor do seu colateral
- **Health Factor**: Monitoramento automático da saúde da posição
- **LTV Configurável**: Loan-to-Value ratio ajustável pelo admin
- **Interface Web Moderna**: DApp React/Next.js com design responsivo
- **Contratos Seguros**: Implementados em Rust com Soroban SDK

## 🏗️ Arquitetura

### Smart Contracts (Rust + Soroban)

- **KaleFi**: Contrato principal do protocolo
- **Token Contracts**: Tokens KALE e USDC na rede Stellar
- **Sistema de Preços**: Oracle de preços para valoração de colaterais

### Frontend (Next.js + React)

- Interface web moderna e responsiva
- Integração com carteiras Stellar (Freighter)
- Visualização de posições e health factors
- Operações de depósito, empréstimo e reembolso

## 🛠️ Tecnologias

- **Blockchain**: Stellar
- **Smart Contracts**: Soroban (Rust)
- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Twin.macro
- **Web3**: Soroban React SDK
- **Build Tool**: Cargo, Make

## 📋 Pré-requisitos

- Rust 1.70+
- Node.js 18+
- Yarn ou npm
- Soroban CLI
- Carteira Stellar (Freighter)

## 🚀 Instalação e Configuração

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/kalefi.git
cd kalefi
```

### 2. Instale as dependências

```bash
# Dependências do frontend
yarn install

# Adicione o target Rust para WASM
rustup target add wasm32-unknown-unknown
```

### 3. Configure o ambiente

```bash
# Configure o Soroban CLI
soroban config network add --global testnet https://soroban-testnet.stellar.org
soroban config network add --global futurenet https://rpc-futurenet.stellar.org

# Configure as variáveis de ambiente
cp .env.example .env.local
# Edite .env.local com suas configurações
```

### 4. Compile os contratos

```bash
cd contracts
make
```

### 5. Execute o frontend

```bash
yarn dev
```

O DApp estará disponível em `http://localhost:3000`

## 📚 Uso do Protocolo

### 1. Conecte sua carteira

- Use Freighter ou outra carteira compatível com Stellar
- Certifique-se de ter tokens de teste na rede desejada

### 2. Deposite colateral

- Selecione a quantidade de tokens KALE para depositar
- Confirme a transação na sua carteira

### 3. Tome um empréstimo

- Verifique seu health factor atual
- Escolha a quantidade de USDC para emprestar
- Confirme a transação

### 4. Monitore sua posição

- Acompanhe seu health factor em tempo real
- Visualize o valor do colateral e dívida

## 🔒 Segurança

- Contratos auditados e testados extensivamente
- Implementação de health factors para prevenir liquidações
- Sistema de admin com controle de parâmetros críticos
- Testes automatizados para todas as funcionalidades

## 🧪 Testes

### Testes dos Contratos

```bash
cd contracts/kalefi
cargo test
```

### Testes do Frontend

```bash
yarn test
```

### Testes de Integração

```bash
cd contracts
yarn test:integration
```

## 📦 Deploy

### Testnet

```bash
cd contracts
./deploy_on_testnet.sh kalefi
```

### Mainnet

```bash
cd contracts
./deploy_on_mainnet.sh kalefi
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Padrões de Código

- Siga as convenções Rust para contratos
- Use TypeScript strict mode para o frontend
- Mantenha testes com cobertura >90%
- Documente todas as funções públicas

## 📄 Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 🆘 Suporte

- **Documentação**: [docs.kalefi.org](https://docs.kalefi.org)
- **Discord**: [discord.gg/kalefi](https://discord.gg/kalefi)
- **Telegram**: [t.me/kalefi](https://t.me/kalefi)
- **Email**: support@kalefi.org

## 🙏 Agradecimentos

- [Stellar Development Foundation](https://stellar.org)
- [Soroban Team](https://soroban.stellar.org)
- Comunidade open source

---

**⚠️ Disclaimer**: Este software é fornecido "como está" sem garantias. Use por sua conta e risco em ambientes de teste antes de usar em mainnet.
