import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { useAuth } from '@/common/auth'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/common/components/ui/dropdown-menu'
import { Avatar } from '@/assets/svg/Avatar'
import { useMemo } from 'react'
import Typography from '../Typography'
import { truncateEthAddress } from '@/common/utils'
import { useDisconnect, useEnsAvatar, useEnsName } from 'wagmi'
import { mainnet } from 'wagmi/chains'

const WalletDropdown = () => {
  const { t } = useTranslation()
  const { user } = useAuth()
  const { disconnect } = useDisconnect()

  const { data: ensName } = useEnsName({
    address: user?.wallet?.address as `0x${string}`,
    chainId: mainnet.id,
  })
  const { data: ensAvatar } = useEnsAvatar({ name: ensName as string, chainId: mainnet.id })

  const userName = useMemo(() => {
    return user?.email?.address
      ? user?.email?.address
      : ensName
        ? ensName
        : user?.wallet?.address
          ? truncateEthAddress(user.wallet?.address)
          : ''
  }, [user, ensName])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex cursor-pointer items-center gap-2">
          <Typography variant="regularText" className="font-bold text-muted-foreground">
            {userName}
          </Typography>
          {ensAvatar ? (
            <img src={ensAvatar} alt="ENS Avatar" className="h-8 w-8 rounded-full" />
          ) : (
            <Avatar className="h-8 w-8 fill-secondary" />
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onSelect={() => {
            disconnect()
          }}
        >
          {t('wallet:disconnect')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const ConnectButton = () => {
  const { t } = useTranslation()
  const { isLoggedIn, login, ready, user } = useAuth()

  return (
    <div data-rk className="flex flex-row gap-2">
      {isLoggedIn && ready && user ? (
        <WalletDropdown />
      ) : (
        <Button onClick={login}>{t('wallet:connect')}</Button>
      )}
    </div>
  )
}

export default ConnectButton
