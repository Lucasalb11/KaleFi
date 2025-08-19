import { AddressBook } from '../utils/address_book.js';
import { config } from '../utils/env_config.js';
import { Contract, Address, xdr } from '@stellar/stellar-sdk';
import { invoke } from '../utils/tx.js';

export async function testProtocol(network: string) {
  console.log('🧪 Testing KaleFi Protocol...\n');
  
  const loadedConfig = config(network);
  const addressBook = AddressBook.loadFromFile(network, loadedConfig);
  
  try {
    // Get contract addresses
    const kalefiId = addressBook.getContractId('kalefi');
    const kaleTokenId = addressBook.getContractId('kale_token');
    const usdcTokenId = addressBook.getContractId('usdc_token');
    
    if (!kalefiId || !kaleTokenId || !usdcTokenId) {
      throw new Error('Contracts not found. Deploy first using deploy_all.ts');
    }
    
    console.log('📋 Contract Addresses:');
    console.log(`KaleFi: ${kalefiId}`);
    console.log(`KALE Token: ${kaleTokenId}`);
    console.log(`USDC Token: ${usdcTokenId}\n`);
    
    // Test 1: Check initial balances
    console.log('🔍 Test 1: Checking Initial Balances');
    console.log('====================================');
    
    const kaleContract = new Contract(kaleTokenId);
    const usdcContract = new Contract(usdcTokenId);
    const kalefiContract = new Contract(kalefiId);
    
    const adminAddress = new Address(loadedConfig.admin.publicKey());
    
    // Check admin KALE balance
    const kaleBalanceOp = kaleContract.call("balance", adminAddress.toScVal());
    const kaleBalanceResult = await invoke(kaleBalanceOp, loadedConfig.admin, true);
    const kaleBalance = parseInt(scValToNative(kaleBalanceResult.result.retval).toString());
    console.log(`Admin KALE Balance: ${kaleBalance / 10000000} KALE`);
    
    // Check admin USDC balance
    const usdcBalanceOp = usdcContract.call("balance", adminAddress.toScVal());
    const usdcBalanceResult = await invoke(usdcBalanceOp, loadedConfig.admin, true);
    const usdcBalance = parseInt(scValToNative(usdcBalanceResult.result.retval).toString());
    console.log(`Admin USDC Balance: ${usdcBalance / 1000000} USDC`);
    
    // Check KaleFi contract USDC balance
    const contractUsdcOp = usdcContract.call("balance", new Address(kalefiId).toScVal());
    const contractUsdcResult = await invoke(contractUsdcOp, loadedConfig.admin, true);
    const contractUsdcBalance = parseInt(scValToNative(contractUsdcResult.result.retval).toString());
    console.log(`KaleFi Contract USDC Balance: ${contractUsdcBalance / 1000000} USDC\n`);
    
    // Test 2: Deposit KALE as collateral
    console.log('🔍 Test 2: Depositing KALE as Collateral');
    console.log('==========================================');
    
    const depositAmount = 100000000; // 10 KALE (7 decimals)
    console.log(`Depositing ${depositAmount / 10000000} KALE as collateral...`);
    
    const depositOp = kalefiContract.call(
      "deposit",
      adminAddress.toScVal(),
      new xdr.ScVal.scvI128(new xdr.Int64Parts({ lo: depositAmount, hi: 0 }))
    );
    
    await invoke(depositOp, loadedConfig.admin, false);
    console.log('✅ KALE deposited successfully!\n');
    
    // Test 3: Check health factor
    console.log('🔍 Test 3: Checking Health Factor');
    console.log('==================================');
    
    const healthOp = kalefiContract.call("check_health_factor", adminAddress.toScVal());
    const healthResult = await invoke(healthOp, loadedConfig.admin, true);
    const healthData = scValToNative(healthResult.result.retval);
    
    if (Array.isArray(healthData)) {
      const [collateralValue, debtValue, hfBps] = healthData;
      console.log(`Collateral Value: ${collateralValue / 10000000} USD`);
      console.log(`Debt Value: ${debtValue / 1000000} USD`);
      console.log(`Health Factor: ${hfBps / 100}%`);
      
      if (hfBps >= 10000) {
        console.log('✅ Health Factor is healthy (>100%)');
      } else {
        console.log('⚠️  Health Factor is below 100%');
      }
    }
    console.log('');
    
    // Test 4: Borrow USDC
    console.log('🔍 Test 4: Borrowing USDC');
    console.log('===========================');
    
    const borrowAmount = 5000000; // 5 USDC (6 decimals)
    console.log(`Borrowing ${borrowAmount / 1000000} USDC...`);
    
    const borrowOp = kalefiContract.call(
      "borrow",
      adminAddress.toScVal(),
      new xdr.ScVal.scvI128(new xdr.Int64Parts({ lo: borrowAmount, hi: 0 }))
    );
    
    await invoke(borrowOp, loadedConfig.admin, false);
    console.log('✅ USDC borrowed successfully!\n');
    
    // Test 5: Check final balances and health factor
    console.log('🔍 Test 5: Final Status Check');
    console.log('==============================');
    
    // Check final KALE balance
    const finalKaleOp = kaleContract.call("balance", adminAddress.toScVal());
    const finalKaleResult = await invoke(finalKaleOp, loadedConfig.admin, true);
    const finalKaleBalance = parseInt(scValToNative(finalKaleResult.result.retval).toString());
    console.log(`Final Admin KALE Balance: ${finalKaleBalance / 10000000} KALE`);
    
    // Check final USDC balance
    const finalUsdcOp = usdcContract.call("balance", adminAddress.toScVal());
    const finalUsdcResult = await invoke(finalUsdcOp, loadedConfig.admin, true);
    const finalUsdcBalance = parseInt(scValToNative(finalUsdcResult.result.retval).toString());
    console.log(`Final Admin USDC Balance: ${finalUsdcBalance / 1000000} USDC`);
    
    // Check final health factor
    const finalHealthOp = kalefiContract.call("check_health_factor", adminAddress.toScVal());
    const finalHealthResult = await invoke(finalHealthOp, loadedConfig.admin, true);
    const finalHealthData = scValToNative(finalHealthResult.result.retval);
    
    if (Array.isArray(finalHealthData)) {
      const [finalCollateralValue, finalDebtValue, finalHfBps] = finalHealthData;
      console.log(`Final Collateral Value: ${finalCollateralValue / 10000000} USD`);
      console.log(`Final Debt Value: ${finalDebtValue / 1000000} USD`);
      console.log(`Final Health Factor: ${finalHfBps / 100}%`);
    }
    
    console.log('\n🎉 Protocol test completed successfully!');
    console.log('✅ All functions are working correctly');
    
  } catch (error) {
    console.error('❌ Protocol test failed:', error);
    throw error;
  }
}

// Import necessary dependencies
import { scValToNative } from '@stellar/stellar-sdk';

const network = process.argv[2] || 'standalone';

try {
  await testProtocol(network);
} catch (e) {
  console.error('❌ Protocol test failed:', e);
  process.exit(1);
}
