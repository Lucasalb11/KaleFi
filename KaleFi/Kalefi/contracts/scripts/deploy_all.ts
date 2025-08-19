import { deployTokens } from './deploy_tokens.js';
import { deployKaleFi } from './deploy_kalefi.js';
import { AddressBook } from '../utils/address_book.js';
import { config } from '../utils/env_config.js';

export async function deployAll(network: string) {
  console.log('🚀 Starting complete KaleFi deployment...\n');
  
  const loadedConfig = config(network);
  const addressBook = AddressBook.loadFromFile(network, loadedConfig);
  
  try {
    // Step 1: Deploy Tokens
    console.log('📋 Step 1: Deploying Tokens');
    console.log('================================');
    const { kaleTokenId, usdcTokenId } = await deployTokens(addressBook, network);
    addressBook.writeToFile();
    console.log('✅ Tokens deployed successfully!\n');
    
    // Step 2: Deploy KaleFi Contract
    console.log('📋 Step 2: Deploying KaleFi Contract');
    console.log('=====================================');
    const { kalefiId } = await deployKaleFi(addressBook, network);
    addressBook.writeToFile();
    console.log('✅ KaleFi contract deployed successfully!\n');
    
    // Final Summary
    console.log('🎉 DEPLOYMENT COMPLETE! 🎉');
    console.log('============================');
    console.log(`Network: ${network}`);
    console.log(`KALE Token: ${kaleTokenId}`);
    console.log(`USDC Token: ${usdcTokenId}`);
    console.log(`KaleFi Contract: ${kalefiId}`);
    console.log('\n🔧 Configuration:');
    console.log('- LTV: 50% (5000 bps)');
    console.log('- Mock Oracle: Enabled');
    console.log('- Mock Price: $0.50');
    console.log('- Initial USDC in contract: 1000 USDC');
    console.log('\n🧪 Ready for testing!');
    
  } catch (error) {
    console.error('❌ Deployment failed:', error);
    throw error;
  }
}

const network = process.argv[2] || 'standalone';

try {
  await deployAll(network);
} catch (e) {
  console.error('❌ Complete deployment failed:', e);
  process.exit(1);
}
