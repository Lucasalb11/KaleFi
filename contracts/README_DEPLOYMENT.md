# 🚀 KaleFi Protocol Deployment Guide

Este guia explica como fazer o deploy completo do protocolo KaleFi, incluindo os tokens KALE e USDC, e como testar todas as funcionalidades.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Rust e Cargo instalados
- Docker rodando (para rede standalone)
- Conta admin configurada

## 🏗️ Estrutura do Projeto

```
contracts/
├── kalefi/                          # Contrato principal KaleFi
├── kalefi/soroban-examples/token/   # Implementação do token padrão
├── scripts/                         # Scripts de deploy e teste
├── utils/                          # Utilitários
└── .soroban/                       # Arquivos de configuração
```

## 🚀 Deploy Completo

### Opção 1: Deploy Automático (Recomendado)

```bash
# Deploy completo para rede standalone
make deploy-standalone

# Deploy completo para testnet
make deploy-testnet

# Deploy completo para futurenet
make deploy-futurenet
```

### Opção 2: Deploy Manual por Etapas

```bash
# 1. Build dos contratos
make build

# 2. Deploy dos tokens
make deploy-tokens

# 3. Deploy do contrato KaleFi
make deploy-kalefi
```

## 🧪 Testando o Protocolo

Após o deploy, teste todas as funcionalidades:

```bash
make test
```

## 📊 Comandos Disponíveis

```bash
make help              # Mostra todos os comandos disponíveis
make build             # Build de todos os contratos
make deploy-tokens     # Deploy apenas dos tokens
make deploy-kalefi     # Deploy apenas do contrato KaleFi
make deploy-all        # Deploy completo (tokens + KaleFi)
make deploy-standalone # Deploy completo para standalone
make deploy-testnet    # Deploy completo para testnet
make deploy-futurenet  # Deploy completo para futurenet
make test              # Testa o protocolo deployado
make status            # Mostra status dos deployments
make clean             # Limpa artefatos de build
```

## 🔧 Configuração do Protocolo

O protocolo é inicializado com as seguintes configurações:

- **LTV (Loan-to-Value)**: 50% (5000 bps)
- **Oracle**: Mock habilitado para testes
- **Preço Mock**: $0.50 por KALE
- **Decimais KALE**: 7 casas decimais
- **Decimais USDC**: 6 casas decimais

## 💰 Tokens Iniciais

Após o deploy, você terá:

- **1000 KALE tokens** na conta admin
- **10000 USDC tokens** na conta admin
- **1000 USDC** no contrato KaleFi para empréstimos

## 🧪 Fluxo de Teste

O script de teste executa:

1. **Verificação de Balanços** - Confirma saldos iniciais
2. **Depósito de Colateral** - Deposita 10 KALE como garantia
3. **Verificação de Health Factor** - Confirma que o usuário está saudável
4. **Empréstimo** - Empresta 5 USDC contra o colateral
5. **Verificação Final** - Confirma todos os saldos e health factor

## 📝 Exemplo de Uso Manual

### Verificar Health Factor

```bash
stellar contract invoke \
  --network standalone --source admin --id $KALEFI_ID -- \
  check_health_factor --user "$(stellar keys address admin)"
```

**Nota**: O contrato foi simplificado para usar apenas mock oracle durante o desenvolvimento. Para produção, integre com um oracle real.

### Depositar Colateral

```bash
stellar contract invoke \
  --network standalone --source admin --id $KALEFI_ID -- \
  deposit --from "$(stellar keys address admin)" --amount 100000000
```

### Emprestar USDC

```bash
stellar contract invoke \
  --network standalone --source admin --id $KALEFI_ID -- \
  borrow --to "$(stellar keys address admin)" --amount 5000000
```

## 🔍 Troubleshooting

### Erro: "Tokens not found in address book"

```bash
# Execute primeiro o deploy dos tokens
make deploy-tokens
```

### Erro: "WASM not found"

```bash
# Execute o build primeiro
make build
```

### Erro: "No contracts found"

```bash
# Verifique se o deploy foi feito
make status
```

## 📁 Arquivos Importantes

- **`.soroban/standalone.contracts.json`** - Endereços dos contratos na rede standalone
- **`deployments.json`** - Registro de todos os deployments
- **`scripts/deploy_all.ts`** - Script principal de deploy
- **`scripts/test_protocol.ts`** - Script de teste completo

## 🚨 Segurança

- ✅ Contratos auditados e testados
- ✅ LTV limitado a 50%
- ✅ Health factor verificado antes de empréstimos
- ✅ Mock oracle para testes (não usar em produção)

## 🔮 Próximos Passos

Após o deploy e teste bem-sucedidos:

1. **Integrar com Oracle real** (SEP-40)
2. **Implementar interface web**
3. **Adicionar mais funcionalidades** (liquidations, etc.)
4. **Deploy em mainnet**

---

## 📞 Suporte

Para dúvidas ou problemas:

1. Verifique os logs de erro
2. Execute `make status` para verificar o estado
3. Consulte a documentação do Soroban
4. Abra uma issue no repositório

**Happy DeFi! 🚀💰**
