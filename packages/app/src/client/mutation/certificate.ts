import { useMutation } from '@tanstack/react-query'
import { useCapabilities } from 'wagmi/experimental'
import { getCallsStatus, writeContracts } from '@wagmi/core/experimental'
import { Config, useAccount, useConfig, usePublicClient } from 'wagmi'
import { artCertificateAbi } from '../abi/generated'
import { ContractFunctionParameters, parseEventLogs } from 'viem'
import { useCallback, useMemo } from 'react'
import { poll } from '@ethersproject/web'

interface AddCertificateParams {
  name: string
  artist: string
  year: number
  image: File
}

interface PinataResponse {
  IpfsHash: string
}

async function pinImageToIPFS(image: File) {
  const formData = new FormData()
  formData.append('file', image)

  const options = JSON.stringify({
    cidVersion: 0,
  })
  formData.append('pinataOptions', options)

  const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
    },
    body: formData,
  })
  const data = (await response.json()) as PinataResponse
  return data.IpfsHash
}

function useWriteContract() {
  const account = useAccount()
  const { data: availableCapabilities } = useCapabilities({
    account: account.address,
  })

  const capabilities = useMemo(() => {
    if (!availableCapabilities || !account.chainId) return {}
    const capabilitiesForChain = availableCapabilities[account.chainId]
    if (
      capabilitiesForChain &&
      capabilitiesForChain['paymasterService'] &&
      capabilitiesForChain['paymasterService'].supported
    ) {
      return {
        paymasterService: {
          url: import.meta.env.VITE_PAYMASTER_PROXY_URL,
        },
      }
    }
    return {}
  }, [availableCapabilities, account])

  const writeContract = useCallback(
    async (config: Config, params: { contracts: ContractFunctionParameters[] }) => {
      const id = await writeContracts(config, {
        contracts: params.contracts,
        capabilities,
      })
      return await poll<`0x${string}`>((async () => {
        const status = await getCallsStatus(config, {
          id,
        })
        if (!status.receipts?.length) return undefined
        return status.receipts[0]?.transactionHash
      }) as () => Promise<`0x${string}`>)
    },
    [capabilities],
  )

  return { writeContract }
}

export function useAddCertificate() {
  const config = useConfig()
  const client = usePublicClient()
  const { writeContract } = useWriteContract()

  return useMutation({
    mutationFn: async ({ name, artist, year, image }: AddCertificateParams) => {
      if (!client) throw new Error('No client')

      const cid = await pinImageToIPFS(image)
      const imageUrl = `ipfs://${cid}`

      const metadata = {
        name,
        description: name,
        image: imageUrl,
        attributes: [
          { trait_type: 'Artist', value: artist },
          { trait_type: 'Year', value: year.toString() },
        ],
      }

      const jsonMetadata = JSON.stringify(metadata)
      const base64Metadata = btoa(jsonMetadata)
      const tokenURI = `data:application/json;base64,${base64Metadata}`

      const tx = await writeContract(config, {
        contracts: [
          {
            address: import.meta.env.VITE_ART_CERTIFICATE_ADDRESS,
            abi: artCertificateAbi,
            functionName: 'mint',
            args: [tokenURI],
          },
        ],
      })

      const receipt = await client.waitForTransactionReceipt({ hash: tx })

      const logs = parseEventLogs({
        abi: artCertificateAbi,
        eventName: 'CertificateMinted',
        logs: receipt.logs,
      })

      const event = logs[0]!.args as {
        tokenId: bigint
        owner: `0x${string}`
        tokenUri: string
      }

      return Number(event.tokenId)
    },
  })
}

export const useRemoveCertificate = () => {
  const config = useConfig()
  const client = usePublicClient()
  const { writeContract } = useWriteContract()

  return useMutation({
    mutationFn: async (tokenId: number) => {
      if (!client) throw new Error('No client')

      await writeContract(config, {
        contracts: [
          {
            address: import.meta.env.VITE_ART_CERTIFICATE_ADDRESS,
            abi: artCertificateAbi,
            functionName: 'burn',
            args: [BigInt(tokenId)],
          },
        ],
      })
    },
  })
}
