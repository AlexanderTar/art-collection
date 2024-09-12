import { useAuth } from '../auth'

export const useConnectWallet = () => {
  const { login } = useAuth()

  return { connect: login }
}
