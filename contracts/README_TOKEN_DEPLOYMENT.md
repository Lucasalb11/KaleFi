# 🪙 KaleFi Token Deployment Guide

Este guia explica como fazer o deploy dos tokens KALE e USDC necessários para o protocolo KaleFi.

## 📋 Pré-requisitos

1. **Soroban CLI instalado e configurado**

   ```bash
   # Verificar instalação
   soroban --version

   # Verificar redes disponíveis
   soroban config network ls
   ```

2. **Contratos compilados**

   ```bash
   make build
   ```

3. **Conta admin configurada com XLM suficiente**
   - Para standalone: será feito airdrop automático
   - Para testnet/futurenet: precisa ter XLM na conta

## 🚀 Deploy dos Tokens

### Opção 1: Deploy Automático (Recomendado)

```bash
# Deploy para standalone (desenvolvimento local)
make deploy-tokens

# Deploy para rede específica
make deploy-tokens-network NETWORK=testnet
make deploy-tokens-network NETWORK=futurenet
```

### Opção 2: Deploy Manual

```bash
# Compilar primeiro
make build

# Copiar WASM dos tokens
cp kalefi/soroban-examples/token/target/wasm32-unknown-unknown/release/token.wasm .soroban/token.wasm

# Executar script de deploy
npx tsx scripts/deploy_tokens_only.ts standalone
npx tsx scripts/deploy_tokens_only.ts testnet
npx tsx scripts/deploy_tokens_only.ts futurenet
```

## 🔧 O que o Script Faz

1. **Verifica dependências**
   - Se os tokens já foram deployados
   - Se há XLM suficiente na conta admin
   - Se os contratos foram compilados

2. **Deploy dos Tokens**
   - Instala o contrato token
   - Deploy do KALE Token
   - Deploy do USDC Token

3. **Inicialização**
   - KALE: 7 decimais, "Kale Token", "KALE"
   - USDC: 6 decimais, "USD Coin", "USDC"

4. **Mint Inicial**
   - 1000 KALE tokens para admin
   - 10000 USDC tokens para admin

5. **Atualização do Address Book**
   - Salva os endereços dos tokens
   - Permite que outros contratos os encontrem

## 📊 Tokens Deployados

| Token | Símbolo | Decimais | Supply Inicial | Endereço     |
| ----- | ------- | -------- | -------------- | ------------ |
| KALE  | KALE    | 7        | 1000           | `kale_token` |
| USDC  | USDC    | 6        | 10000          | `usdc_token` |

## 🔍 Verificação do Deploy

### 1. Verificar Address Book

```bash
cat .soroban/standalone.contracts.json
```

### 2. Verificar Balanços

```bash
# Verificar balanço KALE
stellar contract invoke --network standalone --source admin --id <KALE_TOKEN_ID> -- balance --id <ADMIN_ADDRESS>

# Verificar balanço USDC
stellar contract invoke --network standalone --source admin --id <USDC_TOKEN_ID> -- balance --id <ADMIN_ADDRESS>
```

### 3. Verificar Metadados

```bash
# Verificar metadados KALE
stellar contract invoke --network standalone --source admin --id <KALE_TOKEN_ID> -- name
stellar contract invoke --network standalone --source admin --id <KALE_TOKEN_ID> -- symbol
stellar contract invoke --network standalone --source admin --id <KALE_TOKEN_ID> -- decimals

# Verificar metadados USDC
stellar contract invoke --network standalone --source admin --id <USDC_TOKEN_ID> -- name
stellar contract invoke --network standalone --source admin --id <USDC_TOKEN_ID> -- symbol
stellar contract invoke --network standalone --source admin --id <USDC_TOKEN_ID> -- decimals
```

## 🚨 Troubleshooting

### Erro: "Token WASM not found"

```bash
make build
```

### Erro: "Insufficient balance"

```bash
# Para standalone, o airdrop é automático
# Para outras redes, adicione XLM manualmente
```

### Erro: "Contract already exists"

```bash
# Os tokens já foram deployados
# Verifique o address book ou use make clean para redeploy
```

### Erro: "Network not found"

```bash
# Verificar redes disponíveis
soroban config network ls

# Adicionar rede se necessário
soroban config network add testnet --rpc-url https://soroban-testnet.stellar.org
```

## 📋 Próximos Passos

Após o deploy dos tokens:

1. **Deploy do Contrato KaleFi**

   ```bash
   make deploy-kalefi
   ```

2. **Deploy Completo**

   ```bash
   make deploy-all
   ```

3. **Testar Protocolo**
   ```bash
   make test
   ```

## 🔄 Redeploy

Para fazer redeploy dos tokens:

```bash
# Limpar tudo
make clean

# Recompilar
make build

# Redeploy
make deploy-tokens
```

## 📚 Comandos Úteis

```bash
# Ver status dos deploys
make status

# Ver ajuda
make help

# Limpar build artifacts
make clean

# Testar protocolo
make test
```

## 🆘 Suporte

Se encontrar problemas:

1. Verifique os logs de erro
2. Confirme se o Soroban está rodando
3. Verifique as configurações em `utils/env_config.ts`
4. Confirme se a conta admin tem permissões corretas

---

**Nota**: Os tokens devem ser deployados ANTES do contrato principal KaleFi, pois ele depende dos seus endereços para inicialização.
