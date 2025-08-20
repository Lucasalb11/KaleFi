export const env = {
  // Network configuration
  network: process.env.NEXT_PUBLIC_NETWORK ?? 'testnet',
  
  // Contract addresses
  kalefiContract: process.env.NEXT_PUBLIC_KALEFI_CONTRACT ?? 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
  kaleTokenContract: process.env.NEXT_PUBLIC_KALE_TOKEN_CONTRACT ?? 'CC627EWHGZZ3X4LFDRRUOMCOGUS6RPCLYJK24DKITA7H3KH7LMPEQ7EQ',
  usdcTokenContract: process.env.NEXT_PUBLIC_USDC_TOKEN_CONTRACT ?? 'CAADZAV7BPY6ADEUMO5QGFGXS22UQBBDBLLBDSZ3YBDQVCKODH6QQBE3',
  
  // RPC URLs
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL ?? 'https://soroban-testnet.stellar.org',
  
  // Network passphrase
  networkPassphrase: process.env.NEXT_PUBLIC_NETWORK_PASSPHRASE ?? 'Test SDF Network ; September 2015',
  
  // App configuration
  appName: 'KaleFi Lending Protocol',
  appVersion: '1.0.0',
  
  // Features
  features: {
    enableRealTimeUpdates: true,
    enableNotifications: true,
    enableAnalytics: false
  }
}
