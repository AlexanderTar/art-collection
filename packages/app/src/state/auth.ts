import { usePrivy, useWallets } from '@privy-io/react-auth'
import { useSetActiveWallet } from '@privy-io/wagmi'
import { useEffect, useMemo, useState } from 'react'
import { useAccountEffect } from 'wagmi'

interface AuthState {
  isLoggedIn: boolean
  login: () => void
}

export const useAuthState = () => {
  const { authenticated, login, logout, ready } = usePrivy()
  const { setActiveWallet } = useSetActiveWallet()
  const { wallets } = useWallets()
  const [isConnected, setIsConnected] = useState(false)

  useAccountEffect({
    onDisconnect: async () => {
      wallets[0]?.disconnect()
      await logout()
      setIsConnected(false)
    },
  })

  useEffect(() => {
    if (wallets.length > 0) {
      const wallet = wallets[0]!!
      wallet.isConnected().then((isConnected) => {
        if (!isConnected) {
          setActiveWallet(wallet)
        }
        setIsConnected(isConnected)
      })
    }
  }, [wallets, setActiveWallet])

  return useMemo(
    () => [{ isLoggedIn: authenticated && ready && isConnected, login } as AuthState] as const,
    [authenticated, isConnected, login, ready],
  )
}
