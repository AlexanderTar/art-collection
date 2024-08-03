import { useMemo } from 'react'
import { z } from 'zod'
import { useTranslation } from 'react-i18next'

const sizeInKB = (sizeInBytes: number, decimalsNum = 2) => {
  const result = sizeInBytes / 1024
  return +result.toFixed(decimalsNum)
}

export const useNewCertificateValidation = () => {
  const { t } = useTranslation()

  return useMemo(
    () =>
      z.object({
        name: z.string().min(1, {
          message: t('global:validations.name'),
        }),
        artist: z.string().min(1, {
          message: t('global:validations.artist'),
        }),
        year: z.coerce
          .number({ invalid_type_error: t('global:validations.required') })
          .min(1, {
            message: t('global:validations.year'),
          })
          .max(new Date().getFullYear(), {
            message: t('global:validations.year'),
          }),
        image: z
          .instanceof(FileList, { message: t('global:validations.image.invalid') })
          .refine((fileList) => fileList.length > 0, {
            message: t('global:validations.image.invalid'),
          })
          .refine((fileList) => sizeInKB(fileList[0]!.size) <= 1000, {
            message: t('global:validations.avatar.size', { maxSize: 1000 }),
          }),
      }),
    [t],
  )
}

export type NewCertificateFields = z.infer<ReturnType<typeof useNewCertificateValidation>>
