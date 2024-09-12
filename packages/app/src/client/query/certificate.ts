import { useQuery } from '@tanstack/react-query'
import { readContract, readContracts } from '@wagmi/core'
import { useAccount, useConfig, usePublicClient } from 'wagmi'
import { artCertificateAbi } from '../abi/generated'
import { Certificate } from '../model/certificate'
import { useAuth } from '@/common/auth'

function parseCertificateData(tokenURI: string, tokenId: number): Certificate | undefined {
  if (!tokenURI.startsWith('data:application/json;base64,')) {
    throw new Error('Invalid tokenURI')
  }

  const base64Data = tokenURI.replace('data:application/json;base64,', '')
  const jsonString = atob(base64Data)
  const parsedData = JSON.parse(jsonString) as {
    name: string
    image: string
    attributes: { trait_type: string; value: string }[]
  }

  const artist = parsedData.attributes.find((attr) => attr.trait_type === 'Artist')?.value
  const year = parsedData.attributes.find((attr) => attr.trait_type === 'Year')?.value

  if (!artist || !year || isNaN(Number(year))) {
    throw new Error('Invalid certificate')
  }

  const cid = parsedData.image.startsWith('ipfs://')
    ? parsedData.image.slice(7) // Remove 'ipfs://' prefix
    : parsedData.image

  return {
    name: parsedData.name,
    artist,
    year: Number(year),
    image: `${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`,
    tokenId,
  }
}

export function useOwnerCertificates() {
  const account = useAccount()
  const client = usePublicClient()
  const config = useConfig()
  const { isLoggedIn } = useAuth()

  return useQuery({
    queryKey: ['ownerCertificates', { owner: account.address, isLoggedIn }],
    enabled: isLoggedIn,
    queryFn: async () => {
      if (!client || !account.address) return []

      const tokenIds = await readContract(config, {
        address: import.meta.env.VITE_ART_CERTIFICATE_ADDRESS,
        abi: artCertificateAbi,
        functionName: 'tokensOf',
        args: [account.address],
      })

      const requests = tokenIds.map((tokenId) => {
        return {
          address: import.meta.env.VITE_ART_CERTIFICATE_ADDRESS,
          abi: artCertificateAbi,
          functionName: 'tokenURI',
          args: [tokenId],
        }
      })

      const certificates = (await readContracts(config, {
        allowFailure: false,
        contracts: requests,
      })) as string[]

      const decodedCertificates = certificates
        .map((certificate, index) => {
          try {
            return parseCertificateData(certificate, Number(tokenIds[index]!))
          } catch (error) {
            console.error(error)
            return undefined
          }
        })
        .filter(Boolean)

      return decodedCertificates as Certificate[]
    },
  })
}

export function useCertificate(tokenId: number) {
  const config = useConfig()

  return useQuery({
    queryKey: ['certificate', { tokenId }],
    queryFn: async () => {
      if (!tokenId) return null

      const tokenURI = await readContract(config, {
        address: import.meta.env.VITE_ART_CERTIFICATE_ADDRESS,
        abi: artCertificateAbi,
        functionName: 'tokenURI',
        args: [BigInt(tokenId)],
      })

      return parseCertificateData(tokenURI, tokenId)
    },
  })
}
