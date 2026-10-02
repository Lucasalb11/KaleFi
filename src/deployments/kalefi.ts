/** Testnet deployment, created with `stellar contract deploy` (see README). */
export const KALEFI = {
  market: process.env.NEXT_PUBLIC_KALEFI_MARKET ?? 'CBIKYUEPWCSU5VDTJ5DYY23NZWWT3YUWGGSFHUFR3VNKEJLMGFUGA2IM',
  kaleToken: process.env.NEXT_PUBLIC_KALEFI_KALE ?? 'CDPAUV7SYMKFW6Q7B25JC7CN2LVKHKDWAIWVMVWSOMOL2XJMKHMA4BXB',
  usdcToken: process.env.NEXT_PUBLIC_KALEFI_USDC ?? 'CD7UTN5E6GTLYWIQ6I6ESIJMI6YMSMKA6VU6JPXKPYGG2TFCNJXXGOI2',
  /** Issuer of the demo KALE and USDC assets, and the market admin. */
  issuer: process.env.NEXT_PUBLIC_KALEFI_ISSUER ?? 'GBIXVBXCA3BOIW2ABRH52PIS3TJFKQNQHFAHCT2HVTH4JEVONNTKOMTK',
  networkPassphrase: 'Test SDF Network ; September 2015',
  rpcUrl: 'https://soroban-testnet.stellar.org',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  decimals: 7,
}

/** Shape kept for components that display contract addresses. */
export const KALEFI_CONTRACTS = {
  testnet: {
    kalefi: KALEFI.market,
    kaleToken: KALEFI.kaleToken,
    usdcToken: KALEFI.usdcToken,
    admin: KALEFI.issuer,
    networkPassphrase: KALEFI.networkPassphrase,
    rpcUrl: KALEFI.rpcUrl,
  },
}

export const getKalefiContract = (network: keyof typeof KALEFI_CONTRACTS) => KALEFI_CONTRACTS[network]

export const getCurrentNetwork = () => 'testnet' as const
