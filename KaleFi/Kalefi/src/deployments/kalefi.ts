export const KALEFI_CONTRACTS = {
  testnet: {
    kalefi: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    kaleToken: 'CC627EWHGZZ3X4LFDRRUOMCOGUS6RPCLYJK24DKITA7H3KH7LMPEQ7EQ',
    usdcToken: 'CAADZAV7BPY6ADEUMO5QGFGXS22UQBBDBLLBDSZ3YBDQVCKODH6QQBE3',
    admin: 'GASEA27XCNQYJFCGB3TMLNJKX4PKIRWF65GGEZTOMUBFMAYFFBLXHLMB',
    networkPassphrase: 'Test SDF Network ; September 2015',
    rpcUrl: 'https://soroban-testnet.stellar.org',
  },
}

export const getKalefiContract = (network: keyof typeof KALEFI_CONTRACTS) => {
  return KALEFI_CONTRACTS[network]
}

export const getCurrentNetwork = () => {
  // For now, hardcoded to testnet
  return 'testnet' as const
}
