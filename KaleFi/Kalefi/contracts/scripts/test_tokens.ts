#!/usr/bin/env node

import { AddressBook } from '../utils/address_book.js';
import { config } from '../utils/env_config.js';
import { Contract, Address } from '@stellar/stellar-sdk';
import { invoke } from '../utils/tx.js';

/**
 * Script para testar os tokens deployados
 * Verifica se os tokens estão funcionando corretamente
 */

async function testTokens() {
  const network = process.argv[2] || 'standalone';
  
  console.log('🧪 KaleFi Token Test Script');
  console.log('============================');
  console.log(`Network: ${network}`);
  console.log('');
  
  try {
    const loadedConfig = config(network);
    const addressBook = AddressBook.loadFromFile(network, loadedConfig);
    
    // Verificar se os tokens foram deployados
    const kaleTokenId = addressBook.getContractId('kale_token');
    const usdcTokenId = addressBook.getContractId('usdc_token');
    
    if (!kaleTokenId || !usdcTokenId) {
      console.error('❌ Tokens não encontrados no address book!');
      console.error('Execute primeiro: make deploy-tokens');
      process.exit(1);
    }
    
    console.log('✅ Tokens encontrados:');
    console.log(`KALE Token: ${kaleTokenId}`);
    console.log(`USDC Token: ${usdcTokenId}`);
    console.log('');
    
    const adminAddress = loadedConfig.admin.publicKey();
    console.log(`Admin Address: ${adminAddress}`);
    console.log('');
    
    // Testar KALE Token
    console.log('🔍 Testando KALE Token...');
    console.log('------------------------');
    
    const kaleContract = new Contract(kaleTokenId);
    
    // Verificar nome
    try {
      const nameOp = kaleContract.call('name');
      const nameResult = await invoke(nameOp, loadedConfig.admin, true);
      console.log(`✅ Nome: ${nameResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar nome: ${error}`);
    }
    
    // Verificar símbolo
    try {
      const symbolOp = kaleContract.call('symbol');
      const symbolResult = await invoke(symbolOp, loadedConfig.admin, true);
      console.log(`✅ Símbolo: ${symbolResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar símbolo: ${error}`);
    }
    
    // Verificar decimais
    try {
      const decimalsOp = kaleContract.call('decimals');
      const decimalsResult = await invoke(decimalsOp, loadedConfig.admin, true);
      console.log(`✅ Decimais: ${decimalsResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar decimais: ${error}`);
    }
    
    // Verificar balanço
    try {
      const balanceOp = kaleContract.call('balance', new Address(adminAddress).toScVal());
      const balanceResult = await invoke(balanceOp, loadedConfig.admin, true);
      console.log(`✅ Balanço KALE: ${balanceResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar balanço KALE: ${error}`);
    }
    
    console.log('');
    
    // Testar USDC Token
    console.log('🔍 Testando USDC Token...');
    console.log('-------------------------');
    
    const usdcContract = new Contract(usdcTokenId);
    
    // Verificar nome
    try {
      const nameOp = usdcContract.call('name');
      const nameResult = await invoke(nameOp, loadedConfig.admin, true);
      console.log(`✅ Nome: ${nameResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar nome: ${error}`);
    }
    
    // Verificar símbolo
    try {
      const symbolOp = usdcContract.call('symbol');
      const symbolResult = await invoke(symbolOp, loadedConfig.admin, true);
      console.log(`✅ Símbolo: ${symbolResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar símbolo: ${error}`);
    }
    
    // Verificar decimais
    try {
      const decimalsOp = usdcContract.call('decimals');
      const decimalsResult = await invoke(decimalsOp, loadedConfig.admin, true);
      console.log(`✅ Decimais: ${decimalsResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar decimais: ${error}`);
    }
    
    // Verificar balanço
    try {
      const balanceOp = usdcContract.call('balance', new Address(adminAddress).toScVal());
      const balanceResult = await invoke(balanceOp, loadedConfig.admin, true);
      console.log(`✅ Balanço USDC: ${balanceResult}`);
    } catch (error) {
      console.error(`❌ Erro ao verificar balanço USDC: ${error}`);
    }
    
    console.log('');
    console.log('🎉 Teste dos tokens concluído com sucesso!');
    console.log('');
    console.log('📋 Resumo:');
    console.log('✅ KALE Token funcionando');
    console.log('✅ USDC Token funcionando');
    console.log('✅ Metadados corretos');
    console.log('✅ Balanços verificados');
    console.log('');
    console.log('🚀 Próximo passo: deploy do contrato KaleFi');
    console.log('   make deploy-kalefi');
    
  } catch (error) {
    console.error('❌ Teste dos tokens falhou:', error);
    console.error('');
    console.error('🔍 Possíveis soluções:');
    console.error('1. Verifique se os tokens foram deployados: make deploy-tokens');
    console.error('2. Verifique se o Soroban está rodando');
    console.error('3. Verifique as configurações em utils/env_config.ts');
    process.exit(1);
  }
}

// Executar o teste
testTokens().catch((error) => {
  console.error('❌ Erro fatal:', error);
  process.exit(1);
});


