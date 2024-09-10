import { useCallback } from 'react'
import { useConnect } from 'wagmi'

export const useConnectWallet = () => {
  const { connectors, connect } = useConnect()
  const connectWallet = useCallback(() => {
    const privyWalletConnector = connectors.find((connector) => connector.type === 'privy')
    if (privyWalletConnector) {
      connect({ connector: privyWalletConnector })
    }
  }, [connectors, connect])
  return { connect: connectWallet }
}
