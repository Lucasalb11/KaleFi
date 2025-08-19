import { Horizon } from '@stellar/stellar-sdk';
import { AddressBook } from '../utils/address_book.js';
import { airdropAccount, deployContract, installContract } from '../utils/contract.js';
import { config } from '../utils/env_config.js';
import { Contract, Address, xdr } from '@stellar/stellar-sdk';
import { invoke } from '../utils/tx.js';
import { scValToNative } from '@stellar/stellar-sdk';

export async function deployKaleFi(addressBook: AddressBook, network: string) {
  const loadedConfig = config(network);
  
  if (network !== "mainnet") {
    await airdropAccount(loadedConfig.admin);
  }

  let account = await loadedConfig.horizonRpc.loadAccount(loadedConfig.admin.publicKey());
  let balance = account.balances.filter((asset) => asset.asset_type === 'native')[0].balance;
  console.log('Current Admin account balance:', balance);
  
  console.log('-------------------------------------------------------');
  console.log('Deploying KaleFi Contract');
  console.log('-------------------------------------------------------');

  // Deploy KaleFi Contract
  console.log('Deploying KaleFi Contract...');
  await installContract('kalefi', addressBook, loadedConfig.admin);
  const kalefiId = await deployContract('kalefi', 'kalefi', addressBook, loadedConfig.admin);
  console.log(`KaleFi Contract deployed at: ${kalefiId}`);
  
  // Get token addresses from address book
  const kaleTokenId = addressBook.getContractId('kale_token');
  const usdcTokenId = addressBook.getContractId('usdc_token');
  
  if (!kaleTokenId || !usdcTokenId) {
    throw new Error('Tokens not found in address book. Deploy tokens first using deploy_tokens.ts');
  }
  
  console.log(`Using KALE Token: ${kaleTokenId}`);
  console.log(`Using USDC Token: ${usdcTokenId}`);

  // Initialize KaleFi Contract
  console.log('Initializing KaleFi Contract...');
  const kalefiContract = new Contract(kalefiId);
  
  // Init: admin, kale_token, usdc_token, ltv_bps=5000 (50%)
  const initOp = kalefiContract.call(
    "init",
    new Address(loadedConfig.admin.publicKey()).toScVal(), // admin
    new Address(kaleTokenId).toScVal(),                    // kale_token
    new Address(usdcTokenId).toScVal(),                    // usdc_token
    new xdr.ScVal.scvU32(5000)                            // ltv_bps = 5000 (50%)
  );
  
  await invoke(initOp, loadedConfig.admin, false);
  console.log('KaleFi Contract initialized');

  // Mock price já está configurado como 0.50 USD por padrão
  console.log('Mock price configured as 0.50 USD by default');

  // Transfer some USDC to the contract for testing
  console.log('Transferring USDC to KaleFi contract for testing...');
  const usdcContract = new Contract(usdcTokenId);
  const transferOp = usdcContract.call(
    "transfer",
    new Address(loadedConfig.admin.publicKey()).toScVal(), // from
    new Address(kalefiId).toScVal(),                      // to (KaleFi contract)
    new xdr.ScVal.scvI128(new xdr.Int64Parts({ lo: 1000000000, hi: 0 })) // 1000 USDC (6 decimals)
  );
  
  await invoke(transferOp, loadedConfig.admin, false);
  console.log('Transferred 1000 USDC to KaleFi contract');

  // Update address book with KaleFi contract address
  addressBook.setContractId('kalefi', kalefiId);
  
  console.log('\n-------------------------------------------------------');
  console.log('KaleFi Deployment Summary:');
  console.log('-------------------------------------------------------');
  console.log(`KaleFi Contract: ${kalefiId}`);
  console.log(`KALE Token: ${kaleTokenId}`);
  console.log(`USDC Token: ${usdcTokenId}`);
  console.log('LTV: 50% (5000 bps)');
  console.log('Mock Oracle: Enabled');
  console.log('Mock Price: $0.50');
  console.log('-------------------------------------------------------\n');

  return { kalefiId, kaleTokenId, usdcTokenId };
}

const network = process.argv[2] || 'standalone';

try {
  const loadedConfig = config(network);
  const addressBook = AddressBook.loadFromFile(network, loadedConfig);
  
  await deployKaleFi(addressBook, network);
  addressBook.writeToFile();
  
  console.log('✅ KaleFi deployment completed successfully!');
  console.log('\n🚀 Ready to test the protocol!');
  console.log('You can now:');
  console.log('1. Deposit KALE as collateral');
  console.log('2. Borrow USDC against your collateral');
  console.log('3. Check health factors');
} catch (e) {
  console.error('❌ KaleFi deployment failed:', e);
  process.exit(1);
}
