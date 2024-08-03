import { useCallback } from 'react'
import { useConnect } from 'wagmi'

export const useConnectWallet = () => {
  const { connectors, connect } = useConnect()
  const connectWallet = useCallback(() => {
    const coinbaseWalletConnector = connectors.find(
      (connector) => connector.id === 'coinbaseWalletSDK',
    )
    if (coinbaseWalletConnector) {
      connect({ connector: coinbaseWalletConnector })
    }
  }, [connectors, connect])
  return { connect: connectWallet }
}
