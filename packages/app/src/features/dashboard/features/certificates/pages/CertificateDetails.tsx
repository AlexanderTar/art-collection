import { Loading, Typography } from '@/common/components'
import { Modal, ModalContent, ModalHeader } from '@/common/components/ui/modal'
import { useCertificate } from '@/client/query/certificate'
import { APP_ROUTES, useCertificateDetailParams } from '@/app/routes'
import { useShowError } from '@/common/hooks/useShowError'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@/common/components/ui/button'
import { useRemoveCertificate } from '@/client/mutation/certificate'

const CertificateDetails = () => {
  const { t } = useTranslation()
  const { tokenId } = useCertificateDetailParams()
  const onError = useShowError()
  const navigate = useNavigate()

  const { data: certificate, isPending, isError, error } = useCertificate(tokenId)

  const { mutate: removeCertificate, isPending: isRemoving } = useRemoveCertificate()

  const handleRemoveCertificate = () => {
    removeCertificate(tokenId, {
      onError: () => {
        onError(t('certificate:burn.error'))
      },
      onSuccess: () => {
        navigate({
          pathname: APP_ROUTES.certificates.to,
        })
      },
    })
  }

  useEffect(() => {
    if (isError) {
      onError(error)
    }
  }, [error, isError, onError])

  return (
    <div className="inset-0 z-10 flex items-center justify-center overflow-y-auto">
      <Modal open={true} onOpenChange={() => navigate(-1)}>
        <ModalContent className="px-12">
          {isPending ? (
            <Loading />
          ) : (
            <>
              <ModalHeader className="flex items-center justify-center">
                <Typography variant="h2">{certificate?.name}</Typography>
              </ModalHeader>
              <div className="flex flex-col items-center gap-4">
                <div className="group relative flex w-full flex-row items-center">
                  <div className="flex flex-row gap-2">
                    <div className="flex flex-col gap-2">
                      <Typography variant="largeText" className={'text-secondary'}>
                        {t('certificate:metadata.artist.label')}
                      </Typography>
                      <Typography variant="largeText" className={'text-secondary'}>
                        {t('certificate:metadata.year.label')}
                      </Typography>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Typography variant="largeText">{certificate?.artist}</Typography>
                      <Typography variant="largeText">{certificate?.year}</Typography>
                    </div>
                  </div>
                  <div className="grow"></div>
                  <div className="flex h-32 w-32 items-center justify-center">
                    <img
                      className="aspect-square h-full w-full rounded-lg object-cover shadow-lg shadow-primary"
                      src={certificate?.image}
                      alt={certificate?.name}
                    />
                  </div>
                </div>
                <Button
                  className="w-fit bg-destructive"
                  loading={isRemoving}
                  disabled={isRemoving}
                  onClick={handleRemoveCertificate}
                  block
                >
                  {isRemoving
                    ? t('certificate:burn.burning', { name: certificate?.name })
                    : t('certificate:burn.submit')}
                </Button>
              </div>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default CertificateDetails
