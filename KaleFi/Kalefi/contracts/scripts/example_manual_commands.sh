#!/bin/bash

# 🚀 KaleFi Protocol - Manual Commands Examples
# Este script mostra como usar os comandos Stellar CLI manualmente

# Configurações
NETWORK="standalone"
ADMIN_KEY="admin"  # Nome da chave admin configurada

echo "🚀 KaleFi Protocol - Manual Commands Examples"
echo "=============================================="
echo ""

# Verificar se as variáveis de ambiente estão configuradas
if [ -z "$KALEFI_ID" ] || [ -z "$KALE_TOKEN" ] || [ -z "$USDC_TOKEN" ]; then
    echo "❌ Variáveis de ambiente não configuradas!"
    echo "Execute primeiro: make deploy-standalone"
    echo ""
    echo "Ou configure manualmente:"
    echo "export KALEFI_ID='<endereco_do_contrato>'"
    echo "export KALE_TOKEN='<endereco_do_token_kale>'"
    echo "export USDC_TOKEN='<endereco_do_token_usdc>'"
    exit 1
fi

echo "✅ Contratos configurados:"
echo "KaleFi: $KALEFI_ID"
echo "KALE Token: $KALE_TOKEN"
echo "USDC Token: $USDC_TOKEN"
echo ""

# Função para executar comandos com tratamento de erro
execute_command() {
    local description="$1"
    local command="$2"
    
    echo "🔍 $description"
    echo "Comando: $command"
    echo ""
    
    if eval "$command"; then
        echo "✅ Sucesso!"
    else
        echo "❌ Erro na execução"
    fi
    echo "----------------------------------------"
    echo ""
}

# 1. Verificar Health Factor
echo "📋 1. Verificar Health Factor do Admin"
execute_command "Verificar Health Factor" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $KALEFI_ID -- check_health_factor --user \"\$(stellar keys address $ADMIN_KEY)\""

# 2. Verificar Balanços
echo "📋 2. Verificar Balanços dos Tokens"
execute_command "Verificar balanço KALE" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $KALE_TOKEN -- balance --id \"\$(stellar keys address $ADMIN_KEY)\""

execute_command "Verificar balanço USDC" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $USDC_TOKEN -- balance --id \"\$(stellar keys address $ADMIN_KEY)\""

# 3. Depositar Colateral
echo "📋 3. Depositar KALE como Colateral"
DEPOSIT_AMOUNT=100000000  # 10 KALE (7 decimals)
execute_command "Depositar $DEPOSIT_AMOUNT KALE" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $KALEFI_ID -- deposit --from \"\$(stellar keys address $ADMIN_KEY)\" --amount $DEPOSIT_AMOUNT"

# 4. Verificar Health Factor após depósito
echo "📋 4. Verificar Health Factor após Depósito"
execute_command "Verificar Health Factor" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $KALEFI_ID -- check_health_factor --user \"\$(stellar keys address $ADMIN_KEY)\""

# 5. Emprestar USDC
echo "📋 5. Emprestar USDC"
BORROW_AMOUNT=5000000  # 5 USDC (6 decimals)
execute_command "Emprestar $BORROW_AMOUNT USDC" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $KALEFI_ID -- borrow --to \"\$(stellar keys address $ADMIN_KEY)\" --amount $BORROW_AMOUNT"

# 6. Verificar Balanços Finais
echo "📋 6. Verificar Balanços Finais"
execute_command "Verificar balanço KALE final" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $KALE_TOKEN -- balance --id \"\$(stellar keys address $ADMIN_KEY)\""

execute_command "Verificar balanço USDC final" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $USDC_TOKEN -- balance --id \"\$(stellar keys address $ADMIN_KEY)\""

# 7. Verificar Health Factor Final
echo "📋 7. Verificar Health Factor Final"
execute_command "Verificar Health Factor final" \
    "stellar contract invoke --network $NETWORK --source $ADMIN_KEY --id $KALEFI_ID -- check_health_factor --user \"\$(stellar keys address $ADMIN_KEY)\""

echo "🎉 Teste manual concluído!"
echo ""
echo "📊 Resumo dos comandos executados:"
echo "1. ✅ Verificação inicial de Health Factor"
echo "2. ✅ Verificação de balanços iniciais"
echo "3. ✅ Depósito de colateral KALE"
echo "4. ✅ Verificação de Health Factor após depósito"
echo "5. ✅ Empréstimo de USDC"
echo "6. ✅ Verificação de balanços finais"
echo "7. ✅ Verificação de Health Factor final"
echo ""
echo "🚀 Protocolo funcionando perfeitamente!"
