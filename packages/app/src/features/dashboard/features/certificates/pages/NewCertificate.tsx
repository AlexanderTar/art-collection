import { Form, Typography } from '@/common/components'
import { zodResolver } from '@hookform/resolvers/zod'

import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { NewCertificateFields, useNewCertificateValidation } from '../hooks/validations'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormExtraLabel,
  FormMessage,
} from '@/common/components/ui/form'
import { Input } from '@/common/components/ui/input'
import { useCallback, useState } from 'react'
import { Button } from '@/common/components/ui/button'
import { useShowError } from '@/common/hooks/useShowError'
import { useNavigate } from 'react-router-dom'
import { APP_ROUTES } from '@/app/routes'
import { useAddCertificate } from '@/client/mutation/certificate'
import { useAuth } from '@/common/auth'
import { useConnectWallet } from '@/common/wallet/connect'

const NewCertificate = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const showError = useShowError()

  const { isLoggedIn } = useAuth()
  const { connect } = useConnectWallet()

  const form = useForm<NewCertificateFields>({
    resolver: zodResolver(useNewCertificateValidation()),
  })

  const name = form.watch('name')

  const { mutate: addCertificate, isPending: isAddingCertificate } = useAddCertificate()

  const [previewImage, setPreviewImage] = useState<string>('')

  const handleImageChange = (fileList: FileList) => {
    if (fileList.length === 1) {
      setPreviewImage(URL.createObjectURL(fileList[0]!))
    }
  }

  const onSubmit = useCallback(
    async (values: NewCertificateFields) => {
      addCertificate(
        {
          name: values.name,
          artist: values.artist,
          year: values.year,
          image: values.image[0]!,
        },
        {
          onError: () => showError(t('certificate:new.error', { name: name })),
          onSuccess: (tokenId) => {
            navigate({
              pathname: APP_ROUTES.details.to(tokenId.toString()),
            })
          },
        },
      )
    },
    [addCertificate, name, navigate, showError, t],
  )

  return (
    <div className="flex h-full w-full flex-col items-center justify-center">
      <aside className="w-11/12 space-y-4 sm:w-11/12 md:w-9/12 lg:w-3/5 xl:w-2/5">
        <Typography variant="h3">{t('certificate:new.title')}</Typography>

        <Form form={form} onSubmit={onSubmit} id="new-certificate-form">
          {{
            formFields: (
              <>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('certificate:metadata.name.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('certificate:metadata.name.placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="artist"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('certificate:metadata.artist.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="text"
                          placeholder={t('certificate:metadata.artist.placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="year"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('certificate:metadata.year.label')}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={new Date().getFullYear()}
                          step={1}
                          placeholder={t('certificate:metadata.year.placeholder')}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { value, onChange, ...field } }) => (
                    <FormItem>
                      <FormLabel>{t('certificate:metadata.image.label')}</FormLabel>
                      <FormExtraLabel>{t('certificate:metadata.image.extra')}</FormExtraLabel>
                      <FormControl>
                        <>
                          <Input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(event) => {
                              if (event?.target?.files) {
                                handleImageChange(event?.target?.files)
                              }
                              onChange(event?.target?.files ?? '')
                            }}
                            className="pl-0"
                            {...field}
                          />
                          {previewImage && (
                            <div className="flex flex-col items-center">
                              <img
                                className="shadow-primary aspect-square h-32 w-32 rounded-lg object-cover shadow-lg"
                                src={previewImage}
                                alt={t('certificate:metadata.image.preview')}
                              />
                            </div>
                          )}
                        </>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ),
            footer: (
              <div className="space-y-4">
                {isLoggedIn && (
                  <Button
                    form="new-certificate-form"
                    type="submit"
                    loading={isAddingCertificate}
                    disabled={isAddingCertificate}
                    block
                  >
                    {isAddingCertificate
                      ? t('certificate:new.minting', { name: name })
                      : t('certificate:new.submit')}
                  </Button>
                )}
                {!isLoggedIn && (
                  <Button type="button" onClick={connect} block>
                    {t('wallet:connect')}
                  </Button>
                )}
              </div>
            ),
          }}
        </Form>
      </aside>
    </div>
  )
}

export default NewCertificate
