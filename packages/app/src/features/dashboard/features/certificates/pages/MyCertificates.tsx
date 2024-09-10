import { Loading, Typography } from '@/common/components'

import { useTranslation } from 'react-i18next'
import CertificateCard from '../components/CertificateCard'
import { ShrugIcon } from '@/assets/svg/ShrugIcon'
import { useOwnerCertificates } from '@/client/query/certificate'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/app/routes'

const MyCertificates = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: certificates, isLoading } = useOwnerCertificates()

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <aside className="w-fit justify-center space-y-4">
        <Typography variant="h3">{t('certificate:my.title')}</Typography>

        {isLoading && (
          <div className="h-72 w-full">
            <Loading />
          </div>
        )}

        {certificates && (
          <div className="container m-auto grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {certificates.map((certificate) => (
              <div
                className="w-fit rounded-md"
                key={certificate.tokenId}
                onClick={() =>
                  navigate({
                    pathname: APP_ROUTES.details.to(certificate.tokenId.toString()),
                  })
                }
              >
                <CertificateCard showBorder certificate={certificate} />
              </div>
            ))}
          </div>
        )}
        {!isLoading && (!certificates || certificates.length === 0) && (
          <ShrugIcon className="h-72 w-72 fill-muted-foreground" />
        )}
      </aside>
    </div>
  )
}

export default MyCertificates
