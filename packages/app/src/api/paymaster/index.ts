import { Address, createClient, Hex, http, decodeFunctionData } from 'viem'
import { base } from 'viem/chains'
import { ENTRYPOINT_ADDRESS_V06, UserOperation } from 'permissionless'
import { paymasterActionsEip7677 } from 'permissionless/experimental'
import { smartWalletAbi, artCertificateAbi } from '@/client/abi/generated'

import type { VercelRequest, VercelResponse } from '@vercel/node'

const willSponsor = async ({
  chainId,
  entrypoint,
  userOp,
}: {
  chainId: number
  entrypoint: string
  userOp: UserOperation<'v0.6'>
}) => {
  const env = process.env
  if (!env) return false

  // check chain id
  if (chainId !== base.id) return false

  // check entrypoint
  if (entrypoint.toLowerCase() !== ENTRYPOINT_ADDRESS_V06.toLowerCase()) return false

  try {
    // check that userOp.callData is making a call we want to sponsor
    const calldata = decodeFunctionData({
      abi: smartWalletAbi,
      data: userOp.callData,
    })

    let calls = [] as {
      target: Address
      value: bigint
      data: Hex
    }[]
    if (calldata.functionName === 'execute') {
      if (!calldata.args || calldata.args.length !== 3) return false
      calls = [
        {
          target: calldata.args[0] as Address,
          value: calldata.args[1] as bigint,
          data: calldata.args[2] as Hex,
        },
      ]
    } else if (calldata.functionName === 'executeBatch') {
      if (!calldata.args || calldata.args.length !== 1) return false
      calls = calldata.args[0] as {
        target: Address
        value: bigint
        data: Hex
      }[]
    }

    // disallow batch calls
    if (calls.length > 2) return false

    let callToCheckIndex = 0
    if (calls.length > 1) {
      // if there is more than one call, check if the first is a magic spend call
      if (
        calls[0]!!.target.toLowerCase() !== env['VITE_COINBASE_MAGIC_SPEND_ADDRESS']!!.toLowerCase()
      )
        return false
      callToCheckIndex = 1
    }

    if (
      calls[callToCheckIndex]!!.target.toLowerCase() ===
      env['VITE_ART_CERTIFICATE_ADDRESS']!!.toLowerCase()
    ) {
      const innerCalldata = decodeFunctionData({
        abi: artCertificateAbi,
        data: calls[callToCheckIndex]!!.data,
      })
      if (innerCalldata.functionName === 'mint' || innerCalldata.functionName === 'burn')
        return true
    }

    return false
  } catch (e) {
    console.error(`willSponsor check failed: ${e}`)
    return false
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const paymasterService = process.env['VITE_PAYMASTER_SERVICE_URL']!

  const paymasterClient = createClient({
    chain: base,
    transport: http(paymasterService),
  }).extend(paymasterActionsEip7677(ENTRYPOINT_ADDRESS_V06))

  const { method, params } = req.body as {
    method: string
    params: any[]
  }
  const [userOp, entrypoint, chainId] = params
  if (!willSponsor({ chainId: parseInt(chainId), entrypoint, userOp })) {
    return res.json({ error: 'Not a sponsorable operation' })
  }

  if (method === 'pm_getPaymasterStubData') {
    const result = await paymasterClient.getPaymasterStubData({
      userOperation: userOp,
    })

    return res.json({ result })
  } else if (method === 'pm_getPaymasterData') {
    const result = await paymasterClient.getPaymasterData({
      userOperation: userOp,
    })
    return res.json({ result })
  }
  return res.json({ error: 'Method not found' })
}
