import React from 'react'
import { SorobanReactProvider } from '@soroban-react/core'
import { futurenet, sandbox, standalone, testnet } from '@soroban-react/chains'
import { freighter } from '@soroban-react/freighter'
import type { ChainMetadata, Connector } from '@soroban-react/types'

// Inline deployments configuration to avoid import issues on Railway
const deployments = [
  {
    network: 'standalone',
    networkPassphrase: 'Standalone Network ; February 2017',
    contractId: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    contractAddress: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    contracts: {
      kalefi: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    },
  },
  {
    network: 'testnet',
    networkPassphrase: 'Test SDF Network ; September 2015',
    contractId: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    contractAddress: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    contracts: {
      kalefi: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    },
  },
  {
    network: 'futurenet',
    networkPassphrase: 'Test SDF Future Network ; October 2022',
    contractId: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    contractAddress: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    contracts: {
      kalefi: 'CAPKM4UOBT7WDPOY3C6OLOOBTWRIZBYBHO4VVFCVM2YLJXVQRSU74NX6',
    },
  },
]

const chains: ChainMetadata[] = [sandbox, standalone, futurenet, testnet]
const connectors: Connector[] = [freighter()]

export default function MySorobanReactProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SorobanReactProvider
      chains={chains}
      appName={'Kalefi'}
      activeChain={standalone}
      connectors={connectors}
      deployments={deployments}
    >
      {children}
    </SorobanReactProvider>
  )
}
