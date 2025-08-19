import { Horizon } from '@stellar/stellar-sdk';
import { Contract, Address, xdr } from '@stellar/stellar-sdk';
import { AddressBook } from '../utils/address_book.js';
import { airdropAccount, deploySorobanToken, installContract } from '../utils/contract.js';
import { invoke } from '../utils/tx.js';
import { config } from '../utils/env_config.js';

export async function deployTokens(addressBook: AddressBook, network: string) {
  const loadedConfig = config(network);
  
  if (network !== "mainnet") {
    await airdropAccount(loadedConfig.admin);
  }

  let account = await loadedConfig.horizonRpc.loadAccount(loadedConfig.admin.publicKey());
  let balance = account.balances.filter((asset) => asset.asset_type === 'native')[0].balance;
  console.log('Current Admin account balance:', balance);
  
  console.log('-------------------------------------------------------');
  console.log('Deploying Tokens');
  console.log('-------------------------------------------------------');

  // Check if tokens are already deployed
  const existingKaleToken = addressBook.getContractId('kale_token');
  const existingUsdcToken = addressBook.getContractId('usdc_token');
  
  if (existingKaleToken && existingUsdcToken) {
    console.log('✅ Tokens already deployed:');
    console.log(`KALE Token: ${existingKaleToken}`);
    console.log(`USDC Token: ${existingUsdcToken}`);
    console.log('Skipping token deployment...\n');
    return { kaleTokenId: existingKaleToken, usdcTokenId: existingUsdcToken };
  }

  // Deploy KALE Token
  console.log('Deploying KALE Token...');
  await installContract('token', addressBook, loadedConfig.admin);
  const kaleTokenId = await deploySorobanToken('token', addressBook, loadedConfig.admin);
  console.log(`KALE Token deployed at: ${kaleTokenId}`);
  
  // Deploy USDC Token  
  console.log('Deploying USDC Token...');
  const usdcTokenId = await deploySorobanToken('token', addressBook, loadedConfig.admin);
  console.log(`USDC Token deployed at: ${usdcTokenId}`);

  // Initialize KALE Token
  console.log('Initializing KALE Token...');
  const kaleContract = new Contract(kaleTokenId);
  const kaleInitOp = kaleContract.call(
    "__constructor",
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    new xdr.ScVal.scvU32(7), // 7 decimals
    new xdr.ScVal.scvString("Kale Token"),
    new xdr.ScVal.scvString("KALE")
  );
  await invoke(kaleInitOp, loadedConfig.admin, false);
  console.log('KALE Token initialized');

  // Initialize USDC Token
  console.log('Initializing USDC Token...');
  const usdcContract = new Contract(usdcTokenId);
  const usdcInitOp = usdcContract.call(
    "__constructor", 
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    new xdr.ScVal.scvU32(6), // 6 decimals (standard USDC)
    new xdr.ScVal.scvString("USD Coin"),
    new xdr.ScVal.scvString("USDC")
  );
  await invoke(usdcInitOp, loadedConfig.admin, false);
  console.log('USDC Token initialized');

  // Mint some initial tokens for testing
  console.log('Minting initial tokens for testing...');
  
  // Mint 1000 KALE tokens (7 decimals)
  const kaleMintOp = kaleContract.call(
    "mint",
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    new xdr.ScVal.scvI128(new xdr.Int64Parts({ lo: 1000000000, hi: 0 })) // 1000 * 10^7
  );
  await invoke(kaleMintOp, loadedConfig.admin, false);
  console.log('Minted 1000 KALE tokens');

  // Mint 10000 USDC tokens (6 decimals)  
  const usdcMintOp = usdcContract.call(
    "mint",
    new Address(loadedConfig.admin.publicKey()).toScVal(),
    new xdr.ScVal.scvI128(new xdr.Int64Parts({ lo: 10000000000, hi: 0 })) // 10000 * 10^6
  );
  await invoke(usdcMintOp, loadedConfig.admin, false);
  console.log('Minted 10000 USDC tokens');

  // Update address book with token addresses
  addressBook.setContractId('kale_token', kaleTokenId);
  addressBook.setContractId('usdc_token', usdcTokenId);
  
  console.log('\n-------------------------------------------------------');
  console.log('Token Deployment Summary:');
  console.log('-------------------------------------------------------');
  console.log(`KALE Token: ${kaleTokenId}`);
  console.log(`USDC Token: ${usdcTokenId}`);
  console.log('-------------------------------------------------------\n');

  return { kaleTokenId, usdcTokenId };
}

// Main execution
const network = process.argv[2] || 'standalone';

try {
  const loadedConfig = config(network);
  const addressBook = AddressBook.loadFromFile(network, loadedConfig);
  
  await deployTokens(addressBook, network);
  addressBook.writeToFile();
  
  console.log('✅ Token deployment completed successfully!');
} catch (e) {
  console.error('❌ Token deployment failed:', e);
  process.exit(1);
}
