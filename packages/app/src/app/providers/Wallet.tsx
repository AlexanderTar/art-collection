import { type ReactNode } from 'react'

import { addRpcUrlOverrideToChain, PrivyProvider } from '@privy-io/react-auth'
import { WagmiProvider } from '@privy-io/wagmi'

import {
  getDefaultConfig,
  RainbowKitProvider,
  darkTheme,
  cssStringFromTheme,
} from '@rainbow-me/rainbowkit'
import { coinbaseWallet } from '@rainbow-me/rainbowkit/wallets'
import { http } from 'wagmi'
import { base } from 'wagmi/chains'

interface Props {
  children: ReactNode
}

const WalletProvider = ({ children }: Props) => {
  const config = getDefaultConfig({
    appName: import.meta.env.VITE_APP_NAME,
    projectId: import.meta.env.VITE_WALLET_CONNECT_PROJECT_ID,
    chains: [base],
    transports: {
      [base.id]: http(import.meta.env.VITE_RPC_PROVIDER_URL),
    },
    wallets: [
      {
        groupName: 'Recommended',
        wallets: [coinbaseWallet],
      },
    ],
    ssr: import.meta.env.SSR,
  })

  const dark = darkTheme({
    accentColor: '#0050FF',
    accentColorForeground: '#f5f5f5',
    overlayBlur: 'none',
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

        supportedChains: [addRpcUrlOverrideToChain(base, import.meta.env.VITE_RPC_PROVIDER_URL)],
      }}
    >
      <WagmiProvider config={config}>
        <RainbowKitProvider modalSize="compact" locale="en" theme={null}>
          <style
            dangerouslySetInnerHTML={{
              __html: `
              :root {
                ${cssStringFromTheme({ ...dark, radii: { ...dark.radii, connectButton: '9999px', menuButton: '9999px' } })}
              }
            `,
            }}
          />
          {children}
        </RainbowKitProvider>
      </WagmiProvider>
    </PrivyProvider>
  )
}

export default WalletProvider
