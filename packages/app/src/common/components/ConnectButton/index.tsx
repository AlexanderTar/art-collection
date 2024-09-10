import { ConnectButton as RainbowConnectButton } from '@rainbow-me/rainbowkit'
import { useTranslation } from 'react-i18next'
import { Button } from '../ui/button'
import { useAuth } from '@/common/auth'

const ConnectButton = () => {
  const { t } = useTranslation()
  const { isLoggedIn, login } = useAuth()

  return (
    <div data-rk className="flex flex-row gap-2">
      {isLoggedIn ? (
        <RainbowConnectButton
          label={t('wallet:connect')}
          showBalance={false}
          accountStatus="avatar"
        />
      ) : (
        <Button onClick={login}>{t('wallet:connect')}</Button>
      )}
    </div>
  )
}

export default ConnectButton
