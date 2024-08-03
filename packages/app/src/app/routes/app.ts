import { generatePath, useParams } from 'react-router-dom'

export const APP_ROUTES = {
  index: {
    path: '*',
    to: '/',
    absPath: '/',
  },
  certificates: {
    path: 'certificates',
    to: '/certificates',
    absPath: '/certificates',
  },
  new: {
    path: 'certificates/create',
    to: '/certificates/create',
    absPath: '/certificates/create',
  },

  details: {
    path: '/certificates/:tokenId',
    to: (tokenId: string) => generatePath('/certificates/:tokenId', { tokenId }),
    absPath: '/certificates/:tokenId',
  },
} as const satisfies Record<
  string,
  {
    path: string
    to: string | ((...args: string[]) => string)
    absPath: string
  }
>

export const useCertificateDetailParams = () => {
  const { tokenId } = useParams<{ tokenId: string }>()
  if (!tokenId) {
    throw new Error('Missing tokenId parameter')
  }
  if (isNaN(Number(tokenId))) {
    throw new Error('Invalid tokenId parameter')
  }

  return { tokenId: Number(tokenId) }
}
