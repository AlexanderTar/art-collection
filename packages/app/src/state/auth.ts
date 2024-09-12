import { usePrivy, useLinkWithSiwe, useWallets } from '@privy-io/react-auth'
import { useEmbeddedSmartAccountConnector } from '@privy-io/wagmi'
import { toEcdsaKernelSmartAccount } from 'permissionless/accounts'
import { useCallback, useMemo } from 'react'
import { createPublicClient, EIP1193Provider, http } from 'viem'
import { createPaymasterClient, entryPoint06Address, SmartAccount } from 'viem/account-abstraction'
import { useAccount, useAccountEffect } from 'wagmi'
import { base } from 'wagmi/chains'
import { createSmartAccountClient } from 'permissionless'
import { SmartEIP1193Provider } from '@/common/wallet/SmartEIP1193Provider'
import { createPimlicoClient } from 'permissionless/clients/pimlico'

interface AuthState {
  isLoggedIn: boolean
  login: () => void
}

export const useAuthState = () => {
  const { login, logout } = usePrivy()
  const { generateSiweMessage, linkWithSiwe } = useLinkWithSiwe()
  const { wallets } = useWallets()
  const account = useAccount()

  const storeSmartAccount = useCallback(
    async (account: SmartAccount) => {
      try {
        const message = await generateSiweMessage({
          address: account.address,
          chainId: `eip155:${base.id}`,
        })
        const signature = await account.signMessage({
          message,
        })
        await linkWithSiwe({
          message,
          chainId: `eip155:${base.id}`,
          signature,
          walletClientType: 'smart_wallet',
          connectorType: 'zerodev',
        })
      } catch (error) {
        // ignore
      }
    },
    [generateSiweMessage, linkWithSiwe],
  )

  useEmbeddedSmartAccountConnector({
    getSmartAccountFromSigner: async ({ signer }: { signer: EIP1193Provider }) => {
      const client = createPublicClient({
        chain: base,
        transport: http(import.meta.env.VITE_RPC_PROVIDER_URL),
      })
      const account = await toEcdsaKernelSmartAccount({
        client,
        entryPoint: {
          address: entryPoint06Address,
          version: '0.6',
        },
        owners: [signer],
      })

      await storeSmartAccount(account)

      // a hack to fix the issue where the smart wallet appears as not connected
      localStorage.removeItem('wagmi.io.privy.smart_wallet.disconnected')

      const pimlicoClient = createPimlicoClient({
        transport: http(import.meta.env.VITE_BUNDLER_PROXY_URL),
        entryPoint: {
          address: entryPoint06Address,
          version: '0.6',
        },
      })

      const paymasterClient = createPaymasterClient({
        transport: http(import.meta.env.VITE_PAYMASTER_PROXY_URL),
      })

      const smartAccountClient = createSmartAccountClient({
        account,
        client,
        chain: base,
        bundlerTransport: http(import.meta.env.VITE_BUNDLER_PROXY_URL),
        paymaster: {
          getPaymasterData: async (params) => {
            const result = (await paymasterClient.getPaymasterData(params)) as {
              paymasterAndData: `0x${string}`
            }
            return {
              paymasterAndData: result.paymasterAndData,
            }
          },
          getPaymasterStubData: async (params) => {
            const result = (await paymasterClient.getPaymasterStubData(params)) as {
              paymasterAndData: `0x${string}`
            }
            return {
              paymasterAndData: result.paymasterAndData,
            }
          },
        },
        userOperation: {
          estimateFeesPerGas: async () => {
            return (await pimlicoClient.getUserOperationGasPrice()).fast
          },
        },
      })

      return new SmartEIP1193Provider(smartAccountClient) as EIP1193Provider
    },
  })

  useAccountEffect({
    onDisconnect: async () => {
      console.log('disconnecting')
      wallets[0]?.disconnect()
      await logout()
    },
  })

  return useMemo(
    () => [{ isLoggedIn: account?.address !== undefined, login } as AuthState] as const,
    [account, login],
  )
}
