import React, { useState } from 'react'
import { isConnected, getPublicKey } from '@stellar/freighter-api'

export const FreighterConnectButton: React.FC = () => {
  const [publicKey, setPublicKey] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connectWallet = async () => {
    setError(null)
    try {
      const connected = await isConnected()
      const pubKey = connected ? await getPublicKey() : await getPublicKey()
      setPublicKey(pubKey)
    } catch (err: unknown) {
      let errorMsg = 'Erro ao conectar carteira.'
      if (err && typeof err === 'object' && 'message' in err) {
        errorMsg += ' ' + String((err as { message?: string }).message)
      } else if (typeof err === 'string') {
        errorMsg += ' ' + err
      }
      setError(errorMsg)
    }
  }

  return (
    <div style={{ marginTop: 16, marginBottom: 16 }}>
      <button
        onClick={connectWallet}
        style={{
          padding: '8px 16px',
          borderRadius: 6,
          background: '#2e3138',
          color: '#fff',
          border: 'none',
          cursor: 'pointer',
        }}
      >
        {publicKey
          ? 'Carteira conectada!'
          : 'Conectar carteira Stellar (Freighter)'}
      </button>
      {publicKey && (
        <div style={{ marginTop: 8, wordBreak: 'break-all', color: '#2e3138' }}>
          <strong>Endereço:</strong> {publicKey}
        </div>
      )}
      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
    </div>
  )
}
