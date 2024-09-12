import { useMutation } from '@tanstack/react-query'
import { usePublicClient, useWalletClient } from 'wagmi'
import { artCertificateAbi } from '../abi/generated'
import { ContractFunctionParameters, parseEventLogs } from 'viem'
import { useCallback } from 'react'
import { base } from 'viem/chains'
import { useWallets } from '@privy-io/react-auth'
import { eip5792Actions } from 'viem/experimental'
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
  const { data: walletClient } = useWalletClient()
  const { wallets } = useWallets()
  const client = usePublicClient()

  const writeContract = useCallback(
    async (params: ContractFunctionParameters) => {
      if (!client || wallets.length === 0 || !walletClient) throw new Error('No active wallet')

      const wallet = wallets[0]!!

      if (wallet.walletClientType === 'coinbase_wallet') {
        const wallet = walletClient.extend(eip5792Actions())
        const capabilities = await wallet.getCapabilities()
        const capabilitiesForChain = capabilities[base.id]

        if (
          !capabilitiesForChain ||
          !capabilitiesForChain['paymasterService'] ||
          !capabilitiesForChain['paymasterService'].supported
        ) {
          return walletClient.writeContract(params)
        }

        const id = await wallet.sendCalls({
          account: wallet.account,
          calls: [
            {
              abi: params.abi,
              to: params.address,
              functionName: params.functionName,
              args: params.args,
            },
          ],
          capabilities: {
            paymasterService: {
              url: import.meta.env.VITE_PAYMASTER_PROXY_URL,
            },
          },
        })
        return poll<`0x${string}`>((async () => {
          const status = await wallet.getCallsStatus({
            id,
          })
          if (!status.receipts?.length) return undefined
          return status.receipts[0]?.transactionHash
        }) as () => Promise<`0x${string}`>)
      } else {
        return walletClient.writeContract(params)
      }
    },
    [client, walletClient, wallets],
  )

  return { writeContract }
}

export function useAddCertificate() {
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

      const tx = await writeContract({
        address: import.meta.env.VITE_ART_CERTIFICATE_ADDRESS,
        abi: artCertificateAbi,
        functionName: 'mint',
        args: [tokenURI],
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
  const { writeContract } = useWriteContract()

  return useMutation({
    mutationFn: async (tokenId: number) => {
      await writeContract({
        address: import.meta.env.VITE_ART_CERTIFICATE_ADDRESS,
        abi: artCertificateAbi,
        functionName: 'burn',
        args: [BigInt(tokenId)],
      })
    },
  })
}
