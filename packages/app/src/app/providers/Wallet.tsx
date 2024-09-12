import { type ReactNode } from 'react'

import { addRpcUrlOverrideToChain, PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider, createConfig } from '@privy-io/wagmi'

import { http } from 'wagmi'
import { base, mainnet } from 'wagmi/chains'

interface Props {
  children: ReactNode
}

const WalletProvider = ({ children }: Props) => {
  const config = createConfig({
    chains: [base, mainnet],
    transports: {
      [base.id]: http(import.meta.env.VITE_BUNDLER_PROXY_URL),
      [mainnet.id]: http(),
    },
  })

  return (
    <PrivyProvider
      appId={import.meta.env.VITE_PRIVY_APP_ID}
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#0051FF',
        },
        externalWallets: {
          coinbaseWallet: {
            connectionOptions: 'all',
          },
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },

        supportedChains: [addRpcUrlOverrideToChain(base, import.meta.env.VITE_BUNDLER_PROXY_URL)],
        defaultChain: addRpcUrlOverrideToChain(base, import.meta.env.VITE_BUNDLER_PROXY_URL),
      }}
    >
      <WagmiProvider config={config}>{children}</WagmiProvider>
    </PrivyProvider>
  )
}

export default WalletProvider
