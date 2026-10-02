# 🤝 Guia de Contribuição

Obrigado por considerar contribuir para o KaleFi! Este documento fornece diretrizes para contribuições.

## 📋 Pré-requisitos

Antes de contribuir, certifique-se de ter:

- [Rust](https://rustup.rs/) 1.70+ instalado
- [Node.js](https://nodejs.org/) 18+ instalado
- [Yarn](https://yarnpkg.com/) ou npm instalado
- [Soroban CLI](https://soroban.stellar.org/docs/getting-started/setup) instalado
- Conhecimento básico de blockchain e DeFi

## 🚀 Primeiros Passos

1. **Fork o repositório**

   ```bash
   git clone https://github.com/seu-usuario/kalefi.git
   cd kalefi
   ```

2. **Configure o ambiente de desenvolvimento**

   ```bash
   # Instale dependências do frontend
   yarn install

   # Adicione o target Rust para WASM
   rustup target add wasm32-unknown-unknown

   # Configure o Soroban CLI
   soroban config network add --global testnet https://soroban-testnet.stellar.org
   ```

3. **Crie uma branch para sua feature**
   ```bash
   git checkout -b feature/nome-da-sua-feature
   ```

## 🏗️ Estrutura do Projeto

```
kalefi/
├── contracts/           # Smart contracts Rust/Soroban
│   ├── kalefi/         # Contrato principal do protocolo
│   ├── greeting/       # Contrato de exemplo
│   └── ...
├── src/                # Frontend Next.js/React
├── scripts/            # Scripts de deploy e teste
└── utils/              # Utilitários e configurações
```

## 📝 Padrões de Código

### Rust (Smart Contracts)

- Use `cargo fmt` para formatação
- Use `cargo clippy` para linting
- Siga as [convenções Rust](https://rust-lang.github.io/api-guidelines/)
- Documente todas as funções públicas com `///`
- Mantenha testes com cobertura >90%

### TypeScript/React (Frontend)

- Use `yarn lint` e `yarn lint:fix`
- Siga as [convenções TypeScript](https://www.typescriptlang.org/docs/handbook/intro.html)
- Use componentes funcionais com hooks
- Mantenha componentes pequenos e reutilizáveis

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

## 🔒 Segurança

- **NUNCA** commite chaves privadas ou secrets
- Teste todas as mudanças em testnet antes de mainnet
- Siga as [melhores práticas de segurança DeFi](https://consensys.net/diligence/secure-development-tools/)
- Reporte vulnerabilidades de segurança para security@kalefi.org

## 📦 Deploy e Testes

### Testnet

```bash
cd contracts
./deploy_on_testnet.sh kalefi
```

### Verificação Local

```bash
# Compile os contratos
make

# Execute o frontend
yarn dev

# Teste as funcionalidades
yarn test
```

## 🔄 Processo de Pull Request

1. **Prepare sua contribuição**
   - Certifique-se de que todos os testes passam
   - Atualize a documentação se necessário
   - Adicione testes para novas funcionalidades

2. **Crie o Pull Request**
   - Use um título descritivo
   - Descreva as mudanças em detalhes
   - Referencie issues relacionadas
   - Adicione screenshots se aplicável

3. **Review e Merge**
   - Responda aos comentários do review
   - Faça as mudanças solicitadas
   - Aguarde aprovação de pelo menos 2 mantenedores

## 📚 Documentação

- Mantenha o README.md atualizado
- Documente novas funcionalidades
- Adicione exemplos de uso
- Mantenha a documentação da API atualizada

## 🆘 Precisando de Ajuda?

- **Discord**: [discord.gg/kalefi](https://discord.gg/kalefi)
- **Telegram**: [t.me/kalefi](https://t.me/kalefi)
- **Issues**: Use o GitHub Issues para bugs e features
- **Discussões**: Use GitHub Discussions para perguntas gerais

## 🎯 Áreas para Contribuição

- **Smart Contracts**: Melhorias de segurança, otimizações de gas
- **Frontend**: Melhorias de UX/UI, novas funcionalidades
- **Testes**: Aumentar cobertura, testes de integração
- **Documentação**: Melhorar docs, adicionar exemplos
- **DevOps**: CI/CD, monitoramento, infraestrutura

## 🏆 Reconhecimento

Contribuições significativas serão reconhecidas:

- Menção no README.md
- Badge de contribuidor
- Acesso ao repositório (para contribuidores ativos)
- Participação em decisões do projeto

---

**Obrigado por contribuir para o futuro do DeFi no Stellar! 🌟**
