#!/usr/bin/env node

import { deployTokens } from './deploy_tokens.js'
import { AddressBook } from '../utils/address_book.js'
import { config } from '../utils/env_config.js'

/**
 * Script para deploy apenas dos tokens KALE e USDC
 * Útil quando você quer deployar apenas os tokens sem o contrato principal
 */

async function main() {
  const network = process.argv[2] || 'standalone'

  console.log('🚀 KaleFi Token Deployment Script')
  console.log('==================================')
  console.log(`Network: ${network}`)
  console.log('')

  try {
    const loadedConfig = config(network)
    const addressBook = AddressBook.loadFromFile(network, loadedConfig)

    // Verificar se os tokens já foram deployados
    const existingKaleToken = addressBook.getContractId('kale_token')
    const existingUsdcToken = addressBook.getContractId('usdc_token')

    if (existingKaleToken && existingUsdcToken) {
      console.log('✅ Tokens já foram deployados:')
      console.log(`KALE Token: ${existingKaleToken}`)
      console.log(`USDC Token: ${existingUsdcToken}`)
      console.log('')
      console.log(
        '💡 Para fazer redeploy, remova os endereços do address book ou use:'
      )
      console.log('   make clean && make deploy-tokens')
      console.log('')
      return
    }

    // Deploy dos tokens
    console.log('📋 Iniciando deploy dos tokens...')
    const { kaleTokenId, usdcTokenId } = await deployTokens(
      addressBook,
      network
    )

    // Salvar no address book
    addressBook.writeToFile()

    console.log('')
    console.log('🎉 Token deployment concluído com sucesso!')
    console.log('==========================================')
    console.log(`Network: ${network}`)
    console.log(`KALE Token: ${kaleTokenId}`)
    console.log(`USDC Token: ${usdcTokenId}`)
    console.log('')
    console.log('📋 Próximos passos:')
    console.log('1. ✅ Tokens deployados e inicializados')
    console.log('2. ✅ Tokens mintados para admin (1000 KALE, 10000 USDC)')
    console.log('3. 🔄 Agora você pode:')
    console.log('   - Deployar o contrato KaleFi: make deploy-kalefi')
    console.log('   - Ou fazer deploy completo: make deploy-all')
    console.log('')
    console.log('🧪 Para testar os tokens:')
    console.log('   make test')
  } catch (error) {
    console.error('❌ Token deployment falhou:', error)
    console.error('')
    console.error('🔍 Possíveis soluções:')
    console.error(
      '1. Verifique se o Soroban está rodando: soroban config network ls'
    )
    console.error('2. Verifique se a conta admin tem XLM suficiente')
    console.error('3. Verifique se os contratos foram compilados: make build')
    console.error('4. Verifique as configurações em utils/env_config.ts')
    process.exit(1)
  }
}

// Executar o script
main().catch((error) => {
  console.error('❌ Erro fatal:', error)
  process.exit(1)
})
